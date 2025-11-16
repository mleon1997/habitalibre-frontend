// src/pages/Landing.jsx
import React from "react";
import HeroHabitaLibre from "../components/HeroHabitaLibre";

export default function Landing({ onStart }) {
  return (
    <div className="bg-slate-950 text-slate-50 overflow-hidden pb-20">
      
      {/* 🌟 HERO WORLD CLASS */}
      <HeroHabitaLibre
        onStart={onStart}
        onViewExample={() => {
          const el = document.getElementById("como-funciona");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* ============================
          SECCIÓN: CÓMO FUNCIONA
      ============================ */}
      <section
        id="como-funciona"
        className="relative mx-auto mt-10 max-w-5xl px-4 sm:px-6 lg:px-8"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-slate-50 mb-6">
          ¿Cómo funciona HabitaLibre?
        </h2>

        <div className="space-y-6 text-slate-300 text-[15px] leading-relaxed">
          <p className="flex gap-3">
            <span className="text-emerald-400 font-bold">1.</span>
            Completa nuestra simulación en 4 pasos. No pedimos papeles ni claves bancarias.
          </p>

          <p className="flex gap-3">
            <span className="text-emerald-400 font-bold">2.</span>
            Te mostramos cuánto podrías comprar, tu cuota estimada y el tipo de producto
            más alineado con tu perfil (VIS, VIP, BIESS o banca privada).
          </p>

          <p className="flex gap-3">
            <span className="text-emerald-400 font-bold">3.</span>
            Si quieres avanzar, un asesor HabitaLibre te contacta y te acompaña sin costo
            hasta concretar tu crédito.
          </p>
        </div>

        {/* Divider */}
        <div className="mt-10 h-px w-full bg-slate-800/60" />
      </section>

      {/* ============================
          SECCIÓN: BENEFICIOS
      ============================ */}
      <section
        id="beneficios-hl"
        className="relative mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-slate-50 mb-8">
          Beneficios de simular con HabitaLibre
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* CARD 1 */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-[0_20px_40px_rgba(2,6,23,0.45)] hover:bg-slate-900/80 transition">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">
              Comparación inteligente
            </h3>
            <p className="text-slate-400 text-[14px] leading-relaxed">
              No eres un formulario más. Analizamos tu perfil y te orientamos
              a la alternativa que realmente tiene sentido para ti.
            </p>
          </div>

          {/* CARD 2 */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-[0_20px_40px_rgba(2,6,23,0.45)] hover:bg-slate-900/80 transition">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">
              Sin afectar tu buró
            </h3>
            <p className="text-slate-400 text-[14px] leading-relaxed">
              Trabajamos con datos declarativos para darte una primera lectura
              sin dejar huella en tu historial crediticio.
            </p>
          </div>

          {/* CARD 3 */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-[0_20px_40px_rgba(2,6,23,0.45)] hover:bg-slate-900/80 transition">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">
              Acompañamiento humano
            </h3>
            <p className="text-slate-400 text-[14px] leading-relaxed">
              Detrás del simulador hay un equipo que te acompaña en todo el
              proceso con lenguaje claro, sin letras pequeñas.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
