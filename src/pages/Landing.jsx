// src/pages/Landing.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  BoltIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: i * 0.08,
    },
  }),
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Landing({ onStart }) {
  const scrollToHow = () => {
    const el = document.getElementById("como-funciona");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToBenefits = () => {
    const el = document.getElementById("beneficios");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Nav */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 shadow-lg shadow-indigo-500/40 flex items-center justify-center text-xs font-semibold">
              HL
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

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <button
              onClick={scrollToHow}
              className="text-slate-300 hover:text-white transition"
            >
              Cómo funciona
            </button>
            <button
              onClick={scrollToBenefits}
              className="text-slate-300 hover:text-white transition"
            >
              Beneficios
            </button>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-400 transition"
            >
              Iniciar simulación
              <BoltIcon className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <main className="mx-auto max-w-6xl px-4 pt-10 pb-16">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left - copy emocional */}
          <div>
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-300 mb-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Precalificación sin afectar tu buró
            </motion.p>

            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              Tu camino claro y fácil <br className="hidden sm:block" />
              a la vivienda propia 🏡
            </motion.h1>

            <motion.p
              className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
            >
              Deja de adivinar cuánto puedes comprar. En menos de 2 minutos
              te mostramos tu capacidad real, tu cuota estimada y el tipo
              de crédito que tiene más sentido para ti: VIS, VIP, BIESS o banca
              privada. Sin filas, sin papeles y sin miedo a “manchar” tu buró.
            </motion.p>

            <motion.div
              className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <button
                onClick={onStart}
                className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(79,70,229,0.6)] hover:bg-indigo-400 transition"
              >
                Simular ahora
              </button>

              <button
                type="button"
                onClick={scrollToHow}
                className="inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-100 hover:border-slate-500 hover:bg-slate-900 transition"
              >
                Ver cómo funciona
              </button>
            </motion.div>

            <motion.div
              className="mt-6 flex flex-wrap gap-4 text-[11px] text-slate-400"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              <div className="inline-flex items-center gap-1.5">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
                Datos cifrados AES-256
              </div>
              <div className="inline-flex items-center gap-1.5">
                <SparklesIcon className="h-4 w-4 text-indigo-300" />
                Recomendación VIS / VIP / BIESS
              </div>
              <div className="inline-flex items-center gap-1.5">
                <UserGroupIcon className="h-4 w-4 text-sky-300" />
                Acompañamiento humano sin costo
              </div>
            </motion.div>
          </div>

          {/* Right - card simulación previa */}
          <motion.div
            className="relative"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0_0,#4f46e5_0,transparent_55%),radial-gradient(circle_at_100%_0,#22c55e_0,transparent_55%)] opacity-70" />
            <div className="rounded-3xl bg-slate-900/80 border border-slate-700/60 px-6 py-5 shadow-[0_24px_80px_rgba(15,23,42,1)] max-w-md ml-auto">
              <p className="text-xs font-semibold text-slate-300 tracking-[0.18em] uppercase">
                Vista previa de un resultado
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Perfil VIS / VIP simulado
              </p>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">Capacidad estimada</p>
                  <p className="text-3xl font-semibold text-white">
                    $98,500
                  </p>
                  <p className="text-[11px] text-slate-500">
                    según tus ingresos y deudas
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 border border-emerald-500/40">
                  No afecta tu buró
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-slate-900/80 border border-slate-700/80 px-3 py-3">
                  <p className="text-slate-400">Cuota estimada</p>
                  <p className="mt-1 text-sm font-semibold text-slate-50">
                    $480 / mes
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Plazo 20 años · tasa ref.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-900/80 border border-slate-700/80 px-3 py-3">
                  <p className="text-slate-400">Producto tentativo</p>
                  <p className="mt-1 text-sm font-semibold text-slate-50">
                    VIS / VIP
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Ajustable según tu perfil real.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-[11px] text-slate-400">
                <div>
                  <p className="text-slate-500">Familias simuladas</p>
                  <p className="font-semibold text-slate-100">+1,000</p>
                </div>
                <div>
                  <p className="text-slate-500">Tiempo estimado</p>
                  <p className="font-semibold text-slate-100">&lt; 2 min</p>
                </div>
                <div>
                  <p className="text-slate-500">Seguridad</p>
                  <p className="font-semibold text-slate-100">AES-256</p>
                </div>
              </div>

              <button
                onClick={onStart}
                className="mt-5 w-full rounded-full bg-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/60 hover:bg-indigo-400 transition"
              >
                Ver mi capacidad real
              </button>

              <p className="mt-3 text-[10px] leading-snug text-slate-500">
                Este es un ejemplo ilustrativo. Al simular, calculamos tu
                resultado real con tus datos y diferentes escenarios de tasa /
                plazo.
              </p>
            </div>
          </motion.div>
        </section>

        {/* =================== CÓMO FUNCIONA =================== */}
        <section id="como-funciona" className="mt-20 md:mt-24">
          <motion.h2
            className="text-2xl md:text-3xl font-semibold text-slate-50"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
          >
            ¿Cómo funciona HabitaLibre?
          </motion.h2>

          <motion.p
            className="mt-3 text-sm md:text-base text-slate-300 max-w-2xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            custom={1}
          >
            Diseñamos el proceso para que, en vez de sentir ansiedad,
            sientas claridad y control. Es como tener a un analista bancario
            de tu lado, pero sin papeleo ni letra pequeña.
          </motion.p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[
              {
                title: "1. Simulas sin riesgo y sin claves bancarias.",
                text: "Te pedimos solo lo esencial: ingresos, deudas, aportes IESS y entrada disponible. No conectamos con tus cuentas ni afectamos tu historial.",
                Icon: BoltIcon,
              },
              {
                title: "2. Analizamos tu perfil como lo haría un banco.",
                text: "Calculamos capacidad de pago, LTV, DTI, stress de cuota y escenarios de tasa / plazo con la lógica de un analista humano.",
                Icon: ChartBarIcon,
              },
              {
                title: "3. Te mostramos tu mejor ruta hipotecaria.",
                text: "VIS, VIP, BIESS o banca privada. Te decimos qué hace más sentido para ti hoy, con montos y cuotas que puedes sostener.",
                Icon: SparklesIcon,
              },
              {
                title: "4. Recibes tu reporte premium listo para negociar.",
                text: "Un PDF world-class con explicación de cada métrica, tabla de amortización y plan de mejora. Perfecto para sentarte frente al banco con argumentos.",
                Icon: DocumentChartBarIcon,
              },
              {
                title: "5. Si quieres, te acompañamos hasta la firma.",
                text: "Un asesor HabitaLibre te guía sin costo desde la simulación hasta que tengas las llaves en la mano. Tú decides hasta dónde quieres llegar.",
                Icon: UserGroupIcon,
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i * 0.3}
                className="flex gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-4 md:px-5 md:py-5"
              >
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-400/40 text-indigo-300 shrink-0">
                  <step.Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs md:text-sm text-slate-300">
                    {step.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* =================== BENEFICIOS =================== */}
        <section id="beneficios" className="mt-20 md:mt-24 pb-4">
          <motion.h2
            className="text-2xl md:text-3xl font-semibold text-slate-50"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
          >
            Beneficios de simular con HabitaLibre
          </motion.h2>

          <motion.p
            className="mt-3 text-sm md:text-base text-slate-300 max-w-2xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            custom={1}
          >
            No eres un número en una fila. Eres una familia, un plan, un
            proyecto de vida. Nuestro trabajo es darte información tan clara
            que puedas dormir tranquilo con la decisión que tomes.
          </motion.p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Claridad inmediata y accionable",
                text: "En vez de un simple “aprobado / rechazado” recibes un análisis que te explica el porqué y qué puedes mejorar.",
                Icon: DocumentChartBarIcon,
              },
              {
                title: "Recomendación honesta de producto",
                text: "VIS, VIP, BIESS o banca privada. No vendemos créditos, te mostramos la ruta que realmente te conviene.",
                Icon: SparklesIcon,
              },
              {
                title: "Seguridad nivel bancario",
                text: "Cifrado AES-256, servidores seguros y cero venta de datos. Tu información es tuya.",
                Icon: ShieldCheckIcon,
              },
              {
                title: "Reporte world-class para negociar",
                text: "Llega al banco con un reporte sólido, profesional y visualmente claro. Cambia la conversación.",
                Icon: ChartBarIcon,
              },
              {
                title: "Acompañamiento humano real",
                text: "Un equipo que te habla claro, sin letras pequeñas y sin empujarte a un crédito que no puedes pagar.",
                Icon: UserGroupIcon,
              },
              {
                title: "Todo en menos de 2 minutos",
                text: "Interfaz diseñada para que la completes sin esfuerzo, incluso desde el celular, sin pedirte documentos.",
                Icon: BoltIcon,
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i * 0.25}
                className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 md:px-5 md:py-5 shadow-[0_16px_40px_rgba(15,23,42,0.75)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-400/5 pointer-events-none" />
                <div className="relative flex items-start gap-3">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-700 text-indigo-300 shrink-0">
                    <card.Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-50">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-xs md:text-sm text-slate-300">
                      {card.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
