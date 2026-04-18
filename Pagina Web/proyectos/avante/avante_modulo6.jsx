import React, { useState, useEffect } from 'react';
import { Activity, GraduationCap, Heart, Users, BookOpen, DollarSign, FlaskConical, Siren, ChevronRight, CheckCircle2, AlertCircle, Download, Copy, Plus, Save, Phone, Share2, Mail, FileText, Trash2, Search } from 'lucide-react';
import { exportarPDF, descargarPDF, enviarPDFWhatsApp, enviarPDFEmail, storageGet, storageSet, fmtFechaHora } from './src_shared/utils.js';
import { useLang } from './src_shared/i18n.jsx';

const C = { navy:'#0A1F44', teal:'#1A8B9D', gold:'#C9A961', cream:'#FAF7F2', green:'#2D8659', yellow:'#E0A82E', red:'#C0392B' };
const PROCS = { sleeve:'Manga Gástrica', rygb:'RYGB', oagb:'OAGB', sadis:'SADI-S', bpdds:'BPD-DS', balon:'Balón intragástrico', rev_sg_rygb:'Rev. Manga→RYGB', rev_sg_oagb:'Rev. Manga→OAGB' };

function imc(p){const pe=parseFloat(p.peso),t=parseFloat(p.talla)/100;return (pe&&t)?pe/(t*t):0;}

const EDUCACION = [
  {tema:'¿Qué es la cirugía bariátrica?',contenido:'La cirugía bariátrica es un conjunto de procedimientos que ayudan a perder peso y mejorar enfermedades asociadas a la obesidad. No es una solución mágica: es una herramienta poderosa que requiere su compromiso de por vida con cambios en alimentación, ejercicio y seguimiento.'},
  {tema:'¿Cómo me preparo?',contenido:'Necesitará evaluaciones médicas (cardio, nutrición, psicología), exámenes de laboratorio, posiblemente endoscopia. Si fuma, debe suspenderlo al menos 6 semanas antes. Si tiene diabetes, optimizaremos su control. La preparación toma típicamente 4-8 semanas.'},
  {tema:'¿Qué pasa el día de la cirugía?',contenido:'Ingresará en ayunas. La cirugía dura 60-120 minutos por laparoscopía (mínimamente invasiva). Despertará en recuperación y subirá a su habitación. Comenzará a caminar el mismo día y a tomar líquidos a las pocas horas.'},
  {tema:'¿Cuánto tiempo estaré hospitalizado?',contenido:'Habitualmente 24-48 horas. En Avante el ambiente está diseñado para que se sienta como en un hotel, con su acompañante a su lado.'},
  {tema:'¿Cuánto peso perderé?',contenido:'Depende del procedimiento y de su compromiso. En promedio, los pacientes pierden 60-80% de su exceso de peso en los primeros 12-18 meses.'},
  {tema:'¿Qué riesgos existen?',contenido:'Toda cirugía tiene riesgos. Los más importantes en bariátrica son: fuga de la sutura (~1%), trombosis venosa, sangrado, infección. En centros acreditados como Avante son bajos.'},
  {tema:'¿Cómo será mi vida después?',contenido:'Su relación con la comida cambiará. Comerá porciones pequeñas, masticará lento, tomará vitaminas de por vida, asistirá a sus controles.'},
  {tema:'¿Puedo quedar embarazada?',contenido:'Sí, pero recomendamos esperar 12-18 meses después de la cirugía. Use anticoncepción efectiva durante ese tiempo.'}
];

const VARIABLES_REGISTRO = [
  {cat:'Demográficas',vars:'Edad, sexo, etnia, ocupación, nivel educativo'},
  {cat:'Antropométricas',vars:'Peso, talla, IMC, circunferencia abdominal, % grasa corporal'},
  {cat:'Comorbilidades',vars:'DM2 (HbA1c), HTA, AOS, ERGE, dislipidemia, NASH, SOP, depresión'},
  {cat:'Quirúrgicas',vars:'Procedimiento, duración, sangrado, técnica antirreflujo, drenajes'},
  {cat:'Postoperatorias',vars:'Estancia, Clavien-Dindo, reingreso, reintervención, mortalidad'},
  {cat:'Seguimiento',vars:'Peso a 1/3/6/12/24/60m, %PEP, %PTP, remisión, déficits'},
  {cat:'PROMs',vars:'BAROS, IWQOL-Lite, SF-36, satisfacción'},
  {cat:'Específicas Avante',vars:'TAP + bloqueo visceral autonómico, GLP-1 puente'}
];

const LINEAS_INVESTIGACION_DEFAULT = [
  'TAP block + bloqueo visceral autonómico en cirugía bariátrica',
  'Coledocolitiasis post-bariátrica: incidencia y manejo',
  'GLP-1 como puente preoperatorio en IMC≥50',
  'Resultados a largo plazo de manga vs RYGB en población centroamericana',
  'NASH/MAFLD pre y postoperatorio',
  'Costo-efectividad de la cirugía bariátrica en sistema privado salvadoreño'
];

const CODIGOS_EMERGENCIA = [
  {codigo:'CÓDIGO FUGA',disparador:'Taquicardia >120 + dolor abdominal + fiebre',acciones:['Activar equipo quirúrgico','TC con contraste oral STAT','Reservar quirófano','NPO, fluidos IV, antibiótico amplio espectro','Avisar UCI','Reintervención si confirma o alta sospecha']},
  {codigo:'CÓDIGO TEP',disparador:'Disnea súbita + taquicardia + desaturación',acciones:['Oxígeno suplementario','Angio-TC pulmonar STAT','Anticoagulación terapéutica empírica','Avisar UCI / cardiología','Eco transtorácico','Considerar trombolisis si inestabilidad']},
  {codigo:'CÓDIGO HERNIA',disparador:'Dolor cólico tardío + vómito biliar (RYGB/OAGB)',acciones:['TC abdominal urgente','NPO, SNG','Laparoscopía exploradora si alta sospecha','Cierre de defectos mesentéricos','Resección si compromiso vascular']},
  {codigo:'CÓDIGO WERNICKE',disparador:'Confusión + ataxia + nistagmo + vómito persistente',acciones:['Tiamina 500mg IV c/8h x 3 días ANTES de glucosa','Hidratación cuidadosa','Neurología','RM cerebro','Soporte nutricional']},
  {codigo:'CÓDIGO HEMORRAGIA',disparador:'Hipotensión + taquicardia + caída Hb + sangrado',acciones:['Reanimación con cristaloides','Tipificar y cruzar 4U PRBC','Endoscopia urgente si intraluminal','TC con contraste si intraabdominal','Reintervención si inestabilidad']}
];

// Consentimiento editable default
function consentimientoDefault(p){
  return `CONSENTIMIENTO INFORMADO · CIRUGÍA BARIÁTRICA
AVANTE COMPLEJO HOSPITALARIO

Paciente: ${p.nombre||''} ${p.apellido||''}   JVPM: ${p.jvpm||'—'}   NUE: ${p.nue||'—'}
Edad: ${p.edad||'—'}  IMC: ${imc(p).toFixed(1)}
Procedimiento propuesto: ${PROCS[p.procedimiento]||'—'}

NATURALEZA DEL PROCEDIMIENTO:
Se realizará ${PROCS[p.procedimiento]||'el procedimiento'} por vía laparoscópica bajo anestesia general.

ALTERNATIVAS:
Dieta, ejercicio, farmacoterapia con GLP-1, balón intragástrico (opción electiva IFSO/ASMBS), ESG, y otros procedimientos quirúrgicos.

BENEFICIOS ESPERADOS:
- Pérdida de peso 60-80% del exceso
- Mejoría/remisión de DM, HTA, AOS, ERGE, dislipidemia
- Mejoría en calidad y expectativa de vida
- Reducción de riesgo cardiovascular y oncológico

RIESGOS Y COMPLICACIONES:
Sangrado, infección, TEV, reacciones anestésicas. Riesgos específicos: fuga (~1%), estenosis, hernia interna, déficits nutricionales, dumping, ERGE de novo. Mortalidad <0.3%.

COMPROMISOS DEL PACIENTE:
- Indicaciones pre y postoperatorias
- Seguimiento de por vida
- Suplementos nutricionales
- Citas de nutrición, psicología y cirugía
- Notificar signos de alarma

DECLARACIÓN:
Declaro que he leído y entendido esta información, he tenido oportunidad de hacer preguntas y han sido respondidas satisfactoriamente.

Firma del paciente: _______________________  Fecha: ___________
Firma del testigo: ________________________  Fecha: ___________
Firma del cirujano: _______________________  Fecha: ___________`;
}

const PAQUETES_DEFAULT = {
  sleeve:{honorarios:4500,hospital:6500,anestesia:1200,materiales:2800},
  rygb:{honorarios:5500,hospital:7500,anestesia:1400,materiales:3600},
  oagb:{honorarios:5000,hospital:7000,anestesia:1300,materiales:3200},
  sadis:{honorarios:6500,hospital:8500,anestesia:1600,materiales:4400},
  bpdds:{honorarios:7000,hospital:9000,anestesia:1700,materiales:4800},
  balon:{honorarios:2500,hospital:2500,anestesia:600,materiales:2000},
  rev_sg_rygb:{honorarios:6500,hospital:8500,anestesia:1600,materiales:4200},
  rev_sg_oagb:{honorarios:6000,hospital:8000,anestesia:1500,materiales:4000}
};

const CONTACTOS_DEFAULT = {
  pbx:'+503 2537-6161',
  medico:'Dr. Ángel Henríquez · +503 ____-____',
  nutricionista:'Nutricionista · +503 ____-____',
  psicologa:'Psicóloga · +503 ____-____',
  asesora:'Asesora · +503 ____-____',
  emergencia:'+503 2537-6161 (24/7)'
};

// Sencillo análisis cruzado - proporciona cruces frecuentes (sin back-end)
function analisisCruzado(pacientes, segs){
  const out = [];
  if(!pacientes || pacientes.length===0) return [{cruce:'Sin datos', valor:'—'}];
  const i = pacientes.map(p=>imc(p)).filter(x=>x>0);
  const mediaIMC = i.length?(i.reduce((a,b)=>a+b,0)/i.length):0;
  out.push({cruce:'IMC preoperatorio medio', valor: mediaIMC.toFixed(1)});
  const edades = pacientes.map(p=>parseFloat(p.edad)).filter(x=>!isNaN(x));
  out.push({cruce:'Edad media', valor: edades.length?(edades.reduce((a,b)=>a+b,0)/edades.length).toFixed(1)+' a':'—'});
  const sexM = pacientes.filter(p=>p.sexo==='M').length;
  const sexF = pacientes.filter(p=>p.sexo==='F').length;
  out.push({cruce:'Distribución sexo', valor:`M ${sexM} · F ${sexF}`});
  const procs = {};
  pacientes.forEach(p=>{if(p.procedimiento){procs[p.procedimiento]=(procs[p.procedimiento]||0)+1;}});
  out.push({cruce:'Distribución procedimiento', valor: Object.entries(procs).map(([k,v])=>`${PROCS[k]||k}:${v}`).join(' · ')||'—'});
  const dm = pacientes.filter(p=>p.comorbilidades&&p.comorbilidades.dm).length;
  out.push({cruce:'DM2 preoperatoria', valor: `${dm}/${pacientes.length} (${pacientes.length?((dm/pacientes.length)*100).toFixed(1):0}%)`});
  // Cruce peso preop vs peso último seguimiento
  let twlSuma=0, twlN=0;
  pacientes.forEach(p=>{
    const ss = (segs||{})[p.id];
    if(ss && ss.length){
      const ult = ss[ss.length-1];
      const pi=parseFloat(p.peso), pa=parseFloat(ult.peso);
      if(pi && pa){ twlSuma += ((pi-pa)/pi)*100; twlN++; }
    }
  });
  out.push({cruce:'%PTP medio (seguidos)', valor: twlN?(twlSuma/twlN).toFixed(1)+'%':'—'});
  return out;
}

// Generador estilo Vancouver - plantilla auto-rellenada con datos reales
function generarBorradorArticulo(titulo, pacientes, segs, lineasEvidencia){
  const anoHoy = new Date().getFullYear();
  const n = pacientes ? pacientes.length : 0;
  const cruces = analisisCruzado(pacientes, segs);
  const tabla = cruces.map(c=>`  - ${c.cruce}: ${c.valor}`).join('\n');
  return `BORRADOR DE ARTÍCULO CIENTÍFICO · ESTILO VANCOUVER
Título: ${titulo}
Autores: Henríquez A, et al.
Institución: Avante Complejo Hospitalario, San Salvador, El Salvador
Año: ${anoHoy}

RESUMEN
Antecedentes: La obesidad es una pandemia con morbimortalidad creciente y la cirugía bariátrica es el tratamiento más efectivo a largo plazo [1,2]. Se presentan resultados preliminares del registro institucional Avante.

Métodos: Estudio retrospectivo observacional del registro prospectivo de pacientes sometidos a cirugía bariátrica en Avante Complejo Hospitalario. Variables demográficas, antropométricas, quirúrgicas y de seguimiento. Análisis descriptivo.

Resultados: n=${n} pacientes.
${tabla}

Discusión: Los hallazgos son coherentes con la literatura internacional [3-5]. Se destaca la incorporación de bloqueo visceral autonómico combinado con TAP block como parte del protocolo ERAS. Limitaciones: tamaño muestral, seguimiento heterogéneo.

Conclusión: La implementación de un protocolo estandarizado con documentación digital y clasificaciones predictivas (MAGKOS-Aminian, MACE, SPLENDID, ADAMS/SM-BOSS, BWTP, SleevePass) permite mejorar la toma de decisiones y medir resultados.

REFERENCIAS (estilo Vancouver, completar):
1. Schauer PR, et al. Bariatric surgery vs intensive medical therapy in obese patients with diabetes. N Engl J Med. 2012;366:1567-76.
2. Adams TD, et al. Weight and metabolic outcomes 12 years after gastric bypass. N Engl J Med. 2017;377:1143-55.
3. Salminen P, et al. Effect of laparoscopic sleeve gastrectomy vs laparoscopic Roux-en-Y gastric bypass on weight loss at 5 years (SLEEVEPASS). JAMA. 2018;319:241-54.
4. Peterli R, et al. Effect of laparoscopic sleeve gastrectomy vs laparoscopic Roux-en-Y gastric bypass on weight loss in patients with morbid obesity: the SM-BOSS randomized clinical trial. JAMA. 2018;319:255-65.
5. Aminian A, et al. Long-term relationship between weight loss, insulin resistance and diabetes remission after bariatric surgery. JAMA Surg. 2020;155:e200087.

${lineasEvidencia.map((l,i)=>`${i+6}. ${l}`).join('\n')}

NOTA: Este borrador se genera automáticamente como punto de partida. La revisión metodológica, análisis estadístico formal y validación de las referencias deben realizarse por el investigador principal antes del envío.`;
}

export default function Modulo6(){
  const { t } = useLang();
  const [modo,setModo]=useState('clinico');
  const [pacientes,setPacientes]=useState([]);
  const [segs,setSegs]=useState({});
  const [seleccionado,setSeleccionado]=useState(null);
  const [tab,setTab]=useState('educacion');
  const [cargando,setCargando]=useState(true);
  const [consentimientos,setConsentimientos]=useState({});
  const [paquetes,setPaquetes]=useState(PAQUETES_DEFAULT);
  const [contactos,setContactos]=useState(CONTACTOS_DEFAULT);
  const [lineas,setLineas]=useState(LINEAS_INVESTIGACION_DEFAULT);
  const [nuevaLinea,setNuevaLinea]=useState('');
  const [consActual,setConsActual]=useState('');
  const [tituloArticulo,setTituloArticulo]=useState('Resultados a corto plazo de un protocolo perioperatorio estandarizado en cirugía bariátrica: experiencia Avante');

  useEffect(()=>{(async()=>{
    setPacientes(await storageGet('avante_pacientes')||[]);
    setSegs(await storageGet('avante_seguimientos')||{});
    setConsentimientos(await storageGet('avante_consentimientos')||{});
    setPaquetes(await storageGet('avante_paquetes')||PAQUETES_DEFAULT);
    setContactos(await storageGet('avante_contactos')||CONTACTOS_DEFAULT);
    setLineas(await storageGet('avante_lineas_investig')||LINEAS_INVESTIGACION_DEFAULT);
    setCargando(false);
  })();},[]);

  useEffect(()=>{
    if(seleccionado){
      setConsActual(consentimientos[seleccionado.id] || consentimientoDefault(seleccionado));
    }
  },[seleccionado]);

  const guardarConsentimiento=async()=>{
    const act={...consentimientos,[seleccionado.id]:consActual};
    setConsentimientos(act); await storageSet('avante_consentimientos',act);
    alert('Consentimiento guardado');
  };
  const guardarPaquete=async(proc,campo,val)=>{
    const p={...paquetes[proc],[campo]:parseFloat(val)||0};
    const act={...paquetes,[proc]:p};
    setPaquetes(act); await storageSet('avante_paquetes',act);
  };
  const guardarContacto=async(k,v)=>{
    const act={...contactos,[k]:v};
    setContactos(act); await storageSet('avante_contactos',act);
  };
  const agregarLinea=async()=>{
    if(!nuevaLinea.trim())return;
    const act=[...lineas,nuevaLinea.trim()];
    setLineas(act); await storageSet('avante_lineas_investig',act); setNuevaLinea('');
  };
  const eliminarLinea=async(i)=>{
    const act=lineas.filter((_,j)=>j!==i);
    setLineas(act); await storageSet('avante_lineas_investig',act);
  };

  const pdfEducacion=()=>{
    return exportarPDF({
      titulo:'Guía educativa para el paciente',
      subtitulo:'Cirugía bariátrica y metabólica',
      secciones: EDUCACION.map(e=>({titulo:e.tema,lineas:[e.contenido]})),
      footer:'Avante · Material educativo'
    });
  };
  const pdfConsentimiento=()=>{
    return exportarPDF({
      titulo:'Consentimiento informado',
      subtitulo:seleccionado?`${seleccionado.nombre||''} ${seleccionado.apellido||''}`:'Paciente',
      secciones:[{titulo:'Consentimiento',lineas:consActual.split('\n')}],
      footer:'Avante · Consentimiento informado'
    });
  };
  const pdfCodigos=()=>{
    return exportarPDF({
      titulo:'Códigos de emergencia bariátrica',
      subtitulo:'Guía para residentes y fellows · Avante',
      secciones: CODIGOS_EMERGENCIA.map(c=>({titulo:`${c.codigo} — ${c.disparador}`,lineas:c.acciones})),
      footer:'Avante · Material para residentes y fellows'
    });
  };
  const pdfCostos=()=>{
    return exportarPDF({
      titulo:'Cotización de paquetes quirúrgicos',
      subtitulo:'USD · referencial',
      secciones: Object.entries(paquetes).map(([k,p])=>({
        titulo: PROCS[k]||k,
        lineas:[`Honorarios: $${p.honorarios}`,`Hospital: $${p.hospital}`,`Anestesia: $${p.anestesia}`,`Materiales: $${p.materiales}`,`TOTAL: $${p.honorarios+p.hospital+p.anestesia+p.materiales}`]
      })),
      footer:'Avante · Paquetes quirúrgicos'
    });
  };
  const pdfArticulo=()=>{
    const txt = generarBorradorArticulo(tituloArticulo, pacientes, segs, lineas);
    return exportarPDF({
      titulo:'Borrador científico (Vancouver)',
      subtitulo:tituloArticulo,
      secciones:[{titulo:'Borrador',lineas:txt.split('\n')}],
      footer:'Avante · Investigación'
    });
  };

  const copiar=(t)=>{navigator.clipboard.writeText(t); alert('Copiado');};
  const btn="px-4 py-2 rounded font-medium transition-colors";
  if(cargando)return <div className="p-8 text-center">Cargando...</div>;

  const cruces = analisisCruzado(pacientes, segs);

  return (
    <div className="min-h-screen p-4" style={{background:'#f3f4f6',fontFamily:'system-ui,sans-serif'}}>
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div style={{background:C.navy,color:'white'}} className="p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 style={{fontFamily:'Georgia,serif',color:C.gold}} className="text-3xl font-bold">Avante Complejo Hospitalario</h1>
              <p style={{fontFamily:'Georgia,serif'}} className="text-sm italic mt-1">{t('app.lema')}</p>
              <p className="text-xs mt-2 opacity-80">{t('modulo')} 6 · {t('mod.6.titulo')}</p>
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
          <div className="flex justify-between items-center mb-4 p-3 rounded flex-wrap gap-2" style={{background:C.cream}}>
            <div>
              <div className="font-bold" style={{color:C.navy}}>Paciente actual</div>
              <select value={seleccionado?seleccionado.id:''} onChange={e=>setSeleccionado(pacientes.find(p=>p.id===e.target.value)||null)} className="mt-1 px-2 py-1 rounded border text-sm">
                <option value="">— sin paciente —</option>
                {pacientes.map(p=><option key={p.id} value={p.id}>{(p.nombre||'')+' '+(p.apellido||'')}</option>)}
              </select>
            </div>
            <div className="flex gap-2 items-center text-xs">
              <Phone size={14} style={{color:C.red}}/>
              <span><strong>PBX 24/7:</strong> {contactos.pbx} · <strong>Emergencia:</strong> {contactos.emergencia}</span>
            </div>
          </div>

          <div className="flex gap-1 mb-4 border-b overflow-x-auto">
            {[{id:'educacion',i:BookOpen,k:'tab.educacion'},{id:'consentimiento',i:FileText,k:'tab.consentimiento'},{id:'costos',i:DollarSign,k:'tab.costos'},{id:'investigacion',i:FlaskConical,k:'tab.investigacion'},{id:'emergencias',i:Siren,k:'tab.emergencias'},{id:'contactos',i:Phone,k:'tab.contactos'}].map(tb=>{
              const I=tb.i;
              return <button key={tb.id} onClick={()=>setTab(tb.id)} className="px-3 py-2 flex items-center gap-1 text-sm font-medium border-b-2 whitespace-nowrap"
                style={{borderColor:tab===tb.id?C.gold:'transparent',color:tab===tb.id?C.navy:'#6b7280'}}><I size={14}/>{t(tb.k)}</button>;
            })}
          </div>

          {tab==='educacion' && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <button onClick={()=>descargarPDF(pdfEducacion(),'guia_educativa_avante')} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Download size={14}/>Descargar guía completa (PDF)</button>
                <button onClick={()=>enviarPDFWhatsApp(pdfEducacion(),'guia_educativa_avante', (seleccionado&&seleccionado.telefono)||'', 'Guía educativa Avante')} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:'#25D366'}}><Share2 size={14}/>WhatsApp</button>
                <button onClick={()=>enviarPDFEmail(pdfEducacion(),'guia_educativa_avante', (seleccionado&&seleccionado.email)||'', 'Guía educativa Avante', 'Adjunto guía educativa Avante')} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.navy}}><Mail size={14}/>Email</button>
              </div>
              {EDUCACION.map((e,i)=>(
                <div key={i} className="p-3 rounded border-l-4" style={{background:C.cream,borderColor:C.gold}}>
                  <div className="font-bold text-sm mb-1" style={{color:C.navy}}>{e.tema}</div>
                  <div className="text-sm text-gray-700">{e.contenido}</div>
                </div>
              ))}
            </div>
          )}

          {tab==='consentimiento' && (
            seleccionado ? (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <button onClick={guardarConsentimiento} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}><Save size={14}/>Guardar</button>
                  <button onClick={()=>setConsActual(consentimientoDefault(seleccionado))} className={btn+" text-sm"} style={{background:'#e5e7eb'}}>Restaurar plantilla</button>
                  <button onClick={()=>descargarPDF(pdfConsentimiento(),`consentimiento_${seleccionado.nombre||'pac'}`)} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Download size={14}/>PDF</button>
                  <button onClick={()=>enviarPDFWhatsApp(pdfConsentimiento(),`consentimiento_${seleccionado.nombre||'pac'}`,seleccionado.telefono||'','Consentimiento informado Avante')} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:'#25D366'}}><Share2 size={14}/>WhatsApp</button>
                  <button onClick={()=>enviarPDFEmail(pdfConsentimiento(),`consentimiento_${seleccionado.nombre||'pac'}`,seleccionado.email||'','Consentimiento informado','Adjunto consentimiento informado')} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.navy}}><Mail size={14}/>Email</button>
                </div>
                <textarea value={consActual} onChange={e=>setConsActual(e.target.value)} rows={26} className="w-full px-3 py-2 rounded border text-sm font-mono"/>
              </div>
            ) : <div className="p-4 rounded text-sm text-gray-600" style={{background:C.cream}}>Seleccione un paciente para editar su consentimiento.</div>
          )}

          {tab==='costos' && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <button onClick={()=>descargarPDF(pdfCostos(),'paquetes_avante')} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Download size={14}/>PDF de paquetes</button>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Tarifas editables (USD)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border">
                    <thead style={{background:C.navy,color:'white'}}>
                      <tr>
                        <th className="p-2 text-left">Procedimiento</th><th className="p-2">Honorarios</th><th className="p-2">Hospital</th><th className="p-2">Anestesia</th><th className="p-2">Materiales</th><th className="p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(paquetes).map(([k,p])=>(
                        <tr key={k} className="border-t">
                          <td className="p-2 font-bold" style={{color:C.navy}}>{PROCS[k]||k}</td>
                          {['honorarios','hospital','anestesia','materiales'].map(campo=>(
                            <td key={campo} className="p-1"><input type="number" value={p[campo]} onChange={e=>guardarPaquete(k,campo,e.target.value)} className="w-24 px-1 py-0.5 rounded border"/></td>
                          ))}
                          <td className="p-2 font-bold" style={{color:C.gold}}>${p.honorarios+p.hospital+p.anestesia+p.materiales}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Documentación para aseguradora</h3>
                <ul className="space-y-1 p-3 rounded text-sm" style={{background:C.cream}}>
                  {['Carta de solicitud firmada','Historia clínica con criterios IFSO/ASMBS','Cálculo de IMC','Comorbilidades con CIE-10','Reportes multidisciplinarios','Laboratorios <60 días','Endoscopia','Estudios de imagen','Cotización detallada','Consentimiento firmado'].map((d,i)=>(<li key={i} className="flex gap-2"><CheckCircle2 size={14} style={{color:C.teal,flexShrink:0,marginTop:3}}/>{d}</li>))}
                </ul>
              </div>
            </div>
          )}

          {tab==='investigacion' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Análisis cruzado automático</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {cruces.map((c,i)=>(
                    <div key={i} className="p-3 rounded" style={{background:C.cream}}>
                      <div className="text-xs text-gray-600">{c.cruce}</div>
                      <div className="font-bold" style={{color:C.navy}}>{c.valor}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Variables del registro institucional</h3>
                <div className="space-y-2">
                  {VARIABLES_REGISTRO.map((v,i)=>(
                    <div key={i} className="p-3 rounded border-l-4" style={{background:C.cream,borderColor:C.teal}}>
                      <div className="font-bold text-sm" style={{color:C.navy}}>{v.cat}</div>
                      <div className="text-xs text-gray-700">{v.vars}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Líneas de investigación (editable)</h3>
                <div className="space-y-1 mb-2">
                  {lineas.map((l,i)=>(
                    <div key={i} className="p-2 rounded border flex justify-between items-center">
                      <span className="text-sm flex-1">{l}</span>
                      <button onClick={()=>eliminarLinea(i)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={nuevaLinea} onChange={e=>setNuevaLinea(e.target.value)} placeholder="Nueva línea de investigación" className="flex-1 px-2 py-1 rounded border text-sm"/>
                  <button onClick={agregarLinea} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}><Plus size={14}/>Agregar</button>
                </div>
              </div>

              <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Generador de borrador (estilo Vancouver)</h3>
                <input value={tituloArticulo} onChange={e=>setTituloArticulo(e.target.value)} className="w-full px-2 py-1 rounded border text-sm mb-2"/>
                <div className="flex gap-2 flex-wrap mb-2">
                  <button onClick={()=>descargarPDF(pdfArticulo(),'borrador_avante')} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Download size={14}/>PDF del borrador</button>
                  <button onClick={()=>copiar(generarBorradorArticulo(tituloArticulo,pacientes,segs,lineas))} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}><Copy size={14}/>Copiar texto</button>
                  <a href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(tituloArticulo)}`} target="_blank" rel="noopener noreferrer" className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.navy}}><Search size={14}/>Buscar estudios relacionados en PubMed</a>
                </div>
                <pre className="text-xs whitespace-pre-wrap font-mono max-h-64 overflow-y-auto p-2 rounded border bg-white" style={{color:C.navy}}>{generarBorradorArticulo(tituloArticulo,pacientes,segs,lineas)}</pre>
              </div>
            </div>
          )}

          {tab==='emergencias' && (
            <div className="space-y-3">
              <div className="p-3 rounded border flex flex-wrap items-center gap-3" style={{borderColor:C.red,background:'#fff7f5'}}>
                <Siren size={24} style={{color:C.red}}/>
                <div className="flex-1">
                  <div className="font-bold" style={{color:C.red}}>Avante PBX 24/7: {contactos.pbx}</div>
                  <div className="text-xs text-gray-700">Línea de emergencia: {contactos.emergencia}</div>
                </div>
                <button onClick={()=>descargarPDF(pdfCodigos(),'codigos_emergencia_avante')} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.red}}><Download size={14}/>Descargar códigos (residentes/fellows)</button>
              </div>
              {CODIGOS_EMERGENCIA.map((c,i)=>(
                <div key={i} className="p-4 rounded border-l-4" style={{borderColor:C.red,background:C.cream}}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={18} style={{color:C.red}}/>
                    <div className="font-bold" style={{color:C.red}}>{c.codigo}</div>
                  </div>
                  <div className="text-xs italic text-gray-600 mb-2">Disparador: {c.disparador}</div>
                  <ul className="space-y-1">
                    {c.acciones.map((a,j)=>(<li key={j} className="text-sm flex gap-2"><CheckCircle2 size={14} style={{color:C.teal,flexShrink:0,marginTop:3}}/>{a}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {tab==='contactos' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Los contactos se guardan automáticamente al editar.</p>
              {Object.entries(contactos).map(([k,v])=>(
                <div key={k} className="flex gap-2 items-center">
                  <label className="w-32 text-xs uppercase font-bold" style={{color:C.navy}}>{k}</label>
                  <input value={v} onChange={e=>guardarContacto(k,e.target.value)} className="flex-1 px-2 py-1 rounded border text-sm"/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
