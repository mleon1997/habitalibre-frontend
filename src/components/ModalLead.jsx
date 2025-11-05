// src/components/ModalLead.jsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ModalLead({
  open,
  onClose,
  dataResultado,     // viene desde SimulatorWizard (resultado completo)
  onLeadSaved,       // callback para cerrar y mostrar resultado
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [canal, setCanal] = useState("WhatsApp");

  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaCompartir, setAceptaCompartir] = useState(true);
  const [aceptaMarketing, setAceptaMarketing] = useState(false);

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [sentOK, setSentOK] = useState(false);

  useEffect(() => {
    if (!open) {
      setNombre("");
      setEmail("");
      setTelefono("");
      setCiudad("");
      setCanal("WhatsApp");
      setAceptaTerminos(false);
      setAceptaCompartir(true);
      setAceptaMarketing(false);
      setErrores({});
      setLoading(false);
      setSentOK(false);
    }
  }, [open]);

  // Validaciones
  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);
  const telOk = useMemo(() => {
    const digits = (telefono || "").replace(/\D/g, "");
    return digits.length >= 9 && digits.length <= 15;
  }, [telefono]);
  const nombreOk = (nombre || "").trim().length >= 2;
  const ciudadOk = (ciudad || "").trim().length >= 2;
  const canSubmit = nombreOk && emailOk && telOk && ciudadOk && aceptaTerminos && !loading;

  // Normaliza escenarios para no mandar payload gigante
  function summarizeEscenarios(esc) {
    try {
      const keys = Object.keys(esc || {});
      const out = {};
      keys.forEach((k) => {
        const e = esc[k] || {};
        out[k] = {
          viable: e.viable ?? null,
          tasa: e.tasaAnual ?? null,
          plazo: e.plazoMeses ?? null,
          cuota: e.cuota ?? e.cuotaEstimada ?? null,
          bounds: { cuotaMaxProducto: e?.bounds?.cuotaMaxProducto ?? null },
        };
      });
      return out;
    } catch {
      return null;
    }
  }

  const buildPayload = () => {
    // Normaliza resultado y asegura campos clave
    const r = dataResultado || {};
    const resultado = {
      productoElegido: r.productoElegido ?? r.tipoCreditoElegido ?? "",
      tipoCreditoElegido: r.tipoCreditoElegido ?? r.productoElegido ?? "",
      capacidadPago: r.capacidadPago ?? null,
      cuotaEstimada: r.cuotaEstimada ?? null,
      cuotaStress: r.cuotaStress ?? null,
      tasaAnual: r.tasaAnual ?? null,
      plazoMeses: r.plazoMeses ?? null,
      ltv: r.ltv ?? null,
      dtiConHipoteca: r.dtiConHipoteca ?? null,
      montoMaximo: r.montoMaximo ?? null,
      precioMaxVivienda: r.precioMaxVivienda ?? null,
      puntajeHabitaLibre: r.puntajeHabitaLibre ?? null,
      escenarios: r.escenarios ? summarizeEscenarios(r.escenarios) : null,
    };

    return {
      // contacto
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim(),
      ciudad: ciudad.trim(),
      canal,
      aceptaTerminos,
      aceptaCompartir,
      aceptaMarketing,
      origen: "simulador",
      // resultado completo (para correo + PDF + CRM)
      resultado,
    };
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    const newErrors = {};
    if (!nombreOk) newErrors.nombre = "Ingresa tu nombre.";
    if (!emailOk) newErrors.email = "Correo inválido.";
    if (!telOk) newErrors.telefono = "Teléfono inválido.";
    if (!ciudadOk) newErrors.ciudad = "Ingresa tu ciudad.";
    if (!aceptaTerminos) newErrors.terminos = "Debes aceptar términos y privacidad.";
    setErrores(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      setLoading(true);

      const API_BASE =
        (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).replace(/\/$/, "")) ||
        "http://localhost:4000";

      const payload = buildPayload();

      const res = await fetch(`${API_BASE}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json?.ok) throw new Error(json?.error || "No se pudo guardar el lead");

      setSentOK(true);
      setTimeout(() => {
        onLeadSaved?.(); // mostrará el resultado y cerrará el modal si lo manejas así
      }, 600);
    } catch (err) {
      console.error("❌ Error enviando lead:", err);
      alert("No se pudo enviar tu información. Inténtalo nuevamente en unos minutos.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000]"  // ← QUITADO pointer-events-none
      role="dialog"
      aria-modal="true"
      aria-label="Formulario para ver resultado de precalificación"
    >
      {/* Backdrop: debajo y sí capta clicks para cerrar */}
      <div
        className="absolute inset-0 bg-black/50 z-40 cursor-pointer" // pointer-events por defecto = auto
        onClick={onClose}
      />

      {/* Wrapper de centrado (NO bloquear eventos) */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={sentOK ? "ok" : "form"}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-start justify-between">
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
                <button
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-700 rounded-lg px-2 py-1"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            {sentOK ? (
              <div className="px-6 py-8 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-slate-700">
                  ¡Gracias, {nombre.split(" ")[0] || "listo"}! Te contactaremos por{" "}
                  <b>{canal}</b> y acabamos de enviarte un correo con tu resumen.
                </p>
                <div className="mt-5">
                  <button
                    onClick={() => onLeadSaved?.()}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:opacity-90"
                  >
                    Ver mi resultado ahora
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                  Datos protegidos • Puedes darte de baja en cualquier momento
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 py-4">
                {/* Trust badges */}
                <div className="mb-4 flex items-center gap-3 text-[11px] text-slate-600">
                  <span className="px-2 py-1 rounded-full bg-slate-100">🔒 Datos protegidos</span>
                  <span className="px-2 py-1 rounded-full bg-slate-100">✅ Sin costo</span>
                  <span className="px-2 py-1 rounded-full bg-slate-100">⚡ Resultado inmediato</span>
                </div>

                {/* Campos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Nombre y apellido" error={errores.nombre}>
                    <input
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="Juan Pérez"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      autoComplete="name"
                    />
                  </Field>

                  <Field label="Correo electrónico" error={errores.email}>
                    <input
                      type="email"
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="tucorreo@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </Field>

                  <Field label="WhatsApp / Teléfono" error={errores.telefono}>
                    <input
                      type="tel"
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="+593 99 999 9999"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      autoComplete="tel"
                    />
                  </Field>

                  <Field label="Ciudad" error={errores.ciudad}>
                    <input
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="Quito"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      autoComplete="address-level2"
                    />
                  </Field>

                  <Field label="Prefiero que me contacten por">
                    <select
                      className="w-full rounded-lg border px-3 py-2"
                      value={canal}
                      onChange={(e) => setCanal(e.target.value)}
                    >
                      <option>WhatsApp</option>
                      <option>Email</option>
                      <option>Teléfono</option>
                    </select>
                  </Field>
                </div>

                {/* Consentimientos */}
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={aceptaTerminos}
                      onChange={(e) => setAceptaTerminos(e.target.checked)}
                    />
                    <span>
                      Acepto los{" "}
                      <a href="#/terminos" className="underline hover:text-slate-900">
                        Términos
                      </a>{" "}
                      y la{" "}
                      <a href="#/privacidad" className="underline hover:text-slate-900">
                        Política de Privacidad
                      </a>
                      . <b>(Obligatorio)</b>
                    </span>
                  </label>

                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={aceptaCompartir}
                      onChange={(e) => setAceptaCompartir(e.target.checked)}
                    />
                    <span>
                      Autorizo a HabitaLibre a <b>compartir mis datos</b> con bancos aliados para
                      avanzar con mi precalificación. <i>(Recomendado)</i>
                    </span>
                  </label>

                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={aceptaMarketing}
                      onChange={(e) => setAceptaMarketing(e.target.checked)}
                    />
                    <span>Deseo recibir tips de financiamiento y ofertas exclusivas.</span>
                  </label>

                  {errores.terminos && (
                    <div className="text-[12px] text-red-600">{errores.terminos}</div>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-5 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    <span className="block">Nunca vendemos tus datos.</span>
                    <span className="block">Puedes darte de baja en cualquier momento.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`px-4 py-2 rounded-lg text-white transition ${
                      canSubmit
                        ? "bg-indigo-600 hover:opacity-90"
                        : "bg-indigo-300 cursor-not-allowed"
                    }`}
                    aria-disabled={!canSubmit}
                  >
                    {loading ? "Procesando…" : "Ver mi resultado"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      {children}
      {error && <div className="mt-1 text-[12px] text-red-600">{error}</div>}
    </div>
  );
}
