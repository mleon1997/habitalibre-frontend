// src/components/LeadDrawer.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LeadDrawer({ open, lead, onClose, onSave }) {
  const [localLead, setLocalLead] = useState(lead || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalLead(lead || {});
  }, [lead]);

  if (!open || !lead) return null;

  const handleChange = (field, value) => {
    setLocalLead((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(localLead);
      onClose();
    } catch (e) {
      alert("❌ Error guardando cambios");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[200] flex flex-col"
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
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-sm">
          <Field label="Correo">{localLead.email || "—"}</Field>
          <Field label="Teléfono">{localLead.telefono || "—"}</Field>
          <Field label="Ciudad">{localLead.ciudad || "—"}</Field>
          <Field label="Canal">{localLead.canal || "—"}</Field>
          <Field label="Afinidad">{localLead.afinidad || "—"}</Field>

          {/* Etapa */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Etapa</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={localLead.etapa || ""}
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
              placeholder="Ej. Cliente interesado, enviar simulación por email..."
              value={localLead.notas || ""}
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
