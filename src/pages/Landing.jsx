// src/pages/Landing.jsx
import React from "react";

export default function Landing({ onStart }) {
  const handleStart = () => {
    if (typeof onStart === "function") {
      onStart();
    } else {
      window.location.hash = "#/simular";
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* NAVBAR */}
      <header className="border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* Logo simple */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-emerald-400 flex items-center justify-center text-xs font-semibold shadow-lg shadow-indigo-500/40">
              HL
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-sm">HabitaLibre</div>
              <div className="text-[11px] text-slate-400">
                Hipoteca exprés · VIS · VIP · BIESS
              </div>
            </div>
          </div>

          {/* Links simples con anchors */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a
              href="#como-funciona"
              className="text-slate-300 hover:text-slate-50 transition"
            >
              Cómo funciona
            </a>
            <a
              href="#beneficios"
              className="text-slate-300 hover:text-slate-50 transition"
            >
              Beneficios
            </a>
            <button
              onClick={handleStart}
              className="px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-xs shadow-lg shadow-blue-500/40 transition"
            >
              Iniciar simulación
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_55%),_radial-gradient(circle_at_bottom,_rgba(37,99,235,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
            {/* LEFT – copy principal */}
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400 mb-3">
                ● Precalificación sin afectar tu buró
              </p>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-50 mb-4">
                Tu camino fácil a la
                <br />
                vivienda propia{" "}
                <span role="img" aria-label="house">
                  🏡
                </span>
              </h1>
              <p className="text-sm md:text-[15px] text-slate-300 max-w-xl mb-6">
                Descubre en menos de 2 minutos cuánto puedes comprar hoy y con
                qué tipo de crédito: VIS, VIP, BIESS o banca privada. Sin filas,
                sin papeles y sin afectar tu historial crediticio.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={handleStart}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-emerald-400 text-slate-950 font-semibold text-sm shadow-[0_18px_40px_rgba(16,185,129,0.45)] hover:bg-emerald-300 transition"
                >
                  Simular ahora
                  <span className="ml-1.5 text-base">→</span>
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-slate-600/80 text-slate-200 text-sm hover:border-slate-400 hover:text-slate-50 transition"
                  onClick={() => {
                    const el = document.getElementById("preview");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  Ver ejemplo de resultado
                </button>
              </div>

              {/* mini badges */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Datos cifrados
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Enfoque VIS / VIP / BIESS
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                  Asesoría sin costo
                </div>
              </div>
            </div>

            {/* RIGHT – result card mejorada */}
            <div id="preview">
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-[0_24px_60px_rgba(15,23,42,0.9)] backdrop-blur-sm">
                {/* Header */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <div>
                    <p className="text-teal-300 font-medium">
                      Vista previa de tu resultado
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      Ejemplo con ingresos de $1.600 y deudas moderadas
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-500/40 text-[11px]">
                    No afecta tu buró
                  </span>
                </div>

                {/* Capacidad principal */}
                <div className="mb-5">
                  <p className="text-slate-400 text-[11px] mb-1">
                    Capacidad estimada de compra
                  </p>
                  <p className="text-3xl md:text-4xl font-bold tracking-tight">
                    $ 98.500
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Monto referencial de vivienda según tus datos declarados.
                  </p>
                </div>

                {/* Bloques clave */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="bg-slate-900 border border-slate-700/70 rounded-2xl p-4">
                    <p className="text-slate-400 text-[11px] mb-1">
                      Cuota estimada
                    </p>
                    <p className="font-semibold text-[17px]">$ 480 / mes</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Incluye capital + intereses · Plazo 20 años.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-700/70 rounded-2xl p-4">
                    <p className="text-slate-400 text-[11px] mb-1">
                      Producto tentativo
                    </p>
                    <p className="font-semibold text-[15px]">VIS / VIP</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ajustamos según si calificas a subsidio o BIESS.
                    </p>
                  </div>
                </div>

                {/* Tasa, plazo y score */}
                <div className="grid grid-cols-3 gap-3 text-[11px] mb-5">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <p className="text-slate-400 text-[10px] mb-0.5">
                      Tasa referencial
                    </p>
                    <p className="text-slate-100 font-semibold text-sm">
                      8,75%*
                    </p>
                    <p className="text-slate-500 text-[9px] mt-0.5">
                      Varía por banco y producto.
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <p className="text-slate-400 text-[10px] mb-0.5">
                      Plazo estimado
                    </p>
                    <p className="text-slate-100 font-semibold text-sm">
                      20 años
                    </p>
                    <p className="text-slate-500 text-[9px] mt-0.5">
                      Buscamos balance entre cuota y costo total.
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <p className="text-slate-400 text-[10px] mb-0.5">
                      Score HabitaLibre
                    </p>
                    <p className="text-slate-100 font-semibold text-sm">
                      82 / 100
                    </p>
                    <p className="text-emerald-400 text-[9px] mt-0.5">
                      Perfil sólido para iniciar tu proceso.
                    </p>
                  </div>
                </div>

                {/* Tip */}
                <div className="mb-5 bg-slate-900 border border-slate-700/70 rounded-2xl p-3 flex gap-2 items-start">
                  <div className="mt-0.5 h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center text-[13px] text-emerald-300">
                    i
                  </div>
                  <div className="text-[11px] leading-snug text-slate-200">
                    <span className="font-semibold text-emerald-300">
                      Ejemplo:
                    </span>{" "}
                    si reduces tus otras deudas en{" "}
                    <span className="font-semibold">$ 150/mes</span>, tu
                    capacidad podría subir hasta aprox.{" "}
                    <span className="font-semibold">$ 112.000</span>. En el
                    reporte real te mostramos estos escenarios con tus propios
                    datos.
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleStart}
                  className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-sm transition"
                >
                  Ver mi capacidad real
                </button>

                <p className="text-[9px] text-slate-500 mt-3 leading-snug">
                  *Tasa y condiciones referenciales. Tu resultado real se
                  calcula con tus datos y puede variar según entidad financiera,
                  producto y regulación vigente en Ecuador.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section
        id="como-funciona"
        className="border-t border-slate-800 bg-slate-950"
      >
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            ¿Cómo funciona HabitaLibre?
          </h2>

          <div className="grid gap-6 md:grid-cols-3 text-sm">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">Paso 1</p>
              <p className="font-semibold mb-2">
                Simulas sin papeles ni claves bancarias
              </p>
              <p className="text-slate-400 text-xs">
                Completa una simulación guiada en 4 pasos con tus ingresos y
                deudas declaradas. No pedimos buró ni clave de banco.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">Paso 2</p>
              <p className="font-semibold mb-2">
                Te mostramos tu rango de compra realista
              </p>
              <p className="text-slate-400 text-xs">
                Calculamos capacidad de pago, cuota estimada y qué tipo de
                crédito (VIS, VIP, BIESS o banca privada) tiene más sentido para
                ti.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">Paso 3</p>
              <p className="font-semibold mb-2">
                Si quieres, te acompañamos hasta el crédito
              </p>
              <p className="text-slate-400 text-xs">
                Un asesor HabitaLibre revisa tu caso y te ayuda, sin costo, a
                preparar documentos, comparar ofertas y avanzar con el banco que
                mejor encaje.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section
        id="beneficios"
        className="border-t border-slate-800 bg-slate-950 pb-14"
      >
        <div className="mx-auto max-w-5xl px-4 pt-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            Beneficios de simular con HabitaLibre
          </h2>

          <div className="grid gap-5 md:grid-cols-3 text-sm">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <p className="font-semibold mb-1">Comparación inteligente</p>
              <p className="text-slate-400 text-xs">
                No eres un formulario más. Analizamos tu perfil y comparamos
                escenarios para VIS, VIP, BIESS y banca privada para mostrarte
                lo que realmente tiene sentido.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <p className="font-semibold mb-1">Sin afectar tu buró</p>
              <p className="text-slate-400 text-xs">
                Trabajamos con datos declarativos para que tengas una primera
                lectura clara sin dejar huella en tu historial crediticio ni
                comprometerte con ningún banco.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <p className="font-semibold mb-1">Acompañamiento humano</p>
              <p className="text-slate-400 text-xs">
                Detrás del simulador hay un equipo que te acompaña en el
                proceso, revisa tu caso y te ayuda a negociar mejores
                condiciones cuando estés listo para avanzar.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
