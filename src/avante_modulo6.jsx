import React, { useState, useEffect } from 'react';
import { Activity, GraduationCap, Heart, BookOpen, DollarSign, Siren, CheckCircle2, AlertCircle, Download, Save, Phone, Share2, Mail, FileText } from 'lucide-react';
import { exportarPDF, descargarPDF, enviarPDFWhatsApp, enviarPDFEmail, storageGet, storageSet } from './src_shared/utils.js';
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

const CODIGOS_EMERGENCIA = [
  {codigo:'CÓDIGO FUGA',disparador:'Taquicardia >120 + dolor abdominal + fiebre',acciones:['Activar equipo quirúrgico','TC con contraste oral STAT','Reservar quirófano','NPO, fluidos IV, antibiótico amplio espectro','Avisar UCI','Reintervención si confirma o alta sospecha']},
  {codigo:'CÓDIGO TEP',disparador:'Disnea súbita + taquicardia + desaturación',acciones:['Oxígeno suplementario','Angio-TC pulmonar STAT','Anticoagulación terapéutica empírica','Avisar UCI / cardiología','Eco transtorácico','Considerar trombolisis si inestabilidad']},
  {codigo:'CÓDIGO HERNIA',disparador:'Dolor cólico tardío + vómito biliar (RYGB/OAGB)',acciones:['TC abdominal urgente','NPO, SNG','Laparoscopía exploradora si alta sospecha','Cierre de defectos mesentéricos','Resección si compromiso vascular']},
  {codigo:'CÓDIGO WERNICKE',disparador:'Confusión + ataxia + nistagmo + vómito persistente',acciones:['Tiamina 500mg IV c/8h x 3 días ANTES de glucosa','Hidratación cuidadosa','Neurología','RM cerebro','Soporte nutricional']},
  {codigo:'CÓDIGO HEMORRAGIA',disparador:'Hipotensión + taquicardia + caída Hb + sangrado',acciones:['Reanimación con cristaloides','Tipificar y cruzar 4U PRBC','Endoscopia urgente si intraluminal','TC con contraste si intraabdominal','Reintervención si inestabilidad']}
];

// Plantillas específicas por procedimiento: naturaleza, alternativas, beneficios, riesgos
const PLANTILLAS_CONSENTIMIENTO = {
  sleeve:{
    naturaleza:'Manga gástrica laparoscópica (gastrectomía vertical). Se resecan aproximadamente 75–80 % del estómago para generar una manga de 60–100 mL calibrada sobre bujía 36–40 Fr.',
    alternativas:'Cambios de estilo de vida, farmacoterapia GLP-1/GIP-GLP-1, balón intragástrico, ESG, RYGB, OAGB, SADI-S, BPD-DS.',
    beneficios:['Pérdida del 55–70 % del exceso de peso a 2–5 años','Remisión/mejoría de DM2, HTA, AOS, dislipidemia','Procedimiento restrictivo sin desvíos intestinales'],
    riesgos:['Fuga de la línea de sutura (1–2 %)','Estenosis o torsión de la manga','ERGE de novo o empeoramiento (15–30 %)','Sangrado de la línea de grapas','Déficit de vitaminas (B12, D, hierro)','Reganancia de peso a largo plazo','Necesidad de conversión a RYGB/OAGB por ERGE o reganancia'],
    especificos:'No es reversible. La pérdida se estabiliza a 12–18 meses y requiere seguimiento nutricional y conductual de por vida.'
  },
  rygb:{
    naturaleza:'Bypass gástrico en Y de Roux laparoscópico. Se crea un pouch gástrico de 20–30 mL y una Y de Roux con asa alimentaria de 100–150 cm y asa biliopancreática de 30–75 cm.',
    alternativas:'Manga gástrica, OAGB, SADI-S, BPD-DS, ESG, balón, farmacoterapia.',
    beneficios:['Pérdida del 65–75 % del exceso de peso a 5 años','Alta tasa de remisión de DM2 (efecto metabólico)','Excelente control del ERGE','Control de dumping como herramienta conductual'],
    riesgos:['Fuga de anastomosis (1–2 %)','Úlcera marginal (2–5 %)','Hernia interna (2–5 %) con riesgo de isquemia intestinal','Obstrucción intestinal','Dumping síndrome','Malabsorción y déficits nutricionales (hierro, B12, calcio, vit D, tiamina)','Colelitiasis postoperatoria','Hipoglucemia postprandial tardía'],
    especificos:'Compromiso de por vida con suplementación multivitamínica, calcio, vit D, B12 y controles periódicos. Requiere cerrar brechas mesentéricas para reducir hernia interna.'
  },
  oagb:{
    naturaleza:'Bypass gástrico de una anastomosis (Mini-Bypass). Pouch gástrico largo y asa biliopancreática de 150–200 cm con una sola anastomosis gastroyeyunal.',
    alternativas:'RYGB, manga gástrica, SADI-S, BPD-DS, farmacoterapia, balón.',
    beneficios:['Pérdida del 70–80 % del exceso de peso','Excelente efecto metabólico','Procedimiento técnicamente más rápido que RYGB'],
    riesgos:['Fuga (1–2 %)','Reflujo biliar (2–5 %) que puede requerir conversión a RYGB','Úlcera marginal','Déficits nutricionales similares a RYGB','Sobrepérdida de peso con desnutrición proteica'],
    especificos:'Requiere vigilancia por reflujo biliar; una parte requerirá conversión a RYGB.'
  },
  sadis:{
    naturaleza:'SADI-S (Single Anastomosis Duodeno-Ileal con Sleeve). Se practica manga gástrica y anastomosis del duodeno a asa ileal de 250–300 cm.',
    alternativas:'RYGB, BPD-DS, manga, OAGB, farmacoterapia.',
    beneficios:['Pérdida superior en IMC ≥ 50','Alta tasa de remisión de DM2','Una sola anastomosis intestinal'],
    riesgos:['Mayor riesgo de déficits nutricionales (proteicos, vitaminas liposolubles)','Diarrea crónica','Fuga','Obstrucción','Anemia severa'],
    especificos:'Exige suplementación estricta y seguimiento nutricional intensivo de por vida; proteína ≥ 90 g/día.'
  },
  bpdds:{
    naturaleza:'Derivación biliopancreática con switch duodenal (BPD-DS) laparoscópica. Manga gástrica más división duodenal con asa ileal alimentaria y canal común corto.',
    alternativas:'SADI-S, RYGB, manga, farmacoterapia.',
    beneficios:['Máxima pérdida de peso a largo plazo','Máxima remisión metabólica'],
    riesgos:['Déficit proteico severo y desnutrición','Osteopatía metabólica','Diarrea crónica y esteatorrea','Mayor mortalidad que otros procedimientos','Fuga, obstrucción, hernia interna'],
    especificos:'Procedimiento de máxima complejidad; reservado para IMC ≥ 50 o SMBP tras fracaso de otras técnicas.'
  },
  balon:{
    naturaleza:'Balón intragástrico endoscópico (Orbera, Orbera365, Spatz3 o Allurion). Se coloca por endoscopia (o se deglute en el caso de Allurion) un balón de 400–700 mL de duración 4–12 meses.',
    alternativas:'Farmacoterapia GLP-1, ESG, cirugía bariátrica, cambios de estilo de vida.',
    beneficios:['Pérdida 10–20 % del peso corporal','Procedimiento reversible y sin cirugía','Útil como puente o primera intervención'],
    riesgos:['Náuseas, vómito y dolor abdominal en las primeras semanas (85–95 %)','Intolerancia que obligue a retiro anticipado','Migración del balón con obstrucción intestinal','Desinflado espontáneo','Perforación (rara)','Reganancia tras el retiro si no hay cambios conductuales'],
    especificos:'Requiere acompañamiento nutricional y conductual estrecho para sostener el resultado después del retiro.'
  },
  rev_sg_rygb:{
    naturaleza:'Conversión laparoscópica de manga gástrica previa a RYGB. Se utiliza la manga como pouch y se construye la Y de Roux.',
    alternativas:'Conversión a OAGB, SADI-S, manejo endoscópico (TORe), farmacoterapia.',
    beneficios:['Control de ERGE refractario','Pérdida adicional 10–20 % de peso','Mejoría metabólica'],
    riesgos:['Fuga en línea previa','Mayor tiempo operatorio y adherencias','Úlcera marginal y hernia interna','Déficits nutricionales'],
    especificos:'Procedimiento de revisión con mayor complejidad; requiere explicación detallada de la evidencia de ganancia con respecto al riesgo adicional.'
  },
  rev_sg_oagb:{
    naturaleza:'Conversión laparoscópica de manga gástrica previa a OAGB.',
    alternativas:'Conversión a RYGB, SADI-S, manejo endoscópico.',
    beneficios:['Pérdida adicional 15–20 %','Alternativa técnica a RYGB'],
    riesgos:['Fuga, reflujo biliar (ocasionalmente requiere reconversión a RYGB)','Úlcera marginal','Déficits nutricionales'],
    especificos:'Vigilancia específica por reflujo biliar postoperatorio.'
  }
};

function consentimientoDefault(p){
  const key = p.procedimiento || 'sleeve';
  const pl = PLANTILLAS_CONSENTIMIENTO[key] || PLANTILLAS_CONSENTIMIENTO.sleeve;
  const beneficios = pl.beneficios.map(b=>`- ${b}`).join('\n');
  const riesgos = pl.riesgos.map(r=>`- ${r}`).join('\n');
  return `CONSENTIMIENTO INFORMADO · ${(PROCS[key]||'CIRUGÍA BARIÁTRICA').toUpperCase()}
AVANTE COMPLEJO HOSPITALARIO

Paciente: ${p.nombre||''} ${p.apellido||''}   JVPM: ${p.jvpm||'—'}   NUE: ${p.nue||'—'}
Edad: ${p.edad||'—'}  IMC: ${imc(p).toFixed(1)}
Procedimiento propuesto: ${PROCS[key]||'—'}

NATURALEZA DEL PROCEDIMIENTO:
${pl.naturaleza}

ALTERNATIVAS:
${pl.alternativas}

BENEFICIOS ESPERADOS:
${beneficios}

RIESGOS Y COMPLICACIONES ESPECÍFICOS:
${riesgos}
Además de los riesgos inherentes a toda cirugía (sangrado, infección, TEV, reacciones anestésicas, mortalidad <0.3 %).

CONSIDERACIONES ESPECÍFICAS:
${pl.especificos}

COMPROMISOS DEL PACIENTE:
- Indicaciones pre y postoperatorias
- Seguimiento de por vida
- Suplementos nutricionales específicos
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

export default function Modulo6(){
  const { t } = useLang();
  const [modo,setModo]=useState('clinico');
  const [pacientes,setPacientes]=useState([]);
  const [seleccionado,setSeleccionado]=useState(null);
  const [tab,setTab]=useState('educacion');
  const [cargando,setCargando]=useState(true);
  const [consentimientos,setConsentimientos]=useState({});
  const [paquetes,setPaquetes]=useState(PAQUETES_DEFAULT);
  const [contactos,setContactos]=useState(CONTACTOS_DEFAULT);
  const [consActual,setConsActual]=useState('');
  const [procConsentimiento,setProcConsentimiento]=useState('');

  useEffect(()=>{(async()=>{
    setPacientes(await storageGet('avante_pacientes')||[]);
    setConsentimientos(await storageGet('avante_consentimientos')||{});
    setPaquetes(await storageGet('avante_paquetes')||PAQUETES_DEFAULT);
    setContactos(await storageGet('avante_contactos')||CONTACTOS_DEFAULT);
    setCargando(false);
  })();},[]);

  useEffect(()=>{
    if(seleccionado){
      setConsActual(consentimientos[seleccionado.id] || consentimientoDefault(seleccionado));
      setProcConsentimiento(seleccionado.procedimiento || 'sleeve');
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
            {[{id:'educacion',i:BookOpen,k:'tab.educacion'},{id:'consentimiento',i:FileText,k:'tab.consentimiento'},{id:'costos',i:DollarSign,k:'tab.costos'},{id:'emergencias',i:Siren,k:'tab.emergencias'},{id:'contactos',i:Phone,k:'tab.contactos'}].map(tb=>{
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
                <div className="p-3 rounded border flex flex-wrap items-center gap-2" style={{background:C.cream,borderColor:C.teal}}>
                  <label className="text-xs font-bold" style={{color:C.navy}}>Plantilla por procedimiento:</label>
                  <select value={procConsentimiento} onChange={e=>setProcConsentimiento(e.target.value)} className="px-2 py-1 rounded border text-sm">
                    {Object.keys(PLANTILLAS_CONSENTIMIENTO).map(k=>(
                      <option key={k} value={k}>{PROCS[k]||k}</option>
                    ))}
                  </select>
                  <button onClick={()=>setConsActual(consentimientoDefault({...seleccionado, procedimiento:procConsentimiento}))} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}>
                    <FileText size={14}/>Generar plantilla
                  </button>
                  <span className="text-xs text-gray-600 italic">Cada procedimiento tiene su propia naturaleza, alternativas y riesgos específicos.</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={guardarConsentimiento} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}><Save size={14}/>Guardar</button>
                  <button onClick={()=>setConsActual(consentimientoDefault(seleccionado))} className={btn+" text-sm"} style={{background:'#e5e7eb'}}>Restaurar plantilla del paciente</button>
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
