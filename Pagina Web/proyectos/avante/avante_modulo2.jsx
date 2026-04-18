import React, { useState, useEffect } from 'react';
import { Activity, GraduationCap, Heart, Users, CheckCircle2, AlertCircle, AlertTriangle, ChevronRight, Pill, Stethoscope, Shield, Download, Share2, Mail } from 'lucide-react';
import { exportarPDF, descargarPDF, enviarPDFWhatsApp, enviarPDFEmail, storageGet } from './src_shared/utils.js';
import { useLang } from './src_shared/i18n.jsx';

const C = { navy:'#0A1F44', teal:'#1A8B9D', gold:'#C9A961', cream:'#FAF7F2', green:'#2D8659', yellow:'#E0A82E', red:'#C0392B' };

const PROCS = {
  sleeve:'Manga Gástrica', rygb:'RYGB', oagb:'OAGB', sadis:'SADI-S', bpdds:'BPD-DS',
  balon:'Balón intragástrico (electivo · IFSO/ASMBS)',
  rev_sg_rygb:'Revisión Manga→RYGB', rev_sg_oagb:'Revisión Manga→OAGB'
};

function imc(p){const pe=parseFloat(p.peso),t=parseFloat(p.talla)/100;return (pe&&t)?pe/(t*t):0;}

function planOptimizacion(p){
  const items=[]; const i=imc(p.peso,p.talla); const c=p.comorbilidades||{};
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

// Balón ahora aparece como opción electiva según IFSO/ASMBS 2024 (no sólo como puente):
//  - IMC 27-35 con o sin comorbilidades
//  - rechazo/temor a cirugía definitiva
//  - necesidad de demostrar adherencia previa a cirugía (opcional)
//  - puente a cirugía si IMC ≥ 50
function recomendarProcedimiento(p){
  const i=imc(p.peso,p.talla); const c=p.comorbilidades||{};
  const candidatos=[];

  // BALÓN como opción electiva preferente en IMC 27-35 sin alto riesgo metabólico
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

function protocoloProfilaxis(p){
  const c=p.comorbilidades||{}; const i=imc(p.peso,p.talla);
  let cap=5; const e=parseFloat(p.edad)||0;
  if(e>=75)cap+=3; else if(e>=61)cap+=2; else if(e>=41)cap+=1;
  if(c.tep)cap+=3; if(c.ivc)cap+=1; if(c.cardio)cap+=1; if(c.aos)cap+=1; if(i>=40)cap+=1;

  const tev = cap>=8 ? {nivel:'alto',plan:'HBPM dosis ajustada por peso (enoxaparina 40mg c/12h si IMC≥40 o 60mg c/12h si IMC≥50) + CCN. Profilaxis extendida 2-4 semanas post-alta.'} :
              cap>=5 ? {nivel:'moderado-alto',plan:'HBPM (enoxaparina 40mg SC c/24h, ajustar a c/12h si IMC≥40) + compresión neumática intermitente. Iniciar 12h post-op.'} :
              {nivel:'moderado',plan:'HBPM estándar + medias de compresión + deambulación temprana.'};

  const atb = {plan:'Cefazolina 2g IV (3g si peso>120kg) 30-60min pre-incisión. Re-dosificar a las 4h o si pérdida >1500mL.'};

  const eras = [
    'Ayuno mínimo: sólidos 6h, líquidos claros 2h',
    'Carga de carbohidratos 2h pre-op (si no DM descompensada)',
    'Profilaxis antiemética multimodal (ondansetrón + dexametasona)',
    'Analgesia multimodal: TAP block + bloqueo visceral autonómico (su técnica) + paracetamol/AINE',
    'Evitar opioides sistémicos, minimizar fluidos IV',
    'Sonda vesical solo si necesaria, retirar <24h',
    'Movilización <6h post-op, dieta líquida <12h',
    'Egreso 24-48h con criterios objetivos'
  ];

  return {tev,caprini:cap,atb,eras};
}

export default function Modulo2(){
  const { t } = useLang();
  const [modo,setModo]=useState('clinico');
  const [pacientes,setPacientes]=useState([]);
  const [seleccionado,setSeleccionado]=useState(null);
  const [tab,setTab]=useState('optimizacion');
  const [cargando,setCargando]=useState(true);

  useEffect(()=>{(async()=>{
    const r=await storageGet('avante_pacientes'); if(r) setPacientes(r);
    setCargando(false);
  })();},[]);

  const construirPDF = () => {
    const opt=planOptimizacion(seleccionado);
    const proc=recomendarProcedimiento(seleccionado);
    const pr=protocoloProfilaxis(seleccionado);
    return exportarPDF({
      titulo:'Plan Perioperatorio',
      subtitulo:`${seleccionado.nombre||''} ${seleccionado.apellido||''}`.trim() + ` · ${seleccionado.edad}a · IMC ${imc(seleccionado).toFixed(1)}`,
      secciones:[
        { titulo:'Optimización preoperatoria', lineas: opt.map(x=>`[${x.prio.toUpperCase()}] ${x.area} (${x.tiempo}): ${x.accion}`) },
        { titulo:'Selección de procedimiento', lineas: proc.map((x,i)=>`${i+1}. ${PROCS[x.proc]} (score ${x.score}/100) — ${x.razon}`) },
        { titulo:`Profilaxis TEV · Caprini ${pr.caprini} · riesgo ${pr.tev.nivel}`, lineas:[pr.tev.plan] },
        { titulo:'Profilaxis antibiótica', lineas:[pr.atb.plan] },
        { titulo:'Protocolo ERAS Bariátrico', lineas: pr.eras }
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
                {[{id:'optimizacion',i:Pill,l:'Optimización'},{id:'seleccion',i:Stethoscope,l:'Selección procedimiento'},{id:'profilaxis',i:Shield,l:'Profilaxis perioperatoria'}].map(t=>{
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

              {tab==='profilaxis' && (() => {
                const pr=protocoloProfilaxis(seleccionado);
                if(modo==='paciente') return (
                  <div className="p-6 rounded text-center" style={{background:C.cream}}>
                    <Shield size={40} style={{color:C.teal}} className="mx-auto mb-3"/>
                    <h3 style={{fontFamily:'Georgia,serif',color:C.navy}} className="text-xl font-bold mb-2">Su seguridad es nuestra prioridad</h3>
                    <p className="text-gray-700">Aplicamos los protocolos internacionales más rigurosos para prevenir complicaciones durante y después de su cirugía.</p>
                  </div>
                );
                return (
                  <div className="space-y-3">
                    <div className="p-4 rounded" style={{background:C.cream}}>
                      <div className="font-bold text-sm mb-1" style={{color:C.navy}}>Profilaxis TEV (Caprini {pr.caprini} · riesgo {pr.tev.nivel})</div>
                      <div className="text-sm text-gray-700">{pr.tev.plan}</div>
                    </div>
                    <div className="p-4 rounded" style={{background:C.cream}}>
                      <div className="font-bold text-sm mb-1" style={{color:C.navy}}>Profilaxis antibiótica</div>
                      <div className="text-sm text-gray-700">{pr.atb.plan}</div>
                    </div>
                    <div className="p-4 rounded" style={{background:C.cream}}>
                      <div className="font-bold text-sm mb-2" style={{color:C.navy}}>Protocolo ERAS Bariátrico</div>
                      <ul className="space-y-1">
                        {pr.eras.map((e,i)=>(<li key={i} className="text-sm text-gray-700 flex gap-2"><CheckCircle2 size={14} style={{color:C.teal,flexShrink:0,marginTop:3}}/>{e}</li>))}
                      </ul>
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
