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

/* ===========================================================
   BACKDROP
   - fixed + full viewport
   - NO scroll aquí
=========================================================== */
function Backdrop({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60"
      aria-modal="true"
      role="dialog"
    >
      {/* click fuera cierra */}
      <div
        className="absolute inset-0"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      />

      {/* contenedor */}
      <div
        className="relative w-full max-w-2xl px-3"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ===========================================================
   PANEL
   - AQUÍ está el scroll (mobile fix)
=========================================================== */
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

  /* Reset al abrir */
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

      const payload = {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        ciudad: ciudad.trim(),
        canal: "WhatsApp",
        aceptaTerminos,
        aceptaCompartir,
        aceptaMarketing: false,
        origen: "simulador",
        tiempoCompra: horizonteCompra || null,
        resultado: sanitizeResultado(dataResultado),
      };

      const resp = await onSubmitLead?.(payload);
      if (!resp?.ok)
        throw new Error(resp?.error || "No se pudo guardar tu solicitud.");

      setSentOK(true);
      setTimeout(() => onLeadSaved?.(), 350);
    } catch (e2) {
      console.error(e2);
      setErr(e2?.message || "No se pudo enviar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        relative
        max-h-[90dvh]
        overflow-y-auto
        overscroll-contain
        rounded-3xl
        bg-white
        px-6
        py-6
        shadow-2xl
      "
    >
      {/* cerrar */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
        aria-label="Cerrar"
        type="button"
      >
        ✕
      </button>

      {sentOK ? (
        <div className="pt-2">
          <p className="text-[11px] tracking-[0.22em] uppercase text-slate-400 mb-3">
            LISTO
          </p>

          <h3 className="text-2xl font-semibold mb-2">
            ¡Gracias! 🎉
          </h3>

          <p className="text-slate-600 text-sm">
            Guardamos tus datos. Ahora podrás ver tu resultado y continuar el
            proceso.
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

          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Déjanos tus datos y te mostramos tu mejor opción de crédito
          </h2>

          <p className="text-sm text-slate-600 mb-5">
            No afecta tu buró, no pedimos claves bancarias.
          </p>

          {err && (
            <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 mb-4">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nombre completo" value={nombre} onChange={setNombre} />
              <Input label="Email" type="email" value={email} onChange={setEmail} />
              <Input label="Teléfono" value={telefono} onChange={setTelefono} />
              <Input label="Ciudad" value={ciudad} onChange={setCiudad} />

              <div className="sm:col-span-2">
                <label className="label">
                  ¿Cuándo quisieras adquirir tu vivienda?
                </label>
                <select
                  className="input"
                  value={horizonteCompra}
                  onChange={(e) => setHorizonteCompra(e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="0-6 meses">En 0–6 meses</option>
                  <option value="6-12 meses">En 6–12 meses</option>
                  <option value="1-2 años">En 1–2 años</option>
                  <option value="más">Más de 2 años</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <Checkbox
                checked={aceptaTerminos}
                onChange={setAceptaTerminos}
              >
                Acepto los{" "}
                <Link to="/terminos" onClick={onClose} className="underline">
                  Términos
                </Link>{" "}
                y la{" "}
                <Link to="/privacidad" onClick={onClose} className="underline">
                  Política de Privacidad
                </Link>
                .
              </Checkbox>

              <Checkbox
                checked={aceptaCompartir}
                onChange={setAceptaCompartir}
              >
                Autorizo compartir mis datos con entidades financieras aliadas.
              </Checkbox>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} type="button" className="btn-secondary">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className={`btn-primary ${
                  !canSubmit ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Procesando…" : "Ver mi resultado"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

/* ===========================================================
   HELPERS
=========================================================== */
function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Checkbox({ checked, onChange, children }) {
  return (
    <label className="flex items-start gap-3 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1"
      />
      <span>{children}</span>
    </label>
  );
}

function sanitizeResultado(r = {}) {
  const safe = (n) => (Number.isFinite(Number(n)) ? Number(n) : null);

  const producto =
    r.productoSugerido ??
    r.productoElegido ??
    r.tipoCreditoElegido ??
    "";

  const banco =
    r.bancoSugerido ??
    r.mejorBanco?.banco ??
    r.banco ??
    null;

  return {
    productoElegido: producto,
    tipoCreditoElegido: producto,
    productoSugerido: r.productoSugerido ?? producto,
    bancoSugerido: banco,

    capacidadPago: safe(r.capacidadPago),
    cuotaEstimada: safe(r.cuotaEstimada),
    cuotaStress: safe(r.cuotaStress),
    tasaAnual: safe(r.tasaAnual),
    plazoMeses: safe(r.plazoMeses),
    ltv: safe(r.ltv),
    dtiConHipoteca: safe(r.dtiConHipoteca),
    montoMaximo: safe(r.montoMaximo),
    precioMaxVivienda: safe(r.precioMaxVivienda),
    escenarios: r.escenarios || null,
    puntajeHabitaLibre: r.puntajeHabitaLibre || null,
  };
}
