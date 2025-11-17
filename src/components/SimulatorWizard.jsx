// src/components/SimulatorWizard.jsx
import React, { useMemo, useState } from "react";
import { precalificar } from "../lib/api";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";

const TOTAL_STEPS = 4;

export default function SimulatorWizard({
  onResult,
  aportesTotales: aportesTotalesProp,
  setAportesTotales: setAportesTotalesProp,
  aportesConsecutivos: aportesConsecutivosProp,
  setAportesConsecutivos: setAportesConsecutivosProp,
}) {
  const { openLead } = useLeadCapture();

  const [step, setStep] = useState(1);

  // ===== DATOS BÁSICOS =====
  const [nacionalidad, setNacionalidad] = useState("ecuatoriana");
  const [estadoCivil, setEstadoCivil] = useState("soltero");
  const [edad, setEdad] = useState(30);

  // ===== INGRESOS / DEUDAS =====
  const [ingreso, setIngreso] = useState(1600);
  const [ingresoPareja, setIngresoPareja] = useState(0);
  const [deudas, setDeudas] = useState(300);
  const [tipoIngreso, setTipoIngreso] = useState("Dependiente");

  // ===== VIVIENDA / ENTRADA (mantener en estado, pero inputs no controlados) =====
  const [valor, setValor] = useState(90000);
  const [entrada, setEntrada] = useState(15000);

  // ===== PERFIL / IESS =====
  const [afiliadoIESS, setAfiliadoIESS] = useState(false);

  const [aportesTotalesLocal, setAportesTotalesLocal] = useState(0);
  const [aportesConsecutivosLocal, setAportesConsecutivosLocal] = useState(0);

  const aportesTotales = aportesTotalesProp ?? aportesTotalesLocal;
  const setAportesTotales = setAportesTotalesProp ?? setAportesTotalesLocal;

  const aportesConsecutivos = aportesConsecutivosProp ?? aportesConsecutivosLocal;
  const setAportesConsecutivos =
    aportesConsecutivosProp ?? setAportesConsecutivosLocal;

  // ===== NUEVAS PREGUNTAS CLAVE =====
  const [esPrimeraVivienda, setEsPrimeraVivienda] = useState(true);
  const [estadoVivienda, setEstadoVivienda] = useState("por_estrenar"); // por_estrenar | usada

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const esParejaFormal =
    estadoCivil === "casado" || estadoCivil === "union_de_hecho";

  const ingresoUsado =
    Number(ingreso || 0) +
    (esParejaFormal ? Number(ingresoPareja || 0) : 0);

  const valorNum = Number(valor || 0);
  const entradaNum = Number(entrada || 0);

  const preview = useMemo(() => {
    const loan = Math.max(0, valorNum - entradaNum);
    return { loan };
  }, [valorNum, entradaNum]);

  // ===== VALIDACIÓN POR PASO =====
  function validate(s) {
    if (s === 2 && ingresoUsado < 400)
      return "El ingreso considerado (tuyo + pareja si aplica) debe ser al menos $400.";
    if (s === 3 && (valorNum || 0) < 30000)
      return "El valor mínimo de vivienda que analizamos es $30.000.";
    if (s === 4 && (Number(edad) < 21 || Number(edad) > 75))
      return "La edad debe estar entre 21 y 75 años.";
    if (s === 3 && entradaNum < valorNum * 0.05)
      return `La entrada mínima sugerida es 5% del valor de la vivienda (~$${Math.ceil(
        valorNum * 0.05
      ).toLocaleString("es-EC")}).`;

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

  // ===== PAYLOAD BACKEND =====
  function buildEntrada() {
    const tieneVivienda = !esPrimeraVivienda;

    return {
      nacionalidad,
      estadoCivil,
      edad: Number(edad || 0),

      afiliadoIess: afiliadoIESS,
      tipoIngreso,
      aniosEstabilidad: 2,

      iessAportesTotales: Number(aportesTotales || 0),
      iessAportesConsecutivos: Number(aportesConsecutivos || 0),

      ingresoNetoMensual: Number(ingreso || 0),
      ingresoPareja: esParejaFormal ? Number(ingresoPareja || 0) : 0,
      otrasDeudasMensuales: Number(deudas || 0),

      valorVivienda: valorNum,
      entradaDisponible: entradaNum,

      tieneVivienda,
      estadoVivienda,

      origen: "simulador",
    };
  }

  async function handleCalcular() {
    const e = validate(4);
    if (e) return setErr(e);

    setLoading(true);
    try {
      const entradaPayload = buildEntrada();
      const res = await precalificar(entradaPayload);

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

  // ===== SUBCOMPONENTES =====
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

  const Input = (props) => (
    <input
      {...props}
      className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 outline-none ring-0 transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
    />
  );

  // 🔥 Estos inputs son NO CONTROLADOS para evitar el glitch
  function UncontrolledMoneyInput({ defaultValue, onValueChange, ...rest }) {
    return (
      <input
        {...rest}
        type="number"
        inputMode="decimal"
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 outline-none ring-0 transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
        onBlur={(e) => {
          const raw = e.target.value;
          const num = Number(raw || 0);
          onValueChange(Number.isFinite(num) ? num : 0);
        }}
      />
    );
  }

  const MoneyInputControlled = ({ value, onChange, ...rest }) => (
    <input
      {...rest}
      type="number"
      inputMode="decimal"
      className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 outline-none ring-0 transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
      value={value}
      onChange={(e) => onChange(Number(e.target.value || 0))}
    />
  );

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

      {/* ========== PASO 1: DATOS BÁSICOS ========== */}
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
            </select>
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

      {/* ========== PASO 2: INGRESOS Y DEUDAS ========== */}
      {step === 2 && (
        <div className="space-y-6">
          {/* INGRESO NETO MENSUAL */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-200">
              Tu ingreso neto mensual
            </label>

            <MoneyInputControlled
              value={ingreso}
              onChange={setIngreso}
              placeholder="Ej: 1.600"
            />

            <p className="text-xs text-slate-400 leading-tight">
              Ingreso libre después de descuentos IESS.
            </p>
          </div>

          {/* TIPO DE INGRESO */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-200">
              Tipo de ingreso
            </label>

            <div className="relative">
              <select
                value={tipoIngreso}
                onChange={(e) => setTipoIngreso(e.target.value)}
                className="
                  w-full appearance-none rounded-2xl bg-slate-900/60 
                  border border-slate-700 px-4 py-3 text-slate-100
                  shadow-[0_0_0_1px_rgba(255,255,255,0.05)] 
                  focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400
                  transition-all
                "
              >
                <option className="bg-slate-800" value="Dependiente">
                  Relación de dependencia (empleado)
                </option>
                <option className="bg-slate-800" value="Independiente">
                  Independiente / RUC personal
                </option>
                <option className="bg-slate-800" value="Mixto">
                  Mixto (sueldo + ingresos adicionales)
                </option>
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                ▼
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-tight">
              Esto ayuda a estimar tu estabilidad y capacidad real de pago.
            </p>
          </div>

          {/* INGRESO PAREJA (si aplica) */}
          {["casado", "union_de_hecho"].includes(
            String(estadoCivil).toLowerCase()
          ) && (
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-200">
                Ingreso neto mensual de tu pareja (opcional)
              </label>

              <MoneyInputControlled
                value={ingresoPareja}
                onChange={setIngresoPareja}
                placeholder="Ej: 800 (opcional)"
              />

              <p className="text-xs text-slate-400 leading-tight">
                Si tienen{" "}
                <span className="text-indigo-400 font-medium">
                  separación conyugal
                </span>
                , deja este valor en 0.
              </p>
            </div>
          )}

          {/* OTRAS DEUDAS */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-200">
              Otras deudas mensuales
            </label>

            <MoneyInputControlled
              value={deudas}
              onChange={setDeudas}
              placeholder="Ej: 300"
            />

            <p className="text-xs text-slate-400 leading-tight">
              Tarjetas, préstamos, cuotas, etc. Afectan tu DTI y capacidad de
              crédito.
            </p>
          </div>

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

      {/* ========== PASO 3: VIVIENDA ========== */}
      {step === 3 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-100">
            🏠 Vivienda que quieres comprar
          </h3>

          <Field label="Valor aproximado de la vivienda (USD)">
            <UncontrolledMoneyInput
              defaultValue={valor}
              onValueChange={setValor}
              placeholder="Ej: 90.000"
            />
          </Field>

          <Field
            label="Entrada disponible (USD)"
            helper="Incluye ahorros, cesantía, fondos de reserva u otros."
          >
            <UncontrolledMoneyInput
              defaultValue={entrada}
              onValueChange={setEntrada}
              placeholder="Ej: 15.000"
            />
          </Field>

          {/* NUEVAS PREGUNTAS CLAVE */}
          <Field label="¿Es tu primera vivienda?">
            <select
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
              value={esPrimeraVivienda ? "si" : "no"}
              onChange={(e) => setEsPrimeraVivienda(e.target.value === "si")}
            >
              <option value="si">Sí, primera vivienda</option>
              <option value="no">No, ya tengo vivienda</option>
            </select>
          </Field>

          <Field label="¿La vivienda es por estrenar o usada?">
            <select
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
              value={estadoVivienda}
              onChange={(e) => setEstadoVivienda(e.target.value)}
            >
              <option value="por_estrenar">
                Por estrenar (proyecto / entrega nueva)
              </option>
              <option value="usada">Usada / segunda mano</option>
            </select>
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

      {/* ========== PASO 4: PERFIL E IESS ========== */}
      {step === 4 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-100">
            👤 Tu perfil y aportes IESS
          </h3>

          <Field label="Edad">
            <Input
              type="number"
              value={edad}
              onChange={(e) => setEdad(Number(e.target.value || 0))}
            />
          </Field>

          <Field label="¿Estás afiliado al IESS?">
            <select
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
              value={afiliadoIESS ? "sí" : "no"}
              onChange={(e) => setAfiliadoIESS(e.target.value === "sí")}
            >
              <option value="no">No</option>
              <option value="sí">Sí</option>
            </select>
          </Field>

          {afiliadoIESS && (
            <>
              <Field
                label="Aportes IESS totales (meses)"
                helper="Para créditos BIESS suelen requerirse al menos 36 aportes totales."
              >
                <Input
                  type="number"
                  value={aportesTotales}
                  onChange={(e) =>
                    setAportesTotales(Number(e.target.value || 0))
                  }
                />
              </Field>
              <Field
                label="Aportes IESS consecutivos (meses)"
                helper="Suelen pedir mínimo 13 aportes consecutivos."
              >
                <Input
                  type="number"
                  value={aportesConsecutivos}
                  onChange={(e) =>
                    setAportesConsecutivos(Number(e.target.value || 0))
                  }
                />
              </Field>
            </>
          )}

          {err && (
            <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
              {err}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <button className="btn-ghost btn-sm" onClick={back}>
              Atrás
            </button>
            <div className="text-right text-[11px] text-slate-400 mr-2 hidden sm:block">
              🧮 Monto estimado a analizar:{" "}
              <span className="font-semibold text-slate-100">
                $
                {Number(preview.loan).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <button
              className="btn-primary btn-sm"
              onClick={handleCalcular}
              disabled={loading}
            >
              {loading ? "Analizando perfil…" : "Ver resultados"}
            </button>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 sm:hidden">
            Monto a analizar:{" "}
            <span className="font-semibold text-slate-100">
              $
              {Number(preview.loan).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
