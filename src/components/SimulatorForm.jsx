// src/components/SimulatorForm.jsx
import { useMemo, useState } from "react";
import { precalificar } from "../lib/api";

/** util financiero: cuota (PMT) */
function pmt(rate, nper, pv) {
  if (!rate) return pv / nper;
  return (pv * rate) / (1 - Math.pow(1 + rate, -nper));
}

export default function SimulatorForm({ onResult }) {
  // --- Estados de formulario ---
  const [ingreso, setIngreso] = useState(1200);
  const [ingresoPareja, setIngresoPareja] = useState(0);
  const [deudas, setDeudas] = useState(300);
  const [valor, setValor] = useState(90000);
  const [entrada, setEntrada] = useState(15000);
  const [edad, setEdad] = useState(30);
  const [tipoIngreso, setTipoIngreso] = useState("Dependiente");
  const [estabilidad, setEstabilidad] = useState(2);
  const [tieneVivienda, setTieneVivienda] = useState(false);
  const [afiliadoIESS, setAfiliadoIESS] = useState(false);
  const [declaracionBuro, setDeclaracionBuro] = useState("ninguno");

  // Aportes IESS para BIESS
  const [aportesTotales, setAportesTotales] = useState(0);
  const [aportesConsecutivos, setAportesConsecutivos] = useState(0);

  // Estado civil (normalizado)
  const [estadoCivil, setEstadoCivil] = useState("Soltero/a");

  // Permite simular con pareja incluso sin estado civil formal
  const [aplicarConPareja, setAplicarConPareja] = useState(false);

  // --- UI ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const money = (n) =>
    Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

  // --- Reglas VIS/VIP (referenciales) ---
  const RULES = {
    VIS_MAX_VALOR: 83660,
    VIP_MAX_VALOR: 107630,
    VIS_MAX_INGRESO: 2070,
    VIP_MAX_INGRESO: 2900,
  };

  // Flags de pareja (normalizado)
  const esParejaFormal =
    estadoCivil === "Casado/a" || estadoCivil === "Unión de hecho";

  // Si es pareja formal O marcó aplicarConPareja => se usa SOLO el ingreso de la pareja
  const usarSoloPareja = esParejaFormal || aplicarConPareja;

  // Mostrar campo de ingreso de pareja si aplica
  const mostrarPareja = usarSoloPareja;

  /** Derivados de UI (solo orientativos; la decisión final viene del backend) */
  const derived = useMemo(() => {
    const v = Number(valor) || 0;
    const e = Number(entrada) || 0;
    const loan = Math.max(0, v - e);
    const ltv = v > 0 ? loan / v : 0;

    // Regla solicitada: si usarSoloPareja => SOLO pareja; si no, solo titular
    const ingresoTotalUsado = usarSoloPareja
      ? (Number(ingresoPareja) || 0)
      : (Number(ingreso) || 0);

    const dti = afiliadoIESS ? 0.40 : 0.35;

    // Capacidad: (ingresoTotalUsado - deudas) * dti
    const cap = Math.max(
      0,
      (ingresoTotalUsado - (Number(deudas) || 0)) * dti
    );

    // Tentativo VIS/VIP/Comercial/BIESS (UI)
    const sinCasa = !tieneVivienda;
    let tentativo = "Banca Privada";
    if (sinCasa && v <= RULES.VIS_MAX_VALOR && ingresoTotalUsado <= RULES.VIS_MAX_INGRESO) {
      tentativo = "VIS";
    } else if (sinCasa && v <= RULES.VIP_MAX_VALOR && ingresoTotalUsado <= RULES.VIP_MAX_INGRESO) {
      tentativo = "VIP";
    } else if (afiliadoIESS) {
      tentativo = "BIESS";
    }

    // Preview de cuota según producto tentativo (referencial)
    let tasaAnual = 0.115; // Comercial ref
    let nMeses = 240;
    if (tentativo === "VIP") { tasaAnual = 0.0499; nMeses = 300; }
    if (tentativo === "VIS") { tasaAnual = 0.0488; nMeses = 240; }
    const r = tasaAnual / 12;
    const cuotaPreview = loan > 0 ? pmt(r, nMeses, loan) : 0;
    const subPreview = `${Math.round(nMeses / 12)} años · ${(tasaAnual * 100).toFixed(2)}% anual`;

    return {
      loan,
      ltv,
      cap,
      cuotaPreview,
      subPreview,
      tentativo,
      ingresoTotalUsado,
      entradaMin5: Math.ceil(v * 0.05),
      validaEntrada5: e >= v * 0.05,
    };
  }, [
    valor,
    entrada,
    ingreso,
    ingresoPareja,
    deudas,
    tieneVivienda,
    afiliadoIESS,
    usarSoloPareja,
  ]);

  function validate() {
    if (derived.ingresoTotalUsado < 400)
      return "El ingreso mínimo considerado es cercano a $400/mes.";
    if ((Number(valor) || 0) < 30000)
      return "El valor mínimo de vivienda considerado es $30.000.";
    if (Number(edad) < 21 || Number(edad) > 75)
      return "La edad debe estar entre 21 y 75 años al momento del desembolso.";
    if (!derived.validaEntrada5)
      return `Tu entrada es baja. Para 5% mínimo se recomienda al menos $${money(
        derived.entradaMin5
      )}.`;
    return null;
  }

  async function handleCalcular(e) {
    e?.preventDefault?.();
    setError("");
    onResult?.(null);
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    try {
      // Regla de envío al backend:
      // - si usarSoloPareja => ingresoNetoMensual = ingresoPareja; ingresoPareja = ingresoPareja (solo para registro)
      // - si no => ingresoNetoMensual = ingreso titular; ingresoPareja = 0
      const ingresoNetoMensualPayload = usarSoloPareja
        ? Number(ingresoPareja || 0)
        : Number(ingreso || 0);

      const ingresoParejaPayload = usarSoloPareja
        ? Number(ingresoPareja || 0)
        : 0;

      const payload = {
        ingresoNetoMensual: ingresoNetoMensualPayload,
        ingresoPareja: ingresoParejaPayload,
        otrasDeudasMensuales: Number(deudas),
        valorVivienda: Number(valor),
        entradaDisponible: Number(entrada),
        edad: Number(edad),
        tipoIngreso,
        aniosEstabilidad: Number(estabilidad),
        tieneVivienda,
        afiliadoIess: afiliadoIESS,                    // << nombre que espera backend
        iessAportesTotales: Number(aportesTotales || 0),        // << nombres alineados
        iessAportesConsecutivas: Number(aportesConsecutivos || 0),
        declaracionBuro,
        estadoCivil,                                   // normalizado
        aplicarConPareja,
      };

      const data = await precalificar(payload);
      if (!data?.ok) throw new Error(data?.error || "No se pudo calcular");
      onResult?.({ ...data, _echo: payload });
    } catch (err) {
      console.error(err);
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-slate-800">
        Simulador inteligente de crédito
      </h2>
      <p className="text-slate-500 text-sm mb-4">
        Calcula tu capacidad y descubre tu mejor opción hipotecaria con HabitaLibre.
      </p>

      {/* Ingresos y deudas */}
      <Section title="💼 Ingresos y deudas">
        <Field label="Estado civil">
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={estadoCivil}
            onChange={(e) => setEstadoCivil(e.target.value)}
          >
            <option>Soltero/a</option>
            <option>Casado/a</option>
            <option>Unión de hecho</option>
            <option>Divorciado/a</option>
            <option>Viudo/a</option>
          </select>
          <Hint>
            Si eres “Casado/a” o en “Unión de hecho”, usaremos solo el ingreso de tu pareja para la evaluación.
          </Hint>
        </Field>

        <Field label="Aplicar con pareja (coconstituyente)">
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={aplicarConPareja ? "Sí" : "No"}
            onChange={(e) => setAplicarConPareja(e.target.value === "Sí")}
          >
            <option>No</option>
            <option>Sí</option>
          </select>
          <Hint>
            Útil para simular con la pareja aunque no exista estado civil formal.
          </Hint>
        </Field>

        {/* Ingresos */}
        <Field label="Ingreso neto mensual del titular (USD)">
          <InputMoney value={ingreso} onChange={setIngreso} />
          <Hint>Ingreso del titular después de descuentos.</Hint>
        </Field>

        {mostrarPareja && (
          <Field label="Ingreso neto de pareja (USD)">
            <InputMoney value={ingresoPareja} onChange={setIngresoPareja} />
            <Hint>Cuando aplica, se usa solo este ingreso.</Hint>
          </Field>
        )}

        <Field label="Otras deudas mensuales (USD)">
          <InputMoney value={deudas} onChange={setDeudas} />
          <Hint>Cuotas de tarjeta, auto, préstamos, etc.</Hint>
        </Field>

        <Field label="Tipo de ingreso">
          <Select
            value={tipoIngreso}
            onChange={setTipoIngreso}
            options={["Dependiente", "Independiente", "Mixto"]}
          />
        </Field>
        <Field label="Años de estabilidad">
          <InputNumber value={estabilidad} onChange={setEstabilidad} />
        </Field>
      </Section>

      {/* Vivienda */}
      <Section title="🏠 Datos de la vivienda">
        <Field label="Valor de la vivienda (USD)">
          <InputMoney value={valor} onChange={setValor} />
        </Field>
        <Field label="Entrada disponible (USD)">
          <InputMoney value={entrada} onChange={setEntrada} />
          {!derived.validaEntrada5 && (
            <Warn>
              Entrada recomendada (mín. 5%): <b>${money(derived.entradaMin5)}</b>
            </Warn>
          )}
        </Field>
        <Field label="¿Tienes actualmente una vivienda?">
          <SelectBool value={tieneVivienda} onChange={setTieneVivienda} />
        </Field>
        <Field label="¿Estás afiliado al IESS?">
          <SelectBool value={afiliadoIESS} onChange={setAfiliadoIESS} />
        </Field>

        {afiliadoIESS && (
          <>
            <Field label="Aportes IESS totales (meses)">
              <InputNumber value={aportesTotales} onChange={setAportesTotales} />
              <Hint>Para BIESS se requieren al menos 36 totales.</Hint>
            </Field>
            <Field label="Aportes IESS consecutivos (meses)">
              <InputNumber value={aportesConsecutivos} onChange={setAportesConsecutivos} />
              <Hint>Para BIESS se requieren al menos 13 consecutivos.</Hint>
            </Field>
          </>
        )}
      </Section>

      {/* Solicitante */}
      <Section title="👤 Perfil del solicitante">
        <Field label="Edad">
          <InputNumber value={edad} onChange={setEdad} />
        </Field>
        <Field label="Historial crediticio">
          <Select
            value={declaracionBuro}
            onChange={setDeclaracionBuro}
            options={["ninguno", "regularizado", "mora"]}
          />
          <Hint>
            Tu respuesta no afecta tu score, pero mejora la precisión del análisis.
          </Hint>
        </Field>

        {/* Preclasificación y mini-cards */}
        <div className="col-span-3 grid grid-cols-3 gap-3">
          <div className="col-span-3 sm:col-span-2">
            <Banner tone="indigo" title="Preclasificación tentativo">
              Con tus datos actuales, tu perfil apunta a: <b>{derived.tentativo}</b>.
            </Banner>
          </div>
          <div className="col-span-3 sm:col-span-1">
            <MiniCard
              label="Preview cuota (ref.)"
              value={`$ ${money(derived.cuotaPreview)}`}
              sub={derived.subPreview}
            />
          </div>
          <div className="col-span-3 sm:col-span-1">
            <MiniCard
              label={`Capacidad de pago (${afiliadoIESS ? "40%" : "35%"})`}
              value={`$ ${money(derived.cap)}`}
              sub="(ingreso usado – deudas) × DTI"
            />
          </div>
          <div className="col-span-3 sm:col-span-1">
            <MiniCard
              label="LTV estimado"
              value={`${Math.round((derived.ltv || 0) * 100)} %`}
              sub={derived.ltv <= 0.8 ? "OK" : derived.ltv <= 0.9 ? "Umbral" : "Alto"}
              tone={derived.ltv <= 0.8 ? "green" : derived.ltv <= 0.9 ? "amber" : "red"}
            />
          </div>
          <div className="col-span-3 sm:col-span-1">
            <MiniCard
              label="Viabilidad rápida"
              value={derived.cuotaPreview <= derived.cap ? "Viable" : "Ajustar datos"}
              tone={derived.cuotaPreview <= derived.cap ? "green" : "amber"}
            />
          </div>
        </div>
      </Section>

      {/* Botón */}
      <button
        type="button"
        onClick={handleCalcular}
        disabled={loading}
        className="mt-2 w-full rounded-xl py-3 bg-indigo-600 text-white font-medium hover:opacity-95 disabled:opacity-50"
      >
        {loading ? "Analizando tu perfil…" : "Calcular"}
      </button>

      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
}

/* ======================= SUBCOMPONENTES ======================= */
function Section({ title, children }) {
  return (
    <>
      <h3 className="text-slate-700 font-semibold mt-5 mb-2">{title}</h3>
      <div className="grid grid-cols-3 gap-3">{children}</div>
    </>
  );
}
function Field({ label, children }) {
  return (
    <div className="col-span-3 sm:col-span-1">
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
function Hint({ children }) {
  return <div className="text-[11px] text-slate-400 mt-1">{children}</div>;
}
function Warn({ children }) {
  return (
    <div className="mt-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1 rounded">
      {children}
    </div>
  );
}
function ErrorText({ children }) {
  return (
    <div className="mt-3 text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
      {children}
    </div>
  );
}
function Select({ value, onChange, options = [] }) {
  return (
    <select
      className="w-full rounded-xl border px-3 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
function SelectBool({ value, onChange }) {
  return (
    <select
      className="w-full rounded-xl border px-3 py-2"
      value={value ? "Sí" : "No"}
      onChange={(e) => onChange(e.target.value === "Sí")}
    >
      <option>No</option>
      <option>Sí</option>
    </select>
  );
}
function InputNumber({ value, onChange }) {
  return (
    <input
      type="number"
      className="w-full rounded-xl border px-3 py-2"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
function InputMoney({ value, onChange }) {
  const [raw, setRaw] = useState(String(value ?? ""));
  function toNumberLike(str) {
    if (str === "" || str == null) return "";
    const clean = String(str).replace(/[^\d.]/g, "");
    const n = Number(clean);
    return Number.isFinite(n) ? n : "";
  }
  function format(str) {
    const n = toNumberLike(str);
    if (n === "") return "";
    return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  return (
    <input
      inputMode="numeric"
      className="w-full rounded-xl border px-3 py-2"
      value={format(raw)}
      onChange={(e) => {
        const txt = e.target.value;
        const clean = txt.replace(/[^\d.]/g, "");
        setRaw(clean);
        const n = Number(clean);
        if (Number.isFinite(n)) onChange(n);
        else if (clean === "") onChange(0);
      }}
      onBlur={() => {
        if (raw === "") {
          setRaw("0");
          onChange(0);
        }
      }}
    />
  );
}
function MiniCard({ label, value, sub, tone = "indigo" }) {
  const tones = {
    indigo: "border-indigo-100",
    green: "border-emerald-100",
    amber: "border-amber-200",
    red: "border-red-200",
  };
  return (
    <div className={`bg-white rounded-xl p-3 border ${tones[tone]}`}>
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-lg font-semibold text-slate-800">{value}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}
function Banner({ tone = "indigo", title, children }) {
  const styles = {
    indigo: "bg-indigo-50 border-indigo-100 text-slate-700",
    green: "bg-emerald-50 border-emerald-100 text-emerald-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    gray: "bg-slate-50 border-slate-200 text-slate-700",
  };
  return (
    <div className={`rounded-xl p-3 border ${styles[tone]}`}>
      {title && <div className="font-medium mb-0.5">{title}</div>}
      <div className="text-sm">{children}</div>
    </div>
  );
}
