import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LS_KEYS_TO_CLEAR = [
  "hl_mobile_journey_v1",
  "hl_mobile_last_snapshot_v1",
  "hl_mobile_customer_v1",
  "hl_mobile_auth_v1",
  "hl_mobile_progress_v1",
  "hl_customer_token",
  "hl_customer_data",
  "hl_selected_property_v1",
];

function clearLocalHabitaLibreData() {
  try {
    LS_KEYS_TO_CLEAR.forEach((key) => localStorage.removeItem(key));
  } catch {}
}

function ConfirmModal({ open, busy, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 6, 23, 0.74)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "linear-gradient(180deg, #08152d 0%, #071126 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24,
          boxShadow: "0 30px 80px rgba(0,0,0,0.42)",
          padding: 24,
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            marginBottom: 10,
            lineHeight: 1,
          }}
        >
          ¿Eliminar tu cuenta?
        </div>

        <div
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.6,
            marginBottom: 18,
          }}
        >
          Esta acción eliminará tu cuenta y la información asociada a
          HabitaLibre. No se puede deshacer.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              height: 48,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: "#fff",
              fontWeight: 700,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{
              height: 48,
              borderRadius: 14,
              border: "none",
              background: busy
                ? "rgba(239,68,68,0.35)"
                : "linear-gradient(180deg, #ff5c61 0%, #ef4444 100%)",
              color: "#fff",
              fontWeight: 800,
              cursor: busy ? "not-allowed" : "pointer",
              boxShadow: busy ? "none" : "0 14px 30px rgba(239,68,68,0.24)",
            }}
          >
            {busy ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ children }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        color: "rgba(255,255,255,0.92)",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}

export default function DeleteAccountWeb() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function runDelete() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const token = localStorage.getItem("hl_customer_token");

      if (!token) {
        setError(
          "Para eliminar tu cuenta desde esta página, primero debes iniciar sesión. Si no puedes acceder, escríbenos a hola@habitalibre.com."
        );
        return;
      }

      const res = await fetch(
        "https://habitalibre-backend.onrender.com/api/customer-auth/delete-account",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Error eliminando cuenta");
      }

      clearLocalHabitaLibreData();
      setSuccess(true);

      setTimeout(() => {
        navigate("/login?deleted=1", { replace: true });
      }, 1200);
    } catch (e) {
      console.error(e);
      setError(
        "No pudimos eliminar tu cuenta. Si el problema continúa, escríbenos a hola@habitalibre.com."
      );
    } finally {
      setBusy(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <ConfirmModal
        open={showConfirm}
        busy={busy}
        onCancel={() => setShowConfirm(false)}
        onConfirm={runDelete}
      />

      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 20% 10%, rgba(0,180,255,0.16), transparent 28%), linear-gradient(180deg, #03112a 0%, #020b1d 100%)",
          padding: "48px 20px 88px",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              marginBottom: 20,
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.74)",
              fontWeight: 800,
              cursor: "pointer",
              padding: 0,
              fontSize: 14,
            }}
          >
            ← Volver al inicio
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 20,
            }}
          >
            <div
              style={{
                background: "rgba(8,18,42,0.82)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 28,
                boxShadow: "0 28px 80px rgba(0,0,0,0.28)",
                padding: 28,
                color: "#fff",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(71, 222, 255, 0.22)",
                  background: "rgba(71, 222, 255, 0.08)",
                  color: "#5eead4",
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 18,
                }}
              >
                Cuenta HabitaLibre
              </div>

              <h1
                style={{
                  fontSize: "clamp(34px, 5vw, 56px)",
                  fontWeight: 950,
                  margin: 0,
                  marginBottom: 12,
                  lineHeight: 0.95,
                  letterSpacing: "-0.04em",
                }}
              >
                Eliminar cuenta
              </h1>

              <p
                style={{
                  margin: 0,
                  marginBottom: 22,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 16,
                  lineHeight: 1.65,
                  maxWidth: 640,
                }}
              >
                Desde esta página puedes solicitar la eliminación permanente de
                tu cuenta de HabitaLibre.
              </p>

              <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
                <InfoRow>Se eliminará tu perfil</InfoRow>
                <InfoRow>Se eliminará tu score HabitaLibre</InfoRow>
                <InfoRow>Se borrará tu historial de simulaciones</InfoRow>
                <InfoRow>Se cerrará tu sesión en este dispositivo</InfoRow>
              </div>

              <p
                style={{
                  marginTop: 0,
                  marginBottom: 18,
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                Esta acción es permanente y no se puede deshacer.
              </p>

              {success ? (
                <div
                  style={{
                    marginBottom: 14,
                    padding: 14,
                    borderRadius: 16,
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.26)",
                    color: "#d1fae5",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  Tu cuenta fue eliminada correctamente. Te estamos redirigiendo.
                </div>
              ) : null}

              {error ? (
                <div
                  style={{
                    marginBottom: 14,
                    padding: 14,
                    borderRadius: 16,
                    background: "rgba(244,63,94,0.14)",
                    border: "1px solid rgba(244,63,94,0.24)",
                    color: "#ffe4e6",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </div>
              ) : null}

              <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  disabled={busy || success}
                  style={{
                    height: 52,
                    borderRadius: 16,
                    border: "none",
                    background:
                      busy || success
                        ? "rgba(239,68,68,0.35)"
                        : "linear-gradient(180deg, #ff5c61 0%, #ef4444 100%)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: busy || success ? "not-allowed" : "pointer",
                    boxShadow:
                      busy || success
                        ? "none"
                        : "0 16px 30px rgba(239,68,68,0.24)",
                  }}
                >
                  {busy ? "Eliminando..." : "Eliminar mi cuenta"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  disabled={busy}
                  style={{
                    height: 48,
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: busy ? "not-allowed" : "pointer",
                  }}
                >
                  Volver al inicio
                </button>
              </div>
            </div>

            <div
              style={{
                background: "rgba(8,18,42,0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 28,
                boxShadow: "0 28px 80px rgba(0,0,0,0.24)",
                padding: 24,
                color: "#fff",
                alignSelf: "start",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  marginBottom: 12,
                  letterSpacing: "-0.02em",
                }}
              >
                ¿No puedes iniciar sesión?
              </div>

              <p
                style={{
                  marginTop: 0,
                  marginBottom: 14,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 14,
                  lineHeight: 1.65,
                }}
              >
                También puedes solicitar la eliminación de tu cuenta por correo.
              </p>

              <div
                style={{
                  borderRadius: 18,
                  padding: 16,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Correo de soporte
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                  }}
                >
                  hola@habitalibre.com
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.68)",
                  fontSize: 13,
                  lineHeight: 1.65,
                }}
              >
                Escríbenos desde el correo registrado en tu cuenta para procesar
                tu solicitud.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}