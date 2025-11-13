// src/App.jsx
import React, { useEffect, useState } from "react";
import LeadModalBare from "./components/LeadModalBare.jsx";

// ===== Escudo de clicks (global muy simple) =====
let __HL_SUPPRESS_UNTIL = 0;
export function armClickShield(ms = 450) {
  __HL_SUPPRESS_UNTIL = Date.now() + ms;
}
function isShieldActive() {
  return Date.now() < __HL_SUPPRESS_UNTIL;
}

export default function App() {
  const [open, setOpen] = useState(false);

  // Captura clicks a nivel de documento y los anula si el escudo está activo
  useEffect(() => {
    const handler = (e) => {
      if (isShieldActive()) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    // useCapture = true para interceptar ANTES de que llegue a abajo
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#f8fafc",
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    }}>
      <div style={{ textAlign: "center", maxWidth: 520 }}>
        <h1 style={{ fontSize: 28, marginBottom: 12, color: "#0f172a" }}>
          HabitaLibre Portal Reset 🧪
        </h1>
        <p style={{ marginBottom: 20, color: "#475569" }}>
          Prueba con portal aislado y escudo anti click-through.
        </p>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: "#4f46e5",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,.12)",
          }}
        >
          Ver mi resultado
        </button>
      </div>

      <LeadModalBare
        open={open}
        onClose={() => {
          // arma el escudo ANTES de cerrar para evitar que el mouseup dispare nada abajo
          armClickShield(500);
          // cerramos un poco después para asegurar que el escudo ya está activo
          setTimeout(() => setOpen(false), 60);
        }}
      />
    </div>
  );
}

export { isShieldActive }; // si luego lo quieres reutilizar en otros sitios

