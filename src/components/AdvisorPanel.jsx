// src/components/AdvisorPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { readAdvisorThread, writeAdvisorThread, clearAdvisorThread } from "../lib/advisorThreadLocal";
import { buildAdvisorReply } from "../lib/decisionEngine";

function nowIso() {
  try {
    return new Date().toISOString();
  } catch {
    return String(Date.now());
  }
}

function parseMdBold(text) {
  // mini render: **bold**
  const parts = String(text || "").split("**");
  return parts.map((p, idx) =>
    idx % 2 === 1 ? (
      <strong key={idx} className="text-slate-50">
        {p}
      </strong>
    ) : (
      <span key={idx}>{p}</span>
    )
  );
}

export default function AdvisorPanel({
  open,
  onClose,
  data,
  userEmail,
  onNavigate, // (href)=>void
  onAnchor, // (href)=>void
}) {
  const [thread, setThread] = useState(() => readAdvisorThread());
  const [booted, setBooted] = useState(false);

  const advisor = useMemo(() => buildAdvisorReply({ data, userEmail }), [data, userEmail]);

  // boot: si está vacío, sembramos un mensaje inicial
  useEffect(() => {
    if (booted) return;
    const t = readAdvisorThread();
    if (!t || t.length === 0) {
      const seeded = [
        {
          id: `a_${Date.now()}`,
          role: "advisor",
          ts: nowIso(),
          text: advisor.message,
          state: advisor.state,
        },
      ];
      writeAdvisorThread(seeded);
      setThread(seeded);
    } else {
      setThread(t);
    }
    setBooted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  // cuando cambie data, si el panel está abierto, podemos actualizar con un “snapshot”
  useEffect(() => {
    if (!open) return;
    // agrega un mensaje del advisor solo si el último state cambió de forma relevante
    const current = readAdvisorThread();
    const last = current?.[current.length - 1];

    const lastKey = `${last?.state?.estado || ""}|${last?.state?.bloqueo || ""}|${last?.state?.decision || ""}`;
    const newKey = `${advisor?.state?.estado || ""}|${advisor?.state?.bloqueo || ""}|${advisor?.state?.decision || ""}`;

    if (last?.role === "advisor" && lastKey === newKey) return;

    const next = [
      ...(current || []),
      {
        id: `a_${Date.now()}`,
        role: "advisor",
        ts: nowIso(),
        text: advisor.message,
        state: advisor.state,
      },
    ];

    writeAdvisorThread(next);
    setThread(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, advisor.message]);

  const close = () => onClose?.();

  const doAction = (action) => {
    if (!action) return;
    if (action.type === "go") onNavigate?.(action.href);
    if (action.type === "anchor") onAnchor?.(action.href);
  };

  const resetThread = () => {
    clearAdvisorThread();
    const seeded = [
      {
        id: `a_${Date.now()}`,
        role: "advisor",
        ts: nowIso(),
        text: advisor.message,
        state: advisor.state,
      },
    ];
    writeAdvisorThread(seeded);
    setThread(seeded);
  };

  // Overlay + Panel: desktop slide-over, mobile bottom-sheet
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar advisor"
        onClick={close}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
      />

      {/* Panel */}
      <aside
        className="
          absolute right-0 top-0 h-full w-full sm:w-[440px]
          bg-slate-950 border-l border-slate-800/70
          shadow-[0_24px_80px_rgba(0,0,0,0.55)]
          flex flex-col
          translate-x-0
          animate-[hl_slidein_.18s_ease-out]
          sm:rounded-none
        "
      >
        {/* header */}
        <div className="px-4 py-4 border-b border-slate-800/70 bg-slate-950/95">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-emerald-300/90">
                Advisor Mode
              </p>
              <h3 className="mt-1 text-base font-semibold text-white tracking-tight">
                Tu coach hipotecario
              </h3>
              <p className="mt-1 text-[12px] text-slate-400 leading-snug">
                Diagnóstico → siguiente mejor acción → checklist → aplicar.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetThread}
                className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-200 hover:border-slate-500"
              >
                Reiniciar
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-2 text-slate-200 hover:bg-slate-900"
                aria-label="Cerrar"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* quick actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {advisor.quickActions.map((qa) => (
              <button
                key={qa.id}
                type="button"
                onClick={() => doAction(qa.action)}
                className="rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200 ring-1 ring-slate-700/70 hover:bg-slate-900"
              >
                {qa.label}
              </button>
            ))}
          </div>
        </div>

        {/* thread */}
        <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
          {thread.map((m) => {
            const isAdvisor = m.role === "advisor";
            return (
              <div key={m.id} className={`flex ${isAdvisor ? "justify-start" : "justify-end"}`}>
                <div
                  className={[
                    "max-w-[92%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed ring-1",
                    isAdvisor
                      ? "bg-slate-900/60 text-slate-200 ring-slate-800/70"
                      : "bg-emerald-500/15 text-emerald-100 ring-emerald-500/25",
                  ].join(" ")}
                >
                  <div className="whitespace-pre-wrap">
                    {String(m.text || "")
                      .split("\n")
                      .map((line, idx) => (
                        <p key={idx} className={idx === 0 ? "mt-0" : "mt-2"}>
                          {parseMdBold(line)}
                        </p>
                      ))}
                  </div>

                  {isAdvisor && m?.state?.nba?.length ? (
                    <div className="mt-3 grid gap-2">
                      {m.state.nba.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => doAction(t.action)}
                          className="text-left rounded-2xl border border-slate-800/70 bg-slate-950/30 px-3 py-2 hover:bg-slate-950/50 transition"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-slate-100">{t.title}</p>
                            <span
                              className={[
                                "rounded-full px-2 py-0.5 text-[10px] ring-1",
                                t.impact === "alto"
                                  ? "bg-amber-500/15 text-amber-200 ring-amber-500/25"
                                  : t.impact === "medio"
                                  ? "bg-slate-500/10 text-slate-200 ring-slate-600/30"
                                  : "bg-emerald-500/15 text-emerald-200 ring-emerald-500/25",
                              ].join(" ")}
                            >
                              Impacto {t.impact}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* footer */}
        <div className="px-4 py-4 border-t border-slate-800/70 bg-slate-950/95">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500">
              Este advisor usa reglas (no afecta buró). La aprobación final es del banco.
            </p>

            <button
              type="button"
              onClick={() => doAction({ type: "go", href: "/simular?mode=journey"})}
              className="rounded-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-[12px] px-4 py-2 transition"
            >
              Afinar ahora →
            </button>
          </div>
        </div>
      </aside>

      {/* Animación slide-in */}
      <style>{`
        @keyframes hl_slidein_ {
          from { transform: translateX(18px); opacity: 0.7; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 640px) {
          aside {
            top: auto !important;
            bottom: 0 !important;
            height: 88vh !important;
            width: 100% !important;
            border-left: none !important;
            border-top: 1px solid rgba(30,41,59,0.7) !important;
            border-top-left-radius: 18px !important;
            border-top-right-radius: 18px !important;
            animation: hl_bottomsheet .18s ease-out !important;
          }
          @keyframes hl_bottomsheet {
            from { transform: translateY(18px); opacity: 0.7; }
            to { transform: translateY(0); opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
}
