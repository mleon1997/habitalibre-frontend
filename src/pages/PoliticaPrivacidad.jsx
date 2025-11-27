// src/pages/PoliticaPrivacidad.jsx
import React from "react";

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col pb-16">
      {/* TOP BAR */}
      <header className="w-full border-b border-slate-900/70 bg-slate-950/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <a
            href="#/"
            className="text-slate-100 font-semibold tracking-tight text-lg hover:text-white transition"
          >
            HabitaLibre
          </a>
          <span className="text-[11px] text-slate-500">
            Centro de confianza · Datos personales
          </span>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
          {/* CARD */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 shadow-[0_24px_80px_rgba(15,23,42,0.9)] px-5 py-6 md:px-10 md:py-10 space-y-8">
            {/* BADGE + TITLE */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-medium text-emerald-300 tracking-[0.14em] uppercase">
                  Centro de confianza HabitaLibre
                </span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
                  Política de Privacidad – HabitaLibre
                </h1>
                <p className="text-[11px] text-slate-400 mt-1">
                  Última actualización: 27 de noviembre de 2025
                </p>
              </div>

              <p className="text-sm md:text-[15px] leading-relaxed text-slate-200">
                HabitaLibre (“nosotros”, “la plataforma”, “HabitaLibre”) es una
                herramienta digital de precalificación hipotecaria que permite
                analizar tu perfil crediticio de manera rápida y segura para
                facilitar el acceso a vivienda en Ecuador. La protección de tus
                datos personales es una prioridad para nosotros.
              </p>
            </div>

            {/* 1. RESPONSABLE */}
            <section className="space-y-2">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                1. Responsable del Tratamiento de Datos
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                <span className="font-semibold">HabitaLibre</span>
                <br />
                Correo de contacto:{" "}
                <span className="font-semibold">hola@habitalibre.com</span>
                <br />
                <span className="text-slate-400 text-[13px]">
                  (Emprendimiento digital en proceso de formalización jurídica)
                </span>
              </p>
            </section>

            {/* 2. DATOS QUE RECOPILAMOS */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                2. Datos que recopilamos
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Recopilamos la información necesaria para ofrecerte el servicio:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-[15px] text-slate-200">
                <li>Nombre, email, teléfono y ciudad.</li>
                <li>
                  Datos del simulador como ingresos, deudas y relación con el
                  IESS.
                </li>
                <li>
                  Resultados generados por la plataforma: HL-Score®, productos
                  compatibles, escenarios estimados, etc.
                </li>
                <li>
                  Datos técnicos como dirección IP, tipo de dispositivo,
                  navegador y cookies esenciales de sesión.
                </li>
              </ul>
            </section>

            {/* 3. PARA QUÉ USAMOS TU INFORMACIÓN */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                3. Para qué usamos tu información
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Tratamos tus datos personales para:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-[15px] text-slate-200">
                <li>
                  Calcular tu HL-Score® y mostrarte escenarios de crédito
                  personalizados.
                </li>
                <li>
                  Contactarte para brindarte tu resultado y explicarte tus
                  opciones financieras.
                </li>
                <li>
                  Compartir tu información con bancos, cooperativas o
                  desarrolladores inmobiliarios aliados, únicamente si tú lo
                  autorizas.
                </li>
                <li>Mejorar la precisión y experiencia de la plataforma.</li>
                <li>
                  Garantizar seguridad, prevención de fraude y estabilidad
                  operativa.
                </li>
              </ul>
            </section>

            {/* 4. DERECHOS LOPDP */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                4. Derechos de los titulares según la LOPDP
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Como titular de datos personales tienes derecho a:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-[15px] text-slate-200">
                <li>Acceder a tus datos personales.</li>
                <li>Solicitar la rectificación o actualización de tu datos.</li>
                <li>Solicitar su eliminación cuando sea procedente.</li>
                <li>Revocar tu consentimiento para el tratamiento.</li>
                <li>Solicitar la portabilidad de tus datos.</li>
              </ul>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Para ejercer cualquiera de estos derechos, puedes escribirnos a{" "}
                <span className="font-semibold">hola@habitalibre.com</span>.
              </p>
            </section>

            {/* 5. CONTACTO / CIERRE */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                5. Contacto
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Si tienes preguntas sobre esta política o sobre cómo manejamos
                tus datos personales, escríbenos a{" "}
                <span className="font-semibold">hola@habitalibre.com</span>.  
                Estamos construyendo HabitaLibre para que puedas tomar
                decisiones informadas sobre tu vivienda con la máxima
                transparencia y seguridad.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
