// Tópicos semanales y artículos destacados.
// Se rotan automáticamente según la semana ISO del año.

export const TOPICOS = [
  {
    tituloEs: 'Manga gástrica: resultados a 10 años', tituloEn: 'Sleeve gastrectomy: 10-year outcomes',
    resumenEs: 'Revisión de la evidencia más sólida sobre durabilidad de la pérdida de peso y remisión de comorbilidades con manga gástrica.',
    resumenEn: 'Review of the strongest evidence on weight-loss durability and comorbidity remission with sleeve gastrectomy.',
    pubmedQuery: 'sleeve gastrectomy 10 year outcomes'
  },
  {
    tituloEs: 'RYGB vs manga: ¿cuándo elegir cada una?', tituloEn: 'RYGB vs sleeve: when to choose each',
    resumenEs: 'Análisis SM-BOSS y SLEEVEPASS aplicados a la selección del procedimiento.',
    resumenEn: 'SM-BOSS and SLEEVEPASS evidence applied to procedure selection.',
    pubmedQuery: 'RYGB versus sleeve gastrectomy randomized'
  },
  {
    tituloEs: 'Cirugía metabólica y remisión de DM2', tituloEn: 'Metabolic surgery and T2DM remission',
    resumenEs: 'Mecanismos entero-insulares y predictores de remisión sostenida (ADAMS, SM-BOSS).',
    resumenEn: 'Entero-insular mechanisms and predictors of sustained remission (ADAMS, SM-BOSS).',
    pubmedQuery: 'metabolic surgery diabetes remission'
  },
  {
    tituloEs: 'Balón intragástrico como procedimiento definitivo', tituloEn: 'Intragastric balloon as a definitive procedure',
    resumenEs: 'Evidencia IFSO/ASMBS sobre uso del balón como opción electiva en casos seleccionados.',
    resumenEn: 'IFSO/ASMBS evidence on balloon as an elective option in selected cases.',
    pubmedQuery: 'intragastric balloon outcomes obesity'
  },
  {
    tituloEs: 'GLP-1 perioperatorio: ¿aliado o riesgo?', tituloEn: 'Perioperative GLP-1: friend or risk?',
    resumenEs: 'Semaglutida y tirzepatida en ventana quirúrgica — qué dicen las guías 2024-2025.',
    resumenEn: 'Semaglutide and tirzepatide in the surgical window — what 2024-2025 guidelines say.',
    pubmedQuery: 'GLP-1 perioperative bariatric surgery'
  },
  {
    tituloEs: 'ERAS en cirugía bariátrica', tituloEn: 'ERAS in bariatric surgery',
    resumenEs: 'Protocolos de recuperación acelerada: evidencia y estandarización global.',
    resumenEn: 'Enhanced Recovery After Surgery protocols: evidence and global standardization.',
    pubmedQuery: 'ERAS bariatric surgery'
  },
  {
    tituloEs: 'Manejo del ERGE post-manga', tituloEn: 'GERD management after sleeve',
    resumenEs: 'Estrategias terapéuticas, técnica y conversión a RYGB.',
    resumenEn: 'Therapeutic strategies, technique and conversion to RYGB.',
    pubmedQuery: 'GERD after sleeve gastrectomy'
  },
  {
    tituloEs: 'Revisión: manga → RYGB / OAGB', tituloEn: 'Revision: sleeve → RYGB / OAGB',
    resumenEs: 'Indicaciones, técnica y resultados de la cirugía de revisión.',
    resumenEn: 'Indications, technique and outcomes of revisional surgery.',
    pubmedQuery: 'revisional bariatric surgery sleeve RYGB OAGB'
  },
  {
    tituloEs: 'Cirugía bariátrica en el adolescente', tituloEn: 'Bariatric surgery in adolescents',
    resumenEs: 'Teen-LABS y criterios actuales de indicación.',
    resumenEn: 'Teen-LABS study and current indication criteria.',
    pubmedQuery: 'adolescent bariatric surgery'
  },
  {
    tituloEs: 'Esteatohepatitis y cirugía metabólica', tituloEn: 'Steatohepatitis and metabolic surgery',
    resumenEs: 'Resolución de MASLD/MASH post-cirugía — evidencia Magkos/Aminian.',
    resumenEn: 'MASLD/MASH resolution after surgery — Magkos/Aminian evidence.',
    pubmedQuery: 'MASH MASLD bariatric surgery resolution'
  },
  {
    tituloEs: 'SADI-S y BPD-DS: cuándo usar hipoabsortivas', tituloEn: 'SADI-S and BPD-DS: when to use hypoabsorptive',
    resumenEs: 'IMC ≥60 y fallas terapéuticas — indicaciones y seguimiento.',
    resumenEn: 'BMI ≥60 and treatment failures — indications and follow-up.',
    pubmedQuery: 'SADI-S BPD-DS outcomes'
  },
  {
    tituloEs: 'Salud mental y cirugía bariátrica', tituloEn: 'Mental health and bariatric surgery',
    resumenEs: 'Evaluación preoperatoria, trastornos alimentarios y acompañamiento.',
    resumenEn: 'Preoperative assessment, eating disorders and follow-up.',
    pubmedQuery: 'mental health bariatric surgery'
  }
];

// Seis artículos destacados (plantilla) — el contenido se reemplaza semanal o por feed automático.
export const ARTICULOS_BASE = [
  {
    tituloEs: 'Long-term outcomes of sleeve gastrectomy: meta-analysis',
    tituloEn: 'Long-term outcomes of sleeve gastrectomy: meta-analysis',
    autor: 'Clapp B, et al.', revista: 'SOARD', anyo: 2025,
    doi: 'https://pubmed.ncbi.nlm.nih.gov/?term=sleeve+gastrectomy+long+term+outcomes'
  },
  {
    tituloEs: 'Metabolic surgery vs. medical therapy in T2DM: STAMPEDE 12-year',
    tituloEn: 'Metabolic surgery vs. medical therapy in T2DM: STAMPEDE 12-year',
    autor: 'Schauer P, et al.', revista: 'NEJM', anyo: 2024,
    doi: 'https://pubmed.ncbi.nlm.nih.gov/?term=STAMPEDE+12+year'
  },
  {
    tituloEs: 'Intragastric balloon as definitive therapy — IFSO consensus',
    tituloEn: 'Intragastric balloon as definitive therapy — IFSO consensus',
    autor: 'IFSO Task Force', revista: 'OBES SURG', anyo: 2024,
    doi: 'https://pubmed.ncbi.nlm.nih.gov/?term=IFSO+intragastric+balloon'
  },
  {
    tituloEs: 'GLP-1 receptor agonists in the perioperative bariatric patient',
    tituloEn: 'GLP-1 receptor agonists in the perioperative bariatric patient',
    autor: 'Mechanick JI, et al.', revista: 'Endocr Pract', anyo: 2024,
    doi: 'https://pubmed.ncbi.nlm.nih.gov/?term=GLP1+perioperative+bariatric'
  },
  {
    tituloEs: 'ERAS in bariatric surgery: updated consensus',
    tituloEn: 'ERAS in bariatric surgery: updated consensus',
    autor: 'Thorell A, et al.', revista: 'World J Surg', anyo: 2025,
    doi: 'https://pubmed.ncbi.nlm.nih.gov/?term=ERAS+bariatric+consensus'
  },
  {
    tituloEs: 'Revisional bariatric surgery: SG→RYGB conversion outcomes',
    tituloEn: 'Revisional bariatric surgery: SG→RYGB conversion outcomes',
    autor: 'Felsenreich DM, et al.', revista: 'Surg Endosc', anyo: 2025,
    doi: 'https://pubmed.ncbi.nlm.nih.gov/?term=sleeve+to+RYGB+conversion'
  }
];

export const SOCIEDADES = [
  { nombre: 'IFSO · International Federation for the Surgery of Obesity', url: 'https://www.ifso.com/' },
  { nombre: 'ASMBS · American Society for Metabolic & Bariatric Surgery', url: 'https://asmbs.org/' },
  { nombre: 'FLACS · Federación Latinoamericana de Cirugía', url: 'https://flacs.net/' },
  { nombre: 'SECO · Soc. Española de Cirugía de la Obesidad', url: 'https://www.seco.org/' },
  { nombre: 'BOMSS · British Obesity & Metabolic Surgery Society', url: 'https://www.bomss.org/' },
  { nombre: 'OSSA · Obesity Surgery Society of Australia & NZ', url: 'https://ossanz.com.au/' },
  { nombre: 'ACBS · Asian-Pacific Chapter of Bariatric Surgery', url: 'https://www.ifso-apc.org/' },
  { nombre: 'APSO · Asia Pacific Society of Obesity', url: 'https://www.apso-obesity.org/' },
  { nombre: 'SSAT · Society for Surgery of the Alimentary Tract', url: 'https://ssat.com/' },
  { nombre: 'SAGES · Society of American Gastrointestinal Endoscopic Surgeons', url: 'https://www.sages.org/' }
];

export const REVISTAS = [
  { nombre: 'Surgery for Obesity and Related Diseases (SOARD)', url: 'https://www.soard.org/' },
  { nombre: 'Obesity Surgery', url: 'https://link.springer.com/journal/11695' },
  { nombre: 'Obesity (The Obesity Society)', url: 'https://onlinelibrary.wiley.com/journal/1930739x' },
  { nombre: 'JAMA Surgery', url: 'https://jamanetwork.com/journals/jamasurgery' },
  { nombre: 'Annals of Surgery', url: 'https://journals.lww.com/annalsofsurgery/pages/default.aspx' },
  { nombre: 'Surgical Endoscopy', url: 'https://link.springer.com/journal/464' },
  { nombre: 'British Journal of Surgery', url: 'https://academic.oup.com/bjs' },
  { nombre: 'Endocrine Practice', url: 'https://www.endocrinepractice.org/' },
  { nombre: 'Diabetes Care', url: 'https://diabetesjournals.org/care' },
  { nombre: 'NEJM', url: 'https://www.nejm.org/' }
];

// ISO week number
export function semanaISO(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return { semana: Math.ceil(((d - yearStart) / 86400000 + 1) / 7), anyo: d.getUTCFullYear() };
}

export function topicoDeLaSemana() {
  const { semana, anyo } = semanaISO();
  const topico = TOPICOS[(semana - 1) % TOPICOS.length];
  // Rotar 6 artículos a partir del índice de la semana
  const articulos = Array.from({ length: 6 }, (_, i) => ARTICULOS_BASE[(semana + i) % ARTICULOS_BASE.length]);
  const proxima = new Date();
  proxima.setDate(proxima.getDate() + ((7 - proxima.getDay() + 1) % 7 || 7));
  return { semana, anyo, topico, articulos, proxima };
}
