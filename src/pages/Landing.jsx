// src/pages/Landing.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  BoltIcon,
  BanknotesIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

const containerStagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Landing({ onStart }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* ====== NAV BAR SIMPLE ====== */}
      <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-xs font-semibold">
              HL
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">HabitaLibre</span>
              <span className="text-[11px] text-slate-400">
                Hipoteca exprés · VIS · VIP · BIESS
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#como-funciona" className="hover:text-slate-50">
              Cómo funciona
            </a>
            <a href="#beneficios" className="hover:text-slate-50">
              Beneficios
            </a>
            <button
              onClick={onStart}
              className="rounded-full bg-blue-500 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_10px_40px_rgba(37,99,235,0.55)] hover:bg-blue-400 transition"
            >
              Iniciar simulación
            </button>
          </nav>
        </div>
      </header>

      {/* ====== HERO PRINCIPAL ====== */}
      <main className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-[-200px] -z-10 h-[500px] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)] opacity-80" />

        <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-10 md:flex-row md:px-6 md:pb-24 md:pt-16">
          {/* Columna izquierda */}
          <div className="flex flex-1 flex-col justify-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300">
              • Precalificación sin afectar tu buró
            </p>
            <h1 className="max-w-xl text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl md:text-[40px] md:leading-[1.05]">
              Tu camino fácil a la
              <br />
              vivienda propia 🏡
            </h1>

            <p className="mt-4 max-w-lg text-sm text-slate-300 md:text-[15px]">
              Descubre en menos de 2 minutos cuánto puedes comprar hoy y con qué
              tipo de crédito: VIS, VIP, BIESS o banca privada. Sin filas, sin
              papeles y sin afectar tu historial crediticio.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onStart}
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-slate-950 shadow-[0_18px_60px_rgba(16,185,129,0.55)] hover:bg-emerald-300 transition"
              >
                Simular ahora
                <span className="ml-1.5 text-base">→</span>
              </button>

              <button
                type="button"
                onClick={onStart}
                className="inline-flex items-center justify-center rounded-full border border-slate-600/70 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-400 hover:text-white transition"
              >
                Ver ejemplo de resultado
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Datos cifrados
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Enfoque VIS / VIP / BIESS
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                Asesoría sin costo
              </span>
            </div>
          </div>

          {/* Columna derecha: card de ejemplo */}
          <div className="flex flex-1 items-center justify-center md:justify-end">
            <div className="w-full max-w-md rounded-3xl border border-slate-800/70 bg-slate-900/80 p-4 shadow-[0_24px_90px_rgba(15,23,42,0.9)] backdrop-blur">
              <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Vista previa de un resultado</span>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  No afecta tu buró
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                Perfil VIS / VIP simulado
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Capacidad estimada
              </p>
              <p className="text-3xl font-semibold tracking-tight text-slate-50">
                $98,500
              </p>
              <p className="text-[11px] text-slate-500">
                según tus ingresos y deudas
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-900/90 p-3">
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-2">
                  <p className="text-[11px] text-slate-400">Cuota estimada</p>
                  <p className="text-[15px] font-semibold text-slate-50">
                    $480 / mes
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Plazo 20 años · tasa ref.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-2">
                  <p className="text-[11px] text-slate-400">Producto tentativo</p>
                  <p className="text-[15px] font-semibold text-slate-50">
                    VIS / VIP
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Ajustable según tu perfil real.
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-slate-400">
                <div>
                  <p className="text-slate-500">Familias simuladas</p>
                  <p className="font-semibold text-slate-100">+1,000</p>
                </div>
                <div>
                  <p className="text-slate-500">Tiempo estimado</p>
                  <p className="font-semibold text-slate-100">&lt; 2 min</p>
                </div>
                <div>
                  <p className="text-slate-500">Enfoque</p>
                  <p className="font-semibold text-slate-100">VIS / VIP / BIESS</p>
                </div>
              </div>

              <button
                onClick={onStart}
                className="mt-4 w-full rounded-full bg-blue-500 py-2 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(37,99,235,0.7)] hover:bg-blue-400 transition"
              >
                Ver mi capacidad real
              </button>

              <p className="mt-3 text-[10px] text-slate-500">
                Este es un ejemplo ilustrativo. Al simular, calculamos tu
                resultado real con tus datos y diferentes escenarios de tasa /
                plazo.
              </p>
            </div>
          </div>
        </section>

        {/* ====== CÓMO FUNCIONA (NUEVO) ====== */}
        <section
          id="como-funciona"
          className="mx-auto max-w-5xl px-4 pb-12 pt-2 md:px-6 md:pb-16"
        >
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)]"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-semibold text-slate-50 md:text-[26px]">
                ¿Cómo funciona HabitaLibre?
              </h2>
              <p className="mt-2 text-sm text-slate-300 md:text-[15px]">
                No eres un formulario más. En menos de 2 minutos te damos una
                lectura clara de cuánto podrías comprar hoy y con qué tipo de
                crédito, sin afectar tu buró.
              </p>

              <dl className="mt-6 space-y-5">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-xs font-semibold text-sky-300">
                    1
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-slate-100">
                      Completa la simulación en 4 pasos
                    </dt>
                    <dd className="text-sm text-slate-400">
                      Ingresas tus datos principales: ingreso, deudas, valor de
                      vivienda y tu situación laboral. No pedimos claves
                      bancarias ni documentación.
                    </dd>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-xs font-semibold text-emerald-300">
                    2
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-slate-100">
                      Calculamos tu capacidad y tipo de crédito
                    </dt>
                    <dd className="text-sm text-slate-400">
                      Nuestro motor de scoring estima tu capacidad de compra,
                      cuota objetivo y el producto más alineado (VIS, VIP,
                      BIESS o banca privada), con stress test de tasa incluido.
                    </dd>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-xs font-semibold text-violet-300">
                    3
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-slate-100">
                      Te acompañamos hasta la aprobación
                    </dt>
                    <dd className="text-sm text-slate-400">
                      Si el resultado te sirve, un asesor HabitaLibre te
                      contacta por WhatsApp, valida documentos y te ayuda a
                      negociar con la entidad que mejor calza con tu perfil.
                    </dd>
                  </div>
                </div>
              </dl>
            </motion.div>

            {/* mini panel lateral */}
            <motion.div
              variants={fadeUp}
              className="relative rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_18px_70px_rgba(15,23,42,0.8)]"
            >
              <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Tu ruta resumida</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
                  <ClockIcon className="h-3 w-3" />
                  &lt; 2 min
                </span>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <ShieldCheckIcon className="mt-0.5 h-5 w-5 text-emerald-400" />
                  <p className="text-slate-300">
                    <span className="font-semibold text-slate-50">
                      Sin impacto en tu buró:
                    </span>{" "}
                    simulación declarativa sin consultas a burós de crédito.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <ChartBarIcon className="mt-0.5 h-5 w-5 text-sky-400" />
                  <p className="text-slate-300">
                    Motor especializado en VIS / VIP / BIESS, no un simulador
                    genérico de banco.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <UserGroupIcon className="mt-0.5 h-5 w-5 text-violet-400" />
                  <p className="text-slate-300">
                    Equipo humano que revisa tu caso y te ayuda a tomar
                    decisiones, no solo una pantalla con números.
                  </p>
                </li>
              </ul>
              <p className="mt-4 text-[11px] text-slate-500">
                * HabitaLibre no reemplaza a las entidades financieras; te
                ayuda a llegar mejor preparado a ellas.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* ====== BENEFICIOS (NUEVO) ====== */}
        <section
          id="beneficios"
          className="mx-auto max-w-5xl px-4 pb-20 md:px-6 md:pb-24"
        >
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeUp} className="text-center">
              <h2 className="text-2xl font-semibold text-slate-50 md:text-[26px]">
                Beneficios de simular con HabitaLibre
              </h2>
              <p className="mt-2 text-sm text-slate-300 md:text-[15px]">
                Más que un simulador: una lectura honesta de dónde estás hoy y
                qué puedes hacer para llegar a tu vivienda propia.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-7 grid gap-5 md:grid-cols-3"
            >
              {/* Comparación inteligente */}
              <BenefitCard
                icon={BoltIcon}
                title="Comparación inteligente"
                body="No tienes que entrar a diez simuladores distintos. En un solo flujo vemos escenarios VIS, VIP, BIESS y banca privada según tu perfil."
                tag="Ahorra tiempo y confusión"
              />

              {/* Cuidado de tu buró */}
              <BenefitCard
                icon={ShieldCheckIcon}
                title="Cuidamos tu buró"
                body="Trabajamos sobre tus datos declarativos para una primera lectura. Solo si decides avanzar gestionamos el proceso con bancos."
                tag="Sin huellas innecesarias"
              />

              {/* Acompañamiento humano */}
              <BenefitCard
                icon={PhoneIcon}
                title="Acompañamiento humano"
                body="Detrás del resultado hay un equipo que te acompaña por WhatsApp, revisa documentos y te ayuda a negociar condiciones reales."
                tag="Sin letras pequeñas"
              />
            </motion.div>

            {/* Fila secundaria */}
            <motion.div
              variants={fadeUp}
              className="mt-6 grid gap-5 md:grid-cols-3"
            >
              <BenefitCardSimple
                icon={ChartBarIcon}
                title="Reporte descargable"
                body="Te llevas un PDF educativo con LTV, DTI, stress de tasa y plan de acción para presentar a tu banco o familia."
              />
              <BenefitCardSimple
                icon={BanknotesIcon}
                title="Visión realista"
                body="Te mostramos cifras que puedas sostener en el tiempo, no solo la cuota máxima que te aprobarían en el papel."
              />
              <BenefitCardSimple
                icon={UserGroupIcon}
                title="Pensado para Ecuador"
                body="Modelo construido específicamente para salarios, productos y normativas del mercado ecuatoriano."
              />
            </motion.div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

/* ====== COMPONENTES DE APOYO ====== */

function BenefitCard({ icon: Icon, title, body, tag }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.85)] transition hover:border-sky-500/60 hover:bg-slate-900/80">
      <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition group-hover:opacity-100">
        <div className="absolute -inset-x-8 -top-6 h-24 bg-gradient-to-r from-sky-500/20 via-emerald-400/15 to-blue-500/20" />
      </div>
      <div className="relative z-10">
        <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 text-sky-300 ring-1 ring-sky-500/30">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
          {body}
        </p>
        {tag && (
          <p className="mt-3 inline-flex rounded-full bg-slate-800/90 px-3 py-1 text-[11px] font-medium text-slate-200">
            {tag}
          </p>
        )}
      </div>
    </div>
  );
}

function BenefitCardSimple({ icon: Icon, title, body }) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 transition hover:border-slate-600 hover:bg-slate-900/70">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/70 text-slate-100">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">
        {body}
      </p>
    </div>
  );
}

function ClockIcon(props) {
  // Icono minimal para no importar todo Heroicons solo por esto
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="10"
        cy="10"
        r="7.5"
        className="stroke-current"
        strokeWidth="1.4"
      />
      <path
        d="M10 6.2v3.9l2.1 1.2"
        className="stroke-current"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
