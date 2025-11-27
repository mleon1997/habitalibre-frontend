// src/components/SimulatorForm.jsx
import { useMemo, useState, useEffect } from "react";
import { precalificar, crearLead, API_BASE } from "../lib/api";

function pmt(rate, nper, pv) {
  if (!rate) return pv / nper;
  return (pv * rate) / (1 - Math.pow(1 + rate, -nper));
}

export default function SimulatorForm({ onResult }) {
  const [ingreso, setIngreso] = useState("");
  const [ingresoPareja, setIngresoPareja] = useState("");
  const [deudas, setDeudas] = useState("");
  const [valor, setValor] = useState("");
  const [entrada, setEntrada] = useState("");
  const [edad, setEdad] = useState("30");
  const [tipoIngreso, setTipoIngreso] = useState("Dependiente");
  const [estabilidad, setEstabilidad] = useState("2");
  const [tieneVivienda, setTieneVivienda] = useState(false);
  const [afiliadoIESS, setAfiliadoIESS] = useState(false);
  const [declaracionBuro] = useState("ninguno"); // se mantiene interno por ahora
  const [horizonteCompra, setHorizonteCompra] = useState("");

  const [aportesTotales, setAportesTotales] = useState("0");
  const [aportesConsecutivos, setAportesConsecutivos] = useState("0");

  const [estadoCivil, setEstadoCivil] = useState("Soltero/a");
  const [aplicarConPareja, setAplicarConPareja] = useState(false);

  const [esPrimeraVivienda, setEsPrimeraVivienda] = useState("si");
  const [estadoVivienda, setEstadoVivienda] = useState("por_estrenar");

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [ciudad, setCiudad] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // ping suave al backend
    fetch(`${API_BASE}/api/health`).catch(() => {});
  }, []);

  const money = (n) =>
    Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

  const RULES = {
    VIS_MAX_VALOR: 83660,
    VIP_MAX_VALOR: 107630,
    VIS_MAX_INGRESO: 2070,
    VIP_MAX_INGRESO: 2900,
  };

  const esParejaFormal =
    estadoCivil === "Casado/a" || estadoCivil === "Unión de hecho";

  const usarSoloPareja = esParejaFormal || aplicarConPareja;
  const mostrarPareja = usarSoloPareja;

  const derived = useMemo(() => {
    const v = Number(valor || 0);
    const e = Number(entrada || 0);
    const loan = Math.max(0, v - e);
    const ltv = v > 0 ? loan / v : 0;

    const ingresoTitular = Number(ingreso || 0);
    const ingresoConyuge = Number(ingresoPareja || 0);
    const deudasNum = Number(deudas || 0);

    const ingresoTotalUsado = usarSoloPareja ? ingresoConyuge : ingresoTitular;

    const dti = afiliadoIESS ? 0.4 : 0.35;
    const cap = Math.max(0, (ingresoTotalUsado - deudasNum) * dti);

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

    const cuotaPreview = loan > 0 ? pmt(tasaAnual / 12, nMeses, loan) : 0;
    const subPreview = `${Math.round(
      nMeses / 12
    )} años · ${(tasaAnual * 100).toFixed(2)}% anual`;

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
      return "La edad debe estar entre 21 y 75 años.";
    if (!derived.validaEntrada5)
      return `Entrada mínima sugerida: $${money(derived.entradaMin5)}`;
    return null;
  }

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

      const ingresoTitular = Number(ingreso || 0);
      const ingresoConyuge = Number(ingresoPareja || 0);
      const deudasNum = Number(deudas || 0);
      const valorNum = Number(valor || 0);
      const entradaNum = Number(entrada || 0);
      const edadNum = Number(edad || 0);
      const estabilidadNum = Number(estabilidad || 0);
      const aportesTotalesNum = Number(aportesTotales || 0);
      const aportesConsecutivosNum = Number(aportesConsecutivos || 0);

      const ingresoNeto = usarSoloPareja ? ingresoConyuge : ingresoTitular;
      const ingresoParejaPayload = usarSoloPareja ? ingresoConyuge : 0;

      const payload = {
        ingresoNetoMensual: ingresoNeto,
        ingresoPareja: ingresoParejaPayload,
        otrasDeudasMensuales: deudasNum,
        valorVivienda: valorNum,
        entradaDisponible: entradaNum,
        edad: edadNum,
        tipoIngreso,
        aniosEstabilidad: estabilidadNum,
        tieneVivienda,
        afiliadoIess: afiliadoIESS,
        iessAportesTotales: aportesTotalesNum,
        iessAportesConsecutivos: aportesConsecutivosNum,
        declaracionBuro,
        estadoCivil,
        aplicarConPareja,
        esPrimeraVivienda: esPrimeraVivienda === "si",
        tipoVivienda: estadoVivienda,
        tiempoCompra: horizonteCompra || null,
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

  return (
    <form onSubmit={handleCalcular} className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
          Simulador inteligente de crédito
        </h2>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Calcula tu capacidad y descubre tu mejor opción hipotecaria con
          HabitaLibre. No afectamos tu buró ni pedimos claves bancarias.
        </p>
      </div>

      {/* INGRESOS */}
      <Section title="💼 Ingresos y deudas">
        <Field label="Estado civil">
          <select
            className="hl-input"
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
          <SelectBool value={aplicarConPareja} onChange={setAplicarConPareja} />
        </Field>

        <Field label="Edad del titular">
          <InputNumber value={edad} onChange={setEdad} />
        </Field>

        <Field label="Ingreso neto mensual del titular (USD)">
          <InputMoney value={ingreso} onChange={setIngreso} />
        </Field>

        {mostrarPareja && (
          <Field label="Ingreso neto de pareja (USD)">
            <InputMoney value={ingresoPareja} onChange={setIngresoPareja} />
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

        <Field label="Años de estabilidad en tu actividad principal">
          <InputNumber value={estabilidad} onChange={setEstabilidad} />
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
          <SelectBool value={tieneVivienda} onChange={setTieneVivienda} />
        </Field>

        <Field label="¿Es tu primera vivienda?">
          <select
            className="hl-input"
            value={esPrimeraVivienda}
            onChange={(e) => setEsPrimeraVivienda(e.target.value)}
          >
            <option value="si">Sí, es mi primera vivienda</option>
            <option value="no">No, ya he tenido vivienda propia</option>
          </select>
        </Field>

        <Field label="Estado de la vivienda">
          <select
            className="hl-input"
            value={estadoVivienda}
            onChange={(e) => setEstadoVivienda(e.target.value)}
          >
            <option value="por_estrenar">Por estrenar / proyecto nuevo</option>
            <option value="usada">Usada / segunda mano</option>
          </select>
        </Field>

        <Field label="¿Cuándo quisieras adquirir tu vivienda?">
          <select
            className="hl-input"
            value={horizonteCompra}
            onChange={(e) => setHorizonteCompra(e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            <option value="0-6 meses">En los próximos 0–6 meses</option>
            <option value="6-12 meses">En 6–12 meses</option>
            <option value="1-2 años">En 1–2 años</option>
            <option value="Más de 2 años">En más de 2 años</option>
          </select>
        </Field>

        <Field label="¿Estás afiliado al IESS?">
          <SelectBool value={afiliadoIESS} onChange={setAfiliadoIESS} />
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
            className="hl-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre y apellido"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            className="hl-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />
        </Field>

        <Field label="Ciudad">
          <input
            type="text"
            className="hl-input"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Quito, Guayaquil, etc."
          />
        </Field>
      </Section>

      {/* PREVIEW */}
      <Section title="🔎 Preclasificación rápida">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-3">
            <Banner title="Preclasificación HabitaLibre">
              Perfil tentativo:{" "}
              <span className="font-semibold text-slate-900">
                {derived.tentativo}
              </span>
            </Banner>
          </div>

          <MiniCard
            label="Preview cuota"
            value={`$ ${money(derived.cuotaPreview)}`}
            sub={derived.subPreview}
          />

          <MiniCard
            label={`Capacidad de pago (${afiliadoIESS ? "40%" DTI : "35%" DTI})`}
            value={`$ ${money(derived.cap)}`}
            sub="(ingreso usado – deudas) × DTI estimado"
          />

          <MiniCard
            label="LTV estimado"
            value={`${Math.round((derived.ltv || 0) * 100)}%`}
            sub="Relación entre préstamo y valor de la vivienda"
          />
        </div>
      </Section>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-2xl py-3.5 bg-emerald-400 text-slate-950 font-semibold text-sm shadow-[0_18px_40px_rgba(16,185,129,0.55)] hover:bg-emerald-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Analizando tu perfil…" : "Ver mi resultado hipotecario"}
      </button>

      {error && <ErrorText>{error}</ErrorText>}
    </form>
  );
}

/* Helpers visuales / inputs */

function Section({ title, children }) {
  return (
    <section className="mb-6 pb-5 border-b border-slate-800 last:border-b-0 last:pb-0">
      <div className="text-sm md:text-base font-semibold mb-3 text-slate-100">
        {title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs md:text-sm text-slate-200">
      <span className="font-medium text-slate-100">{label}</span>
      {children}
    </label>
  );
}

function InputMoney({ value, onChange }) {
  const handleChange = (e) => {
    const raw = e.target.value;
    const clean = raw.replace(/[^\d]/g, "");
    onChange(clean);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      className="hl-input"
      value={value}
      onChange={handleChange}
      placeholder="0"
    />
  );
}

function InputNumber({ value, onChange }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      className="hl-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0"
    />
  );
}

function SelectBool({ value, onChange }) {
  return (
    <select
      className="hl-input"
      value={value ? "Sí" : "No"}
      onChange={(e) => onChange(e.target.value === "Sí")}
    >
      <option>No</option>
      <option>Sí</option>
    </select>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      className="hl-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  );
}

function Banner({ title, children }) {
  return (
    <div className="rounded-2xl bg-indigo-500/10 border border-indigo-400/30 px-4 py-3">
      <div className="text-[11px] md:text-xs font-semibold text-indigo-200">
        {title}
      </div>
      <div className="text-xs md:text-[13px] text-slate-100 mt-1">
        {children}
      </div>
    </div>
  );
}

function MiniCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-sm">
      <div className="text-[11px] text-slate-400 mb-0.5">{label}</div>
      <div className="text-lg font-semibold text-slate-50 mb-0.5">
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-slate-500 leading-snug">{sub}</div>
      )}
    </div>
  );
}

function Warn({ children }) {
  return (
    <div className="mt-1 text-[11px] text-amber-400 flex items-start gap-1.5">
      <span className="mt-[1px]">⚠️</span>
      <span>{children}</span>
    </div>
  );
}

function ErrorText({ children }) {
  return (
    <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs md:text-sm text-red-200">
      {children}
    </div>
  );
}
