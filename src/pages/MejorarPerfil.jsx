// src/pages/MejorarPerfil.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal, Target, TrendingUp } from "lucide-react";

import HabitaShell from "../components/HabitaShell.jsx";
import {
  Card,
  Chip,
  PrimaryButton,
  SecondaryButton,
  ProgressBar,
} from "../ui/kit.jsx";
import { apiPost } from "../lib/api.js";
import { moneyUSD } from "../lib/money.js";
import { getCustomer, getCustomerToken } from "../lib/customerSession.js";

const LS_SNAPSHOT = "hl_mobile_last_snapshot_v1";
const LS_JOURNEY = "hl_mobile_journey_v1";

function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function getStorageOwnerEmail() {
  try {
    const email = String(getCustomer()?.email || "").trim().toLowerCase();
    return email || null;
  } catch {
    return null;
  }
}

function loadOwnedData(key) {
  const ownerEmail = getStorageOwnerEmail();
  const envelope = loadJSON(key);

  if (!envelope) return null;

  if (envelope?.ownerEmail && "data" in envelope) {
    if (
      ownerEmail &&
      String(envelope.ownerEmail).trim().toLowerCase() === ownerEmail
    ) {
      return envelope.data ?? null;
    }

    if (!ownerEmail) return envelope.data ?? null;

    return null;
  }

  return envelope;
}

function saveOwnedData(key, data) {
  const ownerEmail = getStorageOwnerEmail();
  saveJSON(key, { ownerEmail, data });
}

const clamp = (n, a, b) => Math.max(a, Math.min(b, Number(n || 0)));

function toNum(v) {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;

  const s = String(v).replace(/[^\d.]/g, "");
  if (!s) return null;

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function pick(snapshot, keys) {
  if (!snapshot) return null;

  for (const k of keys) {
    if (snapshot?.[k] != null) return snapshot[k];
    if (snapshot?.output?.[k] != null) return snapshot.output[k];
  }

  return null;
}

function fmtUSD(n) {
  const x = toNum(n);
  return x == null ? "—" : moneyUSD(x);
}

function safeMoney(n) {
  const x = toNum(n);
  return x == null ? "—" : moneyUSD(x);
}

function normalizeProbability(prob) {
  const clampPct = (p) => {
    if (!Number.isFinite(p)) return null;
    return Math.max(0, Math.min(100, p));
  };

  const parseAnyToPct = (x, depth = 0) => {
    if (x == null) return null;

    if (typeof x === "number") return clampPct(x <= 1 ? x * 100 : x);

    if (typeof x === "string") {
      const s = x.trim();
      const m = s.match(/(\d+(\.\d+)?)/);
      if (!m) return null;

      const n = Number(m[1]);
      if (!Number.isFinite(n)) return null;

      const p = s.includes("%") ? n : n <= 1 ? n * 100 : n;
      return clampPct(p);
    }

    if (Array.isArray(x)) {
      for (const item of x) {
        const p = parseAnyToPct(item, depth + 1);
        if (p != null) return p;
      }
      return null;
    }

    if (typeof x === "object") {
      const direct =
        parseAnyToPct(x.pct, depth + 1) ??
        parseAnyToPct(x.value, depth + 1) ??
        parseAnyToPct(x.total, depth + 1) ??
        parseAnyToPct(x.prob, depth + 1) ??
        parseAnyToPct(x.probabilidad, depth + 1) ??
        parseAnyToPct(x.aprobacion, depth + 1) ??
        parseAnyToPct(x.probAprobacion, depth + 1) ??
        parseAnyToPct(x.aprobacionProb, depth + 1);

      if (direct != null) return direct;

      if (depth >= 3) return null;

      for (const v of Object.values(x)) {
        const p = parseAnyToPct(v, depth + 1);
        if (p != null) return p;
      }

      return null;
    }

    return null;
  };

  const pctValue = parseAnyToPct(prob);

  return pctValue == null
    ? { label: "—", pct: null }
    : { label: `${Math.round(pctValue)}%`, pct: pctValue };
}

function probabilityTone(pct) {
  if (pct == null) return "neutral";
  if (pct >= 75) return "good";
  if (pct >= 50) return "warn";
  return "neutral";
}

function probabilityHint(pct) {
  if (pct == null) {
    return "Todavía no tenemos suficiente información para interpretar esta probabilidad.";
  }

  if (pct >= 75) {
    return "Tu perfil va bien. Ahora el enfoque es optimizar cuota, entrada y documentos.";
  }

  if (pct >= 50) {
    return "Tienes potencial, pero todavía hay palancas claras para fortalecer tu perfil.";
  }

  return "Tu perfil necesita mejoras antes de tener una ruta fuerte de aprobación.";
}

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <div
        style={{
          fontWeight: 950,
          fontSize: 18,
          color: "rgba(226,232,240,0.98)",
          letterSpacing: -0.2,
        }}
      >
        {title}
      </div>

      {subtitle ? (
        <div
          style={{
            marginTop: 8,
            color: "rgba(148,163,184,0.95)",
            fontSize: 13.5,
            lineHeight: 1.45,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function KpiBox({ label, value, helper, tone = "neutral" }) {
  const bg =
    tone === "good"
      ? "rgba(37,211,166,0.09)"
      : tone === "warn"
      ? "rgba(251,191,36,0.09)"
      : "rgba(255,255,255,0.04)";

  const border =
    tone === "good"
      ? "1px solid rgba(37,211,166,0.22)"
      : tone === "warn"
      ? "1px solid rgba(251,191,36,0.22)"
      : "1px solid rgba(255,255,255,0.09)";

  return (
    <div
      style={{
        padding: 15,
        borderRadius: 18,
        background: bg,
        border,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "rgba(148,163,184,0.92)",
          fontWeight: 850,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 7,
          fontSize: 22,
          fontWeight: 980,
          color: "rgba(226,232,240,0.98)",
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>

      {helper ? (
        <div
          style={{
            marginTop: 7,
            fontSize: 12,
            color: "rgba(148,163,184,0.88)",
            lineHeight: 1.35,
          }}
        >
          {helper}
        </div>
      ) : null}
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px 14px",
        borderRadius: 16,
        border: active
          ? "1px solid rgba(37,211,166,0.28)"
          : "1px solid rgba(255,255,255,0.12)",
        background: active
          ? "rgba(37,211,166,0.14)"
          : "rgba(255,255,255,0.05)",
        color: "white",
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SliderMoney({
  label,
  helper,
  value,
  onChange,
  min = 0,
  max = 15000,
  fineUntil = 6000,
  stepFine = 25,
  stepCoarse = 100,
}) {
  const v = Number(toNum(value) ?? 0);
  const step = v <= fineUntil ? stepFine : stepCoarse;

  return (
    <div style={{ marginTop: 18 }}>
      <div
        style={{
          fontSize: 12,
          color: "rgba(148,163,184,0.95)",
          fontWeight: 900,
        }}
      >
        {label}
      </div>

      {helper ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "rgba(148,163,184,0.80)",
            lineHeight: 1.35,
          }}
        >
          {helper}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 11,
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 980,
            color: "rgba(226,232,240,0.98)",
          }}
        >
          {fmtUSD(v)}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "rgba(148,163,184,0.78)",
            alignSelf: "center",
          }}
        >
          {fmtUSD(min)} – {fmtUSD(max)}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(v, min, max)}
        onChange={(e) => onChange(String(e.target.value))}
        style={{
          width: "100%",
          marginTop: 12,
          accentColor: "#25d3a6",
        }}
        aria-label={label}
      />

      <div
        style={{
          marginTop: 10,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <SecondaryButton
          onClick={() => onChange(String(clamp(v - stepFine * 4, min, max)))}
        >
          −
        </SecondaryButton>

        <SecondaryButton
          onClick={() => onChange(String(clamp(v + stepFine * 4, min, max)))}
        >
          +
        </SecondaryButton>
      </div>
    </div>
  );
}

function ProbabilityBox({ valuePct, hint }) {
  const v =
    valuePct == null ? null : Math.max(0, Math.min(100, Number(valuePct)));

  return (
    <div
      style={{
        marginTop: 16,
        padding: 15,
        borderRadius: 18,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "rgba(148,163,184,0.95)",
            fontWeight: 900,
          }}
        >
          Probabilidad de aprobación
        </div>

        <div
          style={{
            fontSize: 12,
            color: "rgba(226,232,240,0.98)",
            fontWeight: 900,
          }}
        >
          {v == null ? "—" : `${Math.round(v)}%`}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <ProgressBar value={v || 0} />
      </div>

      {hint ? (
        <div
          style={{
            marginTop: 9,
            fontSize: 12,
            color: "rgba(148,163,184,0.85)",
            lineHeight: 1.35,
          }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function TipRow({ title, subtitle }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 14 }}>{title}</div>
      <div
        style={{
          marginTop: 5,
          color: "rgba(148,163,184,0.92)",
          fontSize: 12.5,
          lineHeight: 1.35,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

export default function MejorarPerfil() {
  const nav = useNavigate();

  const token = getCustomerToken?.();
  const isLoggedIn = !!token;

  const [tab, setTab] = useState("palancas");

  const [journey, setJourney] = useState(() => loadOwnedData(LS_JOURNEY) || {});
  const [snapshot, setSnapshot] = useState(() => loadOwnedData(LS_SNAPSHOT) || {});

  const [ingreso, setIngreso] = useState(() => {
    const j = loadOwnedData(LS_JOURNEY) || {};
    const f = j?.form || {};

    return String(
      f?.ingreso ??
        f?.ingresoNetoMensual ??
        f?.ingresoMensual ??
        pick(loadOwnedData(LS_SNAPSHOT), ["ingresoNetoMensual", "ingresoTotal"]) ??
        1200
    );
  });

  const [deudas, setDeudas] = useState(() => {
    const j = loadOwnedData(LS_JOURNEY) || {};
    const f = j?.form || {};

    return String(
      f?.deudas ??
        f?.otrasDeudasMensuales ??
        f?.deudasMensuales ??
        pick(loadOwnedData(LS_SNAPSHOT), ["otrasDeudasMensuales"]) ??
        200
    );
  });

  const [entrada, setEntrada] = useState(() => {
    const j = loadOwnedData(LS_JOURNEY) || {};
    const f = j?.form || {};

    return String(
      f?.entrada ??
        f?.entradaDisponible ??
        f?.ahorro ??
        pick(loadOwnedData(LS_SNAPSHOT), ["entradaDisponible"]) ??
        8000
    );
  });

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");

  const cuotaEstimada = pick(snapshot, ["cuotaEstimada", "cuotaMensual"]);
  const precioMaxVivienda = pick(snapshot, [
    "precioMaxVivienda",
    "precioMax",
    "valorMaxVivienda",
  ]);
  const dti = pick(snapshot, ["dtiConHipoteca", "dti"]);
  const scoreRaw = pick(snapshot, ["score", "hlScore", "scoreHL"]);

  const score = useMemo(() => {
    if (scoreRaw == null) return null;
    if (typeof scoreRaw === "number" || typeof scoreRaw === "string") return scoreRaw;
    if (typeof scoreRaw === "object") {
      return scoreRaw?.total ?? scoreRaw?.value ?? scoreRaw?.score ?? null;
    }
    return null;
  }, [scoreRaw]);

  const dtiLabel = useMemo(() => {
    const x = Number(dti);
    if (!Number.isFinite(x)) return "—";
    if (x <= 0.35) return "Saludable";
    if (x <= 0.45) return "Ajustado";
    return "Riesgoso";
  }, [dti]);

  const probabilityRaw =
    pick(snapshot, [
      "probability",
      "probabilidad",
      "probabilidadAprobacion",
      "probAprobacion",
      "aprobacionProb",
      "prob",
      "probNormalized",
      "prob_normalized",
      "probabilityNormalized",
    ]) ?? null;

  const prob = useMemo(() => {
    const p = normalizeProbability(probabilityRaw);
    if (p.pct != null) return p;

    const scoreObj = pick(snapshot, ["score", "hlScore", "scoreHL"]);
    const maybe =
      scoreObj && typeof scoreObj === "object"
        ? scoreObj?.total ?? scoreObj?.score
        : null;

    if (typeof maybe === "number" && Number.isFinite(maybe)) {
      const pct = Math.max(0, Math.min(100, maybe));
      return { label: `${Math.round(pct)}%`, pct };
    }

    return { label: "—", pct: null };
  }, [probabilityRaw, snapshot]);

  function buildEntradaPayload() {
    const f = journey?.form || {};

    const base = {
      nacionalidad: f?.nacionalidad ?? "ecuatoriana",
      estadoCivil: f?.estadoCivil ?? "soltero",
      edad: Number(toNum(f?.edad ?? 30) ?? 30),

      tipoIngreso: f?.tipoIngreso ?? "Dependiente",
      aniosEstabilidad: Number(toNum(f?.aniosEstabilidad ?? 2) ?? 2),

      tieneVivienda: String(f?.tieneVivienda ?? "no") === "sí",
      primeraVivienda: String(f?.primeraVivienda ?? "sí") === "sí",
      tipoVivienda: f?.tipoVivienda ?? "por_estrenar",

      afiliadoIess:
        String(f?.afiliadoIESS ?? f?.afiliadoIess ?? "no") === "sí",
      iessAportesTotales: Number(
        toNum(f?.aportesTotales ?? f?.iessAportesTotales ?? 0) ?? 0
      ),
      iessAportesConsecutivos: Number(
        toNum(f?.aportesConsecutivos ?? f?.iessAportesConsecutivos ?? 0) ?? 0
      ),

      valorVivienda: Number(toNum(f?.valor ?? f?.valorVivienda ?? 90000) ?? 90000),
      tiempoCompra: f?.horizonteCompra ?? f?.tiempoCompra ?? "3-12",

      origen: "web_mejorar_perfil",
    };

    return {
      ...base,
      ingresoNetoMensual: Number(toNum(ingreso) ?? 0),
      otrasDeudasMensuales: Number(toNum(deudas) ?? 0),
      entradaDisponible: Number(toNum(entrada) ?? 0),
    };
  }

  async function recalcular() {
    setErr("");

    if (!isLoggedIn) {
      setErr("Inicia sesión para recalcular y guardar tu escenario.");
      return;
    }

    setBusy(true);

    try {
      const payload = buildEntradaPayload();

      const res = await apiPost("/api/precalificar", payload);
      const snap = res && typeof res === "object" ? res : { output: res };

      setSnapshot(snap);
      saveOwnedData(LS_SNAPSHOT, snap);

      const nextJourney = {
        ...(journey || {}),
        form: {
          ...(journey?.form || {}),
          ingreso: String(Number(toNum(ingreso) ?? 0)),
          deudas: String(Number(toNum(deudas) ?? 0)),
          entrada: String(Number(toNum(entrada) ?? 0)),
          ingresoNetoMensual: String(Number(toNum(ingreso) ?? 0)),
          otrasDeudasMensuales: String(Number(toNum(deudas) ?? 0)),
          entradaDisponible: String(Number(toNum(entrada) ?? 0)),
        },
      };

      setJourney(nextJourney);
      saveOwnedData(LS_JOURNEY, nextJourney);

      setLastUpdatedAt(new Date().toLocaleString("es-EC"));
    } catch (e) {
      console.warn("[HL] MejorarPerfil recalcular error:", e?.message || e);
      setErr(e?.message || "No se pudo recalcular ahora. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  const debounceRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      recalcular();
    }, 650);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingreso, deudas, entrada]);

  const valorViviendaObjetivo = useMemo(() => {
    const f = journey?.form || {};

    return (
      toNum(f?.valorVivienda) ??
      toNum(f?.valor) ??
      toNum(f?.precioVivienda) ??
      toNum(f?.precioObjetivo) ??
      null
    );
  }, [journey]);

  const falta = useMemo(() => {
    const maxV = toNum(precioMaxVivienda);
    const obj = toNum(valorViviendaObjetivo);

    if (maxV == null || obj == null) return null;

    const gap = Math.max(0, obj - maxV);
    const ok = gap <= 0;

    const monthlySave = 300;
    const months = monthlySave > 0 ? Math.ceil(gap / monthlySave) : null;

    return {
      maxV,
      obj,
      gap,
      ok,
      monthlySave,
      months,
    };
  }, [precioMaxVivienda, valorViviendaObjetivo]);

  const insightPrincipal = useMemo(() => {
    if (!isLoggedIn) {
      return "Inicia sesión para ver cómo cambian tus resultados en tiempo real.";
    }

    if (falta?.ok) {
      return "Ya estás dentro del rango para tu vivienda objetivo con tu perfil actual.";
    }

    if (falta && falta.gap > 0) {
      return `Hoy tu brecha estimada es de ${fmtUSD(
        falta.gap
      )} frente a tu objetivo.`;
    }

    return "Ajusta ingresos, deudas y entrada para ver el impacto en tu capacidad de compra.";
  }, [isLoggedIn, falta]);

  return (
    <HabitaShell maxWidth={900}>
      <div style={{ paddingBottom: 32 }}>
        <button
          type="button"
          onClick={() => nav("/que-me-falta")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "white",
            borderRadius: 999,
            padding: "10px 14px",
            cursor: "pointer",
            fontWeight: 850,
            width: "fit-content",
            marginBottom: 18,
          }}
        >
          <ArrowLeft size={15} />
          Volver a Qué me falta
        </button>

        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 13,
              color: "rgba(148,163,184,0.95)",
              fontWeight: 850,
              marginBottom: 8,
            }}
          >
            Mejorar perfil
          </div>

          <div
            style={{
              fontSize: 36,
              lineHeight: 1.02,
              fontWeight: 980,
              letterSpacing: -1.2,
              color: "rgba(226,232,240,0.98)",
              maxWidth: 720,
            }}
          >
            Sube tu capacidad de compra
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 15,
              lineHeight: 1.45,
              color: "rgba(148,163,184,0.95)",
              maxWidth: 720,
            }}
          >
            Ajusta tus palancas financieras y mira cómo cambia tu capacidad,
            cuota y probabilidad de aprobación.
          </div>
        </div>

        <Card
          style={{
            padding: 20,
            background:
              "linear-gradient(180deg, rgba(37,211,166,0.12) 0%, rgba(255,255,255,0.05) 100%)",
            border: "1px solid rgba(37,211,166,0.18)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "rgba(148,163,184,0.95)",
              fontWeight: 900,
            }}
          >
            Lectura rápida
          </div>

          <div
            style={{
              marginTop: 9,
              fontSize: 22,
              fontWeight: 980,
              lineHeight: 1.2,
              color: "rgba(226,232,240,0.98)",
            }}
          >
            {insightPrincipal}
          </div>

          <div
            style={{
              marginTop: 13,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Chip tone={probabilityTone(prob?.pct)}>
              Probabilidad {prob?.label ?? "—"}
            </Chip>

            <Chip tone="neutral">
              Capacidad {isLoggedIn ? safeMoney(precioMaxVivienda) : "—"}
            </Chip>

            <Chip tone="neutral">
              Cuota {isLoggedIn ? safeMoney(cuotaEstimada) : "—"}
            </Chip>
          </div>
        </Card>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 10,
          }}
        >
          <TabButton active={tab === "palancas"} onClick={() => setTab("palancas")}>
            Ajustar escenario
          </TabButton>

          <TabButton active={tab === "falta"} onClick={() => setTab("falta")}>
            Mi brecha
          </TabButton>
        </div>

        <Card style={{ marginTop: 18, padding: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <SectionTitle
              title="Tu panel de mejora"
              subtitle="Este bloque resume dónde estás hoy versus lo que quieres comprar."
            />

            <Chip tone={busy ? "warn" : "neutral"}>
              {busy
                ? "Recalculando…"
                : lastUpdatedAt
                ? `Actualizado ${lastUpdatedAt}`
                : "Listo"}
            </Chip>
          </div>

          <ProbabilityBox
            valuePct={prob?.pct}
            hint={probabilityHint(prob?.pct)}
          />

          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 10,
            }}
          >
            <KpiBox
              label="Vivienda objetivo"
              value={
                valorViviendaObjetivo != null
                  ? fmtUSD(valorViviendaObjetivo)
                  : "—"
              }
              helper="El valor de la vivienda que vienes persiguiendo en tu journey."
            />

            <KpiBox
              label="Capacidad actual"
              value={isLoggedIn ? safeMoney(precioMaxVivienda) : "—"}
              helper="Precio máximo estimado alcanzable hoy."
              tone="good"
            />

            <KpiBox
              label="Cuota estimada"
              value={isLoggedIn ? safeMoney(cuotaEstimada) : "—"}
              helper="Pago mensual estimado con tu escenario actual."
            />

            <KpiBox
              label="Brecha actual"
              value={falta ? (falta.ok ? "Sin brecha" : fmtUSD(falta.gap)) : "—"}
              helper={
                falta
                  ? falta.ok
                    ? "Tu capacidad ya cubre tu objetivo."
                    : "Lo que te falta cerrar frente a tu vivienda objetivo."
                  : "Necesitamos tu objetivo para calcularla."
              }
              tone={falta?.ok ? "good" : "warn"}
            />
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Chip tone="neutral">Score {isLoggedIn ? score ?? "—" : "—"}</Chip>
            <Chip tone={probabilityTone(prob?.pct)}>
              Probabilidad {prob?.label ?? "—"}
            </Chip>
            <Chip tone="neutral">DTI {isLoggedIn ? dtiLabel : "—"}</Chip>
            <Chip tone="neutral">Ingreso {fmtUSD(Number(toNum(ingreso) ?? 0))}</Chip>
            <Chip tone="neutral">Deudas {fmtUSD(Number(toNum(deudas) ?? 0))}</Chip>
            <Chip tone="neutral">Entrada {fmtUSD(Number(toNum(entrada) ?? 0))}</Chip>
          </div>

          {!isLoggedIn ? (
            <div style={{ marginTop: 14 }}>
              <PrimaryButton onClick={() => nav("/login")}>
                Entrar para ver tu resultado real
              </PrimaryButton>
            </div>
          ) : null}
        </Card>

        {tab === "palancas" ? (
          <Card style={{ marginTop: 18, padding: 20 }}>
            <SectionTitle
              title="Ajusta tus palancas"
              subtitle="Estas son las variables que más rápido suelen mover tu capacidad de compra."
            />

            <SliderMoney
              label="Ingreso neto mensual"
              helper="Subir ingresos demostrables suele mejorar capacidad, score y probabilidad."
              value={ingreso}
              onChange={setIngreso}
              max={20000}
              fineUntil={6000}
              stepFine={25}
              stepCoarse={100}
            />

            <SliderMoney
              label="Deudas mensuales"
              helper="Bajar deudas mejora tu DTI. Suele ser una de las palancas más poderosas."
              value={deudas}
              onChange={setDeudas}
              max={15000}
              fineUntil={3000}
              stepFine={25}
              stepCoarse={100}
            />

            <SliderMoney
              label="Entrada disponible"
              helper="Incluye ahorros, cesantía, fondos de reserva u otras fuentes reales."
              value={entrada}
              onChange={setEntrada}
              max={
                valorViviendaObjetivo != null
                  ? Math.max(15000, Math.round(valorViviendaObjetivo * 0.6))
                  : 15000
              }
              fineUntil={15000}
              stepFine={50}
              stepCoarse={200}
            />

            <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
              <TipRow
                title="1. Baja deudas"
                subtitle="Suele mejorar la capacidad más rápido porque libera cuota mensual."
              />
              <TipRow
                title="2. Sube entrada"
                subtitle="Ayuda a bajar cuota, mejorar LTV y abrir mejores rutas."
              />
              <TipRow
                title="3. Fortalece ingreso demostrable"
                subtitle="Más ingreso formal mejora capacidad, score y probabilidad."
              />
            </div>

            {err ? (
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 18,
                  background: "rgba(244,63,94,0.10)",
                  border: "1px solid rgba(244,63,94,0.25)",
                  fontSize: 13,
                  lineHeight: 1.4,
                  color: "rgba(254,202,202,0.95)",
                }}
              >
                {err}
              </div>
            ) : null}

            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              <PrimaryButton onClick={recalcular} disabled={busy}>
                {busy ? "Recalculando…" : "Recalcular ahora"}
              </PrimaryButton>

              <SecondaryButton onClick={() => nav("/progreso")}>
                Volver al Home
              </SecondaryButton>
            </div>
          </Card>
        ) : null}

        {tab === "falta" ? (
          <Card style={{ marginTop: 18, padding: 20 }}>
            <SectionTitle
              title="Tu brecha hacia la vivienda objetivo"
              subtitle="Aquí aterrizamos la distancia entre lo que quieres comprar y lo que hoy soporta tu perfil."
            />

            {falta ? (
              <>
                <div
                  style={{
                    marginTop: 16,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 10,
                  }}
                >
                  <KpiBox
                    label="Tu objetivo"
                    value={moneyUSD(falta.obj)}
                    helper="Valor de la vivienda que quieres alcanzar."
                  />

                  <KpiBox
                    label="Tu capacidad hoy"
                    value={moneyUSD(falta.maxV)}
                    helper="Precio máximo estimado hoy."
                    tone="good"
                  />
                </div>

                <div
                  style={{
                    marginTop: 14,
                    padding: 15,
                    borderRadius: 18,
                    background: falta.ok
                      ? "rgba(37,211,166,0.09)"
                      : "rgba(251,191,36,0.09)",
                    border: falta.ok
                      ? "1px solid rgba(37,211,166,0.22)"
                      : "1px solid rgba(251,191,36,0.22)",
                  }}
                >
                  <div style={{ fontWeight: 950 }}>
                    {falta.ok
                      ? "Ya estás dentro del rango"
                      : "Todavía hay una brecha"}
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      color: "rgba(226,232,240,0.88)",
                      lineHeight: 1.4,
                      fontSize: 13,
                    }}
                  >
                    {falta.ok
                      ? "Con tu perfil actual ya estás dentro del rango estimado para tu vivienda objetivo."
                      : `Te faltan aproximadamente ${moneyUSD(
                          falta.gap
                        )} para cerrar la brecha frente a tu objetivo.`}
                  </div>

                  {!falta.ok ? (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "rgba(148,163,184,0.9)",
                      }}
                    >
                      Si ahorras {moneyUSD(falta.monthlySave)} por mes, te tomaría
                      aprox. <b>{falta.months ?? "—"} meses</b> cerrar esa
                      brecha en una estimación simple.
                    </div>
                  ) : null}
                </div>

                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  <TipRow
                    title="1. Reducir deudas"
                    subtitle="Esto suele mejorar la capacidad más rápido que cualquier otra palanca."
                  />
                  <TipRow
                    title="2. Subir entrada"
                    subtitle="Te ayuda a bajar cuota, mejorar LTV y abrir mejores rutas."
                  />
                  <TipRow
                    title="3. Mejorar ingreso demostrable"
                    subtitle="Más ingreso formal mejora capacidad, score y probabilidad."
                  />
                </div>

                <div style={{ marginTop: 16 }}>
                  <PrimaryButton onClick={() => setTab("palancas")}>
                    Ajustar mi escenario
                  </PrimaryButton>
                </div>
              </>
            ) : (
              <div
                style={{
                  marginTop: 14,
                  padding: 15,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  fontSize: 13,
                  lineHeight: 1.4,
                  color: "rgba(226,232,240,0.9)",
                }}
              >
                Para mostrar esta sección necesitamos un valor de vivienda objetivo
                guardado en tu journey. Puedes volver a tu evaluación y definirlo.
              </div>
            )}
          </Card>
        ) : null}

        <div
          style={{
            marginTop: 16,
            fontSize: 12,
            color: "rgba(148,163,184,0.72)",
            lineHeight: 1.4,
            textAlign: "center",
          }}
        >
          Nota: esta es una estimación referencial. La aprobación final depende de
          documentos, validaciones y políticas vigentes de cada entidad.
        </div>
      </div>
    </HabitaShell>
  );
}