import React, { useState, useEffect } from 'react';
import { Activity, GraduationCap, Heart, Users, CheckCircle2, AlertCircle, AlertTriangle, ChevronRight, Pill, Stethoscope, Shield, Download, Share2, Mail, ClipboardList, FlaskConical, FileText, Printer, Square, CheckSquare } from 'lucide-react';
import { exportarPDF, descargarPDF, enviarPDFWhatsApp, enviarPDFEmail, storageGet, storageSet } from './src_shared/utils.js';
import { useLang } from './src_shared/i18n.jsx';

const C = { navy:'#0A1F44', teal:'#1A8B9D', gold:'#C9A961', cream:'#FAF7F2', green:'#2D8659', yellow:'#E0A82E', red:'#C0392B' };

const PROCS = {
  sleeve:'Manga Gástrica', rygb:'RYGB', oagb:'OAGB', sadis:'SADI-S', bpdds:'BPD-DS',
  balon:'Balón intragástrico (electivo · IFSO/ASMBS)',
  rev_sg_rygb:'Revisión Manga→RYGB', rev_sg_oagb:'Revisión Manga→OAGB'
};

function imc(p){const pe=parseFloat(p.peso),t=parseFloat(p.talla)/100;return (pe&&t)?pe/(t*t):0;}

function planOptimizacion(p){
  const items=[]; const i=imc(p); const c=p.comorbilidades||{};
  if(c.tabaco) items.push({prio:'critico',area:'Cesación tabáquica',accion:'Suspensión obligatoria ≥6 semanas previo a cirugía. Bupropión o vareniclina + apoyo conductual.',tiempo:'6-8 semanas'});
  if(c.dm) items.push({prio:'critico',area:'Control glucémico',accion:'Optimizar HbA1c <8% (meta <7% si insulinodependiente). Ajuste con endocrinología.',tiempo:'8-12 semanas'});
  if(i>=50) items.push({prio:'importante',area:'Pérdida puente',accion:'IMC≥50: terapia puente con GLP-1 (semaglutida/tirzepatida) o balón intragástrico 4-6 meses para reducir IMC ≥10%.',tiempo:'4-6 meses'});
  if(c.aos) items.push({prio:'importante',area:'AOS',accion:'Polisomnografía + titulación CPAP. Uso ≥4h/noche por ≥4 semanas previas.',tiempo:'4-6 semanas'});
  if(c.cardio) items.push({prio:'importante',area:'Cardiología',accion:'Valoración cardiológica + ecocardiograma + ECG. Optimizar betabloqueo si indicado.',tiempo:'2-4 semanas'});
  if(c.erc) items.push({prio:'importante',area:'Nefrología',accion:'TFG, electrolitos, ajuste de fármacos nefrotóxicos. Valoración nefrológica.',tiempo:'2-4 semanas'});
  if(c.acoag) items.push({prio:'critico',area:'Anticoagulación',accion:'Plan de puenteo con hematología. Suspender ACOD 48-72h previo según función renal.',tiempo:'1 semana'});
  if(c.disli) items.push({prio:'rutina',area:'Dislipidemia',accion:'Continuar estatina perioperatoria. Perfil lipídico basal.',tiempo:'rutina'});
  items.push({prio:'rutina',area:'Nutrición',accion:'Dieta hipocalórica hiperproteica 2 semanas previas. Suplementación: tiamina, B12, hierro, vit D, calcio.',tiempo:'2-4 semanas'});
  items.push({prio:'rutina',area:'Psicología',accion:'Evaluación psicológica + contrato conductual + grupo de apoyo.',tiempo:'4-8 semanas'});
  return items;
}

function recomendarProcedimiento(p){
  const i=imc(p); const c=p.comorbilidades||{};
  const candidatos=[];

  if(i>=27 && i<35 && !c.erge && !(c.dm && parseFloat(p.hba1c)>=8)){
    candidatos.push({proc:'balon',score:85,razon:'IMC 27-35 sin ERGE ni DM severa: balón intragástrico es opción electiva recomendada por IFSO/ASMBS. Sin cirugía, reversible, TWL 12-15%.'});
    candidatos.push({proc:'sleeve',score:75,razon:'Alternativa quirúrgica si el paciente prefiere resultado duradero.'});
    candidatos.push({proc:'rygb',score:65,razon:'Reservar si hay comorbilidades metabólicas significativas.'});
  } else if(c.erge){
    candidatos.push({proc:'rygb',score:95,razon:'ERGE significativo: RYGB es gold standard antirreflujo'});
    candidatos.push({proc:'oagb',score:60,razon:'Alternativa con riesgo de reflujo biliar'});
  } else if(i>=60){
    candidatos.push({proc:'bpdds',score:90,razon:'IMC≥60: máxima pérdida de peso, considerar 2 tiempos'});
    candidatos.push({proc:'sadis',score:88,razon:'SADI-S: simplificación técnica con resultados similares'});
    candidatos.push({proc:'balon',score:72,razon:'Puente/reducción IMC 10-15% previo a cirugía definitiva (4-6 meses).'});
    candidatos.push({proc:'sleeve',score:70,razon:'Primer tiempo de estrategia escalonada'});
  } else if(i>=50 && c.dm){
    candidatos.push({proc:'rygb',score:92,razon:'IMC≥50 + DM: RYGB con remisión metabólica superior'});
    candidatos.push({proc:'sadis',score:85,razon:'Alternativa hipoabsortiva con buen control DM'});
    candidatos.push({proc:'oagb',score:80,razon:'Buen control metabólico, menor complejidad técnica'});
  } else if(c.dm){
    candidatos.push({proc:'rygb',score:90,razon:'DM: remisión ~80%, gold standard metabólico'});
    candidatos.push({proc:'oagb',score:85,razon:'Remisión DM comparable a RYGB'});
    candidatos.push({proc:'sleeve',score:70,razon:'Remisión DM ~60%, opción más simple'});
  } else {
    candidatos.push({proc:'sleeve',score:88,razon:'Bajo riesgo, técnica más simple, buena pérdida de peso'});
    candidatos.push({proc:'rygb',score:80,razon:'Estándar comparativo con buenos resultados'});
    candidatos.push({proc:'oagb',score:78,razon:'Una anastomosis, técnica reproducible'});
    if(i>=30 && i<40) candidatos.push({proc:'balon',score:72,razon:'IMC 30-40: balón intragástrico como alternativa electiva (IFSO/ASMBS).'});
  }
  if(c.acoag){candidatos.forEach(x=>{if(x.proc==='bpdds'||x.proc==='sadis')x.score-=15;});}
  return candidatos.sort((a,b)=>b.score-a.score).slice(0,4);
}

function capriniScore(p){
  const c=p.comorbilidades||{}; const i=imc(p);
  let cap=5; const e=parseFloat(p.edad)||0;
  if(e>=75)cap+=3; else if(e>=61)cap+=2; else if(e>=41)cap+=1;
  if(c.tep)cap+=3; if(c.ivc)cap+=1; if(c.cardio)cap+=1; if(c.aos)cap+=1; if(i>=40)cap+=1;
  return cap;
}

// ======== OPCIONES DE PROFILAXIS TEV (seleccionables) ========
const OPCIONES_PROFILAXIS_TEV = [
  { id:'hbpm_enoxa_40_c24', cat:'HBPM estándar', nom:'Enoxaparina 40 mg SC c/24h', detalle:'Riesgo moderado · IMC <40 · sin comorbilidades mayores. Inicio 12h post-op.' },
  { id:'hbpm_enoxa_40_c12', cat:'HBPM ajustada', nom:'Enoxaparina 40 mg SC c/12h', detalle:'IMC 40-49 o Caprini 5-7. Duración 7-10 días hospitalaria.' },
  { id:'hbpm_enoxa_60_c12', cat:'HBPM alta dosis', nom:'Enoxaparina 60 mg SC c/12h', detalle:'IMC ≥50 o Caprini ≥8. Profilaxis extendida 2-4 semanas post-alta.' },
  { id:'hbpm_dalte_5000_c12', cat:'HBPM alternativa', nom:'Dalteparina 5000 UI SC c/12h', detalle:'Alternativa a enoxaparina. IMC ≥40.' },
  { id:'hbpm_tinza_4500_c24', cat:'HBPM alternativa', nom:'Tinzaparina 4500 UI SC c/24h', detalle:'Alternativa en pacientes con ERC (ajustar según TFG).' },
  { id:'fondaparinux', cat:'Inhibidor Xa', nom:'Fondaparinux 2.5 mg SC c/24h', detalle:'Indicado si TIH (trombocitopenia inducida por heparina) o alergia a HBPM.' },
  { id:'hnf_5000_c8', cat:'Heparina no fraccionada', nom:'HNF 5000 UI SC c/8h', detalle:'Opción en ERC grave (TFG <30). Requiere monitoreo de plaquetas.' },
  { id:'ccn', cat:'Mecánica', nom:'Compresión neumática intermitente (CNI)', detalle:'Obligatoria en todo paciente. Aplicar desde inducción hasta deambulación.' },
  { id:'medias_elasticas', cat:'Mecánica', nom:'Medias de compresión graduada', detalle:'Complemento. Retirar sólo para higiene.' },
  { id:'deambulacion', cat:'No farmacológica', nom:'Deambulación temprana (<6h post-op)', detalle:'Evidencia nivel A para reducción de TEV.' },
  { id:'profilaxis_extendida_2s', cat:'Extendida', nom:'Profilaxis HBPM extendida 2 semanas post-alta', detalle:'Caprini 5-7 o IMC ≥40.' },
  { id:'profilaxis_extendida_4s', cat:'Extendida', nom:'Profilaxis HBPM extendida 4 semanas post-alta', detalle:'Caprini ≥8, antecedente TEV, cáncer activo, IMC ≥50.' },
  { id:'filtro_vci_temp', cat:'Mecánica invasiva', nom:'Filtro de VCI temporal', detalle:'Sólo si contraindicación absoluta a anticoagulación y riesgo alto. Retirar ≤30 días.' }
];

function sugerenciaProfilaxisTEV(p){
  const cap=capriniScore(p); const i=imc(p);
  const sugeridas=['ccn','medias_elasticas','deambulacion'];
  if(cap>=8 || i>=50){ sugeridas.push('hbpm_enoxa_60_c12','profilaxis_extendida_4s'); }
  else if(cap>=5 || i>=40){ sugeridas.push('hbpm_enoxa_40_c12','profilaxis_extendida_2s'); }
  else { sugeridas.push('hbpm_enoxa_40_c24'); }
  return sugeridas;
}

// ======== INDICACIONES PREOPERATORIAS (marcables con ID) ========
const INDICACIONES_PREOP = [
  { cat:'Nutrición (2 semanas previas)', items:[
    { id:'nutr_dieta', txt:'Dieta hipocalórica hiperproteica 800-1000 kcal/día con ≥60 g proteína' },
    { id:'nutr_liquida', txt:'Dieta líquida completa (proteína + vegetales) los últimos 3-5 días' },
    { id:'nutr_hidrata', txt:'Hidratación mínima 2 L/día; suspender bebidas azucaradas y alcohol' },
    { id:'nutr_suplem', txt:'Suplementación: multivitamínico bariátrico, tiamina 100 mg/día, vit D si déficit' }
  ]},
  { cat:'Medicamentos a suspender', items:[
    { id:'med_aines', txt:'AINEs y aspirina: 7 días previos (excepto indicación cardiológica específica)' },
    { id:'med_warfa', txt:'Warfarina: 5 días antes · ACOD (apixabán/rivaroxabán): 48-72 h según función renal' },
    { id:'med_antiag', txt:'Antiagregantes (clopidogrel): 5-7 días · coordinar con cardiólogo' },
    { id:'med_aco', txt:'Anticonceptivos orales: suspender 4 semanas antes (riesgo TEV)' },
    { id:'med_glp1', txt:'GLP-1 / tirzepatida: suspender al menos 1 semana antes (riesgo aspiración)' },
    { id:'med_metfor', txt:'Metformina: suspender 24 h previas' },
    { id:'med_fito', txt:'Fitoterapia / suplementos herbales: 2 semanas antes' }
  ]},
  { cat:'Higiene y preparación', items:[
    { id:'hig_bano', txt:'Baño completo la noche previa y la mañana de la cirugía con clorhexidina jabón 4%' },
    { id:'hig_rasurar', txt:'No afeitar área quirúrgica en casa (se realiza en quirófano con clipper)' },
    { id:'hig_retirar', txt:'Retirar esmalte de uñas, maquillaje, lentes de contacto, joyas y piercings' },
    { id:'hig_dental', txt:'Cepillado dental matinal sin tragar agua' },
    { id:'hig_ropa', txt:'Ropa cómoda y holgada el día de la cirugía' }
  ]},
  { cat:'Ayuno y día de cirugía', items:[
    { id:'ayun_soli', txt:'Sólidos: 6 h antes · Líquidos claros: 2 h antes (protocolo ERAS)' },
    { id:'ayun_carga', txt:'Carga de carbohidratos 2 h pre-op si no DM descompensada' },
    { id:'ayun_anti', txt:'Medicamentos antihipertensivos: tomar con sorbo de agua (excepto IECA/ARA-II según anestesia)' },
    { id:'ayun_cpap', txt:'CPAP: traer al hospital si AOS' },
    { id:'ayun_llega', txt:'Llegar 2 h antes de la hora programada' }
  ]},
  { cat:'Logística y acompañamiento', items:[
    { id:'log_acom', txt:'Acompañante adulto obligatorio para traslado al alta' },
    { id:'log_reposo', txt:'Reposo laboral planificado: 2-3 semanas ambulatorio · 4-6 semanas si esfuerzo físico' },
    { id:'log_casa', txt:'Preparar casa: alimentos fase 1-2, báscula, almohadas de soporte, termómetro' },
    { id:'log_cobert', txt:'Confirmar cobertura de seguro y consentimiento firmado' }
  ]},
  { cat:'Signos que obligan a reprogramar', items:[
    { id:'rep_infecc', txt:'Infección respiratoria activa, fiebre o proceso viral en los últimos 10 días' },
    { id:'rep_metab', txt:'Descompensación metabólica aguda (HbA1c súbita >10%, crisis hipertensiva)' },
    { id:'rep_emba', txt:'Embarazo confirmado' },
    { id:'rep_ayuno', txt:'Ingesta reciente de alimentos o líquidos no claros violando ayuno' }
  ]}
];

// ======== LABS Y GABINETE (marcables con ID; cada ítem indica si es lab o imagen) ========
const LABS_OPTIMIZACION = [
  { cat:'Laboratorios básicos', color:'#1A8B9D', items:[
    { id:'lab_hemograma', tipo:'lab', txt:'Hemograma completo + VSG' },
    { id:'lab_quimica', tipo:'lab', txt:'Química sanguínea: glucosa, urea, creatinina, electrolitos (Na, K, Cl, Mg, P)' },
    { id:'lab_hba1c', tipo:'lab', txt:'HbA1c + insulina basal + HOMA-IR' },
    { id:'lab_lipidico', tipo:'lab', txt:'Perfil lipídico completo (CT, LDL, HDL, TG, No-HDL)' },
    { id:'lab_hepatico', tipo:'lab', txt:'Perfil hepático: ALT, AST, GGT, fosfatasa alcalina, bilirrubinas, albúmina' },
    { id:'lab_coagul', tipo:'lab', txt:'Pruebas de coagulación: TP, TTP, INR, fibrinógeno' },
    { id:'lab_renal', tipo:'lab', txt:'Función renal: creatinina con TFG estimada, microalbuminuria, relación albúmina/creatinina' },
    { id:'lab_ego', tipo:'lab', txt:'Examen general de orina' }
  ]},
  { cat:'Endocrino / metabólico', color:'#C9A961', items:[
    { id:'lab_tsh', tipo:'lab', txt:'TSH + T4L (descartar hipotiroidismo contribuyente)' },
    { id:'lab_cortisol', tipo:'lab', txt:'Cortisol matutino (descartar Cushing si sospecha clínica)' },
    { id:'lab_prola', tipo:'lab', txt:'Prolactina (mujeres con alteraciones menstruales)' },
    { id:'lab_acuric', tipo:'lab', txt:'Ácido úrico' },
    { id:'lab_pept_c', tipo:'lab', txt:'Péptido-C en ayuno (si DM insulino-requeriente, para predicción de remisión)' },
    { id:'lab_vitd', tipo:'lab', txt:'Vitamina D (25-OH), PTH intacta, calcio iónico' },
    { id:'lab_b12_fol', tipo:'lab', txt:'Vitamina B12, ácido fólico eritrocitario' },
    { id:'lab_hierro', tipo:'lab', txt:'Ferritina, hierro sérico, índice de saturación, capacidad total' },
    { id:'lab_oligo', tipo:'lab', txt:'Zinc, magnesio, selenio (si malnutrición o revisional)' }
  ]},
  { cat:'Hepático / digestivo', color:'#2D8659', items:[
    { id:'lab_fib4', tipo:'lab', txt:'FIB-4 y NAFLD Fibrosis Score (con plaquetas, AST, ALT, albúmina, edad)' },
    { id:'img_fibroscan', tipo:'imagen', txt:'Elastografía hepática transitoria (FibroScan) con CAP — obligatoria si ALT>40 o DM2/NAFLD' },
    { id:'lab_elf', tipo:'lab', txt:'ELF test (Enhanced Liver Fibrosis) si FIB-4 intermedio' },
    { id:'img_usg_abd', tipo:'imagen', txt:'Ecografía abdominal: hígado, vesícula, vía biliar, páncreas' },
    { id:'img_veda', tipo:'imagen', txt:'Endoscopia digestiva alta (VEDA) preoperatoria de rutina en todos los candidatos' },
    { id:'lab_hp', tipo:'lab', txt:'Biopsia gástrica para H. pylori + test de ureasa — erradicar si positivo previo a cirugía' },
    { id:'img_phmetria', tipo:'imagen', txt:'pH-metría de 24 h + manometría esofágica si síntomas de ERGE o candidato a manga' }
  ]},
  { cat:'Imagen estructural', color:'#1A8B9D', items:[
    { id:'img_torax', tipo:'imagen', txt:'Tele de tórax PA y lateral' },
    { id:'img_doppler_mmii', tipo:'imagen', txt:'USG Doppler de miembros inferiores si antecedente TEV o varices importantes' },
    { id:'img_dexa', tipo:'imagen', txt:'DEXA (composición corporal + densidad mineral ósea) en >40 años o factores de riesgo' },
    { id:'img_bia', tipo:'imagen', txt:'Bioimpedancia segmentaria (masa magra, masa grasa, agua corporal, ángulo de fase)' }
  ]},
  { cat:'Cardiovascular', color:'#C0392B', items:[
    { id:'img_ecg', tipo:'imagen', txt:'ECG de 12 derivaciones' },
    { id:'img_ecocardio', tipo:'imagen', txt:'Ecocardiograma transtorácico (obligatorio si IMC≥50, edad≥50, HTA/DM, sospecha disfunción VI)' },
    { id:'img_esfuerzo', tipo:'imagen', txt:'Prueba de esfuerzo farmacológica si capacidad funcional <4 METs' },
    { id:'img_tacoron', tipo:'imagen', txt:'Angio-TAC coronario si score Framingham alto o angina atípica' },
    { id:'img_holter', tipo:'imagen', txt:'Holter 24 h si palpitaciones o arritmia documentada' }
  ]},
  { cat:'Respiratorio', color:'#0A1F44', items:[
    { id:'img_psg', tipo:'imagen', txt:'Polisomnografía nocturna (obligatoria si STOP-BANG ≥3, ronquido, apneas presenciadas)' },
    { id:'img_espir', tipo:'imagen', txt:'Espirometría con broncodilatador si EPOC/asma o fumador activo' },
    { id:'lab_gaso', tipo:'lab', txt:'Gasometría arterial basal si SpO₂ <92% o IMC≥50' }
  ]},
  { cat:'Obstétrico / ginecológico', color:'#E0A82E', items:[
    { id:'lab_bhcg', tipo:'lab', txt:'βhCG obligatoria en mujeres en edad fértil' },
    { id:'img_pap', tipo:'imagen', txt:'Citología cervical vigente' },
    { id:'img_mamo', tipo:'imagen', txt:'Mamografía vigente si ≥40 años' }
  ]},
  { cat:'Evaluaciones no-laboratorio', color:'#1A8B9D', items:[
    { id:'eval_anest', tipo:'consulta', txt:'Evaluación anestesiológica con clasificación ASA' },
    { id:'eval_nutri', tipo:'consulta', txt:'Evaluación nutricional + plan preoperatorio' },
    { id:'eval_psico', tipo:'consulta', txt:'Evaluación psicológica/psiquiátrica estructurada (BES, BDI, GAD-7)' },
    { id:'eval_odonto', tipo:'consulta', txt:'Odontológica: foco séptico oral (raíz de complicaciones infecciosas)' },
    { id:'eval_fisio', tipo:'consulta', txt:'Fisioterapia respiratoria y entrenamiento pre-habilitación' }
  ]}
];

function labsSugeridosPaciente(p){
  const c=p.comorbilidades||{}; const i=imc(p);
  const alertas=[];
  if(c.dm) alertas.push('DM2: refuerce HbA1c, péptido-C, microalbuminuria, fondo de ojo');
  if(c.aos||parseFloat(p.edad)>50) alertas.push('AOS / edad ≥50: polisomnografía + ecocardiograma');
  if(c.cardio) alertas.push('Cardiopatía: ecocardio + prueba de esfuerzo/Holter');
  if(parseFloat(p.alt)>40||c.dm) alertas.push('Transaminasas/DM2: FibroScan + FIB-4 + ecografía abdominal');
  if(c.erge) alertas.push('ERGE: VEDA + pH-metría + manometría (define RYGB vs Manga)');
  if(i>=50) alertas.push('IMC≥50: gasometría arterial, prueba de esfuerzo, DEXA basal');
  if(c.tabaco) alertas.push('Tabaquismo: espirometría + tele de tórax');
  if(c.acoag) alertas.push('Anticoagulación: hematología + USG Doppler MMII');
  return alertas;
}

// Mapa id → texto para impresión/reportes
const MAP_LABS = LABS_OPTIMIZACION.flatMap(s=>s.items.map(it=>({...it, cat:s.cat})));
const MAP_PREOP = INDICACIONES_PREOP.flatMap(s=>s.items.map(it=>({...it, cat:s.cat})));
const MAP_PROFI = OPCIONES_PROFILAXIS_TEV;

export default function Modulo2(){
  const { t } = useLang();
  const [modo,setModo]=useState('clinico');
  const [pacientes,setPacientes]=useState([]);
  const [seleccionado,setSeleccionado]=useState(null);
  const [tab,setTab]=useState('optimizacion');
  const [cargando,setCargando]=useState(true);

  // Store maestro de marcables (se comparte con el Módulo 9 Investigación)
  const [marcables,setMarcables]=useState({});

  useEffect(()=>{(async()=>{
    const r=await storageGet('avante_pacientes'); if(r) setPacientes(r);
    const m=await storageGet('avante_marcables'); if(m) setMarcables(m);
    setCargando(false);
  })();},[]);

  const getMarc = (pid, key) => (marcables[pid]?.[key]) || [];
  const toggleMarc = async (pid, key, id) => {
    const cur = getMarc(pid, key);
    const next = cur.includes(id) ? cur.filter(x=>x!==id) : [...cur, id];
    const upd = { ...marcables, [pid]: { ...(marcables[pid]||{}), [key]: next } };
    setMarcables(upd); await storageSet('avante_marcables', upd);
  };
  const setMarcSingle = async (pid, key, val) => {
    const upd = { ...marcables, [pid]: { ...(marcables[pid]||{}), [key]: val } };
    setMarcables(upd); await storageSet('avante_marcables', upd);
  };

  // ORDEN INDEPENDIENTE: genera PDF sólo con las selecciones de labs o imágenes
  const generarOrden = (tipo /* 'lab' | 'imagen' | 'consulta' */) => {
    const sel = getMarc(seleccionado.id, 'labs_preop');
    const items = MAP_LABS.filter(x => sel.includes(x.id) && x.tipo===tipo);
    if(items.length===0){ alert('No hay estudios seleccionados para este tipo de orden.'); return null; }
    const titulo = tipo==='lab' ? 'Orden de Laboratorios Preoperatorios'
                  : tipo==='imagen' ? 'Orden de Gabinete / Imagenología'
                  : 'Orden de Consultas Perioperatorias';
    const porCat = {};
    items.forEach(it => { (porCat[it.cat]=porCat[it.cat]||[]).push(it.txt); });
    const secciones = Object.entries(porCat).map(([cat, arr]) => ({ titulo:cat, lineas: arr }));
    return exportarPDF({
      titulo,
      subtitulo: `${seleccionado.nombre||''} ${seleccionado.apellido||''}`.trim() + ` · ${seleccionado.edad||'--'}a · IMC ${imc(seleccionado).toFixed(1)}`,
      secciones: [
        { titulo:'Datos del paciente', lineas:[
          `Nombre: ${seleccionado.nombre||''} ${seleccionado.apellido||''}`,
          `Edad: ${seleccionado.edad||'--'} · Sexo: ${seleccionado.sexo||'--'} · IMC: ${imc(seleccionado).toFixed(1)}`,
          `Procedimiento propuesto: ${PROCS[seleccionado.procedimiento]||'--'}`,
          `Fecha de la orden: ${new Date().toLocaleDateString('es-ES')}`
        ]},
        ...secciones,
        { titulo:'Firma del médico', lineas:['','_____________________________', 'Cédula profesional / sello'] }
      ],
      footer:'Avante Complejo Hospitalario · Creamos e innovamos para cuidar de ti'
    });
  };

  const descOrden = (tipo) => { const d=generarOrden(tipo); if(d) descargarPDF(d, `orden_${tipo}_${seleccionado.nombre||'paciente'}`); };
  const waOrden = (tipo) => { const d=generarOrden(tipo); if(d) enviarPDFWhatsApp(d, `orden_${tipo}_${seleccionado.nombre||'paciente'}`, seleccionado.telefono||'', `Orden ${tipo} Avante - ${seleccionado.nombre||''}`); };
  const emailOrden = (tipo) => { const d=generarOrden(tipo); if(d) enviarPDFEmail(d, `orden_${tipo}_${seleccionado.nombre||'paciente'}`, seleccionado.email||'', `Orden ${tipo} Avante`, `Adjunto orden de ${tipo} para ${seleccionado.nombre||''}`); };
  const printOrden = (tipo) => { const d=generarOrden(tipo); if(d){ d.autoPrint(); window.open(d.output('bloburl'),'_blank'); } };

  // Plan general (incluye todo)
  const construirPDF = () => {
    const opt=planOptimizacion(seleccionado);
    const proc=recomendarProcedimiento(seleccionado);
    const cap = capriniScore(seleccionado);
    const sel = getMarc(seleccionado.id,'profilaxis_tev');
    const erasSel = getMarc(seleccionado.id,'eras_preop');
    return exportarPDF({
      titulo:'Plan Perioperatorio',
      subtitulo:`${seleccionado.nombre||''} ${seleccionado.apellido||''}`.trim() + ` · ${seleccionado.edad}a · IMC ${imc(seleccionado).toFixed(1)}`,
      secciones:[
        { titulo:'Optimización preoperatoria', lineas: opt.map(x=>`[${x.prio.toUpperCase()}] ${x.area} (${x.tiempo}): ${x.accion}`) },
        { titulo:'Selección de procedimiento', lineas: proc.map((x,i)=>`${i+1}. ${PROCS[x.proc]} (score ${x.score}/100) — ${x.razon}`) },
        { titulo:`Profilaxis TEV · Caprini ${cap}`, lineas: sel.length ? MAP_PROFI.filter(o=>sel.includes(o.id)).map(o=>`• ${o.nom} — ${o.detalle}`) : ['Sin selecciones guardadas.'] },
        { titulo:'Indicaciones ERAS preoperatorias marcadas', lineas: erasSel.length ? MAP_PREOP.filter(x=>erasSel.includes(x.id)).map(x=>`• [${x.cat}] ${x.txt}`) : ['Sin selecciones guardadas.'] }
      ],
      footer:'Avante Complejo Hospitalario · Creamos e innovamos para cuidar de ti'
    });
  };

  const nomArchivo = () => `plan_${seleccionado.nombre||'paciente'}`;
  const descargar = () => descargarPDF(construirPDF(), nomArchivo());
  const whatsapp = () => enviarPDFWhatsApp(construirPDF(), nomArchivo(), seleccionado.telefono||'', `Plan perioperatorio Avante - ${seleccionado.nombre||''}`);
  const email = () => enviarPDFEmail(construirPDF(), nomArchivo(), seleccionado.email||'', 'Plan perioperatorio Avante', `Adjunto plan perioperatorio de ${seleccionado.nombre||''}`);

  const btn="px-4 py-2 rounded font-medium transition-colors";

  if(cargando)return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen p-4" style={{background:'#f3f4f6',fontFamily:'system-ui,sans-serif'}}>
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div style={{background:C.navy,color:'white'}} className="p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 style={{fontFamily:'Georgia,serif',color:C.gold}} className="text-3xl font-bold">Avante Complejo Hospitalario</h1>
              <p style={{fontFamily:'Georgia,serif'}} className="text-sm italic mt-1">{t('app.lema')}</p>
              <p className="text-xs mt-2 opacity-80">{t('modulo')} 2 · {t('mod.2.titulo')}</p>
            </div>
            <div className="flex gap-2">
              {[{id:'clinico',i:Activity,k:'modo.clinico'},{id:'academico',i:GraduationCap,k:'modo.academico'},{id:'paciente',i:Heart,k:'modo.paciente'}].map(m=>{
                const I=m.i;
                return <button key={m.id} onClick={()=>setModo(m.id)} className={btn+" flex items-center gap-2 text-sm"}
                  style={{background:modo===m.id?C.teal:'rgba(255,255,255,0.1)',color:'white'}}><I size={16}/>{t(m.k)}</button>;
              })}
            </div>
          </div>
        </div>

        <div className="p-6">
          {!seleccionado ? (
            <div>
              <h2 className="font-bold mb-3 flex items-center gap-2" style={{color:C.navy}}><Users size={20}/>Seleccione un paciente del Módulo 1</h2>
              {pacientes.length===0 ? (
                <div className="p-8 text-center rounded" style={{background:C.cream}}>
                  <p className="text-gray-600">No hay pacientes guardados. Complete primero una evaluación en el Módulo 1.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pacientes.map(p=>(
                    <button key={p.id} onClick={()=>setSeleccionado(p)} className="w-full p-3 border rounded text-left hover:shadow flex justify-between items-center">
                      <div>
                        <div className="font-bold" style={{color:C.navy}}>{(p.nombre||'Sin nombre')+' '+(p.apellido||'')}</div>
                        <div className="text-xs text-gray-600">{p.edad}a · {p.sexo} · IMC {imc(p).toFixed(1)} · {PROCS[p.procedimiento]||'—'}</div>
                      </div>
                      <ChevronRight size={20} style={{color:C.teal}}/>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4 p-3 rounded flex-wrap gap-2" style={{background:C.cream}}>
                <div>
                  <div className="font-bold" style={{color:C.navy}}>{seleccionado.nombre} {seleccionado.apellido}</div>
                  <div className="text-xs text-gray-600">{seleccionado.edad}a · {seleccionado.sexo} · IMC {imc(seleccionado).toFixed(1)} · Propuesto: {PROCS[seleccionado.procedimiento]||'—'}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={descargar} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Download size={14}/>PDF</button>
                  <button onClick={whatsapp} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:'#25D366'}}><Share2 size={14}/>WhatsApp</button>
                  <button onClick={email} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.navy}}><Mail size={14}/>Email</button>
                  <button onClick={()=>setSeleccionado(null)} className={btn+" text-sm"} style={{background:'#e5e7eb'}}>Cambiar</button>
                </div>
              </div>

              <div className="flex gap-2 mb-4 border-b flex-wrap">
                {[{id:'optimizacion',i:Pill,l:'Optimización'},{id:'seleccion',i:Stethoscope,l:'Selección procedimiento'},{id:'preop',i:ClipboardList,l:'Indicaciones preop'},{id:'labs_opt',i:FlaskConical,l:'Labs y gabinete'},{id:'profilaxis',i:Shield,l:'Profilaxis perioperatoria'}].map(t=>{
                  const I=t.i;
                  return <button key={t.id} onClick={()=>setTab(t.id)} className="px-4 py-2 flex items-center gap-2 text-sm font-medium border-b-2"
                    style={{borderColor:tab===t.id?C.gold:'transparent',color:tab===t.id?C.navy:'#6b7280'}}><I size={16}/>{t.l}</button>;
                })}
              </div>

              {tab==='optimizacion' && (
                <div className="space-y-2">
                  {modo==='paciente' ? (
                    <div className="p-6 rounded text-center" style={{background:C.cream}}>
                      <Heart size={40} style={{color:C.teal}} className="mx-auto mb-3"/>
                      <h3 style={{fontFamily:'Georgia,serif',color:C.navy}} className="text-xl font-bold mb-2">Le prepararemos paso a paso</h3>
                      <p className="text-gray-700 mb-4">Antes de su cirugía trabajaremos juntos para llevarle al mejor estado de salud posible.</p>
                    </div>
                  ) : planOptimizacion(seleccionado).map((x,i)=>(
                    <div key={i} className="p-3 border-l-4 rounded flex gap-3" style={{borderColor:x.prio==='critico'?C.red:x.prio==='importante'?C.yellow:C.teal,background:C.cream}}>
                      {x.prio==='critico'?<AlertCircle size={18} style={{color:C.red,flexShrink:0,marginTop:2}}/>:x.prio==='importante'?<AlertTriangle size={18} style={{color:C.yellow,flexShrink:0,marginTop:2}}/>:<CheckCircle2 size={18} style={{color:C.teal,flexShrink:0,marginTop:2}}/>}
                      <div className="flex-1">
                        <div className="font-bold text-sm" style={{color:C.navy}}>{x.area} <span className="text-xs font-normal text-gray-500">· {x.tiempo}</span></div>
                        <div className="text-sm text-gray-700">{x.accion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab==='seleccion' && (
                <div className="space-y-3">
                  {modo==='paciente' ? (
                    <div className="p-6 rounded text-center" style={{background:C.cream}}>
                      <Stethoscope size={40} style={{color:C.teal}} className="mx-auto mb-3"/>
                      <h3 style={{fontFamily:'Georgia,serif',color:C.navy}} className="text-xl font-bold mb-2">Elegiremos juntos su mejor opción</h3>
                      <p className="text-gray-700 mb-4">Existen varias técnicas: desde el balón intragástrico (sin cirugía) hasta los bypass metabólicos. Se analizará cuál es la más segura y efectiva para usted.</p>
                    </div>
                  ) : recomendarProcedimiento(seleccionado).map((x,i)=>(
                    <div key={i} className="p-4 rounded border" style={{borderColor:i===0?C.gold:'#e5e7eb',background:i===0?C.cream:'white'}}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {i===0 && <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{background:C.gold}}>PRIMERA OPCIÓN</span>}
                            <div className="font-bold" style={{color:C.navy}}>{PROCS[x.proc]}</div>
                          </div>
                          <div className="text-sm text-gray-700 mt-1">{x.razon}</div>
                        </div>
                        <div className="text-2xl font-bold ml-3" style={{color:C.teal}}>{x.score}</div>
                      </div>
                    </div>
                  ))}
                  {modo==='academico' && (
                    <div className="p-3 rounded border text-xs text-gray-700" style={{borderColor:C.teal}}>
                      <strong style={{color:C.navy}}>Notas (IFSO/ASMBS 2024):</strong> Algoritmo incluye balón intragástrico como procedimiento <em>electivo</em> (no sólo como puente): IMC 27-35 sin ERGE ni DM severa. ERGE → RYGB (gold standard antirreflujo). IMC≥60 → BPD-DS/SADI-S o estrategia en 2 tiempos. DM con HbA1c elevada → priorizar bypass.
                    </div>
                  )}
                </div>
              )}

              {tab==='preop' && (
                <div className="space-y-3">
                  <div className="p-3 rounded border-l-4 flex items-center gap-2" style={{background:'#ecfdf5',borderColor:C.green}}>
                    <CheckSquare size={16} style={{color:C.green}}/>
                    <div className="text-xs text-gray-700">Marque las indicaciones que aplican a este paciente. Se guardan automáticamente y alimentan el <strong>Módulo 9 Investigación</strong> como variables de cruce.</div>
                  </div>
                  {INDICACIONES_PREOP.map((s,i)=>(
                    <div key={i} className="p-3 rounded border-l-4" style={{background:'white',borderColor:C.gold}}>
                      <div className="font-bold text-sm mb-2" style={{color:C.navy}}>{s.cat}</div>
                      <ul className="space-y-1">
                        {s.items.map((x)=> {
                          const sel = getMarc(seleccionado.id,'eras_preop').includes(x.id);
                          return (
                            <li key={x.id}>
                              <button onClick={()=>toggleMarc(seleccionado.id,'eras_preop',x.id)} className="w-full text-left flex items-start gap-2 p-1 rounded hover:bg-gray-50">
                                {sel ? <CheckSquare size={16} style={{color:C.teal,flexShrink:0,marginTop:2}}/> : <Square size={16} style={{color:'#9ca3af',flexShrink:0,marginTop:2}}/>}
                                <span className="text-sm" style={{color:sel?C.navy:'#4b5563'}}>{x.txt}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {tab==='labs_opt' && (
                <div className="space-y-3">
                  <div className="p-3 rounded border-l-4 flex flex-wrap items-center gap-2 justify-between" style={{background:'#eff6ff',borderColor:C.teal}}>
                    <div className="text-xs text-gray-700 flex-1 min-w-[200px]"><strong style={{color:C.navy}}>Generar orden independiente</strong> con los estudios seleccionados:</div>
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={()=>descOrden('lab')} className="text-xs px-2 py-1 rounded text-white flex items-center gap-1" style={{background:C.teal}}><Download size={12}/>Lab</button>
                      <button onClick={()=>descOrden('imagen')} className="text-xs px-2 py-1 rounded text-white flex items-center gap-1" style={{background:C.navy}}><Download size={12}/>Imagen</button>
                      <button onClick={()=>descOrden('consulta')} className="text-xs px-2 py-1 rounded text-white flex items-center gap-1" style={{background:C.gold}}><Download size={12}/>Consulta</button>
                      <button onClick={()=>waOrden('lab')} className="text-xs px-2 py-1 rounded text-white flex items-center gap-1" style={{background:'#25D366'}}><Share2 size={12}/>WA</button>
                      <button onClick={()=>emailOrden('lab')} className="text-xs px-2 py-1 rounded text-white flex items-center gap-1" style={{background:'#6366f1'}}><Mail size={12}/>Email</button>
                      <button onClick={()=>printOrden('lab')} className="text-xs px-2 py-1 rounded text-white flex items-center gap-1" style={{background:'#6b7280'}}><Printer size={12}/>Imprimir</button>
                    </div>
                  </div>

                  {labsSugeridosPaciente(seleccionado).length>0 && (
                    <div className="p-3 rounded" style={{background:'#fef3c7',borderLeft:'4px solid '+C.yellow}}>
                      <div className="font-bold text-sm mb-1" style={{color:C.navy}}>Sugerencias específicas para este paciente</div>
                      <ul className="space-y-1 text-xs">
                        {labsSugeridosPaciente(seleccionado).map((a,i)=>(<li key={i} className="flex gap-2"><AlertTriangle size={12} style={{color:C.yellow,flexShrink:0,marginTop:3}}/>{a}</li>))}
                      </ul>
                    </div>
                  )}

                  {LABS_OPTIMIZACION.map((s,i)=>(
                    <div key={i} className="p-3 rounded border-l-4" style={{background:'white',borderColor:s.color}}>
                      <div className="font-bold text-sm mb-2 flex justify-between items-center" style={{color:C.navy}}>
                        <span>{s.cat}</span>
                        <button onClick={()=>{
                          const ids = s.items.map(it=>it.id);
                          const cur = getMarc(seleccionado.id,'labs_preop');
                          const todasMarcadas = ids.every(id=>cur.includes(id));
                          const next = todasMarcadas ? cur.filter(id=>!ids.includes(id)) : [...new Set([...cur,...ids])];
                          setMarcSingle(seleccionado.id,'labs_preop',next);
                        }} className="text-xs font-normal px-2 py-0.5 rounded" style={{background:s.color,color:'white'}}>
                          Marcar todo
                        </button>
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1">
                        {s.items.map((x)=>{
                          const sel = getMarc(seleccionado.id,'labs_preop').includes(x.id);
                          return (
                            <li key={x.id}>
                              <button onClick={()=>toggleMarc(seleccionado.id,'labs_preop',x.id)} className="w-full text-left flex items-start gap-2 p-1 rounded hover:bg-gray-50">
                                {sel ? <CheckSquare size={14} style={{color:s.color,flexShrink:0,marginTop:2}}/> : <Square size={14} style={{color:'#9ca3af',flexShrink:0,marginTop:2}}/>}
                                <span className="text-xs" style={{color:sel?C.navy:'#4b5563'}}>{x.txt}</span>
                                <span className="text-[10px] ml-auto px-1 rounded" style={{background:'#e5e7eb',color:'#6b7280'}}>{x.tipo}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                  <div className="p-3 rounded text-xs text-gray-700" style={{background:C.cream,borderLeft:'3px solid '+C.teal}}>
                    <strong style={{color:C.navy}}>Elastografía hepática (FibroScan):</strong> se solicita de rutina si ALT/AST elevadas, IMC≥35, DM2 o esteatosis ecográfica. CAP ≥248 dB/m → esteatosis significativa · kPa ≥8 → fibrosis significativa · kPa ≥12 → cirrosis probable.
                  </div>
                </div>
              )}

              {tab==='profilaxis' && (() => {
                const cap=capriniScore(seleccionado);
                const sugeridas=sugerenciaProfilaxisTEV(seleccionado);
                const nivel = cap>=8?'alto':cap>=5?'moderado-alto':'moderado';
                if(modo==='paciente') return (
                  <div className="p-6 rounded text-center" style={{background:C.cream}}>
                    <Shield size={40} style={{color:C.teal}} className="mx-auto mb-3"/>
                    <h3 style={{fontFamily:'Georgia,serif',color:C.navy}} className="text-xl font-bold mb-2">Su seguridad es nuestra prioridad</h3>
                    <p className="text-gray-700">Aplicamos los protocolos internacionales más rigurosos para prevenir complicaciones durante y después de su cirugía.</p>
                  </div>
                );
                const porCat = {};
                OPCIONES_PROFILAXIS_TEV.forEach(o=>{(porCat[o.cat]=porCat[o.cat]||[]).push(o);});
                return (
                  <div className="space-y-3">
                    <div className="p-4 rounded" style={{background:C.cream}}>
                      <div className="font-bold text-sm mb-1" style={{color:C.navy}}>Caprini {cap} · riesgo {nivel}</div>
                      <div className="text-xs text-gray-600">Sugerencia automática marcada. Puede ajustar las opciones según criterio clínico.</div>
                      <button onClick={()=>setMarcSingle(seleccionado.id,'profilaxis_tev',sugeridas)} className="mt-2 text-xs px-2 py-1 rounded text-white" style={{background:C.teal}}>Aplicar sugerencia automática</button>
                    </div>
                    {Object.entries(porCat).map(([cat,arr])=>(
                      <div key={cat} className="p-3 rounded border-l-4" style={{background:'white',borderColor:C.teal}}>
                        <div className="font-bold text-sm mb-2" style={{color:C.navy}}>{cat}</div>
                        <ul className="space-y-2">
                          {arr.map(o=>{
                            const sel=getMarc(seleccionado.id,'profilaxis_tev').includes(o.id);
                            const esSug=sugeridas.includes(o.id);
                            return (
                              <li key={o.id}>
                                <button onClick={()=>toggleMarc(seleccionado.id,'profilaxis_tev',o.id)} className="w-full text-left flex items-start gap-2 p-2 rounded hover:bg-gray-50" style={{background:sel?'#f0fdf4':'transparent'}}>
                                  {sel ? <CheckSquare size={16} style={{color:C.green,flexShrink:0,marginTop:2}}/> : <Square size={16} style={{color:'#9ca3af',flexShrink:0,marginTop:2}}/>}
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold flex items-center gap-2" style={{color:C.navy}}>
                                      {o.nom}
                                      {esSug && <span className="text-[10px] px-1 rounded text-white" style={{background:C.gold}}>SUGERIDO</span>}
                                    </div>
                                    <div className="text-xs text-gray-600">{o.detalle}</div>
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                    <div className="p-4 rounded" style={{background:C.cream}}>
                      <div className="font-bold text-sm mb-1" style={{color:C.navy}}>Profilaxis antibiótica</div>
                      <div className="text-sm text-gray-700">Cefazolina 2 g IV (3 g si peso &gt;120 kg) 30-60 min pre-incisión. Re-dosificar a las 4 h o si pérdida &gt;1500 mL.</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
