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

export default function DeleteAccountWeb() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function runDelete() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const token = localStorage.getItem("hl_customer_token");

      if (!token) {
        setError(
          "Debes iniciar sesión para eliminar tu cuenta. Si no puedes acceder, escríbenos a hola@habitalibre.com"
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
        "No pudimos eliminar tu cuenta. Escríbenos a hola@habitalibre.com"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Eliminar cuenta</h1>

      <p>Puedes eliminar tu cuenta de forma permanente.</p>

      <ul>
        <li>Se eliminará tu perfil</li>
        <li>Se eliminarán tus simulaciones</li>
        <li>No se puede deshacer</li>
      </ul>

      {success && <p>Cuenta eliminada correctamente</p>}
      {error && <p>{error}</p>}

      <button onClick={runDelete} disabled={busy}>
        {busy ? "Eliminando..." : "Eliminar mi cuenta"}
      </button>

      <p style={{ marginTop: 20 }}>
        Si no puedes acceder, escribe a <b>hola@habitalibre.com</b>
      </p>
    </div>
  );
}