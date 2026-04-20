import React, { useState, useEffect } from 'react';
import { Activity, GraduationCap, Heart, Users, Calendar, Apple, AlertOctagon, TrendingDown, ChevronRight, CheckCircle2, AlertCircle, AlertTriangle, Download, Plus, FlaskConical, Upload, FileText, Trash2, Share2, Mail, ClipboardList, Save, Square, CheckSquare, Pill as PillIcon } from 'lucide-react';
import { exportarPDF, descargarPDF, enviarPDFWhatsApp, enviarPDFEmail, storageGet, storageSet, leerArchivoDataURL, fmtFechaHora } from './src_shared/utils.js';
import { useLang } from './src_shared/i18n.jsx';

const C = { navy:'#0A1F44', teal:'#1A8B9D', gold:'#C9A961', cream:'#FAF7F2', green:'#2D8659', yellow:'#E0A82E', red:'#C0392B' };
const PROCS = { sleeve:'Manga Gástrica', rygb:'RYGB', oagb:'OAGB', sadis:'SADI-S', bpdds:'BPD-DS', balon:'Balón intragástrico', rev_sg_rygb:'Rev. Manga→RYGB', rev_sg_oagb:'Rev. Manga→OAGB' };

function imc(p){const pe=parseFloat(p.peso),t=parseFloat(p.talla)/100;return (pe&&t)?pe/(t*t):0;}
function nowLocalInput(){const d=new Date();const off=d.getTimezoneOffset();return new Date(d.getTime()-off*60000).toISOString().slice(0,16);}
function fmtFH(iso){return fmtFechaHora(iso);}

const LAB_PARAMS = [
  {k:'hb',l:'Hemoglobina',u:'g/dL',min:12,max:17},
  {k:'hcto',l:'Hematocrito',u:'%',min:36,max:50},
  {k:'glucosa',l:'Glucosa',u:'mg/dL',min:70,max:100},
  {k:'hba1c',l:'HbA1c',u:'%',min:4,max:5.7},
  {k:'creatinina',l:'Creatinina',u:'mg/dL',min:0.6,max:1.2},
  {k:'albumina',l:'Albúmina',u:'g/dL',min:3.5,max:5},
  {k:'ferritina',l:'Ferritina',u:'ng/mL',min:30,max:300},
  {k:'hierro',l:'Hierro sérico',u:'µg/dL',min:60,max:170},
  {k:'b12',l:'Vitamina B12',u:'pg/mL',min:200,max:900},
  {k:'folico',l:'Ácido fólico',u:'ng/mL',min:3,max:20},
  {k:'vitd',l:'Vitamina D',u:'ng/mL',min:30,max:80},
  {k:'pth',l:'PTH',u:'pg/mL',min:15,max:65},
  {k:'calcio',l:'Calcio',u:'mg/dL',min:8.5,max:10.5},
  {k:'zinc',l:'Zinc',u:'µg/dL',min:70,max:120},
  {k:'colesterol',l:'Colesterol total',u:'mg/dL',min:0,max:200},
  {k:'tg',l:'Triglicéridos',u:'mg/dL',min:0,max:150}
];

function GraficaLab({datos, param}){
  if(!datos || datos.length<1) return <div className="text-xs text-gray-500 text-center py-4">Sin datos para graficar</div>;
  const valores = datos.filter(d => d.valores && d.valores[param.k] !== '' && d.valores[param.k] != null).map(d => ({fecha:d.fecha, v: parseFloat(d.valores[param.k])})).filter(d => !isNaN(d.v));
  if(valores.length===0) return <div className="text-xs text-gray-500 text-center py-4">Sin valores de {param.l}</div>;
  const W=520, H=160, P=30;
  const vs = valores.map(v=>v.v);
  const allMin = Math.min(...vs, param.min);
  const allMax = Math.max(...vs, param.max);
  const range = (allMax-allMin)||1;
  const yMin = allMin - range*0.1;
  const yMax = allMax + range*0.1;
  const x = i => P + (i*(W-2*P))/Math.max(1,valores.length-1);
  const y = v => H - P - ((v-yMin)/(yMax-yMin))*(H-2*P);
  const path = valores.map((v,i)=>(i===0?'M':'L')+x(i)+','+y(v.v)).join(' ');
  const yMinRef = y(param.min), yMaxRef = y(param.max);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{maxHeight:200}}>
      <rect x="0" y="0" width={W} height={H} fill="#FAF7F2"/>
      <rect x={P} y={Math.min(yMaxRef,yMinRef)} width={W-2*P} height={Math.abs(yMinRef-yMaxRef)} fill="#2D8659" opacity="0.12"/>
      <line x1={P} y1={yMinRef} x2={W-P} y2={yMinRef} stroke="#2D8659" strokeDasharray="3,3" strokeWidth="1"/>
      <line x1={P} y1={yMaxRef} x2={W-P} y2={yMaxRef} stroke="#2D8659" strokeDasharray="3,3" strokeWidth="1"/>
      <path d={path} fill="none" stroke="#1A8B9D" strokeWidth="2"/>
      {valores.map((v,i)=>{
        const fuera = v.v<param.min || v.v>param.max;
        return <g key={i}>
          <circle cx={x(i)} cy={y(v.v)} r="4" fill={fuera?'#C0392B':'#1A8B9D'}/>
          <text x={x(i)} y={y(v.v)-8} fontSize="9" textAnchor="middle" fill="#0A1F44">{v.v}</text>
          <text x={x(i)} y={H-8} fontSize="8" textAnchor="middle" fill="#6b7280">{new Date(v.fecha).toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit'})}</text>
        </g>;
      })}
      <text x={5} y={15} fontSize="10" fill="#0A1F44" fontWeight="bold">{param.l} ({param.u})</text>
      <text x={5} y={H-2} fontSize="8" fill="#6b7280">Ref: {param.min}-{param.max}</text>
    </svg>
  );
}
function pep(pesoIni,pesoAct,talla){const pi=parseFloat(pesoIni),pa=parseFloat(pesoAct),t=parseFloat(talla)/100;if(!pi||!pa||!t)return 0;const pIdeal=25*t*t;const exceso=pi-pIdeal;if(exceso<=0)return 0;return ((pi-pa)/exceso)*100;}
function ptp(pesoIni,pesoAct){const pi=parseFloat(pesoIni),pa=parseFloat(pesoAct);if(!pi||!pa)return 0;return ((pi-pa)/pi)*100;}

const DIETA_D1_DEFAULT = [
  '06:00 · Agua tibia 30 mL',
  '08:00 · Agua + electrolitos 30 mL + tiamina 100 mg IV',
  '10:00 · Caldo desgrasado 30 mL (sorbos lentos, 15 min)',
  '12:00 · Gelatina sin azúcar 30 mL + té sin azúcar',
  '14:00 · Agua 30 mL + paracetamol 1 g IV si dolor',
  '16:00 · Caldo vegetal colado 30 mL',
  '18:00 · Jugo natural sin azúcar, colado, 30 mL',
  '20:00 · Agua + gelatina 30 mL',
  'NOTA: líquidos claros a sorbos, 30 mL c/15 min. Sonda vesical "se retira si la hubiese" (nuestro equipo no la usa de rutina).'
];

// ======= INDICACIONES POSTOP TEMPRANO (marcables con ID) =======
const TEMPRANO = [
  {h:'24h · Indicaciones postoperatorias', items:[
    { id:'p24_svitales', txt:'Signos vitales c/2h primeras 6h, luego c/4h · FC, PA, FR, SpO₂, temperatura, dolor EVA' },
    { id:'p24_o2', txt:'Oxígeno suplementario por puntas nasales 2-3 L/min hasta SpO₂≥94% en aire ambiente' },
    { id:'p24_fowler', txt:'Decúbito semi-Fowler (30°) para reducir riesgo de aspiración y fuga' },
    { id:'p24_deamb', txt:'Movilización activa asistida a las 4-6h post-op, sedestación a las 6-8h, bipedestación progresiva' },
    { id:'p24_incent', txt:'Espirometría incentiva c/1h mientras despierto · fisioterapia respiratoria 3x/día' },
    { id:'p24_ccn', txt:'Medias de compresión + CCN continua hasta deambulación plena' },
    { id:'p24_hbpm', txt:'HBPM profiláctica (ver apartado HBPM por peso) iniciando 6-12h post-op' },
    { id:'p24_ibp', txt:'IBP IV (omeprazol 40 mg c/12h o pantoprazol 40 mg c/24h)' },
    { id:'p24_analg', txt:'Analgesia multimodal: paracetamol 1 g IV c/6h + ketorolaco 30 mg IV c/8h (si función renal normal) + bloqueo TAP o visceral autonómico realizado' },
    { id:'p24_noopio', txt:'Evitar opioides sistémicos — solo rescate con morfina 2-3 mg IV si EVA >6' },
    { id:'p24_antieme', txt:'Antiemético multimodal: ondansetrón 4 mg IV c/8h + dexametasona 4 mg IV c/24h' },
    { id:'p24_hidrata', txt:'Hidratación IV cristaloides balanceados 1-1.5 mL/kg/h (peso ideal) — restrictiva' },
    { id:'p24_liqclaros', txt:'Líquidos claros a las 6h post-op si estable (agua, caldo, gelatina) · 30 mL c/15 min' },
    { id:'p24_drenaje', txt:'Drenaje (si hubiese): cuantificar y caracterizar c/turno — alertar si >100 mL serohemáticos/h o aspecto entérico' },
    { id:'p24_sv', txt:'Sonda vesical "se retira si la hubiese" (nuestro equipo no la usa de rutina); si presente, retiro <24h' },
    { id:'p24_gluco', txt:'Control de glucometría c/4h si DM2 · ajustar con insulina rápida por escala' },
    { id:'p24_balance', txt:'Balance hídrico estricto · diuresis ≥0.5 mL/kg/h' },
    { id:'p24_curacion', txt:'Curación de puertos solo si drenaje · heridas limpias cubiertas 48h' },
    { id:'p24_alarma', txt:'Signos de alarma inmediata: taquicardia persistente >120, fiebre >38.5°C, dolor abdominal súbito, desaturación <90%, drenaje turbio/entérico, sangrado activo' }
  ]},
  {h:'48h', items:[
    { id:'p48_azul', txt:'Test de azul de metileno o estudio contrastado si protocolo' },
    { id:'p48_liqcompl', txt:'Avance a líquidos completos' },
    { id:'p48_egreso', txt:'Egreso si criterios cumplidos (tolerancia oral, dolor <4, movilización, afebril, laboratorios estables)' }
  ]},
  {h:'72h-1 sem', items:[
    { id:'p72_llamada', txt:'Control telefónico 24-48h post-egreso' },
    { id:'p72_dieta', txt:'Dieta líquida hiperproteica' },
    { id:'p72_hidra', txt:'Hidratación ≥1.5L/día' },
    { id:'p72_tev_ext', txt:'Profilaxis TEV extendida (HBPM 2-4 sem)' },
    { id:'p72_udca', txt:'UDCA profiláctico 500-600 mg c/24h por 6 meses (prevención litiasis vesicular)' },
    { id:'p72_alarma', txt:'Signos de alarma: taquicardia >120, fiebre, dolor abdominal severo, intolerancia oral persistente' }
  ]}
];

// ======= FÁRMACOS POSTOP (marcables para prescripción e investigación) =======
const FARMACOS_POSTOP = [
  { grupo:'Analgesia / antiinflamatorios', color:'#1A8B9D', items:[
    { id:'fx_paracet', txt:'Paracetamol 1 g IV/VO c/6h · dosis máx 4 g/día' },
    { id:'fx_ketoro', txt:'Ketorolaco 30 mg IV c/8h (48-72h · función renal normal)' },
    { id:'fx_ibu', txt:'Ibuprofeno 400-600 mg VO c/8h (post-cicatrización, evitar si úlcera o sleeve)' },
    { id:'fx_metamizol', txt:'Metamizol 1-2 g IV c/8h (alternativa a ketorolaco)' },
    { id:'fx_tramadol', txt:'Tramadol 50-100 mg IV/VO c/6-8h si EVA >6' },
    { id:'fx_morfina', txt:'Morfina 2-3 mg IV rescate si dolor refractario' }
  ]},
  { grupo:'Antiemética', color:'#C9A961', items:[
    { id:'fx_ondan', txt:'Ondansetrón 4 mg IV c/8h' },
    { id:'fx_dexa', txt:'Dexametasona 4 mg IV c/24h primeras 48h' },
    { id:'fx_metocl', txt:'Metoclopramida 10 mg IV c/8h (evitar si obstrucción)' },
    { id:'fx_aprepit', txt:'Aprepitant 80 mg VO c/24h (rescate NVPO)' }
  ]},
  { grupo:'Antiácidos / protectores', color:'#2D8659', items:[
    { id:'fx_omepra', txt:'Omeprazol 40 mg IV/VO c/12h' },
    { id:'fx_pantopra', txt:'Pantoprazol 40 mg IV/VO c/24h' },
    { id:'fx_esomepra', txt:'Esomeprazol 40 mg VO c/24h (fase VO)' },
    { id:'fx_sucralf', txt:'Sucralfato 1 g VO c/6h (si gastritis o úlcera)' }
  ]},
  { grupo:'Anticoagulación / profilaxis TEV', color:'#C0392B', items:[
    { id:'fx_enox_40', txt:'Enoxaparina 40 mg SC c/24h' },
    { id:'fx_enox_40_12', txt:'Enoxaparina 40 mg SC c/12h (IMC ≥40)' },
    { id:'fx_enox_60_12', txt:'Enoxaparina 60 mg SC c/12h (IMC ≥50 o alto riesgo)' },
    { id:'fx_bemipa', txt:'Bemiparina 3500-5000 UI SC c/24h' },
    { id:'fx_tinza', txt:'Tinzaparina 4500 UI SC c/24h' },
    { id:'fx_fonda', txt:'Fondaparinux 2.5 mg SC c/24h (si TIH)' }
  ]},
  { grupo:'Litiasis vesicular', color:'#E0A82E', items:[
    { id:'fx_udca', txt:'Ácido ursodesoxicólico (UDCA) 500-600 mg c/24h · 6 meses' }
  ]},
  { grupo:'Antibióticos', color:'#0A1F44', items:[
    { id:'fx_cefazol', txt:'Cefazolina 2 g IV (3 g si >120 kg) preincisión · re-dosis a 4h' },
    { id:'fx_clinda', txt:'Clindamicina 900 mg IV preincisión (si alergia βlactámicos)' },
    { id:'fx_metronid', txt:'Metronidazol 500 mg IV c/8h (si contaminación intestinal)' },
    { id:'fx_ertapen', txt:'Ertapenem 1 g IV c/24h (infección establecida)' }
  ]},
  { grupo:'Metabólico / glucémico', color:'#1A8B9D', items:[
    { id:'fx_insul_lispro', txt:'Insulina lispro SC por escala cada 4h (glucometría > 180 mg/dL)' },
    { id:'fx_insul_glargina', txt:'Insulina glargina basal 0.2 U/kg/día si DM insulino-requerida' },
    { id:'fx_tiamina', txt:'Tiamina 100 mg IV c/24h primeras 72h' }
  ]}
];

// ======= VITAMINAS Y SUPLEMENTACIÓN (marcables) =======
const VITAMINAS = [
  { grupo:'Multivitamínicos', items:[
    { id:'vit_multi', txt:'Multivitamínico bariátrico 2/día' },
    { id:'vit_multi_masticable', txt:'Multivitamínico masticable (primeras 4 semanas)' }
  ]},
  { grupo:'Minerales mayores', items:[
    { id:'vit_calcio', txt:'Calcio citrato 1200-1500 mg/día (dividido en 2-3 tomas)' },
    { id:'vit_hierro_bypass', txt:'Hierro elemental 45-60 mg/día (RYGB / OAGB)' },
    { id:'vit_hierro_hipoab', txt:'Hierro elemental 60-100 mg/día (SADI-S / BPD-DS)' },
    { id:'vit_zinc', txt:'Zinc 16 mg/día' },
    { id:'vit_cobre', txt:'Cobre 2 mg/día' },
    { id:'vit_magnesio', txt:'Magnesio 300-400 mg/día' },
    { id:'vit_selenio', txt:'Selenio 55 μg/día' }
  ]},
  { grupo:'Vitaminas hidrosolubles', items:[
    { id:'vit_b12_sl', txt:'Vitamina B12 500 mcg SL/día' },
    { id:'vit_b12_im', txt:'Vitamina B12 1000 mcg IM mensual' },
    { id:'vit_tiamina', txt:'Tiamina (B1) 12 mg/día (50-100 mg primeros 3 meses)' },
    { id:'vit_folico', txt:'Ácido fólico 400-800 μg/día' },
    { id:'vit_b6', txt:'Piridoxina (B6) 2 mg/día' },
    { id:'vit_c', txt:'Vitamina C 90-120 mg/día' }
  ]},
  { grupo:'Vitaminas liposolubles', items:[
    { id:'vit_d3', txt:'Vitamina D3 3000 UI/día' },
    { id:'vit_a', txt:'Vitamina A 10000 UI/día (hipoabsortivas)' },
    { id:'vit_e', txt:'Vitamina E 400 UI/día (hipoabsortivas)' },
    { id:'vit_k', txt:'Vitamina K 300 μg/día (hipoabsortivas)' }
  ]},
  { grupo:'Otros suplementos', items:[
    { id:'vit_proteina', txt:'Proteína en polvo ≥60 g/día (fase 1-3)' },
    { id:'vit_omega3', txt:'Omega-3 1-2 g/día' },
    { id:'vit_probio', txt:'Probiótico multicepa (post-bypass)' }
  ]}
];

function sugerenciaVitaminas(proc){
  const base=['vit_multi','vit_calcio','vit_d3','vit_b12_sl','vit_tiamina'];
  if(proc==='rygb'||proc==='oagb'||proc==='rev_sg_rygb'||proc==='rev_sg_oagb') base.push('vit_hierro_bypass');
  if(proc==='sadis'||proc==='bpdds'){ base.push('vit_hierro_hipoab','vit_a','vit_e','vit_k','vit_zinc','vit_cobre'); }
  return base;
}

const HBPM_EQUIVALENCIAS = [
  { nombre:'Enoxaparina', marca:'Clexane / Lovenox', profBaja:'40 mg SC c/24h', profAlta:'40 mg SC c/12h (IMC≥40) · 60 mg SC c/12h (IMC≥50)', nota:'Estándar bariátrico. Dosis terapéutica 1 mg/kg c/12h (peso ajustado)' },
  { nombre:'Bemiparina', marca:'Hibor / Zibor', profBaja:'3500 UI SC c/24h', profAlta:'5000 UI SC c/24h (IMC≥40) · 5000 UI c/12h (IMC≥50)', nota:'HBPM de 2ª generación, menor acumulación renal. Terapéutica 115 UI/kg c/24h' },
  { nombre:'Nadroparina', marca:'Fraxiparine', profBaja:'0.3 mL (2850 UI) SC c/24h', profAlta:'0.4 mL (3800 UI) c/24h >70 kg · c/12h si IMC≥40', nota:'Útil en pacientes con alergia a enoxaparina' },
  { nombre:'Dalteparina', marca:'Fragmin', profBaja:'5000 UI SC c/24h', profAlta:'5000 UI c/12h si IMC≥40 · 7500 UI c/24h alto riesgo', nota:'Aprobado embarazo. Terapéutica 200 UI/kg c/24h' },
  { nombre:'Tinzaparina', marca:'Innohep', profBaja:'4500 UI SC c/24h', profAlta:'75 UI/kg c/24h si IMC≥40', nota:'HBPM de vida media más larga. Uso en ERC leve' },
  { nombre:'Fondaparinux', marca:'Arixtra', profBaja:'2.5 mg SC c/24h', profAlta:'5 mg SC c/24h (>100 kg)', nota:'Pentasacárido sintético. Alternativa si HIT (trombocitopenia inducida por heparina)' }
];

function calcularDosisHBPM(p){
  const peso = parseFloat(p.peso)||0;
  const talla = (parseFloat(p.talla)||0)/100;
  const imcV = (peso && talla) ? peso/(talla*talla) : 0;
  const c = p.comorbilidades||{};
  const riesgoAlto = imcV>=50 || c.tep || c.acoag || c.cardio;
  const riesgoIntermedio = imcV>=40;
  const enox = riesgoAlto ? '60 mg SC c/12h' : riesgoIntermedio ? '40 mg SC c/12h' : '40 mg SC c/24h';
  const duracion = riesgoAlto ? '28 días post-alta' : '14-21 días post-alta';
  const bemip = riesgoAlto ? '5000 UI SC c/12h' : riesgoIntermedio ? '5000 UI SC c/24h' : '3500 UI SC c/24h';
  const nadro = riesgoAlto ? '0.4 mL SC c/12h' : '0.4 mL SC c/24h';
  const dalt = riesgoAlto ? '5000 UI SC c/12h' : '5000 UI SC c/24h';
  const nivel = riesgoAlto ? 'alto' : riesgoIntermedio ? 'moderado-alto' : 'moderado';
  return { peso, imc:imcV, nivel, duracion, enox, bemip, nadro, dalt, notas:[
    `Paciente ${imcV.toFixed(1)} kg/m² · ${peso} kg → riesgo TEV ${nivel}`,
    'Iniciar HBPM 12h antes de alta si no se había iniciado en hospitalización',
    'Enseñar auto-administración: rotar sitios (abdomen lateral), evitar friccionar',
    'Evaluar peso, plaquetas y función renal antes de prolongar >21 días',
    'Contraindicaciones: sangrado activo, plaquetas <50k, ERC TFG<30 (ajustar o usar HNF)'
  ]};
}

const UDCA_PROFILAXIS = {
  farmaco: 'Ácido ursodesoxicólico (UDCA · Ursofalk · Urso)',
  dosis: '500-600 mg c/24h VO (o 300 mg c/12h)',
  inicio: 'A los 14 días post-cirugía, al iniciar fase de purés',
  duracion: '6 meses (período de mayor pérdida ponderal y riesgo litogénico)',
  evidencia: 'Reduce colelitiasis del 30% al 4-5% (Miller 2003 NEJM; Adams 2016 JAMA Surg; ASMBS 2019)',
  indicaciones: [
    'Todos los pacientes post-bypass (RYGB, OAGB) de rutina',
    'Post-manga si IMC≥40 o pérdida ponderal esperada >25%',
    'Post-BPD-DS / SADI-S de rutina',
    'Post-revisional con pérdida ponderal significativa'
  ],
  contraindicaciones: [
    'Colelitiasis sintomática previa (indicación de colecistectomía concomitante)',
    'Hepatopatía colestásica severa descompensada',
    'Diarrea crónica severa',
    'Hipersensibilidad a ácidos biliares'
  ],
  alternativas: 'Colecistectomía profiláctica concomitante (controvertida; aumenta tiempo operatorio y morbilidad en vesícula sana)',
  seguimiento: 'Ecografía abdominal a los 6 y 12 meses; suspender UDCA si litiasis asintomática y mantener observación'
};

const FASES = [
  {fase:'Fase 1 - Líquidos claros',tiempo:'Día 1-3',contenido:'Agua, caldo desgrasado, gelatina sin azúcar, té. 30mL c/15min.'},
  {fase:'Fase 2 - Líquidos completos',tiempo:'Día 4-14',contenido:'Proteína en polvo (60g/día), leche descremada/almendras, yogurt líquido. Sin azúcar.'},
  {fase:'Fase 3 - Purés',tiempo:'Sem 3-4',contenido:'Proteína blanda (huevo, atún, pollo molido), verduras cocidas en puré.'},
  {fase:'Fase 4 - Sólidos blandos',tiempo:'Sem 5-6',contenido:'Pescado, pollo desmenuzado, vegetales cocidos. Masticar 20-30 veces.'},
  {fase:'Fase 5 - Dieta regular',tiempo:'Sem 7+',contenido:'Dieta hiperproteica 60-80g/día, evitar azúcares simples, hidratación entre comidas.'}
];

const LABS = {
  '1m':['Hemograma','Glucosa','Creatinina','Electrolitos','PFH'],
  '3m':['Hemograma','Glucosa/HbA1c','Perfil lipídico','PFH','Hierro/ferritina','B12','Vit D','PTH','Albúmina'],
  '6m':['Igual que 3m + Ácido fólico, Zinc, Calcio iónico'],
  '12m':['Panel bariátrico completo: hemograma, química, hierro/ferritina, B12, fólico, vit D, PTH, calcio, zinc, cobre, A/E, tiamina'],
  'anual':['Panel bariátrico completo + DEXA si >40a o factores riesgo']
};

const CATALOGO_COMPLICACIONES = [
  {id:'fuga',sx:'Taquicardia >120 + dolor + fiebre',dx:'Fuga anastomótica',gravedad:'critico'},
  {id:'tep',sx:'Disnea súbita + taquicardia + desaturación',dx:'TEP',gravedad:'critico'},
  {id:'estenosis',sx:'Vómito persistente + intolerancia oral',dx:'Estenosis / edema',gravedad:'importante'},
  {id:'hernia',sx:'Dolor cólico tardío + vómito biliar',dx:'Hernia interna',gravedad:'critico'},
  {id:'erge',sx:'Pirosis + regurgitación post-manga',dx:'ERGE / hernia hiatal',gravedad:'importante'},
  {id:'colelit',sx:'Ictericia + dolor HCD + colangitis',dx:'Coledocolitiasis',gravedad:'importante'},
  {id:'falla',sx:'Pérdida ponderal insuficiente (<50% PEP a 18m)',dx:'Falla del procedimiento',gravedad:'rutina'},
  {id:'wernicke',sx:'Confusión + ataxia + nistagmo',dx:'Encefalopatía de Wernicke',gravedad:'critico'},
  {id:'anemia',sx:'Anemia + fatiga + palidez',dx:'Deficiencia Fe/B12',gravedad:'importante'},
  {id:'dumping',sx:'Síncope postprandial + sudoración',dx:'Síndrome de dumping (RYGB)',gravedad:'importante'}
];

const MAP_TEMPRANO = TEMPRANO.flatMap(b=>b.items.map(it=>({...it, bloque:b.h})));
const MAP_FARMACOS = FARMACOS_POSTOP.flatMap(g=>g.items.map(it=>({...it, grupo:g.grupo})));
const MAP_VIT = VITAMINAS.flatMap(g=>g.items.map(it=>({...it, grupo:g.grupo})));

export default function Modulo3(){
  const { t } = useLang();
  const [modo,setModo]=useState('clinico');
  const [pacientes,setPacientes]=useState([]);
  const [seleccionado,setSeleccionado]=useState(null);
  const [tab,setTab]=useState('temprano');
  const [seguimientos,setSeguimientos]=useState({});
  const [pesoNuevo,setPesoNuevo]=useState('');
  const [hitoNuevo,setHitoNuevo]=useState('1m');
  const [fechaSeg,setFechaSeg]=useState(nowLocalInput());
  const [cargando,setCargando]=useState(true);
  const [labs,setLabs]=useState({});
  const [nuevoLab,setNuevoLab]=useState({tipo:'inicial',fecha:nowLocalInput(),valores:{},archivo:null,archivoNombre:''});
  const [paramGrafica,setParamGrafica]=useState('hb');
  const [marcables,setMarcables]=useState({});

  const [dietaD1,setDietaD1]=useState({});
  const [evoluciones,setEvoluciones]=useState({});
  const [nuevaEvolucion,setNuevaEvolucion]=useState('');
  const [firmaEvolucion,setFirmaEvolucion]=useState('');
  const [planNutri,setPlanNutri]=useState({});
  const [planNutriArchivo,setPlanNutriArchivo]=useState(null);
  const [planNutriNombre,setPlanNutriNombre]=useState('');
  const [planNutriNotas,setPlanNutriNotas]=useState('');
  const [complsPaciente,setComplsPaciente]=useState({});
  const [complsLibres,setComplsLibres]=useState({});
  const [nuevaComplLibre,setNuevaComplLibre]=useState({titulo:'',notas:'',gravedad:'importante'});
  const [filasDietaEditada,setFilasDietaEditada]=useState([]);

  useEffect(()=>{(async()=>{
    setPacientes(await storageGet('avante_pacientes') || []);
    setSeguimientos(await storageGet('avante_seguimientos') || {});
    setLabs(await storageGet('avante_labs') || {});
    setDietaD1(await storageGet('avante_dieta_d1') || {});
    setEvoluciones(await storageGet('avante_evoluciones') || {});
    setPlanNutri(await storageGet('avante_plan_nutri') || {});
    setComplsPaciente(await storageGet('avante_complicaciones') || {});
    setComplsLibres(await storageGet('avante_complicaciones_libres') || {});
    setMarcables(await storageGet('avante_marcables') || {});
    setCargando(false);
  })();},[]);

  useEffect(()=>{
    if(seleccionado){
      setFilasDietaEditada((dietaD1[seleccionado.id]||DIETA_D1_DEFAULT).slice());
      const pn=planNutri[seleccionado.id]||{};
      setPlanNutriNombre(pn.nombre||'');
      setPlanNutriArchivo(pn.archivo||null);
      setPlanNutriNotas(pn.notas||'');
    }
  },[seleccionado]);

  const getMarc = (pid, key) => (marcables[pid]?.[key]) || [];
  const toggleMarc = async (pid, key, id) => {
    const cur = getMarc(pid, key);
    const next = cur.includes(id) ? cur.filter(x=>x!==id) : [...cur, id];
    const upd = { ...marcables, [pid]: { ...(marcables[pid]||{}), [key]: next } };
    setMarcables(upd); await storageSet('avante_marcables', upd);
  };
  const setMarc = async (pid, key, next) => {
    const upd = { ...marcables, [pid]: { ...(marcables[pid]||{}), [key]: next } };
    setMarcables(upd); await storageSet('avante_marcables', upd);
  };

  const guardarDietaD1=async()=>{
    const actualizado={...dietaD1,[seleccionado.id]:filasDietaEditada};
    setDietaD1(actualizado); await storageSet('avante_dieta_d1',actualizado);
  };

  const guardarEvolucion=async()=>{
    if(!seleccionado||!nuevaEvolucion.trim())return;
    const lista=evoluciones[seleccionado.id]||[];
    const nueva={fecha:new Date().toISOString(),texto:nuevaEvolucion.trim(),firmadoPor:firmaEvolucion.trim()};
    const actualizado={...evoluciones,[seleccionado.id]:[...lista,nueva]};
    setEvoluciones(actualizado); await storageSet('avante_evoluciones',actualizado);
    setNuevaEvolucion('');
  };

  const subirPlanNutri=async(e)=>{
    const f=e.target.files&&e.target.files[0]; if(!f)return;
    try{
      const r=await leerArchivoDataURL(f,5*1024*1024);
      setPlanNutriArchivo(r.dataUrl); setPlanNutriNombre(r.name);
    }catch(err){alert(err.message);}
  };

  const guardarPlanNutri=async()=>{
    const actualizado={...planNutri,[seleccionado.id]:{archivo:planNutriArchivo,nombre:planNutriNombre,notas:planNutriNotas,fecha:new Date().toISOString()}};
    setPlanNutri(actualizado); await storageSet('avante_plan_nutri',actualizado);
    alert('Plan nutricional guardado');
  };

  const toggleCompl=async(complId)=>{
    const actual=complsPaciente[seleccionado.id]||{};
    const existe=actual[complId];
    const nuevo={...actual};
    if(existe) delete nuevo[complId];
    else nuevo[complId]={fecha:new Date().toISOString(),notas:''};
    const actualizado={...complsPaciente,[seleccionado.id]:nuevo};
    setComplsPaciente(actualizado); await storageSet('avante_complicaciones',actualizado);
  };
  const agregarComplLibre=async()=>{
    if(!seleccionado||!nuevaComplLibre.titulo.trim())return;
    const lista=complsLibres[seleccionado.id]||[];
    const nuevo={id:Date.now().toString(),fecha:new Date().toISOString(),...nuevaComplLibre,titulo:nuevaComplLibre.titulo.trim(),notas:nuevaComplLibre.notas.trim()};
    const actualizado={...complsLibres,[seleccionado.id]:[...lista,nuevo]};
    setComplsLibres(actualizado); await storageSet('avante_complicaciones_libres',actualizado);
    setNuevaComplLibre({titulo:'',notas:'',gravedad:'importante'});
  };
  const eliminarComplLibre=async(id)=>{
    const lista=(complsLibres[seleccionado.id]||[]).filter(x=>x.id!==id);
    const actualizado={...complsLibres,[seleccionado.id]:lista};
    setComplsLibres(actualizado); await storageSet('avante_complicaciones_libres',actualizado);
  };
  const actualizarComplNota=async(complId,campo,valor)=>{
    const actual=complsPaciente[seleccionado.id]||{};
    if(!actual[complId])return;
    const nuevo={...actual,[complId]:{...actual[complId],[campo]:valor}};
    const actualizado={...complsPaciente,[seleccionado.id]:nuevo};
    setComplsPaciente(actualizado); await storageSet('avante_complicaciones',actualizado);
  };

  const guardarLab=async()=>{
    if(!seleccionado)return;
    const lista=labs[seleccionado.id]||[];
    const nuevo={...nuevoLab,id:Date.now().toString(),fecha:nuevoLab.fecha?new Date(nuevoLab.fecha).toISOString():new Date().toISOString()};
    const actualizado={...labs,[seleccionado.id]:[...lista,nuevo]};
    setLabs(actualizado); await storageSet('avante_labs',actualizado);
    setNuevoLab({tipo:'inicial',fecha:nowLocalInput(),valores:{},archivo:null,archivoNombre:''});
  };
  const eliminarLab=async(id)=>{
    if(!seleccionado)return;
    const lista=(labs[seleccionado.id]||[]).filter(x=>x.id!==id);
    const actualizado={...labs,[seleccionado.id]:lista};
    setLabs(actualizado); await storageSet('avante_labs',actualizado);
  };
  const subirArchivoLab=async(e)=>{
    const f=e.target.files&&e.target.files[0]; if(!f)return;
    try{
      const r=await leerArchivoDataURL(f,3*1024*1024);
      setNuevoLab({...nuevoLab,archivo:r.dataUrl,archivoNombre:r.name});
    }catch(err){alert(err.message);}
  };

  const guardarSeguimiento=async()=>{
    if(!seleccionado||!pesoNuevo)return;
    const lista=seguimientos[seleccionado.id]||[];
    const fechaISO=fechaSeg?new Date(fechaSeg).toISOString():new Date().toISOString();
    const nuevo={hito:hitoNuevo,peso:pesoNuevo,fecha:fechaISO};
    const actualizado={...seguimientos,[seleccionado.id]:[...lista,nuevo]};
    setSeguimientos(actualizado); await storageSet('avante_seguimientos',actualizado);
    setPesoNuevo(''); setFechaSeg(nowLocalInput());
  };

  const construirPDF = () => {
    const segs=seguimientos[seleccionado.id]||[];
    const evs=evoluciones[seleccionado.id]||[];
    const compls=complsPaciente[seleccionado.id]||{};
    const dieta=dietaD1[seleccionado.id]||DIETA_D1_DEFAULT;
    const pn=planNutri[seleccionado.id]||{};
    const lb=labs[seleccionado.id]||[];
    const selTemp = getMarc(seleccionado.id,'postop_24h');
    const selFx = getMarc(seleccionado.id,'farmacos_postop');
    const selVit = getMarc(seleccionado.id,'vitaminas');
    return exportarPDF({
      titulo:'Seguimiento Postoperatorio',
      subtitulo:`${seleccionado.nombre||''} ${seleccionado.apellido||''} · ${PROCS[seleccionado.procedimiento]||''}`,
      secciones:[
        { titulo:'Indicaciones postop marcadas', lineas: selTemp.length? MAP_TEMPRANO.filter(x=>selTemp.includes(x.id)).map(x=>`• [${x.bloque}] ${x.txt}`) : ['Sin selecciones guardadas.'] },
        { titulo:'Fármacos postop indicados', lineas: selFx.length? MAP_FARMACOS.filter(x=>selFx.includes(x.id)).map(x=>`• [${x.grupo}] ${x.txt}`) : ['Sin selecciones guardadas.'] },
        { titulo:'Vitaminas / suplementación prescritas', lineas: selVit.length? MAP_VIT.filter(x=>selVit.includes(x.id)).map(x=>`• [${x.grupo}] ${x.txt}`) : ['Sin selecciones guardadas.'] },
        { titulo:'Dieta día 1 (editable por el equipo)', lineas: dieta },
        { titulo:'Plan nutricional (archivo cargado)', lineas:[pn.nombre?'Archivo: '+pn.nombre:'Sin archivo', pn.notas||''].filter(Boolean) },
        { titulo:'Evolución ponderal', lineas: segs.map(s=>`${s.hito} · ${fmtFH(s.fecha)} · ${s.peso} kg · %PTP ${ptp(seleccionado.peso,s.peso).toFixed(1)}% · %PEP ${pep(seleccionado.peso,s.peso,seleccionado.talla).toFixed(1)}%`) },
        { titulo:'Laboratorios y otros estudios', lineas: lb.map(l=>`${l.tipo} · ${fmtFH(l.fecha)}${l.archivoNombre?' · '+l.archivoNombre:''} · ${LAB_PARAMS.filter(p=>l.valores&&l.valores[p.k]).map(p=>`${p.l}:${l.valores[p.k]}${p.u}`).join(', ')}`) },
        { titulo:'Notas de evolución clínica', lineas: evs.map(e=>`${fmtFH(e.fecha)}${e.firmadoPor?' · '+e.firmadoPor:''} — ${e.texto}`) },
        { titulo:'Complicaciones registradas', lineas: Object.entries(compls).map(([id,d])=>{const c=CATALOGO_COMPLICACIONES.find(x=>x.id===id);return c?`${c.dx} · ${fmtFH(d.fecha)}${d.notas?' — '+d.notas:''}`:'';}).filter(Boolean) }
      ],
      footer:'Avante · Módulo 3 · Seguimiento Postoperatorio'
    });
  };
  const nomArchivo=()=>`seguimiento_${seleccionado.nombre||'paciente'}`;
  const descargar=()=>descargarPDF(construirPDF(),nomArchivo());
  const whatsapp=()=>enviarPDFWhatsApp(construirPDF(),nomArchivo(),seleccionado.telefono||'',`Seguimiento Avante - ${seleccionado.nombre||''}`);
  const email=()=>enviarPDFEmail(construirPDF(),nomArchivo(),seleccionado.email||'','Seguimiento Avante',`Adjunto seguimiento de ${seleccionado.nombre||''}`);

  const btn="px-4 py-2 rounded font-medium transition-colors";
  if(cargando)return <div className="p-8 text-center">Cargando...</div>;

  const segsActual=seleccionado?(seguimientos[seleccionado.id]||[]):[];
  const complsActual=seleccionado?(complsPaciente[seleccionado.id]||{}):{};
  const evsActual=seleccionado?(evoluciones[seleccionado.id]||[]):[];

  return (
    <div className="min-h-screen p-4" style={{background:'#f3f4f6',fontFamily:'system-ui,sans-serif'}}>
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div style={{background:C.navy,color:'white'}} className="p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 style={{fontFamily:'Georgia,serif',color:C.gold}} className="text-3xl font-bold">Avante Complejo Hospitalario</h1>
              <p style={{fontFamily:'Georgia,serif'}} className="text-sm italic mt-1">{t('app.lema')}</p>
              <p className="text-xs mt-2 opacity-80">{t('modulo')} 3 · {t('mod.3.titulo')}</p>
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
              <h2 className="font-bold mb-3 flex items-center gap-2" style={{color:C.navy}}><Users size={20}/>Pacientes operados</h2>
              {pacientes.length===0 ? (
                <div className="p-8 text-center rounded" style={{background:C.cream}}><p className="text-gray-600">No hay pacientes guardados.</p></div>
              ) : (
                <div className="space-y-2">
                  {pacientes.map(p=>{
                    const segs=seguimientos[p.id]||[];
                    return <button key={p.id} onClick={()=>setSeleccionado(p)} className="w-full p-3 border rounded text-left hover:shadow flex justify-between items-center">
                      <div>
                        <div className="font-bold" style={{color:C.navy}}>{(p.nombre||'Sin nombre')+' '+(p.apellido||'')}</div>
                        <div className="text-xs text-gray-600">{p.edad}a · {PROCS[p.procedimiento]||'—'} · {segs.length} controles</div>
                      </div>
                      <ChevronRight size={20} style={{color:C.teal}}/>
                    </button>;
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4 p-3 rounded flex-wrap gap-2" style={{background:C.cream}}>
                <div>
                  <div className="font-bold" style={{color:C.navy}}>{seleccionado.nombre} {seleccionado.apellido}</div>
                  <div className="text-xs text-gray-600">{PROCS[seleccionado.procedimiento]||'—'} · Peso inicial {seleccionado.peso}kg · IMC {imc(seleccionado).toFixed(1)}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={descargar} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Download size={14}/>PDF</button>
                  <button onClick={whatsapp} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:'#25D366'}}><Share2 size={14}/>WhatsApp</button>
                  <button onClick={email} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.navy}}><Mail size={14}/>Email</button>
                  <button onClick={()=>setSeleccionado(null)} className={btn+" text-sm"} style={{background:'#e5e7eb'}}>Cambiar</button>
                </div>
              </div>

              <div className="flex gap-1 mb-4 border-b overflow-x-auto">
                {[
                  {id:'temprano',i:Calendar,k:'tab.temprano'},
                  {id:'farmacos',i:PillIcon,l:'Fármacos postop'},
                  {id:'evolucion',i:ClipboardList,k:'tab.evolucion'},
                  {id:'tardio',i:TrendingDown,k:'tab.tardio'},
                  {id:'labs',i:FlaskConical,k:'tab.labs'},
                  {id:'nutricion',i:Apple,k:'tab.nutricion'},
                  {id:'complicaciones',i:AlertOctagon,k:'tab.complicaciones'}
                ].map(tb=>{
                  const I=tb.i; const label = tb.l || t(tb.k);
                  return <button key={tb.id} onClick={()=>setTab(tb.id)} className="px-3 py-2 flex items-center gap-1 text-sm font-medium border-b-2 whitespace-nowrap"
                    style={{borderColor:tab===tb.id?C.gold:'transparent',color:tab===tb.id?C.navy:'#6b7280'}}><I size={14}/>{label}</button>;
                })}
              </div>

              {tab==='temprano' && (
                <div className="space-y-4">
                  <div className="p-3 rounded border-l-4 flex items-center gap-2" style={{background:'#ecfdf5',borderColor:C.green}}>
                    <CheckSquare size={16} style={{color:C.green}}/>
                    <div className="text-xs text-gray-700">Marque las indicaciones aplicadas a este paciente. Se guardan automáticamente y alimentan el <strong>Módulo 9 Investigación</strong>.</div>
                  </div>

                  <div className="p-4 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                    <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                      <h3 className="font-bold text-sm" style={{color:C.navy}}>Dieta Día 1 (editable)</h3>
                      <div className="flex gap-2">
                        <button onClick={()=>setFilasDietaEditada([...filasDietaEditada,''])} className="text-xs px-2 py-1 rounded text-white flex items-center gap-1" style={{background:C.teal}}><Plus size={12}/>Fila</button>
                        <button onClick={guardarDietaD1} className="text-xs px-2 py-1 rounded text-white flex items-center gap-1" style={{background:C.gold}}><Save size={12}/>Guardar</button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {filasDietaEditada.map((f,i)=>(
                        <div key={i} className="flex gap-2 items-center">
                          <input value={f} onChange={e=>{const cp=[...filasDietaEditada];cp[i]=e.target.value;setFilasDietaEditada(cp);}} className="flex-1 px-2 py-1 rounded border text-sm"/>
                          <button onClick={()=>setFilasDietaEditada(filasDietaEditada.filter((_,j)=>j!==i))} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {TEMPRANO.map((b,i)=>(
                      <div key={i} className="p-4 rounded border-l-4" style={{background:'white',borderColor:C.teal}}>
                        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                          <div className="font-bold" style={{color:C.navy}}>{b.h}</div>
                          <button onClick={()=>{
                            const ids=b.items.map(it=>it.id);
                            const cur=getMarc(seleccionado.id,'postop_24h');
                            const todas=ids.every(id=>cur.includes(id));
                            const next=todas?cur.filter(id=>!ids.includes(id)):[...new Set([...cur,...ids])];
                            setMarc(seleccionado.id,'postop_24h',next);
                          }} className="text-xs px-2 py-0.5 rounded text-white" style={{background:C.teal}}>Marcar todo</button>
                        </div>
                        <ul className="space-y-1">
                          {b.items.map((x)=>{
                            const sel=getMarc(seleccionado.id,'postop_24h').includes(x.id);
                            return (
                              <li key={x.id}>
                                <button onClick={()=>toggleMarc(seleccionado.id,'postop_24h',x.id)} className="w-full text-left flex items-start gap-2 p-1 rounded hover:bg-gray-50">
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

                  {(() => {
                    const d = calcularDosisHBPM(seleccionado);
                    return (
                      <div className="p-4 rounded border-l-4" style={{background:'white',borderColor:C.red}}>
                        <div className="font-bold mb-2" style={{color:C.navy}}>Profilaxis TEV al alta · HBPM por peso del paciente</div>
                        <div className="text-xs text-gray-700 mb-2">{d.notas[0]} · Duración recomendada: <strong>{d.duracion}</strong></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                          <div className="p-2 rounded" style={{background:C.cream}}><strong style={{color:C.navy}}>Enoxaparina:</strong> {d.enox}</div>
                          <div className="p-2 rounded" style={{background:C.cream}}><strong style={{color:C.navy}}>Bemiparina:</strong> {d.bemip}</div>
                          <div className="p-2 rounded" style={{background:C.cream}}><strong style={{color:C.navy}}>Nadroparina:</strong> {d.nadro}</div>
                          <div className="p-2 rounded" style={{background:C.cream}}><strong style={{color:C.navy}}>Dalteparina:</strong> {d.dalt}</div>
                        </div>
                        <div className="text-xs text-gray-600">
                          <ul className="space-y-1">
                            {d.notas.slice(1).map((n,i)=>(<li key={i} className="flex gap-2"><AlertTriangle size={12} style={{color:C.yellow,flexShrink:0,marginTop:3}}/>{n}</li>))}
                          </ul>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="font-bold text-sm mb-1" style={{color:C.navy}}>Tabla de equivalencias de HBPM</div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead style={{background:C.navy,color:'white'}}>
                                <tr>
                                  <th className="p-1 text-left">HBPM (marca)</th>
                                  <th className="p-1 text-left">Profilaxis básica</th>
                                  <th className="p-1 text-left">Profilaxis alto riesgo / IMC≥40</th>
                                  <th className="p-1 text-left">Observación</th>
                                </tr>
                              </thead>
                              <tbody>
                                {HBPM_EQUIVALENCIAS.map((h,i)=>(
                                  <tr key={i} style={{background:i%2?'white':C.cream}}>
                                    <td className="p-1 font-medium">{h.nombre}<br/><span className="text-gray-500">{h.marca}</span></td>
                                    <td className="p-1">{h.profBaja}</td>
                                    <td className="p-1">{h.profAlta}</td>
                                    <td className="p-1 text-gray-700">{h.nota}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="p-4 rounded border-l-4" style={{background:'white',borderColor:C.gold}}>
                    <div className="font-bold mb-1" style={{color:C.navy}}>Profilaxis de litiasis vesicular · UDCA</div>
                    <div className="text-xs italic text-gray-600 mb-2">{UDCA_PROFILAXIS.evidencia}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                      <div className="p-2 rounded" style={{background:C.cream}}><strong style={{color:C.navy}}>Fármaco:</strong> {UDCA_PROFILAXIS.farmaco}</div>
                      <div className="p-2 rounded" style={{background:C.cream}}><strong style={{color:C.navy}}>Dosis:</strong> {UDCA_PROFILAXIS.dosis}</div>
                      <div className="p-2 rounded" style={{background:C.cream}}><strong style={{color:C.navy}}>Inicio:</strong> {UDCA_PROFILAXIS.inicio}</div>
                      <div className="p-2 rounded" style={{background:C.cream}}><strong style={{color:C.navy}}>Duración:</strong> {UDCA_PROFILAXIS.duracion}</div>
                    </div>
                  </div>
                </div>
              )}

              {tab==='farmacos' && (
                <div className="space-y-3">
                  <div className="p-3 rounded border-l-4 flex items-center gap-2" style={{background:'#eff6ff',borderColor:C.teal}}>
                    <PillIcon size={16} style={{color:C.teal}}/>
                    <div className="text-xs text-gray-700">Selección fármaco por fármaco. Las marcas se exportan al PDF y al <strong>Módulo 9 Investigación</strong> como variables de cruce.</div>
                  </div>
                  {FARMACOS_POSTOP.map((g,i)=>(
                    <div key={i} className="p-3 rounded border-l-4" style={{background:'white',borderColor:g.color}}>
                      <div className="font-bold text-sm mb-2" style={{color:C.navy}}>{g.grupo}</div>
                      <ul className="space-y-1">
                        {g.items.map(x=>{
                          const sel=getMarc(seleccionado.id,'farmacos_postop').includes(x.id);
                          return (
                            <li key={x.id}>
                              <button onClick={()=>toggleMarc(seleccionado.id,'farmacos_postop',x.id)} className="w-full text-left flex items-start gap-2 p-1 rounded hover:bg-gray-50">
                                {sel ? <CheckSquare size={14} style={{color:g.color,flexShrink:0,marginTop:2}}/> : <Square size={14} style={{color:'#9ca3af',flexShrink:0,marginTop:2}}/>}
                                <span className="text-xs" style={{color:sel?C.navy:'#4b5563'}}>{x.txt}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {tab==='evolucion' && (
                <div className="space-y-3">
                  <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                    <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Nueva nota de evolución clínica</h3>
                    <textarea value={nuevaEvolucion} onChange={e=>setNuevaEvolucion(e.target.value)} placeholder="S / O / A / P · signos, hallazgos, plan..." className="w-full px-2 py-2 rounded border text-sm" rows={5}/>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <input value={firmaEvolucion} onChange={e=>setFirmaEvolucion(e.target.value)} placeholder="Firma (médico tratante)" className="flex-1 min-w-40 px-2 py-1 rounded border text-sm"/>
                      <button onClick={guardarEvolucion} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}><Save size={14}/>Guardar nota</button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Historial de notas</h3>
                    {evsActual.length===0 ? <p className="text-xs text-gray-500 py-3 text-center">Sin notas registradas</p> : (
                      <div className="space-y-2">
                        {evsActual.slice().reverse().map((e,i)=>(
                          <div key={i} className="p-3 rounded border">
                            <div className="text-xs text-gray-600 mb-1">{fmtFH(e.fecha)}{e.firmadoPor?' · '+e.firmadoPor:''}</div>
                            <div className="text-sm whitespace-pre-wrap">{e.texto}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab==='tardio' && (
                <div>
                  <div className="p-3 rounded mb-3 flex gap-2 items-end flex-wrap" style={{background:C.cream}}>
                    <div className="flex-1 min-w-24">
                      <label className="text-xs font-medium">Hito</label>
                      <select value={hitoNuevo} onChange={e=>setHitoNuevo(e.target.value)} className="w-full px-2 py-1 rounded border text-sm">
                        {['1m','3m','6m','12m','18m','24m','anual'].map(h=><option key={h}>{h}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-24">
                      <label className="text-xs font-medium">Peso (kg)</label>
                      <input type="number" value={pesoNuevo} onChange={e=>setPesoNuevo(e.target.value)} className="w-full px-2 py-1 rounded border text-sm"/>
                    </div>
                    <div className="flex-1 min-w-40">
                      <label className="text-xs font-medium">Fecha y hora</label>
                      <input type="datetime-local" value={fechaSeg} onChange={e=>setFechaSeg(e.target.value)} className="w-full px-2 py-1 rounded border text-sm"/>
                    </div>
                    <button onClick={guardarSeguimiento} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}><Plus size={14}/>Registrar</button>
                  </div>
                  {segsActual.length>0 && (
                    <div className="space-y-2 mb-4">
                      {segsActual.map((s,i)=>{
                        const ptpV=ptp(seleccionado.peso,s.peso); const pepV=pep(seleccionado.peso,s.peso,seleccionado.talla);
                        const meta=pepV>=50?'green':pepV>=25?'yellow':'red';
                        return <div key={i} className="p-3 rounded border flex justify-between items-center">
                          <div>
                            <div className="font-bold text-sm" style={{color:C.navy}}>{s.hito} · {fmtFH(s.fecha)}</div>
                            <div className="text-xs text-gray-600">{s.peso} kg · IMC {(parseFloat(s.peso)/Math.pow(parseFloat(seleccionado.talla)/100,2)).toFixed(1)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold" style={{color:C[meta]}}>%PEP {pepV.toFixed(1)}%</div>
                            <div className="text-xs text-gray-600">%PTP {ptpV.toFixed(1)}%</div>
                          </div>
                        </div>;
                      })}
                    </div>
                  )}
                  <div className="p-3 rounded border" style={{borderColor:C.teal}}>
                    <div className="font-bold text-sm mb-2" style={{color:C.navy}}>Laboratorios sugeridos por hito</div>
                    {Object.entries(LABS).map(([k,v])=>(
                      <div key={k} className="text-xs mb-1"><strong>{k}:</strong> {Array.isArray(v)?v.join(', '):v}</div>
                    ))}
                  </div>
                </div>
              )}

              {tab==='labs' && (
                <div className="space-y-4">
                  <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-1" style={{color:C.navy}}><Plus size={14}/>Cargar nuevo set de laboratorios u otros estudios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <div>
                        <label className="text-xs font-medium">Tipo</label>
                        <select value={nuevoLab.tipo} onChange={e=>setNuevoLab({...nuevoLab,tipo:e.target.value})} className="w-full px-2 py-1 rounded border text-sm">
                          <option value="inicial">Inicial / preoperatorio</option>
                          <option value="seguimiento">Seguimiento</option>
                          <option value="control">Control puntual</option>
                          <option value="imagen">Imagen / estudio</option>
                          <option value="endoscopia">Endoscopía</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium">Fecha y hora</label>
                        <input type="datetime-local" value={nuevoLab.fecha} onChange={e=>setNuevoLab({...nuevoLab,fecha:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                      {LAB_PARAMS.map(p=>(
                        <div key={p.k}>
                          <label className="text-xs font-medium">{p.l} <span className="text-gray-500">({p.u})</span></label>
                          <input type="number" step="0.01" value={nuevoLab.valores[p.k]||''} onChange={e=>setNuevoLab({...nuevoLab,valores:{...nuevoLab.valores,[p.k]:e.target.value}})} className="w-full px-2 py-1 rounded border text-sm"/>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className={btn+" text-white text-sm flex items-center gap-1 cursor-pointer"} style={{background:C.teal}}>
                        <Upload size={14}/>Adjuntar archivo (PDF/imagen)
                        <input type="file" accept="image/*,application/pdf" onChange={subirArchivoLab} className="hidden"/>
                      </label>
                      {nuevoLab.archivoNombre && <span className="text-xs text-gray-600 flex items-center gap-1"><FileText size={12}/>{nuevoLab.archivoNombre}</span>}
                      <button onClick={guardarLab} className={btn+" text-white text-sm flex items-center gap-1 ml-auto"} style={{background:C.gold}}><Plus size={14}/>Guardar set</button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <h3 className="font-bold text-sm" style={{color:C.navy}}>Tendencia gráfica</h3>
                      <select value={paramGrafica} onChange={e=>setParamGrafica(e.target.value)} className="text-xs px-2 py-1 rounded border">
                        {LAB_PARAMS.map(p=><option key={p.k} value={p.k}>{p.l}</option>)}
                      </select>
                    </div>
                    <div className="p-2 rounded border" style={{borderColor:C.teal}}>
                      <GraficaLab datos={(labs[seleccionado.id]||[]).slice().sort((a,b)=>new Date(a.fecha)-new Date(b.fecha))} param={LAB_PARAMS.find(p=>p.k===paramGrafica)}/>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Sets registrados</h3>
                    {(labs[seleccionado.id]||[]).length===0 ? <p className="text-xs text-gray-500 text-center py-3">Sin laboratorios cargados</p> : (
                      <div className="space-y-2">
                        {(labs[seleccionado.id]||[]).slice().sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(lb=>(
                          <div key={lb.id} className="p-3 rounded border">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-bold text-sm capitalize" style={{color:C.navy}}>{lb.tipo} · {fmtFH(lb.fecha)}</div>
                                {lb.archivoNombre && (
                                  lb.archivo && lb.archivo.startsWith('data:image') ? (
                                    <a href={lb.archivo} target="_blank" rel="noopener noreferrer"><img src={lb.archivo} alt="" className="mt-1 max-h-32 rounded border"/></a>
                                  ) : lb.archivo ? (
                                    <a href={lb.archivo} download={lb.archivoNombre} className="text-xs flex items-center gap-1 mt-1" style={{color:C.teal}}><FileText size={12}/>{lb.archivoNombre}</a>
                                  ) : null
                                )}
                              </div>
                              <button onClick={()=>eliminarLab(lb.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-xs">
                              {LAB_PARAMS.filter(p=>lb.valores&&lb.valores[p.k]!==''&&lb.valores[p.k]!=null).map(p=>{
                                const v=parseFloat(lb.valores[p.k]); const fuera=v<p.min||v>p.max;
                                return <div key={p.k} className="px-2 py-1 rounded" style={{background:fuera?'#fde8e8':C.cream,color:fuera?C.red:C.navy}}><strong>{p.l}:</strong> {v} {p.u}</div>;
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab==='nutricion' && (
                <div className="space-y-4">
                  <div className="p-3 rounded border-l-4 flex flex-wrap items-center gap-2" style={{background:'#ecfdf5',borderColor:C.green}}>
                    <CheckSquare size={16} style={{color:C.green}}/>
                    <div className="text-xs text-gray-700 flex-1 min-w-[200px]">Marque las vitaminas/suplementos prescritos. Se cruzan en el <strong>Módulo 9 Investigación</strong>.</div>
                    <button onClick={()=>setMarc(seleccionado.id,'vitaminas',sugerenciaVitaminas(seleccionado.procedimiento))} className="text-xs px-2 py-1 rounded text-white" style={{background:C.green}}>Aplicar sugerencia por técnica</button>
                  </div>
                  <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                    <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Plan nutricional personalizado (por nutricionista)</h3>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <label className={btn+" text-white text-sm flex items-center gap-1 cursor-pointer"} style={{background:C.teal}}>
                        <Upload size={14}/>Cargar plan (PDF/imagen)
                        <input type="file" accept="image/*,application/pdf" onChange={subirPlanNutri} className="hidden"/>
                      </label>
                      {planNutriNombre && <span className="text-xs flex items-center gap-1"><FileText size={12}/>{planNutriNombre}</span>}
                    </div>
                    <textarea value={planNutriNotas} onChange={e=>setPlanNutriNotas(e.target.value)} placeholder="Notas del nutricionista · macros · horarios · restricciones..." className="w-full px-2 py-2 rounded border text-sm" rows={4}/>
                    <button onClick={guardarPlanNutri} className={btn+" text-white text-sm flex items-center gap-1 mt-2"} style={{background:C.gold}}><Save size={14}/>Guardar plan</button>
                    {planNutriArchivo && planNutriArchivo.startsWith('data:image') && <img src={planNutriArchivo} alt="" className="mt-2 max-h-48 rounded border"/>}
                    {planNutriArchivo && !planNutriArchivo.startsWith('data:image') && <a href={planNutriArchivo} download={planNutriNombre} className="text-xs flex items-center gap-1 mt-2" style={{color:C.teal}}><FileText size={12}/>Descargar plan</a>}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Fases dietarias</h3>
                    <div className="space-y-2">
                      {FASES.map((f,i)=>(
                        <div key={i} className="p-3 rounded border-l-4" style={{background:C.cream,borderColor:C.gold}}>
                          <div className="font-bold text-sm" style={{color:C.navy}}>{f.fase} <span className="text-xs font-normal text-gray-500">· {f.tiempo}</span></div>
                          <div className="text-xs text-gray-700 mt-1">{f.contenido}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Vitaminas y suplementos (marcables)</h3>
                    <div className="space-y-2">
                      {VITAMINAS.map((g,i)=>(
                        <div key={i} className="p-3 rounded border-l-4" style={{background:'white',borderColor:C.teal}}>
                          <div className="font-bold text-sm mb-2 flex justify-between items-center" style={{color:C.navy}}>
                            <span>{g.grupo}</span>
                            <button onClick={()=>{
                              const ids=g.items.map(it=>it.id);
                              const cur=getMarc(seleccionado.id,'vitaminas');
                              const todas=ids.every(id=>cur.includes(id));
                              const next=todas?cur.filter(id=>!ids.includes(id)):[...new Set([...cur,...ids])];
                              setMarc(seleccionado.id,'vitaminas',next);
                            }} className="text-xs font-normal px-2 py-0.5 rounded text-white" style={{background:C.teal}}>Marcar todo</button>
                          </div>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1">
                            {g.items.map(x=>{
                              const sel=getMarc(seleccionado.id,'vitaminas').includes(x.id);
                              return (
                                <li key={x.id}>
                                  <button onClick={()=>toggleMarc(seleccionado.id,'vitaminas',x.id)} className="w-full text-left flex items-start gap-2 p-1 rounded hover:bg-gray-50">
                                    {sel ? <CheckSquare size={14} style={{color:C.teal,flexShrink:0,marginTop:2}}/> : <Square size={14} style={{color:'#9ca3af',flexShrink:0,marginTop:2}}/>}
                                    <span className="text-xs" style={{color:sel?C.navy:'#4b5563'}}>{x.txt}</span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab==='complicaciones' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 mb-1">Marque las complicaciones del catálogo con fecha y notas. Para otras complicaciones use el registro libre debajo.</div>
                    {CATALOGO_COMPLICACIONES.map(c=>{
                      const activo=!!complsActual[c.id];
                      return (
                        <div key={c.id} className="p-3 rounded border-l-4 flex gap-3" style={{borderColor:c.gravedad==='critico'?C.red:c.gravedad==='importante'?C.yellow:C.teal,background:activo?'#fffbea':C.cream}}>
                          <input type="checkbox" checked={activo} onChange={()=>toggleCompl(c.id)} className="mt-1"/>
                          <div className="flex-1">
                            <div className="font-bold text-sm" style={{color:C.navy}}>{c.dx}</div>
                            <div className="text-xs text-gray-600 italic">{c.sx}</div>
                            {activo && (
                              <div className="mt-2 flex gap-2 flex-wrap">
                                <input type="datetime-local" value={complsActual[c.id].fecha?new Date(complsActual[c.id].fecha).toISOString().slice(0,16):''} onChange={e=>actualizarComplNota(c.id,'fecha',new Date(e.target.value).toISOString())} className="text-xs px-2 py-1 rounded border"/>
                                <input value={complsActual[c.id].notas||''} onChange={e=>actualizarComplNota(c.id,'notas',e.target.value)} placeholder="Notas/conducta" className="flex-1 text-xs px-2 py-1 rounded border"/>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{color:C.navy}}><Plus size={14}/>Registrar otra complicación (texto libre)</h3>
                    <div className="space-y-2">
                      <input value={nuevaComplLibre.titulo} onChange={e=>setNuevaComplLibre({...nuevaComplLibre,titulo:e.target.value})} placeholder="Título / diagnóstico" className="w-full px-2 py-1 rounded border text-sm"/>
                      <textarea value={nuevaComplLibre.notas} onChange={e=>setNuevaComplLibre({...nuevaComplLibre,notas:e.target.value})} placeholder="Descripción, manejo, resolución..." className="w-full px-2 py-1 rounded border text-sm" rows={3}/>
                      <div className="flex gap-2 items-center flex-wrap">
                        <label className="text-xs">Gravedad:</label>
                        <select value={nuevaComplLibre.gravedad} onChange={e=>setNuevaComplLibre({...nuevaComplLibre,gravedad:e.target.value})} className="text-xs px-2 py-1 rounded border">
                          <option value="critico">Crítica</option>
                          <option value="importante">Importante</option>
                          <option value="rutina">Leve / rutina</option>
                        </select>
                        <button onClick={agregarComplLibre} className={btn+" ml-auto text-white text-sm flex items-center gap-1"} style={{background:C.gold}}><Save size={14}/>Guardar</button>
                      </div>
                    </div>
                  </div>

                  {(complsLibres[seleccionado.id]||[]).length>0 && (
                    <div>
                      <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Complicaciones libres registradas</h3>
                      <div className="space-y-2">
                        {(complsLibres[seleccionado.id]||[]).slice().sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(cl=>(
                          <div key={cl.id} className="p-3 rounded border-l-4 flex justify-between items-start gap-2" style={{borderColor:cl.gravedad==='critico'?C.red:cl.gravedad==='importante'?C.yellow:C.teal,background:'white'}}>
                            <div className="flex-1">
                              <div className="font-bold text-sm" style={{color:C.navy}}>{cl.titulo}</div>
                              <div className="text-xs text-gray-600">{fmtFH(cl.fecha)}</div>
                              {cl.notas && <div className="text-sm mt-1 whitespace-pre-wrap">{cl.notas}</div>}
                            </div>
                            <button onClick={()=>eliminarComplLibre(cl.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                          </div>
                        ))}
                      </div>
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
