// src/pages/Login.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { trackEvent, trackPageView } from "../lib/analytics";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import * as customerApi from "../lib/customerApi.js";
import HIcon from "../assets/HICON.png";

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
    returnTo: sp.get("returnTo") || sp.get("next") || "",
  };
}

function sanitizeReturnTo(raw, fallback = "/progreso") {
  const rt = String(raw || "").trim();

  if (!rt) return fallback;
  if (!rt.startsWith("/")) return fallback;
  if (rt.includes("login")) return fallback;
  if (rt.includes("register")) return fallback;
  if (rt.includes("forgot-password")) return fallback;
  if (rt.includes("reset-password")) return fallback;
  if (rt.includes("precalificar")) return "/progreso";

  return rt;
}

function withTimeout(promise, ms = 12000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error("Timeout: el servidor no respondió.")),
      ms
    );

    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

function getTokenFromResponse(resp) {
  return (
    resp?.token ||
    resp?.accessToken ||
    resp?.jwt ||
    resp?.data?.token ||
    resp?.data?.accessToken ||
    resp?.data?.jwt ||
    ""
  );
}

function niceMsg(err) {
  const raw =
    err?.data?.error ||
    err?.data?.message ||
    err?.message ||
    "Ups… no pudimos iniciar sesión.";

  const msg = String(raw).toLowerCase();

  if (
    msg.includes("failed to fetch") ||
    msg.includes("load failed") ||
    msg.includes("network") ||
    msg.includes("timeout")
  ) {
    return "Ups… no pudimos conectarnos en este momento. Intenta de nuevo en unos segundos.";
  }

  if (
    msg.includes("invalid") ||
    msg.includes("credenciales") ||
    msg.includes("incorrect") ||
    msg.includes("unauthorized") ||
    msg.includes("401")
  ) {
    return "Tu email o contraseña no coinciden. Revisa tus datos e inténtalo otra vez.";
  }

  return raw;
}

function LoginBrand({ mobile = false }) {
  return (
    <div className={`flex items-center gap-3 ${mobile ? "mb-5" : "mb-6"}`}>
      <div
        className={[
          mobile ? "h-12 w-12" : "h-14 w-14",
          "rounded-2xl bg-slate-950/70 border border-emerald-400/50",
          "shadow-[0_0_34px_rgba(16,185,129,0.22)]",
          "flex items-center justify-center overflow-hidden",
        ].join(" ")}
      >
        <img
          src={HIcon}
          alt="HabitaLibre"
          className={mobile ? "h-8 w-8 object-contain" : "h-9 w-9 object-contain"}
        />
      </div>

      <div>
        <div
          className={[
            mobile ? "text-lg" : "text-xl",
            "font-black tracking-[-0.04em] text-white leading-none",
          ].join(" ")}
        >
          HabitaLibre
        </div>
        <div className="mt-1 text-[11px] md:text-xs font-bold text-emerald-300/90">
          Tu camino a tu primera vivienda
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const qs = useMemo(() => getQS(location), [location.search]);

  const { token, login } = useCustomerAuth();

  const emailRef = useRef(null);
  const passRef = useRef(null);

  const [mode, setMode] = useState(
    qs.intent === "register" ? "register" : "login"
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState(
    String(location?.state?.email || "").trim().toLowerCase()
  );
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [acepta, setAcepta] = useState(true);

  const returnTo = useMemo(() => {
    const stateRT = location?.state?.returnTo || "";
    const qsRT = qs.returnTo || "";
    return sanitizeReturnTo(stateRT || qsRT || "", "/progreso");
  }, [location?.state?.returnTo, qs.returnTo]);

  useEffect(() => {
    trackPageView("customer_login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (token) nav(returnTo, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, returnTo]);

  useEffect(() => {
    setMode(qs.intent === "register" ? "register" : "login");
  }, [qs.intent]);

  const subtitle = useMemo(() => {
    const rt = String(returnTo || "");
    if (rt.includes("journey") || rt.includes("app")) {
      return "Guarda tu plan y retoma tu camino a la vivienda propia cuando quieras.";
    }

    return "Accede a tu progreso guardado, tus resultados y tu checklist personalizado.";
  }, [returnTo]);

  const canRegister = useMemo(() => {
    if (String(nombre || "").trim().length < 2) return false;
    if (String(apellido || "").trim().length < 2) return false;
    if (!isEmail(email)) return false;
    if (!isValidEcMobile(telefono)) return false;
    if (String(password || "").length < 6) return false;
    if (!acepta) return false;
    return true;
  }, [nombre, apellido, email, telefono, password, acepta]);

  const goToLogin = () => {
    setMode("login");
    setError("");
    trackEvent("customer_login_tab", {});
  };

  const goToRegister = () => {
    setMode("register");
    setError("");
    trackEvent("customer_register_tab", {});
  };

  const doLogin = async () => {
    if (busy) return;

    setError("");

    const domEmail = emailRef.current?.value ?? "";
    const domPass = passRef.current?.value ?? "";

    const finalEmail = String(email || domEmail).trim().toLowerCase();
    const finalPass = String(password || domPass);

    if (!isEmail(finalEmail)) {
      setError("Ingresa un email válido para continuar.");
      return;
    }

    if (!finalPass) {
      setError("Ingresa tu contraseña para continuar.");
      return;
    }

    setBusy(true);

    try {
      trackEvent("customer_login_submit", { returnTo });

      const resp = await withTimeout(
        customerApi.loginCustomer({
          email: finalEmail,
          password: finalPass,
        }),
        12000
      );

      const receivedToken = getTokenFromResponse(resp);

      if (!receivedToken) {
        const msg = resp?.message || "No se pudo iniciar sesión.";
        const status = resp?.status || resp?.statusCode;
        throw new Error(status ? `${msg} (status ${status})` : msg);
      }

      await login(resp);

      trackEvent("customer_login_success", {});
      nav(returnTo, { replace: true });
    } catch (err) {
      trackEvent("customer_login_error", {
        message: String(err?.message || err),
      });

      setError(niceMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const onSubmitRegister = async (e) => {
    e.preventDefault();

    if (busy) return;

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
      setError("Revisa tu teléfono. Ejemplo: 09XXXXXXXX o +5939XXXXXXXX.");
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
      trackEvent("customer_register_submit", { returnTo });

      const payload = {
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        email: String(email).trim().toLowerCase(),
        telefono: cleanPhone(telefono),
        password: String(password),
        aceptaTerminos: true,
      };

      const resp = await withTimeout(customerApi.registerCustomer(payload), 12000);

      const receivedToken = getTokenFromResponse(resp);

      if (!receivedToken) {
        throw new Error(resp?.message || "No se pudo crear la cuenta.");
      }

      await login(resp);

      trackEvent("customer_register_success", {});
      nav(returnTo, { replace: true });
    } catch (err) {
      trackEvent("customer_register_error", {
        message: String(err?.message || err),
      });

      setError(
        niceMsg(err) ||
          "No se pudo crear tu cuenta. Si ya tienes cuenta, inicia sesión."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center">
        <section className="hidden md:block">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <LoginBrand />

            <div className="text-[11px] tracking-[0.28em] uppercase text-slate-400 mb-3">
              HabitaLibre
            </div>

            <h1 className="text-4xl font-black tracking-[-0.04em] leading-[1.03] text-slate-50 max-w-md">
              Inicia sesión para ver tu progreso
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-300 max-w-md">
              {subtitle}
            </p>

            <div className="mt-7 grid gap-3 text-sm">
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="font-bold text-slate-50">✓ Tu ruta guardada</p>
                <p className="text-slate-400 text-[12px] leading-5 mt-1">
                  Retoma tu evaluación, resultados y próximos pasos sin volver a
                  empezar.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="font-bold text-slate-50">
                  ✓ Checklist personalizado
                </p>
                <p className="text-slate-400 text-[12px] leading-5 mt-1">
                  Documentos y acciones según tu perfil: empleado,
                  independiente o mixto.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <p className="font-bold text-slate-50">
                  ✓ Sin consultas al buró
                </p>
                <p className="text-slate-400 text-[12px] leading-5 mt-1">
                  Tu simulación es informativa. No afecta tu historial
                  crediticio.
                </p>
              </div>
            </div>

            <p className="mt-6 text-[11px] text-slate-500">
              Tus datos están protegidos. No compartimos tu información sin tu
              consentimiento.
            </p>
          </div>
        </section>

        <section className="w-full">
          <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-6 md:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="md:hidden">
              <LoginBrand mobile />
            </div>

            <div className="mb-5">
              <div className="text-[11px] tracking-[0.24em] uppercase text-slate-400">
                {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </div>

              <h2 className="mt-2 text-2xl md:text-3xl font-black tracking-[-0.04em]">
                {mode === "login" ? "Bienvenido de vuelta" : "Guarda tu plan"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400 md:hidden">
                {subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5 rounded-3xl border border-white/10 bg-slate-950/35 p-1">
              <button
                type="button"
                onClick={goToLogin}
                className={[
                  "rounded-2xl px-4 py-2.5 text-sm font-black transition",
                  mode === "login"
                    ? "bg-emerald-400 text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.32)]"
                    : "text-slate-300 hover:text-slate-50",
                ].join(" ")}
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                onClick={goToRegister}
                className={[
                  "rounded-2xl px-4 py-2.5 text-sm font-black transition",
                  mode === "register"
                    ? "bg-emerald-400 text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.32)]"
                    : "text-slate-300 hover:text-slate-50",
                ].join(" ")}
              >
                Crear cuenta
              </button>
            </div>

            {error ? (
              <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-[13px] leading-5 text-rose-200">
                {error}
              </div>
            ) : null}

            {mode === "login" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-200 mb-2">
                    Email
                  </label>
                  <input
                    ref={emailRef}
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onInput={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    className="h-14 w-full rounded-2xl bg-white/[0.06] border border-white/10 px-4 text-base text-slate-100 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-400/10"
                    placeholder="Tu email"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-200 mb-2">
                    Contraseña
                  </label>
                  <input
                    ref={passRef}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onInput={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") doLogin();
                    }}
                    type="password"
                    autoComplete="current-password"
                    className="h-14 w-full rounded-2xl bg-white/[0.06] border border-white/10 px-4 text-base text-slate-100 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-400/10"
                    placeholder="Tu contraseña"
                  />
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={doLogin}
                  className={[
                    "h-14 w-full rounded-2xl text-base font-black transition active:scale-[0.99]",
                    busy
                      ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                      : "bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-[0_18px_40px_rgba(16,185,129,0.35)]",
                  ].join(" ")}
                >
                  {busy ? "Ingresando..." : "Iniciar sesión"}
                </button>

                <p className="text-center text-[12px] leading-5 text-slate-500">
                  Tus datos están protegidos. No compartimos tu información sin
                  tu consentimiento.
                </p>

                <div className="pt-1 flex items-center justify-between gap-3 text-[12px] text-slate-400">
                  <Link
                    to="/forgot-password"
                    onClick={() => {
                      trackEvent("customer_forgot_password_click", {});
                    }}
                    className="hover:text-slate-200 underline underline-offset-4"
                  >
                    Olvidé mi contraseña
                  </Link>

                  <button
                    type="button"
                onClick={() => nav("/progreso")}
                    className="hover:text-slate-200 underline underline-offset-4"
                  >
                    Explorar sin cuenta
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmitRegister} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-200 mb-2">
                      Nombre
                    </label>
                    <input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      type="text"
                      autoComplete="given-name"
                      className="h-14 w-full rounded-2xl bg-white/[0.06] border border-white/10 px-4 text-base text-slate-100 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-400/10"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-slate-200 mb-2">
                      Apellido
                    </label>
                    <input
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      type="text"
                      autoComplete="family-name"
                      className="h-14 w-full rounded-2xl bg-white/[0.06] border border-white/10 px-4 text-base text-slate-100 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-400/10"
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-200 mb-2">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    className="h-14 w-full rounded-2xl bg-white/[0.06] border border-white/10 px-4 text-base text-slate-100 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-400/10"
                    placeholder="Tu email"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-200 mb-2">
                    Teléfono
                  </label>
                  <input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    className="h-14 w-full rounded-2xl bg-white/[0.06] border border-white/10 px-4 text-base text-slate-100 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-400/10"
                    placeholder="09xxxxxxxx o +5939xxxxxxxx"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Usamos tu teléfono solo para contactarte si tú lo pides.
                  </p>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-200 mb-2">
                    Contraseña
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    className="h-14 w-full rounded-2xl bg-white/[0.06] border border-white/10 px-4 text-base text-slate-100 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-400/10"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-3 text-[12px] leading-5 text-slate-400">
                  <input
                    type="checkbox"
                    checked={acepta}
                    onChange={(e) => setAcepta(e.target.checked)}
                    className="mt-1 accent-emerald-400"
                  />
                  <span>Acepto términos y política de privacidad.</span>
                </label>

                <button
                  type="submit"
                  disabled={busy || !canRegister}
                  className={[
                    "h-14 w-full rounded-2xl text-base font-black transition active:scale-[0.99]",
                    busy || !canRegister
                      ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                      : "bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-[0_18px_40px_rgba(16,185,129,0.35)]",
                  ].join(" ")}
                >
                  {busy ? "Creando cuenta..." : "Guardar y continuar"}
                </button>

                <div className="pt-1 flex items-center justify-between gap-3 text-[12px] text-slate-400">
                  <button
                    type="button"
                   onClick={() => nav("/progreso")}
                    className="hover:text-slate-200 underline underline-offset-4"
                  >
                    Explorar sin cuenta
                  </button>

                  <button
                    type="button"
                    onClick={goToLogin}
                    className="hover:text-slate-200 underline underline-offset-4"
                  >
                    Ya tengo cuenta
                  </button>
                </div>
              </form>
            )}

            <p className="mt-5 text-center text-[11px] leading-5 text-slate-500">
              Datos cifrados · sin consultas al buró · puedes borrar tu cuenta
              cuando quieras
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}