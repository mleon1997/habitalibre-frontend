// src/pages/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { trackEvent, trackPageView } from "../lib/analytics";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import * as customerApi from "../lib/customerApi.js";

function isEmail(v) {
  const s = String(v || "").trim().toLowerCase();
  return s.includes("@") && s.includes(".");
}

function cleanPhone(v) {
  return String(v || "").replace(/[^\d]/g, "");
}

function isValidEcMobile(v) {
  const d = cleanPhone(v);
  if (d.startsWith("593")) return d.length === 12 && d.slice(3, 4) === "9";
  return d.length === 10 && d.startsWith("09");
}

function getQS(location) {
  const sp = new URLSearchParams(location.search || "");
  return {
    intent: (sp.get("intent") || "login").toLowerCase(),
    returnTo: sp.get("returnTo") || "/progreso",
  };
}

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const qs = useMemo(() => getQS(location), [location.search]);

  const { token, setToken } = useCustomerAuth();

  // UI state
  const [mode, setMode] = useState(qs.intent === "register" ? "register" : "login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Fields
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");

  // Legal checkbox (solo register)
  const [acepta, setAcepta] = useState(true);

  // Diagnóstico
  const [lastAction, setLastAction] = useState("");

  const dbg = (...args) => {
    // eslint-disable-next-line no-console
    console.log("[LOGIN]", ...args);
  };

  useEffect(() => {
    trackPageView("customer_login");
    if (token) {
      try {
        nav(qs.returnTo || "/progreso");
      } catch {
        nav("/progreso");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMode(qs.intent === "register" ? "register" : "login");
  }, [qs.intent]);

  const subtitle = useMemo(() => {
    const rt = String(qs.returnTo || "");
    if (rt.includes("journey")) {
      return "Guarda tu plan y retoma tu camino a la vivienda propia cuando quieras.";
    }
    return "Accede a tu progreso y a tu checklist personalizado.";
  }, [qs.returnTo]);

  const canLogin = useMemo(() => {
    if (!isEmail(email)) return false;
    if (String(password || "").length < 6) return false;
    return true;
  }, [email, password]);

  const canRegister = useMemo(() => {
    if (String(nombre || "").trim().length < 2) return false;
    if (String(apellido || "").trim().length < 2) return false;
    if (!isEmail(email)) return false;
    if (!isValidEcMobile(telefono)) return false;
    if (String(password || "").length < 6) return false;
    if (!acepta) return false;
    return true;
  }, [nombre, apellido, email, telefono, password, acepta]);

  const goReturn = () => {
    const target = qs.returnTo || "/progreso";
    try {
      nav(target);
    } catch {
      window.location.hash = "#/progreso";
    }
  };

  const onSubmitLogin = async (e) => {
    e.preventDefault();
    setError("");

    dbg("✅ submit fired");
    setLastAction("✅ submit fired");

    // Autofill-safe: lee valores reales del form
    const form = e.currentTarget;
    const emailDom = form?.elements?.email?.value ?? "";
    const passDom = form?.elements?.password?.value ?? "";

    const finalEmail = String(email || emailDom).trim().toLowerCase();
    const finalPass = String(password || passDom);

    dbg("payload", { finalEmail, passLen: String(finalPass || "").length });

    const ok = isEmail(finalEmail) && String(finalPass || "").length >= 6;
    if (!ok) {
      setError("Revisa tu email y tu contraseña.");
      return;
    }

    setBusy(true);
    try {
      trackEvent("customer_login_submit", { returnTo: qs.returnTo });

      dbg("➡️ calling customerApi.loginCustomer");
      setLastAction("➡️ calling customerApi.loginCustomer");

      const resp = await customerApi.loginCustomer({
        email: finalEmail,
        password: String(finalPass),
      });

      dbg("⬅️ response", resp);
      setLastAction("⬅️ response received");

      if (!resp?.token) {
        throw new Error(resp?.message || "No se pudo iniciar sesión (sin token).");
      }

      setToken(resp.token);
      trackEvent("customer_login_success", {});
      goReturn();
    } catch (err) {
      dbg("❌ login error", err);
      trackEvent("customer_login_error", { message: String(err?.message || err) });
      setError(err?.message || "Error iniciando sesión. Intenta de nuevo.");
      setLastAction("❌ login error");
    } finally {
      setBusy(false);
    }
  };

  const onSubmitRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (String(nombre || "").trim().length < 2) {
      setError("Por favor ingresa tu nombre.");
      return;
    }
    if (String(apellido || "").trim().length < 2) {
      setError("Por favor ingresa tu apellido.");
      return;
    }
    if (!isEmail(email)) {
      setError("Revisa tu email.");
      return;
    }
    if (!isValidEcMobile(telefono)) {
      setError("Revisa tu teléfono (ej: 09XXXXXXXX o +5939XXXXXXXX).");
      return;
    }
    if (String(password || "").length < 6) {
      setError("Tu contraseña debe tener mínimo 6 caracteres.");
      return;
    }
    if (!acepta) {
      setError("Debes aceptar los términos para crear tu cuenta.");
      return;
    }

    setBusy(true);
    try {
      trackEvent("customer_register_submit", { returnTo: qs.returnTo });

      const payload = {
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        email: String(email).trim().toLowerCase(),
        telefono: cleanPhone(telefono),
        password: String(password),
        aceptaTerminos: true,
      };

      const resp = await customerApi.registerCustomer(payload);

      if (!resp?.token) {
        throw new Error(resp?.message || "No se pudo crear la cuenta.");
      }

      setToken(resp.token);
      trackEvent("customer_register_success", {});
      goReturn();
    } catch (err) {
      dbg("❌ register error", err);
      trackEvent("customer_register_error", { message: String(err?.message || err) });
      setError(
        err?.message ||
          "No se pudo crear tu cuenta. Si ya tienes cuenta, inicia sesión."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center">
        {/* LEFT */}
        <section className="hidden md:block">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 shadow-[0_30px_80px_rgba(15,23,42,0.95)]">
            <div className="text-[11px] tracking-[0.2em] uppercase text-slate-400 mb-3">
              HabitaLibre · Cuenta
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
              Guarda tu plan y avanza más rápido
            </h1>
            <p className="mt-3 text-sm text-slate-300 max-w-md">{subtitle}</p>

            <div className="mt-6 grid gap-3 text-sm">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="font-semibold text-slate-50">✓ Checklist personalizada</p>
                <p className="text-slate-400 text-[12px] mt-1">
                  Documentos según tu tipo de ingreso (empleado / independiente / mixto).
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="font-semibold text-slate-50">✓ Tu progreso guardado</p>
                <p className="text-slate-400 text-[12px] mt-1">
                  Retoma donde te quedaste, sin volver a empezar.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="font-semibold text-slate-50">✓ Asesoría sin costo</p>
                <p className="text-slate-400 text-[12px] mt-1">
                  Si quieres, te acompañamos a ordenar tu caso para el banco.
                </p>
              </div>
            </div>

            <p className="mt-6 text-[11px] text-slate-500">
              Datos cifrados · sin consultas al buró · sin spam
            </p>
          </div>
        </section>

        {/* RIGHT */}
        <section className="w-full">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:p-7 shadow-[0_30px_80px_rgba(15,23,42,0.95)]">
            <div className="mb-5">
              <div className="text-[11px] tracking-[0.2em] uppercase text-slate-400">
                {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {mode === "login" ? "Bienvenido de vuelta" : "Guarda tu plan"}
              </h2>
              <p className="mt-2 text-sm text-slate-400 md:hidden">{subtitle}</p>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  trackEvent("customer_login_tab", {});
                }}
                className={[
                  "rounded-2xl px-4 py-2 text-sm font-semibold border transition",
                  mode === "login"
                    ? "bg-emerald-400 text-slate-950 border-emerald-300"
                    : "bg-slate-950/30 text-slate-200 border-slate-700 hover:border-slate-500",
                ].join(" ")}
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  trackEvent("customer_register_tab", {});
                }}
                className={[
                  "rounded-2xl px-4 py-2 text-sm font-semibold border transition",
                  mode === "register"
                    ? "bg-emerald-400 text-slate-950 border-emerald-300"
                    : "bg-slate-950/30 text-slate-200 border-slate-700 hover:border-slate-500",
                ].join(" ")}
              >
                Crear cuenta
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-[12px] text-rose-200">
                {error}
              </div>
            )}

            {/* Diagnóstico visible */}
            {lastAction && (
              <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-[12px] text-slate-300">
                <span className="text-slate-400">Debug:</span> {lastAction}
              </div>
            )}

            {mode === "login" ? (
              <form
                id="loginForm"
                onSubmit={onSubmitLogin}
                onSubmitCapture={() => {
                  dbg("🟦 onSubmitCapture fired");
                  setLastAction("🟦 onSubmitCapture fired");
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[12px] text-slate-300 mb-1">Email</label>
                  <input
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onInput={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-2xl bg-slate-950/40 border border-slate-700 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400"
                    placeholder="tuemail@correo.com"
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-slate-300 mb-1">
                    Contraseña
                  </label>
                  <input
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onInput={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    className="w-full rounded-2xl bg-slate-950/40 border border-slate-700 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  onClick={() => {
                    dbg("🟩 button click fired");
                    setLastAction("🟩 button click fired");
                    // Si el click se dispara, pero el submit no: hay algo raro con el form
                    setTimeout(() => {
                      // si no cambió a submit fired, te avisamos
                      setLastAction((prev) =>
                        prev.includes("submit fired")
                          ? prev
                          : "⚠️ Click llegó, pero submit no se disparó (revisar form/DOM)"
                      );
                    }, 150);
                  }}
                  className={[
                    "w-full rounded-2xl py-3 text-sm font-semibold transition",
                    busy
                      ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                      : "bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-[0_16px_40px_rgba(16,185,129,0.45)]",
                  ].join(" ")}
                >
                  {busy ? "Entrando..." : "Entrar y continuar"}
                </button>

                {!busy && !canLogin && (
                  <p className="text-[11px] text-slate-500">
                    Tip: revisa tu email y contraseña (mínimo 6 caracteres).
                  </p>
                )}

                <div className="flex items-center justify-between text-[12px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent("customer_forgot_password_click", {});
                      nav("/forgot-password");
                    }}
                    className="hover:text-slate-200 underline underline-offset-4"
                  >
                    Olvidé mi contraseña
                  </button>

                  <button
                    type="button"
                    onClick={() => nav("/")}
                    className="hover:text-slate-200 underline underline-offset-4"
                  >
                    Volver al inicio
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={onSubmitRegister} className="space-y-4">
                <div>
                  <label className="block text-[12px] text-slate-300 mb-1">Nombre</label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    type="text"
                    autoComplete="given-name"
                    className="w-full rounded-2xl bg-slate-950/40 border border-slate-700 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-slate-300 mb-1">Apellido</label>
                  <input
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    type="text"
                    autoComplete="family-name"
                    className="w-full rounded-2xl bg-slate-950/40 border border-slate-700 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400"
                    placeholder="Tu apellido"
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-slate-300 mb-1">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-2xl bg-slate-950/40 border border-slate-700 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400"
                    placeholder="tuemail@correo.com"
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-slate-300 mb-1">Teléfono</label>
                  <input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    inputMode="tel"
                    className="w-full rounded-2xl bg-slate-950/40 border border-slate-700 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400"
                    placeholder="09xxxxxxxx o +5939xxxxxxxx"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Usamos tu teléfono solo para contactarte si tú lo pides.
                  </p>
                </div>

                <div>
                  <label className="block text-[12px] text-slate-300 mb-1">Contraseña</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    className="w-full rounded-2xl bg-slate-950/40 border border-slate-700 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400"
                    placeholder="mínimo 6 caracteres"
                  />
                </div>

                <label className="flex items-start gap-2 text-[12px] text-slate-400">
                  <input
                    type="checkbox"
                    checked={acepta}
                    onChange={(e) => setAcepta(e.target.checked)}
                    className="mt-1 accent-emerald-400"
                  />
                  <span>Acepto términos y política de privacidad (sin spam).</span>
                </label>

                <button
                  type="submit"
                  disabled={busy || !canRegister}
                  className={[
                    "w-full rounded-2xl py-3 text-sm font-semibold transition",
                    busy || !canRegister
                      ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                      : "bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-[0_16px_40px_rgba(16,185,129,0.45)]",
                  ].join(" ")}
                >
                  {busy ? "Creando cuenta..." : "Guardar y continuar"}
                </button>

                <div className="flex items-center justify-between text-[12px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => nav("/")}
                    className="hover:text-slate-200 underline underline-offset-4"
                  >
                    Volver al inicio
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="hover:text-slate-200 underline underline-offset-4"
                  >
                    Ya tengo cuenta
                  </button>
                </div>
              </form>
            )}

            <p className="mt-5 text-center text-[11px] text-slate-500">
              Datos cifrados · sin consultas al buró · puedes borrar tu cuenta cuando quieras
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
