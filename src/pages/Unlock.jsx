// src/pages/Unlock.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Route,
  ShieldCheck,
  FileText,
} from "lucide-react";

import HabitaShell from "../components/HabitaShell.jsx";
import { getCustomerToken } from "../lib/customerSession.js";

function Pill({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 12px",
        borderRadius: 999,
        background: "rgba(37,211,166,0.12)",
        border: "1px solid rgba(37,211,166,0.28)",
        color: "rgba(204,251,241,0.98)",
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      {children}
    </span>
  );
}

function UnlockItem({ icon, title, text }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 22,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "rgba(226,232,240,0.98)",
          fontSize: 15,
          fontWeight: 950,
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 14,
            background: "rgba(37,211,166,0.11)",
            border: "1px solid rgba(37,211,166,0.22)",
            color: "#25d3a6",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        {title}
      </div>

      <div
        style={{
          marginTop: 9,
          color: "rgba(148,163,184,0.95)",
          fontSize: 13.5,
          lineHeight: 1.45,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        height: 58,
        borderRadius: 20,
        border: "none",
        background:
          "linear-gradient(135deg, rgba(125,245,222,1), rgba(37,211,166,1))",
        color: "#052019",
        fontSize: 15,
        fontWeight: 950,
        cursor: "pointer",
        boxShadow: "0 18px 45px rgba(37,211,166,0.16)",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        height: 56,
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.13)",
        background: "rgba(255,255,255,0.045)",
        color: "white",
        fontSize: 15,
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function Unlock() {
  const navigate = useNavigate();
  const token = getCustomerToken?.();
  const isLoggedIn = !!token;

  function goBack() {
    navigate("/progreso");
  }

  function goLogin() {
    navigate("/login?returnTo=/progreso", {
      state: {
        returnTo: "/progreso",
        from: "unlock",
      },
    });
  }

  function goExplore() {
    navigate("/app?mode=journey&force=1");
  }

  return (
    <HabitaShell maxWidth={860}>
      <div style={{ paddingBottom: 32 }}>
        <button
          type="button"
          onClick={goBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "white",
            borderRadius: 999,
            padding: "10px 14px",
            cursor: "pointer",
            fontWeight: 850,
            marginBottom: 18,
          }}
        >
          <ArrowLeft size={15} />
          Volver
        </button>

        <section
          style={{
            padding: 24,
            borderRadius: 34,
            background:
              "radial-gradient(900px 420px at 20% 0%, rgba(37,211,166,0.16), transparent 58%), rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 22px 70px rgba(0,0,0,0.32)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 660 }}>
              <Pill>
                <Lock size={14} />
                Desbloquear resultado
              </Pill>

              <h1
                style={{
                  margin: "18px 0 0",
                  color: "rgba(226,232,240,0.98)",
                  fontSize: 44,
                  lineHeight: 1,
                  letterSpacing: -1.6,
                  fontWeight: 980,
                }}
              >
                Ver tu resultado real
              </h1>

              <p
                style={{
                  marginTop: 14,
                  color: "rgba(148,163,184,0.95)",
                  fontSize: 16,
                  lineHeight: 1.5,
                  maxWidth: 640,
                }}
              >
                Puedes explorar sin cuenta. Para guardar tu score, ver tu ruta
                exacta y retomar tu camino cuando quieras, inicia sesión o crea
                tu cuenta.
              </p>
            </div>

            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 26,
                background: "rgba(37,211,166,0.10)",
                border: "1px solid rgba(37,211,166,0.25)",
                color: "#25d3a6",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 0 40px rgba(37,211,166,0.16)",
              }}
            >
              <Lock size={30} />
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <UnlockItem
              icon={<ShieldCheck size={18} />}
              title="Score Hipotecario real"
              text="Tu resultado se guarda en la nube y puedes retomarlo sin volver a empezar."
            />

            <UnlockItem
              icon={<Route size={18} />}
              title="Tu ruta recomendada"
              text="VIS, VIP, BIESS o banca privada según tu perfil financiero y tu objetivo."
            />

            <UnlockItem
              icon={<FileText size={18} />}
              title="Checklist y próximos pasos"
              text="Acciones claras para mejorar tu aprobación y avanzar mejor preparado."
            />
          </div>

          <div
            style={{
              marginTop: 22,
              padding: 16,
              borderRadius: 24,
              background: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <CheckCircle2
                size={18}
                color="#25d3a6"
                style={{ flexShrink: 0, marginTop: 2 }}
              />

              <div>
                <div
                  style={{
                    color: "rgba(226,232,240,0.98)",
                    fontSize: 15,
                    fontWeight: 950,
                  }}
                >
                  Explorar sin cuenta sigue disponible
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color: "rgba(148,163,184,0.92)",
                    fontSize: 13.5,
                    lineHeight: 1.45,
                  }}
                >
                  Puedes seguir navegando y completar una simulación básica. Para
                  guardar tu progreso o ver el resultado completo, te pediremos
                  iniciar sesión.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {isLoggedIn ? (
              <PrimaryButton onClick={() => navigate("/progreso")}>
                Ver mi progreso
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={goLogin}>Entrar</PrimaryButton>
            )}

            <SecondaryButton onClick={goExplore}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                Seguir explorando sin cuenta
                <ArrowRight size={16} />
              </span>
            </SecondaryButton>
          </div>

          <div
            style={{
              marginTop: 14,
              color: "rgba(148,163,184,0.72)",
              fontSize: 12,
              lineHeight: 1.45,
              textAlign: "center",
            }}
          >
            HabitaLibre no consulta tu buró en esta simulación. Tu resultado es
            referencial y educativo.
          </div>
        </section>
      </div>
    </HabitaShell>
  );
}