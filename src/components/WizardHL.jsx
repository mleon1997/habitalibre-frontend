// src/components/WizardHL.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { precalificar } from "../lib/api";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import * as customerApi from "../lib/customerApi.js";
import { saveJourneyLocal, persistLastResult } from "../lib/journeyLocal";

const TOTAL_STEPS = 4;
const LS_PENDING_PRECALIF_SNAPSHOT = "hl_pending_precalif_snapshot_v1";

const HORIZONTE_OPCIONES = [
  { value: "0-3", label: "En los próximos 0–3 meses" },
  { value: "3-12", label: "En 3–12 meses" },
  { value: "12-24", label: "En 12–24 meses" },
  { value: "explorando", label: "Solo estoy explorando" },
];

// Keys locales
const LS_QUICK_LAST_RESULT = "hl_quick_last_result_v1";
const LS_PENDING_JOURNEY = "hl_pending_journey";

/* ===========================================================
   SLIDER UNIFICADO (mobile-friendly)
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

  const handleInputChange = (e) => {
    let raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw === "") {
      onChange("0");
      return;
    }
    let n = Number(raw);
    if (!Number.isFinite(n)) return;
    if (typeof min === "number" && n < min) n = min;
    if (typeof max === "number" && n > max) n = max;
    onChange(String(n));
  };

  return (
    <div className="mb-5">
      {label && (
        <label className="mb-2 block text-[12px] font-semibold text-slate-200">
          {label}
        </label>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
        <span className="font-medium text-slate-300">{format(num)}</span>
        <span className="opacity-70">
          {format(min)} – {format(max)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={num}
          onChange={handleChange}
          aria-label={label || "slider"}
          className="flex-1 cursor-pointer touch-pan-y accent-violet-400"
        />

        <input
          type="text"
          value={format(num)}
          onChange={handleInputChange}
          inputMode="numeric"
          pattern="[0-9]*"
          className="w-28 h-11 rounded-2xl border border-slate-700 bg-slate-900/60 px-3 text-right text-[13px] text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>

      {helper && <p className="mt-2 text-[11px] text-slate-400">{helper}</p>}
    </div>
  );
}

export default function WizardHL({ mode = "quick", onboarding = false }) {
  const navigate = useNavigate();
  const { openLead, openLeadNow, setLeadResult } = useLeadCapture();
  const { isAuthed, user } = useCustomerAuth();

  const isJourneyMode = String(mode || "").toLowerCase() === "journey";

  const [step, setStep] = useState(1);

  const [nacionalidad, setNacionalidad] = useState("ecuatoriana");
  const [estadoCivil, setEstadoCivil] = useState("soltero");
  const [edad, setEdad] = useState("30");

  const [tipoIngreso, setTipoIngreso] = useState("Dependiente");
  const [aniosEstabilidad, setAniosEstabilidad] = useState("2");
  const [sustentoIndependiente, setSustentoIndependiente] = useState("declaracion");

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

  const [horizonteCompra, setHorizonteCompra] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const scrollerRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const toNum = (v) => {
    const n = Number((v ?? "").toString().replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const afiliadoBool = afiliadoIESS === "sí";
  const esParejaFormal = estadoCivil === "casado" || estadoCivil === "union_de_hecho";
  const ingresoUsado = toNum(ingreso) + (esParejaFormal ? toNum(ingresoPareja) : 0);

  const preview = useMemo(() => {
    const v = toNum(valor);
    const e = toNum(entrada);
    return { loan: Math.max(0, v - e) };
  }, [valor, entrada]);

  const entradaPct = useMemo(() => {
    const v = toNum(valor);
    const e = toNum(entrada);
    if (!v) return 0;
    return Math.round((e / v) * 100);
  }, [valor, entrada]);

  function validate(s) {
    if (
      s === 1 &&
      (tipoIngreso === "Dependiente" || tipoIngreso === "Mixto") &&
      toNum(aniosEstabilidad) < 1
    )
      return "Mínimo 1 año en tu empleo actual o actividad principal.";

    if (s === 2 && ingresoUsado < 400)
      return "El ingreso considerado (tuyo + pareja si aplica) debe ser al menos $400.";

    if (s === 3 && toNum(valor) < 30000) return "El valor mínimo de vivienda que analizamos es $30.000.";

    if (s === 3 && !horizonteCompra) return "Elige en qué plazo te gustaría adquirir tu vivienda.";

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

  function buildEntrada() {
    return {
      nacionalidad,
      estadoCivil,
      edad: toNum(edad),

      tipoIngreso,
      aniosEstabilidad: toNum(aniosEstabilidad),
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
      origen: isJourneyMode ? "journey" : "simulador",
    };
  }

  function persistQuickLastResult(resultado) {
    try {
      localStorage.setItem(
        LS_QUICK_LAST_RESULT,
        JSON.stringify({ resultado, updatedAt: new Date().toISOString() })
      );
    } catch {}
  }

  // ✅ CLAVE: inyecta perfil dentro del resultado para que el backend pueda derivar campos “rápidos”
  function attachPerfilToResult(result, entradaPayload) {
    const safe = result && typeof result === "object" ? result : {};
    const perfilPrev = safe.perfil && typeof safe.perfil === "object" ? safe.perfil : {};

    const perfil = {
      ...perfilPrev,

      // lo que tu backend usa como fallback:
      afiliadoIess: entradaPayload?.afiliadoIess ?? afiliadoBool,
      aniosEstabilidad: entradaPayload?.aniosEstabilidad ?? toNum(aniosEstabilidad),

      // ingresoTotal: suma usada en el wizard (incluye pareja solo si formal)
      ingresoTotal: ingresoUsado,

      // deudas (para deuda_mensual_aprox)
      otrasDeudasMensuales: entradaPayload?.otrasDeudasMensuales ?? toNum(deudas),

      // opcional: ciudadCompra (si luego lo agregas en el wizard)
      ciudadCompra: perfilPrev?.ciudadCompra ?? null,
    };

    return { ...safe, perfil };
  }

  async function handleCalcular() {
    if (loading) return;

    const e = validate(4);
    if (e) return setErr(e);

    setLoading(true);
    setErr("");

    // ✅ armamos entrada una vez
    const entradaPayload = buildEntrada();

    // =========================================================
    // ✅ QUICK: SOLO abre modal si NO hay sesión
    // =========================================================
    const shouldShowLeadModal = !isJourneyMode && !isAuthed;

    if (shouldShowLeadModal) {
      const initial = {
        __loading: true,
        __entrada: entradaPayload,   // compat
        perfilInput: entradaPayload, // estándar nuevo
      };

      if (typeof openLeadNow === "function") {
        openLeadNow(initial, entradaPayload);
      } else {
        openLead(initial, entradaPayload);
      }
    }

    try {
      const resultRaw = await precalificar(entradaPayload);

      // ✅ MUY IMPORTANTE: resultado con perfil
      const result = attachPerfilToResult(resultRaw, entradaPayload);

      persistLastResult(result);

            // ✅ SI NO ESTÁ LOGUEADO: guardar esta precalificación para “replay” post-login
      // Esto permite que el dashboard /admin/users tenga finanzas desde la PRIMERA simulación obligatoria.
      if (!isAuthed) {
        try {
          localStorage.setItem(
            LS_PENDING_PRECALIF_SNAPSHOT,
            JSON.stringify({
              entrada: entradaPayload,
              resultado: result,
              ts: Date.now(),
              mode: isJourneyMode ? "journey" : "quick",
            })
          );
        } catch {}
      }


      // =========================================================
      // ✅ QUICK
      // - Si NO hay sesión: actualiza modal + guarda quick last result
      // - Si HAY sesión: guarda journey y manda a /progreso (sin modal)
      // =========================================================
      if (!isJourneyMode) {
        persistQuickLastResult(result);

        if (!isAuthed) {
          const merged = {
            ...result,
            __loading: false,
            __entrada: entradaPayload,   // compat
            perfilInput: entradaPayload, // estándar
          };

          if (typeof setLeadResult === "function") {
            setLeadResult(merged, entradaPayload);
          } else {
            openLead(merged, entradaPayload);
          }
          return;
        }

        // ✅ Authed en QUICK: lo tratamos como journey (mejor UX)
        saveJourneyLocal({
          entrada: entradaPayload,
          input: entradaPayload,
          resultado: result,
          userEmail: user && user.email ? user.email : "",
          ts: Date.now(),
        });

        customerApi
          .saveJourney({
            entrada: entradaPayload,
            input: entradaPayload,
            metadata: { input: entradaPayload },
            resultado: result,
            status: "precalificado",
          })
          .catch(() => {});

        navigate("/progreso", { replace: true });
        return;
      }

      // =========================================================
      // ✅ JOURNEY (igual que ya lo tenías)
      // =========================================================
      saveJourneyLocal({
        entrada: entradaPayload,
        input: entradaPayload,
        resultado: result,
        userEmail: user && user.email ? user.email : "",
        ts: Date.now(),
      });

      if (!isAuthed) {
        try {
          localStorage.setItem(
            LS_PENDING_JOURNEY,
            JSON.stringify({
              entrada: entradaPayload,
              resultado: result,
              status: "precalificado",
              ts: Date.now(),
            })
          );
        } catch {}

        navigate("/login", { state: { returnTo: "/progreso", from: "simular_journey" } });
        return;
      }

      customerApi
        .saveJourney({
          entrada: entradaPayload,
          input: entradaPayload,
          metadata: { input: entradaPayload },
          resultado: result,
          status: "precalificado",
        })
        .catch(() => {});

      navigate("/progreso");
    } catch (ex) {
      console.error(ex);

      if (isJourneyMode && String(ex?.message || "").includes("NO_TOKEN")) {
        setErr("Inicia sesión para guardar tu progreso.");
        navigate("/login", { state: { returnTo: "/progreso", from: "simular_journey" } });
        return;
      }

      setErr(isJourneyMode ? "No se pudo guardar tu progreso." : "No se pudo calcular tu resultado ahora.");
    } finally {
      setLoading(false);
    }
  }

  const progress = (step / TOTAL_STEPS) * 100;

  const Field = ({ label, children, helper }) => (
    <div className="mb-5">
      <label className="mb-2 block text-[12px] font-semibold text-slate-200">{label}</label>
      {children}
      {helper && <p className="mt-2 text-[11px] text-slate-400">{helper}</p>}
    </div>
  );

  const ActionsBar = ({ left, right }) => (
    <>
      <div className="hidden md:flex mt-6 items-center justify-between gap-3">
        <div>{left}</div>
        <div>{right}</div>
      </div>

      <div className="md:hidden sticky bottom-0 -mx-5 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur px-3 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-[120px]">{left}</div>
            <div className="flex-1 flex justify-end">{right}</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      ref={scrollerRef}
      className="
        text-slate-50 relative z-[10]
        max-h-[calc(100dvh-32px)]
        overflow-y-auto
        pr-1
        [scrollbar-gutter:stable]
        [-webkit-overflow-scrolling:touch]
        overscroll-contain
      "
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {isJourneyMode ? "Camino HabitaLibre" : "Precalificador HabitaLibre"}
          </h2>
          <p className="text-[11px] text-slate-400">
            Completa los pasos y te mostramos un resultado claro en menos de 2 minutos.
          </p>

          {onboarding && isJourneyMode ? (
            <div className="mt-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-100">
              Este “Camino” guarda tu progreso para que puedas volver cuando quieras.
            </div>
          ) : null}
        </div>

        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-slate-700/80">
          Paso {step}/{TOTAL_STEPS}
        </span>
      </div>

      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* PASO 1 */}
      {step === 1 && (
        <div>
          <Field label="Nacionalidad">
            <select
              className="w-full h-11 rounded-2xl border border-slate-700/70 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
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
              className="w-full h-11 rounded-2xl border border-slate-700/70 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
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
              className="w-full h-11 rounded-2xl border border-slate-700/70 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
              value={tipoIngreso}
              onChange={(e) => setTipoIngreso(e.target.value)}
            >
              <option value="Dependiente">Relación de dependencia</option>
              <option value="Independiente">Independiente / RUC</option>
              <option value="Mixto">Mixto</option>
            </select>
          </Field>

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

          {(tipoIngreso === "Independiente" || tipoIngreso === "Mixto") && (
            <Field
              label="¿Cómo sustentas tus ingresos?"
              helper="Esto ayuda a saber si calificas mejor por IR o por historial bancario."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[13px]">
                {[
                  { value: "declaracion", label: "Declaración de Impuesto a la Renta" },
                  { value: "movimientos", label: "Movimientos bancarios últimos 6 meses" },
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
                        "min-h-[44px] rounded-2xl border px-3 py-2 text-left transition",
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
            <div className="mt-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100">
              {err}
            </div>
          )}

          <ActionsBar
            left={null}
            right={
              <button className="btn-primary btn-sm w-full md:w-auto" onClick={next}>
                Siguiente
              </button>
            }
          />
        </div>
      )}

      {/* PASO 2 */}
      {step === 2 && (
        <div className="space-y-2">
          <SliderField
            label="Tu ingreso neto mensual"
            min={0}
            max={20000}
            value={ingreso}
            onChange={setIngreso}
            format={(v) => `$${Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          />

          {["casado", "union_de_hecho"].includes(estadoCivil) && (
            <SliderField
              label="Ingreso neto mensual de tu pareja (opcional)"
              min={0}
              max={20000}
              value={ingresoPareja}
              onChange={setIngresoPareja}
              format={(v) => `$${Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
            />
          )}

          <SliderField
            label="Otras deudas mensuales (tarjetas, préstamos, etc.)"
            min={0}
            max={15000}
            value={deudas}
            onChange={setDeudas}
            format={(v) => `$${Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          />

          <Field label="¿Estás afiliado al IESS?">
            <select
              className="w-full h-11 rounded-2xl border border-slate-700/70 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
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
            <div className="mt-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100">
              {err}
            </div>
          )}

          <ActionsBar
            left={
              <button className="btn-ghost btn-sm w-full md:w-auto" onClick={back}>
                Atrás
              </button>
            }
            right={
              <button className="btn-primary btn-sm w-full md:w-auto" onClick={next}>
                Siguiente
              </button>
            }
          />
        </div>
      )}

      {/* PASO 3 */}
      {step === 3 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-100">🏠 Vivienda</h3>

          <div className="mb-4 grid grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-3 py-2">
              <p className="text-slate-400 mb-0.5">Valor objetivo</p>
              <p className="text-slate-50 font-semibold text-sm">
                ${toNum(valor).toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-3 py-2">
              <p className="text-slate-400 mb-0.5">Entrada aprox.</p>
              <p className="text-slate-50 font-semibold text-sm">
                ${toNum(entrada).toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
                <span className="text-xs text-emerald-300">({entradaPct || 0}%)</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <SliderField
              label="Valor aproximado de la vivienda (USD)"
              min={30000}
              max={500000}
              step={1000}
              value={valor}
              onChange={setValor}
              format={(v) => `$${Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
            />

            <SliderField
              label="Entrada disponible (USD)"
              helper="Incluye ahorros, cesantía, fondos de reserva u otros."
              min={0}
              max={500000}
              step={500}
              value={entrada}
              onChange={setEntrada}
              format={(v) => `$${Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
            />
          </div>

          {toNum(entrada) > toNum(valor) && (
            <p className="mb-3 text-[11px] text-amber-300">
              Tu entrada es mayor que el valor de la vivienda. Puedes reducirla o ajustar el valor objetivo.
            </p>
          )}

          {entradaPct > 0 && entradaPct < 5 && (
            <p className="mb-3 text-[11px] text-slate-400">
              Estás partiendo con una entrada baja (&lt; 5%). En el reporte te mostraremos opciones.
            </p>
          )}

          <Field label="¿Tienes actualmente una vivienda?">
            <select
              className="w-full h-11 rounded-2xl border border-slate-700/70 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
              value={tieneVivienda}
              onChange={(e) => setTieneVivienda(e.target.value)}
            >
              <option value="no">No</option>
              <option value="sí">Sí</option>
            </select>
          </Field>

          <Field label="¿Es tu primera vivienda?">
            <select
              className="w-full h-11 rounded-2xl border border-slate-700/70 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
              value={primeraVivienda}
              onChange={(e) => setPrimeraVivienda(e.target.value)}
            >
              <option value="sí">Sí</option>
              <option value="no">No</option>
            </select>
          </Field>

          <Field label="Estado de la vivienda">
            <select
              className="w-full h-11 rounded-2xl border border-slate-700/70 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
              value={tipoVivienda}
              onChange={(e) => setTipoVivienda(e.target.value)}
            >
              <option value="por_estrenar">Por estrenar / proyecto nuevo</option>
              <option value="usada">Usada / segunda mano</option>
            </select>
          </Field>

          <Field label="¿En qué plazo te gustaría adquirir tu vivienda?">
            <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
              {HORIZONTE_OPCIONES.map((opt) => {
                const selected = horizonteCompra === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHorizonteCompra(opt.value)}
                    className={[
                      "min-h-[44px] flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-left transition",
                      selected
                        ? "bg-emerald-500 text-slate-900 border-emerald-400 shadow-lg shadow-emerald-500/30"
                        : "bg-slate-900/60 text-slate-200 border-slate-700/70 hover:border-emerald-400/60 hover:bg-slate-900",
                    ].join(" ")}
                  >
                    <span className="flex-1">{opt.label}</span>
                    <span
                      className={[
                        "ml-2 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold",
                        selected ? "border-slate-900 bg-slate-900 text-emerald-400" : "border-slate-600 text-slate-500",
                      ].join(" ")}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </fieldset>

            <p className="mt-2 text-[11px] text-slate-400">
              {horizonteCompra
                ? `Has seleccionado: ${HORIZONTE_OPCIONES.find((o) => o.value === horizonteCompra)?.label || ""}`
                : "Selecciona una opción para continuar."}
            </p>
          </Field>

          {err && (
            <div className="mt-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100">
              {err}
            </div>
          )}

          <ActionsBar
            left={
              <button className="btn-ghost btn-sm w-full md:w-auto" onClick={back}>
                Atrás
              </button>
            }
            right={
              <button className="btn-primary btn-sm w-full md:w-auto" onClick={next}>
                Siguiente
              </button>
            }
          />
        </div>
      )}

      {/* PASO 4 */}
      {step === 4 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-100">✅ Listo para ver tu resultado</h3>

          <p className="text-[11px] text-slate-400 mb-3">
            Revisaremos tu capacidad de pago, tipo de crédito (VIS/VIP/BIESS/privado) y te mostraremos un resumen claro.
          </p>

          <div className="mb-3 text-[11px] text-slate-500">
            Monto referencial a analizar:
            <span className="font-semibold text-slate-100">
              {" "}
              ${preview.loan.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          </div>

          {isJourneyMode && (
            <div className="mb-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-100">
              En modo Camino, al ver resultados se guardará tu progreso en tu cuenta (si estás logueado).
            </div>
          )}

          {err && (
            <div className="mt-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100">
              {err}
            </div>
          )}

          <ActionsBar
            left={
              <button className="btn-ghost btn-sm w-full md:w-auto" onClick={back}>
                Atrás
              </button>
            }
            right={
              <button className="btn-primary btn-sm w-full md:w-auto" onClick={handleCalcular} disabled={loading}>
                {loading ? "Analizando…" : "Ver resultados"}
              </button>
            }
          />

          <div className="mt-4 flex items-start gap-2">
            <span className="text-slate-500 text-lg">⚖️</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Las precalificaciones generadas por HabitaLibre son estimaciones referenciales. No constituyen aprobación ni oferta formal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
