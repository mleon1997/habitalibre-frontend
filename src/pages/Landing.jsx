// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function scrollToId(id) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Landing() {
  const navigate = useNavigate();

  const handleStartSimulation = () => {
    navigate("/simular");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* ====== NAVBAR ====== */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          {/* Logo simple */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/90 shadow-[0_0_25px_rgba(79,70,229,0.65)]">
              <span className="text-sm font-semibold">HL</span>
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

          {/* Links */}
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <button
              type="button"
              onClick={() => scrollToId("hl-como-funciona")}
              className="transition-colors hover:text-white"
            >
              Cómo funciona
            </button>
            <button
              type="button"
              onClick={() => scrollToId("hl-beneficios")}
              className="transition-colors hover:text-white"
            >
              Beneficios
            </button>
            <button
              type="button"
              onClick={handleStartSimulation}
              className="rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_0_30px_rgba(79,70,229,0.7)] transition hover:bg-indigo-400"
            >
              Iniciar simulación
            </button>
          </nav>
        </div>
      </header>

      {/* ====== HERO ====== */}
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),transparent_60%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),transparent_55%)]" />

        <section className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 md:flex-row md:items-center md:gap-12 md:px-6 md:pb-20 md:pt-14">
          {/* Columna izquierda */}
          <div className="flex-1">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
              • Precalificación sin afectar tu buró
            </p>

            <h1 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-4xl md:text-5xl">
              Tu camino fácil a la <br className="hidden sm:block" />
              vivienda propia <span className="align-middle">🏡</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
              Descubre en menos de 2 minutos cuánto puedes comprar hoy y con qué
              tipo de crédito: VIS, VIP, BIESS o banca privada. Sin filas, sin
              papeles y sin afectar tu historial crediticio.
            </p>

            {/* Botones */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStartSimulation}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-[0_18px_40px_rgba(16,185,129,0.55)] transition hover:bg-emerald-400"
              >
                Simular ahora
                <span className="ml-2 text-xs">→</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToId("hl-como-funciona")}
                className="inline-flex items-center justify-center rounded-full border border-slate-600/70 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-400 hover:text-white"
              >
                Ver ejemplo de resultado
              </button>
            </div>

            {/* Chips inferiores */}
            <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Datos cifrados
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Enfoque VIS / VIP / BIESS
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                Asesoría sin costo
              </div>
            </div>
          </div>

          {/* Columna derecha: tarjeta de ejemplo */}
          <div className="flex-1">
            <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-900/70 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.9)] backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Vista previa de un resultado
              </p>
              <p className="mt-1 text-xs text-emerald-400">
                Perfil VIS / VIP simulado
              </p>

              <div className="mt-5">
                <p className="text-xs text-slate-400">Capacidad estimada</p>
                <p className="text-3xl font-semibold tracking-tight text-slate-50">
                  $98,500
                </p>
                <p className="text-[11px] text-slate-400">
                  según tus ingresos y deudas
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4">
                <div>
                  <p className="text-[11px] text-slate-400">Cuota estimada</p>
                  <p className="text-lg font-semibold text-slate-50">
                    $480 / mes
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Plazo 20 años · tasa ref.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">
                    Producto tentativo
                  </p>
                  <p className="text-sm font-semibold text-slate-50">VIS / VIP</p>
                  <p className="text-[11px] text-slate-500">
                    Ajustable según tu perfil real.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-[11px] text-slate-400">
                <div>
                  <p className="text-slate-500">Familias simuladas</p>
                  <p className="mt-1 font-semibold text-slate-50">+1,000</p>
                </div>
                <div>
                  <p className="text-slate-500">Tiempo estimado</p>
                  <p className="mt-1 font-semibold text-slate-50">&lt; 2 min</p>
                </div>
                <div>
                  <p className="text-slate-500">Seguridad</p>
                  <p className="mt-1 font-semibold text-slate-50">AES-256</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartSimulation}
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_18px_45px_rgba(56,189,248,0.55)] transition hover:bg-sky-400"
              >
                Ver mi capacidad real
              </button>

              <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                Este es un ejemplo ilustrativo. Al simular, calculamos tu
                resultado real con tus datos y diferentes escenarios de tasa /
                plazo.
              </p>
            </div>
          </div>
        </section>

        {/* ====== CÓMO FUNCIONA ====== */}
        <section
          id="hl-como-funciona"
          className="relative border-t border-slate-800/70 bg-slate-950/95"
        >
          <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-14">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
              ¿Cómo funciona HabitaLibre?
            </h2>
            <ol className="mt-5 space-y-4 text-sm text-slate-300">
              <li>
                <span className="font-semibold text-slate-100">1.</span> Completa
                nuestra simulación en 4 pasos. No pedimos papeles ni claves
                bancarias.
              </li>
              <li>
                <span className="font-semibold text-slate-100">2.</span> Te
                mostramos cuánto podrías comprar, tu cuota estimada y el tipo de
                producto más alineado con tu perfil (VIS, VIP, BIESS o banca
                privada).
              </li>
              <li>
                <span className="font-semibold text-slate-100">3.</span> Si
                quieres avanzar, un asesor HabitaLibre te contacta y te
                acompaña sin costo hasta concretar tu crédito.
              </li>
            </ol>
          </div>
        </section>

        {/* ====== BENEFICIOS ====== */}
        <section
          id="hl-beneficios"
          className="relative border-t border-slate-800/70 bg-slate-950"
        >
          <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-14">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
              Beneficios de simular con HabitaLibre
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.8)]">
                <p className="text-sm font-semibold text-slate-50">
                  Comparación inteligente
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  No eres un formulario más. Analizamos tu perfil y te
                  orientamos a la alternativa que realmente tiene sentido para
                  ti.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.8)]">
                <p className="text-sm font-semibold text-slate-50">
                  Sin afectar tu buró
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Trabajamos con datos declarativos para darte una primera
                  lectura sin dejar huella en tu historial crediticio.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.8)]">
                <p className="text-sm font-semibold text-slate-50">
                  Acompañamiento humano
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Detrás del simulador hay un equipo que te acompaña en el
                  proceso con lenguaje claro, sin letras pequeñas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

