// src/pages/Signup.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { trackEvent, trackPageView } from "../lib/analytics";

function getReturnTo(location) {
  const sp = new URLSearchParams(location.search || "");

  const stateReturnTo = location?.state?.returnTo || "";
  const qsReturnTo = sp.get("returnTo") || sp.get("next") || "";

  const raw = String(stateReturnTo || qsReturnTo || "/progreso").trim();

  if (!raw.startsWith("/")) return "/progreso";
  if (raw.includes("login")) return "/progreso";
  if (raw.includes("signup")) return "/progreso";
  if (raw.includes("register")) return "/progreso";
  if (raw.includes("forgot-password")) return "/progreso";
  if (raw.includes("reset-password")) return "/progreso";

  return raw;
}

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    trackPageView("customer_signup_redirect");

    const returnTo = getReturnTo(location);
    const prefilledEmail = location?.state?.email || "";

    trackEvent("customer_signup_redirect_to_login_register", {
      returnTo,
      hasPrefilledEmail: Boolean(prefilledEmail),
      from: location?.state?.from || "unknown",
    });

    navigate(
      `/login?intent=register&returnTo=${encodeURIComponent(returnTo)}`,
      {
        replace: true,
        state: {
          email: prefilledEmail,
          returnTo,
          from: location?.state?.from || "signup_redirect",
        },
      }
    );
  }, [navigate, location]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.04] p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <img
          src="/LOGOHL.png"
          alt="HabitaLibre"
          className="h-9 w-auto mx-auto mb-5 drop-shadow-[0_8px_18px_rgba(45,212,191,0.22)]"
        />

        <div className="text-[11px] tracking-[0.24em] uppercase text-slate-400">
          HabitaLibre
        </div>

        <h1 className="mt-3 text-2xl font-black tracking-[-0.04em]">
          Preparando tu registro
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Te estamos llevando a la nueva experiencia para crear tu cuenta y
          guardar tu progreso.
        </p>
      </div>
    </main>
  );
}