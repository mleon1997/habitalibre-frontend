// src/pages/Landing.jsx
import React from "react";
import { ChevronRight, ShieldCheck, Home, Sparkles } from "lucide-react";
import logoHL from "../assets/logo-hl.png";

export default function Landing({ onStart }) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col">
      {/* NAVBAR */}
      <header className="w-full border-b border-slate-800/70 bg-[#020617]/95 backdrop-blur-sm">
        <nav className="max-w-6xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-2xl bg-slate-900/70 border border-slate-800 p-2">
              <img
                src={logoHL}
                alt="HabitaLibre"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">
                HabitaLibre
              </span>
              <span className="text-[11px] text-slate-400">
                Hipoteca exprés · VIS · VIP · BIESS
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              className="nav-link"
              onClick={() =>
                document
                  .getElementById("como-funciona")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Cómo funciona
            </button>
            <button
              className="nav-link"
              onClick={() =>
                document
                  .getElementById("beneficios")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Beneficios
            </button>
            <button className="btn-ghost btn-sm" onClick={onStart}>
              Iniciar simulación
            </button>
          </div>
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1">
        {/* HERO */}
        <section className="max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-16 grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
          {/* Columna texto */}
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-violet-300 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Precalificación sin afectar tu buró
            </p>

            <h1 className="text-3xl md:text-5xl font-semibold leading-tight text-slate-50 mb-4">
              Tu camino fácil a la vivienda propia{" "}
              <span className="inline-block align-middle">🏡</span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base max-w-xl mb-6">
              Descubre en menos de 2 minutos cuánto puedes comprar hoy y con qué
              tipo de crédito: VIS, VIP, BIESS o banca privada. Sin filas, sin
              papeles y sin afectar tu historial crediticio.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <button
                onClick={onStart}
                className="btn-primary inline-flex items-center gap-2"
              >
                Simular ahora
                <ChevronRight size={18} />
              </button>
              <button
                className="btn-outline"
                onClick={() =>
                  document
                    .getElementById("como-funciona")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Ver ejemplo de resultado
              </button>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={12} /> Datos cifrados
              </span>
              <span className="inline-flex items-center gap-1">
                <Home size={12} /> Enfoque VIS / VIP / BIESS
              </span>
              <span className="inline-flex items-center gap-1">
                <Sparkles size={12} /> Asesoría sin costo
              </span>
            </div>
          </div>

          {/* Columna tarjeta preview */}
          <div className="relative">
            <div className="absolute -top-6 -right-4 w-32 h-32 bg-violet-500/30 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-8 w-40 h-40 bg-fuchsia-500/20 blur-3xl rounded-full pointer-events-none" />

            <div className="relative bg-slate-900/80 border border-slate-700/70 rounded-3xl p-6 md:p-7 shadow-[0_20px_60px_rgba(15,23,42,0.9)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] text-slate-400 mb-1">
                    Vista previa de un resultado
                  </p>
                  <p className="text-xs text-emerald-300 font-medium">
                    Perfil VIS / VIP simulado
                  </p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  No afecta tu buró
                </span>
              </div>

              <div className="mb-4">
                <p className="text-[11px] text-slate-400 mb-1">
                  Capacidad estimada
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-bold text-slate-50">
                    $98,500
                  </span>
                  <span className="text-[11px] text-slate-500">
                    según tus ingresos y deudas
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div className="bg-slate-900 rounded-2xl px-3 py-2.5 border border-slate-800">
                  <p className="text-[11px] text-slate-400 mb-1">
                    Cuota estimada
                  </p>
                  <p className="text-base font-semibold text-slate-50">
                    $480 / mes
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Plazo 20 años · tasa ref.
                  </p>
                </div>
                <div className="bg-slate-900 rounded-2xl px-3 py-2.5 border border-slate-800">
                  <p className="text-[11px] text-slate-400 mb-1">
                    Producto tentativo
                  </p>
                  <p className="text-base font-semibold text-violet-300">
                    VIS / VIP
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Ajustable según tu perfil real.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 text-[11px] text-slate-400">
                <div>
                  <p>Familias simuladas</p>
                  <p className="text-slate-100 font-semibold">+1,000</p>
                </div>
                <div>
                  <p>Tiempo estimado</p>
                  <p className="text-slate-100 font-semibold">&lt; 2 min</p>
                </div>
                <div>
                  <p>Seguridad</p>
                  <p className="text-slate-100 font-semibold">AES-256</p>
                </div>
              </div>

              <button
                onClick={onStart}
                className="btn-primary w-full justify-center"
              >
                Ver mi capacidad real
              </button>

              <p className="mt-3 text-[11px] text-slate-500">
                Este es un ejemplo ilustrativo. Al simular, calculamos tu
                resultado real con tus datos y diferentes escenarios de tasa /
                plazo.
              </p>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section
          id="como-funciona"
          className="max-w-6xl mx-auto px-5 md:px-8 pb-16 border-t border-slate-800/70 pt-10"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-slate-50 mb-4">
            ¿Cómo funciona HabitaLibre?
          </h2>
          <ol className="space-y-3 text-sm text-slate-300 list-decimal list-inside">
            <li>
              Completa nuestra simulación en 4 pasos. No pedimos papeles ni
              claves bancarias.
            </li>
            <li>
              Te mostramos cuánto podrías comprar, tu cuota estimada y el tipo
              de producto más alineado con tu perfil (VIS, VIP, BIESS o banca
              privada).
            </li>
            <li>
              Si quieres avanzar, un asesor HabitaLibre te contacta y te
              acompaña sin costo hasta concretar tu crédito.
            </li>
          </ol>
        </section>

        {/* BENEFICIOS */}
        <section
          id="beneficios"
          className="max-w-6xl mx-auto px-5 md:px-8 pb-20 text-sm text-slate-300"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-slate-50 mb-4">
            Beneficios de simular con HabitaLibre
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <p className="text-sm font-semibold text-slate-50 mb-1">
                Comparación inteligente
              </p>
              <p className="text-xs text-slate-400">
                No eres un formulario más. Analizamos tu perfil y te
                orientamos a la alternativa que realmente tiene sentido para ti.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <p className="text-sm font-semibold text-slate-50 mb-1">
                Sin afectar tu buró
              </p>
              <p className="text-xs text-slate-400">
                Trabajamos con datos declarativos para darte una primera
                lectura sin dejar huella en tu historial crediticio.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <p className="text-sm font-semibold text-slate-50 mb-1">
                Acompañamiento humano
              </p>
              <p className="text-xs text-slate-400">
                Detrás del simulador hay un equipo que te acompaña en el
                proceso con lenguaje claro, sin letras pequeñas.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
