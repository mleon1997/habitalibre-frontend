// src/pages/Landing.jsx
import {
  SparklesIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  StarIcon,
} from "@heroicons/react/24/outline";


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

     {/* CÓMO FUNCIONA – versión pro */}
<section
  id="como-funciona"
  className="border-t border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950"
>
  <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-300 mb-3">
          <SparklesIcon className="h-3.5 w-3.5 text-emerald-400" />
          <span>Proceso guiado en menos de 2 minutos</span>
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
          ¿Cómo funciona HabitaLibre?
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-xl">
          No es solo un simulador. Es una primera lectura realista de cuánto
          podrías comprar y con qué tipo de crédito tiene más sentido avanzar.
        </p>
      </div>

      <div className="flex gap-4 text-xs text-slate-400">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3">
          <div className="text-[11px] text-slate-500 mb-1">
            Tiempo promedio
          </div>
          <div className="text-sm font-semibold text-slate-50">1–2 min</div>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3">
          <div className="text-[11px] text-slate-500 mb-1">
            Información requerida
          </div>
          <div className="text-sm font-semibold text-slate-50">
            Solo ingresos y deudas
          </div>
        </div>
      </div>
    </div>

    <div className="grid gap-5 md:grid-cols-3 text-sm">
      {/* Paso 1 */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-emerald-400/60 hover:bg-slate-900">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.16),transparent_55%)]" />
        <div className="relative flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
            <ClipboardDocumentListIcon className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
              Paso 1
            </p>
            <p className="font-semibold text-slate-50">
              Simulas sin papeles ni claves bancarias
            </p>
          </div>
        </div>
        <p className="relative text-xs text-slate-400">
          Completa una simulación guiada en 4 pasos con tus ingresos,
          deudas y si aportas o no al IESS. No pedimos buró ni claves
          bancarias, solo datos declarativos.
        </p>
      </div>

      {/* Paso 2 */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-emerald-400/60 hover:bg-slate-900">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),transparent_55%)]" />
        <div className="relative flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
            <BanknotesIcon className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
              Paso 2
            </p>
            <p className="font-semibold text-slate-50">
              Ves tu rango de compra y tipo de crédito
            </p>
          </div>
        </div>
        <p className="relative text-xs text-slate-400">
          Calculamos tu capacidad de pago, cuota estimada y te
          mostramos qué producto encaja mejor contigo: VIS, VIP,
          BIESS o banca privada, con un score hipotecario claro.
        </p>
      </div>

      {/* Paso 3 */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-emerald-400/60 hover:bg-slate-900">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.16),transparent_55%)]" />
        <div className="relative flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
            <UserGroupIcon className="h-5 w-5 text-fuchsia-400" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
              Paso 3
            </p>
            <p className="font-semibold text-slate-50">
              Si quieres, te acompañamos hasta el crédito
            </p>
          </div>
        </div>
        <p className="relative text-xs text-slate-400">
          Un asesor HabitaLibre revisa tu caso y te ayuda a preparar
          documentos, comparar bancos y avanzar con la opción que
          mejor combine cuota, plazo y seguridad para ti.
        </p>
      </div>
    </div>
  </div>
</section>

     {/* BENEFICIOS – versión pro */}
<section
  id="beneficios"
  className="border-t border-slate-800 bg-slate-950 pb-14"
>
  <div className="mx-auto max-w-6xl px-4 pt-10 md:pt-12">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
      <div>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
          Beneficios de simular con HabitaLibre
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-xl">
          En lugar de darte un número suelto, conectamos tu realidad con
          el tipo de crédito, el rango de vivienda y los pasos concretos
          para llegar a tu hipoteca.
        </p>
      </div>

      <div className="flex gap-3 text-[11px] text-slate-400">
        <div className="rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1.5 flex items-center gap-2">
          <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
          Sin afectar tu buró
        </div>
        <div className="rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1.5 flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-sky-400" />
          Enfoque VIS / VIP / BIESS
        </div>
      </div>
    </div>

    <div className="grid gap-5 md:grid-cols-3 text-sm">
      {/* Beneficio 1 */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="font-semibold text-slate-50">
            Comparación realmente inteligente
          </p>
        </div>
        <p className="text-xs text-slate-400 mb-2">
          No eres un formulario más. Tomamos tu ingreso, deudas y
          aporte al IESS para comparar escenarios VIS, VIP, BIESS y
          banca privada, y te mostramos lo que tiene sentido para ti
          hoy.
        </p>
        <ul className="text-[11px] text-slate-400 space-y-1.5">
          <li>• Rango de precio sugerido en vez de un valor aislado.</li>
          <li>• Score hipotecario para entender qué tan cerca estás.</li>
        </ul>
      </div>

      {/* Beneficio 2 */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
            <ShieldCheckIcon className="h-5 w-5 text-sky-400" />
          </div>
        <p className="font-semibold text-slate-50">Sin riesgo para tu historial</p>
        </div>
        <p className="text-xs text-slate-400 mb-2">
          Trabajamos con datos declarativos. No hacemos consultas de
          buró ni movimientos bancarios, así que puedes explorar tu
          capacidad sin dejar huella.
        </p>
        <ul className="text-[11px] text-slate-400 space-y-1.5">
          <li>• Ideal si aún no estás listo para ir directo al banco.</li>
          <li>• Puedes simular distintos escenarios antes de decidir.</li>
        </ul>
      </div>

      {/* Beneficio 3 */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-fuchsia-400" />
          </div>
          <p className="font-semibold text-slate-50">
            Acompañamiento humano cuando tú quieras
          </p>
        </div>
        <p className="text-xs text-slate-400 mb-2">
          Detrás del simulador hay personas. Si tu resultado te
          convence, un asesor puede ayudarte sin costo a ordenar tus
          documentos y preparar tu mejor versión para el banco.
        </p>
        <ul className="text-[11px] text-slate-400 space-y-1.5">
          <li>• Explicamos tu reporte en lenguaje simple.</li>
          <li>• Te ayudamos a ver qué mejorar para subir tu score.</li>
        </ul>
      </div>
    </div>
  </div>
</section>

{/* TESTIMONIOS */}
<section
  id="testimonios"
  className="border-t border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950/95"
>
  <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-300 mb-3">
          <ChatBubbleOvalLeftEllipsisIcon className="h-3.5 w-3.5 text-emerald-400" />
          <span>Personas reales, procesos reales</span>
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
          Lo que dicen quienes ya simularon
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-xl">
          Historias de personas que usaron HabitaLibre como primer paso para
          entender su capacidad real antes de ir al banco.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <StarIcon className="h-4 w-4 text-amber-400" />
        <span>
          <span className="text-slate-50 font-semibold">4.9/5</span>{" "}
          satisfacción promedio en experiencias piloto
        </span>
      </div>
    </div>

    {/* Grid de testimonios */}
    <div className="grid gap-5 md:grid-cols-3 text-sm">
      {/* Testimonio 1 */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.15),transparent_55%)]" />
        <div className="relative flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 text-slate-950 flex items-center justify-center text-xs font-semibold">
            MA
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-50">
              Mateo &amp; Alejandra
            </p>
            <p className="text-[11px] text-slate-400">Primera vivienda · Quito</p>
          </div>
        </div>
        <p className="relative text-xs text-slate-300">
          “Siempre nos decían cosas distintas en cada banco. Con el reporte de
          HabitaLibre entendimos de una vez nuestro rango de compra y qué tipo
          de crédito nos convenía. Llegamos a la cita con el banco mucho más
          seguros.”
        </p>
      </div>

      {/* Testimonio 2 */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),transparent_55%)]" />
        <div className="relative flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-semibold">
            CR
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-50">
              Carolina R.
            </p>
            <p className="text-[11px] text-slate-400">
              Migrando de arriendo a dueño · VIS/VIP
            </p>
          </div>
        </div>
        <p className="relative text-xs text-slate-300">
          “Pensé que no calificaba. El simulador me mostró que sí podía, pero
          ajustando plazo y entrada. El acompañamiento después del resultado fue
          clave para ordenar mis documentos y saber por dónde arrancar.”
        </p>
      </div>

      {/* Testimonio 3 */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.16),transparent_55%)]" />
        <div className="relative flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-semibold">
            JP
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-50">
              Jorge P.
            </p>
            <p className="text-[11px] text-slate-400">
              Cambio de banco · Refinanciamiento
            </p>
          </div>
        </div>
        <p className="relative text-xs text-slate-300">
          “Yo ya tenía hipoteca, pero quería una mejor tasa. El stress test del
          reporte me ayudó a ver cuánto me ahorraba cambiando de producto y en
          cuánto tiempo se pagaba el esfuerzo de hacer el trámite.”
        </p>
      </div>
    </div>
  </div>
</section>


    </main>
  );
}
