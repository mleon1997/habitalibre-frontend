import React from "react";
import { useLeadCapture } from "../lead/LeadCaptureContext.jsx";

export default function ResultCard({ data }) {
  const { leadSaved, openLead } = useLeadCapture();

  if (!data?.ok) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-center">
        <div>
          <p className="font-medium text-slate-600 mb-1">Tu simulación aparecerá aquí 👇</p>
          <p className="text-sm text-slate-500">Completa el simulador para ver resultados.</p>
        </div>
      </div>
    );
  }

  if (!leadSaved) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">🔒 Resultado bloqueado</h3>
        <p className="text-slate-600 mb-4">Déjanos tus datos para ver el detalle y recibir tu PDF.</p>
        <button className="btn-primary" onClick={() => openLead(data)}>Ver mi resultado</button>
        <p className="mt-3 text-xs text-slate-500">Sin costo • Sin compromiso • Datos protegidos</p>
      </div>
    );
  }

  const fmt = (n, d=0) => Number(n||0).toLocaleString("en-US", { maximumFractionDigits:d });
  const pct = (n, d=1) => `${fmt((Number(n)||0)*100, d)} %`;

  return (
    <div>
      <div className="mb-4 p-4 rounded-xl border bg-white">
        <div className="flex items-center justify-between mb-1">
          <div className="font-medium text-slate-800">Precalificación tentativa</div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Viable (si aplica)</span>
        </div>
        <p className="text-sm text-slate-600">Resultado referencial, sujeto a validación.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Kpi label="Capacidad de pago" value={`$ ${fmt(data.capacidadPago)}`} />
        <Kpi label="Cuota referencial" value={`$ ${fmt(data.cuotaEstimada)}`} />
        <Kpi label="LTV estimado" value={pct(data.ltv)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Kpi label="Monto préstamo máx." value={`$ ${fmt(data.montoMaximo,0)}`} />
        <Kpi label="Precio máx. vivienda" value={`$ ${fmt(data.precioMaxVivienda,0)}`} />
      </div>

      <p className="mt-4 text-[11px] text-slate-500">
        Este resultado es referencial y no constituye oferta de crédito. Sujeto a políticas de cada entidad.
      </p>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 border">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-800">{value}</div>
    </div>
  );
}
