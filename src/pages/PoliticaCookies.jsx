// src/pages/PoliticaCookies.jsx
import React from "react";

export default function PoliticaCookies() {
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
            Centro de confianza · Cookies
          </span>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 shadow-[0_24px_80px_rgba(15,23,42,0.9)] px-5 py-6 md:px-10 md:py-10 space-y-10">
            {/* ENCABEZADO */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-medium text-emerald-300 tracking-[0.14em] uppercase">
                  Centro de confianza HabitaLibre
                </span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
                  Política de Cookies
                </h1>
                <p className="text-[11px] text-slate-400 mt-1">
                  Última actualización: 27 de noviembre de 2025
                </p>
              </div>

              <p className="text-sm md:text-[15px] leading-relaxed text-slate-200">
                En HabitaLibre queremos que tengas claro qué información se
                guarda en tu navegador cuando usas nuestro simulador y cómo la
                usamos. Esta Política de Cookies explica, de forma sencilla, qué
                son las cookies, qué tipos utilizamos y cómo puedes gestionarlas.
              </p>
            </div>

            {/* 1. QUE SON LAS COOKIES */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                1. ¿Qué son las cookies?
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Las cookies son pequeños archivos de texto que se almacenan en tu
                navegador cuando visitas un sitio web. Sirven para recordar
                ciertas preferencias, entender cómo navegas y hacer que la
                experiencia sea más rápida y fluida.
              </p>
            </section>

            {/* 2. TIPOS QUE USAMOS */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                2. Qué tipos de cookies utiliza HabitaLibre
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                En esta primera versión de la plataforma buscamos mantener el uso
                de cookies al mínimo necesario para que el simulador funcione
                bien y podamos mejorar el servicio. Podemos utilizar, en
                particular, las siguientes categorías:
              </p>

              <div className="space-y-2 text-sm md:text-[15px] text-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-100">
                    a) Cookies técnicas o necesarias
                  </h3>
                  <p>
                    Son esenciales para que el sitio y el simulador funcionen
                    correctamente. Por ejemplo, para recordar el paso en el que
                    te encuentras dentro del wizard, gestionar sesiones o
                    garantizar la seguridad básica del sitio. Sin estas cookies,
                    algunos servicios podrían no funcionar.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-100">
                    b) Cookies de preferencias
                  </h3>
                  <p>
                    Nos permiten recordar ciertas opciones que eliges (como la
                    ciudad o el tipo de simulación que usaste recientemente)
                    para que tu experiencia sea más cómoda cuando vuelvas.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-100">
                    c) Cookies de análisis o medición
                  </h3>
                  <p>
                    Sirven para entender mejor cómo se usa HabitaLibre: qué
                    pantallas se visitan, cuánto tiempo permanecen los usuarios y
                    qué mejoras podemos hacer. La información se analiza de forma
                    agregada y anónima; nos interesa mejorar el producto, no
                    seguir tu navegación individual.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-100">
                    d) Cookies de terceros
                  </h3>
                  <p>
                    En caso de utilizar herramientas de terceros (por ejemplo,
                    servicios de analítica o proveedores de infraestructura),
                    estos podrían establecer sus propias cookies. Siempre
                    buscaremos trabajar con proveedores que respeten estándares
                    adecuados de privacidad y protección de datos.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. PARA QUE LAS USAMOS */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                3. ¿Para qué usamos las cookies?
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                En términos generales, utilizamos cookies para:
              </p>
              <ul className="list-disc pl-5 text-sm md:text-[15px] text-slate-200 space-y-1.5">
                <li>Mantener el correcto funcionamiento del simulador.</li>
                <li>
                  Recordar algunos datos básicos de tu sesión mientras completas
                  el wizard.
                </li>
                <li>
                  Mejorar la estabilidad, rendimiento y seguridad del sitio.
                </li>
                <li>
                  Analizar de forma agregada el uso de la plataforma para tomar
                  decisiones de mejora del producto.
                </li>
              </ul>
            </section>

            {/* 4. COMO GESTIONARLAS */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                4. ¿Cómo puedes gestionar o desactivar las cookies?
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Puedes configurar tu navegador para que bloquee o elimine las
                cookies cuando quieras. Ten en cuenta que, si desactivas algunas
                cookies técnicas, es posible que ciertas partes de HabitaLibre no
                funcionen correctamente.
              </p>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Normalmente puedes encontrar estas opciones en el menú de
                configuración o privacidad de tu navegador. Algunos enlaces de
                referencia son:
              </p>
              <ul className="list-disc pl-5 text-sm md:text-[15px] text-slate-200 space-y-1.5">
                <li>Google Chrome – Configuración &gt; Privacidad y seguridad</li>
                <li>Mozilla Firefox – Opciones &gt; Privacidad y seguridad</li>
                <li>Safari – Preferencias &gt; Privacidad</li>
                <li>Microsoft Edge – Configuración &gt; Cookies y permisos</li>
              </ul>
            </section>

            {/* 5. RELACION CON PRIVACIDAD */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                5. Relación con la Política de Privacidad
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Las cookies pueden implicar el tratamiento de ciertos datos que,
                combinados, podrían considerarse datos personales (por ejemplo,
                una dirección IP o un identificador de sesión). Para entender
                cómo protegemos tus datos personales, cuáles son tus derechos y
                cómo ejercerlos, te invitamos a revisar nuestra{" "}
                <a
                  href="#/privacidad"
                  className="underline underline-offset-2 text-emerald-300 hover:text-emerald-200"
                >
                  Política de Privacidad
                </a>
                .
              </p>
            </section>

            {/* 6. ACTUALIZACIONES */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                6. Actualizaciones de esta Política
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Podemos actualizar esta Política de Cookies para reflejar cambios
                en la tecnología utilizada, en la normativa aplicable o en la
                forma en que operamos HabitaLibre. Publicaremos siempre la
                versión vigente y su fecha de actualización.
              </p>
            </section>

            {/* 7. CONTACTO */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                7. Contacto
              </h2>
              <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
                Si tienes dudas sobre el uso de cookies en HabitaLibre, puedes
                escribirnos a{" "}
                <strong>hola@habitalibre.com</strong>. Estamos aquí para
                ayudarte a entender cómo cuidamos tu información.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
