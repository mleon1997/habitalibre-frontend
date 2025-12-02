// src/pages/Gracias.jsx
import React from "react";

export default function Gracias() {
  const irAlSimulador = () => {
    // Mantiene compatibilidad con tu routing por hash
    window.location.hash = "#/simular";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl grid gap-8 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.2fr)]">
        {/* PANEL IZQUIERDO – Mensaje principal */}
        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/70 shadow-xl shadow-black/30 px-6 py-8 md:px-10 md:py-10">
          {/* Etiqueta superior */}
          <p className="text-xs font-semibold tracking-[0.25em] text-emerald-400 uppercase mb-4">
            Primer paso completado
          </p>

          {/* Título principal */}
          <h1 className="text-2xl md:text-3xl font-semibold leading-snug mb-3">
            Felicidades, diste el primer paso
            <br />
            hacia tu casa propia 🏡
          </h1>

          {/* Subtítulo / explicación */}
          <p className="text-sm md:text-base text-slate-300 max-w-xl">
            Ya generamos tu{" "}
            <span className="font-semibold text-emerald-300">
              Reporte de Precalificación HabitaLibre
            </span>
            . En pocos minutos lo recibirás en tu correo para que puedas
            revisarlo con calma y planear tu siguiente movimiento.
          </p>

          {/* Pasos cortos 1–3 */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {/* Paso 1 */}
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
                Busca un mail de <span className="font-semibold">HabitaLibre</span>{" "}
                con tu reporte en PDF. Si no lo ves, revisa la carpeta de spam.
              </p>
            </div>

            {/* Paso 2 */}
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
                El reporte te muestra cuánto podrías pedir, tu tipo de crédito
                recomendado y la probabilidad aproximada por banco.
              </p>
            </div>

            {/* Paso 3 */}
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
                Lleva el reporte como guía cuando hables con un banco o con el
                BIESS. Te ayuda a negociar mejor tu hipoteca.
              </p>
            </div>
          </div>

          {/* Botón + texto corto */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
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

          {/* Disclaimer final */}
          <p className="mt-6 text-[10px] leading-relaxed text-slate-500 max-w-lg">
            HabitaLibre no solicita claves bancarias ni afecta tu buró. Tu
            precalificación es una guía educativa para que tomes decisiones más
            claras sobre tu futura vivienda.
          </p>
        </section>

        {/* PANEL DERECHO – ¿Qué sigue? */}
        <aside className="rounded-3xl border border-slate-800/60 bg-slate-900/60 shadow-lg shadow-black/20 px-6 py-7 md:px-8 md:py-9">
          <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-400 mb-4">
            ¿Qué sigue después de este paso?
          </h2>

          <div className="space-y-5 text-sm">
            {/* Paso A */}
            <div className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-emerald-300">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  Lee tu reporte con calma
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Fíjate en tu capacidad de pago, tipo de crédito recomendado
                  (VIS/VIP/BIESS/Privado) y tu probabilidad aproximada por
                  banco.
                </p>
              </div>
            </div>

            {/* Paso B */}
            <div className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-emerald-300">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  Define tu estrategia
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Usa las recomendaciones para decidir si ajustas entrada,
                  plazo o rango de precio de vivienda para mejorar tu perfil.
                </p>
              </div>
            </div>

            {/* Paso C */}
            <div className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-emerald-300">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  Llega mejor preparado al banco
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Con tu reporte ya no vas “a ciegas”: sabes cuánto puedes pedir
                  y qué tan probable es que te aprueben.
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje final */}
          <div className="mt-6 border-t border-slate-800 pt-4">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cada simulación que haces en HabitaLibre es un paso más para
              dejar de adivinar y empezar a tomar decisiones informadas sobre tu
              casa propia.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
