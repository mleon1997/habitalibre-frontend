// src/components/SimulatorWizard.jsx
import React, { useMemo, useState } from "react";
import { precalificar } from "../lib/api";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";



export default function SimulatorWizard({ onResult }) {
  const { openLead } = useLeadCapture();

  const [step, setStep] = useState(1);

  // Paso 1
  const [nacionalidad, setNacionalidad] = useState("ecuatoriana");
  const [estadoCivil, setEstadoCivil] = useState("soltero");

  // Paso 2
  const [ingreso, setIngreso] = useState(1200);
  const [ingresoPareja, setIngresoPareja] = useState(0);
  const [deudas, setDeudas] = useState(300);

  // Paso 3
  const [valor, setValor] = useState(90000);
  const [entrada, setEntrada] = useState(15000);

  // Paso 4
  const [edad, setEdad] = useState(30);
  const [afiliadoIESS, setAfiliadoIESS] = useState(false);
  const [iessAportesTotales, setIessAportesTotales] = useState(0);
  const [iessAportesConsecutivos, setIessAportesConsecutivos] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const esParejaFormal =
    estadoCivil === "casado" || estadoCivil === "union_de_hecho";
  const ingresoUsado = esParejaFormal
    ? Number(ingresoPareja || 0)
    : Number(ingreso || 0);

  const preview = useMemo(() => {
    const v = Number(valor) || 0;
    const e = Number(entrada) || 0;
    const loan = Math.max(0, v - e);
    return { loan };
  }, [valor, entrada]);

  // ---------- Validaciones por paso ----------
  function validate(s) {
    if (s === 2 && (Number(ingreso) || 0) < 400)
      return "El ingreso debe ser ≥ $400.";
    if (s === 3 && (Number(valor) || 0) < 30000)
      return "El valor mínimo de vivienda es $30.000.";
    if (s === 4 && (Number(edad) < 21 || Number(edad) > 75))
      return "La edad debe estar entre 21 y 75 años.";
    if (
      s === 4 &&
      afiliadoIESS &&
      (Number(iessAportesTotales) <= 0 || Number(iessAportesConsecutivos) <= 0)
    ) {
      return "Si estás afiliado al IESS, indica tus meses de aportes totales y consecutivos.";
    }
    return null;
  }

  const next = () => {
    const e = validate(step);
    if (e) return setErr(e);
    setErr("");
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  // ---------- Payload hacia backend ----------
  function buildEntrada() {
    return {
      nacionalidad,
      estadoCivil,
      edad,
      afiliadoIESS,
      ingresoNetoMensual: ingresoUsado,
      ingresoPareja: esParejaFormal ? Number(ingresoPareja || 0) : 0,
      otrasDeudasMensuales: deudas,
      valorVivienda: valor,
      entradaDisponible: entrada,
      iessAportesTotales: Number(iessAportesTotales || 0),
      iessAportesConsecutivos: Number(iessAportesConsecutivos || 0),
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
      // abre el modal de lead con el resultado
      openLead(res);
    } catch (ex) {
      console.error(ex);
      setErr("No se pudo calcular tu resultado ahora.");
    } finally {
      setLoading(false);
    }
  }

  const Field = ({ label, children }) => (
    <div className="mb-3">
      <label className="label block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );

  const Input = (props) => (
    <input
      {...props}
      className="input w-full rounded-xl border px-3 py-2 text-sm"
    />
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Simulador HabitaLibre
          </h2>
          <p className="text-slate-500 text-sm">
            Completa los pasos para descubrir tu opción ideal.
          </p>
        </div>
        <small className="text-slate-500">{step}/4</small>
      </div>

      {/* Paso 1 */}
      {step === 1 && (
        <div>
          <Field label="Nacionalidad">
            <select
              className="input w-full rounded-xl border px-3 py-2 text-sm"
              value={nacionalidad}
              onChange={(e) => setNacionalidad(e.target.value)}
            >
              <option value="ecuatoriana">Ecuatoriana 🇪🇨</option>
              <option value="otra">Otra 🌍</option>
            </select>
          </Field>
          <Field label="Estado civil">
            <select
              className="input w-full rounded-xl border px-3 py-2 text-sm"
              value={estadoCivil}
              onChange={(e) => setEstadoCivil(e.target.value)}
            >
              <option value="soltero">Soltero</option>
              <option value="casado">Casado</option>
              <option value="union_de_hecho">Unión de hecho</option>
            </select>
          </Field>
          <div className="mt-4 flex justify-end">
            <button className="btn-outline" onClick={next}>
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Paso 2 */}
      {step === 2 && (
        <div>
          <h3 className="font-semibold mb-2">💼 Ingresos</h3>
          <Field label="Ingreso neto mensual (USD)">
            <Input
              type="number"
              value={ingreso}
              onChange={(e) => setIngreso(Number(e.target.value || 0))}
            />
          </Field>
          <Field label="Deudas mensuales (USD)">
            <Input
              type="number"
              value={deudas}
              onChange={(e) => setDeudas(Number(e.target.value || 0))}
            />
          </Field>
          {esParejaFormal && (
            <Field label="Ingreso de pareja (USD)">
              <Input
                type="number"
                value={ingresoPareja}
                onChange={(e) =>
                  setIngresoPareja(Number(e.target.value || 0))
                }
              />
            </Field>
          )}
          <div className="mt-4 flex justify-between">
            <button className="btn-outline" onClick={back}>
              Atrás
            </button>
            <button className="btn-outline" onClick={next}>
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Paso 3 */}
      {step === 3 && (
        <div>
          <h3 className="font-semibold mb-2">🏠 Vivienda</h3>
          <Field label="Valor vivienda (USD)">
            <Input
              type="number"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value || 0))}
            />
          </Field>
          <Field label="Entrada disponible (USD)">
            <Input
              type="number"
              value={entrada}
              onChange={(e) => setEntrada(Number(e.target.value || 0))}
            />
          </Field>
          <div className="mt-4 flex justify-between">
            <button className="btn-outline" onClick={back}>
              Atrás
            </button>
            <button className="btn-outline" onClick={next}>
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Paso 4 */}
      {step === 4 && (
        <div>
          <h3 className="font-semibold mb-2">👤 Perfil y aportes IESS</h3>
          <Field label="Edad">
            <Input
              type="number"
              value={edad}
              onChange={(e) => setEdad(Number(e.target.value || 0))}
            />
          </Field>
          <Field label="Afiliado al IESS">
            <select
              className="input w-full rounded-xl border px-3 py-2 text-sm"
              value={afiliadoIESS ? "sí" : "no"}
              onChange={(e) => setAfiliadoIESS(e.target.value === "sí")}
            >
              <option value="no">No</option>
              <option value="sí">Sí</option>
            </select>
          </Field>

          {afiliadoIESS && (
            <>
              <Field label="Aportes IESS totales (meses)">
                <Input
                  type="number"
                  value={iessAportesTotales}
                  onChange={(e) =>
                    setIessAportesTotales(Number(e.target.value || 0))
                  }
                />
              </Field>
              <Field label="Aportes IESS consecutivos (meses)">
                <Input
                  type="number"
                  value={iessAportesConsecutivos}
                  onChange={(e) =>
                    setIessAportesConsecutivos(Number(e.target.value || 0))
                  }
                />
              </Field>
            </>
          )}

          {err && (
            <div className="mt-3 text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
              {err}
            </div>
          )}

          <div className="mt-4 flex justify-between">
            <button className="btn-outline" onClick={back}>
              Atrás
            </button>
            <button
              className="btn-primary"
              onClick={handleCalcular}
              disabled={loading}
            >
              {loading ? "Calculando…" : "Ver resultados"}
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            🧮 Loan estimado: $
            {Number(preview.loan).toLocaleString("en-US")}
          </div>
        </div>
      )}
    </div>
  );
}

