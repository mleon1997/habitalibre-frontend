// src/components/SimulatorForm.jsx
import { useMemo, useState, useEffect } from "react";
import { precalificar, crearLead, API_BASE } from "../lib/api";

/** util financiero: cuota (PMT) */
function pmt(rate, nper, pv) {
  if (!rate) return pv / nper;
  return (pv * rate) / (1 - Math.pow(1 + rate, -nper));
}

export default function SimulatorForm({ onResult }) {
  // --- Estados de formulario ---
  const [ingreso, setIngreso] = useState(0);
  const [ingresoPareja, setIngresoPareja] = useState(0);
  const [deudas, setDeudas] = useState(0);
  const [valor, setValor] = useState(0);
  const [entrada, setEntrada] = useState(0);
  const [edad, setEdad] = useState(30);
  const [tipoIngreso, setTipoIngreso] = useState("Dependiente");
  const [estabilidad, setEstabilidad] = useState(2);
  const [tieneVivienda, setTieneVivienda] = useState(false);
  const [afiliadoIESS, setAfiliadoIESS] = useState(false);
  const [declaracionBuro, setDeclaracionBuro] = useState("ninguno");

  // Aportes IESS para BIESS
  const [aportesTotales, setAportesTotales] = useState(0);
  const [aportesConsecutivos, setAportesConsecutivos] = useState(0);

  // Estado civil
  const [estadoCivil, setEstadoCivil] = useState("Soltero/a");

  // Permite aplicar con pareja aunque no sea estado civil formal
  const [aplicarConPareja, setAplicarConPareja] = useState(false);

  // Contacto
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [ciudad, setCiudad] = useState("");

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Wake-up Render
  useEffect(() => {
    fetch(`${API_BASE}/api/health`).catch(() => {});
  }, []);

  const money = (n) =>
    Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

  /** VIS/VIP rules */
  const RULES = {
    VIS_MAX_VALOR: 83660,
    VIP_MAX_VALOR: 107630,
    VIS_MAX_INGRESO: 2070,
    VIP_MAX_INGRESO: 2900,
  };

  // Flags de pareja
  const esParejaFormal =
    estadoCivil === "Casado/a" || estadoCivil === "Unión de hecho";

  const usarSoloPareja = esParejaFormal || aplicarConPareja;

  const mostrarPareja = usarSoloPareja;

  /** Derivados */
  const derived = useMemo(() => {
    const v = Number(valor) || 0;
    const e = Number(entrada) || 0;
    const loan = Math.max(0, v - e);
    const ltv = v > 0 ? loan / v : 0;

    const ingresoTotalUsado = usarSoloPareja
      ? Number(ingresoPareja) || 0
      : Number(ingreso) || 0;

    const dti = afiliadoIESS ? 0.4 : 0.35;

    const cap = Math.max(
      0,
      (ingresoTotalUsado - (Number(deudas) || 0)) * dti
    );

    let tentativo = "Banca Privada";
    const sinCasa = !tieneVivienda;

    if (
      sinCasa &&
      v <= RULES.VIS_MAX_VALOR &&
      ingresoTotalUsado <= RULES.VIS_MAX_INGRESO
    ) {
      tentativo = "VIS";
    } else if (
      sinCasa &&
      v <= RULES.VIP_MAX_VALOR &&
      ingresoTotalUsado <= RULES.VIP_MAX_INGRESO
    ) {
      tentativo = "VIP";
    } else if (afiliadoIESS) {
      tentativo = "BIESS";
    }

    let tasaAnual = 0.115;
    let nMeses = 240;
    if (tentativo === "VIP") {
      tasaAnual = 0.0499;
      nMeses = 300;
    }
    if (tentativo === "VIS") {
      tasaAnual = 0.0488;
      nMeses = 240;
    }

    const cuotaPreview =
      loan > 0 ? pmt(tasaAnual / 12, nMeses, loan) : 0;

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

  /** Validación */
  function validate() {
    if (derived.ingresoTotalUsado < 400)
      return "El ingreso mínimo considerado es cercano a $400/mes.";
    if ((Number(valor) || 0) < 30000)
      return "El valor mínimo de vivienda considerado es $30.000.";
    if (Number(edad) < 21 || Number(edad) > 75)
      return "La edad debe estar entre 21 y 75 años.";
    if (!derived.validaEntrada5)
      return `Entrada mínima sugerida: $${money(
        derived.entradaMin5
      )}`;
    return null;
  }

  /** Enviar */
  async function handleCalcular(e) {
    e?.preventDefault?.();
    if (loading) return;

    setError("");
    onResult?.(null);

    const msg = validate();
    if (msg) return setError(msg);

    setLoading(true);

    try {
      fetch(`${API_BASE}/api/health`).catch(() => {});

      const ingresoNeto = usarSoloPareja
        ? Number(ingresoPareja || 0)
        : Number(ingreso || 0);

      const ingresoParejaPayload = usarSoloPareja
        ? Number(ingresoPareja || 0)
        : 0;

      const payload = {
        ingresoNetoMensual: ingresoNeto,
        ingresoPareja: ingresoParejaPayload,
        otrasDeudasMensuales: Number(deudas),
        valorVivienda: Number(valor),
        entradaDisponible: Number(entrada),
        edad: Number(edad),
        tipoIngreso,
        aniosEstabilidad: Number(estabilidad),
        tieneVivienda,
        afiliadoIess: afiliadoIESS,
        iessAportesTotales: Number(aportesTotales || 0),
        iessAportesConsecutivos: Number(aportesConsecutivos || 0),
        declaracionBuro,
        estadoCivil,
        aplicarConPareja,
      };

      const data = await precalificar(payload);

      if (!data || data.ok === false)
        throw new Error(data?.error || "No se pudo calcular");

      if (email && /\S+@\S+\.\S+/.test(email)) {
        const leadPayload = {
          ...payload,
          nombre: nombre?.trim() || "Cliente",
          email: email.trim(),
          ciudad: ciudad?.trim() || "",
          origen: "simulador",
          resultado: {
            capacidadPago: data?.resultado?.capacidadPago,
            montoMaximo: data?.resultado?.montoMaximo,
            precioMaxVivienda: data?.resultado?.precioMaxVivienda,
            ltv: data?.resultado?.ltv,
            tasaAnual: data?.resultado?.tasaAnual,
            plazoMeses: data?.resultado?.plazoMeses,
            dtiConHipoteca: data?.resultado?.dtiConHipoteca,
            cuotaEstimada: data?.resultado?.cuotaEstimada,
            cuotaStress: data?.resultado?.cuotaStress,
            productoElegido: data?.resultado?.productoElegido,
          },
        };

        try {
          await crearLead(leadPayload);
        } catch (e) {
          console.warn("crearLead falló:", e);
        }
      }

      onResult?.({ ...data, _echo: payload });
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------
  //       RENDER
  // ---------------------------

  return (
    <>
      <h2 className="text-xl font-semibold text-slate-800">
        Simulador inteligente de crédito
      </h2>
      <p className="text-slate-500 text-sm mb-4">
        Calcula tu capacidad y descubre tu mejor opción hipotecaria con HabitaLibre.
      </p>

      {/* INGRESOS */}
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
        </Field>

        <Field label="Aplicar con pareja (coconstituyente)">
          <SelectBool
            value={aplicarConPareja}
            onChange={setAplicarConPareja}
          />
        </Field>

        <Field label="Ingreso neto mensual del titular (USD)">
          <InputMoney value={ingreso} onChange={setIngreso} />
        </Field>

        {mostrarPareja && (
          <Field label="Ingreso neto de pareja (USD)">
            <InputMoney
              value={ingresoPareja}
              onChange={setIngresoPareja}
            />
          </Field>
        )}

        <Field label="Otras deudas mensuales (USD)">
          <InputMoney value={deudas} onChange={setDeudas} />
        </Field>

        <Field label="Tipo de ingreso">
          <Select
            value={tipoIngreso}
            onChange={setTipoIngreso}
            options={["Dependiente", "Independiente", "Mixto"]}
          />
        </Field>

        <Field label="Años de estabilidad">
          <InputNumber
            value={estabilidad}
            onChange={setEstabilidad}
          />
        </Field>
      </Section>

      {/* VIVIENDA */}
      <Section title="🏠 Datos de la vivienda">
        <Field label="Valor de la vivienda (USD)">
          <InputMoney value={valor} onChange={setValor} />
        </Field>

        <Field label="Entrada disponible (USD)">
          <InputMoney value={entrada} onChange={setEntrada} />
          {!derived.validaEntrada5 && (
            <Warn>
              Entrada sugerida (mín. 5%): ${money(derived.entradaMin5)}
            </Warn>
          )}
        </Field>

        <Field label="¿Tienes actualmente una vivienda?">
          <SelectBool
            value={tieneVivienda}
            onChange={setTieneVivienda}
          />
        </Field>

        <Field label="¿Estás afiliado al IESS?">
          <SelectBool
            value={afiliadoIESS}
            onChange={setAfiliadoIESS}
          />
        </Field>

        {afiliadoIESS && (
          <>
            <Field label="Aportes IESS totales (meses)">
              <InputNumber
                value={aportesTotales}
                onChange={setAportesTotales}
              />
            </Field>

            <Field label="Aportes IESS consecutivos (meses)">
              <InputNumber
                value={aportesConsecutivos}
                onChange={setAportesConsecutivos}
              />
            </Field>
          </>
        )}
      </Section>

      {/* CONTACTO */}
      <Section title="👤 Datos de contacto (opcional)">
        <Field label="Nombre">
          <input
            type="text"
            className="w-full rounded-xl border px-3 py-2"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            className="w-full rounded-xl border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Ciudad">
          <input
            type="text"
            className="w-full rounded-xl border px-3 py-2"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
          />
        </Field>
      </Section>

      {/* PREVIEW */}
      <Section title="🔎 Preclasificación rápida">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3 sm:col-span-2">
            <Banner tone="indigo" title="Preclasificación">
              Perfil tentativo: <b>{derived.tentativo}</b>
            </Banner>
          </div>

          <MiniCard
            label="Preview cuota"
            value={`$ ${money(derived.cuotaPreview)}`}
            sub={derived.subPreview}
          />

          <MiniCard
            label={`Capacidad de pago (${afiliadoIESS ? "40%" : "35%"})`}
            value={`$ ${money(derived.cap)}`}
            sub="(ingreso usado – deudas) × DTI"
          />

          <MiniCard
            label="LTV estimado"
            value={`${Math.round((derived.ltv || 0) * 100)}%`}
          />
        </div>
      </Section>

      {/* Botón */}
      <button
        type="button"
        onClick={handleCalcular}
        disabled={loading}
        className="mt-3 w-full rounded-xl py-3 bg-indigo-600 text-white font-medium hover:opacity-95"
      >
        {loading ? "Analizando tu perfil…" : "Calcular"}
      </button>

      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
}

/* ---------------------------------------------------------
   Helpers visuales / inputs / wrappers
--------------------------------------------------------- */

function Section({ title, children }) {
  return (
    <div className="mb-6 pb-6 border-b">
      <div className="text-lg font-semibold mb-3">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

function InputMoney({ value, onChange }) {
  return (
    <input
      type="number"
      min="0"
      className="w-full rounded-xl border px-3 py-2"
      value={value}
      onChange={(e) => onChange(Number(e.target.value || 0))}
    />
  );
}

function InputNumber({ value, onChange }) {
  return (
    <input
      type="number"
      className="w-full rounded-xl border px-3 py-2"
      value={value}
      onChange={(e) => onChange(Number(e.target.value || 0))}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      className="w-full rounded-xl border px-3 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

/** 🔥 Select booleano corregido */
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

function Banner({ title, children }) {
  return (
    <div className="rounded-xl bg-indigo-50 p-3 border border-indigo-100">
      <div className="text-indigo-700 text-sm font-semibold">{title}</div>
      <div className="text-xs text-slate-700 mt-1">{children}</div>
    </div>
  );
}

function MiniCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border p-3 bg-white shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-800">{value}</div>
      {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}

function Warn({ children }) {
  return (
    <div className="text-xs text-amber-600 mt-1">{children}</div>
  );
}

function ErrorText({ children }) {
  return (
    <div className="mt-3 text-sm text-red-600">{children}</div>
  );
}
