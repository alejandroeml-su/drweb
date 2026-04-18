import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, GraduationCap, Heart, Users, FileText, Download, Mail, MessageCircle,
  BookOpen, ChevronRight, Upload, Trash2, Send, FileDown, Stethoscope, BookMarked, Info
} from 'lucide-react';
import {
  exportarPDF, descargarPDF, enviarPDFWhatsApp, enviarPDFEmail, shareWhatsApp, shareEmail,
  storageGet, storageSet, leerArchivoDataURL, fmtFechaHora, fmtFecha
} from './src_shared/utils.js';
import { useLang } from './src_shared/i18n.jsx';

const C = { navy:'#0A1F44', teal:'#1A8B9D', gold:'#C9A961', cream:'#FAF7F2', green:'#2D8659', yellow:'#E0A82E', red:'#C0392B' };

const PROCS = {
  sleeve:'Manga Gástrica (SG)', rygb:'Bypass Gástrico en Y de Roux (RYGB)',
  oagb:'Bypass Gástrico de Una Anastomosis (OAGB)', sadis:'SADI-S', bpdds:'BPD-DS',
  balon:'Balón intragástrico', rev_sg_rygb:'Revisión: Manga → RYGB', rev_sg_oagb:'Revisión: Manga → OAGB'
};

function imc(p){const pe=parseFloat(p.peso),t=parseFloat(p.talla)/100;return (pe&&t)?pe/(t*t):0;}
function edad(v){ return v ? Number(v) : null; }

// ============================================================================
// EVIDENCIA CIENTÍFICA — base de referencias con DOI/PubMed ID
// ============================================================================
const EVIDENCIA = {
  indicaciones: [
    { cita: 'Eisenberg D, et al. 2022 ASMBS and IFSO indications for metabolic and bariatric surgery.', fuente: 'SOARD 2022;18(12):1345-1356', id: 'PMID 36280539' },
    { cita: 'Mechanick JI, et al. Clinical practice guidelines for the perioperative nutrition, metabolic, and nonsurgical support of patients undergoing bariatric procedures.', fuente: 'Obesity (Silver Spring) 2020;28(4):O1-O58', id: 'AACE/TOS/ASMBS/OMA/ASA 2019 Update' }
  ],
  sleeve: [
    { cita: 'Peterli R, et al. Effect of laparoscopic sleeve gastrectomy vs laparoscopic Roux-en-Y gastric bypass on weight loss in patients with morbid obesity: the SM-BOSS RCT.', fuente: 'JAMA 2018;319(3):255-265', id: 'PMID 29340679' },
    { cita: 'Salminen P, et al. Effect of laparoscopic sleeve gastrectomy vs laparoscopic Roux-en-Y gastric bypass on weight loss at 5 years among patients with morbid obesity: the SLEEVEPASS RCT.', fuente: 'JAMA 2018;319(3):241-254', id: 'PMID 29340676' }
  ],
  rygb: [
    { cita: 'Adams TD, et al. Weight and metabolic outcomes 12 years after gastric bypass.', fuente: 'N Engl J Med 2017;377:1143-1155', id: 'PMID 28930514' },
    { cita: 'Schauer PR, et al. Bariatric surgery versus intensive medical therapy for diabetes — 5-year outcomes (STAMPEDE).', fuente: 'N Engl J Med 2017;376:641-651', id: 'PMID 28199805' }
  ],
  dm2: [
    { cita: 'ElSayed NA, et al. Standards of Care in Diabetes — 2024. Obesity and weight management for the prevention and treatment of type 2 diabetes.', fuente: 'Diabetes Care 2024;47(Suppl 1):S145-S157', id: 'ADA 2024' },
    { cita: 'Aminian A, et al. Association of Metabolic Surgery With Major Adverse Cardiovascular Outcomes in Patients With Type 2 Diabetes and Obesity.', fuente: 'JAMA 2019;322(13):1271-1282', id: 'PMID 31475297' }
  ],
  hta_mafld: [
    { cita: 'Aminian A, et al. Association of Bariatric Surgery with Major Adverse Liver and Cardiovascular Outcomes in Patients with Biopsy-Proven NASH.', fuente: 'JAMA 2021;326(20):2031-2042', id: 'PMID 34762106' }
  ],
  cardio: [
    { cita: 'Doumouras AG, et al. Association between bariatric surgery and all-cause mortality.', fuente: 'JAMA Surgery 2020;155(5):e200432', id: 'PMID 32129813' },
    { cita: 'Sjöström L, et al. Effects of bariatric surgery on mortality in Swedish Obese Subjects.', fuente: 'N Engl J Med 2007;357:741-752', id: 'PMID 17715408' }
  ],
  aos: [
    { cita: 'Peromaa-Haavisto P, et al. Obstructive sleep apnea and bariatric surgery.', fuente: 'Obes Surg 2017;27(10):2620-2626', id: 'PMID 28439763' }
  ],
  erge: [
    { cita: 'Yeung KTD, et al. Does sleeve gastrectomy expose the distal esophagus to severe reflux?: a systematic review and meta-analysis.', fuente: 'Ann Surg 2020;271(2):257-265', id: 'PMID 30921053' }
  ],
  tev_caprini: [
    { cita: 'Caprini JA. Thrombosis risk assessment as a guide to quality patient care.', fuente: 'Dis Mon 2005;51(2-3):70-78', id: 'PMID 15900257' },
    { cita: 'ASMBS updated position statement on prophylactic measures to reduce the risk of venous thromboembolism in bariatric surgery patients.', fuente: 'SOARD 2013;9(4):493-497', id: 'ASMBS 2013' }
  ],
  osmrs: [
    { cita: 'DeMaria EJ, et al. Obesity Surgery Mortality Risk Score: proposal for a clinically useful score to predict mortality risk in patients undergoing gastric bypass.', fuente: 'SOARD 2007;3(2):134-140', id: 'PMID 17386394' }
  ],
  eoss: [
    { cita: 'Sharma AM, Kushner RF. A proposed clinical staging system for obesity.', fuente: 'Int J Obes (Lond) 2009;33(3):289-295', id: 'PMID 19188927' }
  ],
  farmacos: [
    { cita: 'Wilding JPH, et al. Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1).', fuente: 'N Engl J Med 2021;384:989-1002', id: 'PMID 33567185' },
    { cita: 'Jastreboff AM, et al. Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1).', fuente: 'N Engl J Med 2022;387:205-216', id: 'PMID 35658024' }
  ],
  eras: [
    { cita: 'Stenberg E, et al. Guidelines for perioperative care in bariatric surgery: Enhanced Recovery After Surgery (ERAS) Society recommendations: A 2021 update.', fuente: 'World J Surg 2022;46:729-751', id: 'PMID 34984504' }
  ]
};

const COMOR_LABEL = {
  hta:'Hipertensión arterial', tep:'Antecedente TEP/TVP', dm:'Diabetes mellitus',
  aos:'Apnea obstructiva del sueño', erge:'ERGE', tabaco:'Tabaquismo activo',
  ivc:'Insuficiencia venosa crónica', cardio:'Cardiopatía', erc:'Enfermedad renal crónica',
  acoag:'Anticoagulación crónica', disli:'Dislipidemia', iam:'IAM previo', ecv:'Enf. cerebrovascular'
};

function recomendacionTecnica(p){
  const i = imc(p);
  const c = p.comorbilidades || {};
  if (c.erge && p.procedimiento === 'sleeve') {
    return {
      proc: 'RYGB (gold standard antirreflujo)',
      motivo: 'ERGE documentado contraindica Manga Gástrica; RYGB tiene resolución de ERGE >85%.',
      evid: EVIDENCIA.erge
    };
  }
  if (c.dm && i >= 35) {
    return {
      proc: p.procedimiento || 'RYGB',
      motivo: 'DM2 con IMC ≥35: cirugía metabólica (RYGB o SADI-S) con mayor tasa de remisión glucémica que tratamiento médico intensivo.',
      evid: EVIDENCIA.dm2
    };
  }
  if (i >= 50) {
    return {
      proc: p.procedimiento || 'Según evaluación',
      motivo: 'IMC ≥50 (súper-obesidad): considerar puente farmacológico con GLP-1/tirzepatida o balón previo a cirugía definitiva para reducir riesgo perioperatorio.',
      evid: EVIDENCIA.farmacos
    };
  }
  return {
    proc: p.procedimiento ? (PROCS[p.procedimiento] || p.procedimiento) : 'Según evaluación',
    motivo: 'Indicación bariátrica establecida por ASMBS/IFSO 2022 con IMC ≥35 o ≥30 con comorbilidad metabólica.',
    evid: EVIDENCIA.indicaciones
  };
}

function resumenEvidencia(p){
  const i = imc(p);
  const c = p.comorbilidades || {};
  const items = [];
  // Indicación base
  items.push({
    titulo: 'Indicación de cirugía bariátrica',
    texto: `Las guías ASMBS/IFSO 2022 recomiendan cirugía bariátrica para pacientes con IMC ≥35 kg/m² (con o sin comorbilidad) o ≥30 kg/m² con enfermedad metabólica asociada (DM2, HTA, AOS, dislipidemia, MAFLD). Este paciente presenta IMC ${i.toFixed(1)} kg/m²${i>=35?' (cumple criterio de IMC)':i>=30?' y comorbilidades metabólicas que cumplen criterio':''}.`,
    refs: EVIDENCIA.indicaciones
  });
  // DM2
  if (c.dm) {
    items.push({
      titulo: 'Diabetes mellitus tipo 2',
      texto: 'La cirugía bariátrica/metabólica produce remisión de DM2 en 30–60% de los pacientes a 5 años, superior al tratamiento médico intensivo (STAMPEDE). Reduce eventos cardiovasculares mayores (MACE) y mortalidad cardiovascular (Aminian 2019). La ADA 2024 recomienda considerar cirugía metabólica en todo paciente con DM2 e IMC ≥35.',
      refs: [...EVIDENCIA.dm2, ...EVIDENCIA.rygb]
    });
  }
  // HTA
  if (c.hta) {
    items.push({
      titulo: 'Hipertensión arterial',
      texto: 'Se reporta remisión o mejoría de HTA en 60–75% de los pacientes postcirugía bariátrica a mediano plazo, con reducción de medicamentos antihipertensivos y eventos cardiovasculares.',
      refs: EVIDENCIA.cardio
    });
  }
  // AOS
  if (c.aos) {
    items.push({
      titulo: 'Apnea obstructiva del sueño',
      texto: 'Resolución o mejoría significativa de AOS en 75–85% de los pacientes (reducción IAH >50%), con mejoría de calidad de sueño y reducción del riesgo cardiovascular asociado.',
      refs: EVIDENCIA.aos
    });
  }
  // ERGE
  if (c.erge) {
    items.push({
      titulo: 'Enfermedad por reflujo gastroesofágico',
      texto: 'La Manga Gástrica puede exacerbar ERGE; en pacientes con ERGE documentado se prefiere RYGB, que resuelve o controla ERGE en más del 85% de los casos.',
      refs: EVIDENCIA.erge
    });
  }
  // TEV
  if (c.tep || c.acoag) {
    items.push({
      titulo: 'Profilaxis de tromboembolismo venoso',
      texto: 'El score de Caprini estratifica el riesgo de TEV; en bariatría se recomienda profilaxis mecánica + farmacológica perioperatoria y extendida 2–4 semanas en alto riesgo (ASMBS).',
      refs: EVIDENCIA.tev_caprini
    });
  }
  // Mortalidad
  items.push({
    titulo: 'Impacto en mortalidad global',
    texto: 'La cirugía bariátrica se asocia a una reducción de mortalidad por todas las causas cercana al 30% a mediano y largo plazo comparada con manejo no quirúrgico en poblaciones comparables (SOS, Doumouras 2020).',
    refs: EVIDENCIA.cardio
  });
  // ERAS
  items.push({
    titulo: 'Protocolo ERAS y seguridad',
    texto: 'El programa aplica el protocolo ERAS Society 2022 para cirugía bariátrica (analgesia multimodal, profilaxis TEV, movilización temprana, nutrición proactiva) que reduce estancia hospitalaria y complicaciones.',
    refs: EVIDENCIA.eras
  });
  return items;
}

export default function Modulo8(){
  const { t } = useLang();
  const [modo,setModo]=useState('clinico');
  const [pacientes,setPacientes]=useState([]);
  const [seleccionado,setSeleccionado]=useState(null);
  const [tab,setTab]=useState('paquete');
  const [cargando,setCargando]=useState(true);

  // Data cruzada de otros módulos
  const [medicos,setMedicos]=useState([]);
  const [seguimientos,setSeguimientos]=useState({});
  const [labs,setLabs]=useState({});
  const [evoluciones,setEvoluciones]=useState({});
  const [planNutri,setPlanNutri]=useState({});
  const [notasOp,setNotasOp]=useState({});
  const [altas,setAltas]=useState({});
  const [docsCare,setDocsCare]=useState([]);
  const [revisiones,setRevisiones]=useState({});
  const [segsConductual,setSegsConductual]=useState({});

  // Documentos personalizados del paciente
  const [docsPaciente,setDocsPaciente]=useState({}); // {[pacienteId]:[{id,nombre,dataUrl,tipo,size,categoria,fecha}]}
  const archivoRef = useRef(null);
  const [categoriaUpload,setCategoriaUpload]=useState('Informe médico');

  // Estado para envíos
  const [mensajeEnvio,setMensajeEnvio]=useState('');

  useEffect(()=>{(async()=>{
    try {
      setPacientes((await storageGet('avante_pacientes'))||[]);
      setMedicos((await storageGet('avante_medicos'))||[]);
      setSeguimientos((await storageGet('avante_seguimientos'))||{});
      setLabs((await storageGet('avante_labs'))||{});
      setEvoluciones((await storageGet('avante_evoluciones'))||{});
      setPlanNutri((await storageGet('avante_plan_nutri'))||{});
      setNotasOp((await storageGet('avante_notas_op'))||{});
      setAltas((await storageGet('avante_altas'))||{});
      setDocsCare((await storageGet('avante_care_docs'))||[]);
      setRevisiones((await storageGet('avante_revisiones'))||{});
      setSegsConductual((await storageGet('avante_seg_conductual'))||{});
      setDocsPaciente((await storageGet('avante_docs_paciente'))||{});
    }catch(e){}
    setCargando(false);
  })();},[]);

  const medicoDe = (p) => {
    if(!p) return null;
    if(p.medicoId) return medicos.find(m=>m.id===p.medicoId)||null;
    if(p.medico) return medicos.find(m=>m.nombre===p.medico)||null;
    return null;
  };

  // ===== PDFs dinámicos =====
  const pdfResumenClinico = (p) => {
    const doc = medicoDe(p);
    const segs = seguimientos[p.id] || [];
    const lb = labs[p.id] || [];
    const evs = evoluciones[p.id] || [];
    const notaOp = notasOp[p.id] || null;
    const alta = altas[p.id] || null;
    const revs = revisiones[p.id] || [];
    const segsCond = segsConductual[p.id] || [];
    const hc = p.historiaClinica || {};
    const comors = Object.entries(p.comorbilidades||{}).filter(([,v])=>v).map(([k])=>COMOR_LABEL[k]||k);
    const historiaLineas = [
      hc.motivo && `Motivo de consulta: ${hc.motivo}`,
      hc.padecimientoActual && `Padecimiento actual: ${hc.padecimientoActual}`,
      hc.antFamiliares && `Antecedentes heredofamiliares: ${hc.antFamiliares}`,
      hc.antPatologicos && `Antecedentes patológicos: ${hc.antPatologicos}`,
      hc.antNoPatologicos && `Antecedentes no patológicos: ${hc.antNoPatologicos}`,
      hc.antGinecoObs && `Antecedentes gineco-obstétricos: ${hc.antGinecoObs}`,
      hc.medicamentos && `Medicamentos: ${hc.medicamentos}`,
      hc.alergias && `Alergias: ${hc.alergias}`,
      hc.habitos && `Hábitos: ${hc.habitos}`,
      hc.revisionSistemas && `Revisión por sistemas: ${hc.revisionSistemas}`,
      hc.examenFisico && `Exploración física: ${hc.examenFisico}`,
      hc.planImpresion && `Impresión y plan: ${hc.planImpresion}`,
      hc.notas && `Notas: ${hc.notas}`
    ].filter(Boolean);

    const secciones = [
      { titulo:'Identificación del paciente', lineas:[
        `Expediente: #${p.expediente||'—'}`,
        `Nombre: ${p.nombre||''} ${p.apellido||''}`,
        `Edad: ${p.edad||'—'} años · Sexo: ${p.sexo||'—'}`,
        `Teléfono: ${p.telefono||'—'} · Email: ${p.email||'—'}`,
        `Médico tratante: ${doc?.nombre||p.medico||'—'}${doc?.especialidad?' · '+doc.especialidad:''}`,
        `JVPM médico: ${doc?.jvpm||'—'} · NUE médico: ${doc?.nue||'—'}`
      ]},
      { titulo:'Datos antropométricos', lineas:[
        `Peso: ${p.peso||'—'} kg · Talla: ${p.talla||'—'} cm · IMC: ${imc(p).toFixed(1)} kg/m²`,
        `Clasificación IMC: ${imc(p)>=40?'Obesidad grado III':imc(p)>=35?'Obesidad grado II':imc(p)>=30?'Obesidad grado I':imc(p)>=25?'Sobrepeso':'Normal'}`
      ]},
      { titulo:'Comorbilidades activas', lineas: comors.length?comors:['Ninguna documentada'] },
      ...(historiaLineas.length?[{titulo:'Historia clínica completa', lineas: historiaLineas}]:[]),
      { titulo:'Procedimiento propuesto o realizado', lineas:[
        PROCS[p.procedimiento]||p.procedimiento||'—',
        `ASA: ${p.asa||'—'} · Estado funcional: ${p.funcional||'—'}`,
        `EOSS: metabólico ${p.eossMetabolico||0} · mecánico ${p.eossMecanico||0} · psicosocial ${p.eossPsico||0}`
      ]},
      ...(notaOp?[{titulo:'Nota operatoria (resumen)', lineas:[
        `Fecha de cirugía: ${notaOp.fechaCirugia||'—'}`,
        `Cirujano 1: ${notaOp.cirujano||'—'} · Cirujano 2: ${notaOp.cirujano2||'—'} · Cirujano 3: ${notaOp.cirujano3||'—'}`,
        `Anestesiólogo: ${notaOp.anestesiologo||'—'}`,
        `Hallazgos: ${(notaOp.hallazgos||'').slice(0,300)}`,
        `Sangrado: ${notaOp.sangrado||'—'} mL · Complicaciones: ${notaOp.complicaciones||'Ninguna'}`
      ]}]:[]),
      ...(alta?[{titulo:'Egreso hospitalario', lineas:[
        `Fecha de egreso: ${alta.fechaEgreso||'—'}`,
        `Indicaciones: ${(alta.indicaciones||'').slice(0,400)}`,
        `Firma: ${alta.firmaMedico||'—'}`
      ]}]:[]),
      ...(segs.length?[{titulo:'Evolución ponderal', lineas: segs.map(s=>`${s.hito||'—'} · ${fmtFechaHora(s.fecha)} · ${s.peso} kg`)}]:[]),
      ...(lb.length?[{titulo:'Laboratorios registrados', lineas: lb.map(l=>`${l.tipo||'—'} · ${fmtFechaHora(l.fecha)}${l.archivoNombre?' · '+l.archivoNombre:''}`)}]:[]),
      ...(evs.length?[{titulo:'Evolución clínica (últimas notas)', lineas: evs.slice(-5).map(e=>`${fmtFechaHora(e.fecha)}${e.firmadoPor?' · '+e.firmadoPor:''} — ${(e.texto||'').slice(0,200)}`)}]:[]),
      ...(segsCond.length?[{titulo:'Seguimiento conductual', lineas: segsCond.map(s=>`${s.hito} · ${fmtFechaHora(s.fecha)} · BES ${s.bes||'—'} · BDI ${s.bdi||'—'} · GAD-7 ${s.gad7||'—'}`)}]:[]),
      ...(revs.length?[{titulo:'Cirugías de revisión', lineas: revs.map(r=>`${fmtFechaHora(r.fecha)} · ${r.tipo}${r.nota?' · '+r.nota:''}`)}]:[])
    ];
    return exportarPDF({
      titulo:'Resumen Clínico Integral',
      subtitulo:`Exp #${p.expediente||'—'} · ${p.nombre||''} ${p.apellido||''}`,
      secciones,
      footer:'Avante Complejo Hospitalario · Módulo 8 · Paquete para el paciente'
    });
  };

  const pdfEvidenciaCientifica = (p) => {
    const items = resumenEvidencia(p);
    const rec = recomendacionTecnica(p);
    const doc = medicoDe(p);
    const secciones = [
      { titulo:'Paciente y procedimiento indicado', lineas:[
        `${p.nombre||''} ${p.apellido||''} · ${p.edad||'—'} años · ${p.sexo||'—'}`,
        `IMC ${imc(p).toFixed(1)} kg/m² · Médico tratante: ${doc?.nombre||p.medico||'—'}`,
        `Procedimiento recomendado: ${rec.proc}`,
        `Fundamento: ${rec.motivo}`
      ]},
      { titulo:'Resumen de evidencia científica aplicada al caso', lineas: items.map(it=>`• ${it.titulo} — ${it.texto}`) },
      { titulo:'Referencias (con DOI / PubMed ID)', lineas: items.flatMap(it=>it.refs.map(r=>`${r.cita} ${r.fuente} · ${r.id}`)) },
      { titulo:'Nota de uso', lineas:[
        'Este documento sintetiza la evidencia científica actualizada que respalda la indicación terapéutica para este paciente en específico.',
        'Puede ser utilizado como soporte técnico para solicitudes de autorización a aseguradoras, juntas de vigilancia profesional o revisión por pares.',
        'Las referencias citadas están indexadas en PubMed/MEDLINE y corresponden a guías internacionales vigentes (ASMBS, IFSO, ADA, ERAS, AACE).'
      ]}
    ];
    return exportarPDF({
      titulo:'Respaldo Científico Personalizado',
      subtitulo:`Evidencia y referencias · ${p.nombre||''} ${p.apellido||''}`,
      secciones,
      footer:'Avante Complejo Hospitalario · Módulo 8 · Soporte para aseguradora'
    });
  };

  // ===== Subida de documentos personalizados =====
  const subirDocumento = async (file) => {
    if(!file||!seleccionado) return;
    try {
      const r = await leerArchivoDataURL(file, 10*1024*1024);
      const nuevo = {
        id: Date.now().toString(),
        nombre: r.name,
        dataUrl: r.dataUrl,
        tipo: file.type,
        size: file.size,
        categoria: categoriaUpload,
        fecha: new Date().toISOString()
      };
      const lista = docsPaciente[seleccionado.id]||[];
      const actualizado = {...docsPaciente, [seleccionado.id]:[...lista, nuevo]};
      setDocsPaciente(actualizado);
      await storageSet('avante_docs_paciente', actualizado);
    }catch(e){ alert(e.message); }
  };
  const eliminarDocumento = async (id) => {
    const lista = (docsPaciente[seleccionado.id]||[]).filter(d=>d.id!==id);
    const actualizado = {...docsPaciente, [seleccionado.id]:lista};
    setDocsPaciente(actualizado);
    await storageSet('avante_docs_paciente', actualizado);
  };
  const descargarDoc = (d) => {
    const a = document.createElement('a');
    a.href = d.dataUrl;
    a.download = d.nombre;
    a.click();
  };

  // ===== Envío =====
  const enviarPDFPorCanal = async (canal, pdfFn, nombreArchivo, asunto, mensaje) => {
    if(!seleccionado) return;
    const pdf = pdfFn();
    if(canal==='wa'){
      if(!seleccionado.telefono){ alert('El paciente no tiene teléfono registrado'); return; }
      await enviarPDFWhatsApp(pdf, nombreArchivo, seleccionado.telefono, mensaje);
    } else if(canal==='email'){
      if(!seleccionado.email){ alert('El paciente no tiene email registrado'); return; }
      await enviarPDFEmail(pdf, nombreArchivo, seleccionado.email, asunto, mensaje);
    }
  };

  const enviarDocumento = (canal, d) => {
    if(!seleccionado) return;
    const msg = mensajeEnvio || `Hola ${seleccionado.nombre||''}, le envío el documento "${d.nombre}" desde Avante Complejo Hospitalario.`;
    if(canal==='wa'){
      if(!seleccionado.telefono){ alert('Sin teléfono'); return; }
      shareWhatsApp(seleccionado.telefono, `${msg}\n\n(Descargar y reenviar el archivo adjunto desde este dispositivo.)`);
      descargarDoc(d);
    } else if(canal==='email'){
      if(!seleccionado.email){ alert('Sin email'); return; }
      shareEmail(seleccionado.email, `Avante · ${d.nombre}`, `${msg}\n\nEl archivo se descargará en su dispositivo y debe adjuntarse en este correo antes de enviar.`);
      descargarDoc(d);
    }
  };

  // Construir paquete completo (zip-like sin lib: descarga todos uno a uno + resumen + evidencia)
  const enviarPaqueteCompleto = async (canal) => {
    if(!seleccionado) return;
    const nombre = `Avante_paciente_${seleccionado.nombre||''}`.replace(/\s+/g,'_');
    const asunto = `Paquete clínico Avante · ${seleccionado.nombre||''}`;
    const msg = mensajeEnvio || `Hola ${seleccionado.nombre||''}, le comparto su paquete clínico Avante: resumen clínico completo y respaldo científico personalizado. — Equipo Avante`;
    // Descarga local de resumen + evidencia + documentos personales para que el paciente los adjunte
    const pdfResumen = pdfResumenClinico(seleccionado);
    const pdfEvid = pdfEvidenciaCientifica(seleccionado);
    descargarPDF(pdfResumen, `${nombre}_resumen_clinico`);
    descargarPDF(pdfEvid, `${nombre}_evidencia_cientifica`);
    (docsPaciente[seleccionado.id]||[]).forEach(d=>descargarDoc(d));
    if(canal==='wa'){
      if(!seleccionado.telefono){ alert('Sin teléfono'); return; }
      shareWhatsApp(seleccionado.telefono, msg + '\n\n(Adjunte en WhatsApp los archivos descargados en su dispositivo.)');
    } else if(canal==='email'){
      if(!seleccionado.email){ alert('Sin email'); return; }
      shareEmail(seleccionado.email, asunto, msg + '\n\nLos archivos se descargaron localmente. Adjúntelos a este correo antes de enviar.');
    }
  };

  const btn="px-4 py-2 rounded font-medium transition-colors";
  if(cargando) return <div className="p-8 text-center">Cargando...</div>;

  const misDocs = seleccionado ? (docsPaciente[seleccionado.id]||[]) : [];
  const recTec = seleccionado ? recomendacionTecnica(seleccionado) : null;
  const itemsEvid = seleccionado ? resumenEvidencia(seleccionado) : [];

  return (
    <div className="min-h-screen p-4" style={{background:'#f3f4f6', fontFamily:'system-ui, sans-serif'}}>
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div style={{background:C.navy, color:'white'}} className="p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 style={{fontFamily:'Georgia,serif', color:C.gold}} className="text-3xl font-bold">Avante Complejo Hospitalario</h1>
              <p style={{fontFamily:'Georgia,serif'}} className="text-sm italic mt-1">{t('app.lema')}</p>
              <p className="text-xs mt-2 opacity-80">{t('modulo')} 8 · {t('mod.8.titulo')}</p>
            </div>
            <div className="flex gap-2">
              {[{id:'clinico',i:Activity,k:'modo.clinico'},{id:'academico',i:GraduationCap,k:'modo.academico'},{id:'paciente',i:Heart,k:'modo.paciente'}].map(m=>{
                const I=m.i;
                return <button key={m.id} onClick={()=>setModo(m.id)} className={btn+" flex items-center gap-2 text-sm"}
                  style={{background:modo===m.id?C.teal:'rgba(255,255,255,0.1)', color:'white'}}><I size={16}/>{t(m.k)}</button>;
              })}
            </div>
          </div>
        </div>

        <div className="p-6">
          {!seleccionado ? (
            <div>
              <h2 className="font-bold mb-3 flex items-center gap-2" style={{color:C.navy}}><Users size={20}/>Seleccione paciente</h2>
              {pacientes.length===0 ? (
                <div className="p-8 text-center rounded" style={{background:C.cream}}>
                  <p className="text-gray-600">No hay pacientes guardados. Cree uno en el Módulo 1 primero.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pacientes.map(p=>(
                    <button key={p.id} onClick={()=>setSeleccionado(p)} className="w-full p-3 border rounded text-left hover:shadow flex justify-between items-center">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-center bg-gray-50 flex-shrink-0" style={{borderColor:C.gold}}>
                          {p.foto ? <img src={p.foto} alt="" className="w-full h-full object-cover"/> : <Users size={16} color="#9ca3af"/>}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold" style={{color:C.navy}}>{(p.nombre||'Sin nombre')+' '+(p.apellido||'')}</div>
                          <div className="text-xs text-gray-600">{p.edad||'—'}a · IMC {imc(p).toFixed(1)} · {PROCS[p.procedimiento]||'—'}</div>
                        </div>
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
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center bg-white flex-shrink-0" style={{borderColor:C.gold}}>
                    {seleccionado.foto ? <img src={seleccionado.foto} alt="" className="w-full h-full object-cover"/> : <Users size={18} color="#9ca3af"/>}
                  </div>
                  <div>
                    <div className="font-bold" style={{color:C.navy}}>{seleccionado.nombre} {seleccionado.apellido}</div>
                    <div className="text-xs text-gray-600">Exp #{seleccionado.expediente||'—'} · IMC {imc(seleccionado).toFixed(1)} · {PROCS[seleccionado.procedimiento]||'—'}</div>
                  </div>
                </div>
                <button onClick={()=>setSeleccionado(null)} className={btn+" text-sm"} style={{background:'#e5e7eb'}}>Cambiar paciente</button>
              </div>

              <div className="flex gap-1 mb-4 border-b overflow-x-auto">
                {[
                  {id:'paquete', i:FileDown, l:'Paquete para paciente'},
                  {id:'resumen', i:Stethoscope, l:'Resumen clínico'},
                  {id:'evidencia', i:BookMarked, l:'Evidencia científica'},
                  {id:'docs', i:FileText, l:'Documentos personales'}
                ].map(tb=>{
                  const I=tb.i;
                  return <button key={tb.id} onClick={()=>setTab(tb.id)} className="px-3 py-2 flex items-center gap-1 text-sm font-medium border-b-2 whitespace-nowrap"
                    style={{borderColor:tab===tb.id?C.gold:'transparent', color:tab===tb.id?C.navy:'#6b7280'}}><I size={14}/>{tb.l}</button>;
                })}
              </div>

              {/* === PAQUETE === */}
              {tab==='paquete' && (
                <div className="space-y-4">
                  <div className="p-3 rounded border-l-4" style={{borderColor:C.gold, background:C.cream}}>
                    <div className="flex items-start gap-2">
                      <Info size={18} style={{color:C.gold, flexShrink:0, marginTop:2}}/>
                      <div className="text-sm text-gray-700">
                        <strong style={{color:C.navy}}>Paquete completo para el paciente</strong>
                        <p className="mt-1">Genera y envía toda la documentación del paciente: resumen clínico integral, respaldo científico con referencias, y cualquier documento personalizado que se haya cargado.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold" style={{color:C.navy}}>Mensaje que se enviará (WhatsApp o email)</label>
                    <textarea rows={3} value={mensajeEnvio} onChange={e=>setMensajeEnvio(e.target.value)}
                      placeholder={`Hola ${seleccionado.nombre||''}, le comparto su paquete clínico Avante.`}
                      className="w-full px-3 py-2 rounded border text-sm"/>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button onClick={()=>enviarPaqueteCompleto('wa')} disabled={!seleccionado.telefono}
                      className={btn+" text-white flex items-center justify-center gap-2"} style={{background:'#25D366', opacity: seleccionado.telefono?1:0.5}}>
                      <MessageCircle size={16}/> Enviar paquete por WhatsApp
                    </button>
                    <button onClick={()=>enviarPaqueteCompleto('email')} disabled={!seleccionado.email}
                      className={btn+" text-white flex items-center justify-center gap-2"} style={{background:'#1a73e8', opacity: seleccionado.email?1:0.5}}>
                      <Mail size={16}/> Enviar paquete por email
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 italic">Los archivos PDF se descargan en su dispositivo; WhatsApp Web/App y el cliente de correo abren una ventana prellenada donde debe adjuntarlos antes de enviar.</p>

                  <div className="pt-3 border-t">
                    <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Descargas individuales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <button onClick={()=>descargarPDF(pdfResumenClinico(seleccionado), `Avante_resumen_${(seleccionado.nombre||'')}`)}
                        className={btn+" text-white text-sm flex items-center gap-2"} style={{background:C.teal}}>
                        <Download size={14}/> Resumen clínico integral (PDF)
                      </button>
                      <button onClick={()=>descargarPDF(pdfEvidenciaCientifica(seleccionado), `Avante_evidencia_${(seleccionado.nombre||'')}`)}
                        className={btn+" text-white text-sm flex items-center gap-2"} style={{background:C.gold}}>
                        <BookMarked size={14}/> Respaldo científico (PDF)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* === RESUMEN === */}
              {tab==='resumen' && (
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={()=>descargarPDF(pdfResumenClinico(seleccionado), `Avante_resumen_${(seleccionado.nombre||'')}`)}
                      className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}>
                      <Download size={14}/> PDF
                    </button>
                    <button onClick={()=>enviarPDFPorCanal('wa', ()=>pdfResumenClinico(seleccionado), `Avante_resumen_${(seleccionado.nombre||'')}`, 'Resumen clínico Avante', `Hola ${seleccionado.nombre||''}, le comparto su resumen clínico Avante.`)}
                      className={btn+" text-white text-sm flex items-center gap-1"} style={{background:'#25D366'}}>
                      <MessageCircle size={14}/> WhatsApp
                    </button>
                    <button onClick={()=>enviarPDFPorCanal('email', ()=>pdfResumenClinico(seleccionado), `Avante_resumen_${(seleccionado.nombre||'')}`, 'Resumen clínico Avante', `Hola ${seleccionado.nombre||''}, le comparto su resumen clínico Avante.`)}
                      className={btn+" text-white text-sm flex items-center gap-1"} style={{background:'#1a73e8'}}>
                      <Mail size={14}/> Email
                    </button>
                  </div>
                  <div className="p-3 rounded border text-sm space-y-2" style={{background:'white', borderColor:'#e5e7eb'}}>
                    <div className="font-bold" style={{color:C.navy}}>Identificación</div>
                    <div className="text-xs text-gray-700">
                      Exp #{seleccionado.expediente||'—'} · {seleccionado.nombre||''} {seleccionado.apellido||''} · {seleccionado.edad||'—'}a · {seleccionado.sexo||'—'} · IMC {imc(seleccionado).toFixed(1)} · {PROCS[seleccionado.procedimiento]||'—'}
                    </div>
                    <div className="font-bold mt-2" style={{color:C.navy}}>Comorbilidades</div>
                    <div className="text-xs text-gray-700">
                      {Object.entries(seleccionado.comorbilidades||{}).filter(([,v])=>v).map(([k])=>COMOR_LABEL[k]||k).join(' · ')||'Ninguna registrada'}
                    </div>
                    <div className="font-bold mt-2" style={{color:C.navy}}>Datos cruzados de otros módulos</div>
                    <ul className="text-xs text-gray-700 list-disc pl-5 space-y-0.5">
                      <li>{(seguimientos[seleccionado.id]||[]).length} control(es) ponderal(es) · {(labs[seleccionado.id]||[]).length} laboratorio(s)</li>
                      <li>{(evoluciones[seleccionado.id]||[]).length} nota(s) de evolución · {(segsConductual[seleccionado.id]||[]).length} seguimiento(s) conductual(es)</li>
                      <li>{(revisiones[seleccionado.id]||[]).length} registro(s) de cirugía de revisión</li>
                      <li>Nota operatoria: {notasOp[seleccionado.id]?'registrada':'no registrada'} · Egreso: {altas[seleccionado.id]?'registrado':'no registrado'}</li>
                    </ul>
                    <div className="text-xs italic text-gray-500 mt-2">Descargue el PDF para obtener el resumen completo con historia clínica, labs y detalles.</div>
                  </div>
                </div>
              )}

              {/* === EVIDENCIA === */}
              {tab==='evidencia' && (
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={()=>descargarPDF(pdfEvidenciaCientifica(seleccionado), `Avante_evidencia_${(seleccionado.nombre||'')}`)}
                      className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}>
                      <Download size={14}/> PDF
                    </button>
                    <button onClick={()=>enviarPDFPorCanal('wa', ()=>pdfEvidenciaCientifica(seleccionado), `Avante_evidencia_${(seleccionado.nombre||'')}`, 'Respaldo científico Avante', `Adjunto respaldo científico personalizado para ${seleccionado.nombre||''}.`)}
                      className={btn+" text-white text-sm flex items-center gap-1"} style={{background:'#25D366'}}>
                      <MessageCircle size={14}/> WhatsApp
                    </button>
                    <button onClick={()=>enviarPDFPorCanal('email', ()=>pdfEvidenciaCientifica(seleccionado), `Avante_evidencia_${(seleccionado.nombre||'')}`, 'Respaldo científico Avante', `Adjunto respaldo científico personalizado para ${seleccionado.nombre||''}.`)}
                      className={btn+" text-white text-sm flex items-center gap-1"} style={{background:'#1a73e8'}}>
                      <Mail size={14}/> Email
                    </button>
                  </div>

                  <div className="p-3 rounded border-l-4" style={{borderColor:C.teal, background:C.cream}}>
                    <div className="text-xs italic" style={{color:C.navy}}>
                      Procedimiento recomendado: <strong>{recTec.proc}</strong>
                    </div>
                    <div className="text-xs text-gray-700 mt-1">{recTec.motivo}</div>
                  </div>

                  <div className="space-y-3">
                    {itemsEvid.map((it,i)=>(
                      <div key={i} className="p-3 rounded border" style={{borderColor:'#e5e7eb', background:'white'}}>
                        <div className="font-bold text-sm" style={{color:C.navy}}>{it.titulo}</div>
                        <div className="text-xs text-gray-700 mt-1">{it.texto}</div>
                        {modo!=='paciente' && (
                          <ul className="text-xs text-gray-600 mt-2 space-y-1">
                            {it.refs.map((r,j)=>(
                              <li key={j}>
                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] mr-1" style={{background:C.gold+'30', color:C.navy}}>{r.id}</span>
                                {r.cita} <em>{r.fuente}</em>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 italic">Las referencias citadas están indexadas en PubMed/MEDLINE y corresponden a guías internacionales vigentes (ASMBS, IFSO, ADA, ERAS, AACE).</p>
                </div>
              )}

              {/* === DOCUMENTOS PERSONALES === */}
              {tab==='docs' && (
                <div className="space-y-3">
                  <div className="p-3 rounded border" style={{background:C.cream, borderColor:C.teal}}>
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{color:C.navy}}><Upload size={14}/>Cargar documento personalizado</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs">Categoría</label>
                        <select value={categoriaUpload} onChange={e=>setCategoriaUpload(e.target.value)} className="w-full px-2 py-1 rounded border text-sm">
                          <option>Informe médico</option>
                          <option>Plan nutricional</option>
                          <option>Plan de ejercicio</option>
                          <option>Indicaciones postoperatorias</option>
                          <option>Resultados de laboratorio</option>
                          <option>Estudios de imagen</option>
                          <option>Consentimiento informado</option>
                          <option>Factura / cotización</option>
                          <option>Otro</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs">Archivo (PDF/imagen, máx 10 MB)</label>
                        <input ref={archivoRef} type="file" accept=".pdf,image/*,.doc,.docx,.xls,.xlsx"
                          onChange={e=>{ subirDocumento(e.target.files?.[0]); if(archivoRef.current) archivoRef.current.value=''; }}
                          className="w-full px-2 py-1 text-sm"/>
                      </div>
                    </div>
                  </div>

                  {misDocs.length===0 ? (
                    <p className="text-sm text-gray-500 italic text-center py-6">Sin documentos personalizados. Cargue informes, planes y estudios específicos para este paciente.</p>
                  ) : (
                    <div className="space-y-2">
                      {misDocs.map(d=>(
                        <div key={d.id} className="p-3 border rounded flex flex-wrap justify-between items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm" style={{color:C.navy}}>{d.nombre}</div>
                            <div className="text-xs text-gray-600">
                              <span className="px-1.5 py-0.5 rounded text-[10px] mr-1" style={{background:C.gold+'30', color:C.navy}}>{d.categoria}</span>
                              {fmtFechaHora(d.fecha)} · {(d.size/1024).toFixed(0)} KB
                            </div>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            <button onClick={()=>descargarDoc(d)} title="Descargar" className="p-1.5 rounded text-white" style={{background:C.teal}}><Download size={14}/></button>
                            {seleccionado.telefono && <button onClick={()=>enviarDocumento('wa', d)} title="Enviar por WhatsApp" className="p-1.5 rounded text-white" style={{background:'#25D366'}}><MessageCircle size={14}/></button>}
                            {seleccionado.email && <button onClick={()=>enviarDocumento('email', d)} title="Enviar por email" className="p-1.5 rounded text-white" style={{background:'#1a73e8'}}><Mail size={14}/></button>}
                            <button onClick={()=>eliminarDocumento(d.id)} title="Eliminar" className="p-1.5 rounded text-red-600 hover:bg-red-50"><Trash2 size={14}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
