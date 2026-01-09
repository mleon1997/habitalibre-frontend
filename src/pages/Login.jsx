// src/pages/Login.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import * as customerApi from "../lib/customerApi.js";

const LS_PENDING_JOURNEY = "hl_pending_journey";

function isEmail(v) {
  const s = String(v || "").trim().toLowerCase();
  return s.includes("@") && s.includes(".");
}
function cleanPhone(v) {
  return String(v || "").replace(/[^\d]/g, "");
}
function isValidEcPhone(v) {
  const p = cleanPhone(v);
  return p.length === 10 && p.startsWith("09");
}
function niceErr(err) {
  const msg =
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.data?.error ||
    err?.data?.message ||
    err?.message ||
    "Ocurrió un error. Intenta de nuevo.";
  return String(msg);
}
async function callApi(fnNames = [], payload) {
  for (const name of fnNames) {
    const fn = customerApi?.[name];
    if (typeof fn === "function") return await fn(payload);
  }
  throw new Error(`customerApi no tiene ninguna función: ${fnNames.join(", ")}`);
}

function pickUserFromResponse(data) {
  return data?.user || data?.customer || data?.data?.user || data?.data?.customer || null;
}
function pickTokenFromResponse(data) {
  return data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken || null;
}
function pickUserId(u) {
  return u?.id || u?._id || null;
}

function readPendingJourney() {
  try {
    const raw = localStorage.getItem(LS_PENDING_JOURNEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // esperado: { entrada, resultado, status, ts }
    if (!parsed?.entrada || !parsed?.resultado) return null;
    return parsed;
  } catch {
    return null;
  }
}
function clearPendingJourney() {
  try {
    localStorage.removeItem(LS_PENDING_JOURNEY);
  } catch {}
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useCustomerAuth();

  const returnTo = useMemo(() => {
    const st = location?.state;
    return st?.returnTo || "/progreso";
  }, [location?.state]);

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");

  const title = mode === "login" ? "Inicia sesión" : "Crea tu cuenta";
  const subtitle =
    "El simulador es gratis sin cuenta. El Journey requiere cuenta para guardar tu progreso y darte tu plan paso a paso.";

  const setSession = (token, user) => {
    if (typeof auth?.login === "function") {
      auth.login({ token, user });
      return;
    }
    if (typeof auth?.setToken === "function") auth.setToken(token);
    if (typeof auth?.setCustomer === "function") auth.setCustomer(user);
  };

  // ✅ después de login/signup: si hay un journey pendiente, lo sube
  // ✅ IMPORTANTE: recibe tokenOverride para no depender del timing de localStorage
  async function syncPendingJourneyIfAny(tokenOverride) {
    const pending = readPendingJourney();
    if (!pending) return { synced: false };

    try {
      await customerApi.saveJourney(
        {
          entrada: pending.entrada,
          resultado: pending.resultado,
          status: pending.status || "precalificado",
        },
        tokenOverride // ✅ override
      );

      clearPendingJourney();
      return { synced: true };
    } catch (e) {
      // No rompas el login por esto. Deja el pending para reintento luego.
      console.warn("[Login] No se pudo sincronizar pending journey:", e);
      return { synced: false, error: e };
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailNorm = String(email || "").trim().toLowerCase();

    if (!isEmail(emailNorm)) return setError("Ingresa un email válido.");
    if (!password || String(password).trim().length < 6)
      return setError("La contraseña debe tener mínimo 6 caracteres.");

    if (mode === "signup") {
      if (!String(nombre || "").trim()) return setError("Tu nombre es obligatorio.");
      if (!String(apellido || "").trim()) return setError("Tu apellido es obligatorio.");
      if (!isValidEcPhone(telefono))
        return setError("Tu teléfono es obligatorio (formato: 09XXXXXXXX).");
    }

    try {
      setLoading(true);

      let data;
      if (mode === "login") {
        data = await callApi(["loginCustomer", "login"], {
          email: emailNorm,
          password: String(password),
        });
      } else {
        data = await callApi(["registerCustomer", "register"], {
          email: emailNorm,
          password: String(password),
          nombre: String(nombre || "").trim(),
          apellido: String(apellido || "").trim(),
          telefono: cleanPhone(telefono),
        });
      }

      const token = pickTokenFromResponse(data);
      const user = pickUserFromResponse(data);
      const userId = pickUserId(user);

      if (!token || !userId) {
        console.error("[Login] Respuesta inesperada:", data);
        throw new Error("Respuesta inválida del servidor (sin token/usuario).");
      }

      const normalizedUser = { ...user, id: userId };

      // 1) set session
      setSession(token, normalizedUser);

      // 2) sync pending journey (si existe) usando token override ✅
      await syncPendingJourneyIfAny(token);

      // 3) go
      navigate(returnTo, { replace: true });
    } catch (err) {
      const msg = niceErr(err);

      if (/ya tiene cuenta/i.test(msg) || String(err?.response?.status) === "409") {
        setMode("login");
        setError("Este email ya tiene cuenta. Inicia sesión.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/40 shadow-[0_24px_80px_rgba(15,23,42,0.9)] p-6 md:p-8">
        <div className="text-[11px] tracking-[0.18em] text-emerald-300/80">
          CUSTOMER JOURNEY
        </div>

        <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-300">{subtitle}</p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-2">
          <button
            type="button"
            onClick={() => {
              setError("");
              setMode("login");
            }}
            className={[
              "py-2.5 rounded-xl text-sm font-semibold transition",
              mode === "login"
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-900/40 text-slate-200 hover:text-white",
            ].join(" ")}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            onClick={() => {
              setError("");
              setMode("signup");
            }}
            className={[
              "py-2.5 rounded-xl text-sm font-semibold transition",
              mode === "signup"
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-900/40 text-slate-200 hover:text-white",
            ].join(" ")}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-[12px] text-slate-300 mb-2">Nombre</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Juan"
                  className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label className="block text-[12px] text-slate-300 mb-2">Apellido</label>
                <input
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Pérez"
                  className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
                  autoComplete="family-name"
                />
              </div>

              <div>
                <label className="block text-[12px] text-slate-300 mb-2">
                  Teléfono (obligatorio)
                </label>
                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="09XXXXXXXX"
                  className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
                  inputMode="numeric"
                  autoComplete="tel"
                />
                <div className="mt-1 text-[11px] text-slate-500">
                  Formato recomendado: 09XXXXXXXX
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[12px] text-slate-300 mb-2">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-[12px] text-slate-300 mb-2">Contraseña</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            <div className="mt-1 text-[11px] text-slate-500">Mínimo 6 caracteres.</div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={[
              "w-full mt-2 rounded-2xl py-3.5 font-semibold transition",
              loading
                ? "bg-emerald-500/60 text-slate-950 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
            ].join(" ")}
          >
            {loading ? "Procesando…" : mode === "login" ? "Entrar al Journey" : "Crear cuenta y entrar"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/simular")}
            className="w-full rounded-2xl py-3.5 font-semibold bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800 text-slate-200 transition"
          >
            Volver al simulador
          </button>

          <div className="pt-2 text-center text-[11px] text-slate-500">
            Al continuar aceptas los Términos y la Política de Privacidad.
          </div>
        </form>
      </div>
    </div>
  );
}
