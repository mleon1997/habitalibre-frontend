import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export default function ModalLead({ open, onClose, dataResultado, onLeadSaved, onSubmitLead }) {
  // No renderizar nada si está cerrado
  if (!open) return null;

  return createPortal(
    <Backdrop onClose={onClose}>
      <Panel
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
    <div className="hl-backdrop" aria-modal="true" role="dialog">
      {/* Capa click-outside */}
      <div
        className="absolute inset-0"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      />
      {/* Contenido (clicks no cierran) */}
      <div
        className="relative w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function Panel({ dataResultado, onClose, onLeadSaved, onSubmitLead }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaCompartir, setAceptaCompartir] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sentOK, setSentOK] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setNombre(""); setEmail(""); setTelefono(""); setCiudad("");
    setAceptaTerminos(false); setAceptaCompartir(true);
    setLoading(false); setSentOK(false); setErr("");
  }, []);

  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email||"").trim()), [email]);
  const telOk = useMemo(() => {
    const digits = (telefono || "").replace(/\D/g, "");
    return digits.length === 0 || (digits.length >= 9 && digits.length <= 15);
  }, [telefono]);
  const nombreOk = (nombre || "").trim().length >= 2;
  const canSubmit = nombreOk && emailOk && aceptaTerminos && !loading;

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setErr("");

    if (!canSubmit) {
      setErr("Revisa nombre, correo y acepta los términos.");
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
        resultado: sanitizeResultado(dataResultado),
      };
      const resp = await onSubmitLead?.(payload);
      if (!resp?.ok) throw new Error(resp?.error || "No se pudo guardar tu solicitud.");
      setSentOK(true);
      setTimeout(() => onLeadSaved?.(), 300);
    } catch (e2) {
      console.error(e2);
      setErr(e2?.message || "No se pudo enviar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b bg-gradient-to-r from-indigo-50 to-white flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {sentOK ? "¡Listo! 🎉" : "🎉 ¡Estás a 1 paso de ver tu resultado!"}
          </h3>
          <p className="text-sm text-slate-600">
            {sentOK
              ? "Guardamos tus datos. Ya puedes ver tu resultado y recibirás tu PDF por correo."
              : "Déjanos tus datos y te mostramos tu mejor opción de crédito al instante."}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-700 px-2 py-1" aria-label="Cerrar">✕</button>
      </div>

      {sentOK ? (
        <div className="px-6 py-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-slate-700">¡Gracias, {nombre.split(" ")[0] || "listo"}! Te enviamos un correo con tu resumen.</p>
          <div className="mt-5">
            <button onClick={onClose} className="btn-primary">Ver mi resultado ahora</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-3">
          {err && <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2">{err}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre completo</label>
              <input className="input" value={nombre} onChange={(e)=>setNombre(e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Teléfono (opcional)</label>
              <input className="input" value={telefono} onChange={(e)=>setTelefono(e.target.value)} />
            </div>
            <div>
              <label className="label">Ciudad (opcional)</label>
              <input className="input" value={ciudad} onChange={(e)=>setCiudad(e.target.value)} />
            </div>
          </div>

          <label className="text-sm text-slate-600 flex items-start gap-2">
            <input type="checkbox" checked={aceptaTerminos} onChange={(e)=>setAceptaTerminos(e.target.checked)} className="mt-1" />
            <span>Acepto términos y privacidad.</span>
          </label>
          <label className="text-sm text-slate-600 flex items-start gap-2">
            <input type="checkbox" checked={aceptaCompartir} onChange={(e)=>setAceptaCompartir(e.target.checked)} className="mt-1" />
            <span>Autorizo compartir mis datos con entidades aliadas para evaluación crediticia.</span>
          </label>

          <div className="pt-1 flex items-center justify-between">
            <small className="text-slate-500">Nunca vendemos tus datos. Baja en cualquier momento.</small>
            <button type="submit" disabled={!canSubmit} className={`btn ${canSubmit ? "btn-primary" : "bg-indigo-300 text-white cursor-not-allowed"}`}>
              {loading ? "Procesando…" : "Ver mi resultado"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function sanitizeResultado(r = {}) {
  const safe = (n) => (Number.isFinite(Number(n)) ? Number(n) : null);
  const out = {
    productoElegido: r.productoElegido ?? r.tipoCreditoElegido ?? "",
    tipoCreditoElegido: r.tipoCreditoElegido ?? r.productoElegido ?? "",
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
  return out;
}
