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
  const [shake, setShake] = useState(false);

  const needsConsentError =
    !!err && err.indexOf("Debes aceptar ambas casillas") !== -1;

  // Si el modal no está abierto, no renderizamos nada
  if (!modalOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!nombre.trim() || !email.trim()) {
      setErr("Por favor completa tu nombre y email.");
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }

    if (!aceptaTerminos || !aceptaCompartir) {
      setErr("Debes aceptar ambas casillas para continuar.");
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }

    try {
      setLoading(true);

      let producto = null;
      let scoreHL = null;
      let sustentoIndependiente = null;

      if (lastResult && typeof lastResult === "object") {
        producto =
          lastResult.productoPrincipal ||
          lastResult.producto ||
          lastResult.mejorProducto ||
          (lastResult.mejorOpcion && lastResult.mejorOpcion.nombre) ||
          null;

        scoreHL =
          lastResult.scoreHL ||
          lastResult.scoreHl ||
          lastResult.scoreHabitaLibre ||
          lastResult.score ||
          null;

        sustentoIndependiente =
          (lastResult.perfil && lastResult.perfil.sustentoIndependiente) ||
          (lastResult.entrada && lastResult.entrada.sustentoIndependiente) ||
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
        sustentoIndependiente,
      };

      console.log("[API] POST /api/leads Payload:", payload);

      const resp = await fetch(API_BASE_URL + "/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));
      console.log("[API] Respuesta:", data);

      if (!resp.ok) {
        setErr(
          (data && data.msg) ||
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

  const consentBoxClass =
    "space-y-2 text-[13px] text-slate-700 rounded-xl px-3 py-3 -mx-1 " +
    (needsConsentError
      ? "border border-red-300 bg-red-50/70"
      : "bg-slate-50/60 border border-slate-200/70");

  return (
    <div className="hl-modal-overlay">
      <div
        className={
          "hl-modal-panel relative w-full max-w-md mx-4 sm:mx-auto px-4 py-6 md:px-6 md:py-7 rounded-2xl bg-white shadow-xl transition-transform duration-200 " +
          (shake ? "hl-shake" : "")
        }
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={closeLead}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Encabezado */}
          <div className="space-y-1 pr-6">
            <p className="text-[11px] font-semibold tracking-[.25em] text-slate-400">
              ESTÁS A 1 PASO DE VER TU RESULTADO
            </p>
            <h2 className="text-xl md:text-[24px] font-semibold text-slate-900 leading-snug">
              Déjanos tus datos y te mostramos tu mejor opción de crédito al
              instante
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              No afecta tu buró, no pedimos claves bancarias y puedes pedir que
              eliminemos tus datos cuando quieras.
            </p>
          </div>

          {/* Nombre + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Nombre completo</label>
              <input
                type="text"
                className="input text-[14px]"
                placeholder="Ej. Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div>
              <label className="label text-xs">Email</label>
              <input
                type="email"
                className="input text-[14px]"
                placeholder="email@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Teléfono + Ciudad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Teléfono</label>
              <input
                type="tel"
                className="input text-[14px]"
                placeholder="+593 ..."
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div>
              <label className="label text-xs">Ciudad</label>
              <input
                type="text"
                className="input text-[14px]"
                placeholder="Quito, Guayaquil, etc."
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
              />
            </div>
          </div>

          {/* Horizonte */}
          <div>
            <label className="label text-xs">
              ¿Cuándo quisieras adquirir tu vivienda?
            </label>
            <select
              className="input text-[14px]"
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
          <div className={consentBoxClass}>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1.5 h-4 w-4"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
              />
              <span className="leading-relaxed">
                Acepto los{" "}
                <a
                  href="#/terminos"
                  className="underline underline-offset-2 text-slate-900 hover:text-slate-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  Términos de Uso
                </a>{" "}
                y la{" "}
                <a
                  href="#/privacidad"
                  className="underline underline-offset-2 text-slate-900 hover:text-slate-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  Política de Privacidad
                </a>{" "}
                de HabitaLibre para contactarme y continuar el proceso.
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1.5 h-4 w-4"
                checked={aceptaCompartir}
                onChange={(e) => setAceptaCompartir(e.target.checked)}
              />
              <span className="leading-relaxed">
                Autorizo que HabitaLibre comparta mis datos y el resultado de mi
                simulación con{" "}
                <strong>
                  bancos, cooperativas y desarrolladores inmobiliarios aliados
                </strong>{" "}
                para analizar y ofrecerme opciones hipotecarias y contactarme
                sobre mi proceso.
              </span>
            </label>

            <p className="text-[11px] text-slate-500 mt-1">
              Para continuar y ver tu resultado completo debes aceptar ambas
              casillas. Nunca vendemos tus datos. Puedes pedir que los
              eliminemos en cualquier momento escribiendo a{" "}
              <strong>hola@habitalibre.com</strong>.
            </p>
          </div>

          {/* Error */}
          {err && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              {err}
            </div>
          )}

          {/* Microcopy de confianza + botones */}
          <div className="mt-2 space-y-3">
            <p className="text-[11px] text-slate-400 text-center md:text-right">
              Tu información se procesa de forma segura. No afecta tu buró de
              crédito.
            </p>

            <div className="flex flex-col md:flex-row justify_between gap-3">
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
          </div>
        </form>
      </div>
    </div>
  );
}
