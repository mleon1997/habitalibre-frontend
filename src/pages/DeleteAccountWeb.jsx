import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiDelete } from "../lib/api.js";
import { clearCustomerSession } from "../lib/customerSession.js";

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

  try {
    sessionStorage.removeItem("hl_account_deleted");
  } catch {}
}

function ConfirmModal({ open, busy, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 6, 23, 0.72)",
        backdropFilter: "blur(8px)",
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
          background: "#0b1730",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
          padding: 22,
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            marginBottom: 10,
            lineHeight: 1.1,
          }}
        >
          ¿Eliminar tu cuenta?
        </div>

        <div
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.55,
            marginBottom: 18,
          }}
        >
          Esta acción eliminará tu cuenta y la información asociada a
          HabitaLibre. No se puede deshacer.
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              flex: 1,
              minWidth: 160,
              height: 46,
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
              flex: 1,
              minWidth: 160,
              height: 46,
              borderRadius: 14,
              border: "none",
              background: busy
                ? "rgba(239,68,68,0.35)"
                : "linear-gradient(180deg, #ff5a5f 0%, #ef4444 100%)",
              color: "#fff",
              fontWeight: 800,
              cursor: busy ? "not-allowed" : "pointer",
              boxShadow: busy ? "none" : "0 12px 28px rgba(239,68,68,0.28)",
            }}
          >
            {busy ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
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
      await apiDelete("/api/customer-auth/delete-account");

      clearLocalHabitaLibreData();
      clearCustomerSession();

      try {
        sessionStorage.setItem("hl_account_deleted", "1");
      } catch {}

      setSuccess(true);

      setTimeout(() => {
        navigate("/login?deleted=1", { replace: true });
      }, 1200);
    } catch (e) {
      console.error("[DeleteAccountWeb] delete failed:", e);
      setError(
        e?.message ||
          "No pudimos eliminar tu cuenta. Intenta nuevamente o escríbenos a hola@habitalibre.com."
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
          padding: "40px 20px 80px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              marginBottom: 18,
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.78)",
              fontWeight: 800,
              cursor: "pointer",
              padding: 0,
              fontSize: 14,
            }}
          >
            ← Volver
          </button>

          <h1
            style={{
              fontSize: "clamp(34px, 5vw, 54px)",
              fontWeight: 950,
              margin: 0,
              marginBottom: 18,
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 0.98,
            }}
          >
            Eliminar cuenta
          </h1>

          <div
            style={{
              background: "rgba(8,18,42,0.82)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
              padding: 22,
              color: "#fff",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.78)",
                marginTop: 0,
                marginBottom: 14,
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              Desde esta página puedes solicitar la eliminación permanente de tu
              cuenta de HabitaLibre.
            </p>

            <ul
              style={{
                marginTop: 0,
                marginBottom: 14,
                paddingLeft: 20,
                color: "#fff",
                lineHeight: 1.9,
              }}
            >
              <li>Se eliminará tu perfil</li>
              <li>Se eliminará tu score HabitaLibre</li>
              <li>Se borrará tu historial de simulaciones</li>
              <li>Se cerrará tu sesión en este dispositivo</li>
            </ul>

            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.62)",
                marginTop: 0,
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              Esta acción es permanente y no se puede deshacer.
            </p>

            {success ? (
              <div
                style={{
                  marginBottom: 14,
                  padding: 12,
                  borderRadius: 14,
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
                  padding: 12,
                  borderRadius: 14,
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

            <div style={{ display: "grid", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={busy || success}
                style={{
                  height: 50,
                  borderRadius: 16,
                  border: "none",
                  background:
                    busy || success
                      ? "rgba(239,68,68,0.35)"
                      : "linear-gradient(180deg, #ff5a5f 0%, #ef4444 100%)",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: busy || success ? "not-allowed" : "pointer",
                  boxShadow:
                    busy || success
                      ? "none"
                      : "0 14px 28px rgba(239,68,68,0.28)",
                }}
              >
                {busy ? "Eliminando..." : "Eliminar mi cuenta"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                disabled={busy}
                style={{
                  height: 46,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                Volver al inicio
              </button>
            </div>

            <div
              style={{
                marginTop: 18,
                fontSize: 13,
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.65,
              }}
            >
              Si ya iniciaste sesión, puedes eliminar tu cuenta directamente
              desde esta página.
              <br />
              Si no has iniciado sesión, puedes solicitar la eliminación
              escribiéndonos a <strong>soporte@habitalibre.com</strong> desde el
              correo registrado en tu cuenta.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}