// src/components/SimulatorWizard.jsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { precalificar } from "../lib/api";
import ModalLead from "./ModalLead.jsx";

/* -------------------- utils -------------------- */
function pmt(rate, nper, pv) {
  if (!rate) return pv / nper;
  return (pv * rate) / (1 - Math.pow(1 + rate, -nper));
}
const money = (n, d = 0) =>
  Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: d });

/* ======================================================================
   WIZARD: ahora calcula primero (precalificar) y luego abre el modal
   ====================================================================== */
export default function SimulatorWizard({ onResult, onScoreChange }) {
  const TOTAL_STEPS = 4;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔑 Nuevo: resultado previo y echo del input para adjuntar al correo/PDF
  const [resultadoPrevio, setResultadoPrevio] = useState(null);
  const [entradaEcho, setEntradaEcho] = useState(null);

  const [showModalLead, setShowModalLead] = useState(false);

  const journeyMsgs = {
    1: "¡Empecemos! Esto toma menos de 2 minutos ⏱️",
    2: "Cuéntanos sobre tus ingresos y deudas 💼",
    3: "Ingresa los datos de tu futura vivienda 🏠",
    4: "Último paso: tu perfil y aportes IESS ✅",
  };

  const [nacionalidad, setNacionalidad] = useState("ecuatoriana");
  const [estadoCivil, setEstadoCivil] = useState("soltero");
  const esParejaFormal = estadoCivil === "casado" || estadoCivil === "union_de_hecho";
  const [ingreso, setIngreso] = useState(1200);
  const [ingresoPareja, setIngresoPareja] = useState(0);
  const [deudas, setDeudas] = useState(300);
  const [valor, setValor] = useState(90000);
  const [entrada, setEntrada] = useState(15000);
  const [tieneVivienda, setTieneVivienda] = useState(false);
  const [tipoIngreso, setTipoIngreso] = useState("Dependiente");
  const [estabilidad, setEstabilidad] = useState(2);
  const [edad, setEdad] = useState(30);
  const [afiliadoIESS, setAfiliadoIESS] = useState(false);
  const [iessAportesTotales, setIessAportesTotales] = useState(0);
  const [iessAportesConsecutivas, setIessAportesConsecutivas] = useState(0);
  const [declaracionBuro, setDeclaracionBuro] = useState("ninguno");

  useEffect(() => {
    const score = Math.round((step / TOTAL_STEPS) * 100);
    onScoreChange?.(score);
  }, [step, onScoreChange]);

  const RULES = {
    VIS_MAX_VALOR: 83660,
    VIP_MAX_VALOR: 107630,
    VIS_MAX_INGRESO: 2070,
    VIP_MAX_INGRESO: 2900,
  };

  const usarIngresoPareja = esParejaFormal;
  const ingresoUsado = usarIngresoPareja ? Number(ingresoPareja || 0) : Number(ingreso || 0);
  const dti = afiliadoIESS ? 0.4 : 0.35;

  const derived = useMemo(() => {
    const v = Number(valor) || 0;
    const e = Number(entrada) || 0;
    const loan = Math.max(0, v - e);
    const ltv = v > 0 ? loan / v : 0;
    const cap = Math.max(0, (ingresoUsado - (Number(deudas) || 0)) * dti);

    let tentativo = "Banca Privada";
    const esEcuatoriano = nacionalidad === "ecuatoriana";
    const primeraVivienda = !tieneVivienda;

    if (esEcuatoriano && primeraVivienda && v <= RULES.VIS_MAX_VALOR && ingresoUsado <= RULES.VIS_MAX_INGRESO)
      tentativo = "VIS";
    else if (esEcuatoriano && primeraVivienda && v <= RULES.VIP_MAX_VALOR && ingresoUsado <= RULES.VIP_MAX_INGRESO)
      tentativo = "VIP";
    else if (afiliadoIESS) tentativo = "BIESS";

    let tasaAnual = 0.115, nMeses = 240;
    if (tentativo === "VIP") { tasaAnual = 0.0499; nMeses = 300; }
    if (tentativo === "VIS") { tasaAnual = 0.0488; nMeses = 240; }

    const cuotaPreview = loan > 0 ? pmt(tasaAnual / 12, nMeses, loan) : 0;
    return { loan, ltv, cap, cuotaPreview, tentativo };
  }, [valor, entrada, ingresoUsado, deudas, tieneVivienda, afiliadoIESS, nacionalidad]);

  function validateStep(s) {
    if (s === 1 && !["ecuatoriana", "otra"].includes(nacionalidad)) return "Selecciona tu nacionalidad.";
    if (s === 2 && (Number(ingreso) || 0) < 400) return "El ingreso debe ser ≥ $400.";
    if (s === 3 && (Number(valor) || 0) < 30000) return "El valor mínimo de vivienda es $30.000.";
    if (s === 4 && (Number(edad) < 21 || Number(edad) > 75)) return "Edad fuera de rango.";
    return null;
  }

  const next = () => {
    const msg = validateStep(step);
    if (msg) return setError(msg);
    setError("");
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  // Construye el payload de entrada (eco) para precalificar y para guardar con el lead
  const buildEntrada = () => ({
    nacionalidad,
    estadoCivil,
    tipoIngreso,
    aniosEstabilidad: estabilidad,
    afiliadoIESS,
    iessAportesTotales,
    iessAportesConsecutivas,
    declaracionBuro,
    edad,

    ingresoNetoMensual: ingreso,
    ingresoPareja,
    otrasDeudasMensuales: deudas,

    valorVivienda: valor,
    entradaDisponible: entrada,
    tieneVivienda,

    // por si el backend usa estos flags
    origen: "simulador",
  });

  /* --------- NUEVO FLUJO: Calcula primero y luego abre el modal --------- */
  const handleCalcular = async () => {
    const msg = validateStep(4);
    if (msg) return setError(msg);

    setLoading(true);
    try {
      const entradaPayload = buildEntrada();
      const resultado = await precalificar(entradaPayload);

      // guardamos para el modal y para pintar el resultado tras guardar lead
      setResultadoPrevio(resultado);
      setEntradaEcho(entradaPayload);

      // ahora sí abrimos el modal (que enviará el lead + resultadoPrevio al backend)
      setShowModalLead(true);
    } catch (err) {
      console.error(err);
      alert("No se pudo calcular tu resultado en este momento.");
    } finally {
      setLoading(false);
    }
  };

  // Cuando el modal confirme que el lead fue guardado
  const handleLeadSaved = () => {
    setShowModalLead(false);
    if (resultadoPrevio) {
      onResult?.({ ...resultadoPrevio, _echo: entradaEcho });
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Simulador HabitaLibre</h2>
          <p className="text-slate-500 text-sm">Completa los pasos para descubrir tu opción ideal.</p>
        </div>
        <Progress step={step} total={TOTAL_STEPS} />
      </div>

      <p className="text-indigo-600 text-sm font-medium mb-2">{journeyMsgs[step]}</p>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Field label="Nacionalidad">
              <select className="w-full rounded-xl border px-3 py-2"
                value={nacionalidad} onChange={(e) => setNacionalidad(e.target.value)}>
                <option value="ecuatoriana">Ecuatoriana 🇪🇨</option>
                <option value="otra">Otra 🌍</option>
              </select>
            </Field>
            <FooterNav onNext={next} nextLabel="Siguiente" />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 className="font-semibold mb-2">💼 Ingresos</h3>
            <Field label="Ingreso neto mensual (USD)">
              <InputMoney value={ingreso} onChange={setIngreso} />
            </Field>
            <Field label="Deudas mensuales (USD)">
              <InputMoney value={deudas} onChange={setDeudas} />
            </Field>
            <FooterNav onBack={back} onNext={next} />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 className="font-semibold mb-2">🏠 Vivienda</h3>
            <Field label="Valor vivienda (USD)">
              <InputMoney value={valor} onChange={setValor} />
            </Field>
            <Field label="Entrada disponible (USD)">
              <InputMoney value={entrada} onChange={setEntrada} />
            </Field>
            <FooterNav onBack={back} onNext={next} />
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 className="font-semibold mb-2">👤 Perfil</h3>
            <Field label="Edad">
              <InputNumber value={edad} onChange={setEdad} />
            </Field>
            <Field label="Afiliado al IESS">
              <SelectBool value={afiliadoIESS} onChange={setAfiliadoIESS} />
            </Field>
            <FooterNav
              onBack={back}
              onNext={handleCalcular}
              nextLabel={loading ? "Calculando…" : "Ver resultados"}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && <ErrorText>{error}</ErrorText>}

      {/* Modal: ahora recibe el resultado PRE-calculado */}
      <ModalLead
        open={showModalLead}
        onClose={() => setShowModalLead(false)}
        dataResultado={resultadoPrevio}
        onLeadSaved={handleLeadSaved}
      />
    </div>
  );
}

/* -------------------- UI helpers -------------------- */
function Progress({ step, total }) {
  const pct = (100 * step) / total;
  return (
    <div className="w-48">
      <div className="text-right text-[11px] text-slate-500 mb-1">{step}/{total}</div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-2 bg-indigo-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
function FooterNav({ onBack, onNext, nextLabel = "Siguiente" }) {
  return (
    <div className="mt-4 flex justify-between">
      <button type="button" onClick={onBack} className="px-4 py-2 rounded-lg border hover:bg-slate-50">
        Atrás
      </button>
      <button type="button" onClick={onNext} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:opacity-90">
        {nextLabel}
      </button>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
function ErrorText({ children }) {
  return <div className="mt-3 text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">{children}</div>;
}
function InputNumber({ value, onChange }) {
  return <input type="number" className="w-full rounded-xl border px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} />;
}
function InputMoney({ value, onChange }) {
  const [raw, setRaw] = useState(String(value ?? ""));
  const format = (str) => {
    const n = Number(str.replace(/[^\d.]/g, "")) || 0;
    return n.toLocaleString("en-US");
  };
  return (
    <input
      inputMode="numeric"
      className="w-full rounded-xl border px-3 py-2"
      value={format(raw)}
      onChange={(e) => {
        const clean = e.target.value.replace(/[^\d.]/g, "");
        setRaw(clean);
        const n = Number(clean);
        if (Number.isFinite(n)) onChange(n);
      }}
    />
  );
}
function SelectBool({ value, onChange }) {
  return (
    <select className="w-full rounded-xl border px-3 py-2" value={value ? "Sí" : "No"} onChange={(e) => onChange(e.target.value === "Sí")}>
      <option>No</option><option>Sí</option>
    </select>
  );
}
