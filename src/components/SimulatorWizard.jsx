// src/components/SimulatorWizard.jsx
import React, { useMemo, useState, useEffect } from "react";
import { precalificar } from "../lib/api";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";

const TOTAL_STEPS = 4;

// =====================
//  INPUT NUMÉRICO NUEVO
// =====================
function NumericInput({ value, onChangeFinal, placeholder }) {
  const [inner, setInner] = useState(value ?? "");

  // Si desde arriba cambia el valor (por reset, etc.), sincronizamos
  useEffect(() => {
    setInner(value ?? "");
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={inner}
      placeholder={placeholder}
      onChange={(e) => {
        setInner(e.target.value);
      }}
      onBlur={() => {
        // cuando el usuario sale del input, mandamos el valor completo al wizard
        onChangeFinal(inner);
      }}
      className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 outline-none ring-0 transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
    />
  );
}

export default function SimulatorWizard({ onResult }) {
  const { openLead } = useLeadCapture();

  const [step, setStep] = useState(1);

  // ====== Estados (strings) ======
  const [nacionalidad, setNacionalidad] = useState("ecuatoriana");
  const [estadoCivil, setEstadoCivil] = useState("soltero");
  const [edad, setEdad] = useState("30");
  const [tipoIngreso, setTipoIngreso] = useState("Dependiente");
  const [aniosEstabilidad, setAniosEstabilidad] = useState("2");

  const [tieneVivienda, setTieneVivienda] = useState("no");
  const [primeraVivienda, setPrimeraVivienda] = useState("sí");
  const [tipoVivienda, setTipoVivienda] = useState("por_estrenar");

  const [ingreso, setIngreso] = useState("1200");
  const [ingresoPareja, setIngresoPareja] = useState("0");
  const [deudas, setDeudas] = useState("300");

  const [valor, setValor] = useState("90000");
  const [entrada, setEntrada] = useState("15000");

  const [afiliadoIESS, setAfiliadoIESS] = useState("no");
  const [aportesTotales, setAportesTotales] = useState("0");
  const [aportesConsecutivos, setAportesConsecutivos] = useState("0");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const toNum = (v) => {
    const n = Number((v ?? "").toString().replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const afiliadoBool = afiliadoIESS === "sí";
  const esParejaFormal =
    estadoCivil === "casado" || estadoCivil === "union_de_hecho";

  const ingresoUsado =
    toNum(ingreso) + (esParejaFormal ? toNum(ingresoPareja) : 0);

  const preview = useMemo(() => {
    const v = toNum(valor);
    const e = toNum(entrada);
    const loan = Math.max(0, v - e);
    return { loan };
  }, [valor, entrada]);

  // ===== Validaciones =====
  function validate(s) {
    if (s === 2 && ingresoUsado < 400)
      return "El ingreso considerado (tuyo + pareja si aplica) debe ser al menos $400.";
    if (s === 3 && toNum(valor) < 30000)
      return "El valor mínimo de vivienda que analizamos es $30.000.";
    if (s === 4 && (toNum(edad) < 21 || toNum(edad) > 75))
      return "La edad debe estar entre 21 y 75 años.";
    return null;
  }

  const next = () => {
    const e = validate(step);
    if (e) return setErr(e);
    setErr("");
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const back = () => {
    setErr("");
    setStep((s) => Math.max(1, s - 1));
  };

  // ===== Payload =====
  function buildEntrada() {
    return {
      nacionalidad,
      estadoCivil,
      edad: toNum(edad),

      tipoIngreso,
      aniosEstabilidad: toNum(aniosEstabilidad),

      afiliadoIess: afiliadoBool,
      tieneVivienda: tieneVivienda === "sí",
      primeraVivienda: primeraVivienda === "sí",
      tipoVivienda,

      ingresoNetoMensual: toNum(ingreso),
      ingresoPareja: esParejaFormal ? toNum(ingresoPareja) : 0,
      otrasDeudasMensuales: toNum(deudas),

      valorVivienda: toNum(valor),
      entradaDisponible: toNum(entrada),

      iessAportesTotales: toNum(aportesTotales),
      iessAportesConsecutivos: toNum(aportesConsecutivos),

      origen: "simulador",
    };
  }

  async function handleCalcular() {
    const e = validate(4);
    if (e) return setErr(e);

    setLoading(true);
    try {
      const payload = buildEntrada();
      const res = await precalificar(payload);

      onResult?.(res);
      openLead(res);
    } catch (ex) {
      console.error(ex);
      setErr("No se pudo calcular tu resultado ahora.");
    } finally {
      setLoading(false);
    }
  }

  const progress = (step / TOTAL_STEPS) * 100;

  // ===== Helpers visuales =====
  const Field = ({ label, children, helper }) => (
    <div className="mb-4">
      <label className="mb-1 block text-xs font-medium text-slate-200">
        {label}
      </label>
      {children}
      {helper && (
        <p className="mt-1 text-[11px] text-slate-400 leading-snug">
          {helper}
        </p>
      )}
    </div>
  );

  const TextInput = ({ value, onChange, ...rest }) => (
    <input
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 outline-none ring-0 transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
    />
  );

  // ================== RENDER ==================
  return (
    <div className="text-slate-50">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Simulador HabitaLibre
          </h2>
          <p className="text-[11px] text-slate-400">
            Completa los pasos y te mostramos un resultado claro en menos de 2
            minutos.
          </p>
        </div>
        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-slate-700/80">
          Paso {step}/{TOTAL_STEPS}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* PASO 1: DATOS BÁSICOS (versión corta) */}
  {step === 1 && (
  <div>
    <Field label="Nacionalidad">
      <select
        className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
        value={nacionalidad}
        onChange={(e) => setNacionalidad(e.target.value)}
      >
        <option value="ecuatoriana">Ecuatoriana 🇪🇨</option>
        <option value="otra">Otra nacionalidad 🌍</option>
      </select>
    </Field>

    <Field
      label="Estado civil"
      helper="Si estás casad@ o en unión de hecho, podremos considerar el ingreso de tu pareja."
    >
      <select
        className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
        value={estadoCivil}
        onChange={(e) => setEstadoCivil(e.target.value)}
      >
        <option value="soltero">Soltero/a</option>
        <option value="casado">Casado/a</option>
        <option value="union_de_hecho">Unión de hecho</option>
        <option value="divorciado">Divorciado/a</option>
        <option value="viudo">Viudo/a</option>
      </select>
    </Field>

    <Field label="Edad">
      <NumericInput value={edad} onChangeFinal={setEdad} />
    </Field>

    <Field label="Tipo de ingreso">
      <select
        className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
        value={tipoIngreso}
        onChange={(e) => setTipoIngreso(e.target.value)}
      >
        <option value="Dependiente">Relación de dependencia</option>
        <option value="Independiente">Independiente / RUC</option>
        <option value="Mixto">Mixto</option>
      </select>
    </Field>

    <Field
      label="Años de estabilidad laboral"
      helper="Tiempo en tu empleo actual o actividad principal."
    >
      <NumericInput
        value={aniosEstabilidad}
        onChangeFinal={setAniosEstabilidad}
      />
    </Field>

    {err && (
      <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
        {err}
      </div>
    )}

    <div className="mt-5 flex justify-end gap-3">
      <button className="btn-primary btn-sm" onClick={next}>
        Siguiente
      </button>
    </div>
  </div>
)}


      {/* PASO 2: INGRESOS Y DEUDAS */}
      {step === 2 && (
        <div className="space-y-6">
          <Field label="Tu ingreso neto mensual">
            <NumericInput
              value={ingreso}
              onChangeFinal={setIngreso}
              placeholder="Ej: 1.200"
            />
          </Field>

          {["casado", "union_de_hecho"].includes(estadoCivil) && (
            <Field label="Ingreso neto mensual de tu pareja (opcional)">
              <NumericInput
                value={ingresoPareja}
                onChangeFinal={setIngresoPareja}
                placeholder="Ej: 800"
              />
            </Field>
          )}

          <Field label="Otras deudas mensuales (tarjetas, préstamos, etc.)">
            <NumericInput
              value={deudas}
              onChangeFinal={setDeudas}
              placeholder="Ej: 300"
            />
          </Field>

          <Field label="¿Estás afiliado al IESS?">
            <select
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
              value={afiliadoIESS}
              onChange={(e) => setAfiliadoIESS(e.target.value)}
            >
              <option value="no">No</option>
              <option value="sí">Sí</option>
            </select>
          </Field>

          {afiliadoBool && (
            <>
              <Field
                label="Aportes IESS totales (meses)"
                helper="Para créditos BIESS suelen requerirse al menos 36 aportes totales."
              >
                <NumericInput
                  value={aportesTotales}
                  onChangeFinal={setAportesTotales}
                />
              </Field>

              <Field
                label="Aportes IESS consecutivos (meses)"
                helper="Suelen pedir mínimo 13 aportes consecutivos."
              >
                <NumericInput
                  value={aportesConsecutivos}
                  onChangeFinal={setAportesConsecutivos}
                />
              </Field>
            </>
          )}

          {err && (
            <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
              {err}
            </div>
          )}

          <div className="mt-5 flex justify-between gap-3">
            <button className="btn-ghost btn-sm" onClick={back}>
              Atrás
            </button>
            <button className="btn-primary btn-sm" onClick={next}>
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: VIVIENDA */}
      {step === 3 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-100">
            🏠 Vivienda
          </h3>

          <Field label="Valor aproximado de la vivienda (USD)">
            <NumericInput value={valor} onChangeFinal={setValor} />
          </Field>

          <Field
            label="Entrada disponible (USD)"
            helper="Incluye ahorros, cesantía, fondos de reserva u otros."
          >
            <NumericInput value={entrada} onChangeFinal={setEntrada} />
          </Field>

          {err && (
            <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
              {err}
            </div>
          )}

          <div className="mt-5 flex justify-between gap-3">
            <button className="btn-ghost btn-sm" onClick={back}>
              Atrás
            </button>
            <button className="btn-primary btn-sm" onClick={next}>
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* PASO 4: CONFIRMACIÓN */}
      {step === 4 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-100">
            ✅ Listo para ver tu resultado
          </h3>

          <p className="text-[11px] text-slate-400 mb-3">
            Revisaremos tu capacidad de pago, tipo de crédito (VIS/VIP/BIESS/
            privado) y te mostraremos un resumen claro. No afecta tu buró.
          </p>

          <div className="mb-3 text-[11px] text-slate-500">
            Monto referencial a analizar:
            <span className="font-semibold text-slate-100">
              {" "}
              $
              {preview.loan.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>

          {err && (
            <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
              {err}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <button className="btn-ghost btn-sm" onClick={back}>
              Atrás
            </button>
            <button
              className="btn-primary btn-sm"
              onClick={handleCalcular}
              disabled={loading}
            >
              {loading ? "Analizando perfil…" : "Ver resultados"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
