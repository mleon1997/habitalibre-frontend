// src/pages/Landing.jsx
import React, { useRef } from "react";

export default function Landing({ onStart }) {
  const comoRef = useRef(null);
  const beneficiosRef = useRef(null);
  const ejemploRef = useRef(null);

  const goToSimulador = () => {
    if (onStart) {
      onStart();
    } else {
      // fallback por si algún día no pasas la prop
      window.location.hash = "#/simular";
    }
  };

  const scrollToRef = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      {/* NAV */}
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
          {/* Logo / marca */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-700">
              <span className="text-[11px] font-semibold tracking-tight text-slate-100">
                HL
              </span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold text-slate-50">
                HabitaLibre
              </span>
              <span className="text-[11px] text-slate-400">
                Hipoteca exprés · VIS · VIP · BIESS
              </span>
            </div>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <button
              type="button"
              onClick={() => scrollToRef(comoRef)}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Cómo funciona
            </button>
            <button
              type="button"
              onClick={() => scrollToRef(beneficiosRef)}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Beneficios
            </button>
            <button
              type="button"
              onClick={goToSimulador}
              className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition-colors"
            >
              Iniciar simulación
            </button>
          </nav>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-slate-800/60">
          {/* halo de fondo */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-purple-500/5 to-slate-950" />
          <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />

          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:flex-row md:items-center md:py-16 lg:py-20">
            {/* Columna izquierda: texto */}
            <div className="flex-1 max-w-xl space-y-5">
              <p className="text-[11px] font-semibold tracking-[.3em] text-slate-400 uppercase">
                Precalificación sin afectar tu buró
              </p>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-50">
                Tu camino fácil a la vivienda propia{" "}
                <span role="img" aria-label="casa">
                  🏡
                </span>
              </h1>

              <p className="text-sm md:text-base text-slate-300 max-w-lg">
                Descubre en menos de 2 minutos cuánto puedes comprar hoy y con
                qué tipo de crédito: VIS, VIP, BIESS o banca privada. Sin filas,
                sin papeles y sin afectar tu historial crediticio.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={goToSimulador}
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(56,189,248,0.6)] hover:bg-sky-400 transition-colors"
                >
                  Simular ahora
                  <span className="ml-1.5 text-base">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToRef(ejemploRef)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-800/80 transition-colors"
                >
                  Ver ejemplo de resultado
                </button>
              </div>

              {/* mini bullets */}
              <div className="flex flex-wrap gap-4 pt-4 text-[11px] text-slate-400">
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

            {/* Columna derecha: tarjeta ejemplo */}
            <div className="flex-1 md:max-w-md">
              <div
                ref={ejemploRef}
                className="rounded-[32px] border border-slate-700/70 bg-gradient-to-b from-slate-900/90 to-slate-950/95 px-6 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.9)]"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[.2em] text-slate-400">
                      Vista previa de un resultado
                    </p>
                    <p className="text-xs text-slate-400">
                      Perfil VIS / VIP simulado
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
                    No afecta tu buró
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-1">
                  Capacidad estimada
                </p>
                <p className="text-4xl font-semibold text-slate-50">
                  $98,500
                </p>
                <p className="text-[11px] text-slate-400 mb-4">
                  según tus ingresos y deudas
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 px-3 py-3">
                    <p className="text-[11px] text-slate-400 mb-1">
                      Cuota estimada
                    </p>
                    <p className="text-sm font-semibold text-slate-50">
                      $480 / mes
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Plazo 20 años · tasa ref.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 px-3 py-3">
                    <p className="text-[11px] text-slate-400 mb-1">
                      Producto tentativo
                    </p>
                    <p className="text-sm font-semibold text-slate-50">
                      VIS / VIP
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Ajustable según tu perfil real.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400 mb-5">
                  <div className="space-y-1">
                    <p>Familias simuladas</p>
                    <p className="text-slate-100 font-semibold">+1,000</p>
                  </div>
                  <div className="space-y-1">
                    <p>Tiempo estimado</p>
                    <p className="text-slate-100 font-semibold">&lt; 2 min</p>
                  </div>
                  <div className="space-y-1">
                    <p>Enfoque</p>
                    <p className="text-slate-100 font-semibold">
                      VIS / VIP / BIESS
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p>Seguridad</p>
                    <p className="text-slate-100 font-semibold">AES-256</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={goToSimulador}
                  className="w-full rounded-full bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors"
                >
                  Ver mi capacidad real
                </button>

                <p className="mt-3 text-[10px] leading-snug text-slate-500">
                  Este es un ejemplo ilustrativo. Al simular, calculamos tu
                  resultado real con tus datos y diferentes escenarios de tasa /
                  plazo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section
          ref={comoRef}
          className="border-b border-slate-800/60 bg-slate-950 px-4 py-10 md:py-14"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-50 mb-4">
              ¿Cómo funciona HabitaLibre?
            </h2>
            <ol className="space-y-3 text-sm md:text-base text-slate-300">
              <li>
                1. Completa nuestra simulación en 4 pasos. No pedimos papeles ni
                claves bancarias.
              </li>
              <li>
                2. Te mostramos cuánto podrías comprar, tu cuota estimada y el
                tipo de producto más alineado con tu perfil (VIS, VIP, BIESS o
                banca privada).
              </li>
              <li>
                3. Si quieres avanzar, un asesor HabitaLibre te contacta y te
                acompaña sin costo hasta concretar tu crédito.
              </li>
            </ol>
          </div>
        </section>

        {/* BENEFICIOS */}
        <section
          ref={beneficiosRef}
          className="bg-slate-950 px-4 py-10 md:py-14"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-50 mb-6">
              Beneficios de simular con HabitaLibre
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-semibold text-slate-50 mb-1">
                  Comparación inteligente
                </p>
                <p className="text-xs text-slate-300">
                  No eres un formulario más. Analizamos tu perfil y te
                  orientamos a la alternativa que realmente tiene sentido para
                  ti.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-semibold text-slate-50 mb-1">
                  Sin afectar tu buró
                </p>
                <p className="text-xs text-slate-300">
                  Trabajamos con datos declarativos para darte una primera
                  lectura sin dejar huella en tu historial crediticio.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-semibold text-slate-50 mb-1">
                  Acompañamiento humano
                </p>
                <p className="text-xs text-slate-300">
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
