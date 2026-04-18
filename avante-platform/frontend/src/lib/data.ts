// ===== STORAGE HELPERS =====
export function storageGet(key: string): unknown {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

export function storageSet(key: string, val: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* noop */ }
}

// ===== DATE HELPERS =====
export function fmtFechaHora(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function fmtFecha(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function nowLocalInput(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

// ===== IMC =====
export function calcIMC(peso: string | number, talla: string | number): number {
  const p = parseFloat(String(peso));
  const t = parseFloat(String(talla)) / 100;
  return p && t ? p / (t * t) : 0;
}

// ===== COLORS =====
export const C = {
  navy: '#0A1F44',
  teal: '#1A8B9D',
  gold: '#C9A961',
  cream: '#FAF7F2',
  green: '#2D8659',
  yellow: '#E0A82E',
  red: '#C0392B',
};

// ===== IMAGES =====
export const IMAGES = {
  hospital: 'https://mgx-backend-cdn.metadl.com/generate/images/1129214/2026-04-18/m3dt75iaae7a/hero-hospital-avante.png',
  team: 'https://mgx-backend-cdn.metadl.com/generate/images/1129214/2026-04-18/m3dvbsqaafaq/hero-medical-team.png',
  patient: 'https://mgx-backend-cdn.metadl.com/generate/images/1129214/2026-04-18/m3dub3yaae7q/hero-patient-success.png',
  abstract: 'https://mgx-backend-cdn.metadl.com/generate/images/1129214/2026-04-18/m3dufuiaafaq/bg-medical-abstract.png',
};

// ===== PROCEDURES =====
export const PROCEDURES = [
  { id: 'sleeve', name: 'Manga Gástrica (SG)' },
  { id: 'rygb', name: 'Bypass Gástrico en Y de Roux (RYGB)' },
  { id: 'oagb', name: 'Bypass Gástrico de Una Anastomosis (OAGB)' },
  { id: 'sadis', name: 'SADI-S' },
  { id: 'bpdds', name: 'BPD-DS' },
  { id: 'balon', name: 'Balón intragástrico (opción electiva · IFSO/ASMBS)' },
  { id: 'rev_sg_rygb', name: 'Revisión: Manga → RYGB' },
  { id: 'rev_sg_oagb', name: 'Revisión: Manga → OAGB' },
];

export const PROCS: Record<string, string> = {
  sleeve: 'Manga Gástrica', rygb: 'RYGB', oagb: 'OAGB', sadis: 'SADI-S', bpdds: 'BPD-DS',
  balon: 'Balón intragástrico', rev_sg_rygb: 'Rev. Manga→RYGB', rev_sg_oagb: 'Rev. Manga→OAGB',
};

// ===== COMORBIDITIES =====
export const COMORBIDITIES = [
  { id: 'hta', label: 'Hipertensión arterial' },
  { id: 'tep', label: 'Antecedente TEP/TVP' },
  { id: 'dm', label: 'Diabetes mellitus' },
  { id: 'aos', label: 'Apnea obstructiva del sueño' },
  { id: 'erge', label: 'ERGE' },
  { id: 'tabaco', label: 'Tabaquismo activo' },
  { id: 'ivc', label: 'Insuficiencia venosa crónica' },
  { id: 'cardio', label: 'Cardiopatía' },
  { id: 'erc', label: 'Enfermedad renal crónica' },
  { id: 'acoag', label: 'Anticoagulación crónica' },
  { id: 'disli', label: 'Dislipidemia' },
  { id: 'iam', label: 'IAM previo' },
  { id: 'ecv', label: 'Enf. cerebrovascular' },
];

// ===== LAB PARAMS =====
export const LAB_PARAMS = [
  { k: 'hb', l: 'Hemoglobina', u: 'g/dL', min: 12, max: 17 },
  { k: 'hcto', l: 'Hematocrito', u: '%', min: 36, max: 50 },
  { k: 'glucosa', l: 'Glucosa', u: 'mg/dL', min: 70, max: 100 },
  { k: 'hba1c', l: 'HbA1c', u: '%', min: 4, max: 5.7 },
  { k: 'creatinina', l: 'Creatinina', u: 'mg/dL', min: 0.6, max: 1.2 },
  { k: 'albumina', l: 'Albúmina', u: 'g/dL', min: 3.5, max: 5 },
  { k: 'ferritina', l: 'Ferritina', u: 'ng/mL', min: 30, max: 300 },
  { k: 'hierro', l: 'Hierro sérico', u: 'µg/dL', min: 60, max: 170 },
  { k: 'b12', l: 'Vitamina B12', u: 'pg/mL', min: 200, max: 900 },
  { k: 'folico', l: 'Ácido fólico', u: 'ng/mL', min: 3, max: 20 },
  { k: 'vitd', l: 'Vitamina D', u: 'ng/mL', min: 30, max: 80 },
  { k: 'pth', l: 'PTH', u: 'pg/mL', min: 15, max: 65 },
  { k: 'calcio', l: 'Calcio', u: 'mg/dL', min: 8.5, max: 10.5 },
  { k: 'zinc', l: 'Zinc', u: 'µg/dL', min: 70, max: 120 },
  { k: 'colesterol', l: 'Colesterol total', u: 'mg/dL', min: 0, max: 200 },
  { k: 'tg', l: 'Triglicéridos', u: 'mg/dL', min: 0, max: 150 },
];

// ===== PATIENT TYPE =====
export interface Patient {
  id: string;
  expediente: string | null;
  nombre: string;
  apellido: string;
  edad: string;
  sexo: string;
  foto: string | null;
  telefono: string;
  email: string;
  medico: string;
  medicoId: string;
  fechaRegistro: string;
  peso: string;
  talla: string;
  comorbilidades: Record<string, boolean>;
  otrosAntecedentes: string;
  asa: string;
  funcional: string;
  procedimiento: string;
  historiaClinica: Record<string, string>;
  [key: string]: unknown;
}

export const EMPTY_PATIENT: Patient = {
  id: '', expediente: null, nombre: '', apellido: '', edad: '', sexo: 'M',
  foto: null, telefono: '', email: '', medico: '', medicoId: '', fechaRegistro: '',
  peso: '', talla: '', comorbilidades: {}, otrosAntecedentes: '',
  asa: '2', funcional: 'independiente', procedimiento: 'sleeve',
  historiaClinica: {},
};

// ===== CLASIFICACIONES =====
function numOrZero(v: unknown): number {
  const n = parseFloat(String(v));
  return isFinite(n) ? n : 0;
}

export function calcOSMRS(p: Patient): { score: number; riesgo: string; color: string; detalles: string[] } {
  let score = 0;
  const detalles: string[] = [];
  const i = calcIMC(p.peso, p.talla);
  if (i >= 50) { score += 1; detalles.push('IMC ≥ 50: +1'); }
  if (p.sexo === 'M') { score += 1; detalles.push('Sexo masculino: +1'); }
  if (numOrZero(p.edad) >= 45) { score += 1; detalles.push('Edad ≥ 45: +1'); }
  if (p.comorbilidades?.hta) { score += 1; detalles.push('Hipertensión: +1'); }
  if (p.comorbilidades?.tep) { score += 1; detalles.push('TEP/TVP: +1'); }
  let riesgo = 'bajo', color = C.green;
  if (score >= 4) { riesgo = 'alto'; color = C.red; }
  else if (score >= 2) { riesgo = 'moderado'; color = C.yellow; }
  return { score, riesgo, color, detalles };
}

export function calcEOSS(p: Patient): { metabolico: number; mecanico: number; psico: number; total: number; riesgo: string; color: string } {
  const m = numOrZero((p as Record<string, unknown>).eossMetabolico);
  const me = numOrZero((p as Record<string, unknown>).eossMecanico);
  const ps = numOrZero((p as Record<string, unknown>).eossPsico);
  const total = Math.max(m, me, ps);
  let riesgo = 'Etapa 0', color = C.green;
  if (total >= 3) { riesgo = 'Etapa 3 — Alto'; color = C.red; }
  else if (total >= 2) { riesgo = 'Etapa 2 — Moderado'; color = C.yellow; }
  else if (total >= 1) { riesgo = 'Etapa 1 — Leve'; color = C.teal; }
  return { metabolico: m, mecanico: me, psico: ps, total, riesgo, color };
}

export function calcCaprini(p: Patient): { score: number; riesgo: string; color: string; profilaxis: string } {
  let score = 0;
  const edad = numOrZero(p.edad);
  if (edad >= 41 && edad <= 60) score += 1;
  else if (edad >= 61 && edad <= 74) score += 2;
  else if (edad >= 75) score += 3;
  const i = calcIMC(p.peso, p.talla);
  if (i >= 25) score += 1;
  if (p.comorbilidades?.tep) score += 3;
  if (p.comorbilidades?.cardio) score += 1;
  if (p.comorbilidades?.ivc) score += 1;
  if (p.comorbilidades?.acoag) score += 2;
  score += 2; // surgery factor
  let riesgo = 'Bajo', color = C.green, profilaxis = 'Deambulación temprana';
  if (score >= 7) { riesgo = 'Muy alto'; color = C.red; profilaxis = 'HBPM + medias + deambulación + considerar filtro VCI'; }
  else if (score >= 5) { riesgo = 'Alto'; color = C.red; profilaxis = 'HBPM 40mg/12h + medias compresivas + deambulación precoz'; }
  else if (score >= 3) { riesgo = 'Moderado'; color = C.yellow; profilaxis = 'HBPM 40mg/24h + medias compresivas'; }
  return { score, riesgo, color, profilaxis };
}

// ===== OPTIMIZATION =====
export function planOptimizacion(p: Patient): Array<{ prio: string; area: string; accion: string; tiempo: string }> {
  const items: Array<{ prio: string; area: string; accion: string; tiempo: string }> = [];
  const i = calcIMC(p.peso, p.talla);
  const c = p.comorbilidades || {};
  if (c.tabaco) items.push({ prio: 'critico', area: 'Cesación tabáquica', accion: 'Suspensión obligatoria ≥6 semanas previo a cirugía. Bupropión o vareniclina + apoyo conductual.', tiempo: '6-8 semanas' });
  if (c.dm) items.push({ prio: 'critico', area: 'Control glucémico', accion: 'Optimizar HbA1c <8%. Ajuste con endocrinología.', tiempo: '8-12 semanas' });
  if (i >= 50) items.push({ prio: 'importante', area: 'Pérdida puente', accion: 'IMC≥50: terapia puente con GLP-1 o balón intragástrico 4-6 meses.', tiempo: '4-6 meses' });
  if (c.aos) items.push({ prio: 'importante', area: 'AOS', accion: 'Polisomnografía + titulación CPAP. Uso ≥4h/noche por ≥4 semanas.', tiempo: '4-6 semanas' });
  if (c.cardio) items.push({ prio: 'importante', area: 'Cardiología', accion: 'Valoración cardiológica + ecocardiograma + ECG.', tiempo: '2-4 semanas' });
  if (c.erc) items.push({ prio: 'importante', area: 'Nefrología', accion: 'TFG, electrolitos, ajuste de fármacos nefrotóxicos.', tiempo: '2-4 semanas' });
  if (c.acoag) items.push({ prio: 'critico', area: 'Anticoagulación', accion: 'Plan de puenteo con hematología. Suspender ACOD 48-72h.', tiempo: '1 semana' });
  items.push({ prio: 'rutina', area: 'Nutrición', accion: 'Dieta hipocalórica hiperproteica 2 semanas previas. Suplementación.', tiempo: '2-4 semanas' });
  items.push({ prio: 'rutina', area: 'Psicología', accion: 'Evaluación psicológica + contrato conductual.', tiempo: '4-8 semanas' });
  return items;
}

// ===== TOPICOS SEMANALES =====
export const TOPICOS = [
  { tituloEs: 'Manga gástrica: resultados a 10 años', tituloEn: 'Sleeve gastrectomy: 10-year outcomes', resumenEs: 'Revisión de la evidencia sobre durabilidad de la pérdida de peso con manga gástrica.', resumenEn: 'Review of evidence on weight-loss durability with sleeve gastrectomy.', pubmedQuery: 'sleeve gastrectomy 10 year outcomes' },
  { tituloEs: 'RYGB vs manga: ¿cuándo elegir cada una?', tituloEn: 'RYGB vs sleeve: when to choose each', resumenEs: 'Análisis SM-BOSS y SLEEVEPASS aplicados a la selección del procedimiento.', resumenEn: 'SM-BOSS and SLEEVEPASS evidence applied to procedure selection.', pubmedQuery: 'RYGB versus sleeve gastrectomy randomized' },
  { tituloEs: 'Cirugía metabólica y remisión de DM2', tituloEn: 'Metabolic surgery and T2DM remission', resumenEs: 'Mecanismos entero-insulares y predictores de remisión sostenida.', resumenEn: 'Entero-insular mechanisms and predictors of sustained remission.', pubmedQuery: 'metabolic surgery diabetes remission' },
  { tituloEs: 'Balón intragástrico como procedimiento definitivo', tituloEn: 'Intragastric balloon as a definitive procedure', resumenEs: 'Evidencia IFSO/ASMBS sobre uso del balón como opción electiva.', resumenEn: 'IFSO/ASMBS evidence on balloon as an elective option.', pubmedQuery: 'intragastric balloon outcomes obesity' },
  { tituloEs: 'GLP-1 perioperatorio: ¿aliado o riesgo?', tituloEn: 'Perioperative GLP-1: friend or risk?', resumenEs: 'Semaglutida y tirzepatida en ventana quirúrgica.', resumenEn: 'Semaglutide and tirzepatide in the surgical window.', pubmedQuery: 'GLP-1 perioperative bariatric surgery' },
  { tituloEs: 'ERAS en cirugía bariátrica', tituloEn: 'ERAS in bariatric surgery', resumenEs: 'Protocolos de recuperación acelerada.', resumenEn: 'Enhanced Recovery After Surgery protocols.', pubmedQuery: 'ERAS bariatric surgery' },
  { tituloEs: 'Manejo del ERGE post-manga', tituloEn: 'GERD management after sleeve', resumenEs: 'Estrategias terapéuticas y conversión a RYGB.', resumenEn: 'Therapeutic strategies and conversion to RYGB.', pubmedQuery: 'GERD after sleeve gastrectomy' },
  { tituloEs: 'Revisión: manga → RYGB / OAGB', tituloEn: 'Revision: sleeve → RYGB / OAGB', resumenEs: 'Indicaciones, técnica y resultados de la cirugía de revisión.', resumenEn: 'Indications, technique and outcomes of revisional surgery.', pubmedQuery: 'revisional bariatric surgery sleeve' },
];

export const SOCIEDADES = [
  { nombre: 'IFSO', url: 'https://www.ifso.com', desc: 'International Federation for the Surgery of Obesity and Metabolic Disorders' },
  { nombre: 'ASMBS', url: 'https://asmbs.org', desc: 'American Society for Metabolic and Bariatric Surgery' },
  { nombre: 'SAGES', url: 'https://www.sages.org', desc: 'Society of American Gastrointestinal and Endoscopic Surgeons' },
  { nombre: 'EASO', url: 'https://easo.org', desc: 'European Association for the Study of Obesity' },
  { nombre: 'FLACSO', url: 'https://www.flacso.org', desc: 'Federación Latinoamericana de Cirugía de la Obesidad' },
];

export const REVISTAS = [
  { nombre: 'SOARD', url: 'https://www.soard.org', desc: 'Surgery for Obesity and Related Diseases' },
  { nombre: 'Obesity Surgery', url: 'https://www.springer.com/journal/11695', desc: 'Obesity Surgery Journal' },
  { nombre: 'NEJM', url: 'https://www.nejm.org', desc: 'New England Journal of Medicine' },
  { nombre: 'JAMA Surgery', url: 'https://jamanetwork.com/journals/jamasurgery', desc: 'JAMA Surgery' },
  { nombre: 'Annals of Surgery', url: 'https://journals.lww.com/annalsofsurgery', desc: 'Annals of Surgery' },
];

export function topicoDeLaSemana(lang = 'es') {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  const idx = week % TOPICOS.length;
  const topico = TOPICOS[idx];
  return {
    semana: week + 1,
    topico,
    titulo: lang === 'en' ? topico.tituloEn : topico.tituloEs,
    resumen: lang === 'en' ? topico.resumenEn : topico.resumenEs,
  };
}

// ===== EDUCACION =====
export const EDUCACION = [
  { tema: '¿Qué es la cirugía bariátrica?', contenido: 'La cirugía bariátrica es un conjunto de procedimientos que ayudan a perder peso y mejorar enfermedades asociadas a la obesidad. No es una solución mágica: es una herramienta poderosa que requiere su compromiso de por vida.' },
  { tema: '¿Cómo me preparo?', contenido: 'Necesitará evaluaciones médicas (cardio, nutrición, psicología), exámenes de laboratorio, posiblemente endoscopia. La preparación toma típicamente 4-8 semanas.' },
  { tema: '¿Qué pasa el día de la cirugía?', contenido: 'Ingresará en ayunas. La cirugía dura 60-120 minutos por laparoscopía. Comenzará a caminar el mismo día y a tomar líquidos a las pocas horas.' },
  { tema: '¿Cuánto peso perderé?', contenido: 'En promedio, los pacientes pierden 60-80% de su exceso de peso en los primeros 12-18 meses.' },
  { tema: '¿Qué riesgos existen?', contenido: 'Los más importantes: fuga de la sutura (~1%), trombosis venosa, sangrado, infección. En centros acreditados son bajos.' },
  { tema: '¿Cómo será mi vida después?', contenido: 'Su relación con la comida cambiará. Comerá porciones pequeñas, masticará lento, tomará vitaminas de por vida.' },
];

// ===== EQUIPO =====
export const EQUIPO = [
  { rol: 'Cirujano bariátrico líder', persona: 'Dr. Ángel Henríquez', resp: 'Indicación quirúrgica, técnica operatoria, seguimiento clínico' },
  { rol: 'Co-Director médico', persona: 'Dr. Luis Alonso Martínez Chávez', resp: 'Co-liderazgo clínico y administrativo' },
  { rol: 'Anestesiología bariátrica', persona: 'Equipo de anestesia', resp: 'Manejo perioperatorio, vía aérea difícil' },
  { rol: 'Endocrinología', persona: 'Endocrinólogo asociado', resp: 'Optimización metabólica pre y postoperatoria' },
  { rol: 'Nutrición clínica', persona: 'Nutricionista bariátrica', resp: 'Fases dietarias, suplementación' },
  { rol: 'Psicología bariátrica', persona: 'Psicólogo clínico', resp: 'Evaluación preoperatoria, acompañamiento conductual' },
  { rol: 'Cardiología', persona: 'Cardiólogo de referencia', resp: 'Valoración cardiovascular preoperatoria' },
  { rol: 'Coordinación', persona: 'Coordinador del programa', resp: 'Agendas, seguimiento, comunicación' },
];

// ===== EVIDENCIA =====
export const EVIDENCIA = [
  { cita: 'Eisenberg D, et al. 2022 ASMBS and IFSO indications for metabolic and bariatric surgery.', fuente: 'SOARD 2022;18(12):1345-1356', id: 'PMID 36280539' },
  { cita: 'Peterli R, et al. SM-BOSS RCT: SG vs RYGB.', fuente: 'JAMA 2018;319(3):255-265', id: 'PMID 29340679' },
  { cita: 'Adams TD, et al. Weight and metabolic outcomes 12 years after gastric bypass.', fuente: 'N Engl J Med 2017;377:1143-1155', id: 'PMID 28930514' },
  { cita: 'Schauer PR, et al. STAMPEDE: Bariatric surgery vs intensive medical therapy for diabetes.', fuente: 'N Engl J Med 2017;376:641-651', id: 'PMID 28199805' },
  { cita: 'Mechanick JI, et al. AACE/TOS/ASMBS Clinical practice guidelines.', fuente: 'Obesity 2020;28(4):O1-O58', id: 'AACE/TOS/ASMBS 2019 Update' },
];

// ===== PDF EXPORT =====
export async function exportarPDF(data: { titulo: string; subtitulo?: string; secciones: Array<{ titulo: string; lineas: string[] }>; footer?: string }) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const M = 50;
  let y = M;
  const W = doc.internal.pageSize.getWidth() - M * 2;

  doc.setFillColor(10, 31, 68);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 70, 'F');
  doc.setTextColor(201, 169, 97);
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.text(data.titulo || 'Avante', M, 40);
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.text(data.subtitulo || 'Creamos e innovamos para cuidar de ti', M, 58);

  y = 100;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  const checkPage = (h = 16) => {
    if (y + h > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = M;
    }
  };

  data.secciones.forEach(sec => {
    checkPage(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(10, 31, 68);
    doc.text(sec.titulo || '', M, y);
    y += 8;
    doc.setDrawColor(201, 169, 97);
    doc.setLineWidth(1);
    doc.line(M, y, M + W, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    (sec.lineas || []).forEach(line => {
      const split = doc.splitTextToSize(String(line || ''), W);
      split.forEach((l: string) => {
        checkPage(14);
        doc.text(l, M, y);
        y += 14;
      });
    });
    y += 8;
  });

  return doc;
}

export function descargarPDF(docPDF: { save: (n: string) => void }, nombre: string) {
  docPDF.save((nombre || 'avante') + '.pdf');
}

export function shareWhatsApp(phone: string, message: string) {
  const clean = (phone || '').replace(/[^\d]/g, '');
  const url = clean
    ? `https://wa.me/${clean}?text=${encodeURIComponent(message || '')}`
    : `https://wa.me/?text=${encodeURIComponent(message || '')}`;
  window.open(url, '_blank', 'noopener');
}

export function shareEmail(to: string, subject: string, body: string) {
  window.location.href = `mailto:${to || ''}?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body || '')}`;
}