// src/pages/AppJourney.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { trackPageView } from "../lib/analytics";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

const LS_JOURNEY = "hl_app_journey_v4";

function loadJourney() {
  try {
    const raw = localStorage.getItem(LS_JOURNEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveJourney(data) {
  try {
    localStorage.setItem(LS_JOURNEY, JSON.stringify(data));
  } catch {}
}

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const onlyDigits = (v) => String(v ?? "").replace(/[^\d]/g, "");
const toNum = (v) => {
  const s = onlyDigits(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const moneySoft = (v) => {
  const n = toNum(v);
  if (n == null) return "";
  return `$${n.toLocaleString("es-EC")}`;
};
const yesNoToBool = (v) => {
  const s = String(v ?? "").toLowerCase();
  if (["si", "sí", "true", "1"].includes(s)) return true;
  if (["no", "false", "0"].includes(s)) return false;
  return null;
};

function Field({ label, hint, error, children }) {
  return (
    <div className="mb-4">
      <div className="text-[12px] text-slate-300 mb-1">{label}</div>
      {children}
      {hint ? <div className="text-[11px] text-slate-500 mt-1">{hint}</div> : null}
      {error ? <div className="text-[11px] text-rose-300 mt-1">{error}</div> : null}
    </div>
  );
}

export default function AppJourney() {
  const nav = useNavigate();
  const { token } = useCustomerAuth();

  const isMobileMode = new URLSearchParams(window.location.search).get("mode") === "mobile";

  const saved = useMemo(() => loadJourney(), []);
  const [step, setStep] = useState(saved?.step || 1);
  const [form, setForm] = useState(
    saved?.form || {
      ingresoNetoMensual: "",
      ingresoPareja: "",
      valorVivienda: "",
      entradaDisponible: "",
      edad: "",
      ciudadCompra: "Quito",
      afiliadoIess: "si",
      otrasDeudasMensuales: "",
    }
  );

  const [calcResult, setCalcResult] = useState(saved?.calcResult || null);
  const [calcBusy, setCalcBusy] = useState(false);
  const [calcError, setCalcError] = useState("");

  const persist = (nextStepVal, nextForm, nextCalc = calcResult) => {
    saveJourney({
      step: nextStepVal,
      form: nextForm,
      calcResult: nextCalc,
      updatedAt: new Date().toISOString(),
    });
  };

  const set = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    persist(step, next);
  };

  const stepsTotal = 4;
  const pct = Math.round((step / stepsTotal) * 100);

  useEffect(() => {
    trackPageView("app_journey");
  }, []);

  // ✅ Validaciones mínimas para probar flujo
  const errors = useMemo(() => {
    const e = {};
    if (step === 2) {
      const inc = toNum(form.ingresoNetoMensual);
      if (inc == null || inc <= 0) e.ingresoNetoMensual = "Ingresa tu ingreso neto mensual.";
    }
    if (step === 3) {
      const vv = toNum(form.valorVivienda);
      const edad = toNum(form.edad);
      if (vv == null || vv <= 0) e.valorVivienda = "Ingresa el valor de la vivienda.";
      if (edad == null || edad < 18 || edad > 80) e.edad = "Ingresa una edad válida (18–80).";
    }
    return e;
  }, [step, form]);

  const canNext = useMemo(() => {
    if (step === 1) return true;
    if (step === 2) return !errors.ingresoNetoMensual;
    if (step === 3) return !errors.valorVivienda && !errors.edad;
    return false; // step 4 no avanza
  }, [step, errors]);

  const nextStep = () => {
    if (!canNext && step !== 1) return;
    const s = clamp(step + 1, 1, stepsTotal);
    setStep(s);
    persist(s, form);
  };

  const prevStep = () => {
    const s = clamp(step - 1, 1, stepsTotal);
    setStep(s);
    persist(s, form);
  };

  const goLogin = () => {
    nav("/login", { state: { returnTo: "/app" } });
  };

  const payload = useMemo(
    () => ({
      ingresoNetoMensual: toNum(form.ingresoNetoMensual) ?? 0,
      ingresoPareja: toNum(form.ingresoPareja) ?? 0,
      otrasDeudasMensuales: toNum(form.otrasDeudasMensuales) ?? 0,
      valorVivienda: toNum(form.valorVivienda) ?? 0,
      entradaDisponible: toNum(form.entradaDisponible) ?? 0,
      edad: toNum(form.edad),
      ciudad: form.ciudadCompra,
      afiliadoIess: yesNoToBool(form.afiliadoIess) ?? false,
    }),
    [form]
  );

  const calcular = async () => {
    if (!token) return;
    setCalcBusy(true);
    setCalcError("");
    try {
      const resp = await fetch(`${API_BASE}/api/precalificar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await resp.json();
      } catch {
        data = null;
      }

      if (!resp.ok) {
        const msg = data?.message || `Error HTTP ${resp.status}`;
        throw new Error(msg);
      }

      setCalcResult(data);
      persist(4, form, data);
    } catch (e) {
      setCalcError(e?.message || "No pudimos calcular tu resultado.");
      setCalcResult(null);
      persist(4, form, null);
    } finally {
      setCalcBusy(false);
    }
  };

  useEffect(() => {
    if (step === 4 && token) calcular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, token]);

  const sinOferta = !!calcResult?.sinOferta;

  return (
    <div className="min-h-screen bg-[#060B14] text-slate-50 px-4 py-6">
      <div className="max-w-[520px] mx-auto">
        {/* ✅ Debug marker para confirmar que NO es landing */}
        <div className="fixed top-3 right-3 z-[99999] rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] text-emerald-200">
          APP JOURNEY {isMobileMode ? "· MODO APP" : "· WEB"}
        </div>

        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-[11px] tracking-widest text-slate-400">HABITALIBRE · JOURNEY</div>
            <div className="text-xl font-semibold">Paso {step} de {stepsTotal}</div>
          </div>
          <div className="text-sm text-slate-400">{pct}%</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full mb-6">
          <div className="h-2 bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold mb-4">¿Dónde quieres comprar?</h2>

              <Field label="Ciudad">
                <select
                  value={form.ciudadCompra}
                  onChange={(e) => set("ciudadCompra", e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3"
                >
                  <option>Quito</option>
                  <option>Guayaquil</option>
                  <option>Cuenca</option>
                  <option>Manta</option>
                  <option>Ambato</option>
                </select>
              </Field>

              <div className="text-[12px] text-slate-300 mb-2">¿Afiliado al IESS?</div>
              <div className="flex gap-3">
                <button
                  onClick={() => set("afiliadoIess", "si")}
                  className={`flex-1 rounded-xl py-3 border ${
                    form.afiliadoIess === "si" ? "bg-emerald-400 text-slate-900 border-emerald-300" : "border-slate-700"
                  }`}
                >
                  Sí
                </button>
                <button
                  onClick={() => set("afiliadoIess", "no")}
                  className={`flex-1 rounded-xl py-3 border ${
                    form.afiliadoIess === "no" ? "bg-emerald-400 text-slate-900 border-emerald-300" : "border-slate-700"
                  }`}
                >
                  No
                </button>
              </div>

              <div className="mt-4 text-[11px] text-slate-500">
                * Esto es una precalificación educativa. No consultamos buró.
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold mb-4">Tus ingresos</h2>

              <Field label="Ingreso neto mensual" hint={moneySoft(form.ingresoNetoMensual)} error={errors.ingresoNetoMensual}>
                <input
                  value={form.ingresoNetoMensual}
                  onChange={(e) => set("ingresoNetoMensual", onlyDigits(e.target.value))}
                  inputMode="numeric"
                  placeholder="Ej: 850"
                  className={`w-full rounded-xl bg-slate-800 border px-4 py-3 outline-none ${
                    errors.ingresoNetoMensual ? "border-rose-400/60" : "border-slate-700"
                  }`}
                />
              </Field>

              <Field label="Ingreso pareja (opcional)" hint={moneySoft(form.ingresoPareja)}>
                <input
                  value={form.ingresoPareja}
                  onChange={(e) => set("ingresoPareja", onlyDigits(e.target.value))}
                  inputMode="numeric"
                  placeholder="Ej: 600"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none"
                />
              </Field>

              <Field label="Otras deudas mensuales (opcional)" hint={moneySoft(form.otrasDeudasMensuales)}>
                <input
                  value={form.otrasDeudasMensuales}
                  onChange={(e) => set("otrasDeudasMensuales", onlyDigits(e.target.value))}
                  inputMode="numeric"
                  placeholder="Ej: 120"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none"
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold mb-4">Tu vivienda</h2>

              <Field label="Valor de la vivienda" hint={moneySoft(form.valorVivienda)} error={errors.valorVivienda}>
                <input
                  value={form.valorVivienda}
                  onChange={(e) => set("valorVivienda", onlyDigits(e.target.value))}
                  inputMode="numeric"
                  placeholder="Ej: 71000"
                  className={`w-full rounded-xl bg-slate-800 border px-4 py-3 outline-none ${
                    errors.valorVivienda ? "border-rose-400/60" : "border-slate-700"
                  }`}
                />
              </Field>

              <Field label="Entrada disponible (opcional)" hint={moneySoft(form.entradaDisponible)}>
                <input
                  value={form.entradaDisponible}
                  onChange={(e) => set("entradaDisponible", onlyDigits(e.target.value))}
                  inputMode="numeric"
                  placeholder="Ej: 5000"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none"
                />
              </Field>

              <Field label="Edad" error={errors.edad}>
                <input
                  value={form.edad}
                  onChange={(e) => set("edad", onlyDigits(e.target.value))}
                  inputMode="numeric"
                  placeholder="Ej: 29"
                  className={`w-full rounded-xl bg-slate-800 border px-4 py-3 outline-none ${
                    errors.edad ? "border-rose-400/60" : "border-slate-700"
                  }`}
                />
              </Field>
            </>
          )}

          {step === 4 && !token && (
            <>
              <h2 className="text-lg font-semibold mb-2">Guarda tu progreso</h2>
              <p className="text-sm text-slate-400 mb-4">
                Para ver tu resultado dentro de la app y guardar tu plan, inicia sesión.
              </p>

              <button
                onClick={goLogin}
                className="w-full bg-emerald-400 text-slate-900 font-semibold rounded-xl py-3"
              >
                Iniciar sesión / Crear cuenta
              </button>

              {!isMobileMode && (
                <button
                  onClick={() => nav("/precalificar")}
                  className="w-full mt-3 border border-slate-700 rounded-xl py-3"
                >
                  Usar simulador web
                </button>
              )}
            </>
          )}

          {step === 4 && token && (
            <>
              <h2 className="text-lg font-semibold mb-3">Tu resultado (estimado)</h2>

              {calcBusy && (
                <div className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3 text-sm">
                  Calculando...
                </div>
              )}

              {calcError && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {calcError}
                  <button
                    onClick={calcular}
                    className="mt-3 w-full rounded-xl border border-slate-700 py-3 text-slate-100"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!calcBusy && !calcError && calcResult && (
                <>
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-4">
                    <div className="text-base font-semibold">
                      {sinOferta ? "Necesitamos mejorar tu perfil" : "Sí hay ruta posible 🎉"}
                    </div>
                    <div className="text-[12px] text-slate-400 mt-2">
                      {sinOferta
                        ? "No es un “no”. Es un “ajustemos precio, entrada o plazo”."
                        : "Te ayudamos a convertir esto en un plan real con checklist."}
                    </div>
                  </div>

                  <button
                    className="w-full mt-4 bg-emerald-400 text-slate-900 font-semibold rounded-xl py-3"
                    onClick={() => {
                      window.location.href =
                        "https://wa.me/593000000000?text=Hola%20HabitaLibre%2C%20quiero%20mi%20plan%20y%20checklist%20para%20mi%20cr%C3%A9dito.";
                    }}
                  >
                    {sinOferta ? "Quiero mejorar mi perfil" : "Iniciar mi proceso"}
                  </button>

                  <button
                    className="w-full mt-3 border border-slate-700 rounded-xl py-3"
                    onClick={calcular}
                  >
                    Recalcular
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Nav */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="flex-1 border border-slate-700 rounded-xl py-3 disabled:opacity-50"
          >
            Atrás
          </button>

          <button
            onClick={nextStep}
            disabled={step === 4 || !canNext}
            className="flex-1 bg-emerald-400 text-slate-900 rounded-xl py-3 font-semibold disabled:opacity-50"
          >
            Continuar
          </button>
        </div>

        {step !== 4 && !canNext && (
          <div className="mt-3 text-[12px] text-slate-400">
            Completa los campos marcados para continuar.
          </div>
        )}
      </div>
    </div>
  );
}
