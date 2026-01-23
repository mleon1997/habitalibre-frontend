// src/components/WhatsAppFab.jsx
import React, { useEffect, useMemo, useState } from "react";

export default function WhatsAppFab({
  phone = "593985476936", // <-- CAMBIA (sin +)
  message = "Hola HabitaLibre 👋 Quiero precalificar mi crédito hipotecario.",
  position = "bottom-right", // "bottom-right" | "bottom-left"
  showNudge = true, // burbuja “saludo”
}) {
  const href = useMemo(() => {
    return `https://wa.me/${String(phone).replace(/\D/g, "")}?text=${encodeURIComponent(
      message
    )}`;
  }, [phone, message]);

  const LS_KEY = "hl_wa_nudge_dismissed";
  const [nudgeOpen, setNudgeOpen] = useState(false);

  useEffect(() => {
    if (!showNudge) return;

    try {
      const dismissed = localStorage.getItem(LS_KEY) === "1";
      if (dismissed) return;
    } catch {}

    // Abrir con delay suave
    const t1 = setTimeout(() => setNudgeOpen(true), 900);
    // Auto-cerrar después de un rato (sin molestar)
    const t2 = setTimeout(() => setNudgeOpen(false), 9000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showNudge]);

  const dismissNudge = () => {
    setNudgeOpen(false);
    try {
      localStorage.setItem(LS_KEY, "1");
    } catch {}
  };

  const isRight = position === "bottom-right";

  return (
    <div
      className={[
        "fixed z-[80]",
        "bottom-5 md:bottom-6",
        isRight ? "right-5 md:right-6" : "left-5 md:left-6",
      ].join(" ")}
    >
      {/* Nudge bubble (Nubank-like) */}
      {nudgeOpen && (
        <div
          className={[
            "mb-3",
            "w-[280px] sm:w-[320px]",
            "rounded-2xl",
            "border border-slate-800/70",
            "bg-slate-950/85 backdrop-blur-xl",
            "shadow-[0_24px_70px_rgba(2,6,23,0.72)]",
            "overflow-hidden",
            "animate-[hlPopIn_.38s_ease-out]",
          ].join(" ")}
        >
          {/* top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400/60 via-sky-400/50 to-fuchsia-400/60" />

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-slate-900 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_28px_rgba(16,185,129,0.18)]">
                  {/* WA icon */}
                  <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
                    <path
                      d="M16 3C9.373 3 4 8.07 4 14.33c0 2.45.86 4.72 2.31 6.57L5 29l8.4-1.9c1.7.5 3.52.77 5.36.77 6.627 0 12-5.07 12-11.33C30.76 8.07 25.387 3 16 3Z"
                      fill="white"
                      fillOpacity="0.12"
                    />
                    <path
                      d="M13.63 11.6c-.2-.46-.41-.47-.6-.48h-.5c-.17 0-.44.06-.67.3-.23.24-.88.85-.88 2.07 0 1.22.9 2.4 1.03 2.56.12.16 1.73 2.7 4.23 3.68 2.07.8 2.5.64 2.95.6.45-.05 1.45-.58 1.65-1.14.2-.56.2-1.05.14-1.14-.06-.1-.22-.16-.45-.27-.23-.11-1.45-.7-1.68-.78-.23-.08-.4-.11-.57.13-.17.24-.65.78-.8.94-.15.16-.3.18-.53.07-.23-.11-.98-.35-1.86-1.11-.69-.58-1.16-1.3-1.3-1.52-.14-.22-.01-.34.1-.45.1-.1.23-.24.34-.36.11-.12.15-.2.23-.33.08-.13.04-.25-.02-.36-.06-.11-.53-1.28-.73-1.74Z"
                      fill="white"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-50 leading-tight">
                    ¿Te ayudo por WhatsApp?
                  </p>
                  <p className="mt-1 text-[12px] text-slate-400 leading-snug">
                    Respuesta rápida. Te guiamos en tu <span className="text-emerald-300 font-semibold">precalificación</span> sin compromiso.
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                      No afecta tu buró
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                      2 min
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                      Quito · Ecuador
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={dismissNudge}
                className="h-8 w-8 rounded-full border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-900 transition flex items-center justify-center"
                aria-label="Cerrar"
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismissNudge}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                  bg-emerald-400 text-slate-950 font-semibold text-sm
                  shadow-[0_18px_45px_rgba(16,185,129,0.28)]
                  hover:bg-emerald-300 transition"
              >
                Escribir por WhatsApp
                <span className="text-base">→</span>
              </a>

              <button
                onClick={dismissNudge}
                className="px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-slate-200 text-sm hover:bg-slate-900 transition"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB button */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismissNudge}
        className={[
          "group",
          "h-14 w-14 md:h-14 md:w-14",
          "rounded-2xl",
          "bg-slate-950/70 backdrop-blur-xl",
          "border border-emerald-400/25",
          "shadow-[0_28px_80px_rgba(2,6,23,0.75)]",
          "flex items-center justify-center",
          "transition",
          "hover:border-emerald-300/45",
          "hover:shadow-[0_28px_90px_rgba(16,185,129,0.18)]",
          "active:scale-[0.98]",
        ].join(" ")}
        aria-label="Abrir WhatsApp"
        title="WhatsApp HabitaLibre"
      >
        {/* ring */}
        <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-emerald-400/10" />
        {/* glow */}
        <span className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),transparent_55%)]" />

        {/* icon */}
        <div className="relative h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
            <path
              d="M16 3C9.373 3 4 8.07 4 14.33c0 2.45.86 4.72 2.31 6.57L5 29l8.4-1.9c1.7.5 3.52.77 5.36.77 6.627 0 12-5.07 12-11.33C30.76 8.07 25.387 3 16 3Z"
              fill="white"
              fillOpacity="0.12"
            />
            <path
              d="M13.63 11.6c-.2-.46-.41-.47-.6-.48h-.5c-.17 0-.44.06-.67.3-.23.24-.88.85-.88 2.07 0 1.22.9 2.4 1.03 2.56.12.16 1.73 2.7 4.23 3.68 2.07.8 2.5.64 2.95.6.45-.05 1.45-.58 1.65-1.14.2-.56.2-1.05.14-1.14-.06-.1-.22-.16-.45-.27-.23-.11-1.45-.7-1.68-.78-.23-.08-.4-.11-.57.13-.17.24-.65.78-.8.94-.15.16-.3.18-.53.07-.23-.11-.98-.35-1.86-1.11-.69-.58-1.16-1.3-1.3-1.52-.14-.22-.01-.34.1-.45.1-.1.23-.24.34-.36.11-.12.15-.2.23-.33.08-.13.04-.25-.02-.36-.06-.11-.53-1.28-.73-1.74Z"
              fill="white"
            />
          </svg>
        </div>

        {/* tiny ping dot */}
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
      </a>

      {/* keyframes (inline, sin tocar CSS global) */}
      <style>{`
        @keyframes hlPopIn {
          0% { transform: translateY(10px) scale(0.98); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
