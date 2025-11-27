// src/pages/TerminosUso.jsx
import React from "react";

export default function TerminosUso() {
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
            Centro de confianza · Términos de Uso
          </span>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
          {/* CARD */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 shadow-[0_24px_80px_rgba(15,23,42,0.9)] px-5 py-6 md:px-10 md:py-10 space-y-10">
            {/* BADGE + TITLE */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 border border-blue-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span className="text-[11px] font-medium text-blue-300 tracking-[0.14em] uppercase">
                  Centro de confianza HabitaLibre
                </span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
                  Términos de Uso
                </h1>
                <p className="text-[11px] text-slate-400 mt-1">
                  Última actualización: 27 de noviembre de 2025
                </p>
              </div>

              <p className="text-sm md:text-[15px] leading-relaxed text-slate-200">
                Bienvenido a HabitaLibre. Al usar nuestro simulador o ingresar tus 
                datos personales, aceptas estos Términos de Uso de forma previa y 
                consciente. Te recomendamos leerlos con atención ya que explican 
                las condiciones bajo las cuales accedes al servicio.
              </p>
            </div>

            {/* 1. DESCRIPCIÓN DEL SERVICIO */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                1. Naturaleza del servicio
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                HabitaLibre es una herramienta digital educativa y de orientación 
                financiera inicial. Los resultados del simulador son estimaciones 
                referenciales basadas en los datos proporcionados por el usuario, 
                y no constituyen:
              </p>
              <ul className="list-disc pl-5 text-sm md:text-[15px] text-slate-200 space-y-1.5">
                <li>una oferta formal de crédito,</li>
                <li>una aprobación hipotecaria,</li>
                <li>un compromiso por parte de entidades financieras,</li>
                <li>ni asesoría financiera, legal o tributaria personalizada.</li>
              </ul>
            </section>

            {/* 2. RESPONSABILIDAD SOBRE LA INFORMACIÓN */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                2. Responsabilidad sobre la información ingresada
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                La precisión de los resultados depende exclusivamente de la 
                veracidad, actualización y completitud de los datos que tú 
                proporcionas. Las decisiones basadas únicamente en las 
                estimaciones del simulador deben ser contrastadas con las políticas 
                y evaluaciones internas de cada institución financiera.
              </p>
            </section>

            {/* 3. RELACIÓN CON BANCOS Y TERCEROS */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                3. Relación con bancos, cooperativas y terceros
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                HabitaLibre no actúa en representación de ningún banco, 
                cooperativa o entidad financiera. Con tu consentimiento expreso, 
                podemos compartir tus datos únicamente con instituciones 
                financieras y desarrolladores inmobiliarios aliados para:
              </p>
              <ul className="list-disc pl-5 text-sm md:text-[15px] text-slate-200 space-y-1.5">
                <li>evaluación preliminar de tu perfil crediticio,</li>
                <li>envío de opciones hipotecarias compatibles,</li>
                <li>contacto por parte de los aliados autorizados.</li>
              </ul>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                La decisión final de aprobación o rechazo de un crédito depende 
                exclusivamente de cada institución financiera.
              </p>
            </section>

            {/* 4. USO PERMITIDO Y LIMITACIONES */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                4. Uso permitido y limitaciones
              </h2>
              <ul className="list-disc pl-5 text-sm md:text-[15px] text-slate-200 space-y-1.5">
                <li>El servicio está destinado a uso personal e informativo.</li>
                <li>
                  Está prohibido el uso automatizado, masivo, fraudulento o con 
                  fines ilícitos.
                </li>
                <li>
                  Se prohíbe reproducir, copiar o revender el servicio sin 
                  autorización escrita.
                </li>
                <li>
                  El algoritmo HL-Score® y el diseño de la plataforma son 
                  propiedad intelectual exclusiva de HabitaLibre.
                </li>
              </ul>
            </section>

            {/* 5. DISPONIBILIDAD DEL SERVICIO */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                5. Disponibilidad del servicio
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Nos esforzamos por mantener la plataforma operativa con la mayor 
                estabilidad posible. Sin embargo, no garantizamos disponibilidad 
                continua, ya que pueden existir mantenimientos, actualizaciones o 
                interrupciones técnicas.
              </p>
            </section>

            {/* 6. MENORES DE EDAD */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                6. Menores de edad
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                HabitaLibre no está dirigido a menores de 18 años. Si detectamos 
                un registro perteneciente a un menor, procederemos a eliminar la 
                información.
              </p>
            </section>

            {/* 7. MODIFICACIONES */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                7. Modificaciones
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Podemos actualizar estos Términos de Uso para reflejar cambios 
                normativos o mejoras del servicio. Publicaremos la versión vigente 
                y su fecha de actualización.
              </p>
            </section>

            {/* 8. CONTACTO */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                8. Contacto
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Si tienes preguntas sobre estos Términos de Uso o sobre el 
                funcionamiento de HabitaLibre, puedes escribirnos a{" "}
                <strong>hola@habitalibre.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
