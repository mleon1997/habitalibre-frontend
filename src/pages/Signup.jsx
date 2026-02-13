// src/pages/Signup.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { trackEvent, trackPageView } from "../lib/analytics";
import * as customerApi from "../lib/customerApi.js";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setCustomer } = useCustomerAuth();

  const prefilledEmail = location.state?.email || "";
  const returnTo = location.state?.returnTo || "/progreso";

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    trackPageView("customer_signup");
  }, []);

  const validate = () => {
    if (!email || !email.includes("@")) {
      return "Ingresa un email válido.";
    }
    if (!password || password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setLoading(true);

      const data = await customerApi.registerCustomer({
        email: email.trim().toLowerCase(),
        password,
      });

      // ✅ auto login
      if (data?.token) setToken(data.token);
      if (data?.user) setCustomer(data.user);

      trackEvent("customer_signup_success", {
        from: location.state?.from || "unknown",
      });

      navigate(returnTo, { replace: true });
    } catch (err) {
      console.error("[SIGNUP] error:", err);
      const msg2 =
        err?.message ||
        "No pudimos crear tu cuenta. Verifica tu email o intenta nuevamente.";

      setError(msg2);

      trackEvent("customer_signup_error", {
        message: String(msg2).slice(0, 120),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070B16] px-4">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="text-xs tracking-[0.3em] text-emerald-300/80">
            CUSTOMER JOURNEY
          </div>
          <h1 className="mt-2 text-4xl font-semibold text-white">
            Empieza tu camino
          </h1>
          <p className="mt-2 text-white/70">
            Guarda tu progreso y recibe un plan paso a paso para lograr tu
            hipoteca.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm text-white/70 mb-2">Email</label>
            <input
              className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-white outline-none focus:border-emerald-400/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-white/70 mb-2">
              Crea una contraseña
            </label>
            <input
              className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-white outline-none focus:border-emerald-400/60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <div className="mt-2 text-xs text-white/50">
              Mínimo 6 caracteres.
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 px-5 py-4 font-semibold text-black hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Guardar mi progreso"}
          </button>

          <div className="pt-2 text-center text-xs text-white/40">
            Gratis. Sin compromiso. Puedes salir cuando quieras.
          </div>
        </form>
      </div>
    </div>
  );
}
