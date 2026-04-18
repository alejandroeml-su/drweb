import React, { useState, useEffect } from 'react';
import { Activity, GraduationCap, Heart, Users, Calendar, Apple, AlertOctagon, TrendingDown, ChevronRight, CheckCircle2, AlertCircle, AlertTriangle, Download, Plus, FlaskConical, Upload, FileText, Trash2, Share2, Mail, ClipboardList, Save } from 'lucide-react';
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

// Dieta día 1 por defecto - EDITABLE por el equipo
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

const TEMPRANO = [
  {h:'24h',items:['Signos vitales c/4h','Tolerancia a líquidos claros','Movilización activa','Drenaje: características (si presente)','Dolor EVA <4','Profilaxis TEV continua','Sonda vesical "se retira si la hubiese"']},
  {h:'48h',items:['Test de azul de metileno o estudio contrastado si protocolo','Avance a líquidos completos','Egreso si criterios cumplidos']},
  {h:'72h-1 sem',items:['Control telefónico 24-48h post-egreso','Dieta líquida hiperproteica','Hidratación ≥1.5L/día','Profilaxis TEV extendida (HBPM 2-4 sem)','Signos de alarma: taquicardia >120, fiebre, dolor abdominal severo']}
];

const FASES = [
  {fase:'Fase 1 - Líquidos claros',tiempo:'Día 1-3',contenido:'Agua, caldo desgrasado, gelatina sin azúcar, té. 30mL c/15min.'},
  {fase:'Fase 2 - Líquidos completos',tiempo:'Día 4-14',contenido:'Proteína en polvo (60g/día), leche descremada/almendras, yogurt líquido. Sin azúcar.'},
  {fase:'Fase 3 - Purés',tiempo:'Sem 3-4',contenido:'Proteína blanda (huevo, atún, pollo molido), verduras cocidas en puré.'},
  {fase:'Fase 4 - Sólidos blandos',tiempo:'Sem 5-6',contenido:'Pescado, pollo desmenuzado, vegetales cocidos. Masticar 20-30 veces.'},
  {fase:'Fase 5 - Dieta regular',tiempo:'Sem 7+',contenido:'Dieta hiperproteica 60-80g/día, evitar azúcares simples, hidratación entre comidas.'}
];

function suplementacion(proc){
  const base=['Multivitamínico bariátrico 2/día','Calcio citrato 1200-1500 mg/día','Vitamina D3 3000 UI/día','Vitamina B12 500 mcg SL/día o 1000 mcg IM mensual','Tiamina 12 mg/día (50-100 mg primeros 3 meses)'];
  if(proc==='rygb'||proc==='oagb'||proc==='rev_sg_rygb'||proc==='rev_sg_oagb') base.push('Hierro elemental 45-60 mg/día');
  if(proc==='sadis'||proc==='bpdds'){base.push('Hierro elemental 60-100 mg/día');base.push('Vitaminas liposolubles: A 10000 UI, E 400 UI, K 300 mcg');base.push('Zinc 16 mg/día + Cobre 2 mg/día');}
  return base;
}

const LABS = {
  '1m':['Hemograma','Glucosa','Creatinina','Electrolitos','PFH'],
  '3m':['Hemograma','Glucosa/HbA1c','Perfil lipídico','PFH','Hierro/ferritina','B12','Vit D','PTH','Albúmina'],
  '6m':['Igual que 3m + Ácido fólico, Zinc, Calcio iónico'],
  '12m':['Panel bariátrico completo: hemograma, química, hierro/ferritina, B12, fólico, vit D, PTH, calcio, zinc, cobre, A/E, tiamina'],
  'anual':['Panel bariátrico completo + DEXA si >40a o factores riesgo']
};

// Catálogo de complicaciones - checklist por paciente con fecha
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

  // Nuevos estados: dieta editable, nota evolución, plan nutricional, complicaciones paciente
  const [dietaD1,setDietaD1]=useState({});      // { [pacienteId]: [string, ...] }
  const [evoluciones,setEvoluciones]=useState({}); // { [pacienteId]: [{fecha, texto, firmadoPor}] }
  const [nuevaEvolucion,setNuevaEvolucion]=useState('');
  const [firmaEvolucion,setFirmaEvolucion]=useState('');
  const [planNutri,setPlanNutri]=useState({}); // { [pacienteId]: {archivo, nombre, fecha, notas} }
  const [planNutriArchivo,setPlanNutriArchivo]=useState(null);
  const [planNutriNombre,setPlanNutriNombre]=useState('');
  const [planNutriNotas,setPlanNutriNotas]=useState('');
  const [complsPaciente,setComplsPaciente]=useState({}); // { [pacienteId]: { [complId]: {fecha, notas} } }
  const [filasDietaEditada,setFilasDietaEditada]=useState([]);

  useEffect(()=>{(async()=>{
    setPacientes(await storageGet('avante_pacientes') || []);
    setSeguimientos(await storageGet('avante_seguimientos') || {});
    setLabs(await storageGet('avante_labs') || {});
    setDietaD1(await storageGet('avante_dieta_d1') || {});
    setEvoluciones(await storageGet('avante_evoluciones') || {});
    setPlanNutri(await storageGet('avante_plan_nutri') || {});
    setComplsPaciente(await storageGet('avante_complicaciones') || {});
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

  const guardarDietaD1=async()=>{
    const actualizado={...dietaD1,[seleccionado.id]:filasDietaEditada};
    setDietaD1(actualizado);
    await storageSet('avante_dieta_d1',actualizado);
  };

  const guardarEvolucion=async()=>{
    if(!seleccionado||!nuevaEvolucion.trim())return;
    const lista=evoluciones[seleccionado.id]||[];
    const nueva={fecha:new Date().toISOString(),texto:nuevaEvolucion.trim(),firmadoPor:firmaEvolucion.trim()};
    const actualizado={...evoluciones,[seleccionado.id]:[...lista,nueva]};
    setEvoluciones(actualizado);
    await storageSet('avante_evoluciones',actualizado);
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
    setPlanNutri(actualizado);
    await storageSet('avante_plan_nutri',actualizado);
    alert('Plan nutricional guardado');
  };

  const toggleCompl=async(complId)=>{
    const actual=complsPaciente[seleccionado.id]||{};
    const existe=actual[complId];
    const nuevo={...actual};
    if(existe) delete nuevo[complId];
    else nuevo[complId]={fecha:new Date().toISOString(),notas:''};
    const actualizado={...complsPaciente,[seleccionado.id]:nuevo};
    setComplsPaciente(actualizado);
    await storageSet('avante_complicaciones',actualizado);
  };
  const actualizarComplNota=async(complId,campo,valor)=>{
    const actual=complsPaciente[seleccionado.id]||{};
    if(!actual[complId])return;
    const nuevo={...actual,[complId]:{...actual[complId],[campo]:valor}};
    const actualizado={...complsPaciente,[seleccionado.id]:nuevo};
    setComplsPaciente(actualizado);
    await storageSet('avante_complicaciones',actualizado);
  };

  const guardarLab=async()=>{
    if(!seleccionado)return;
    const lista=labs[seleccionado.id]||[];
    const nuevo={...nuevoLab,id:Date.now().toString(),fecha:nuevoLab.fecha?new Date(nuevoLab.fecha).toISOString():new Date().toISOString()};
    const actualizado={...labs,[seleccionado.id]:[...lista,nuevo]};
    setLabs(actualizado);
    await storageSet('avante_labs',actualizado);
    setNuevoLab({tipo:'inicial',fecha:nowLocalInput(),valores:{},archivo:null,archivoNombre:''});
  };
  const eliminarLab=async(id)=>{
    if(!seleccionado)return;
    const lista=(labs[seleccionado.id]||[]).filter(x=>x.id!==id);
    const actualizado={...labs,[seleccionado.id]:lista};
    setLabs(actualizado);
    await storageSet('avante_labs',actualizado);
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
    setSeguimientos(actualizado);
    await storageSet('avante_seguimientos',actualizado);
    setPesoNuevo(''); setFechaSeg(nowLocalInput());
  };

  const construirPDF = () => {
    const segs=seguimientos[seleccionado.id]||[];
    const evs=evoluciones[seleccionado.id]||[];
    const compls=complsPaciente[seleccionado.id]||{};
    const dieta=dietaD1[seleccionado.id]||DIETA_D1_DEFAULT;
    const pn=planNutri[seleccionado.id]||{};
    const lb=labs[seleccionado.id]||[];
    return exportarPDF({
      titulo:'Seguimiento Postoperatorio',
      subtitulo:`${seleccionado.nombre||''} ${seleccionado.apellido||''} · ${PROCS[seleccionado.procedimiento]||''}`,
      secciones:[
        { titulo:'Dieta día 1 (editable por el equipo)', lineas: dieta },
        { titulo:'Plan nutricional (archivo cargado)', lineas:[pn.nombre?'Archivo: '+pn.nombre:'Sin archivo', pn.notas||''].filter(Boolean) },
        { titulo:'Evolución ponderal', lineas: segs.map(s=>`${s.hito} · ${fmtFH(s.fecha)} · ${s.peso} kg · %PTP ${ptp(seleccionado.peso,s.peso).toFixed(1)}% · %PEP ${pep(seleccionado.peso,s.peso,seleccionado.talla).toFixed(1)}%`) },
        { titulo:'Laboratorios y otros estudios', lineas: lb.map(l=>`${l.tipo} · ${fmtFH(l.fecha)}${l.archivoNombre?' · '+l.archivoNombre:''} · ${LAB_PARAMS.filter(p=>l.valores&&l.valores[p.k]).map(p=>`${p.l}:${l.valores[p.k]}${p.u}`).join(', ')}`) },
        { titulo:'Notas de evolución clínica', lineas: evs.map(e=>`${fmtFH(e.fecha)}${e.firmadoPor?' · '+e.firmadoPor:''} — ${e.texto}`) },
        { titulo:'Complicaciones registradas', lineas: Object.entries(compls).map(([id,d])=>{const c=CATALOGO_COMPLICACIONES.find(x=>x.id===id);return c?`${c.dx} · ${fmtFH(d.fecha)}${d.notas?' — '+d.notas:''}`:'';}).filter(Boolean) },
        { titulo:'Suplementación indicada', lineas: suplementacion(seleccionado.procedimiento) }
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
                  {id:'evolucion',i:ClipboardList,k:'tab.evolucion'},
                  {id:'tardio',i:TrendingDown,k:'tab.tardio'},
                  {id:'labs',i:FlaskConical,k:'tab.labs'},
                  {id:'nutricion',i:Apple,k:'tab.nutricion'},
                  {id:'complicaciones',i:AlertOctagon,k:'tab.complicaciones'}
                ].map(tb=>{
                  const I=tb.i;
                  return <button key={tb.id} onClick={()=>setTab(tb.id)} className="px-3 py-2 flex items-center gap-1 text-sm font-medium border-b-2 whitespace-nowrap"
                    style={{borderColor:tab===tb.id?C.gold:'transparent',color:tab===tb.id?C.navy:'#6b7280'}}><I size={14}/>{t(tb.k)}</button>;
                })}
              </div>

              {tab==='temprano' && (
                <div className="space-y-4">
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
                      <div key={i} className="p-4 rounded border-l-4" style={{background:C.cream,borderColor:C.teal}}>
                        <div className="font-bold mb-2" style={{color:C.navy}}>{b.h}</div>
                        <ul className="space-y-1">
                          {b.items.map((x,j)=>(<li key={j} className="text-sm flex gap-2"><CheckCircle2 size={14} style={{color:C.teal,flexShrink:0,marginTop:3}}/>{x}</li>))}
                        </ul>
                      </div>
                    ))}
                  </div>
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
                    <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Suplementación para {PROCS[seleccionado.procedimiento]||'paciente'}</h3>
                    <ul className="space-y-1 p-3 rounded" style={{background:C.cream}}>
                      {suplementacion(seleccionado.procedimiento).map((s,i)=>(<li key={i} className="text-sm flex gap-2"><CheckCircle2 size={14} style={{color:C.teal,flexShrink:0,marginTop:3}}/>{s}</li>))}
                    </ul>
                  </div>
                </div>
              )}

              {tab==='complicaciones' && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600 mb-1">Marque las complicaciones presentes con fecha y notas.</div>
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
