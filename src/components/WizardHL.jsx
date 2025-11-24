 // src/components/WizardHL.jsx
import React, { useMemo, useState, useEffect } from "react";
import { precalificar } from "../lib/api";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";

const TOTAL_STEPS = 4;

// Opciones para horizonte de compra
const HORIZONTE_OPCIONES = [
  { value: "0-3", label: "En los próximos 0–3 meses" },
  { value: "3-12", label: "En 3–12 meses" },
  { value: "12-24", label: "En 12–24 meses" },
  { value: "explorando", label: "Solo estoy explorando" },
];

/* ===========================================================
   INPUT NUMÉRICO (solo para campos especiales si lo necesitas)
=========================================================== */
function NumericInput({
  value,
  onChangeFinal,
  placeholder,
  min,
  max,
  integer = false,
}) {
  const [inner, setInner] = useState(value ?? "");

  useEffect(() => {
    setInner(value ?? "");
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;

    if (raw === "") {
      setInner("");
      onChangeFinal("");
      return;
    }

    let num = Number(raw);
    if (!Number.isFinite(num)) return;

    if (typeof min === "number" && num < min) num = min;
    if (typeof max === "number" && num > max) num = max;
    if (integer) num = Math.round(num);

    const finalStr = String(num);
    setInner(finalStr);
    onChangeFinal(finalStr);
  };

  const handleKeyDown = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      value={inner}
      placeholder={placeholder}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      min={min}
      max={max}
      step={integer ? 1 : "0.01"}
      className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 outline-none ring-0 transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
    />
  );
}

/* ===========================================================
   SLIDER UNIFICADO
   - Misma experiencia para TODOS los sliders
   - Se puede hacer slide con mouse o dedo
=========================================================== */
function SliderField({
  label,
  helper,
  min,
  max,
  step = 1,
  value,
  onChange,
  format = (v) => v,
}) {
  const num = Number(value) || 0;

  const handleChange = (e) => {
    const v = Number(e.target.value);
    if (!Number.isFinite(v)) return;
    onChange(String(v));
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1 block text-xs font-medium text-slate-200">
          {label}
        </label>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
        <span>{format(num)}</span>
        <span className="opacity-70">
          {format(min)} – {format(max)}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={num}
        onChange={handleChange}
        className={`
          w-full cursor-pointer touch-pan-y accent-violet-400

          /* WebKit (Chrome, Safari, Edge Chromium) */
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border
          [&::-webkit-slider-thumb]:border-violet-500
          [&::-webkit-slider-thumb]:shadow
          [&::-webkit-slider-thumb]:cursor-pointer

          /* Firefox */
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:border
          [&::-moz-range-thumb]:border-violet-500
          [&::-moz-range-thumb]:shadow
          [&::-moz-range-thumb]:cursor-pointer
        `}
      />

      {helper && (
        <p className="mt-1 text-[11px] text-slate-400 leading-snug">{helper}</p>
      )}
    </div>
  );
}

export default function WizardHL({ onResult }) {
  const { openLead } = useLeadCapture();

  const [step, setStep] = useState(1);

  // ====== Estados ======
  const [nacionalidad, setNacionalidad] = useState("ecuatoriana");
  const [estadoCivil, setEstadoCivil] = useState("soltero");
  const [edad, setEdad] = useState("30");

  const [tipoIngreso, setTipoIngreso] = useState("Dependiente");
  const [aniosEstabilidad, setAniosEstabilidad] = useState("2");

  // Cómo sustenta ingresos si es independiente/mixto
  const [sustentoIndependiente, setSustentoIndependiente] =
    useState("declaracion");

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

  // 🌟 Horizonte
  const [horizonteCompra, setHorizonteCompra] = useState("");

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
    return { loan: Math.max(0, v - e) };
  }, [valor, entrada]);

  // VALIDACIONES (para avanzar de paso)
  function validate(s) {
    if (
      s === 1 &&
      (tipoIngreso === "Dependiente" || tipoIngreso === "Mixto") &&
      toNum(aniosEstabilidad) < 1
    ) {
      return "Mínimo 1 año en tu empleo actual o actividad principal.";
    }

    if (s === 2 && ingresoUsado < 400)
      return "El ingreso considerado (tuyo + pareja si aplica) debe ser al menos $400.";
    if (s === 3 && toNum(valor) < 30000)
      return "El valor mínimo de vivienda que analizamos es $30.000.";
    if (s === 3 && !horizonteCompra)
      return "Elige en qué plazo te gustaría adquirir tu vivienda.";
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

  // PAYLOAD PARA EL BACKEND
  function buildEntrada() {
    return {
      nacionalidad,
      estadoCivil,
      edad: toNum(edad),

      tipoIngreso,
      aniosEstabilidad: toNum(aniosEstabilidad),

      // Enviamos cómo sustenta ingresos si aplica
      sustentoIndependiente,

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

      tiempoCompra: horizonteCompra || null,

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

      // 👉 Guardamos en contexto y abrimos el modal de lead
      openLead(res);

      // Compatibilidad por si algún contenedor usa onResult
      onResult?.(res);
    } catch (ex) {
      console.error(ex);
      setErr("No se pudo calcular tu resultado ahora.");
    } finally {
      setLoading(false);
    }
  }

  const progress = (step / TOTAL_STEPS) * 100;

  // Helpers visuales
  const Field = ({ label, children, helper }) => (
    <div className="mb-4 relative">
      <label className="mb-1 block text-xs font-medium text-slate-200">
        {label}
      </label>
      {children}
      {helper && (
        <p className="mt-1 text-[11px] text-slate-400 leading-snug">{helper}</p>
      )}
    </div>
  );

  // ============================
  // RENDER
  // ============================
  return (
    <div className="text-slate-50 relative z-[10]">
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

      {/* Barra */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Paso 1: Datos básicos */}
      {step === 1 && (
        <div>
          <Field label="Nacionalidad">
            <select
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
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
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
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

          {/* Edad como slider */}
          <SliderField
            label="Edad"
            min={21}
            max={75}
            value={edad}
            onChange={setEdad}
            format={(v) => `${v} años`}
          />

          <Field label="Tipo de ingreso">
            <select
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
              value={tipoIngreso}
              onChange={(e) => setTipoIngreso(e.target.value)}
            >
              <option value="Dependiente">Relación de dependencia</option>
              <option value="Independiente">Independiente / RUC</option>
              <option value="Mixto">Mixto</option>
            </select>
          </Field>

          {/* Sólo Dependiente o Mixto → años de estabilidad */}
          {(tipoIngreso === "Dependiente" || tipoIngreso === "Mixto") && (
            <SliderField
              label="Años de estabilidad laboral"
              helper="Mínimo 1 año en tu empleo actual o actividad principal."
              min={1}
              max={40}
              value={aniosEstabilidad}
              onChange={setAniosEstabilidad}
              format={(v) => `${v} años`}
            />
          )}

          {/* Independiente o Mixto → cómo sustenta ingresos */}
          {(tipoIngreso === "Independiente" || tipoIngreso === "Mixto") && (
            <Field
              label="¿Cómo sustentas tus ingresos?"
              helper="Esto ayuda a saber si calificas mejor por IR o por historial bancario."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[13px]">
                {[
                  {
                    value: "declaracion",
                    label: "Declaración de Impuesto a la Renta",
                  },
                  {
                    value: "movimientos",
                    label: "Movimientos bancarios últimos 6 meses",
                  },
                  { value: "ambos", label: "Ambos" },
                  { value: "informal", label: "Ninguno (ingreso informal)" },
                ].map((opt) => {
                  const selected = sustentoIndependiente === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSustentoIndependiente(opt.value)}
                      className={[
                        "rounded-xl border px-3 py-2 text-left transition",
                        selected
                          ? "bg-sky-500 text-slate-900 border-sky-400 shadow-lg shadow-sky-500/30"
                          : "bg-slate-900/60 text-slate-200 border-slate-700/70 hover:border-sky-400/60 hover:bg-slate-900",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}

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

      {/* Paso 2 */}
      {step === 2 && (
        <div className="space-y-6">
          <SliderField
            label="Tu ingreso neto mensual"
            min={0}
            max={20000}
            value={ingreso}
            onChange={setIngreso}
            format={(v) =>
              `$${Number(v || 0).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}`
            }
          />

          {["casado", "union_de_hecho"].includes(estadoCivil) && (
            <SliderField
              label="Ingreso neto mensual de tu pareja (opcional)"
              min={0}
              max={20000}
              value={ingresoPareja}
              onChange={setIngresoPareja}
              format={(v) =>
                `$${Number(v || 0).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}`
              }
            />
          )}

          <SliderField
            label="Otras deudas mensuales (tarjetas, préstamos, etc.)"
            min={0}
            max={15000}
            value={deudas}
            onChange={setDeudas}
            format={(v) =>
              `$${Number(v || 0).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}`
            }
          />

          <Field label="¿Estás afiliado al IESS?">
            <select
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
              value={afiliadoIESS}
              onChange={(e) => setAfiliadoIESS(e.target.value)}
            >
              <option value="no">No</option>
              <option value="sí">Sí</option>
            </select>
          </Field>

          {afiliadoBool && (
            <>
              <SliderField
                label="Aportes IESS totales (meses)"
                helper="Para créditos BIESS suelen requerirse al menos 36 aportes totales."
                min={0}
                max={600}
                value={aportesTotales}
                onChange={setAportesTotales}
                format={(v) => `${v} meses`}
              />

              <SliderField
                label="Aportes IESS consecutivos (meses)"
                helper="Suelen pedir mínimo 13 aportes consecutivos."
                min={0}
                max={600}
                value={aportesConsecutivos}
                onChange={setAportesConsecutivos}
                format={(v) => `${v} meses`}
              />
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

      {/* Paso 3 */}
      {step === 3 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-100">
            🏠 Vivienda
          </h3>

          <SliderField
            label="Valor aproximado de la vivienda (USD)"
            min={30000}
            max={500000}
            step={1000}
            value={valor}
            onChange={setValor}
            format={(v) =>
              `$${Number(v || 0).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}`
            }
          />

          <SliderField
            label="Entrada disponible (USD)"
            helper="Incluye ahorros, cesantía, fondos de reserva u otros."
            min={0}
            max={500000}
            step={1000}
            value={entrada}
            onChange={setEntrada}
            format={(v) =>
              `$${Number(v || 0).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}`
            }
          />

          <Field label="¿Tienes actualmente una vivienda?">
            <select
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
              value={tieneVivienda}
              onChange={(e) => setTieneVivienda(e.target.value)}
            >
              <option value="no">No</option>
              <option value="sí">Sí</option>
            </select>
          </Field>

          <Field label="¿Es tu primera vivienda?">
            <select
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
              value={primeraVivienda}
              onChange={(e) => setPrimeraVivienda(e.target.value)}
            >
              <option value="sí">Sí</option>
              <option value="no">No</option>
            </select>
          </Field>

          <Field label="Estado de la vivienda">
            <select
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
              value={tipoVivienda}
              onChange={(e) => setTipoVivienda(e.target.value)}
            >
              <option value="por_estrenar">Por estrenar / proyecto nuevo</option>
              <option value="usada">Usada / segunda mano</option>
            </select>
          </Field>

          {/* 🌟 HORIZONTE COMO CHIPS SUPER VISIBLES */}
          <Field label="¿En qué plazo te gustaría adquirir tu vivienda?">
            <fieldset className="grid grid-cols-2 gap-2 text-[13px]">
              {HORIZONTE_OPCIONES.map((opt) => {
                const selected = horizonteCompra === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHorizonteCompra(opt.value)}
                    className={[
                      "flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition",
                      selected
                        ? "bg-emerald-500 text-slate-900 border-emerald-400 shadow-lg shadow-emerald-500/30"
                        : "bg-slate-900/60 text-slate-200 border-slate-700/70 hover:border-emerald-400/60 hover:bg-slate-900",
                    ].join(" ")}
                  >
                    <span className="flex-1">{opt.label}</span>
                    <span
                      className={[
                        "ml-2 flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold",
                        selected
                          ? "border-slate-900 bg-slate-900 text-emerald-400"
                          : "border-slate-600 text-slate-500",
                      ].join(" ")}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </fieldset>

            <p className="mt-1 text-[11px] text-slate-400">
              {horizonteCompra
                ? `Has seleccionado: ${
                    HORIZONTE_OPCIONES.find(
                      (o) => o.value === horizonteCompra
                    )?.label || ""
                  }`
                : "Selecciona una opción para continuar."}
            </p>
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

      {/* Paso 4 */}
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
