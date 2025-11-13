// src/components/SimulatorWizard.jsx
import React, { useMemo, useState } from "react";
import { precalificar } from "../lib/api";
import { useLeadCapture } from "../lead/LeadCaptureContext.jsx";

export default function SimulatorWizard({ onResult }) {
  const { openLead } = useLeadCapture();

  const [step, setStep] = useState(1);

  // --- Estados de formulario ---
  const [nacionalidad, setNacionalidad] = useState("ecuatoriana");
  const [estadoCivil, setEstadoCivil] = useState("soltero");
  const [ingreso, setIngreso] = useState(1200);
  const [ingresoPareja, setIngresoPareja] = useState(0);
  const [deudas, setDeudas] = useState(300);
  const [valor, setValor] = useState(90000);
  const [entrada, setEntrada] = useState(15000);
  const [edad, setEdad] = useState(30);
  const [afiliadoIESS, setAfiliadoIESS] = useState(false);

  // NUEVOS CAMPOS IESS
  const [aportesTotales, setAportesTotales] = useState(0);
  const [aportesConsecutivos, setAportesConsecutivos] = useState(0);

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

  function validate(s) {
    if (s === 2 && ingresoUsado < 400)
      return "El ingreso debe ser ≥ $400.";
    if (s === 3 && (Number(valor) || 0) < 30000)
      return "El valor mínimo de vivienda es $30.000.";
    if (s === 4 && (Number(edad) < 21 || Number(edad) > 75))
      return "Edad fuera de rango.";
    return null;
  }

  const next = () => {
    const e = validate(step);
    if (e) return setErr(e);
    setErr("");
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  function buildEntrada() {
    return {
      nacionalidad,
      estadoCivil,
      edad,
      afiliadoIESS,
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
      openLead(res); // abre el único modal global
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
  const Input = (p) => <input {...p} className="input w-full rounded-lg border px-3 py-2" />;

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
              className="input w-full rounded-lg border px-3 py-2"
              value={nacionalidad}
              onChange={(e) => setNacionalidad(e.target.value)}
            >
              <option value="ecuatoriana">Ecuatoriana 🇪🇨</option>
              <option value="otra">Otra 🌍</option>
            </select>
          </Field>
          <Field label="Estado civil">
            <select
              className="input w-full rounded-lg border px-3 py-2"
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
              onChange={(e) =>
                setIngreso(Number(e.target.value || 0))
              }
            />
          </Field>
          <Field label="Deudas mensuales (USD)">
            <Input
              type="number"
              value={deudas}
              onChange={(e) =>
                setDeudas(Number(e.target.value || 0))
              }
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
              onChange={(e) =>
                setValor(Number(e.target.value || 0))
              }
            />
          </Field>
          <Field label="Entrada disponible (USD)">
            <Input
              type="number"
              value={entrada}
              onChange={(e) =>
                setEntrada(Number(e.target.value || 0))
              }
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
              onChange={(e) =>
                setEdad(Number(e.target.value || 0))
              }
            />
          </Field>
          <Field label="Afiliado al IESS">
            <select
              className="input w-full rounded-lg border px-3 py-2"
              value={afiliadoIESS ? "sí" : "no"}
              onChange={(e) =>
                setAfiliadoIESS(e.target.value === "sí")
              }
            >
              <option value="no">No</option>
              <option value="sí">Sí</option>
            </select>
          </Field>

          {/* 🔹 SOLO si es afiliado mostramos los campos de aportes */}
          {afiliadoIESS && (
            <>
              <Field label="Aportes IESS totales (meses)">
                <Input
                  type="number"
                  value={aportesTotales}
                  onChange={(e) =>
                    setAportesTotales(e.target.value)
                  }
                />
                <div className="text-xs text-slate-500 mt-1">
                  Para BIESS se suelen pedir al menos 36 meses totales.
                </div>
              </Field>
              <Field label="Aportes IESS consecutivos (meses)">
                <Input
                  type="number"
                  value={aportesConsecutivos}
                  onChange={(e) =>
                    setAportesConsecutivos(e.target.value)
                  }
                />
                <div className="text-xs text-slate-500 mt-1">
                  Para BIESS se suelen pedir al menos 13 consecutivos.
                </div>
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
