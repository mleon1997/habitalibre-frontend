// src/components/HabitaLoader.jsx
import React from "react";

const DEFAULT_STEPS = {
  match: [
    "Analizando tu perfil",
    "Comparando precio y entrada",
    "Ordenando tus mejores viviendas",
  ],
  property: [
    "Cargando ficha del proyecto",
    "Preparando precio y métricas",
    "Ubicando detalles clave",
  ],
  route: [
    "Revisando precalificación",
    "Leyendo propiedad base",
    "Ordenando próximos pasos",
    "Preparando tu ruta hipotecaria",
  ],
  financing: [
    "Analizando precio",
    "Calculando entrada requerida",
    "Estimando monto a financiar",
    "Comparando ruta hipotecaria",
  ],
};

const COPY = {
  match: {
    eyebrow: "Match HabitaLibre",
    title: "Ordenando tus mejores opciones…",
    subtitle: "Estamos comparando precio, entrada y ruta estimada.",
  },
  property: {
    eyebrow: "Propiedad",
    title: "Preparando la ficha de esta propiedad…",
    subtitle: "Cargando precio, ubicación, entrada y lectura referencial.",
  },
  route: {
    eyebrow: "Ruta",
    title: "Construyendo tu camino a tu casa…",
    subtitle: "Organizando tus próximos pasos hacia tu vivienda.",
  },
  financing: {
    eyebrow: "Financiamiento",
    title: "Evaluando esta propiedad…",
    subtitle:
      "Combinando tu perfil, entrada disponible y precio de la vivienda.",
  },
};

function LoaderStyles() {
  return (
    <style>
      {`
        .hl-loader-wrap {
          width: 100%;
          color: rgba(248,250,252,0.96);
        }

        .hl-loader-card {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          padding: 18px;
          background: linear-gradient(180deg, rgba(15,23,42,0.94), rgba(7,16,36,0.78));
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 18px 60px rgba(0,0,0,0.28);
        }

        .hl-loader-card::before,
        .hl-skeleton::before {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: hl-shimmer 1.35s infinite;
          pointer-events: none;
        }

        .hl-loader-eyebrow {
          font-size: 12px;
          color: rgba(143,227,212,0.98);
          font-weight: 950;
          margin-bottom: 7px;
        }

        .hl-loader-title {
          margin: 0;
          font-size: 24px;
          line-height: 1.06;
          letter-spacing: -0.7px;
          font-weight: 980;
          color: rgba(248,250,252,0.98);
        }

        .hl-loader-subtitle {
          margin-top: 8px;
          font-size: 14px;
          line-height: 1.42;
          color: rgba(148,163,184,0.95);
          max-width: 620px;
        }

        .hl-loader-steps {
          margin-top: 16px;
          display: grid;
          gap: 10px;
        }

        .hl-loader-step {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 12px;
          border-radius: 18px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(226,232,240,0.92);
          font-size: 13px;
          font-weight: 850;
        }

        .hl-loader-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(45,212,191,0.95);
          box-shadow: 0 0 0 6px rgba(45,212,191,0.12);
          animation: hl-pulse 1.25s infinite ease-in-out;
          flex: 0 0 auto;
        }

        .hl-loader-step:nth-child(2) .hl-loader-dot { animation-delay: 0.16s; }
        .hl-loader-step:nth-child(3) .hl-loader-dot { animation-delay: 0.32s; }
        .hl-loader-step:nth-child(4) .hl-loader-dot { animation-delay: 0.48s; }

        .hl-skeleton {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          background: rgba(255,255,255,0.065);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .hl-skeleton-grid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .hl-skeleton-property {
          overflow: hidden;
          border-radius: 24px;
          background: rgba(15,23,42,0.76);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .hl-skeleton-property-img { height: 150px; border-radius: 0; }
        .hl-skeleton-property-body { padding: 14px; display: grid; gap: 10px; }
        .hl-skeleton-line-lg { height: 22px; width: 68%; }
        .hl-skeleton-line-md { height: 16px; width: 48%; }
        .hl-skeleton-line-sm { height: 13px; width: 30%; }
        .hl-skeleton-pill-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .hl-skeleton-pill { height: 28px; width: 78px; border-radius: 999px; }
        .hl-skeleton-mini-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
        .hl-skeleton-mini { height: 58px; }
        .hl-skeleton-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .hl-skeleton-button { height: 42px; border-radius: 16px; }

        .hl-loader-property-layout {
          display: grid;
          gap: 14px;
          margin-top: 16px;
        }

        .hl-loader-hero { height: 260px; border-radius: 28px; }
        .hl-loader-stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
        .hl-loader-stat { height: 74px; }
        .hl-loader-block { height: 150px; }
        .hl-loader-map { height: 260px; }

        .hl-loader-route-line {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .hl-loader-route-node {
          display: grid;
          place-items: center;
          gap: 8px;
          padding: 12px 8px;
          border-radius: 18px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 11px;
          color: rgba(148,163,184,0.95);
          font-weight: 850;
          text-align: center;
        }

        .hl-loader-route-node span:first-child {
          width: 13px;
          height: 13px;
          border-radius: 999px;
          background: rgba(45,212,191,0.95);
          box-shadow: 0 0 0 7px rgba(45,212,191,0.12);
        }

        @keyframes hl-shimmer {
          100% { transform: translateX(100%); }
        }

        @keyframes hl-pulse {
          0%, 100% { transform: scale(0.88); opacity: 0.66; }
          50% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 720px) {
          .hl-loader-card {
            padding: 14px;
            border-radius: 24px;
          }

          .hl-loader-title {
            font-size: 24px;
            line-height: 1.04;
          }

          .hl-loader-subtitle {
            font-size: 13.5px;
          }

          .hl-skeleton-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .hl-skeleton-property-img { height: 138px; }
          .hl-skeleton-mini-grid { grid-template-columns: 1fr; }
          .hl-skeleton-buttons { grid-template-columns: 1fr; }
          .hl-loader-hero { height: 220px; border-radius: 24px; }
          .hl-loader-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .hl-loader-map { height: 220px; }
          .hl-loader-route-line { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hl-loader-card::before,
          .hl-skeleton::before,
          .hl-loader-dot {
            animation: none;
          }
        }
      `}
    </style>
  );
}

function SkeletonPropertyCard() {
  return (
    <div className="hl-skeleton-property" aria-hidden="true">
      <div className="hl-skeleton hl-skeleton-property-img" />
      <div className="hl-skeleton-property-body">
        <div className="hl-skeleton hl-skeleton-line-lg" />
        <div className="hl-skeleton hl-skeleton-line-md" />
        <div className="hl-skeleton-pill-row">
          <div className="hl-skeleton hl-skeleton-pill" />
          <div className="hl-skeleton hl-skeleton-pill" />
          <div className="hl-skeleton hl-skeleton-pill" />
        </div>
        <div className="hl-skeleton-mini-grid">
          <div className="hl-skeleton hl-skeleton-mini" />
          <div className="hl-skeleton hl-skeleton-mini" />
          <div className="hl-skeleton hl-skeleton-mini" />
        </div>
        <div className="hl-skeleton-buttons">
          <div className="hl-skeleton hl-skeleton-button" />
          <div className="hl-skeleton hl-skeleton-button" />
        </div>
      </div>
    </div>
  );
}

function MatchLoader({ title, subtitle }) {
  return (
    <div className="hl-loader-card" role="status" aria-live="polite">
      <div className="hl-loader-eyebrow">Match HabitaLibre</div>
      <h2 className="hl-loader-title">{title}</h2>
      <div className="hl-loader-subtitle">{subtitle}</div>
      <div className="hl-skeleton-grid">
        <SkeletonPropertyCard />
        <SkeletonPropertyCard />
        <SkeletonPropertyCard />
        <SkeletonPropertyCard />
      </div>
    </div>
  );
}

function PropertyLoader({ title, subtitle }) {
  return (
    <div className="hl-loader-wrap" role="status" aria-live="polite">
      <div className="hl-loader-card">
        <div className="hl-loader-eyebrow">Propiedad</div>
        <h2 className="hl-loader-title">{title}</h2>
        <div className="hl-loader-subtitle">{subtitle}</div>
      </div>
      <div className="hl-loader-property-layout">
        <div className="hl-skeleton hl-loader-hero" />
        <div className="hl-loader-stat-grid">
          <div className="hl-skeleton hl-loader-stat" />
          <div className="hl-skeleton hl-loader-stat" />
          <div className="hl-skeleton hl-loader-stat" />
          <div className="hl-skeleton hl-loader-stat" />
        </div>
        <div className="hl-skeleton hl-loader-block" />
        <div className="hl-skeleton hl-loader-map" />
      </div>
    </div>
  );
}

function StepLoader({ variant, title, subtitle, steps }) {
  const copy = COPY[variant] || COPY.route;
  const finalSteps = steps?.length ? steps : DEFAULT_STEPS[variant] || DEFAULT_STEPS.route;

  return (
    <div className="hl-loader-card" role="status" aria-live="polite">
      <div className="hl-loader-eyebrow">{copy.eyebrow}</div>
      <h2 className="hl-loader-title">{title || copy.title}</h2>
      <div className="hl-loader-subtitle">{subtitle || copy.subtitle}</div>

      {variant === "route" ? (
        <div className="hl-loader-route-line" aria-hidden="true">
          <div className="hl-loader-route-node"><span /><span>Perfil</span></div>
          <div className="hl-loader-route-node"><span /><span>Match</span></div>
          <div className="hl-loader-route-node"><span /><span>Ruta</span></div>
          <div className="hl-loader-route-node"><span /><span>Docs</span></div>
        </div>
      ) : null}

      <div className="hl-loader-steps">
        {finalSteps.map((step) => (
          <div className="hl-loader-step" key={step}>
            <span className="hl-loader-dot" />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HabitaLoader({
  variant = "match",
  title,
  subtitle,
  steps,
}) {
  const copy = COPY[variant] || COPY.match;

  return (
    <div className="hl-loader-wrap">
      <LoaderStyles />

      {variant === "match" ? (
        <MatchLoader
          title={title || copy.title}
          subtitle={subtitle || copy.subtitle}
        />
      ) : null}

      {variant === "property" ? (
        <PropertyLoader
          title={title || copy.title}
          subtitle={subtitle || copy.subtitle}
        />
      ) : null}

      {variant === "route" || variant === "financing" ? (
        <StepLoader
          variant={variant}
          title={title}
          subtitle={subtitle}
          steps={steps}
        />
      ) : null}
    </div>
  );
}
