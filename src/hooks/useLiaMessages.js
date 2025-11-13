// src/hooks/useLiaMessages.js
export function useLiaMessages({ step, ingreso, ingresoPareja, usarIngresoPareja, deudas, valor, entrada, ltv, cap, afiliadoIESS, iessAportesTotales, iessAportesConsecutivas }) {
  // Reglas simples de estado de ánimo y copy por paso
  if (step === 1) {
    const baseMsg = usarIngresoPareja
      ? `Usaremos el ingreso de tu pareja para la evaluación.`
      : `Perfecto, vamos con tu ingreso principal.`;
    const deudaAlta = (Number(deudas) || 0) > (usarIngresoPareja ? Number(ingresoPareja) : Number(ingreso)) * 0.4;

    return {
      mood: deudaAlta ? "warn" : "happy",
      title: "Paso 1: Ingresos y deudas",
      message: deudaAlta
        ? "Veo que tus deudas pesan bastante sobre tus ingresos. Si bajas un poco esas cuotas, tu capacidad mejora enseguida."
        : "¡Buen comienzo! Con estos ingresos, ya tenemos una buena base para tu precalificación.",
      hint: baseMsg,
    };
  }

  if (step === 2) {
    const ltvPct = Math.round((ltv || 0) * 100);
    const ltvMood = ltv <= 0.8 ? "happy" : ltv <= 0.9 ? "think" : "warn";
    return {
      mood: ltvMood,
      title: "Paso 2: Tu vivienda",
      message:
        ltv <= 0.8
          ? "Tu LTV luce muy saludable. ¡Esto te abre mejores opciones y tasas!"
          : ltv <= 0.9
          ? "Estás cerca del umbral. Un poquito más de entrada puede mejorar tu perfil."
          : "El LTV está alto. Si aumentas entrada, tu evaluación mejorará bastante.",
      hint: `Entrada: $${Number(entrada || 0).toLocaleString("en-US")} · LTV: ${ltvPct}%`,
    };
  }

  if (step === 3) {
    if (afiliadoIESS) {
      const okTot = (Number(iessAportesTotales) || 0) >= 36;
      const okCon = (Number(iessAportesConsecutivas) || 0) >= 13;
      let mood = "think";
      let msg = "¡Ya casi! Completa tus datos del IESS para evaluar opciones BIESS.";
      if (okTot && okCon) {
        mood = "happy";
        msg = "¡Excelente! Cumples con los requisitos de aportes para opciones BIESS preferenciales.";
      } else if (!okTot || !okCon) {
        mood = "warn";
        msg = "Aún no cumples todos los requisitos de BIESS. Igual te mostraré alternativas fuertes en banca privada o VIP/VIS.";
      }
      return {
        mood,
        title: "Paso 3: Tu perfil",
        message: msg,
        hint: "Recuerda: BIESS requiere ≥36 aportes totales y ≥13 consecutivos.",
      };
    }

    return {
      mood: "neutral",
      title: "Paso 3: Tu perfil",
      message: "Un último paso y obtienes tu Puntaje HL con tus mejores opciones.",
      hint: "Tu información es confidencial y te ayuda a obtener un análisis más preciso.",
    };
  }

  // fallback
  return { mood: "neutral", title: "Asistente HabitaLibre", message: "Te acompaño en cada paso.", hint: "" };
}
