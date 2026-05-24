// src/pages/AdminHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function Card({ title, description, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 22,
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.10)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))",
        color: "white",
        cursor: "pointer",
        boxShadow: "0 18px 55px rgba(0,0,0,0.22)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 22, lineHeight: 1.1 }}>{title}</h2>

          <p
            style={{
              margin: "10px 0 0",
              color: "rgba(203,213,225,0.86)",
              fontSize: 14,
              lineHeight: 1.45,
            }}
          >
            {description}
          </p>
        </div>

        {badge ? (
          <span
            style={{
              padding: "7px 10px",
              borderRadius: 999,
              background: "rgba(37,211,166,0.13)",
              border: "1px solid rgba(37,211,166,0.30)",
              color: "#7fffd4",
              fontSize: 12,
              fontWeight: 900,
              whiteSpace: "nowrap",
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <div
        style={{
          marginTop: 18,
          color: "#25d3a6",
          fontWeight: 900,
          fontSize: 14,
        }}
      >
        Abrir módulo →
      </div>
    </button>
  );
}

export default function AdminHome() {
  const nav = useNavigate();

  function handleLogout() {
    try {
      localStorage.removeItem("hl_admin_token");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("HL_TOKEN");
      localStorage.removeItem("hl_admin_email");
    } catch {}

    nav("/admin", { replace: true });
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(900px 600px at 20% 10%, rgba(37,211,166,0.10), transparent 55%), linear-gradient(180deg, #020617, #0f172a)",
        color: "white",
        fontFamily: "system-ui",
        padding: "34px 22px 100px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 24 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 18,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "rgba(148,163,184,0.95)",
                fontWeight: 950,
                fontSize: 16,
              }}
            >
              HabitaLibre Admin
            </div>

            <h1
              style={{
                margin: "8px 0 0",
                fontSize: 42,
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              Panel interno
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                color: "rgba(203,213,225,0.88)",
                fontSize: 16,
                lineHeight: 1.45,
                maxWidth: 760,
              }}
            >
              Administra leads, usuarios registrados y propiedades desde un solo lugar.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              padding: "12px 16px",
              borderRadius: 14,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </header>

        <section
          style={{
            padding: 18,
            borderRadius: 26,
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            <Card
              title="Leads Quick Win"
              description="Revisa los leads que llegan desde el landing de precalificación rápida, campañas y formularios web."
              badge="Comercial"
              onClick={() => nav("/admin/leads")}
            />

            <Card
              title="Usuarios registrados"
              description="Consulta usuarios de la app/web, estados de cuenta, simulaciones y actividad general."
              badge="Usuarios"
              onClick={() => nav("/admin/users")}
            />

            <Card
              title="Propiedades"
              description="Crea, edita, publica, pausa, reserva o marca como vendidas las propiedades disponibles."
              badge="Inventario"
              onClick={() => nav("/admin/propiedades")}
            />
          </div>
        </section>

        <section
          style={{
            padding: 18,
            borderRadius: 24,
            background: "rgba(37,211,166,0.07)",
            border: "1px solid rgba(37,211,166,0.18)",
            color: "rgba(226,232,240,0.92)",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "#7fffd4" }}>Estado:</strong> sesión admin activa.
          Desde aquí puedes moverte entre módulos sin volver a iniciar sesión.
        </section>
      </div>
    </div>
  );
}