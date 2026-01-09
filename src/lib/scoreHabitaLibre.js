/** Puntaje HabitaLibre (0–100) con desglose, recomendaciones y elegibilidad
 *  (copiado tal cual para el frontend)
 */

const WEIGHTS = {
  dti: 0.30,
  ltv: 0.25,
  estabilidad: 0.20,
  edad: 0.10,
  tipoIngreso: 0.10,
  declaracionBuro: 0.05,
};

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const invLerp = (a, b, v) => clamp((v - a) / (b - a || 1e-9), 0, 1);
const lerp = (a, b, t) => a + (b - a) * t;

function subscoreDTI(dti) {
  if (!isFinite(dti)) return 10;
  if (dti <= 0.30) return 100;
  if (dti <= 0.35) return lerp(90, 100, invLerp(0.35, 0.30, dti));
  if (dti <= 0.40) return lerp(75, 90, invLerp(0.40, 0.35, dti));
  if (dti <= 0.45) return lerp(55, 75, invLerp(0.45, 0.40, dti));
  if (dti <= 0.55) return lerp(20, 55, invLerp(0.55, 0.45, dti));
  return 10;
}

function subscoreLTV(ltv) {
  if (!isFinite(ltv)) return 20;
  if (ltv <= 0.80) return 100;
  if (ltv <= 0.85) return lerp(85, 100, invLerp(0.85, 0.80, ltv));
  if (ltv <= 0.90) return lerp(65, 85, invLerp(0.90, 0.85, ltv));
  if (ltv <= 0.95) return lerp(40, 65, invLerp(0.95, 0.90, ltv));
  return 20;
}

function subscoreEstabilidad(anios) {
  const a = Number(anios) || 0;
  if (a >= 3) return 100;
  if (a >= 2) return lerp(85, 100, invLerp(2, 3, a));
  if (a >= 1) return lerp(65, 85, invLerp(1, 2, a));
  if (a >= 0.5) return lerp(40, 65, invLerp(0.5, 1, a));
  if (a > 0) return 30;
  return 15;
}

function subscoreEdad(edad) {
  const e = Number(edad) || 0;
  if (e < 21 || e > 75) return 10;
  if (e >= 25 && e <= 55) return 100;
  if (e < 25) return lerp(80, 100, invLerp(21, 25, e));
  if (e <= 65) return lerp(70, 100, invLerp(65, 55, e));
  return lerp(40, 70, invLerp(75, 65, e));
}

function subscoreTipoIngreso(tipo = "Dependiente") {
  const t = String(tipo).toLowerCase();
  if (t === "dependiente") return 100;
  if (t === "mixto") return 85;
  return 70;
}

function subscoreDeclaracionBuro(dec = "ninguno") {
  const d = String(dec).toLowerCase();
  if (d === "ninguno") return 100;
  if (d === "regularizado") return 70;
  return 30;
}

function recomendacionesFrom(b) {
  const rec = [];
  if (b.dti.score < 75) rec.push("Reduce tus deudas mensuales para bajar el DTI por debajo de 40–42%.");
  if (b.ltv.score < 70) rec.push("Aumenta tu entrada (ideal ≥ 20%) para mejorar tu LTV.");
  if (b.estabilidad.score < 80) rec.push("Consolida al menos 1–2 años de estabilidad de ingresos.");
  if (b.tipoIngreso.score < 85) rec.push("Formaliza ingresos y documentación para mejorar condiciones.");
  if (b.declaracionBuro.score < 70) rec.push("Regulariza tu historial crediticio antes de aplicar.");
  return rec;
}

function evaluarElegibilidad({
  tipoCredito = "default",
  esExtranjero = false,
  aportesIESS = 0,
  ultimas13Continuas = false,
}) {
  let elegible = true;
  const motivos = [];
  const t = String(tipoCredito || "").toLowerCase();

  if ((t === "vip" || t === "vis") && esExtranjero) {
    elegible = false;
    motivos.push("Los créditos VIP/VIS de banca privada aplican únicamente para ciudadanos ecuatorianos.");
  }

  if (t === "biess_vip") {
    const aportes = Number(aportesIESS) || 0;
    if (aportes < 36) {
      elegible = false;
      motivos.push("Para crédito BIESS VIP necesitas al menos 36 aportaciones al IESS.");
    }
    if (!ultimas13Continuas) {
      elegible = false;
      motivos.push("Para crédito BIESS VIP las últimas 13 aportaciones deben ser continuas.");
    }
  }

  return { elegible, motivosElegibilidad: motivos };
}

export function scoreHabitaLibre({
  dtiConHipoteca,
  ltv,
  aniosEstabilidad,
  edad,
  tipoIngreso,
  declaracionBuro = "ninguno",
  tipoCredito = "default",
  esExtranjero = false,
  aportesIESS = 0,
  ultimas13Continuas = false,
} = {}) {
  const subs = {
    dti: { score: Math.round(subscoreDTI(Number(dtiConHipoteca))), weight: WEIGHTS.dti, value: dtiConHipoteca },
    ltv: { score: Math.round(subscoreLTV(Number(ltv))), weight: WEIGHTS.ltv, value: ltv },
    estabilidad: { score: Math.round(subscoreEstabilidad(aniosEstabilidad)), weight: WEIGHTS.estabilidad, value: aniosEstabilidad },
    edad: { score: Math.round(subscoreEdad(edad)), weight: WEIGHTS.edad, value: edad },
    tipoIngreso: { score: Math.round(subscoreTipoIngreso(tipoIngreso)), weight: WEIGHTS.tipoIngreso, value: tipoIngreso },
    declaracionBuro: { score: Math.round(subscoreDeclaracionBuro(declaracionBuro)), weight: WEIGHTS.declaracionBuro, value: declaracionBuro },
  };

  const score = Math.round(
    subs.dti.score * subs.dti.weight +
    subs.ltv.score * subs.ltv.weight +
    subs.estabilidad.score * subs.estabilidad.weight +
    subs.edad.score * subs.edad.weight +
    subs.tipoIngreso.score * subs.tipoIngreso.weight +
    subs.declaracionBuro.score * subs.declaracionBuro.weight
  );

  let categoria = "medio";
  let label = "Ajustable";
  if (score >= 80) { categoria = "alto"; label = "Alto potencial"; }
  else if (score < 60) { categoria = "bajo"; label = "Riesgo alto"; }

  const recomendaciones = recomendacionesFrom(subs);

  const { elegible, motivosElegibilidad } = evaluarElegibilidad({
    tipoCredito,
    esExtranjero,
    aportesIESS,
    ultimas13Continuas,
  });

  return {
    score,
    categoria,
    label,
    breakdown: subs,
    recomendaciones,
    elegible,
    motivosElegibilidad,
    weights: WEIGHTS,
  };
}

export default scoreHabitaLibre;
