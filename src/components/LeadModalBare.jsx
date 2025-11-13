// src/components/LeadModalBare.jsx
// src/components/LeadModalBare.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { crearLead } from "../lib/api"; // <- usa tu helper actual

const overlayRootId = "hl-portal-root";

export default function LeadModalBare({ open, onClose }) {
  const [mounted, setMounted] = useState(false);

  // form state
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  // evita doble submit accidental
  const sentRef = useRef(false);

  // montar/asegurar único portal
  useEffect(() => {
    let host = document.getElementById(overlayRootId);
    if (!host) {
      host = document.createElement("div");
      host.id = overlayRootId;
      document.body.appendChild(host);
    }
    setMounted(true);

    // limpiar formulario cuando se cierra
    if (!open) {
      setNombre("");
      setEmail("");
      setTelefono("");
      setCiudad("");
      setLoading(false);
      setOk(false);
      setError("");
      sentRef.current = false;
    }
  }, [open]);

  // bloquear scroll de fondo cuando está abierto
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow || "";
    };
  }, [open]);

  if (!open || !mounted) return null;

  const host = document.getElementById(overlayRootId);
  if (!host) return null;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
  const nombreOk = (nombre || "").trim().length >= 2;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!nombreOk) return setError("Ingresa tu nombre (2+ caracteres).");
    if (!emailOk) return setError("Correo inválido.");
    if (sentRef.current) return;

    try {
      setLoading(true);

      const payload = {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: (telefono || "").trim(),
        ciudad: (ciudad || "").trim(),
        canal: "WhatsApp",
        aceptaTerminos: true,
        aceptaCompartir: true,
        aceptaMarketing: false,
        origen: "portal-reset",
        // puedes adjuntar resultado si lo tienes:
        resultado: null,
      };

      console.log("[LeadModal] Enviando payload:", payload);
      const resp = await crearLead(payload);
      console.log("[LeadModal] Respuesta crearLead:", resp);

      if (!resp?.ok) {
        throw new Error(resp?.error || "No se pudo guardar el lead.");
      }

      sentRef.current = true;
      setOk(true); // no cerramos automáticamente
    } catch (err) {
      console.error("❌ Error crearLead:", err);
      setError(err?.message || "No se pudo enviar tu información. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleOverlayClick(e) {
    // anti click-through: solo cierra si haces click DIRECTO en el overlay
    if (e.target === e.currentTarget) onClose?.();
  }

  return createPortal(
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        style={{
          width: "min(720px, 92vw)",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,.25)",
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <h2 style={{ margin: 0, fontSize: 28, lineHeight: "32px" }}>
            🎉 ¡Estás a 1 paso de ver tu resultado!
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              border: 0,
              background: "transparent",
              fontSize: 20,
              cursor: "pointer",
              color: "#334155",
            }}
          >
            ×
          </button>
        </div>

        {!ok ? (
          <>
            <p style={{ marginTop: 6, color: "#475569" }}>
              Déjanos tus datos y te mostramos tu mejor opción al instante.
            </p>

            <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <input
                  placeholder="Nombre y apellido"
                  className="hl-input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                <input
                  placeholder="Correo electrónico"
                  className="hl-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
                <input
                  placeholder="WhatsApp / Teléfono"
                  className="hl-input"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
                <input
                  placeholder="Ciudad"
                  className="hl-input"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                />
              </div>

              {error && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "#fef2f2",
                    color: "#991b1b",
                    border: "1px solid #fecaca",
                    fontSize: 14,
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="hl-btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button type="submit" className="hl-btn-primary" disabled={loading}>
                  {loading ? "Enviando…" : "Ver mi resultado"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "18px 6px 6px" }}>
            <div
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 8px",
                borderRadius: "50%",
                background: "#ecfeff",
                display: "grid",
                placeItems: "center",
                fontSize: 28,
                color: "#06b6d4",
              }}
            >
              ✅
            </div>
            <h3 style={{ margin: "4px 0 6px" }}>¡Listo! Guardamos tus datos.</h3>
            <p style={{ color: "#475569", marginBottom: 14 }}>
              Te enviaremos tu resumen por correo. Puedes cerrar este mensaje para continuar.
            </p>
            <button onClick={onClose} className="hl-btn-primary">
              Cerrar y ver resultado
            </button>
          </div>
        )}
      </div>

      {/* estilos mínimos para inputs/botones */}
      <style>{`
        .hl-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          outline: none;
          font-size: 14px;
        }
        .hl-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99,102,241,.15);
        }
        .hl-btn-primary {
          background: #4f46e5;
          color: white;
          border: 0;
          border-radius: 12px;
          padding: 12px 18px;
          font-weight: 600;
          cursor: pointer;
        }
        .hl-btn-primary:disabled {
          opacity: .7;
          cursor: not-allowed;
        }
        .hl-btn-secondary {
          background: white;
          color: #334155;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px 18px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>,
    host
  );
}
