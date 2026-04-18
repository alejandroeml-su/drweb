import React, { useState, useEffect } from 'react';
import { Activity, GraduationCap, Heart, Users, Pill, RefreshCw, Brain, Sparkles, ChevronRight, CheckCircle2, AlertCircle, AlertTriangle, Download, Share2, Mail, Plus, Save, Trash2 } from 'lucide-react';
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

function terapiasNoQx(p){
  const i=imc(p);const c=p.comorbilidades||{};const op=[];
  if(i>=27&&i<35){
    op.push({t:'GLP-1 / GIP-GLP-1',ind:'IMC 27-34.9 con comorbilidad o ≥30 sin comorbilidad',det:'Semaglutida 2.4mg SC semanal o tirzepatida 5-15mg SC semanal. Pérdida esperada: 15-22% peso corporal a 68 sem.',evid:'STEP-1, SURMOUNT-1'});
    op.push({t:'Balón intragástrico (electivo IFSO/ASMBS)',ind:'IMC 27-40, alternativa sin cirugía',det:'Orbera (6m) u Obalon. Pérdida esperada: 10-15% peso corporal. Reversible, electivo.',evid:'ASGE / IFSO 2024'});
  } else if(i>=30&&i<40){
    op.push({t:'GLP-1 / GIP-GLP-1',ind:'Primera línea farmacológica',det:'Semaglutida 2.4mg o tirzepatida. Considerar como puente o alternativa a cirugía.',evid:'STEP, SURMOUNT'});
    op.push({t:'ESG (Gastroplastia endoscópica en manga)',ind:'IMC 30-40, no candidato o no desea cirugía',det:'Sutura endoscópica (Apollo OverStitch). Pérdida 15-20% peso a 12-24 meses.',evid:'MERIT trial, NEJM 2022'});
    op.push({t:'Balón intragástrico',ind:'Como procedimiento electivo o puente',det:'6 meses de duración. Inducir cambios conductuales tempranos.',evid:'ASGE / IFSO / ASMBS'});
  } else if(i>=40){
    op.push({t:'Puente farmacológico GLP-1',ind:'IMC≥50 o alto riesgo quirúrgico',det:'Semaglutida/tirzepatida 4-6 meses pre-cirugía para reducir IMC ≥10%.',evid:'Estrategia bridge'});
    op.push({t:'Balón intragástrico puente',ind:'IMC≥50 con riesgo quirúrgico alto',det:'Reducción 10-15% peso previo a cirugía definitiva.',evid:'ASMBS position'});
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
    setCargando(false);
  })();},[]);

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
    return exportarPDF({
      titulo:'Manejo Integral No Quirúrgico',
      subtitulo:`${seleccionado.nombre||''} ${seleccionado.apellido||''} · IMC ${imc(seleccionado).toFixed(1)} · ${PROCS[seleccionado.procedimiento]||''}`,
      secciones:[
        { titulo:'Terapias no quirúrgicas aplicables', lineas: noqx.map(x=>`${x.t} — ${x.ind}. ${x.det}`) },
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
                {[{id:'noqx',i:Pill,k:'tab.glp1'},{id:'revision',i:RefreshCw,k:'tab.revision'},{id:'metabolico',i:Sparkles,k:'tab.metabolico'},{id:'conductual',i:Brain,k:'mod.4.sub',l:'Conductual'}].map(tb=>{
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
                      {modo==='academico' && <div className="text-xs mt-2 font-medium" style={{color:C.teal}}>Evidencia: {t.evid}</div>}
                    </div>
                  ))}
                </div>
              )}

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

              {tab==='conductual' && (() => {
                const listaSeg=(segsConductual[seleccionado.id]||[]).slice().sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));
                const toggleBandera=(k)=>setNuevoSegCond(s=>({...s,banderas:{...s.banderas,[k]:!s.banderas[k]}}));
                return (
                <div className="space-y-4">
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
