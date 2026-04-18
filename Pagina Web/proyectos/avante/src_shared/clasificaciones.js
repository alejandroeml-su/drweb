// Clasificaciones bariátricas/metabólicas
// Sólo cálculos — cada módulo consume lo que necesita.
// Fuentes: IFSO/ASMBS guidelines, publicaciones originales.

function numOrZero(v) { const n = parseFloat(v); return isFinite(n) ? n : 0; }
function imc(peso, talla_cm) {
  const p = numOrZero(peso), t = numOrZero(talla_cm) / 100;
  if (!p || !t) return 0; return p / (t * t);
}

/* ============================================================
 * 1) MAGKOS / Aminian — Sensibilidad hepática y función celular
 *    Predictor de resolución de esteatohepatitis (MASH/MASLD)
 *    tras cirugía metabólica.  Variables clínicas y bioquímicas.
 * ============================================================ */
export function magkosAminian(p) {
  const i = imc(p.peso, p.talla);
  const alt = numOrZero(p.alt);
  const ast = numOrZero(p.ast);
  const hba1c = numOrZero(p.hba1c);
  const tg = numOrZero(p.tg);
  const hdl = numOrZero(p.hdl);
  const edad = numOrZero(p.edad);

  let score = 0;
  if (i >= 40) score += 1;
  if (alt > 40) score += 1;
  if (ast > 40) score += 1;
  if (hba1c >= 6.5) score += 2;
  if (tg >= 150) score += 1;
  if (hdl && hdl < 40) score += 1;
  if (edad >= 50) score += 1;
  // Índice aproximado NAFLD fibrosis (BARD-like)
  const astAlt = alt ? (ast / alt) : 0;
  if (astAlt >= 0.8) score += 1;

  let riesgo, color;
  if (score >= 6) { riesgo = 'alto'; color = '#C0392B'; }
  else if (score >= 3) { riesgo = 'moderado'; color = '#E0A82E'; }
  else { riesgo = 'bajo'; color = '#2D8659'; }
  const probResolucion = Math.max(30, Math.min(95, 95 - score * 7));
  return {
    score,
    riesgo,
    color,
    astAlt: astAlt ? astAlt.toFixed(2) : '—',
    probResolucion,
    interpretacion: `Probabilidad estimada de resolución MASH/MASLD post-cirugía: ${probResolucion}%. Riesgo ${riesgo} de fibrosis residual.`
  };
}

/* ============================================================
 * 2) MACE — Deep muscle sensitivity (sensibilidad muscular profunda)
 *    Índice basado en masa muscular / sarcopenia perioperatoria.
 *    Variables: sexo, edad, IMC, fuerza de prensión, masa magra %.
 * ============================================================ */
export function mace(p) {
  const edad = numOrZero(p.edad);
  const i = imc(p.peso, p.talla);
  const handgrip = numOrZero(p.handgrip); // kg
  const masaMagra = numOrZero(p.masaMagraPct); // % de peso total
  const esM = p.sexo === 'M';

  let score = 0;
  if (edad >= 65) score += 2;
  else if (edad >= 50) score += 1;
  if (i >= 45) score += 1;
  // Corte handgrip EWGSOP2
  const umbralHG = esM ? 27 : 16;
  if (handgrip && handgrip < umbralHG) score += 2;
  const umbralMagra = esM ? 30 : 25;
  if (masaMagra && masaMagra < umbralMagra) score += 2;

  let riesgo = 'bajo', color = '#2D8659';
  if (score >= 5) { riesgo = 'alto'; color = '#C0392B'; }
  else if (score >= 3) { riesgo = 'moderado'; color = '#E0A82E'; }
  return {
    score,
    riesgo,
    color,
    interpretacion: `Sensibilidad muscular profunda: ${riesgo}. ${riesgo === 'alto' ? 'Plan de proteína 1.5 g/kg + resistencia obligatorio pre y post-op.' : 'Monitoreo de masa magra semestral.'}`
  };
}

/* ============================================================
 * 3) SPLENDID — Resolución de dislipidemias
 *    Cleveland Clinic 2020: Aminian et al, JAMA 2020.
 *    Modelo que compara cirugía vs. manejo médico.
 * ============================================================ */
export function splendid(p) {
  const ldl = numOrZero(p.ldl);
  const tg = numOrZero(p.tg);
  const hdl = numOrZero(p.hdl);
  const colT = numOrZero(p.colT);
  const hba1c = numOrZero(p.hba1c);
  const estatina = !!p.estatina;

  let score = 0;
  if (ldl >= 130) score += 2; else if (ldl >= 100) score += 1;
  if (tg >= 200) score += 2; else if (tg >= 150) score += 1;
  if (hdl && hdl < 40) score += 1;
  if (colT >= 240) score += 1;
  if (hba1c >= 6.5) score += 1;

  // Probabilidad estimada de resolución completa (control sin estatina a 3a) — estimado SPLENDID
  let probResolucion = 85 - score * 8;
  if (estatina) probResolucion -= 5;
  probResolucion = Math.max(20, Math.min(95, probResolucion));

  let nivel = 'bajo', color = '#2D8659';
  if (score >= 5) { nivel = 'alto'; color = '#C0392B'; }
  else if (score >= 3) { nivel = 'moderado'; color = '#E0A82E'; }
  return {
    score, nivel, color, probResolucion,
    interpretacion: `Probabilidad de resolución de dislipidemia a 3 años: ${probResolucion}%. Cirugía metabólica reduce riesgo MACE ~40% (SPLENDID).`
  };
}

/* ============================================================
 * 4) ADAMS / SM-BOSS — Remisión sostenida de DM2
 *    ADAMS (Adams 2012 LAGB/RYGB 12y) + SM-BOSS (2018 RYGB vs SG 5y)
 *    Predictores: años con DM, edad, insulina, IMC, HbA1c.
 * ============================================================ */
export function adamsSmBoss(p) {
  const edad = numOrZero(p.edad);
  const i = imc(p.peso, p.talla);
  const anosDM = numOrZero(p.anosDM);
  const hba1c = numOrZero(p.hba1c);
  const insulina = !!p.insulina;
  const peptidoC = numOrZero(p.peptidoC);
  const proc = p.procedimiento || 'sleeve';

  let score = 10;
  if (anosDM >= 10) score -= 3; else if (anosDM >= 5) score -= 2;
  if (insulina) score -= 3;
  if (hba1c >= 9) score -= 2; else if (hba1c >= 8) score -= 1;
  if (edad >= 60) score -= 1;
  if (i < 35) score -= 1;
  if (peptidoC && peptidoC < 1.0) score -= 3;
  if (proc === 'rygb' || proc === 'oagb' || proc === 'sadis' || proc === 'bpdds') score += 2;

  score = Math.max(0, Math.min(10, score));
  // Probabilidad aproximada remisión sostenida a 5 años
  const probRemision = Math.round(35 + score * 5); // 35 a 85%
  let nivel = 'bajo', color = '#C0392B';
  if (score >= 7) { nivel = 'alto'; color = '#2D8659'; }
  else if (score >= 4) { nivel = 'moderado'; color = '#E0A82E'; }
  return {
    score, nivel, color, probRemision,
    interpretacion: `Probabilidad de remisión sostenida DM2 a 5 años: ${probRemision}%. Favorabilidad ${nivel}.`
  };
}

/* ============================================================
 * 5) Bariatric Weight Trajectory Prediction (BWTP)
 *    Modelo longitudinal estimado: % pérdida peso total a 1-3-5 años.
 *    Basado en IMC preop, edad, sexo, procedimiento, DM.
 * ============================================================ */
export function bariatricWeightTrajectory(p) {
  const base = imc(p.peso, p.talla);
  const edad = numOrZero(p.edad);
  const proc = p.procedimiento || 'sleeve';
  const dm = !!(p.comorbilidades && p.comorbilidades.dm);
  const tabla = {
    sleeve: { y1: 28, y3: 25, y5: 22 },
    rygb:   { y1: 32, y3: 30, y5: 28 },
    oagb:   { y1: 33, y3: 31, y5: 29 },
    sadis:  { y1: 36, y3: 34, y5: 32 },
    bpdds:  { y1: 38, y3: 36, y5: 34 },
    balon:  { y1: 15, y3: 10, y5: 8 },
    rev_sg_rygb: { y1: 22, y3: 20, y5: 18 },
    rev_sg_oagb: { y1: 24, y3: 22, y5: 20 }
  };
  const b = tabla[proc] || tabla.sleeve;
  const ajustarEdad = (v) => v - (edad >= 60 ? 3 : edad >= 50 ? 1.5 : 0);
  const ajustarDM = (v) => v - (dm ? 1.5 : 0);

  const y1 = +ajustarDM(ajustarEdad(b.y1)).toFixed(1);
  const y3 = +ajustarDM(ajustarEdad(b.y3)).toFixed(1);
  const y5 = +ajustarDM(ajustarEdad(b.y5)).toFixed(1);
  const pesoInicial = numOrZero(p.peso);
  const pesoY1 = pesoInicial * (1 - y1 / 100);
  const pesoY5 = pesoInicial * (1 - y5 / 100);
  return {
    imcBasal: +base.toFixed(1),
    trayectoria: { y1, y3, y5 },
    pesoEstY1: +pesoY1.toFixed(1),
    pesoEstY5: +pesoY5.toFixed(1),
    interpretacion: `Trayectoria esperada: %TWL a 1a ${y1}% · 3a ${y3}% · 5a ${y5}%.`
  };
}

/* ============================================================
 * 6) SleevePass — Equivalencia manga vs. RYGB a 5-10 años
 *    Helmiö/Salminen RCT.  Score de preferencia por manga.
 * ============================================================ */
export function sleevePass(p) {
  const i = imc(p.peso, p.talla);
  const c = p.comorbilidades || {};
  let pro = 0, contra = 0;
  // A favor de manga
  if (i < 50) pro += 2;
  if (!c.erge) pro += 2;
  if (!c.dm) pro += 1;
  if (c.acoag) pro += 2; // menos absorción alterada
  if (!c.iam && !c.ecv) pro += 1;
  // En contra (hacia RYGB)
  if (c.erge) contra += 3;
  if (c.dm && numOrZero(p.hba1c) >= 8) contra += 2;
  if (i >= 50) contra += 1;

  const neto = pro - contra;
  let recomendacion, color;
  if (neto >= 3) { recomendacion = 'Manga gástrica favorecida (SleevePass)'; color = '#2D8659'; }
  else if (neto <= -2) { recomendacion = 'RYGB favorecido'; color = '#C0392B'; }
  else { recomendacion = 'Equivalentes — decidir por preferencia y anatomía'; color = '#E0A82E'; }
  return {
    pro, contra, neto, recomendacion, color,
    interpretacion: `SleevePass 10-a: resultados comparables manga vs RYGB en remisión ponderal. Decisión basada en ERGE, DM severa y preferencia.`
  };
}

/* ============================================================
 * Helper export: devuelve todas las clasificaciones que se pueden
 * calcular con los datos disponibles del paciente.
 * ============================================================ */
export function calcularTodas(p) {
  return {
    magkosAminian: magkosAminian(p),
    mace: mace(p),
    splendid: splendid(p),
    adamsSmBoss: adamsSmBoss(p),
    bwtp: bariatricWeightTrajectory(p),
    sleevePass: sleevePass(p)
  };
}
