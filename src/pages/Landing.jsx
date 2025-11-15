// src/components/HeroHabitaLibre.jsx
import React from "react";

export default function HeroHabitaLibre() {
  // Datos de ejemplo para la card de resultado
  const preview = {
    capacidad: 98500,
    cuota: 480,
    producto: "VIS / VIP",
    plazo: "20 años",
    tiempo: "< 2 min",
    seguridad: "Alta",
    probAprob: 0.78, // 0 - 1
  };

  const formatMoney = (n) =>
    new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const probWidth = Math.round(Math.min(1, Math.max(0, preview.probAprob)) * 100);

  const handleSimularClick = () => {
    // Navega a tu simulador actual
    window.location.hash = "#/simulacion";
  };

  const handleEjemploClick = () => {
    // Si tienes un ancla a la sección de ejemplo, cámbialo
    window.location.hash = "#/ejemplo-resultado";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Fondo degradado */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900" />
        <div className="absolute -left-40 top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute right-[-120px] top-40 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
      </div>

      {/* Header sticky */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/90 text-xs font-semibold">
              HL
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                HabitaLibre
              </p>
              <p className="text-[11px] text-slate-400">
                Hipoteca exprés · VIS · VIP · BIESS
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("como-funciona");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-white"
            >
              Cómo funciona
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("beneficios");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-white"
            >
              Beneficios
            </button>
            <button
              type="button"
              onClick={handleSimularClick}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-500/40 transition hover:bg-indigo-400"
            >
              Iniciar simulación
              <span className="text-base">⚡</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-10 md:px-6 md:pt-16 lg:flex-row lg:items-center lg:gap-14 lg:px-8">
        {/* Columna izquierda: texto + CTAs */}
        <section className="flex-1 space-y-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-300">
            Precalificación sin afectar tu buró
          </p>

          <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-[44px]">
            Tu camino fácil a la vivienda propia{" "}
            <span className="inline-block align-middle">🏡</span>
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Descubre en menos de <strong>2 minutos</strong> cuánto puedes
            comprar hoy, con qué tipo de crédito{" "}
            <span className="whitespace-nowrap">VIS / VIP / BIESS</span> o
            banca privada, sin filas, sin papeles y{" "}
            <strong>sin afectar tu historial crediticio.</strong>
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSimularClick}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_45px_rgba(79,70,229,0.55)] transition hover:-translate-y-[1px] hover:bg-indigo-400"
            >
              Simular ahora
              <span className="text-base">→</span>
            </button>

            <button
              type="button"
              onClick={handleEjemploClick}
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-300 underline-offset-4 hover:text-slate-50 hover:underline"
            >
              Ver ejemplo de resultado
              <span className="text-lg">📄</span>
            </button>
          </div>

          {/* Microcopy anti-miedo */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="text-xs">⏱</span> Toma menos de 2 minutos
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-xs">🔒</span> No pedimos claves bancarias
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-xs">🧮</span> Enfoque VIS / VIP / BIESS
            </span>
          </div>
        </section>

        {/* Columna derecha: Card de resultado */}
        <section className="flex-1">
          <div className="relative mx-auto max-w-md">
            {/* Glow detrás */}
            <div className="absolute inset-0 -z-10 translate-y-4 scale-110 rounded-[32px] bg-indigo-500/40 blur-3xl" />

            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 px-5 py-6 shadow-[0_20px_80px_rgba(15,23,42,0.85)] md:px-7 md:py-7">
              {/* Header chip */}
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Vista previa de un resultado
                  </p>
                  <p className="text-xs text-slate-400">
                    Perfil VIS / VIP simulado
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                  No afecta tu buró
                </span>
              </div>

              {/* Capacidad estimada */}
              <div className="mb-4">
                <p className="text-xs text-slate-400">Capacidad estimada</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight md:text-[32px]">
                  {formatMoney(preview.capacidad)}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  según tus ingresos y deudas declarados.
                </p>
              </div>

              {/* Chips principales */}
              <div className="mb-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3">
                  <p className="text-[11px] text-slate-400">Cuota estimada</p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatMoney(preview.cuota)}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      / mes
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Plazo {preview.plazo} · tasa ref. simulada
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3">
                  <p className="text-[11px] text-slate-400">Producto tentativo</p>
                  <p className="mt-1 text-sm font-semibold">
                    {preview.producto}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Ajustable según tu perfil final.
                  </p>
                </div>
              </div>

              {/* Métricas rápidas */}
              <div className="mb-4 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                <div className="rounded-xl bg-slate-900/60 px-3 py-2">
                  <p className="text-[10px] text-slate-400">Familias simuladas</p>
                  <p className="mt-0.5 font-semibold">+1.000</p>
                </div>
                <div className="rounded-xl bg-slate-900/60 px-3 py-2">
                  <p className="text-[10px] text-slate-400">Tiempo estimado</p>
                  <p className="mt-0.5 font-semibold">{preview.tiempo}</p>
                </div>
                <div className="rounded-xl bg-slate-900/60 px-3 py-2">
                  <p className="text-[10px] text-slate-400">Seguridad</p>
                  <p className="mt-0.5 font-semibold">AES-256</p>
                </div>
              </div>

              {/* Barra de probabilidad de aprobación */}
              <div className="mb-5">
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Probabilidad de aprobación estimada</span>
                  <span className="font-semibold">
                    {Math.round(preview.probAprob * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-emerald-400"
                    style={{ width: `${probWidth}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Basado en LTV, DTI y nivel de entrada declarados. Solo
                  referencial.
                </p>
              </div>

              {/* CTA dentro de la card */}
              <button
                type="button"
                onClick={handleSimularClick}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_35px_rgba(79,70,229,0.7)] transition hover:bg-indigo-400 hover:shadow-[0_16px_45px_rgba(79,70,229,0.9)]"
              >
                Ver mi capacidad real
                <span className="text-base">➡️</span>
              </button>

              <p className="mt-3 text-center text-[10px] text-slate-500">
                Este es un ejemplo ilustrativo. Al simular, calculamos tu
                resultado real con tus datos y distintos escenarios de tasa /
                plazo.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Anclas para scroll suave (solo estructuras, puedes rediseñarlas luego) */}
      <section
        id="como-funciona"
        className="mx-auto max-w-6xl px-4 pb-16 md:px-6 lg:px-8"
      >
        {/* Aquí luego puedes pegar tu sección real de “Cómo funciona” */}
      </section>

      <section
        id="beneficios"
        className="mx-auto max-w-6xl px-4 pb-16 md:px-6 lg:px-8"
      >
        {/* Aquí luego tus tarjetas de beneficios */}
      </section>
    </div>
  );
}
