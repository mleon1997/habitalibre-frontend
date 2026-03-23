// src/pages/Gracias.jsx
import React from "react";

export default function Gracias() {
  const irAlSimulador = () => {
    // Mantiene compatibilidad con tu routing por hash
    window.location.hash = "#/simular";
  };

  const irAProgreso = () => {
    // Mantiene compatibilidad con tu routing por hash
    window.location.hash = "#/progreso";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl grid gap-8 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.2fr)]">
        {/* PANEL IZQUIERDO – Mensaje principal */}
        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/70 shadow-xl shadow-black/30 px-6 py-8 md:px-10 md:py-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-emerald-400 uppercase mb-4">
            Solicitud recibida
          </p>

          <h1 className="text-2xl md:text-3xl font-semibold leading-snug mb-3">
            ¡Listo! Ya diste el primer paso
            <br />
            hacia tu casa propia 🏡
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-xl">
            Ya recibimos tu información correctamente. Ahora estamos preparando tu{" "}
            <span className="font-semibold text-emerald-300">
              Reporte de Precalificación HabitaLibre
            </span>{" "}
            y te lo enviaremos a tu correo en pocos minutos para que lo revises con calma.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-semibold text-emerald-300">
                  1
                </span>
                <p className="text-xs font-semibold text-slate-100">
                  Revisa tu correo
                </p>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                En unos minutos recibirás un mail de{" "}
                <span className="font-semibold">HabitaLibre</span> con tu reporte.
                Si no lo ves, revisa promociones o spam.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-semibold text-emerald-300">
                  2
                </span>
                <p className="text-xs font-semibold text-slate-100">
                  Entiende tu capacidad
                </p>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Tu reporte te mostrará cuánto podrías pedir, qué tipo de crédito
                se ajusta mejor a tu perfil y tu probabilidad aproximada por banco.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-semibold text-emerald-300">
                  3
                </span>
                <p className="text-xs font-semibold text-slate-100">
                  Úsalo a tu favor
                </p>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Te servirá como guía para hablar con más claridad con bancos,
                cooperativas, BIESS o proyectos inmobiliarios.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
            <button
              type="button"
              onClick={irAProgreso}
              className="inline-flex items-center justify-center rounded-full bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-white transition focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Ver mi progreso
            </button>

            <button
              type="button"
              onClick={irAlSimulador}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Hacer otra simulación
            </button>

            <p className="text-[11px] text-slate-400 max-w-xs">
              Puedes volver al simulador cuando quieras y probar con otro valor
              de vivienda, entrada o plazo.
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-50">
                  Desbloquea tu experiencia completa en HabitaLibre
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Guarda tus simulaciones, accede a tu progreso y recibe recomendaciones personalizadas.
                </p>

                <ul className="mt-3 grid gap-1 text-[11px] text-slate-200">
                  <li>✅ Historial de simulaciones y reportes</li>
                  <li>✅ Progreso hipotecario paso a paso</li>
                  <li>✅ Recomendaciones más precisas por banco</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                <button
                  type="button"
                  onClick={() => (window.location.hash = "#/login?intent=signup")}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Crear mi cuenta gratis
                </button>
                <span className="text-[10px] text-slate-300/90">
                  Toma menos de 30 segundos · sin tarjetas
                </span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-[10px] leading-relaxed text-slate-500 max-w-lg">
            HabitaLibre no solicita claves bancarias ni afecta tu buró. Tu
            reporte es una guía educativa para ayudarte a tomar decisiones más
            claras sobre tu futura vivienda.
          </p>
        </section>

        {/* PANEL DERECHO – ¿Qué sigue? */}
        <aside className="rounded-3xl border border-slate-800/60 bg-slate-900/60 shadow-lg shadow-black/20 px-6 py-7 md:px-8 md:py-9">
          <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-400 mb-4">
            ¿Qué sigue después de este paso?
          </h2>

          <div className="space-y-5 text-sm">
            <div className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-emerald-300">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-100">Espera tu reporte</p>
                <p className="text-xs text-slate-400 mt-1">
                  Estamos procesando tu información para enviarte un resultado claro,
                  útil y fácil de entender.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-emerald-300">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-100">Define tu estrategia</p>
                <p className="text-xs text-slate-400 mt-1">
                  Cuando recibas tu reporte, podrás entender si hoy ya puedes avanzar
                  o si te conviene ajustar entrada, plazo o rango de precio.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-emerald-300">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  Llega mejor preparado
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Así no vas a ciegas: llegas con una base más clara para hablar con bancos,
                  BIESS o proyectos inmobiliarios.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cada simulación que haces en HabitaLibre es un paso más para dejar
              de adivinar y empezar a tomar decisiones informadas sobre tu casa propia.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}