// src/pages/AppJourney.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { trackPageView } from "../lib/analytics";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import HIcon from "../assets/HICON.png";

const LS_JOURNEY = "hl_app_journey_v5"; // 👈 bump versión

function loadJourney() {
  try {
    const raw = localStorage.getItem(LS_JOURNEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveJourney(data) {
  try {
    localStorage.setItem(LS_JOURNEY, JSON.stringify(data));
  } catch {}
}

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const onlyDigits = (v) => String(v ?? "").replace(/[^\d]/g, "");
const toNum = (v) => {
  const s = onlyDigits(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const moneySoft = (v) => {
  const n = toNum(v);
  if (n == null) return "";
  return `$${n.toLocaleString("es-EC")}`;
};
const yesNoToBool = (v) => {
  const s = String(v ?? "").toLowerCase();
  if (["si", "sí", "true", "1"].includes(s)) return true;
  if (["no", "false", "0"].includes(s)) return false;
  return null;
};

function Field({ label, hint, error, children }) {
  return (
    <div className="mb-4">
      <div className="text-[12px] text-slate-300 mb-1">{label}</div>
      {children}
      {hint ? <div className="text-[11px] text-slate-500 mt-1">{hint}</div> : null}
      {error ? <div className="text-[11px] text-rose-300 mt-1">{error}</div> : null}
    </div>
  );
}

/* =========================
   Background premium wrapper (igual Progreso)
========================= */
function PremiumBg({ children }) {
  return (
    <main className="relative min-h-screen text-slate-50 bg-slate-950 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_0%,rgba(56,189,248,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_15%_15%,rgba(16,185,129,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_85%_35%,rgba(59,130,246,0.12),transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-black/35 to-transparent" />
      </div>
      <div className="relative">{children}</div>
    </main>
  );
}

function hashPayload(obj) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  } catch {
    return String(JSON.stringify(obj || {})).slice(0, 500);
  }
}

/* =========================
   ✅ Query helpers (HashRouter-safe)
========================= */
function getHashQueryString(hash) {
  const h = String(hash || "");
  // ejemplos:
  // "#/app?mode=journey&afinando=1"
  // "#/app/precalificar?mode=mobile"
  const i = h.indexOf("?");
  if (i === -1) return "";
  return h.slice(i + 1);
}

function buildMergedParams(location) {
  const fromSearch = new URLSearchParams(String(location?.search || "").replace(/^\?/, ""));
  const fromHash = new URLSearchParams(getHashQueryString(location?.hash || ""));

  // hash suele ser la “verdad” en HashRouter cuando el query queda dentro del hash
  // entonces: dejamos que hash sobreescriba search si existe
  const merged = new URLSearchParams(fromSearch);
  for (const [k, v] of fromHash.entries()) merged.set(k, v);
  return merged;
}

function getQueryParam(location, key) {
  try {
    const merged = buildMergedParams(location);
    const v = merged.get(key);
    return v;
  } catch {
    return null;
  }
}

function replaceParams(nav, location, nextParams) {
  const qs = nextParams.toString();
  // Navegamos a pathname con search "real" (HashRouter lo mete en el hash correctamente)
  nav(`${location.pathname}${qs ? `?${qs}` : ""}`, { replace: true });
}

/* =========================
   Sticky footer (mobile-first)
========================= */
function StickyNav({ onBack, onNext, disableBack, disableNext, nextLabel = "Continuar" }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[80]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      <div className="pointer-events-auto mx-auto max-w-[520px] px-4 pb-[max(14px,env(safe-area-inset-bottom,0px))] pt-3">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/75 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.55)] p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onBack}
              disabled={disableBack}
              className="h-12 rounded-2xl border border-slate-700 bg-slate-900/30 hover:bg-slate-900/45 text-slate-100 font-semibold text-sm disabled:opacity-40"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={disableNext}
              className="h-12 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm disabled:opacity-40"
            >
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Amortización (preview 12 meses) — modal mini
========================= */
function pmt(principal, annualRate, years) {
  const n = Math.max(1, Math.round(years * 12));
  const r = annualRate / 100 / 12;
  if (!Number.isFinite(principal) || principal <= 0) return 0;
  if (!Number.isFinite(r) || r <= 0) return principal / n;

  const pow = Math.pow(1 + r, n);
  return (principal * (r * pow)) / (pow - 1);
}

function buildAmortSchedulePreview({ principal, annualRate, years }) {
  const n = Math.max(1, Math.round(years * 12));
  const r = annualRate / 100 / 12;
  const payment = pmt(principal, annualRate, years);

  let balance = principal;
  let totalInt = 0;
  let totalPrin = 0;

  const rows = [];
  for (let m = 1; m <= Math.min(12, n); m++) {
    const interest = r > 0 ? balance * r : 0;
    const principalPay = Math.max(0, payment - interest);
    balance = Math.max(0, balance - principalPay);

    totalInt += interest;
    totalPrin += principalPay;

    rows.push({ mes: m, pago: payment, interes: interest, capital: principalPay, saldo: balance });
  }

  return {
    payment,
    rows,
    totals: {
      pagoTotal: payment * rows.length,
      interesTotal: totalInt,
      capitalTotal: totalPrin,
      saldoFinal: balance,
    },
  };
}

function fmtMoney(n) {
  return `$${Number(n || 0).toLocaleString("es-EC", { maximumFractionDigits: 0 })}`;
}

function AmortModalMini({ open, onClose, form, calcResult }) {
  const preview = useMemo(() => {
    if (!open) return null;

    const valor = toNum(form?.valorVivienda) ?? 0;
    const entrada = toNum(form?.entradaDisponible) ?? 0;
    const principal = Math.max(0, valor - entrada);

    const years = 25;

    const tasaRaw =
      calcResult?.tasaAnual ??
      calcResult?.tasa ??
      calcResult?.tasaFija ??
      calcResult?.tasaInteres ??
      calcResult?.resultado?.tasaAnual ??
      calcResult?.resultado?.tasa ??
      null;

    const annualRate = (() => {
      const x = Number(tasaRaw);
      if (!Number.isFinite(x) || x <= 0) return 9.7;
      return x > 1.5 ? x : x * 100;
    })();

    if (principal <= 0) return { error: "Necesito valor de vivienda y (opcional) entrada para armar la amortización." };

    const sched = buildAmortSchedulePreview({ principal, annualRate, years });

    return { principal, years, annualRate, ...sched };
  }, [open, form, calcResult]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-[920px] m-0 sm:m-6 rounded-t-3xl sm:rounded-3xl border border-slate-800/80 bg-slate-950/90 shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
        <div className="p-5 sm:p-6 border-b border-slate-800/70 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400">Amortización (preview)</p>
            <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-50">Primer año: cuota vs. interés vs. capital</h3>
            <p className="mt-2 text-[12px] text-slate-400">Orientativo. La tasa final y condiciones las confirma el banco.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-slate-500"
          >
            Cerrar
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {preview?.error ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
              {preview.error}
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
                  <p className="text-[11px] text-slate-400">Monto a financiar</p>
                  <p className="mt-1 text-lg font-semibold">{fmtMoney(preview.principal)}</p>
                </div>
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
                  <p className="text-[11px] text-slate-400">Tasa (preview)</p>
                  <p className="mt-1 text-lg font-semibold">{preview.annualRate.toFixed(2)}%</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {Number.isFinite(Number(calcResult?.tasaAnual ?? calcResult?.tasa)) ? "Tomada del backend (si existe)" : "Fallback heurístico"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
                  <p className="text-[11px] text-slate-400">Plazo</p>
                  <p className="mt-1 text-lg font-semibold">{preview.years} años</p>
                </div>
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
                  <p className="text-[11px] text-slate-400">Cuota estimada</p>
                  <p className="mt-1 text-lg font-semibold">{fmtMoney(preview.payment)}/mes</p>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800/70">
                <div className="max-h-[360px] overflow-auto bg-slate-950/20">
                  <table className="min-w-full text-left text-[12px]">
                    <thead className="sticky top-0 bg-slate-950/90 backdrop-blur border-b border-slate-800/70">
                      <tr className="text-slate-300">
                        <th className="px-4 py-3 font-semibold">Mes</th>
                        <th className="px-4 py-3 font-semibold">Pago</th>
                        <th className="px-4 py-3 font-semibold">Interés</th>
                        <th className="px-4 py-3 font-semibold">Capital</th>
                        <th className="px-4 py-3 font-semibold">Saldo</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-200">
                      {preview.rows.map((r) => (
                        <tr key={r.mes} className="border-b border-slate-900/60">
                          <td className="px-4 py-3 text-slate-300">{r.mes}</td>
                          <td className="px-4 py-3">{fmtMoney(r.pago)}</td>
                          <td className="px-4 py-3">{fmtMoney(r.interes)}</td>
                          <td className="px-4 py-3">{fmtMoney(r.capital)}</td>
                          <td className="px-4 py-3">{fmtMoney(r.saldo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-950/40 border-t border-slate-800/70 grid gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-[11px] text-slate-400">Pago total (12m)</p>
                    <p className="mt-1 font-semibold">{fmtMoney(preview.totals.pagoTotal)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Interés (12m)</p>
                    <p className="mt-1 font-semibold">{fmtMoney(preview.totals.interesTotal)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Capital (12m)</p>
                    <p className="mt-1 font-semibold">{fmtMoney(preview.totals.capitalTotal)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Saldo fin año 1</p>
                    <p className="mt-1 font-semibold">{fmtMoney(preview.totals.saldoFinal)}</p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-slate-500">Nota: preview simple (no incluye seguros/costos del banco).</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   🔥 CrashShield INLINE (sin crear otro archivo)
   - Si algo crashea, en vez de negro te muestra el error
===================================================== */
function CrashView({ error }) {
  const msg = error?.message || String(error || "Error");
  const stack = error?.stack || "";
  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e5e7eb", padding: 16 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ fontSize: 12, letterSpacing: 2, opacity: 0.8 }}>HABITALIBRE · ERROR</div>
        <h1 style={{ fontSize: 22, marginTop: 8 }}>Se rompió el render 😬</h1>

        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Mensaje</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{msg}</div>
        </div>

        {stack ? (
          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: "pointer", fontWeight: 700 }}>Stack</summary>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, marginTop: 10 }}>{stack}</pre>
          </details>
        ) : null}
      </div>
    </div>
  );
}

function withCrashShield(renderFn) {
  try {
    return renderFn();
  } catch (e) {
    console.error("💥 Crash AppJourney:", e);
    return <CrashView error={e} />;
  }
}

export default function AppJourney() {
  const nav = useNavigate();
  const location = useLocation();
  const { token, user } = useCustomerAuth();

  // ✅ mode detectado aunque esté dentro del hash
  const mode = getQueryParam(location, "mode");
  const isMobileMode = mode === "mobile";

  const saved = useMemo(() => loadJourney(), []);
  const [welcomed, setWelcomed] = useState(!!saved?.welcomed);

  const [step, setStep] = useState(saved?.step || 1);

  const defaultForm = useMemo(
    () => ({
      ingresoNetoMensual: "",
      ingresoPareja: "",
      valorVivienda: "",
      entradaDisponible: "",
      edad: "",
      ciudadCompra: "Quito",
      afiliadoIess: "si",
      otrasDeudasMensuales: "",
    }),
    []
  );

  const [form, setForm] = useState(saved?.form || defaultForm);

  const [calcResult, setCalcResult] = useState(saved?.calcResult || null);
  const [calcBusy, setCalcBusy] = useState(false);
  const [calcError, setCalcError] = useState("");

  const [amortOpen, setAmortOpen] = useState(false);

  const [lastCalcKey, setLastCalcKey] = useState(saved?.lastCalcKey || "");
  const lastCalcKeyRef = useRef(lastCalcKey);
  useEffect(() => {
    lastCalcKeyRef.current = lastCalcKey;
  }, [lastCalcKey]);

  const persist = (next = {}) => {
    saveJourney({
      welcomed,
      step,
      form,
      calcResult,
      lastCalcKey,
      updatedAt: new Date().toISOString(),
      ...next,
    });
  };

  const set = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    persist({ form: next });
  };

  const stepsTotal = 4;
  const pct = Math.round((clamp(step, 1, stepsTotal) / stepsTotal) * 100);

  useEffect(() => {
    trackPageView("app_journey");
  }, []);

  /* =========================================================
     ✅ AFINAR: afinando=1 (desde search o hash)
     - resetea journey
     - limpia param con replace
  ========================================================= */
  useEffect(() => {
    const afinando = getQueryParam(location, "afinando") === "1";
    if (!afinando) return;

    setForm(defaultForm);
    setCalcResult(null);
    setCalcError("");
    setLastCalcKey("");
    setStep(1);

    saveJourney({
      welcomed,
      step: 1,
      form: defaultForm,
      calcResult: null,
      lastCalcKey: "",
      updatedAt: new Date().toISOString(),
    });

    const merged = buildMergedParams(location);
    merged.delete("afinando");
    // si quieres también limpiar "force", descomenta:
    // merged.delete("force");

    replaceParams(nav, location, merged);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  /* =========================================================
     ✅ tab=amort => abre modal (desde search o hash)
  ========================================================= */
  useEffect(() => {
    const tab = getQueryParam(location, "tab");
    if (tab === "amort") setAmortOpen(true);
  }, [location.key]);

  const errors = useMemo(() => {
    const e = {};
    if (step === 2) {
      const inc = toNum(form.ingresoNetoMensual);
      if (inc == null || inc <= 0) e.ingresoNetoMensual = "Ingresa tu ingreso neto mensual.";
    }
    if (step === 3) {
      const vv = toNum(form.valorVivienda);
      const edad = toNum(form.edad);
      if (vv == null || vv <= 0) e.valorVivienda = "Ingresa el valor de la vivienda.";
      if (edad == null || edad < 18 || edad > 80) e.edad = "Ingresa una edad válida (18–80).";
    }
    return e;
  }, [step, form]);

  const canNext = useMemo(() => {
    if (step === 1) return true;
    if (step === 2) return !errors.ingresoNetoMensual;
    if (step === 3) return !errors.valorVivienda && !errors.edad;
    return false;
  }, [step, errors]);

  const nextStep = () => {
    if (step >= 4) return;
    if (!canNext && step !== 1) return;
    const s = clamp(step + 1, 1, stepsTotal);
    setStep(s);
    persist({ step: s });
  };

  const prevStep = () => {
    const s = clamp(step - 1, 1, stepsTotal);
    setStep(s);
    persist({ step: s });
  };

  const goLogin = () =>
    nav("/login", {
      state: {
        returnTo: isMobileMode ? "/app?mode=mobile" : "/app",
        from: "app",
      },
    });

  const payload = useMemo(
    () => ({
      ingresoNetoMensual: toNum(form.ingresoNetoMensual) ?? 0,
      ingresoPareja: toNum(form.ingresoPareja) ?? 0,
      otrasDeudasMensuales: toNum(form.otrasDeudasMensuales) ?? 0,
      valorVivienda: toNum(form.valorVivienda) ?? 0,
      entradaDisponible: toNum(form.entradaDisponible) ?? 0,
      edad: toNum(form.edad),
      ciudad: form.ciudadCompra,
      afiliadoIess: yesNoToBool(form.afiliadoIess) ?? false,
    }),
    [form]
  );

  const calcKey = useMemo(() => hashPayload(payload), [payload]);

  const calcular = async () => {
    if (!token) return;

    if (lastCalcKeyRef.current === calcKey && calcResult) return;

    setCalcBusy(true);
    setCalcError("");

    try {
      const resp = await fetch(`${API_BASE}/api/precalificar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await resp.json();
      } catch {
        data = null;
      }

      if (!resp.ok) {
        const msg = data?.message || `Error HTTP ${resp.status}`;
        throw new Error(msg);
      }

      setCalcResult(data);
      setLastCalcKey(calcKey);

      persist({ calcResult: data, lastCalcKey: calcKey, step: 4 });
    } catch (e) {
      setCalcError(e?.message || "No pudimos calcular tu resultado.");
      setCalcResult(null);
      setLastCalcKey(calcKey);
      persist({ calcResult: null, lastCalcKey: calcKey, step: 4 });
    } finally {
      setCalcBusy(false);
    }
  };

  useEffect(() => {
    if (step === 4 && token) calcular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, token, calcKey]);

  const sinOferta = !!calcResult?.sinOferta;

  const showWelcome = !!token && !welcomed;

  const beginJourney = () => {
    setWelcomed(true);
    const s = clamp(step || 1, 1, stepsTotal);
    setStep(s);
    saveJourney({
      welcomed: true,
      step: s,
      form,
      calcResult,
      lastCalcKey,
      updatedAt: new Date().toISOString(),
    });
  };

  const pickIess = (val) => {
    set("afiliadoIess", val);
    if (isMobileMode) {
      setTimeout(() => {
        setStep((cur) => {
          if (cur !== 1) return cur;
          const s = 2;
          persist({ step: s });
          return s;
        });
      }, 180);
    }
  };

  return withCrashShield(() => (
    <PremiumBg>
      <div className="mx-auto max-w-[520px] px-4 pt-6 pb-28">
        {/* Debug/marker */}
        <div className="fixed top-3 right-3 z-[99999] rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] text-emerald-200">
          APP · {isMobileMode ? "MODO APP" : "WEB"} · mode={mode || "—"}
        </div>

        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 rounded-2xl bg-slate-900/90 border border-emerald-400/60
                         shadow-[0_0_25px_rgba(16,185,129,0.35)]
                         flex items-center justify-center overflow-hidden"
            >
              <img src={HIcon} alt="HabitaLibre" className="h-7 w-7 object-contain" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-lg text-white tracking-tight">HabitaLibre</div>
              <div className="text-[11px] text-emerald-300/90">Journey (app)</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-400 tracking-widest uppercase">Paso</div>
            <div className="text-sm text-slate-300">{showWelcome ? "—" : `${step} / ${stepsTotal}`}</div>
          </div>
        </header>

        {showWelcome && (
          <section className="mt-6 rounded-3xl border border-slate-800/70 bg-slate-950/40 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.8)] p-6">
            <div className="text-[11px] tracking-[0.2em] uppercase text-slate-400">Bienvenido</div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-50">
              Hola{user?.email ? `, ${String(user.email).split("@")[0]}` : ""} 👋
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              En menos de 2 minutos te damos un resultado estimado y un plan claro para avanzar.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 px-4 py-3">
                <div className="text-sm font-semibold text-slate-100">Sin buró</div>
                <div className="text-[12px] text-slate-400 mt-0.5">Es educativo y rápido.</div>
              </div>
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 px-4 py-3">
                <div className="text-sm font-semibold text-slate-100">Guardado</div>
                <div className="text-[12px] text-slate-400 mt-0.5">Tu progreso queda aquí.</div>
              </div>
            </div>

            <button
              type="button"
              onClick={beginJourney}
              className="mt-6 w-full h-12 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold"
            >
              Empezar mi Journey →
            </button>
          </section>
        )}

        {!showWelcome && (
          <>
            <div className="mt-6 w-full h-2 bg-slate-800 rounded-full">
              <div className="h-2 bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>

            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
              {step === 1 && (
                <>
                  <h2 className="text-lg font-semibold mb-4">¿Dónde quieres comprar?</h2>

                  <Field label="Ciudad">
                    <select
                      value={form.ciudadCompra}
                      onChange={(e) => set("ciudadCompra", e.target.value)}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3"
                    >
                      <option>Quito</option>
                      <option>Guayaquil</option>
                      <option>Cuenca</option>
                      <option>Manta</option>
                      <option>Ambato</option>
                    </select>
                  </Field>

                  <div className="text-[12px] text-slate-300 mb-2">¿Afiliado al IESS?</div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => pickIess("si")}
                      className={`flex-1 rounded-xl py-3 border ${
                        form.afiliadoIess === "si"
                          ? "bg-emerald-400 text-slate-900 border-emerald-300"
                          : "border-slate-700 bg-slate-950/10"
                      }`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => pickIess("no")}
                      className={`flex-1 rounded-xl py-3 border ${
                        form.afiliadoIess === "no"
                          ? "bg-emerald-400 text-slate-900 border-emerald-300"
                          : "border-slate-700 bg-slate-950/10"
                      }`}
                    >
                      No
                    </button>
                  </div>

                  <div className="mt-4 text-[11px] text-slate-500">
                    * Esto es una precalificación educativa. No consultamos buró.
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-lg font-semibold mb-4">Tus ingresos</h2>

                  <Field label="Ingreso neto mensual" hint={moneySoft(form.ingresoNetoMensual)} error={errors.ingresoNetoMensual}>
                    <input
                      value={form.ingresoNetoMensual}
                      onChange={(e) => set("ingresoNetoMensual", onlyDigits(e.target.value))}
                      inputMode="numeric"
                      placeholder="Ej: 850"
                      className={`w-full rounded-xl bg-slate-800 border px-4 py-3 outline-none ${
                        errors.ingresoNetoMensual ? "border-rose-400/60" : "border-slate-700"
                      }`}
                    />
                  </Field>

                  <Field label="Ingreso pareja (opcional)" hint={moneySoft(form.ingresoPareja)}>
                    <input
                      value={form.ingresoPareja}
                      onChange={(e) => set("ingresoPareja", onlyDigits(e.target.value))}
                      inputMode="numeric"
                      placeholder="Ej: 600"
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none"
                    />
                  </Field>

                  <Field label="Otras deudas mensuales (opcional)" hint={moneySoft(form.otrasDeudasMensuales)}>
                    <input
                      value={form.otrasDeudasMensuales}
                      onChange={(e) => set("otrasDeudasMensuales", onlyDigits(e.target.value))}
                      inputMode="numeric"
                      placeholder="Ej: 120"
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none"
                    />
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-lg font-semibold mb-4">Tu vivienda</h2>

                  <Field label="Valor de la vivienda" hint={moneySoft(form.valorVivienda)} error={errors.valorVivienda}>
                    <input
                      value={form.valorVivienda}
                      onChange={(e) => set("valorVivienda", onlyDigits(e.target.value))}
                      inputMode="numeric"
                      placeholder="Ej: 71000"
                      className={`w-full rounded-xl bg-slate-800 border px-4 py-3 outline-none ${
                        errors.valorVivienda ? "border-rose-400/60" : "border-slate-700"
                      }`}
                    />
                  </Field>

                  <Field label="Entrada disponible (opcional)" hint={moneySoft(form.entradaDisponible)}>
                    <input
                      value={form.entradaDisponible}
                      onChange={(e) => set("entradaDisponible", onlyDigits(e.target.value))}
                      inputMode="numeric"
                      placeholder="Ej: 5000"
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none"
                    />
                  </Field>

                  <Field label="Edad" error={errors.edad}>
                    <input
                      value={form.edad}
                      onChange={(e) => set("edad", onlyDigits(e.target.value))}
                      inputMode="numeric"
                      placeholder="Ej: 29"
                      className={`w-full rounded-xl bg-slate-800 border px-4 py-3 outline-none ${
                        errors.edad ? "border-rose-400/60" : "border-slate-700"
                      }`}
                    />
                  </Field>
                </>
              )}

              {step === 4 && !token && (
                <>
                  <h2 className="text-lg font-semibold mb-2">Guarda tu progreso</h2>
                  <p className="text-sm text-slate-400 mb-4">
                    Para ver tu resultado dentro de la app y guardar tu plan, inicia sesión.
                  </p>

                  <button onClick={goLogin} className="w-full bg-emerald-400 text-slate-900 font-semibold rounded-xl py-3">
                    Iniciar sesión / Crear cuenta
                  </button>

                  {!isMobileMode && (
                    <button onClick={() => nav("/precalificar")} className="w-full mt-3 border border-slate-700 rounded-xl py-3">
                      Usar simulador web
                    </button>
                  )}
                </>
              )}

              {step === 4 && token && (
                <>
                  <h2 className="text-lg font-semibold mb-3">Tu resultado (estimado)</h2>

                  {calcBusy && (
                    <div className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3 text-sm">Calculando...</div>
                  )}

                  {calcError && (
                    <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                      {calcError}
                      <button onClick={calcular} className="mt-3 w-full rounded-xl border border-slate-700 py-3 text-slate-100">
                        Reintentar
                      </button>
                    </div>
                  )}

                  {!calcBusy && !calcError && calcResult && (
                    <>
                      <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-4">
                        <div className="text-base font-semibold">
                          {sinOferta ? "Necesitamos mejorar tu perfil" : "Sí hay ruta posible 🎉"}
                        </div>
                        <div className="text-[12px] text-slate-400 mt-2">
                          {sinOferta
                            ? "No es un “no”. Es un “ajustemos precio, entrada o plazo”."
                            : "Te ayudamos a convertir esto en un plan real con checklist."}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          className="h-12 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold"
                          onClick={() => {
                            window.location.href =
                              "https://wa.me/593000000000?text=Hola%20HabitaLibre%2C%20quiero%20mi%20plan%20y%20checklist%20para%20mi%20cr%C3%A9dito.";
                          }}
                        >
                          {sinOferta ? "Mejorar" : "Iniciar"}
                        </button>

                        <button
                          className="h-12 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-100 font-semibold"
                          onClick={() => setAmortOpen(true)}
                        >
                          Ver amort →
                        </button>
                      </div>

                      <button
                        className="w-full mt-3 border border-slate-700 rounded-xl py-3"
                        onClick={() => {
                          setLastCalcKey("");
                          calcular();
                        }}
                      >
                        Recalcular
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {step !== 4 && !canNext && (
              <div className="mt-3 text-[12px] text-slate-400">Completa los campos marcados para continuar.</div>
            )}

            <StickyNav
              onBack={prevStep}
              onNext={nextStep}
              disableBack={step === 1}
              disableNext={step === 4 || !canNext}
              nextLabel={step === 3 ? "Ver resultado" : "Continuar"}
            />
          </>
        )}
      </div>

      <AmortModalMini open={amortOpen} onClose={() => setAmortOpen(false)} form={form} calcResult={calcResult} />
    </PremiumBg>
  ));
}