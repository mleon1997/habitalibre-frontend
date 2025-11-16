// src/pages/Landing.jsx
import React from "react";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function Landing({ onStart }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* ================= HERO ================= */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-28 pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Left Text */}
          <div className="space-y-6">
            <p className="text-teal-300 text-sm tracking-wider font-medium">
              ● PRECALIFICACIÓN SIN AFECTAR TU BURÓ
            </p>

            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1]">
              Tu camino fácil a la{" "}
              <span className="text-teal-300">vivienda propia 🏡</span>
            </h1>

            <p className="text-slate-400 text-lg max-w-md">
              Descubre en menos de 2 minutos cuánto puedes comprar hoy y con qué tipo de crédito:
              VIS, VIP, BIESS o banca privada. Sin filas, sin papeleo y sin afectar tu historial crediticio.
            </p>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={onStart}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black rounded-xl 
                           text-sm font-semibold flex items-center gap-2 transition"
              >
                Simular ahora <ArrowRightIcon className="w-4 h-4" />
              </button>

              <a
                href="#como-funciona"
                className="px-6 py-3 border border-slate-600 rounded-xl text-sm font-semibold 
                           hover:bg-slate-800/40 transition"
              >
                Ver ejemplo de resultado
              </a>
            </div>

            {/* Badges */}
            <div className="flex gap-6 text-xs text-slate-400 pt-2">
              <span>● Datos cifrados</span>
              <span>● Enfoque VIS / VIP / BIESS</span>
              <span>● Asesoría sin costo</span>
            </div>
          </div>
          {/* Right Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
            <p className="text-xs text-teal-300 mb-1">Vista previa de un resultado</p>
            <h3 className="text-sm text-slate-300 mb-3">Perfil VIS / VIP simulado</h3>

            <div className="mb-4">
              <p className="text-slate-400 text-xs">Capacidad estimada</p>
              <p className="text-3xl font-bold">$98,500</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs">Cuota estimada</p>
                <p className="font-semibold">$480 / mes</p>
                <p className="text-xs text-slate-500">Plazo 20 años · tasa ref.</p>
              </div>

              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs">Producto tentativo</p>
                <p className="font-semibold">VIS / VIP</p>
                <p className="text-xs text-slate-500">Ajustable según tu perfil real.</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={onStart}
                className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-black font-semibold rounded-xl transition"
              >
                Ver mi capacidad real
              </button>
            </div>

            <p className="text-[10px] text-slate-500 mt-3">
              Este es un ejemplo ilustrativo. Al simular, calculamos tu resultado real con tus datos y diferentes escenarios de tasa / plazo.
            </p>
          </div>

        </div>
      </section>

      {/* ================= ¿CÓMO FUNCIONA? ================= */}
      <section id="como-funciona" className="w-full max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-10">¿Cómo funciona HabitaLibre?</h2>

        <div className="space-y-8 text-slate-300">
          <p className="flex gap-4 items-start">
            <CheckCircleIcon className="w-6 h-6 text-teal-400 mt-1" />
            <span>
              Completa nuestra simulación en 4 pasos. No pedimos papeleo ni claves bancarias.
            </span>
          </p>

          <p className="flex gap-4 items-start">
            <CheckCircleIcon className="w-6 h-6 text-teal-400 mt-1" />
            <span>
              Te mostramos cuánto podrías comprar, tu cuota estimada y el tipo de producto más alineado con tu perfil (VIS, VIP, BIESS o banca privada).
            </span>
          </p>

          <p className="flex gap-4 items-start">
            <CheckCircleIcon className="w-6 h-6 text-teal-400 mt-1" />
            <span>
              Si quieres avanzar, un asesor HabitaLibre te acompaña sin costo hasta concretar tu crédito.
            </span>
          </p>
        </div>
      </section>
      {/* ================= BENEFICIOS ================= */}
      <section className="w-full max-w-6xl mx-auto px-6 pb-28">
        <h2 className="text-3xl font-bold mb-10">Beneficios de simular con HabitaLibre</h2>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Item 1 */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 
                          hover:border-teal-500 transition">
            <ChartBarIcon className="w-9 h-9 text-teal-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Comparación inteligente</h3>
            <p className="text-sm text-slate-400">
              No eres un formulario más. Analizamos tu perfil y te orientamos a la alternativa que realmente tiene sentido para ti.
            </p>
          </div>

          {/* Item 2 */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800
                          hover:border-teal-500 transition">
            <ShieldCheckIcon className="w-9 h-9 text-teal-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin afectar tu buró</h3>
            <p className="text-sm text-slate-400">
              Trabajamos con datos declarativos para darte una primera lectura sin dejar huella en tu historial crediticio.
            </p>
          </div>

          {/* Item 3 */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800
                          hover:border-teal-500 transition">
            <UserGroupIcon className="w-9 h-9 text-teal-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acompañamiento humano</h3>
            <p className="text-sm text-slate-400">
              Detrás del simulador hay un equipo que te acompaña en el proceso con lenguaje claro, sin letras pequeñas.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}

