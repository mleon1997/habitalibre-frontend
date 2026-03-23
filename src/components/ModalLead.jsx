// src/components/ModalLead.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

export default function ModalLead({
  open,
  onClose,
  dataResultado,
  onLeadSaved,
  onSubmitLead,
}) {
  if (!open) return null;

  return createPortal(
    <Backdrop onClose={onClose}>
      <Panel
        open={open}
        dataResultado={dataResultado}
        onClose={onClose}
        onLeadSaved={onLeadSaved}
        onSubmitLead={onSubmitLead}
      />
    </Backdrop>,
    document.body
  );
}

function Backdrop({ children, onClose }) {
  return (
    <div className="hl-modal-overlay" aria-modal="true" role="dialog">
      <div
        className="absolute inset-0"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      />
      <div
        className="relative w-full max-w-2xl px-3"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function Panel({ open, dataResultado, onClose, onLeadSaved, onSubmitLead }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [horizonteCompra, setHorizonteCompra] = useState("");

  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaCompartir, setAceptaCompartir] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sentOK, setSentOK] = useState(false);
  const [err, setErr] = useState("");

  const resultadoLoading = !!dataResultado?.__loading;

  useEffect(() => {
    if (!open) return;
    setNombre("");
    setEmail("");
    setTelefono("");
    setCiudad("");
    setHorizonteCompra("");
    setAceptaTerminos(false);
    setAceptaCompartir(false);
    setLoading(false);
    setSentOK(false);
    setErr("");
  }, [open]);

  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim()),
    [email]
  );

  const telOk = useMemo(() => {
    const digits = (telefono || "").replace(/\D/g, "");
    return digits.length === 0 || (digits.length >= 9 && digits.length <= 15);
  }, [telefono]);

  const nombreOk = (nombre || "").trim().length >= 2;

  const canSubmit =
    nombreOk &&
    emailOk &&
    telOk &&
    aceptaTerminos &&
    aceptaCompartir &&
    !loading;

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setErr("");

    if (!canSubmit) {
      setErr("Para continuar, completa tus datos y acepta ambas casillas.");
      return;
    }

    try {
      setLoading(true);

      const payloadContacto = {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        ciudad: ciudad.trim(),
        tiempoCompra: horizonteCompra || null,
        aceptaTerminos,
        aceptaCompartir,
      };

      console.log("🔥 ModalLead submit -> payloadContacto", payloadContacto);

      const resp = await onSubmitLead?.(payloadContacto);

      if (!resp?.ok) {
        throw new Error(
          resp?.error || "No se pudo guardar tu solicitud."
        );
      }

      setSentOK(true);

      // Dejamos una pequeña pausa para que el usuario alcance a ver
      // el estado exitoso antes de continuar el flujo.
      setTimeout(() => {
        onLeadSaved?.();
      }, 900);
    } catch (e2) {
      console.error(e2);
      setErr(e2?.message || "No se pudo enviar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hl-modal-panel max-h-[90dvh] overflow-y-auto overscroll-contain">
      <button
        onClick={onClose}
        className="absolute right-5 top-5 text-slate-500 hover:text-slate-700"
        aria-label="Cerrar"
        type="button"
      >
        ✕
      </button>

      {sentOK ? (
        <div className="pt-2">
          <p className="text-[11px] tracking-[0.22em] uppercase text-emerald-600 mb-3 font-medium">
            SOLICITUD RECIBIDA
          </p>

          <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2 text-slate-900">
            ¡Listo! 🎉
          </h3>

          <p className="text-slate-700 text-sm leading-6">
            Ya recibimos tu información correctamente.
          </p>

          <p className="text-slate-600 text-sm leading-6 mt-2">
            Estamos preparando tu resultado personalizado y te lo enviaremos a{" "}
            <span className="font-medium text-slate-800">{email}</span>.
          </p>

          <p className="text-slate-500 text-xs mt-3">
            Revisa también promociones, notificaciones o spam por si llega ahí.
          </p>

          <div className="mt-6 flex gap-3">
            <button onClick={onLeadSaved} className="btn-primary" type="button">
              Continuar
            </button>
            <button onClick={onClose} className="btn-secondary" type="button">
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-[11px] tracking-[0.22em] uppercase text-slate-400 mb-3">
            ESTÁS A 1 PASO DE VER TU RESULTADO
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-2">
            Déjanos tus datos y te mostramos tu mejor opción de crédito
          </h2>

          <p className="text-sm text-slate-600 mb-5">
            No afecta tu buró, no pedimos claves bancarias y puedes pedir que eliminemos tus datos cuando quieras.
          </p>

          {resultadoLoading && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Estamos analizando tu caso… llena tus datos mientras tanto.
            </div>
          )}

          {loading && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-[13px] text-emerald-800 flex items-start gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse mt-1" />
              <div>
                <div className="font-medium">Estamos guardando tu solicitud…</div>
                <div className="text-emerald-700/90 mt-1">
                  Esto toma solo unos segundos.
                </div>
              </div>
            </div>
          )}

          {err && (
            <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 mb-4">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre completo</label>
                <input
                  className="input"
                  placeholder="Ej. Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="email@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Teléfono</label>
                <input
                  className="input"
                  placeholder="+593..."
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Ciudad</label>
                <input
                  className="input"
                  placeholder="Quito, Guayaquil, etc."
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">¿Cuándo quisieras adquirir tu vivienda?</label>
                <select
                  className="input"
                  value={horizonteCompra}
                  onChange={(e) => setHorizonteCompra(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="0-6 meses">En los próximos 0–6 meses</option>
                  <option value="6-12 meses">En 6–12 meses</option>
                  <option value="1-2 años">En 1–2 años</option>
                  <option value="Más de 2 años">En más de 2 años</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-1"
                  disabled={loading}
                />
                <span>
                  Acepto los{" "}
                  <Link to="/terminos" className="underline" onClick={onClose}>
                    Términos de Uso
                  </Link>{" "}
                  y la{" "}
                  <Link to="/privacidad" className="underline" onClick={onClose}>
                    Política de Privacidad
                  </Link>{" "}
                  de HabitaLibre para contactarme y continuar el proceso.
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={aceptaCompartir}
                  onChange={(e) => setAceptaCompartir(e.target.checked)}
                  className="mt-1"
                  disabled={loading}
                />
                <span>
                  Autorizo que HabitaLibre comparta mis datos y el resultado de mi simulación con{" "}
                  <b>bancos, cooperativas y desarrolladores inmobiliarios</b> aliados.
                </span>
              </label>

              <p className="text-[12px] text-slate-500">
                Para continuar y ver tu resultado completo debes aceptar ambas casillas.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={onClose}
                type="button"
                className="btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className={[
                  "btn-primary",
                  !canSubmit ? "opacity-50 cursor-not-allowed hover:scale-100" : "",
                ].join(" ")}
              >
                {loading
                  ? "Guardando..."
                  : resultadoLoading
                  ? "Guardar y continuar"
                  : "Ver mi resultado"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}