// src/components/Landing.jsx
import React, { useState } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  Timer,
  LineChart,
  Sparkles,
  Building2,
  HeartHandshake,
  Home,
  Stars,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Landing({ onStart }) {
  const goSimular = () => {
    if (typeof onStart === "function") onStart();
    else window.location.hash = "#/simular";
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <Header onStart={goSimular} />

      {/* HERO */}
      <section
        className="max-w-6xl mx-auto mt-8 mb-10 rounded-3xl px-6 py-14 shadow-[0_20px_60px_rgba(58,65,111,.15)]"
        style={{
          background:
            "linear-gradient(135deg, rgba(59,91,255,1) 0%, rgba(122,100,255,1) 100%)",
        }}
      >
        <div className="text-center text-white">
          <img
            src="/logo-hl.png"
            alt="HabitaLibre"
            className="mx-auto mb-6 drop-shadow-xl"
            style={{ width: 140, height: "auto" }}
          />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Tu camino fácil a la vivienda propia
          </h1>
          <p className="mt-3 text-lg/7 opacity-95">
            Hemos ayudado a <b>+1,000 familias</b> a encontrar el{" "}
            <b>mejor financiamiento</b> para su hogar.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={goSimular}
              className="px-5 py-3 rounded-2xl bg-white text-indigo-700 font-semibold hover:opacity-95 shadow-lg"
            >
              Simular ahora →
            </button>
            <a
              href="#como-funciona"
              className="px-5 py-3 rounded-2xl bg-white/10 text-white font-semibold hover:bg-white/15 border border-white/20"
            >
              Ver cómo funciona
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-10">
            <Metric
              icon={<Stars size={18} />}
              label="Familias precalificadas"
              value="+1,000"
            />
            <Metric icon={<Timer size={18} />} label="Tiempo promedio" value="< 2 min" />
            <Metric
              icon={<ShieldCheck size={18} />}
              label="Datos protegidos"
              value="AES-256"
            />
          </div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Pill icon={<ShieldCheck size={16} />}>Datos cifrados</Pill>
          <Pill icon={<CheckCircle2 size={16} />}>Proceso sin buró</Pill>
          <Pill icon={<Home size={16} />}>Enfoque VIS / VIP / BIESS</Pill>
          <Pill icon={<HeartHandshake size={16} />}>Asesoría sin costo</Pill>
        </div>
      </div>

      {/* POR QUÉ HL */}
      <section className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold">¿Por qué HabitaLibre?</h2>
        <p className="text-slate-600 mt-1">
          Entregamos un resultado claro, accionable y sin fricción para que avances hoy.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mt-6">
          <Card
            icon={<LineChart className="text-indigo-600" />}
            title="Resultado claro y accionable"
            text="Capacidad de pago, LTV, DTI y próximos pasos en un informe listo para compartir."
          />
          <Card
            icon={<Building2 className="text-indigo-600" />}
            title="Detectamos tu mejor ruta"
            text="Si calificas a VIS/VIP (primera vivienda, ecuatoriano) o BIESS por aportes IESS."
          />
          <Card
            icon={<ShieldCheck className="text-indigo-600" />}
            title="Privacidad ante todo"
            text="Sin consultar buró. Tus datos se usan solo para tu simulación y asesoría."
          />
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-6 mt-14">
        <h2 className="text-2xl font-bold">Cómo funciona</h2>
        <p className="text-slate-600 mt-1">
          3 pasos simples. Menos de 2 minutos.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mt-6">
          <Step
            n={1}
            title="Completa la simulación"
            text="Nacionalidad, ingresos, vivienda, perfil. Sin documentos."
          />
          <Step
            n={2}
            title="Recibe tu resultado"
            text="Te mostramos cuota, monto máximo y camino sugerido (VIS/VIP/BIESS/Privada)."
          />
          <Step
            n={3}
            title="Avanza con asesoría"
            text="Si quieres, te acompañamos con checklist y validaciones."
          />
        </div>
      </section>

      {/* CTA BLOQUE */}
      <section className="max-w-6xl mx-auto px-6 mt-14">
        <div className="rounded-2xl bg-white border p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-indigo-700 font-semibold text-sm flex items-center gap-2">
              <Sparkles size={16} />
              Hecho para decidir hoy
            </div>
            <h3 className="text-xl font-bold mt-1">
              Empieza ahora y recibe tu mejor camino de financiamiento en minutos
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              Informe descargable, privacidad cuidada y acompañamiento opcional.
            </p>
          </div>
          <button
            onClick={goSimular}
            className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:opacity-90"
          >
            Simular ahora →
          </button>
        </div>
      </section>

      {/* OPINIONES */}
      <section className="max-w-6xl mx-auto px-6 mt-14">
        <h2 className="text-2xl font-bold">Opiniones</h2>
        <p className="text-slate-600 mt-1">Lo que dicen familias que ya usaron HabitaLibre.</p>

        <div className="grid md:grid-cols-3 gap-5 mt-6">
          <Testi
            name="Familia Rojas"
            text="En 5 minutos entendimos cuánto podíamos comprar y qué opción nos convenía. Súper claro."
          />
          <Testi
            name="María y Diego"
            text="Nos orientaron hacia VIP y nos ahorró días de idas y vueltas."
          />
          <Testi
            name="Andrea"
            text="La privacidad era clave para mí. Me encantó que no consulten buró en la simulación."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-6 mt-14 mb-20">
        <h2 className="text-2xl font-bold">Preguntas frecuentes</h2>
        <div className="mt-4">
          <FAQ
            q="¿La simulación consulta mi buró?"
            a="No. Nuestra simulación no consulta buró ni afecta tu score. Si decides avanzar con una institución, ellos realizarán sus verificaciones."
          />
          <FAQ
            q="¿Puedo calificar a VIS/VIP?"
            a="Se orientan a ecuatorianos comprando primera vivienda y con topes de precio/ingreso. El simulador te indica automáticamente si encaja tu caso."
          />
          <FAQ
            q="¿Qué pasa con mis datos?"
            a="Se cifran en tránsito y en reposo (AES-256). Los usamos únicamente para calcular tu resultado y, si aceptas, brindarte asesoría."
          />
          <FAQ
            q="¿Cuánto cuesta?"
            a="La simulación es gratuita. Si deseas acompañamiento, también es sin costo."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ---------- Subcomponentes ---------- */

function Header({ onStart }) {
  return (
    <header className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-indigo-600/95 text-white flex items-center justify-center shadow-md">
          <Home size={18} />
        </div>
        <div>
          <div className="font-semibold">HabitaLibre</div>
          <div className="text-[11px] text-slate-500">
            Descubre cuánto puedes comprar en 2 minutos
          </div>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
        <a href="#beneficios" className="hover:text-slate-900">
          Beneficios
        </a>
        <a href="#como-funciona" className="hover:text-slate-900">
          Cómo funciona
        </a>
        <a href="#faq" className="hover:text-slate-900">
          FAQ
        </a>
        <button
          onClick={onStart}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:opacity-90"
        >
          Simular ahora
        </button>
      </nav>
    </header>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="bg-white/10 rounded-2xl p-3 border border-white/15 flex items-center justify-center gap-2">
      <div className="opacity-90">{icon}</div>
      <div className="text-sm">
        <div className="opacity-80">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}

function Pill({ children, icon }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-xl border px-3 py-2 text-sm">
      <span className="text-slate-700">{icon}</span>
      <span className="text-slate-700">{children}</span>
    </div>
  );
}

function Card({ icon, title, text }) {
  return (
    <div className="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
        {icon}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="text-sm text-slate-600 mt-1">{text}</p>
    </div>
  );
}

function Step({ n, title, text }) {
  return (
    <div className="bg-white rounded-2xl border p-6">
      <div className="flex items-center gap-2 text-indigo-700 font-semibold">
        <span className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center">
          {n}
        </span>
        Paso {n}
      </div>
      <div className="mt-2 font-semibold">{title}</div>
      <p className="text-sm text-slate-600 mt-1">{text}</p>
    </div>
  );
}

function Testi({ name, text }) {
  return (
    <div className="bg-white rounded-2xl border p-6">
      <div className="flex items-center gap-2 text-amber-500">
        <Stars size={18} />
        <Stars size={18} />
        <Stars size={18} />
        <Stars size={18} />
        <Stars size={18} />
      </div>
      <p className="text-slate-700 mt-3">{text}</p>
      <div className="text-sm text-slate-500 mt-2">— {name}</div>
    </div>
  );
}

/* FAQ con animación */
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border p-4 mb-2">
      <button
        className="w-full flex justify-between items-center text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium text-slate-800">{q}</span>
        <span className="text-slate-500">{open ? "–" : "+"}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="pt-2 text-sm text-slate-600">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-6 py-10 mt-10 text-center text-xs text-slate-500">
      © {new Date().getFullYear()} HabitaLibre ·{" "}
      <a className="underline" href="#/privacidad">
        Privacidad
      </a>{" "}
      ·{" "}
      <a className="underline" href="#/terminos">
        Términos
      </a>
    </footer>
  );
}
