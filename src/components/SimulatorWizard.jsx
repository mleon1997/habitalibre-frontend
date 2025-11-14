// src/components/SimulatorWizard.jsx
import React, { useMemo, useState } from "react";
import { precalificar } from "../lib/api";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";

const TOTAL_STEPS = 4;

export default function SimulatorWizard({ onResult }) {
  const { openLead } = useLeadCapture();

  const [step, setStep] = useState(1);

  // Datos básicos
  const [nacionalidad, setNacionalidad] = useState("ecuatoriana");
  const [estadoCivil, setEstadoCivil] = useState("soltero");
  const [edad, setEdad] = useState(30);

  // Ingresos / deudas
  const [ingreso, setIngreso] = useState(1200);
  const [ingresoPareja, setIngresoPareja] = useState(0);
  const [deudas, setDeudas] = useState(300);

  // Vivienda
  const [valor, setValor] = useState(90000);
  const [entrada, setEntrada] = useState(15000);

  // IESS
  const [afiliadoIESS, setAfiliadoIESS] = useState(false);
  const [aportesTotales, setAportesTotales] = useState(0);
  const [aportesConsecutivos, setAportesConsecutivos] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const esParejaFormal =
    estadoCivil === "casado" || estadoCivil === "union_de_hecho";

  const ingresoUsado = esParejaFormal
    ? Number(ingresoPareja || 0)
    : Number(ingreso || 0);

  // Preview muy simple (solo loan)
  const preview = useMemo(() => {
    const v = Number(valor) || 0;
    const e = Number(entrada) || 0;
    const loan = Math.max(0, v - e);
    return { loan };
  }, [valor, entrada]);

  function validate(s) {
    if (s === 2 && ingresoUsado < 400)
      return "El ingreso considerado debe ser al menos $400.";
    if (s === 3 && (Number(valor) || 0) < 30000)
      return "El valor mínimo de vivienda que analizamos es $30.000.";
    if (s === 4 && (Number(edad) < 21 || Number(edad) > 75))
      return "La edad debe estar entre 21 y 75 años.";

    return null;
  }

  const next = () => {
    const e = validate(step);
    if (e) return setErr(e);
    setErr("");
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  function buildEntrada() {
    return {
      nacionalidad,
      estadoCivil,
      edad,
      afiliadoIess: afiliadoIESS,
      iessAportesTotales: Number(aportesTotales || 0),
      iessAportesConsecutivos: Number(aportesConsecutivos || 0),
      ingresoNetoMensual: Number(ingreso || 0),
      ingresoPareja: Number(ingresoPareja || 0),
      otrasDeudasMensuales: Number(deudas || 0),
      valorVivienda: Number(valor || 0),
      entradaDisponible: Number(entrada || 0),
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

  const Field = ({ label, children, helper }) => (
    <div className="mb-4">
      <label className="mb-1 block text-xs font-medium text-slate-200">
        {label}
      </label>
      {children}
      {helper && (
        <p className="mt-1 text-[11px] text-slate-400 leading-snug">{helper}</p>
      )}
    </div>
  );

  const Input = (props) => (
    <input
      {...props}
      className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 outline-none ring-0 transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
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

      {/* Contenido por pasos */}
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

          <div className="mt-5 flex justify-end">
            <button className="btn-primary btn-sm" onClick={next}>
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-100">
            💼 Ingresos
          </h3>
          <Field
            label="Ingreso neto mensual (USD)"
            helper="Lo que realmente recibes cada mes después de descuentos."
          >
            <Input
              type="number"
              value={ingreso}
              onChange={(e) => setIngreso(Number(e.target.value || 0))}
            />
          </Field>

          {esParejaFormal && (
            <Field
              label="Ingreso neto de tu pareja (USD)"
              helper="Nos ayuda a mejorar tu capacidad si solicitan juntos."
            >
              <Input
                type="number"
                value={ingresoPareja}
                onChange={(e) =>
                  setIngresoPareja(Number(e.target.value || 0))
                }
              />
            </Field>
          )}

          <Field
            label="Deudas mensuales (USD)"
            helper="Cuotas de tarjeta, auto u otros créditos."
          >
            <Input
              type="number"
              value={deudas}
              onChange={(e) => setDeudas(Number(e.target.value || 0))}
            />
          </Field>

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

      {step === 3 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-100">
            🏠 Vivienda
          </h3>
          <Field label="Valor aproximado de la vivienda (USD)">
            <Input
              type="number"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value || 0))}
            />
          </Field>
          <Field
            label="Entrada disponible (USD)"
            helper="Incluye ahorros, cesantía, fondos de reserva u otros."
          >
            <Input
              type="number"
              value={entrada}
              onChange={(e) => setEntrada(Number(e.target.value || 0))}
            />
          </Field>

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
                ${" "}
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
              ${" "}
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
