// src/components/SimulatorForm.jsx
import { useMemo, useState, useEffect } from "react";
import { precalificar, crearLeadDesdeSimulador, API_BASE } from "../lib/api";

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
  const [declaracionBuro, setDeclaracionBuro] = useState("ninguno");
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

  const esParejaFormal = estadoCivil === "Casado/a" || estadoCivil === "Unión de hecho";
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

    if (sinCasa && v <= RULES.VIS_MAX_VALOR && ingresoTotalUsado <= RULES.VIS_MAX_INGRESO) {
      tentativo = "VIS";
    } else if (sinCasa && v <= RULES.VIP_MAX_VALOR && ingresoTotalUsado <= RULES.VIP_MAX_INGRESO) {
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
  }, [valor, entrada, ingreso, ingresoPareja, deudas, tieneVivienda, afiliadoIESS, usarSoloPareja]);

  function validate() {
    if (derived.ingresoTotalUsado < 400) return "El ingreso mínimo considerado es cercano a $400/mes.";
    if ((Number(valor) || 0) < 30000) return "El valor mínimo de vivienda considerado es $30.000.";
    if (Number(edad) < 21 || Number(edad) > 75) return "La edad debe estar entre 21 y 75 años.";
    if (!derived.validaEntrada5) return `Entrada mínima sugerida: $${money(derived.entradaMin5)}`;
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

      // ✅ ESTE es el payload que debe viajar también al lead (campos planos)
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

      if (!data || data.ok === false) throw new Error(data?.error || "No se pudo calcular");

      // ✅ Lead (si hay email)
      if (email && /\S+@\S+\.\S+/.test(email)) {
        const resultadoLead = {
          flags: data?.flags || {},

          productoElegido: data?.productoElegido ?? null,
          tipoCreditoElegido: data?.productoElegido ?? null,

          productoSugerido: data?.productoSugerido ?? null,
          bancoSugerido: data?.bancoSugerido ?? null,

          capacidadPagoPrograma: data?.capacidadPagoPrograma ?? data?.capacidadPago ?? null,
          capacidadPago: data?.capacidadPago ?? null,

          cuotaEstimada: data?.cuotaEstimada ?? null,
          cuotaStress: data?.cuotaStress ?? null,

          tasaAnual: data?.tasaAnual ?? null,
          plazoMeses: data?.plazoMeses ?? null,

          ltv: data?.ltv ?? null,
          dtiConHipoteca: data?.dtiConHipoteca ?? null,

          montoMaximo: data?.montoMaximo ?? null,
          precioMaxVivienda: data?.precioMaxVivienda ?? null,

          escenarios: data?.escenariosHL ?? data?.escenarios ?? null,
          puntajeHabitaLibre: data?.puntajeHabitaLibre ?? null,
          scoreHL: data?.scoreHL ?? null,
        };

        // ✅ Definimos tipoCompra para alimentar decision + dashboard
        const tipoCompra = usarSoloPareja ? "pareja" : "solo";
        const tipoCompraNumero = usarSoloPareja ? 2 : 1;

        try {
          await crearLeadDesdeSimulador({
            contacto: {
              nombre: nombre?.trim() || "Cliente",
              email: email.trim(),
              ciudad: ciudad?.trim() || "",
              aceptaTerminos: true,
              aceptaCompartir: true,
              tiempoCompra: horizonteCompra || null,
              sustentoIndependiente: declaracionBuro || null,
              tipoCompra,
              tipoCompraNumero,
            },
            precalif: payload,        // ✅ aquí viaja ingreso/deudas/estabilidad/IESS/valor/entrada
            resultado: resultadoLead, // ✅ el resultado que ya estabas construyendo
          });
        } catch (e) {
          console.warn("crearLeadDesdeSimulador falló:", e);
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
    <form onSubmit={handleCalcular} className="relative">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-tight">
          Simulador inteligente de crédito
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-1">
          Calcula tu capacidad y descubre tu mejor opción hipotecaria con HabitaLibre.
        </p>
      </div>

      {/* INGRESOS */}
      <Section title="💼 Ingresos y deudas">
        <Field label="Estado civil">
          <select className={ui.select} value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)}>
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
          <Select value={tipoIngreso} onChange={setTipoIngreso} options={["Dependiente", "Independiente", "Mixto"]} />
        </Field>

        <Field label="Años de estabilidad">
          <InputNumber value={estabilidad} onChange={setEstabilidad} />
        </Field>

        {/* Edad (antes estaba solo en state; en mobile es útil tenerlo visible) */}
        <Field label="Edad">
          <InputNumber value={edad} onChange={setEdad} placeholder="30" />
        </Field>

        <Field label="Buró / sustento (referencia)">
          <select className={ui.select} value={declaracionBuro} onChange={(e) => setDeclaracionBuro(e.target.value)}>
            <option value="ninguno">Sin información / no aplica</option>
            <option value="bueno">Bueno / estable</option>
            <option value="regular">Regular</option>
            <option value="malo">Malo / atrasos</option>
          </select>
        </Field>
      </Section>

      {/* VIVIENDA */}
      <Section title="🏠 Datos de la vivienda">
        <Field label="Valor de la vivienda (USD)">
          <InputMoney value={valor} onChange={setValor} />
        </Field>

        <Field label="Entrada disponible (USD)">
          <InputMoney value={entrada} onChange={setEntrada} />
          {!derived.validaEntrada5 && <Warn>Entrada sugerida (mín. 5%): ${money(derived.entradaMin5)}</Warn>}
        </Field>

        <Field label="¿Tienes actualmente una vivienda?">
          <SelectBool value={tieneVivienda} onChange={setTieneVivienda} />
        </Field>

        <Field label="¿Es tu primera vivienda?">
          <select className={ui.select} value={esPrimeraVivienda} onChange={(e) => setEsPrimeraVivienda(e.target.value)}>
            <option value="si">Sí, es mi primera vivienda</option>
            <option value="no">No, ya he tenido vivienda propia</option>
          </select>
        </Field>

        <Field label="Estado de la vivienda">
          <select className={ui.select} value={estadoVivienda} onChange={(e) => setEstadoVivienda(e.target.value)}>
            <option value="por_estrenar">Por estrenar / proyecto nuevo</option>
            <option value="usada">Usada / segunda mano</option>
          </select>
        </Field>

        <Field label="¿Cuándo quisieras adquirir tu vivienda?">
          <select className={ui.select} value={horizonteCompra} onChange={(e) => setHorizonteCompra(e.target.value)}>
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
              <InputNumber value={aportesTotales} onChange={setAportesTotales} />
            </Field>

            <Field label="Aportes IESS consecutivos (meses)">
              <InputNumber value={aportesConsecutivos} onChange={setAportesConsecutivos} />
            </Field>
          </>
        )}
      </Section>

      {/* CONTACTO */}
      <Section title="👤 Datos de contacto (opcional)">
        <Field label="Nombre">
          <input type="text" className={ui.input} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Field>

        <Field label="Email">
          <input type="email" className={ui.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>

        <Field label="Ciudad">
          <input type="text" className={ui.input} value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
        </Field>
      </Section>

      {/* PREVIEW */}
      <Section title="🔎 Preclasificación rápida">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Banner title="Preclasificación">
              Perfil tentativo: <b>{derived.tentativo}</b>
            </Banner>
          </div>

          <MiniCard label="Preview cuota" value={`$ ${money(derived.cuotaPreview)}`} sub={derived.subPreview} />
          <MiniCard
            label={`Capacidad de pago (${afiliadoIESS ? "40%" : "35%"})`}
            value={`$ ${money(derived.cap)}`}
            sub="(ingreso usado – deudas) × DTI"
          />
          <MiniCard label="LTV estimado" value={`${Math.round((derived.ltv || 0) * 100)}%`} />
        </div>
      </Section>

      {/* Error */}
      {error && <ErrorText>{error}</ErrorText>}

      {/* Spacer para que el sticky no tape contenido */}
      <div className="h-20 sm:h-0" />

      {/* CTA sticky en mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 sm:static">
        <div className="sm:hidden bg-white/90 backdrop-blur border-t px-4 py-3">
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-2xl py-3.5 font-semibold text-base transition ${
              loading ? "bg-indigo-400 text-white" : "bg-indigo-600 text-white hover:opacity-95 active:scale-[0.99]"
            }`}
          >
            {loading ? "Analizando tu perfil…" : "Calcular"}
          </button>
          <p className="mt-2 text-[11px] text-slate-500 text-center">
            Tips: sube entrada o baja deudas para mejorar ruta y cuota.
          </p>
        </div>

        {/* CTA normal en desktop */}
        <div className="hidden sm:block">
          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full rounded-2xl py-3 bg-indigo-600 text-white font-semibold hover:opacity-95 active:scale-[0.99] transition"
          >
            {loading ? "Analizando tu perfil…" : "Calcular"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* =========================
   UI tokens
========================= */
const ui = {
  input:
    "w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300",
  select:
    "w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300",
};

/* Helpers visuales / inputs */

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <div className="text-base sm:text-lg font-semibold mb-3 text-slate-900">{title}</div>
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
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
      className={ui.input}
      value={value}
      onChange={handleChange}
      placeholder="0"
    />
  );
}

function InputNumber({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      className={ui.input}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function SelectBool({ value, onChange }) {
  return (
    <select className={ui.select} value={value ? "Sí" : "No"} onChange={(e) => onChange(e.target.value === "Sí")}>
      <option>No</option>
      <option>Sí</option>
    </select>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select className={ui.select} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  );
}

function Banner({ title, children }) {
  return (
    <div className="rounded-2xl bg-indigo-50 p-4 border border-indigo-100">
      <div className="text-indigo-800 text-sm font-semibold">{title}</div>
      <div className="text-sm text-slate-700 mt-1 leading-relaxed">{children}</div>
    </div>
  );
}

function MiniCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-semibold text-slate-900 mt-1">{value}</div>
      {sub && <div className="text-[12px] text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function Warn({ children }) {
  return <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">{children}</div>;
}

function ErrorText({ children }) {
  return (
    <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
      {children}
    </div>
  );
}
