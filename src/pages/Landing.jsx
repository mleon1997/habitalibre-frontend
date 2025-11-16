// src/pages/Landing.jsx
import React from "react";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export default function Landing({ onStart }) {
  // Fallback seguro: si no viene onStart del App, usamos el hash directo
  const handleStart = () => {
    if (typeof onStart === "function") {
      onStart();
    } else {
      window.location.hash = "#/simular";
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* ===== Nav simple arriba (marca + links) ===== */}
      <header className="w-full border-b border-slate-800/60 bg-slate-950/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-xs font-black text-slate-950">
              HL
            </div>
            <div>
              <p className="text-sm font-semibold">HabitaLibre</p>
              <p className="text-[11px] text-slate-400">
                Hipoteca exprés · VIS · VIP · BIESS
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#como-funciona" className="hover:text-white">
              Cómo funciona
            </a>
            <a href="#beneficios" className="hover:text-white">
              Beneficios
            </a>
            <button
              onClick={handleStart}
              className="px-4 py-2 rounded-full bg-teal-500 text-slate-950 text-xs font-semibold hover:bg-teal-400 transition"
            >
              Iniciar simulación
            </button>
          </nav>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left Text */}
          <div className="space-y-6">
            <p className="text-teal-300 text-xs tracking-[0.25em] font-semibold uppercase">
              ● Precalificación sin afectar tu buró
            </p>

            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1]">
              Tu camino fácil a la{" "}
              <span className="text-teal-300">vivienda propia 🏡</span>
            </h1>

            <p className="text-slate-400 text-base md:text-lg max-w-md">
              Descubre en menos de 2 minutos cuánto puedes comprar hoy y con
              qué tipo de crédito: VIS, VIP, BIESS o banca privada. Sin filas,
              sin papeles y sin afectar tu historial crediticio.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-300 hover:to-blue-400 text-slate-950 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-teal-500/30 transition"
              >
                Simular ahora
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <a
                href="#como-funciona"
                className="px-6 py-3 border border-slate-600/80 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900/60 transition"
              >
                Ver ejemplo de resultado
              </a>
            </div>

            {/* Small badges */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-slate-400 pt-2">
              <span>● Datos cifrados</span>
              <span>● Enfoque VIS / VIP / BIESS</span>
              <span>● Asesoría sin costo</span>
            </div>
          </div>

                   {/* Right Result Card mejorada */}
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

            {/* Capacidad + cuota */}
            <div className="mb-5">
              <p className="text-slate-400 text-xs mb-1">
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
                <p className="text-slate-100 font-semibold text-sm">8,75%*</p>
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

            {/* Tip de valor */}
            <div className="mb-5 bg-slate-900 border border-slate-700/70 rounded-2xl p-3 flex gap-2 items-start">
              <div className="mt-0.5 h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center text-[13px] text-emerald-300">
                i
              </div>
              <div className="text-[11px] leading-snug text-slate-200">
                <span className="font-semibold text-emerald-300">
                  Ejemplo:
                </span>{" "}
                si reduces tus otras deudas en{" "}
                <span className="font-semibold">$ 150/mes</span>, tu capacidad
                podría subir hasta aprox.{" "}
                <span className="font-semibold">$ 112.000</span>. En el reporte
                real te mostramos estos escenarios con tus propios datos.
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
              *Tasa y condiciones referenciales. Tu resultado real se calcula
              con tus datos y puede variar según entidad financiera, producto y
              regulación vigente en Ecuador.
            </p>
          </div>

      {/* ================= ¿CÓMO FUNCIONA? – WORLD CLASS ================= */}
      <section
        id="como-funciona"
        className="w-full max-w-6xl mx-auto px-6 pb-20"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-10">
          {/* Texto principal */}
          <div className="md:w-2/5">
            <h2 className="text-3xl font-bold mb-3">
              ¿Cómo funciona HabitaLibre?
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              No es un simulador genérico. Es una{" "}
              <span className="text-teal-300 font-medium">
                pre–evaluación hipotecaria
              </span>{" "}
              pensada para el contexto real de Ecuador, que te orienta a la
              ruta más viable según tu perfil.
            </p>
          </div>

          {/* Timeline de 4 pasos */}
          <div className="md:w-3/5 space-y-6">
            {/* Paso 1 */}
            <div className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div className="w-px flex-1 bg-slate-700/60 mt-1" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">
                  Completa la simulación en menos de 2 minutos
                </p>
                <p className="text-sm text-slate-400">
                  Te pedimos solo lo esencial: ingresos, deudas aproximadas,
                  tipo de vivienda que buscas y si aplicas a VIS/VIP o BIESS.
                  Sin papeleo, sin claves bancarias.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-600 text-xs flex items-center justify-center font-bold">
                  2
                </div>
                <div className="w-px flex-1 bg-slate-700/60 mt-1" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">
                  Calculamos tu capacidad y tipo de crédito ideal
                </p>
                <p className="text-sm text-slate-400">
                  Nuestro motor estima cuánto podrías comprar, tu cuota
                  referencial y qué tipo de crédito tiene más sentido:
                  <span className="text-slate-200 font-medium">
                    {" "}
                    VIS, VIP, BIESS o banca privada
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-600 text-xs flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">
                  Recibes un reporte educativo claro
                </p>
                <p className="text-sm text-slate-400">
                  Te enviamos un PDF detallado con explicación de cada métrica,
                  stress test de tasa y un plan de acción para mejorar tus
                  probabilidades de aprobación.
                </p>
              </div>
            </div>

            {/* Paso 4 – CTA suave */}
            <div className="mt-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex gap-3 items-start">
              <CheckCircleIcon className="w-6 h-6 text-teal-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">
                  Si quieres avanzar, no te dejamos solo
                </p>
                <p className="text-sm text-slate-400">
                  Un asesor de HabitaLibre puede ayudarte a preparar tu carpeta,
                  comparar opciones bancarias y acompañarte hasta la firma de
                  la hipoteca — sin costo para ti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BENEFICIOS – WORLD CLASS ================= */}
      <section
        id="beneficios"
        className="w-full max-w-6xl mx-auto px-6 pb-24"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Beneficios de simular con HabitaLibre
            </h2>
            <p className="text-sm md:text-base text-slate-400 max-w-xl">
              Más que un número: te damos contexto, estrategia y claridad para
              que tomes decisiones inteligentes sobre tu vivienda.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Beneficio 1 */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-teal-500/70 hover:-translate-y-1 transition-all rounded-2xl p-6 flex flex-col gap-3">
            <ChartBarIcon className="w-8 h-8 text-teal-400" />
            <h3 className="text-lg font-semibold">Comparación inteligente</h3>
            <p className="text-sm text-slate-400">
              No eres un formulario más. Analizamos tu perfil y te orientamos a
              la alternativa que realmente tiene sentido para ti, no solo a lo
              que un banco quiere colocar.
            </p>
          </div>

          {/* Beneficio 2 */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-teal-500/70 hover:-translate-y-1 transition-all rounded-2xl p-6 flex flex-col gap-3">
            <ShieldCheckIcon className="w-8 h-8 text-teal-400" />
            <h3 className="text-lg font-semibold">Sin afectar tu buró</h3>
            <p className="text-sm text-slate-400">
              Trabajamos con datos declarativos para darte una primera lectura
              sin dejar huella en tu historial crediticio. Tú decides cuándo
              llevar esto a una preaprobación formal.
            </p>
          </div>

          {/* Beneficio 3 */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-teal-500/70 hover:-translate-y-1 transition-all rounded-2xl p-6 flex flex-col gap-3">
            <UserGroupIcon className="w-8 h-8 text-teal-400" />
            <h3 className="text-lg font-semibold">Acompañamiento humano</h3>
            <p className="text-sm text-slate-400">
              Detrás del simulador hay un equipo que te acompaña en el proceso,
              con lenguaje claro, sin letras pequeñas y con experiencia real en
              créditos VIS, VIP, BIESS y banca privada.
            </p>
          </div>
        </div>

        {/* Bonus mini-beneficio alineado a ahorro */}
        <div className="mt-8 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-sm">
          <BanknotesIcon className="w-6 h-6 text-teal-400" />
          <p className="text-slate-300">
            Además, te mostramos el impacto de tasa, plazo y entrada en tu cuota
            final para que entiendas{" "}
            <span className="font-semibold text-white">
              cuánto estás realmente pagando por tu hipoteca
            </span>
            , antes de firmar nada.
          </p>
        </div>
      </section>
    </div>
  );
}
