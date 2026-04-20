import React, { useState, useEffect } from 'react';
import { Activity, GraduationCap, Heart, Users, Pill, RefreshCw, Brain, Sparkles, ChevronRight, CheckCircle2, AlertCircle, AlertTriangle, Download, Share2, Mail, Plus, Save, Trash2, Lock, Info, Target, Square, CheckSquare, Edit3 } from 'lucide-react';
import { exportarPDF, descargarPDF, enviarPDFWhatsApp, enviarPDFEmail, storageGet, storageSet, fmtFechaHora } from './src_shared/utils.js';
import { useLang } from './src_shared/i18n.jsx';

const C = { navy:'#0A1F44', teal:'#1A8B9D', gold:'#C9A961', cream:'#FAF7F2', green:'#2D8659', yellow:'#E0A82E', red:'#C0392B' };
const PROCS = { sleeve:'Manga Gástrica', rygb:'RYGB', oagb:'OAGB', sadis:'SADI-S', bpdds:'BPD-DS', balon:'Balón intragástrico', rev_sg_rygb:'Rev. Manga→RYGB', rev_sg_oagb:'Rev. Manga→OAGB' };

function imc(p){const pe=parseFloat(p.peso),t=parseFloat(p.talla)/100;return (pe&&t)?pe/(t*t):0;}
function nowLocalInput(){const d=new Date();const off=d.getTimezoneOffset();return new Date(d.getTime()-off*60000).toISOString().slice(0,16);}

const TIPOS_REVISION = [
  'Conversión Manga → RYGB','Conversión Manga → OAGB','Conversión Manga → SADI-S','Conversión RYGB → BPD-DS',
  'Distalización de RYGB','Revisión endoscópica (TORe)','Dilatación endoscópica de estenosis',
  'Reparación de hernia hiatal','Cierre de fístula (OTSC)','Alargamiento de canal común','Retiro/recambio de balón','Otro'
];

// Marcas y duraciones de balón intragástrico disponibles a 2025
const BALONES = [
  {id:'orbera', marca:'Orbera (Apollo)', dur:'6 meses', mec:'Balón de silicona lleno con 400-700 mL suero salino', perdida:'10-15% peso total', perfil:'FDA 2015. Único aprobado originalmente a 6 m. Retiro endoscópico.', indic:'IMC 30-40'},
  {id:'orbera365', marca:'Orbera365 (Apollo)', dur:'12 meses', mec:'Versión extendida del Orbera con recubrimiento reforzado', perdida:'13-18% peso total sostenido a 12 m', perfil:'CE Mark. Aprobado en Europa/LATAM para 12 meses. Permite afianzar hábitos.', indic:'IMC 27-40'},
  {id:'spatz3', marca:'Spatz3 (Spatz Medical)', dur:'12 meses (ajustable)', mec:'Balón ajustable mediante catéter endoscópico (200-700 mL)', perdida:'15-20% peso total a 12 m', perfil:'FDA 2022. Permite re-ajustar volumen ante intolerancia o meseta.', indic:'IMC 30-40 (también 27-30 con comorbilidad)'},
  {id:'allurion', marca:'Allurion (Elipse)', dur:'16 semanas', mec:'Balón deglutible sin endoscopia, se elimina por vía natural', perdida:'10-13% peso total', perfil:'CE Mark. No requiere sedación para colocación ni retiro.', indic:'IMC 27-40'},
  {id:'obalon', marca:'Obalon', dur:'6 meses (3 balones)', mec:'Tres balones de gas ingeridos en cápsulas', perdida:'6-7% peso total', perfil:'FDA 2016. Actualmente retirado del mercado USA; referencia histórica.', indic:'IMC 30-40'}
];

// ======= CATÁLOGO COMPLETO DE FÁRMACOS ANTIOBESIDAD (marcables + editables) =======
// Incluye GLP-1, GIP/GLP-1, agonistas MC4R, lipasa, naltrexona-bupropion y coadyuvantes.
const FARMACOS_OBESIDAD = [
  { clase:'GLP-1 RA', color:'#1A8B9D', items:[
    { id:'farm_sema_wegovy', nom:'Semaglutida (Wegovy 2.4 mg SC semanal)', dosis:'Titulación 0.25→0.5→1.0→1.7→2.4 mg (4 sem cada paso)', perdida:'~15% a 68 sem (STEP-1)', ind:'Obesidad IMC ≥30 o ≥27 con comorbilidad; ECV con DM2 (SELECT)', contra:'MEN-2, carcinoma medular, pancreatitis previa' },
    { id:'farm_sema_ozempic', nom:'Semaglutida (Ozempic 0.25–1 mg SC semanal)', dosis:'0.25 mg × 4 sem → 0.5 mg × 4 sem → 1 mg · escalar a 2 mg si HbA1c', perdida:'6-8% (dosis DM2) · prescripción off-label a 2.4 mg', ind:'DM2 con beneficio cardiovascular; puente bariátrico', contra:'MEN-2, pancreatitis, embarazo' },
    { id:'farm_sema_rybelsus', nom:'Semaglutida oral (Rybelsus 7-14 mg VO diario)', dosis:'Iniciar 3 mg × 30 d → 7 mg × 30 d → 14 mg en ayunas', perdida:'3-5%', ind:'Alternativa oral a inyectable en DM2 o paciente con fobia a agujas', contra:'Igual que semaglutida SC' },
    { id:'farm_lira_saxenda', nom:'Liraglutida (Saxenda 3 mg SC diaria)', dosis:'0.6 → 1.2 → 1.8 → 2.4 → 3.0 mg (↑ sem)', perdida:'5-8% a 56 sem (SCALE)', ind:'Obesidad IMC ≥30 o ≥27 con comorbilidad; edad ≥12 a (pediatría)', contra:'MEN-2, pancreatitis, embarazo' },
    { id:'farm_lira_victoza', nom:'Liraglutida (Victoza 1.8 mg SC diaria)', dosis:'0.6 → 1.2 → 1.8 mg', perdida:'3-4% (dosis DM2)', ind:'DM2 con riesgo cardiovascular (LEADER)', contra:'Igual que Saxenda' },
    { id:'farm_dulagluti', nom:'Dulaglutida (Trulicity 0.75-4.5 mg SC semanal)', dosis:'0.75 → 1.5 → 3.0 → 4.5 mg', perdida:'3-4%', ind:'DM2 con ECV; no indicación primaria de obesidad', contra:'MEN-2, pancreatitis' },
    { id:'farm_exena_bydureon', nom:'Exenatida LAR (Bydureon 2 mg SC semanal)', dosis:'2 mg SC semanal (dosis única)', perdida:'2-3%', ind:'DM2', contra:'TFG <30 ml/min, pancreatitis' }
  ]},
  { clase:'GIP + GLP-1 RA', color:'#0A1F44', items:[
    { id:'farm_tirze_mounjaro', nom:'Tirzepatida (Mounjaro 2.5-15 mg SC semanal)', dosis:'2.5 × 4 sem → 5 → 7.5 → 10 → 12.5 → 15 mg', perdida:'~18% (DM2 SURPASS)', ind:'DM2; pérdida ponderal complementaria', contra:'MEN-2, pancreatitis' },
    { id:'farm_tirze_zepbound', nom:'Tirzepatida (Zepbound 5-15 mg SC semanal)', dosis:'Igual escalado (obesidad)', perdida:'~22.5% a 72 sem (SURMOUNT-1)', ind:'Obesidad IMC ≥30 o ≥27 con comorbilidad; AOS moderada-severa (SURMOUNT-OSA)', contra:'MEN-2, pancreatitis, embarazo' },
    { id:'farm_retatrut', nom:'Retatrutida (fase III — tri-agonista GIP/GLP-1/Glucagón)', dosis:'Investigacional 8-12 mg SC semanal', perdida:'~24% a 48 sem (TRIUMPH-1 fase 2)', ind:'Obesidad grado 2-3 (en investigación)', contra:'No comercializada; uso sólo en ensayos' }
  ]},
  { clase:'Inhibidor de lipasa', color:'#2D8659', items:[
    { id:'farm_orlistat', nom:'Orlistat (Xenical 120 mg · Alli 60 mg VO c/8h)', dosis:'120 mg VO con cada comida (máx 3/día)', perdida:'3-5% a 12 m', ind:'Obesidad IMC ≥30 o ≥27 con comorbilidad; alternativa en embarazo-lactancia (Alli no)', contra:'Síndrome malabsorción crónica, colestasis, embarazo (Xenical)' }
  ]},
  { clase:'Antagonista cannabinoide / combinaciones', color:'#C9A961', items:[
    { id:'farm_naltr_bupro', nom:'Naltrexona/Bupropión (Contrave/Mysimba 8/90 mg)', dosis:'1 tab AM sem 1 → 2 tabs sem 2 → 3 tabs sem 3 → 4 tabs sem 4+', perdida:'4-5% a 56 sem (COR-I)', ind:'Obesidad con componente hedónico / cravings', contra:'HTA no controlada, epilepsia, opioides, anorexia/bulimia' },
    { id:'farm_feno_topi', nom:'Fentermina/Topiramato LP (Qsymia 3.75/23–15/92 mg)', dosis:'3.75/23 → 7.5/46 → 11.25/69 → 15/92 mg', perdida:'8-10% a 56 sem (CONQUER)', ind:'Obesidad con migraña, apnea del sueño leve; no primera línea por pregnancy category', contra:'Embarazo, hipertiroidismo, glaucoma, uso de IMAO' }
  ]},
  { clase:'Simpático-miméticos (corto plazo)', color:'#E0A82E', items:[
    { id:'farm_fenter', nom:'Fentermina (Adipex 15-37.5 mg VO/día)', dosis:'15-37.5 mg AM', perdida:'4-5% (12 sem)', ind:'Obesidad corto plazo (≤12 sem por FDA)', contra:'ECV, HTA severa, hipertiroidismo, glaucoma, IMAO' },
    { id:'farm_dietilpro', nom:'Dietilpropión (75 mg VO/día)', dosis:'75 mg VO diario (máximo 12 sem)', perdida:'3-4%', ind:'Obesidad corto plazo', contra:'Igual que fentermina' }
  ]},
  { clase:'Agonista MC4R (obesidad genética)', color:'#C0392B', items:[
    { id:'farm_setmela', nom:'Setmelanotida (Imcivree 1-3 mg SC diaria)', dosis:'1-3 mg SC diaria', perdida:'10-25% (estudios POMC, LEPR, PCSK1, BBS)', ind:'Obesidad monogénica confirmada (POMC, LEPR, PCSK1) y síndrome de Bardet-Biedl', contra:'Embarazo, hipersensibilidad' },
    { id:'farm_metrele', nom:'Metreleptina (Myalept SC diaria)', dosis:'Según peso', perdida:'Variable', ind:'Lipodistrofia generalizada congénita o adquirida con déficit de leptina', contra:'Embarazo, linfoma, fiebre' }
  ]},
  { clase:'Coadyuvantes (off-label seleccionados)', color:'#6366f1', items:[
    { id:'farm_metformina', nom:'Metformina 500-2000 mg VO/día', dosis:'500 mg × 7 d → 1000 mg → 2000 mg', perdida:'2-3%', ind:'DM2, prediabetes, SOPQ con resistencia a la insulina', contra:'ERC TFG <30, acidosis láctica' },
    { id:'farm_topiramato_mono', nom:'Topiramato 25-100 mg VO/día', dosis:'25 mg × 1 sem → ↑ 25 mg semanal', perdida:'3-4% (off-label)', ind:'Obesidad con cefalea migrañosa o trastorno por atracón', contra:'Embarazo, glaucoma' },
    { id:'farm_bupro', nom:'Bupropión 150-300 mg VO/día', dosis:'150 mg AM → 300 mg AM', perdida:'2-3% (off-label)', ind:'Obesidad con componente depresivo o tabaquismo asociado', contra:'Epilepsia, anorexia/bulimia, IMAO' }
  ]}
];

const MAP_FARMACOS_OBS = FARMACOS_OBESIDAD.flatMap(c=>c.items.map(it=>({...it, clase:c.clase})));

// Sugerencia GLP-1 / GIP-GLP-1 personalizada por paciente
function sugerenciaGLP1(p){
  const i = imc(p);
  const c = p.comorbilidades || {};
  const hba1c = parseFloat(p.hba1c);
  const diabetes = c.dm2 || (isFinite(hba1c) && hba1c >= 6.5);
  const ecv = c.ecv || c.iam || c.acv;
  const erc = c.erc;
  const pancreat = c.pancreatitis;
  const tiroides = c.carTiroides || c.men2;
  const contra = [];
  if(tiroides) contra.push('Antecedente personal/familiar de carcinoma medular tiroideo o MEN-2 → contraindicación absoluta');
  if(pancreat) contra.push('Pancreatitis previa → considerar riesgo-beneficio');
  if(erc) contra.push('ERC: ajustar hidratación y vigilar deshidratación');

  // Decisión de molécula
  let farmaco = 'Semaglutida 2.4 mg SC semanal (Wegovy)';
  let alternativa = 'Tirzepatida 5-15 mg SC semanal (Mounjaro/Zepbound)';
  let razon = 'Primera línea por eficacia y evidencia cardiovascular.';
  let perdidaEsperada = '15-17% peso corporal a 68 sem (STEP-1)';
  if(i >= 35 || (diabetes && isFinite(hba1c) && hba1c >= 8)){
    farmaco = 'Tirzepatida 5→10→15 mg SC semanal (titulación mensual)';
    alternativa = 'Semaglutida 2.4 mg SC semanal';
    razon = 'Mayor magnitud de pérdida y control glucémico en IMC alto o DM descompensada.';
    perdidaEsperada = '20-22.5% peso corporal a 72 sem (SURMOUNT-1)';
  }
  if(ecv && diabetes){
    farmaco = 'Semaglutida 1.0 mg SC semanal (Ozempic) con plan de escalar a 2.4 mg';
    razon = 'Beneficio cardiovascular demostrado en DM2 con ECV (SUSTAIN-6, SELECT).';
    perdidaEsperada = '10-12% peso corporal + reducción eventos MACE ~20%';
  }

  // Titulación práctica
  const titulacion = farmaco.startsWith('Tirzepatida')
    ? ['Semana 1-4: 2.5 mg','Semana 5-8: 5 mg','Semana 9-12: 7.5 mg','Semana 13-16: 10 mg','Semana 17+: 12.5-15 mg según respuesta y tolerancia']
    : ['Semana 1-4: 0.25 mg','Semana 5-8: 0.5 mg','Semana 9-12: 1.0 mg','Semana 13-16: 1.7 mg','Semana 17+: 2.4 mg (dosis meta)'];

  // Duración sugerida en función del objetivo (puente vs tratamiento crónico)
  let duracion = '≥ 68 semanas. Crónico si tolerado y con beneficio sostenido (efecto rebote al suspender).';
  if(i >= 50) duracion = 'Puente prequirúrgico 4-6 meses para reducir ≥10% peso antes de cirugía definitiva.';
  else if(i >= 40) duracion = 'Puente prequirúrgico o crónico según elección del paciente.';

  // Monitoreo
  const monitoreo = ['Control a 4, 12 y 24 semanas','Signos de pancreatitis, colelitiasis y deshidratación','HbA1c cada 3 meses si diabético','Colaboración con nutrición para proteína ≥ 60 g/d y actividad física'];

  return { farmaco, alternativa, razon, perdidaEsperada, titulacion, duracion, monitoreo, contra };
}

function terapiasNoQx(p){
  const i=imc(p);
  const op=[];
  const glp = sugerenciaGLP1(p);
  if(i>=27&&i<35){
    op.push({t:`GLP-1 personalizado: ${glp.farmaco}`,ind:'IMC 27-34.9 con comorbilidad o ≥30 sin comorbilidad',det:`${glp.razon} Pérdida esperada: ${glp.perdidaEsperada}. Alternativa: ${glp.alternativa}. Duración: ${glp.duracion}`,evid:'STEP-1, SURMOUNT-1, SELECT', glp});
    op.push({t:'Balón intragástrico (electivo IFSO/ASMBS)',ind:'IMC 27-40, alternativa sin cirugía',det:'Opciones: Orbera (6m), Orbera365 (12m), Spatz3 (12m ajustable), Allurion/Elipse (16 sem). Pérdida 10-20% peso. Reversible.',evid:'ASGE / IFSO 2024', balones:true});
  } else if(i>=30&&i<40){
    op.push({t:`GLP-1 personalizado: ${glp.farmaco}`,ind:'Primera línea farmacológica',det:`${glp.razon} Pérdida esperada: ${glp.perdidaEsperada}. Alternativa: ${glp.alternativa}. Considerar como puente o alternativa a cirugía.`,evid:'STEP, SURMOUNT, SELECT', glp});
    op.push({t:'ESG (Gastroplastia endoscópica en manga)',ind:'IMC 30-40, no candidato o no desea cirugía',det:'Sutura endoscópica (Apollo OverStitch). Pérdida 15-20% peso a 12-24 meses.',evid:'MERIT trial, NEJM 2022'});
    op.push({t:'Balón intragástrico',ind:'Como procedimiento electivo o puente',det:'Orbera365 o Spatz3 a 12 meses para afianzar cambio conductual; Orbera 6m o Allurion si se busca intervención corta.',evid:'ASGE / IFSO / ASMBS', balones:true});
  } else if(i>=40){
    op.push({t:`Puente farmacológico GLP-1: ${glp.farmaco}`,ind:'IMC≥40 para reducir riesgo quirúrgico',det:`${glp.razon} Pérdida esperada: ${glp.perdidaEsperada}. Duración: ${glp.duracion}. Alternativa: ${glp.alternativa}.`,evid:'Estrategia bridge; SELECT para comorbilidad CV', glp});
    op.push({t:'Balón intragástrico puente',ind:'IMC≥50 con riesgo quirúrgico alto',det:'Spatz3 12m u Orbera365 12m para reducción 10-15% peso previa a cirugía definitiva; retiro en ventana operatoria.',evid:'ASMBS position', balones:true});
  }
  return op;
}

const REVISIONES = [
  {causa:'Pérdida ponderal insuficiente post-manga (<25% PTP a 18m)',opc:'Conversión a RYGB u OAGB. SADI-S si IMC sigue ≥45.',evid:'Mayor pérdida adicional con SADI-S vs RYGB'},
  {causa:'Recuperación de peso post-RYGB',opc:'TORe endoscópico, reforzamiento de pouch, distalización. Optimizar GLP-1.',evid:'TORe: ~10% pérdida adicional'},
  {causa:'ERGE refractario post-manga',opc:'Conversión a RYGB (gold standard antirreflujo). Reparación hiatal si hernia.',evid:'Resolución ERGE >85%'},
  {causa:'Estenosis de manga sintomática',opc:'Dilatación endoscópica. Si falla: conversión a RYGB.',evid:'Éxito endoscópico 70-80%'},
  {causa:'Reflujo biliar post-OAGB',opc:'Conversión a RYGB con asa larga.',evid:'~2-5% requieren conversión'},
  {causa:'Malnutrición severa post-BPD-DS/SADI-S',opc:'Alargamiento de canal común. Soporte nutricional intensivo previo.',evid:'<3% requieren revisión'},
  {causa:'Fístula gastrogástrica post-RYGB',opc:'Cierre endoscópico (OTSC) o reintervención laparoscópica.',evid:'Endoscopia primera línea'},
  {causa:'Hernia interna post-RYGB/OAGB',opc:'EMERGENCIA. Laparoscopía exploradora + cierre de defectos.',evid:'Mortalidad si retraso'}
];

// ======= SEMÁFORO METABÓLICO (basado en ADA 2024, ESC/EASD, AACE) =======
// Cada indicador devuelve un color verde/amarillo/rojo con meta por guía internacional.
function semaforoMetabolico(p, valores){
  const v = valores || {};
  const items = [];
  const pF = x => parseFloat(x);
  const push = (area, valor, unidad, color, meta, guia) =>
    items.push({ area, valor: valor===undefined||valor===''||valor===null?'—':valor, unidad, color, meta, guia });

  // HbA1c (ADA 2024): <6% remisión · 6-6.9% control · ≥7% fuera de meta
  const h = pF(v.hba1c ?? p.hba1c);
  if(isFinite(h) && h>0){
    const color = h<6 ? C.green : h<7 ? C.yellow : C.red;
    push('HbA1c', h, '%', color, '<6% remisión · <7% control', 'ADA 2024');
  } else push('HbA1c', '', '%', '#9ca3af', '<6% remisión · <7% control', 'ADA 2024');

  // Glucosa ayunas
  const g = pF(v.glucosa);
  if(isFinite(g) && g>0){
    const color = g<100 ? C.green : g<126 ? C.yellow : C.red;
    push('Glucosa ayunas', g, 'mg/dL', color, '<100', 'ADA 2024');
  } else push('Glucosa ayunas', '', 'mg/dL', '#9ca3af', '<100', 'ADA 2024');

  // LDL (ESC/EASD 2019 para DM/ECV)
  const ldl = pF(v.ldl ?? p.ldl);
  if(isFinite(ldl) && ldl>0){
    const color = ldl<70 ? C.green : ldl<100 ? C.yellow : C.red;
    push('LDL colesterol', ldl, 'mg/dL', color, '<70 (alto riesgo) / <100', 'ESC/EASD 2019');
  } else push('LDL colesterol','','mg/dL','#9ca3af','<70 / <100','ESC/EASD 2019');

  // Triglicéridos
  const tg = pF(v.tg ?? p.tg);
  if(isFinite(tg) && tg>0){
    const color = tg<150 ? C.green : tg<200 ? C.yellow : C.red;
    push('Triglicéridos', tg, 'mg/dL', color, '<150', 'AACE/ESC');
  } else push('Triglicéridos','','mg/dL','#9ca3af','<150','AACE/ESC');

  // HDL - hombre ≥40, mujer ≥50
  const hdl = pF(v.hdl ?? p.hdl);
  if(isFinite(hdl) && hdl>0){
    const ref = (p.sexo==='F') ? 50 : 40;
    const color = hdl>=ref ? C.green : hdl>=(ref-10) ? C.yellow : C.red;
    push('HDL colesterol', hdl, 'mg/dL', color, p.sexo==='F'?'≥50':'≥40', 'ATP-IV / AACE');
  } else push('HDL colesterol','','mg/dL','#9ca3af', p.sexo==='F'?'≥50':'≥40','ATP-IV / AACE');

  // PA sistólica (meta en DM/obesidad: <130/80 ACC/AHA 2023)
  const pas = pF(v.pas);
  if(isFinite(pas) && pas>0){
    const color = pas<130 ? C.green : pas<140 ? C.yellow : C.red;
    push('PA sistólica', pas, 'mmHg', color, '<130', 'ACC/AHA 2023');
  } else push('PA sistólica','','mmHg','#9ca3af','<130','ACC/AHA 2023');

  // IMC
  const i = imc(p);
  if(isFinite(i) && i>0){
    const color = i<25 ? C.green : i<30 ? C.yellow : C.red;
    push('IMC', i.toFixed(1), 'kg/m²', color, '<25', 'WHO');
  }

  // ALT
  const alt = pF(v.alt ?? p.alt);
  if(isFinite(alt) && alt>0){
    const color = alt<35 ? C.green : alt<50 ? C.yellow : C.red;
    push('ALT', alt, 'U/L', color, '<35', 'AASLD');
  } else push('ALT','','U/L','#9ca3af','<35','AASLD');

  return items;
}

const CONDUCTUAL = [
  {fase:'Pre-operatorio',acciones:['Evaluación psicológica estructurada (BES, BDI)','Identificar atracón / picoteo / comer emocional','Contrato conductual','Grupo de apoyo','Expectativas realistas']},
  {fase:'0-3 meses',acciones:['Sesiones quincenales','Manejo de duelo alimentario','Reorganización familiar','Detección transferencia adictiva']},
  {fase:'3-12 meses',acciones:['Sesiones mensuales','Imagen corporal','Hambre fisiológica vs emocional','Prevención de recaídas','Actividad física estructurada']},
  {fase:'>12 meses',acciones:['Seguimiento semestral','Vigilancia recuperación','Manejo transferencia adictiva','Soporte en cambios vitales']}
];
const SCREENING_CONDUCTUAL = [
  {q:'¿Episodios de comer grandes cantidades sintiendo pérdida de control?',flag:'Trastorno por atracón'},
  {q:'¿Picoteo continuo durante el día sin hambre real?',flag:'Grazing'},
  {q:'¿Come cuando está triste, ansioso o aburrido?',flag:'Comer emocional'},
  {q:'¿Antecedente de trastorno depresivo o ansiedad?',flag:'Comorbilidad psiquiátrica'},
  {q:'¿Consumo de alcohol >2 unidades/día o en aumento?',flag:'Riesgo transferencia adictiva'},
  {q:'¿Expectativas de pérdida >70% de exceso de peso a 6 meses?',flag:'Expectativas irreales'}
];

// Hitos conductuales: primer año mes a mes trimestral, luego anual (espejo del seguimiento nutricional)
const HITOS_CONDUCTUAL = ['Pre-op','1m','3m','6m','9m','12m','18m','24m','anual'];

// Definiciones de escalas psicológicas validadas en cirugía bariátrica
const ESCALAS_PSICO = [
  {
    k:'BES', nom:'Binge Eating Scale (Gormally 1982)',
    mide:'Intensidad del trastorno por atracón: frecuencia, control percibido y culpa asociada.',
    rango:'0 – 46',
    interp:[
      {r:'0 – 17', l:'No atracón clínicamente significativo', color:C.green},
      {r:'18 – 26', l:'Atracón moderado: seguimiento conductual estrecho', color:C.yellow},
      {r:'≥ 27', l:'Atracón severo: intervención estructurada pre y postquirúrgica', color:C.red}
    ],
    uso:'Tamizaje pre-quirúrgico y seguimiento 6-12m. Banderas: no contraindica cirugía pero exige intervención conductual.'
  },
  {
    k:'BDI', nom:'Beck Depression Inventory-II (Beck 1996)',
    mide:'Síntomas depresivos cognitivos, afectivos y somáticos en las últimas 2 semanas.',
    rango:'0 – 63',
    interp:[
      {r:'0 – 13', l:'Mínima', color:C.green},
      {r:'14 – 19', l:'Leve', color:C.yellow},
      {r:'20 – 28', l:'Moderada: valoración psiquiátrica', color:'#E67E22'},
      {r:'≥ 29', l:'Severa: considerar postponer cirugía electiva', color:C.red}
    ],
    uso:'Repetir pre-op, 3 m, 6 m, 12 m y anual. Banderas: puntuar ítem de ideación suicida activa obliga derivación inmediata.'
  },
  {
    k:'GAD-7', nom:'Generalized Anxiety Disorder-7 (Spitzer 2006)',
    mide:'Síntomas de ansiedad generalizada en las últimas 2 semanas.',
    rango:'0 – 21',
    interp:[
      {r:'0 – 4', l:'Mínima', color:C.green},
      {r:'5 – 9', l:'Leve', color:C.yellow},
      {r:'10 – 14', l:'Moderada', color:'#E67E22'},
      {r:'≥ 15', l:'Severa: manejo psiquiátrico previo', color:C.red}
    ],
    uso:'Breve (2 min). Útil antes y después de cada fase del manejo.'
  },
  {
    k:'EAT-26', nom:'Eating Attitudes Test-26 (Garner 1982)',
    mide:'Actitudes alimentarias disfuncionales y riesgo de trastorno alimentario (anorexia, bulimia).',
    rango:'0 – 78',
    interp:[
      {r:'0 – 19', l:'Bajo riesgo', color:C.green},
      {r:'≥ 20', l:'Alto riesgo de trastorno alimentario: evaluación especializada', color:C.red}
    ],
    uso:'Detecta restricción/purga que puede aflorar tras cirugía. Repetir si hay recuperación de peso o rumiación alimentaria.'
  }
];

// Roles autorizados a registrar seguimiento conductual
const ROLES_CONDUCTUAL = [
  {id:'psicologa', l:'Psicóloga/o clínica'},
  {id:'psiquiatra', l:'Psiquiatra'}
];

// Banderas conductuales reevaluables en cada seguimiento
const BANDERAS_SEG = [
  {k:'atracon', l:'Atracón'},
  {k:'grazing', l:'Picoteo (grazing)'},
  {k:'emocional', l:'Comer emocional'},
  {k:'adictiva', l:'Transferencia adictiva (alcohol/otros)'},
  {k:'ansiedad', l:'Ansiedad significativa'},
  {k:'depresion', l:'Síntomas depresivos'},
  {k:'imagen', l:'Distorsión imagen corporal'},
  {k:'recaida', l:'Recuperación de peso / recaída conductual'}
];

// Plan sugerido por hito (guía del terapeuta)
const PLAN_POR_HITO = {
  'Pre-op':'Evaluación psicológica estructurada (BES/BDI/GAD-7). Contrato conductual. Expectativas realistas. Grupo de apoyo.',
  '1m':'Sesión quincenal. Manejo del duelo alimentario. Reorganización familiar. Detección temprana de atracón o picoteo.',
  '3m':'Sesión mensual. Reforzamiento de hábitos. Hambre fisiológica vs emocional. Tamizaje transferencia adictiva.',
  '6m':'Sesión mensual. Imagen corporal. Actividad física estructurada. Prevención de recaídas.',
  '9m':'Sesión mensual o bimensual. Reforzamiento estrategias cognitivo-conductuales. Tamizaje de ansiedad/depresión.',
  '12m':'Reevaluación completa (BES/BDI/GAD-7). Transición a seguimiento trimestral o semestral si estable.',
  '18m':'Control semestral. Vigilancia de recuperación de peso y transferencia adictiva.',
  '24m':'Control semestral. Soporte en cambios vitales. Reforzamiento de autocuidado.',
  'anual':'Control anual de por vida. BES/BDI/GAD-7 abreviado. Vigilancia crónica de recaída.'
};

export default function Modulo4(){
  const { t } = useLang();
  const [modo,setModo]=useState('clinico');
  const [pacientes,setPacientes]=useState([]);
  const [seleccionado,setSeleccionado]=useState(null);
  const [tab,setTab]=useState('noqx');
  const [screening,setScreening]=useState({});
  const [cargando,setCargando]=useState(true);
  const [revisiones,setRevisiones]=useState({}); // { [pacienteId]: [{fecha, tipo, nota}] }
  const [metaValores,setMetaValores]=useState({}); // { [pacienteId]: { hba1c, glucosa, ldl, hdl, tg, pas, alt } }
  const [nuevaRev,setNuevaRev]=useState({fecha:nowLocalInput(),tipo:TIPOS_REVISION[0],nota:''});
  const [segsConductual,setSegsConductual]=useState({}); // { [pacienteId]: [{id,hito,fecha,...}] }
  const [rolConductual,setRolConductual]=useState(null); // 'psicologa' | 'psiquiatra'
  const [nombreProfesional,setNombreProfesional]=useState('');
  const [mostrarEscalas,setMostrarEscalas]=useState(false);
  const [marcables,setMarcables]=useState({}); // cruza con Mod 9 Investigación
  const [farmacosCustom,setFarmacosCustom]=useState([]);
  const [nuevoFarm,setNuevoFarm]=useState({nom:'',clase:'GLP-1 RA',dosis:'',perdida:'',ind:'',contra:''});
  const [nuevoSegCond,setNuevoSegCond]=useState({
    hito:'1m', fecha:nowLocalInput(), terapeuta:'',
    bes:'', bdi:'', gad7:'', eat26:'',
    sesionesProgramadas:'', sesionesAsistidas:'',
    banderas:{}, plan:'', nota:''
  });

  useEffect(()=>{(async()=>{
    setPacientes(await storageGet('avante_pacientes')||[]);
    setRevisiones(await storageGet('avante_revisiones')||{});
    setMetaValores(await storageGet('avante_meta_valores')||{});
    setSegsConductual(await storageGet('avante_seg_conductual')||{});
    setMarcables(await storageGet('avante_marcables')||{});
    setFarmacosCustom(await storageGet('avante_farmacos_custom')||[]);
    setCargando(false);
  })();},[]);

  const getMarc=(key)=>{
    if(!seleccionado) return [];
    return ((marcables[seleccionado.id]||{})[key])||[];
  };
  const toggleMarc=async(key,id)=>{
    if(!seleccionado) return;
    const pid=seleccionado.id;
    const curPid=marcables[pid]||{};
    const curArr=curPid[key]||[];
    const nueva=curArr.includes(id)?curArr.filter(x=>x!==id):[...curArr,id];
    const actualizado={...marcables,[pid]:{...curPid,[key]:nueva}};
    setMarcables(actualizado);
    await storageSet('avante_marcables',actualizado);
  };
  const setMarcSingle=async(key,id)=>{
    if(!seleccionado) return;
    const pid=seleccionado.id;
    const curPid=marcables[pid]||{};
    const actual=curPid[key]||[];
    const nueva=actual[0]===id?[]:[id]; // toggle selección única
    const actualizado={...marcables,[pid]:{...curPid,[key]:nueva}};
    setMarcables(actualizado);
    await storageSet('avante_marcables',actualizado);
  };
  const agregarFarmacoCustom=async()=>{
    if(!nuevoFarm.nom.trim()) return;
    const id='farm_cus_'+Date.now().toString(36);
    const nuevo={...nuevoFarm,id,nom:nuevoFarm.nom.trim()};
    const lista=[...farmacosCustom,nuevo];
    setFarmacosCustom(lista);
    await storageSet('avante_farmacos_custom',lista);
    setNuevoFarm({nom:'',clase:nuevoFarm.clase,dosis:'',perdida:'',ind:'',contra:''});
  };
  const eliminarFarmacoCustom=async(id)=>{
    const lista=farmacosCustom.filter(f=>f.id!==id);
    setFarmacosCustom(lista);
    await storageSet('avante_farmacos_custom',lista);
  };

  const agregarRevision=async()=>{
    if(!seleccionado||!nuevaRev.fecha)return;
    const lista=revisiones[seleccionado.id]||[];
    const nueva={...nuevaRev,id:Date.now().toString(),fecha:new Date(nuevaRev.fecha).toISOString()};
    const actualizado={...revisiones,[seleccionado.id]:[...lista,nueva]};
    setRevisiones(actualizado);
    await storageSet('avante_revisiones',actualizado);
    setNuevaRev({fecha:nowLocalInput(),tipo:TIPOS_REVISION[0],nota:''});
  };
  const eliminarRevision=async(id)=>{
    const lista=(revisiones[seleccionado.id]||[]).filter(x=>x.id!==id);
    const actualizado={...revisiones,[seleccionado.id]:lista};
    setRevisiones(actualizado); await storageSet('avante_revisiones',actualizado);
  };
  const setMeta=async(campo,valor)=>{
    const actual=metaValores[seleccionado.id]||{};
    const actualizado={...metaValores,[seleccionado.id]:{...actual,[campo]:valor}};
    setMetaValores(actualizado); await storageSet('avante_meta_valores',actualizado);
  };

  const agregarSegConductual=async()=>{
    if(!seleccionado||!nuevoSegCond.fecha)return;
    const lista=segsConductual[seleccionado.id]||[];
    const nuevo={
      ...nuevoSegCond,
      terapeuta: nuevoSegCond.terapeuta || nombreProfesional || '',
      rol: rolConductual || nuevoSegCond.rol || '',
      id:Date.now().toString(),
      fecha:new Date(nuevoSegCond.fecha).toISOString()
    };
    const actualizado={...segsConductual,[seleccionado.id]:[...lista,nuevo]};
    setSegsConductual(actualizado);
    await storageSet('avante_seg_conductual',actualizado);
    setNuevoSegCond({
      hito:nuevoSegCond.hito, fecha:nowLocalInput(), terapeuta:nuevoSegCond.terapeuta,
      bes:'', bdi:'', gad7:'', eat26:'',
      sesionesProgramadas:'', sesionesAsistidas:'',
      banderas:{}, plan:'', nota:''
    });
  };
  const eliminarSegConductual=async(id)=>{
    const lista=(segsConductual[seleccionado.id]||[]).filter(x=>x.id!==id);
    const actualizado={...segsConductual,[seleccionado.id]:lista};
    setSegsConductual(actualizado);
    await storageSet('avante_seg_conductual',actualizado);
  };

  const construirPDF=()=>{
    const noqx=terapiasNoQx(seleccionado);
    const revs=revisiones[seleccionado.id]||[];
    const sem=semaforoMetabolico(seleccionado, metaValores[seleccionado.id]);
    const flags=Object.entries(screening).filter(([,v])=>v).map(([k])=>SCREENING_CONDUCTUAL[parseInt(k)].flag);
    const segsCond=(segsConductual[seleccionado.id]||[]).slice().sort((a,b)=>new Date(a.fecha)-new Date(b.fecha));
    const lineasCond=segsCond.map(s=>{
      const banderas=Object.entries(s.banderas||{}).filter(([,v])=>v).map(([k])=>(BANDERAS_SEG.find(b=>b.k===k)?.l)||k).join(', ')||'ninguna';
      const adh=s.sesionesProgramadas?`${s.sesionesAsistidas||0}/${s.sesionesProgramadas} sesiones`:'—';
      return `${s.hito} · ${fmtFechaHora(s.fecha)}${s.terapeuta?' · '+s.terapeuta:''} · BES ${s.bes||'—'} · BDI ${s.bdi||'—'} · GAD-7 ${s.gad7||'—'} · EAT-26 ${s.eat26||'—'} · Adherencia ${adh} · Banderas: ${banderas}${s.plan?' · Plan: '+s.plan:''}${s.nota?' · '+s.nota:''}`;
    });

    // Secciones marcables (cruce con Mod 9 Investigación)
    const idsFarm=getMarc('farmacos_obesidad');
    const todosFarm=[...MAP_FARMACOS_OBS, ...farmacosCustom];
    const lineasFarm=idsFarm.map(id=>{
      const f=todosFarm.find(x=>x.id===id);
      return f?`${f.nom} — Clase: ${f.clase||''}. Dosis: ${f.dosis||'—'}. Pérdida: ${f.perdida||'—'}. Ind: ${f.ind||'—'}. Contra: ${f.contra||'—'}`:id;
    });
    const balonId=(getMarc('balon_elegido')||[])[0];
    const balonSel=balonId?BALONES.find(b=>b.id===balonId):null;
    const lineasBalon=balonSel?[`${balonSel.marca} · ${balonSel.dur} · ${balonSel.perdida} · ${balonSel.perfil}`]:[];
    const glpId=(getMarc('glp1_elegido')||[])[0];
    const glpSel=glpId?todosFarm.find(x=>x.id===glpId):null;
    const lineasGlp=glpSel?[`${glpSel.nom} · ${glpSel.dosis||''} · Pérdida: ${glpSel.perdida||''}`]:[];

    return exportarPDF({
      titulo:'Manejo Integral No Quirúrgico',
      subtitulo:`${seleccionado.nombre||''} ${seleccionado.apellido||''} · IMC ${imc(seleccionado).toFixed(1)} · ${PROCS[seleccionado.procedimiento]||''}`,
      secciones:[
        { titulo:'Terapias no quirúrgicas aplicables', lineas: noqx.map(x=>`${x.t} — ${x.ind}. ${x.det}`) },
        { titulo:'GLP-1 / GIP-GLP-1 elegido', lineas: lineasGlp.length?lineasGlp:['Sin selección'] },
        { titulo:'Fármacos antiobesidad marcados', lineas: lineasFarm.length?lineasFarm:['Sin selección'] },
        { titulo:'Balón intragástrico elegido', lineas: lineasBalon.length?lineasBalon:['Sin selección'] },
        { titulo:'Cirugía de revisión (registros)', lineas: revs.map(r=>`${fmtFechaHora(r.fecha)} · ${r.tipo}${r.nota?' · '+r.nota:''}`) },
        { titulo:'Semáforo metabólico (guías ADA/ESC/ACC/AASLD)', lineas: sem.map(s=>`${s.area}: ${s.valor} ${s.unidad} — meta ${s.meta} (${s.guia})`) },
        { titulo:'Tamizaje conductual', lineas: flags.length?flags:['Sin banderas identificadas'] },
        { titulo:'Seguimiento conductual longitudinal', lineas: lineasCond.length?lineasCond:['Sin seguimientos registrados'] }
      ],
      footer:'Avante · Módulo 4'
    });
  };
  const nomArchivo=()=>`manejo_${seleccionado.nombre||'paciente'}`;
  const descargar=()=>descargarPDF(construirPDF(),nomArchivo());
  const whatsapp=()=>enviarPDFWhatsApp(construirPDF(),nomArchivo(),seleccionado.telefono||'',`Manejo integral Avante - ${seleccionado.nombre||''}`);
  const email=()=>enviarPDFEmail(construirPDF(),nomArchivo(),seleccionado.email||'','Manejo integral Avante',`Adjunto manejo integral de ${seleccionado.nombre||''}`);

  const btn="px-4 py-2 rounded font-medium transition-colors";
  if(cargando)return <div className="p-8 text-center">Cargando...</div>;

  const revsPac = seleccionado ? (revisiones[seleccionado.id]||[]) : [];
  const metaPac = seleccionado ? (metaValores[seleccionado.id]||{}) : {};
  const sem = seleccionado ? semaforoMetabolico(seleccionado, metaPac) : [];

  return (
    <div className="min-h-screen p-4" style={{background:'#f3f4f6',fontFamily:'system-ui,sans-serif'}}>
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div style={{background:C.navy,color:'white'}} className="p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 style={{fontFamily:'Georgia,serif',color:C.gold}} className="text-3xl font-bold">Avante Complejo Hospitalario</h1>
              <p style={{fontFamily:'Georgia,serif'}} className="text-sm italic mt-1">{t('app.lema')}</p>
              <p className="text-xs mt-2 opacity-80">{t('modulo')} 4 · {t('mod.4.titulo')}</p>
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
              <h2 className="font-bold mb-3 flex items-center gap-2" style={{color:C.navy}}><Users size={20}/>Seleccione paciente</h2>
              {pacientes.length===0 ? (
                <div className="p-8 text-center rounded" style={{background:C.cream}}><p className="text-gray-600">No hay pacientes guardados.</p></div>
              ) : (
                <div className="space-y-2">
                  {pacientes.map(p=>(
                    <button key={p.id} onClick={()=>setSeleccionado(p)} className="w-full p-3 border rounded text-left hover:shadow flex justify-between items-center">
                      <div>
                        <div className="font-bold" style={{color:C.navy}}>{(p.nombre||'Sin nombre')+' '+(p.apellido||'')}</div>
                        <div className="text-xs text-gray-600">{p.edad}a · IMC {imc(p).toFixed(1)} · {PROCS[p.procedimiento]||'—'}</div>
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
                  <div className="text-xs text-gray-600">IMC {imc(seleccionado).toFixed(1)} · {PROCS[seleccionado.procedimiento]||'—'}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={descargar} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Download size={14}/>PDF</button>
                  <button onClick={whatsapp} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:'#25D366'}}><Share2 size={14}/>WhatsApp</button>
                  <button onClick={email} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.navy}}><Mail size={14}/>Email</button>
                  <button onClick={()=>setSeleccionado(null)} className={btn+" text-sm"} style={{background:'#e5e7eb'}}>Cambiar</button>
                </div>
              </div>

              <div className="flex gap-1 mb-4 border-b overflow-x-auto">
                {[{id:'noqx',i:Pill,k:'tab.glp1'},{id:'farmacos',i:Pill,l:'Fármacos antiobesidad'},{id:'revision',i:RefreshCw,k:'tab.revision'},{id:'metabolico',i:Sparkles,k:'tab.metabolico'},{id:'conductual',i:Brain,k:'mod.4.sub',l:'Conductual'}].map(tb=>{
                  const I=tb.i;
                  return <button key={tb.id} onClick={()=>setTab(tb.id)} className="px-3 py-2 flex items-center gap-1 text-sm font-medium border-b-2 whitespace-nowrap"
                    style={{borderColor:tab===tb.id?C.gold:'transparent',color:tab===tb.id?C.navy:'#6b7280'}}><I size={14}/>{tb.l||t(tb.k)}</button>;
                })}
              </div>

              {tab==='noqx' && (
                <div className="space-y-3">
                  {terapiasNoQx(seleccionado).length===0 ? (
                    <div className="p-4 rounded text-sm text-gray-600" style={{background:C.cream}}>IMC fuera del rango de terapias no quirúrgicas estándar.</div>
                  ) : terapiasNoQx(seleccionado).map((t,i)=>(
                    <div key={i} className="p-4 rounded border-l-4" style={{background:C.cream,borderColor:C.gold}}>
                      <div className="font-bold" style={{color:C.navy}}>{t.t}</div>
                      <div className="text-xs italic text-gray-600 mt-1">Indicación: {t.ind}</div>
                      <div className="text-sm text-gray-700 mt-2">{t.det}</div>
                      {t.glp && (
                        <div className="mt-3 p-3 rounded bg-white border" style={{borderColor:C.teal}}>
                          <div className="text-xs font-bold mb-1 flex items-center gap-1" style={{color:C.teal}}><Target size={12}/>Plan de titulación sugerido</div>
                          <ul className="text-xs text-gray-700 space-y-0.5">
                            {t.glp.titulacion.map((x,k)=><li key={k}>• {x}</li>)}
                          </ul>
                          <div className="text-xs mt-2"><strong>Duración:</strong> {t.glp.duracion}</div>
                          <div className="text-xs mt-1"><strong>Monitoreo:</strong></div>
                          <ul className="text-xs text-gray-700 space-y-0.5">
                            {t.glp.monitoreo.map((x,k)=><li key={k}>• {x}</li>)}
                          </ul>
                          {t.glp.contra.length>0 && (
                            <div className="mt-2 p-2 rounded text-xs" style={{background:'#FDEDEC',color:C.red}}>
                              <strong>Precaución / contraindicaciones del paciente:</strong>
                              <ul className="mt-1 space-y-0.5">{t.glp.contra.map((x,k)=><li key={k}>⚠ {x}</li>)}</ul>
                            </div>
                          )}
                        </div>
                      )}
                      {t.balones && (() => {
                        const balonMarcado=(getMarc('balon_elegido')||[])[0];
                        return (
                        <div className="mt-3 p-3 rounded bg-white border overflow-x-auto" style={{borderColor:C.teal}}>
                          <div className="text-xs font-bold mb-2 flex items-center justify-between" style={{color:C.teal}}>
                            <span>Balones intragástricos disponibles · marque el elegido</span>
                            {balonMarcado && <button onClick={()=>setMarcSingle('balon_elegido',balonMarcado)} className="text-xs underline" style={{color:C.red}}>Quitar selección</button>}
                          </div>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left" style={{color:C.navy}}>
                                <th className="pr-2 pb-1 w-8">Sel.</th>
                                <th className="pr-2 pb-1">Marca</th><th className="pr-2 pb-1">Duración</th><th className="pr-2 pb-1">Pérdida</th><th className="pb-1">Notas</th>
                              </tr>
                            </thead>
                            <tbody>
                              {BALONES.map((b,k)=>{
                                const sel=balonMarcado===b.id;
                                return (
                                <tr key={k} className="border-t" style={{background:sel?'#EAF7F2':'transparent'}}>
                                  <td className="py-1 pr-2">
                                    <button onClick={()=>setMarcSingle('balon_elegido',b.id)} title={sel?'Deseleccionar':'Seleccionar'}>
                                      {sel?<CheckSquare size={16} style={{color:C.teal}}/>:<Square size={16} style={{color:'#9ca3af'}}/>}
                                    </button>
                                  </td>
                                  <td className="py-1 pr-2 font-bold">{b.marca}</td>
                                  <td className="py-1 pr-2">{b.dur}</td>
                                  <td className="py-1 pr-2">{b.perdida}</td>
                                  <td className="py-1">{b.perfil} · <span className="italic">{b.indic}</span></td>
                                </tr>
                              );})}
                            </tbody>
                          </table>
                        </div>
                        );
                      })()}
                      {modo==='academico' && <div className="text-xs mt-2 font-medium" style={{color:C.teal}}>Evidencia: {t.evid}</div>}
                    </div>
                  ))}
                </div>
              )}

              {tab==='farmacos' && (() => {
                const idsGlp=(getMarc('glp1_elegido')||[])[0];
                const idsFarm=getMarc('farmacos_obesidad');
                const CLASES_OPCIONES=['GLP-1 RA','GIP + GLP-1 RA','Inhibidor de lipasa','Antagonista cannabinoide / combinaciones','Simpático-miméticos (corto plazo)','Agonista MC4R (obesidad genética)','Coadyuvantes (off-label seleccionados)','Personalizado'];
                return (
                <div className="space-y-4">
                  <div className="p-3 rounded border-l-4" style={{background:C.cream,borderColor:C.gold}}>
                    <div className="flex items-start gap-2">
                      <Info size={16} style={{color:C.teal,flexShrink:0,marginTop:2}}/>
                      <div className="text-xs text-gray-700">
                        Catálogo completo de fármacos antiobesidad a 2025. Marque los que forme parte del plan del paciente — se cruzan automáticamente con el Módulo 9 Investigación para análisis agregado.
                        Para GLP-1/GIP-GLP-1 el botón <strong>Elegir</strong> fija la molécula principal; las casillas verdes marcan coadyuvantes o alternos.
                      </div>
                    </div>
                  </div>

                  {FARMACOS_OBESIDAD.map(cat=>(
                    <div key={cat.clase}>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm" style={{color:cat.color}}>{cat.clase} ({cat.items.length})</h3>
                        <button
                          onClick={async()=>{
                            const pid=seleccionado.id;
                            const curPid=marcables[pid]||{};
                            const actual=curPid.farmacos_obesidad||[];
                            const idsCat=cat.items.map(i=>i.id);
                            const todosMarcados=idsCat.every(i=>actual.includes(i));
                            const nueva=todosMarcados?actual.filter(x=>!idsCat.includes(x)):[...new Set([...actual,...idsCat])];
                            const actualizado={...marcables,[pid]:{...curPid,farmacos_obesidad:nueva}};
                            setMarcables(actualizado);
                            await storageSet('avante_marcables',actualizado);
                          }}
                          className="text-xs px-2 py-1 rounded" style={{background:'#e5e7eb'}}>
                          Marcar/desmarcar todos
                        </button>
                      </div>
                      <div className="space-y-1">
                        {cat.items.map(it=>{
                          const sel=idsFarm.includes(it.id);
                          const isGlp=cat.clase==='GLP-1 RA'||cat.clase==='GIP + GLP-1 RA';
                          const glpSel=idsGlp===it.id;
                          return (
                            <div key={it.id} className="p-2 rounded border flex items-start gap-2" style={{background:sel?'#EAF7F2':'white',borderColor:sel?C.teal:'#e5e7eb'}}>
                              <button onClick={()=>toggleMarc('farmacos_obesidad',it.id)} className="mt-0.5 flex-shrink-0" title={sel?'Desmarcar':'Marcar'}>
                                {sel?<CheckSquare size={18} style={{color:C.teal}}/>:<Square size={18} style={{color:'#9ca3af'}}/>}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm" style={{color:C.navy}}>{it.nom}</div>
                                <div className="text-xs text-gray-700 mt-0.5"><strong>Dosis:</strong> {it.dosis}</div>
                                <div className="text-xs text-gray-700"><strong>Pérdida esperada:</strong> {it.perdida}</div>
                                <div className="text-xs text-gray-700"><strong>Indicación:</strong> {it.ind}</div>
                                {it.contra && <div className="text-xs text-gray-700" style={{color:C.red}}><strong>Contraindicaciones:</strong> {it.contra}</div>}
                              </div>
                              {isGlp && (
                                <button onClick={()=>setMarcSingle('glp1_elegido',it.id)} className="text-xs px-2 py-1 rounded flex-shrink-0" style={{background:glpSel?C.teal:'#e5e7eb',color:glpSel?'white':'#374151'}}>
                                  {glpSel?'✓ Elegido':'Elegir'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {farmacosCustom.length>0 && (
                    <div>
                      <h3 className="font-bold text-sm mb-1" style={{color:C.navy}}>Fármacos personalizados ({farmacosCustom.length})</h3>
                      <div className="space-y-1">
                        {farmacosCustom.map(it=>{
                          const sel=idsFarm.includes(it.id);
                          return (
                            <div key={it.id} className="p-2 rounded border flex items-start gap-2" style={{background:sel?'#FDF6E3':'white',borderColor:sel?C.gold:'#e5e7eb'}}>
                              <button onClick={()=>toggleMarc('farmacos_obesidad',it.id)} className="mt-0.5 flex-shrink-0">
                                {sel?<CheckSquare size={18} style={{color:C.gold}}/>:<Square size={18} style={{color:'#9ca3af'}}/>}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm" style={{color:C.navy}}>{it.nom} <span className="text-xs italic text-gray-500">· {it.clase}</span></div>
                                {it.dosis && <div className="text-xs text-gray-700"><strong>Dosis:</strong> {it.dosis}</div>}
                                {it.perdida && <div className="text-xs text-gray-700"><strong>Pérdida:</strong> {it.perdida}</div>}
                                {it.ind && <div className="text-xs text-gray-700"><strong>Ind:</strong> {it.ind}</div>}
                                {it.contra && <div className="text-xs" style={{color:C.red}}><strong>Contra:</strong> {it.contra}</div>}
                              </div>
                              <button onClick={()=>eliminarFarmacoCustom(it.id)} className="text-red-600 hover:bg-red-50 p-1 rounded flex-shrink-0"><Trash2 size={14}/></button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.gold}}>
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{color:C.navy}}><Edit3 size={14}/>Agregar fármaco nuevo al catálogo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input type="text" value={nuevoFarm.nom} onChange={e=>setNuevoFarm({...nuevoFarm,nom:e.target.value})} placeholder="Nombre (ej. Nuevo fármaco 2025 SC mensual)" className="px-2 py-1 rounded border text-sm md:col-span-2"/>
                      <select value={nuevoFarm.clase} onChange={e=>setNuevoFarm({...nuevoFarm,clase:e.target.value})} className="px-2 py-1 rounded border text-sm">
                        {CLASES_OPCIONES.map(c=><option key={c}>{c}</option>)}
                      </select>
                      <input type="text" value={nuevoFarm.dosis} onChange={e=>setNuevoFarm({...nuevoFarm,dosis:e.target.value})} placeholder="Dosis / titulación" className="px-2 py-1 rounded border text-sm"/>
                      <input type="text" value={nuevoFarm.perdida} onChange={e=>setNuevoFarm({...nuevoFarm,perdida:e.target.value})} placeholder="Pérdida esperada" className="px-2 py-1 rounded border text-sm"/>
                      <input type="text" value={nuevoFarm.ind} onChange={e=>setNuevoFarm({...nuevoFarm,ind:e.target.value})} placeholder="Indicación" className="px-2 py-1 rounded border text-sm"/>
                      <input type="text" value={nuevoFarm.contra} onChange={e=>setNuevoFarm({...nuevoFarm,contra:e.target.value})} placeholder="Contraindicaciones" className="px-2 py-1 rounded border text-sm md:col-span-2"/>
                    </div>
                    <button onClick={agregarFarmacoCustom} className={btn+" mt-2 text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Plus size={14}/>Guardar fármaco</button>
                  </div>
                </div>
                );
              })()}

              {tab==='revision' && (
                <div className="space-y-3">
                  <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                    <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Registrar cirugía o procedimiento de revisión</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <div>
                        <label className="text-xs">Fecha y hora</label>
                        <input type="datetime-local" value={nuevaRev.fecha} onChange={e=>setNuevaRev({...nuevaRev,fecha:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs">Tipo</label>
                        <select value={nuevaRev.tipo} onChange={e=>setNuevaRev({...nuevaRev,tipo:e.target.value})} className="w-full px-2 py-1 rounded border text-sm">
                          {TIPOS_REVISION.map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <textarea value={nuevaRev.nota} onChange={e=>setNuevaRev({...nuevaRev,nota:e.target.value})} placeholder="Notas del procedimiento · hallazgos · indicación" className="w-full px-2 py-2 rounded border text-sm" rows={2}/>
                    <button onClick={agregarRevision} className={btn+" text-white text-sm flex items-center gap-1 mt-2"} style={{background:C.gold}}><Plus size={14}/>Registrar revisión</button>
                  </div>
                  {revsPac.length>0 && (
                    <div>
                      <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Historial de revisiones</h3>
                      <div className="space-y-2">
                        {revsPac.slice().sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(r=>(
                          <div key={r.id} className="p-3 rounded border flex justify-between items-start">
                            <div>
                              <div className="font-bold text-sm" style={{color:C.navy}}>{r.tipo}</div>
                              <div className="text-xs text-gray-600">{fmtFechaHora(r.fecha)}</div>
                              {r.nota && <div className="text-sm mt-1">{r.nota}</div>}
                            </div>
                            <button onClick={()=>eliminarRevision(r.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Catálogo de causas y opciones</h3>
                    <div className="space-y-2">
                      {REVISIONES.map((r,i)=>(
                        <div key={i} className="p-3 rounded border-l-4" style={{borderColor:C.teal,background:C.cream}}>
                          <div className="font-bold text-sm" style={{color:C.navy}}>{r.causa}</div>
                          <div className="text-sm text-gray-700 mt-1">{r.opc}</div>
                          {modo==='academico' && <div className="text-xs mt-1 italic" style={{color:C.teal}}>{r.evid}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab==='metabolico' && (
                <div className="space-y-4">
                  <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                    <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Valores actuales del paciente</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        {k:'hba1c',l:'HbA1c (%)'},{k:'glucosa',l:'Glucosa (mg/dL)'},{k:'ldl',l:'LDL (mg/dL)'},
                        {k:'hdl',l:'HDL (mg/dL)'},{k:'tg',l:'TG (mg/dL)'},{k:'pas',l:'PA sistólica (mmHg)'},{k:'alt',l:'ALT (U/L)'}
                      ].map(f=>(
                        <div key={f.k}>
                          <label className="text-xs">{f.l}</label>
                          <input type="number" step="0.01" value={metaPac[f.k]||''} onChange={e=>setMeta(f.k,e.target.value)} className="w-full px-2 py-1 rounded border text-sm"/>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-600 mt-2">Si no se ingresan valores aquí, se usan los registrados en Módulo 1.</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Semáforo metabólico</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {sem.map((s,i)=>(
                        <div key={i} className="p-3 rounded border-l-4 flex justify-between items-start" style={{borderColor:s.color,background:'white'}}>
                          <div>
                            <div className="font-bold text-sm" style={{color:C.navy}}>{s.area}</div>
                            <div className="text-xs text-gray-600">Meta {s.meta} · <span className="italic">{s.guia}</span></div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{color:s.color}}>{s.valor} {s.unidad}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-600 mt-2">Basado en ADA 2024, ESC/EASD 2019, ACC/AHA 2023, AASLD, AACE y WHO.</div>
                  </div>
                </div>
              )}

              {tab==='conductual' && !rolConductual && (
                <div className="space-y-3">
                  <div className="p-4 rounded border-l-4 flex items-start gap-3" style={{background:'#FDF6E3',borderColor:C.gold}}>
                    <Lock size={24} style={{color:C.gold,flexShrink:0,marginTop:2}}/>
                    <div className="text-sm">
                      <div className="font-bold" style={{color:C.navy}}>Apartado restringido</div>
                      <div className="text-gray-700 mt-1">El seguimiento conductual, la aplicación e interpretación de escalas y el plan psicoterapéutico son <strong>exclusivos para psicóloga/o clínica y psiquiatra</strong>. Indique su rol y nombre para continuar.</div>
                    </div>
                  </div>
                  <div className="p-4 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                    <label className="text-xs font-bold">Rol profesional</label>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {ROLES_CONDUCTUAL.map(r=>(
                        <button key={r.id} onClick={()=>setRolConductual(r.id)}
                          className={btn+" text-sm"}
                          style={{background:C.teal,color:'white'}}>{r.l}</button>
                      ))}
                    </div>
                    <label className="text-xs font-bold mt-3 block">Nombre del profesional</label>
                    <input type="text" value={nombreProfesional} onChange={e=>setNombreProfesional(e.target.value)}
                      placeholder="Escriba su nombre completo (queda registrado en cada seguimiento)"
                      className="w-full px-2 py-1 rounded border text-sm mt-1"/>
                    <div className="text-xs text-gray-500 italic mt-2">La sesión permanece activa mientras no cambie de módulo o paciente.</div>
                  </div>
                </div>
              )}

              {tab==='conductual' && rolConductual && (() => {
                const listaSeg=(segsConductual[seleccionado.id]||[]).slice().sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));
                const toggleBandera=(k)=>setNuevoSegCond(s=>({...s,banderas:{...s.banderas,[k]:!s.banderas[k]}}));
                const rolLabel=(ROLES_CONDUCTUAL.find(r=>r.id===rolConductual)||{}).l;
                return (
                <div className="space-y-4">
                  <div className="p-3 rounded border flex items-center justify-between" style={{background:'#EAF7F2',borderColor:C.teal}}>
                    <div className="text-xs">
                      <strong style={{color:C.navy}}>Sesión:</strong> {rolLabel}{nombreProfesional?` · ${nombreProfesional}`:''}
                    </div>
                    <button onClick={()=>{setRolConductual(null);setNombreProfesional('');}} className="text-xs px-2 py-1 rounded" style={{background:'#e5e7eb'}}>Cerrar sesión</button>
                  </div>

                  <div>
                    <button onClick={()=>setMostrarEscalas(v=>!v)} className="text-xs flex items-center gap-1 font-bold" style={{color:C.teal}}>
                      <Info size={14}/>{mostrarEscalas?'Ocultar':'Ver'} definiciones de escalas (BES · BDI · GAD-7 · EAT-26)
                    </button>
                    {mostrarEscalas && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {ESCALAS_PSICO.map(e=>(
                          <div key={e.k} className="p-3 rounded border-l-4" style={{background:C.cream,borderColor:C.gold}}>
                            <div className="font-bold text-sm" style={{color:C.navy}}>{e.k} · {e.nom}</div>
                            <div className="text-xs text-gray-700 mt-1"><strong>Mide:</strong> {e.mide}</div>
                            <div className="text-xs text-gray-700 mt-1"><strong>Rango:</strong> {e.rango}</div>
                            <div className="mt-2 space-y-0.5">
                              {e.interp.map((iv,k)=>(
                                <div key={k} className="text-xs flex items-center gap-2">
                                  <span className="inline-block w-2 h-2 rounded-full" style={{background:iv.color}}/>
                                  <span className="font-bold">{iv.r}</span>
                                  <span className="text-gray-700">— {iv.l}</span>
                                </div>
                              ))}
                            </div>
                            <div className="text-xs italic text-gray-600 mt-2">{e.uso}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Tamizaje rápido inicial</h3>
                    <div className="space-y-1">
                      {SCREENING_CONDUCTUAL.map((s,i)=>(
                        <label key={i} className="flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-gray-50">
                          <input type="checkbox" checked={!!screening[i]} onChange={e=>setScreening({...screening,[i]:e.target.checked})} className="mt-1"/>
                          <div className="flex-1 text-sm">
                            <div>{s.q}</div>
                            {screening[i] && <div className="text-xs font-bold" style={{color:C.red}}>⚠ {s.flag}</div>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{color:C.navy}}><Plus size={14}/>Nuevo seguimiento conductual</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <label className="text-xs">Hito</label>
                        <select value={nuevoSegCond.hito} onChange={e=>setNuevoSegCond({...nuevoSegCond,hito:e.target.value})} className="w-full px-2 py-1 rounded border text-sm">
                          {HITOS_CONDUCTUAL.map(h=><option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs">Fecha/hora</label>
                        <input type="datetime-local" value={nuevoSegCond.fecha} onChange={e=>setNuevoSegCond({...nuevoSegCond,fecha:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs">Terapeuta</label>
                        <input type="text" value={nuevoSegCond.terapeuta} onChange={e=>setNuevoSegCond({...nuevoSegCond,terapeuta:e.target.value})} className="w-full px-2 py-1 rounded border text-sm" placeholder="Nombre del profesional"/>
                      </div>
                      <div>
                        <label className="text-xs" title="Binge Eating Scale (0-46)">BES (0-46)</label>
                        <input type="number" min="0" max="46" value={nuevoSegCond.bes} onChange={e=>setNuevoSegCond({...nuevoSegCond,bes:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs" title="Beck Depression Inventory (0-63)">BDI (0-63)</label>
                        <input type="number" min="0" max="63" value={nuevoSegCond.bdi} onChange={e=>setNuevoSegCond({...nuevoSegCond,bdi:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs" title="GAD-7 (0-21)">GAD-7 (0-21)</label>
                        <input type="number" min="0" max="21" value={nuevoSegCond.gad7} onChange={e=>setNuevoSegCond({...nuevoSegCond,gad7:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs" title="Eating Attitudes Test 26">EAT-26</label>
                        <input type="number" min="0" max="78" value={nuevoSegCond.eat26} onChange={e=>setNuevoSegCond({...nuevoSegCond,eat26:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs">Sesiones programadas</label>
                        <input type="number" min="0" value={nuevoSegCond.sesionesProgramadas} onChange={e=>setNuevoSegCond({...nuevoSegCond,sesionesProgramadas:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs">Sesiones asistidas</label>
                        <input type="number" min="0" value={nuevoSegCond.sesionesAsistidas} onChange={e=>setNuevoSegCond({...nuevoSegCond,sesionesAsistidas:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="text-xs font-bold">Banderas actuales</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mt-1">
                        {BANDERAS_SEG.map(b=>(
                          <label key={b.k} className="flex items-center gap-1 text-xs cursor-pointer">
                            <input type="checkbox" checked={!!nuevoSegCond.banderas[b.k]} onChange={()=>toggleBandera(b.k)}/>
                            <span>{b.l}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="text-xs">Plan / indicaciones</label>
                      <textarea rows={2} value={nuevoSegCond.plan} onChange={e=>setNuevoSegCond({...nuevoSegCond,plan:e.target.value})} className="w-full px-2 py-1 rounded border text-sm" placeholder={PLAN_POR_HITO[nuevoSegCond.hito]||''}/>
                      <div className="text-xs text-gray-500 italic mt-1">Sugerencia por hito: {PLAN_POR_HITO[nuevoSegCond.hito]||'—'}</div>
                    </div>
                    <div className="mt-2">
                      <label className="text-xs">Nota clínica</label>
                      <textarea rows={2} value={nuevoSegCond.nota} onChange={e=>setNuevoSegCond({...nuevoSegCond,nota:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                    </div>
                    <button onClick={agregarSegConductual} className={btn+" mt-2 text-white text-sm flex items-center gap-1"} style={{background:C.gold}}>
                      <Save size={14}/>Guardar seguimiento
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2 text-sm flex items-center gap-2" style={{color:C.navy}}>
                      <Brain size={14}/>Historial conductual longitudinal ({listaSeg.length})
                    </h3>
                    {listaSeg.length===0 ? (
                      <p className="text-sm text-gray-500 italic">Sin seguimientos. Registre el basal (Pre-op) y continúe cada mes el primer año, luego anual.</p>
                    ) : (
                      <div className="space-y-2">
                        {listaSeg.map(s=>{
                          const banderasAct=Object.entries(s.banderas||{}).filter(([,v])=>v).map(([k])=>(BANDERAS_SEG.find(b=>b.k===k)?.l)||k);
                          const adh=s.sesionesProgramadas?`${s.sesionesAsistidas||0}/${s.sesionesProgramadas}`:null;
                          return (
                            <div key={s.id} className="p-3 rounded border-l-4" style={{borderColor:C.teal, background:'white'}}>
                              <div className="flex justify-between items-start gap-2 flex-wrap">
                                <div>
                                  <div className="font-bold text-sm" style={{color:C.navy}}>
                                    <span className="px-2 py-0.5 rounded text-xs text-white mr-2" style={{background:C.gold}}>{s.hito}</span>
                                    {fmtFechaHora(s.fecha)}
                                    {s.terapeuta && <span className="text-xs text-gray-600 font-normal ml-2">· {s.terapeuta}</span>}
                                  </div>
                                  <div className="text-xs text-gray-700 mt-1 flex flex-wrap gap-2">
                                    {s.bes!=='' && <span>BES {s.bes}</span>}
                                    {s.bdi!=='' && <span>· BDI {s.bdi}</span>}
                                    {s.gad7!=='' && <span>· GAD-7 {s.gad7}</span>}
                                    {s.eat26!=='' && <span>· EAT-26 {s.eat26}</span>}
                                    {adh && <span>· Adherencia {adh}</span>}
                                  </div>
                                  {banderasAct.length>0 && (
                                    <div className="text-xs mt-1" style={{color:C.red}}>⚠ {banderasAct.join(' · ')}</div>
                                  )}
                                  {s.plan && <div className="text-xs mt-1"><strong>Plan:</strong> {s.plan}</div>}
                                  {s.nota && <div className="text-xs text-gray-600 italic mt-1">{s.nota}</div>}
                                </div>
                                <button onClick={()=>eliminarSegConductual(s.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Plan conductual por fase (referencia)</h3>
                    <div className="space-y-2">
                      {CONDUCTUAL.map((f,i)=>(
                        <div key={i} className="p-3 rounded border-l-4" style={{background:C.cream,borderColor:C.gold}}>
                          <div className="font-bold text-sm mb-1" style={{color:C.navy}}>{f.fase}</div>
                          <ul className="space-y-1">
                            {f.acciones.map((a,j)=>(<li key={j} className="text-xs text-gray-700 flex gap-2"><CheckCircle2 size={12} style={{color:C.teal,flexShrink:0,marginTop:3}}/>{a}</li>))}
                          </ul>
                        </div>
                      ))}
                    </div>
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
