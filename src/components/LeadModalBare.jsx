// src/components/LeadModalBare.jsx
import React, { useState } from "react";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://habitalibre-backend.onrender.com";

export default function LeadModalBare() {
  const { modalOpen, closeLead, lastResult } = useLeadCapture();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [horizonteCompra, setHorizonteCompra] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaCompartir, setAceptaCompartir] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 👉 Si el modal NO está abierto, no rendereamos nada
  if (!modalOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!nombre.trim() || !email.trim()) {
      setErr("Por favor completa tu nombre y email.");
      return;
    }
    if (!aceptaTerminos) {
      setErr("Debes aceptar los términos y privacidad para continuar.");
      return;
    }

    try {
      setLoading(true);

      let producto = null;
      let scoreHL = null;

      if (lastResult && typeof lastResult === "object") {
        producto =
          lastResult.productoPrincipal ||
          lastResult.producto ||
          lastResult.mejorProducto ||
          lastResult.mejorOpcion?.nombre ||
          null;

        scoreHL =
          lastResult.scoreHL ??
          lastResult.scoreHl ??
          lastResult.scoreHabitaLibre ??
          lastResult.score ??
          null;
      }

      const payload = {
        nombre,
        email,
        telefono,
        ciudad,
        aceptaTerminos,
        aceptaCompartir,
        tiempoCompra: horizonteCompra || null,
        resultado: lastResult,
        producto,
        scoreHL,
      };

      console.log("[API] POST /api/leads Payload:", payload);

      const resp = await fetch(`${API_BASE_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));
      console.log("[API] Respuesta:", data);

      if (!resp.ok) {
        setErr(
          data?.msg ||
            "No pudimos guardar tus datos. Intenta nuevamente en unos minutos."
        );
        return;
      }

      closeLead();
      window.location.hash = "#/gracias";
    } catch (ex) {
      console.error("❌ Error llamando al backend:", ex);
      setErr("No pudimos guardar tus datos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hl-modal-overlay">
      <div className="hl-modal-panel relative">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={closeLead}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold tracking-[.25em] text-slate-400">
              ESTÁS A 1 PASO DE VER TU RESULTADO
            </p>
            <h2 className="text-2xl md:text-[28px] font-semibold text-slate-900 leading-snug">
              Déjanos tus datos y te mostramos tu mejor opción de crédito al
              instante
            </h2>
          </div>

          {/* Nombre + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre completo</label>
              <input
                type="text"
                className="input"
                placeholder="Ej. Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="email@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Teléfono + Ciudad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                Teléfono{" "}
                <span className="text-xs text-slate-400">(opcional)</span>
              </label>
              <input
                type="tel"
                className="input"
                placeholder="+593 ..."
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                Ciudad{" "}
                <span className="text-xs text-slate-400">(opcional)</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="Quito, Guayaquil, etc."
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
              />
            </div>
          </div>

          {/* Horizonte */}
          <div>
            <label className="label">
              ¿Cuándo quisieras adquirir tu vivienda?
            </label>
            <select
              className="input"
              value={horizonteCompra}
              onChange={(e) => setHorizonteCompra(e.target.value)}
            >
              <option value="">Selecciona una opción</option>
              <option value="0-6 meses">En los próximos 0–6 meses</option>
              <option value="6-12 meses">En 6–12 meses</option>
              <option value="1-2 años">En 1–2 años</option>
              <option value="Más de 2 años">En más de 2 años</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2 text-[13px] text-slate-700">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
              />
              <span>
                Acepto términos y privacidad de HabitaLibre para contactarme y
                continuar el proceso.
              </span>
            </label>

            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={aceptaCompartir}
                onChange={(e) => setAceptaCompartir(e.target.checked)}
              />
              <span>
                Autorizo compartir mis datos con entidades aliadas solo para
                evaluación de crédito (opcional).
              </span>
            </label>

            <p className="text-[11px] text-slate-400 mt-1">
              Nunca vendemos tus datos. Puedes pedir que los eliminemos en
              cualquier momento.
            </p>
          </div>

          {/* Error */}
          {err && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              {err}
            </div>
          )}

          {/* Botones */}
          <div className="mt-3 flex flex-col md:flex-row justify-between gap-3">
            <button
              type="button"
              onClick={closeLead}
              className="btn-secondary w-full md:w-auto"
            >
              Ver más tarde
            </button>

            <button
              type="submit"
              className="btn-primary w-full md:w-auto"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Ver mi resultado completo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
