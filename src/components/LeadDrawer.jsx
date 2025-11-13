// src/components/LeadDrawer.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/** Detecta si estamos en contexto de administración.
 *  - /admin, /leads, /admindashboard (ruta)
 *  - hash routing (#/admin, etc.)
 *  - query ?admin=1 como “llave de paso” opcional
 */
function isAdminContext() {
  if (typeof window === "undefined") return false;
  try {
    const href = String(window.location.href || "").toLowerCase();
    const path = String(window.location.pathname || "").toLowerCase();
    const hash = String(window.location.hash || "").toLowerCase();

    if (
      path.startsWith("/admin") ||
      path.startsWith("/leads") ||
      path.includes("admindashboard") ||
      hash.includes("#/admin") ||
      hash.includes("#/leads") ||
      href.includes("admin=1")
    ) {
      return true;
    }
  } catch {
    /* noop */
  }
  return false;
}

export default function LeadDrawer({ open, lead, onClose, onSave }) {
  // 🔒 Nunca renderizar en la parte pública
  if (!isAdminContext()) return null;

  const [localLead, setLocalLead] = useState(lead || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalLead(lead || {});
  }, [lead]);

  // Si no está open o no hay lead válido, no mostrar
  if (!open || !lead) return null;

  const handleChange = (field, value) => {
    setLocalLead((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave?.(localLead);
      onClose?.();
    } catch (e) {
      console.error("❌ Error guardando lead:", e);
      alert("❌ Error guardando cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="hl-admin-drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.28 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-[200] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">
            🧍 Lead: {localLead?.nombre || "—"}
          </h3>
          <button
            className="text-slate-500 hover:text-slate-700"
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-sm">
          <Field label="Correo">{localLead?.email || "—"}</Field>
          <Field label="Teléfono">{localLead?.telefono || "—"}</Field>
          <Field label="Ciudad">{localLead?.ciudad || "—"}</Field>
          <Field label="Canal">{localLead?.canal || "—"}</Field>
          <Field label="Afinidad">{localLead?.afinidad || "—"}</Field>

          {/* Etapa */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Etapa</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={localLead?.etapa || "Nuevo"}
              onChange={(e) => handleChange("etapa", e.target.value)}
            >
              <option>Nuevo</option>
              <option>Contactado</option>
              <option>En proceso</option>
              <option>Cerrado</option>
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Notas</label>
            <textarea
              rows={5}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Ej. Cliente interesado, enviar simulación por email…"
              value={localLead?.notas || ""}
              onChange={(e) => handleChange("notas", e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-slate-700 hover:bg-slate-50"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-white ${
              saving ? "bg-indigo-300" : "bg-indigo-600 hover:opacity-90"
            }`}
            disabled={saving}
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-0.5">{label}</label>
      <div className="text-slate-800">{children}</div>
    </div>
  );
}
