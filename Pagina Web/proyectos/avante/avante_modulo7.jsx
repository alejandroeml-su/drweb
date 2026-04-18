import React, { useState, useEffect, useMemo } from 'react';
import { Activity, GraduationCap, Heart, BarChart3, Video, Award, Users, TrendingUp, TrendingDown, CheckCircle2, Calendar, Star, Phone, MessageCircle, Download, Mail, Upload, ShoppingCart, Send, Globe, Bell, FileText, PlusCircle, Plus, Trash2, Info } from 'lucide-react';
import {
  exportarPDF, descargarPDF, shareWhatsApp, shareEmail,
  enviarPDFWhatsApp, enviarPDFEmail,
  leerArchivoDataURL, storageGet, storageSet, fmtFechaHora, fmtFecha
} from './src_shared/utils.js';
import { useLang } from './src_shared/i18n.jsx';

const C = { navy:'#0A1F44', teal:'#1A8B9D', gold:'#C9A961', cream:'#FAF7F2', green:'#2D8659', yellow:'#E0A82E', red:'#C0392B' };
const PROCS = { sleeve:'Manga', rygb:'RYGB', oagb:'OAGB', sadis:'SADI-S', bpdds:'BPD-DS', balon:'Balón intragástrico', rev_sg_rygb:'Rev SG→RYGB', rev_sg_oagb:'Rev SG→OAGB' };

function imc(p){const pe=parseFloat(p.peso),t=parseFloat(p.talla)/100;return (pe&&t)?pe/(t*t):0;}
function ptp(pi,pa){const a=parseFloat(pi),b=parseFloat(pa);if(!a||!b)return 0;return ((a-b)/a)*100;}

// === EQUIPO ===
const EQUIPO = [
  {rol:'Cirujano bariátrico líder',persona:'Dr. Ángel Henríquez',resp:'Indicación quirúrgica, técnica operatoria, seguimiento clínico, decisiones de revisión'},
  {rol:'Co-Director médico',persona:'Dr. Luis Alonso Martínez Chávez',resp:'Co-liderazgo clínico y administrativo, casos compartidos'},
  {rol:'Anestesiología bariátrica',persona:'Equipo de anestesia',resp:'Manejo perioperatorio, vía aérea difícil, analgesia multimodal'},
  {rol:'Endocrinología',persona:'Endocrinólogo asociado',resp:'Optimización metabólica pre y postoperatoria, manejo DM2'},
  {rol:'Nutrición clínica',persona:'Nutricionista bariátrica',resp:'Fases dietarias, suplementación, educación alimentaria'},
  {rol:'Psicología bariátrica',persona:'Psicólogo clínico',resp:'Evaluación preoperatoria, acompañamiento conductual, prevención de recaídas'},
  {rol:'Cardiología',persona:'Cardiólogo de referencia',resp:'Valoración y optimización cardiovascular preoperatoria'},
  {rol:'Hepatología',persona:'Hepatólogo asociado',resp:'NASH/MAFLD, hepatopatía bariátrica'},
  {rol:'Cirugía plástica',persona:'Cirujano plástico de referencia',resp:'Plástica post-bariátrica en fase tardía'},
  {rol:'Coordinación',persona:'Coordinador del programa',resp:'Agendas, seguimiento, comunicación con paciente y aseguradoras'}
];

// === TELEMEDICINA ===
const TIPOS_CONSULTA_VIRTUAL = [
  {id:'info',tipo:'Primera consulta informativa',duracion:30,ind:'Pacientes evaluando opciones, pueden ser de fuera de El Salvador'},
  {id:'post_temp',tipo:'Control postoperatorio temprano',duracion:15,ind:'48-72h, 1 semana post-egreso'},
  {id:'seg',tipo:'Seguimiento ponderal',duracion:20,ind:'1, 3, 6, 12 meses si paciente vive lejos'},
  {id:'nutri',tipo:'Consulta nutricional',duracion:30,ind:'Ajustes de plan alimentario, dudas de fase'},
  {id:'psi',tipo:'Apoyo psicológico',duracion:45,ind:'Sesiones de seguimiento conductual'},
  {id:'2op',tipo:'Segunda opinión regional',duracion:45,ind:'Pacientes de Centroamérica para casos complejos o revisiones'}
];

// === AVANTE CARE: planes comerciales descargables ===
const PLANES_AVANTE_CARE_DEFAULT = [
  {
    id:'basico',
    nombre:'Avante Care Básico',
    precio:'US$ 480 / año',
    color:C.teal,
    destacado:false,
    beneficios:[
      'Línea de coordinación en horario hábil',
      '2 talleres grupales al año (nutrición o ejercicio)',
      'Newsletter mensual',
      '10% descuento en laboratorios de seguimiento',
      'Acceso al grupo cerrado de pacientes',
      'Recordatorios automáticos de citas'
    ]
  },
  {
    id:'plus',
    nombre:'Avante Care Plus',
    precio:'US$ 980 / año',
    color:C.gold,
    destacado:true,
    beneficios:[
      'Línea directa con su equipo médico (extendida)',
      'Acceso prioritario a citas (48h máximo)',
      '6 talleres al año (cocina, ejercicio, mindfulness)',
      '20% descuento en laboratorios e imágenes',
      'Control completo de aniversario quirúrgico',
      '1 consulta virtual de seguimiento trimestral incluida',
      'Evaluación nutricional de cortesía (2/año)',
      'Charlas con expertos invitados'
    ]
  },
  {
    id:'premium',
    nombre:'Avante Care Premium 24/7',
    precio:'US$ 1,800 / año',
    color:C.navy,
    destacado:false,
    beneficios:[
      'Línea directa 24/7 con su equipo médico',
      'Acceso inmediato a citas y procedimientos',
      'Todos los talleres y eventos del año incluidos',
      '30% descuento en laboratorios, imágenes y plásticos',
      'Consultas virtuales ilimitadas (médica, nutri, psico)',
      'Acompañamiento de viaje para pacientes internacionales',
      'Chequeo anual ejecutivo de cortesía',
      'Prioridad en segunda opinión regional'
    ]
  }
];

const KPIS_EXPERIENCIA = [
  {k:'NPS (Net Promoter Score)',meta:'>70',cat:'Recomendación'},
  {k:'CSAT global',meta:'>90%',cat:'Satisfacción'},
  {k:'Retención a 12m',meta:'>80%',cat:'Adherencia'},
  {k:'Tasa de referidos',meta:'>30%',cat:'Crecimiento'},
  {k:'Tiempo de espera primera consulta',meta:'<7 días',cat:'Acceso'},
  {k:'Resolución de PQRS',meta:'<48h',cat:'Servicio'}
];

// Utilidad para armar link Jitsi seguro (sin cuenta, gratis, global)
function jitsiLink(roomName){
  const clean = (roomName||'consulta').replace(/[^a-zA-Z0-9\-]/g,'');
  return `https://meet.jit.si/Avante-${clean}-${Date.now().toString(36)}`;
}

// Utilidad ICS (calendario global)
function generarICS({titulo, descripcion, inicio, duracionMin, ubicacion}){
  const dt = new Date(inicio);
  const fin = new Date(dt.getTime()+duracionMin*60000);
  const fmt = (d)=> d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Avante//ES',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@avante.sv`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(dt)}`,
    `DTEND:${fmt(fin)}`,
    `SUMMARY:${titulo}`,
    `DESCRIPTION:${(descripcion||'').replace(/\n/g,'\\n')}`,
    `LOCATION:${ubicacion||'Telemedicina Avante'}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics],{type:'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = (titulo||'cita')+'.ics';
  document.body.appendChild(a); a.click();
  setTimeout(()=>{URL.revokeObjectURL(url); a.remove();},200);
}

export default function Modulo7(){
  const { t } = useLang();
  const [modo,setModo]=useState('clinico');
  const [pacientes,setPacientes]=useState([]);
  const [seguimientos,setSeguimientos]=useState({});
  const [tab,setTab]=useState('dashboard');
  const [cargando,setCargando]=useState(true);

  // Telemedicina
  const [citas,setCitas]=useState([]); // {id, pacienteId, tipo, fecha, duracion, telefono, email, sala, notas, estado}
  const [nuevaCita,setNuevaCita]=useState({pacienteId:'',tipo:'info',fecha:'',duracion:30,telefono:'',email:'',notas:''});

  // Avante Care
  const [planes,setPlanes]=useState(PLANES_AVANTE_CARE_DEFAULT);
  const [docsCare,setDocsCare]=useState([]); // {id, nombre, dataUrl, tipo, size, planId, fecha}
  const [leads,setLeads]=useState([]); // {id, nombre, telefono, email, plan, pais, notas, fecha}
  const [nuevoLead,setNuevoLead]=useState({nombre:'',telefono:'',email:'',plan:'plus',pais:'',notas:''});

  const [equipo,setEquipo]=useState(EQUIPO);
  const [nuevoEquipo,setNuevoEquipo]=useState({rol:'',persona:'',resp:''});

  useEffect(()=>{(async()=>{
    try{
      setPacientes((await storageGet('avante_pacientes'))||[]);
      setSeguimientos((await storageGet('avante_seguimientos'))||{});
      setCitas((await storageGet('avante_citas'))||[]);
      const pl = await storageGet('avante_care_planes');
      if(pl && Array.isArray(pl) && pl.length) setPlanes(pl);
      setDocsCare((await storageGet('avante_care_docs'))||[]);
      setLeads((await storageGet('avante_care_leads'))||[]);
      const eq = await storageGet('avante_equipo');
      if(eq && Array.isArray(eq) && eq.length) setEquipo(eq);
    }catch(e){}
    setCargando(false);
  })();},[]);

  useEffect(()=>{if(!cargando) storageSet('avante_citas', citas);},[citas,cargando]);
  useEffect(()=>{if(!cargando) storageSet('avante_care_planes', planes);},[planes,cargando]);
  useEffect(()=>{if(!cargando) storageSet('avante_care_docs', docsCare);},[docsCare,cargando]);
  useEffect(()=>{if(!cargando) storageSet('avante_care_leads', leads);},[leads,cargando]);
  useEffect(()=>{if(!cargando) storageSet('avante_equipo', equipo);},[equipo,cargando]);

  const agregarMiembro = () => {
    if(!nuevoEquipo.rol.trim() && !nuevoEquipo.persona.trim()) return;
    setEquipo([...equipo, { ...nuevoEquipo }]);
    setNuevoEquipo({rol:'',persona:'',resp:''});
  };
  const editarMiembro = (i, campo, val) => {
    setEquipo(equipo.map((e,idx)=>idx===i?{...e,[campo]:val}:e));
  };
  const eliminarMiembro = (i) => {
    if(!confirm('¿Eliminar este integrante del equipo?')) return;
    setEquipo(equipo.filter((_,idx)=>idx!==i));
  };
  const restaurarEquipo = () => {
    if(!confirm('¿Restaurar el equipo a la lista por defecto?')) return;
    setEquipo(EQUIPO);
  };

  const btn="px-4 py-2 rounded font-medium transition-colors";

  if(cargando)return <div className="p-8 text-center">Cargando...</div>;

  // === DASHBOARD MÉTRICAS AMPLIADAS ===
  const total=pacientes.length;
  const porProc={};pacientes.forEach(p=>{porProc[p.procedimiento]=(porProc[p.procedimiento]||0)+1;});
  const imcProm=total>0?(pacientes.reduce((s,p)=>s+imc(p),0)/total).toFixed(1):0;
  const edadProm=total>0?(pacientes.reduce((s,p)=>s+(parseFloat(p.edad)||0),0)/total).toFixed(0):0;
  const conSeguimiento=Object.keys(seguimientos).filter(k=>seguimientos[k]?.length>0).length;
  const tasaSeg=total>0?((conSeguimiento/total)*100).toFixed(0):0;
  const conDM=pacientes.filter(p=>p.comorbilidades?.dm).length;
  const conERGE=pacientes.filter(p=>p.comorbilidades?.erge).length;
  const conAOS=pacientes.filter(p=>p.comorbilidades?.aos).length;
  const conHTA=pacientes.filter(p=>p.comorbilidades?.hta).length;
  const sexoF=pacientes.filter(p=>(p.sexo||'').toLowerCase().startsWith('f')).length;
  const sexoM=total-sexoF;

  // %PTP promedio del último seguimiento
  let pepProm=0,nPep=0;
  Object.entries(seguimientos).forEach(([id,segs])=>{
    if(segs && segs.length>0){
      const p=pacientes.find(x=>x.id===id);
      if(p){
        const ult=segs[segs.length-1];
        const ptpV=ptp(p.peso,ult.peso);
        if(ptpV>0){pepProm+=ptpV;nPep++;}
      }
    }
  });
  pepProm=nPep>0?(pepProm/nPep).toFixed(1):0;

  // Altas recientes (30 días)
  const hoy = new Date();
  const hace30 = new Date(hoy.getTime()-30*24*3600*1000);
  const nuevos30 = pacientes.filter(p=>{const d=new Date(p.fechaRegistro||p.fecha||0);return d>=hace30;}).length;

  // Citas próximas
  const citasFuturas = citas.filter(c=>new Date(c.fecha)>=new Date()).sort((a,b)=>new Date(a.fecha)-new Date(b.fecha));
  const citasHoy = citasFuturas.filter(c=>{const d=new Date(c.fecha);return d.toDateString()===hoy.toDateString();});
  const citasSemana = citasFuturas.filter(c=>{const d=new Date(c.fecha);return (d-hoy)<=7*24*3600*1000;});

  // Pipeline comercial
  const leadsPorPlan = {};
  leads.forEach(l=>{leadsPorPlan[l.plan]=(leadsPorPlan[l.plan]||0)+1;});
  const leadsNuevos30 = leads.filter(l=>new Date(l.fecha)>=hace30).length;

  // === TELEMEDICINA: acciones ===
  const agendarCita = () => {
    if(!nuevaCita.fecha){alert('Ingrese fecha y hora');return;}
    const tipoInfo = TIPOS_CONSULTA_VIRTUAL.find(t=>t.id===nuevaCita.tipo);
    const paciente = pacientes.find(p=>p.id===nuevaCita.pacienteId);
    const sala = jitsiLink((paciente?.nombre||'consulta').replace(/\s/g,'-'));
    const nueva = {
      id:Date.now().toString(36),
      ...nuevaCita,
      duracion: tipoInfo?.duracion || nuevaCita.duracion,
      tipoLabel: tipoInfo?.tipo,
      sala,
      estado:'programada',
      creada: new Date().toISOString()
    };
    setCitas([...citas,nueva]);
    setNuevaCita({pacienteId:'',tipo:'info',fecha:'',duracion:30,telefono:paciente?.telefono||'',email:paciente?.email||'',notas:''});
    return nueva;
  };

  const enviarRecordatorioCita = (cita, canal) => {
    const p = pacientes.find(x=>x.id===cita.pacienteId);
    const nombre = p?.nombre || 'Paciente';
    const when = fmtFechaHora(cita.fecha);
    const msg = `Hola ${nombre}, le recordamos su consulta virtual "${cita.tipoLabel||cita.tipo}" en Avante el ${when} (${cita.duracion} min).\n\nIngrese por este enlace:\n${cita.sala}\n\nEquipo Avante · Creamos e innovamos para cuidar de ti.`;
    if(canal==='wa') shareWhatsApp(cita.telefono||p?.telefono, msg);
    else if(canal==='email') shareEmail(cita.email||p?.email, 'Recordatorio consulta Avante', msg);
    else if(canal==='sms'){
      const tel = (cita.telefono||p?.telefono||'').replace(/[^\d]/g,'');
      window.open(`sms:${tel}?body=${encodeURIComponent(msg)}`, '_blank');
    }
    else if(canal==='ics'){
      generarICS({titulo:`Consulta Avante — ${cita.tipoLabel||cita.tipo}`, descripcion:msg, inicio:cita.fecha, duracionMin:cita.duracion, ubicacion:cita.sala});
    }
  };

  const pdfCita = (cita) => {
    const p = pacientes.find(x=>x.id===cita.pacienteId);
    const doc = exportarPDF({
      titulo:'Cita de Telemedicina',
      subtitulo:'Avante · '+(p?.nombre||'Paciente'),
      secciones:[
        {titulo:'Detalle de la cita', lineas:[
          `Paciente: ${p?.nombre||'—'}`,
          `Tipo: ${cita.tipoLabel||cita.tipo}`,
          `Fecha y hora: ${fmtFechaHora(cita.fecha)}`,
          `Duración estimada: ${cita.duracion} min`,
          `Estado: ${cita.estado}`,
          `Teléfono: ${cita.telefono||'—'}`,
          `Email: ${cita.email||'—'}`
        ]},
        {titulo:'Enlace de videoconsulta', lineas:[
          cita.sala,
          'Acceso global sin cuenta. Compatible con web, iOS y Android.',
          'Recomendaciones: audífonos, conexión estable, ambiente tranquilo.'
        ]},
        {titulo:'Notas', lineas:[cita.notas||'(sin notas)']}
      ]
    });
    return doc;
  };

  const eliminarCita = (id) => setCitas(citas.filter(c=>c.id!==id));

  // === AVANTE CARE ===
  const agregarBeneficioPlan = (planId) => {
    const t = prompt('Nuevo beneficio:');
    if(!t) return;
    setPlanes(planes.map(pl=>pl.id===planId?{...pl,beneficios:[...pl.beneficios,t]}:pl));
  };
  const quitarBeneficioPlan = (planId, idx) => {
    setPlanes(planes.map(pl=>pl.id===planId?{...pl,beneficios:pl.beneficios.filter((_,i)=>i!==idx)}:pl));
  };

  const subirDocCare = async (e, planId) => {
    const file = e.target.files?.[0]; if(!file) return;
    try{
      const r = await leerArchivoDataURL(file, 10*1024*1024);
      setDocsCare([...docsCare, {id:Date.now().toString(36), ...r, planId, fecha:new Date().toISOString()}]);
    }catch(err){alert(err.message);}
    e.target.value='';
  };
  const descargarDocCare = (d) => {
    const a = document.createElement('a');
    a.href = d.dataUrl; a.download = d.name;
    document.body.appendChild(a); a.click(); a.remove();
  };
  const eliminarDocCare = (id) => setDocsCare(docsCare.filter(d=>d.id!==id));

  const pdfPlanCare = (plan) => {
    const doc = exportarPDF({
      titulo:'Avante Care — '+plan.nombre,
      subtitulo:'Creamos e innovamos para cuidar de ti',
      secciones:[
        {titulo:'Resumen del plan', lineas:[
          `Plan: ${plan.nombre}`,
          `Inversión: ${plan.precio}`,
          `Vigencia: 12 meses desde la fecha de inscripción.`
        ]},
        {titulo:'Beneficios incluidos', lineas:plan.beneficios.map(b=>'• '+b)},
        {titulo:'Cómo inscribirse', lineas:[
          'Contacte al equipo comercial Avante: +503 2537-6161',
          'WhatsApp: https://wa.me/50325376161',
          'Inscripción también disponible en línea desde el portal del paciente.'
        ]},
        {titulo:'Condiciones', lineas:[
          'Los beneficios aplican exclusivamente a servicios disponibles en Avante Complejo Hospitalario y su red afiliada.',
          'Descuentos no acumulables con otras promociones salvo autorización expresa.',
          'La membresía es personal e intransferible.'
        ]}
      ]
    });
    return doc;
  };

  const registrarLead = () => {
    if(!nuevoLead.nombre || (!nuevoLead.telefono && !nuevoLead.email)){
      alert('Ingrese al menos nombre y un contacto (teléfono o email).');
      return;
    }
    const l = {id:Date.now().toString(36), ...nuevoLead, fecha:new Date().toISOString(), estado:'nuevo'};
    setLeads([...leads,l]);
    setNuevoLead({nombre:'',telefono:'',email:'',plan:'plus',pais:'',notas:''});
    alert('Prospecto registrado. Contáctelo pronto para cerrar la venta.');
    return l;
  };
  const eliminarLead = (id) => setLeads(leads.filter(l=>l.id!==id));
  const contactarLead = (lead, canal) => {
    const plan = planes.find(p=>p.id===lead.plan);
    const msg = `Hola ${lead.nombre}, gracias por su interés en *${plan?.nombre||'Avante Care'}*. Le acompañamos para completar su inscripción y que pueda empezar a disfrutar sus beneficios. ¿Le parece si agendamos una breve llamada?`;
    if(canal==='wa') shareWhatsApp(lead.telefono, msg);
    else if(canal==='email') shareEmail(lead.email, 'Su membresía Avante Care', msg);
  };

  return (
    <div className="min-h-screen p-4" style={{background:'#f3f4f6',fontFamily:'system-ui,sans-serif'}}>
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div style={{background:C.navy,color:'white'}} className="p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 style={{fontFamily:'Georgia,serif',color:C.gold}} className="text-3xl font-bold">Avante Complejo Hospitalario</h1>
              <p style={{fontFamily:'Georgia,serif'}} className="text-sm italic mt-1">{t('app.lema')}</p>
              <p className="text-xs mt-2 opacity-80">{t('modulo')} 7 · {t('mod.7.titulo')}</p>
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
          <div className="flex gap-1 mb-4 border-b overflow-x-auto">
            {[{id:'dashboard',i:BarChart3,k:'tab.dashboard'},{id:'telemedicina',i:Video,k:'tab.telemedicina'},{id:'fidelizacion',i:Award,k:'tab.fidelizacion'},{id:'equipo',i:Users,k:'tab.equipo'}].map(tb=>{
              const I=tb.i;
              return <button key={tb.id} onClick={()=>setTab(tb.id)} className="px-3 py-2 flex items-center gap-1 text-sm font-medium border-b-2 whitespace-nowrap"
                style={{borderColor:tab===tb.id?C.gold:'transparent',color:tab===tb.id?C.navy:'#6b7280'}}><I size={14}/>{t(tb.k)}</button>;
            })}
          </div>

          {/* === DASHBOARD === */}
          {tab==='dashboard' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded text-white" style={{background:C.navy}}>
                  <div className="text-xs opacity-80">Total pacientes</div>
                  <div className="text-3xl font-bold" style={{color:C.gold}}>{total}</div>
                  <div className="text-[10px] opacity-70 mt-1">+{nuevos30} en 30 días</div>
                </div>
                <div className="p-4 rounded" style={{background:C.cream}}>
                  <div className="text-xs text-gray-600">IMC promedio</div>
                  <div className="text-3xl font-bold" style={{color:C.navy}}>{imcProm}</div>
                  <div className="text-[10px] text-gray-500">Edad media {edadProm}a</div>
                </div>
                <div className="p-4 rounded text-white" style={{background:C.teal}}>
                  <div className="text-xs opacity-90">Adherencia seguimiento</div>
                  <div className="text-3xl font-bold">{tasaSeg}<span className="text-sm">%</span></div>
                  <div className="text-[10px] opacity-80">{conSeguimiento}/{total} activos</div>
                </div>
                <div className="p-4 rounded text-white" style={{background:C.gold}}>
                  <div className="text-xs opacity-90">%PTP medio</div>
                  <div className="text-3xl font-bold">{pepProm}<span className="text-sm">%</span></div>
                  <div className="text-[10px] opacity-80">{nPep} pacientes con segs</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded text-center border" style={{borderColor:C.teal}}>
                  <Calendar size={20} style={{color:C.teal}} className="mx-auto mb-1"/>
                  <div className="text-xs text-gray-600">Citas hoy</div>
                  <div className="text-xl font-bold" style={{color:C.navy}}>{citasHoy.length}</div>
                </div>
                <div className="p-3 rounded text-center border" style={{borderColor:C.teal}}>
                  <Video size={20} style={{color:C.teal}} className="mx-auto mb-1"/>
                  <div className="text-xs text-gray-600">Esta semana</div>
                  <div className="text-xl font-bold" style={{color:C.navy}}>{citasSemana.length}</div>
                </div>
                <div className="p-3 rounded text-center border" style={{borderColor:C.gold}}>
                  <ShoppingCart size={20} style={{color:C.gold}} className="mx-auto mb-1"/>
                  <div className="text-xs text-gray-600">Prospectos Avante Care</div>
                  <div className="text-xl font-bold" style={{color:C.navy}}>{leads.length}</div>
                  <div className="text-[10px] text-gray-500">+{leadsNuevos30} en 30 días</div>
                </div>
                <div className="p-3 rounded text-center border" style={{borderColor:C.gold}}>
                  <Award size={20} style={{color:C.gold}} className="mx-auto mb-1"/>
                  <div className="text-xs text-gray-600">Planes activos</div>
                  <div className="text-xl font-bold" style={{color:C.navy}}>{planes.length}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded border" style={{borderColor:C.teal}}>
                  <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Distribución por procedimiento</h3>
                  {Object.keys(porProc).length===0 ? <div className="text-xs text-gray-500">Sin datos</div> : Object.entries(porProc).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{
                    const pct=(v/total)*100;
                    return <div key={k} className="mb-2">
                      <div className="flex justify-between text-xs"><span>{PROCS[k]||k}</span><span className="font-bold">{v} ({pct.toFixed(0)}%)</span></div>
                      <div className="h-2 rounded" style={{background:'#e5e7eb'}}><div className="h-2 rounded" style={{width:`${pct}%`,background:C.teal}}/></div>
                    </div>;
                  })}
                </div>
                <div className="p-4 rounded border" style={{borderColor:C.teal}}>
                  <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Comorbilidades</h3>
                  {[{l:'Diabetes mellitus',v:conDM},{l:'HTA',v:conHTA},{l:'ERGE',v:conERGE},{l:'Apnea del sueño',v:conAOS}].map((c,i)=>{
                    const pct=total>0?(c.v/total)*100:0;
                    return <div key={i} className="mb-2">
                      <div className="flex justify-between text-xs"><span>{c.l}</span><span className="font-bold">{c.v} ({pct.toFixed(0)}%)</span></div>
                      <div className="h-2 rounded" style={{background:'#e5e7eb'}}><div className="h-2 rounded" style={{width:`${pct}%`,background:C.gold}}/></div>
                    </div>;
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded text-center" style={{background:C.cream}}>
                  <Users size={24} style={{color:C.teal}} className="mx-auto mb-1"/>
                  <div className="text-xs text-gray-600">Distribución por sexo</div>
                  <div className="text-sm font-bold mt-1" style={{color:C.navy}}>F: {sexoF} · M: {sexoM}</div>
                </div>
                <div className="p-4 rounded text-center" style={{background:C.cream}}>
                  <TrendingUp size={24} style={{color:C.gold}} className="mx-auto mb-1"/>
                  <div className="text-xs text-gray-600">Procedimiento líder</div>
                  <div className="text-lg font-bold" style={{color:C.navy}}>{Object.entries(porProc).sort((a,b)=>b[1]-a[1])[0]?.[0]?(PROCS[Object.entries(porProc).sort((a,b)=>b[1]-a[1])[0][0]]||Object.entries(porProc).sort((a,b)=>b[1]-a[1])[0][0]):'—'}</div>
                </div>
                <div className="p-4 rounded text-center" style={{background:C.cream}}>
                  <TrendingDown size={24} style={{color:C.green}} className="mx-auto mb-1"/>
                  <div className="text-xs text-gray-600">IMC promedio vs. meta</div>
                  <div className="text-lg font-bold" style={{color:C.navy}}>{imcProm} <span className="text-xs text-gray-500">(meta ≤30)</span></div>
                </div>
              </div>

              <div className="p-3 rounded text-xs flex items-start gap-2" style={{background:C.cream,color:C.navy}}>
                <BarChart3 size={16} style={{color:C.gold,flexShrink:0,marginTop:2}}/>
                <div>
                  <strong>Dashboard ejecutivo Avante:</strong> datos en tiempo real desde los módulos 1-6. Indicadores clínicos (IMC, %PTP, comorbilidades, adherencia), operacionales (citas hoy/semana) y comerciales (prospectos Avante Care) en una sola vista para dirección médica y administrativa.
                </div>
              </div>
            </div>
          )}

          {/* === TELEMEDICINA === */}
          {tab==='telemedicina' && (
            <div className="space-y-4">
              {modo==='paciente' ? (
                <div className="p-6 rounded text-center" style={{background:C.cream}}>
                  <Video size={40} style={{color:C.teal}} className="mx-auto mb-3"/>
                  <h3 style={{fontFamily:'Georgia,serif',color:C.navy}} className="text-xl font-bold mb-2">Le atendemos donde esté</h3>
                  <p className="text-gray-700 mb-4">Sus controles, su nutricionista, su psicólogo: todos accesibles desde su teléfono o computadora.</p>
                  <a href={`https://wa.me/50325376161?text=${encodeURIComponent('Hola, deseo agendar una consulta virtual en Avante.')}`}
                     target="_blank" rel="noopener" className={btn+" text-white inline-flex items-center gap-2"} style={{background:'#25D366'}}>
                    <MessageCircle size={16}/> Solicitar por WhatsApp
                  </a>
                </div>
              ) : (
                <>
                  {/* Agendar nueva cita */}
                  <div className="p-4 rounded border-l-4" style={{borderColor:C.teal,background:C.cream}}>
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{color:C.navy}}>
                      <Calendar size={16}/> Agendar consulta virtual · Alcance global
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <label className="text-xs text-gray-600">Paciente</label>
                        <select className="w-full p-2 border rounded text-sm" value={nuevaCita.pacienteId}
                          onChange={e=>{
                            const id=e.target.value;
                            const p=pacientes.find(x=>x.id===id);
                            setNuevaCita({...nuevaCita,pacienteId:id,telefono:p?.telefono||'',email:p?.email||''});
                          }}>
                          <option value="">— Seleccionar paciente —</option>
                          {pacientes.map(p=><option key={p.id} value={p.id}>{p.nombre||p.id}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Tipo de consulta</label>
                        <select className="w-full p-2 border rounded text-sm" value={nuevaCita.tipo}
                          onChange={e=>setNuevaCita({...nuevaCita,tipo:e.target.value})}>
                          {TIPOS_CONSULTA_VIRTUAL.map(t=><option key={t.id} value={t.id}>{t.tipo} ({t.duracion} min)</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Fecha y hora</label>
                        <input type="datetime-local" className="w-full p-2 border rounded text-sm" value={nuevaCita.fecha}
                          onChange={e=>setNuevaCita({...nuevaCita,fecha:e.target.value})}/>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Duración (min)</label>
                        <input type="number" className="w-full p-2 border rounded text-sm" value={nuevaCita.duracion}
                          onChange={e=>setNuevaCita({...nuevaCita,duracion:parseInt(e.target.value)||30})}/>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Teléfono (WhatsApp, con código país)</label>
                        <input type="tel" className="w-full p-2 border rounded text-sm" placeholder="+503..." value={nuevaCita.telefono}
                          onChange={e=>setNuevaCita({...nuevaCita,telefono:e.target.value})}/>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Email</label>
                        <input type="email" className="w-full p-2 border rounded text-sm" value={nuevaCita.email}
                          onChange={e=>setNuevaCita({...nuevaCita,email:e.target.value})}/>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-600">Notas</label>
                        <textarea className="w-full p-2 border rounded text-sm" rows={2} value={nuevaCita.notas}
                          onChange={e=>setNuevaCita({...nuevaCita,notas:e.target.value})}/>
                      </div>
                    </div>
                    <button onClick={agendarCita} className={btn+" mt-3 text-white flex items-center gap-2"} style={{background:C.teal}}>
                      <PlusCircle size={14}/> Agendar y generar sala de video
                    </button>
                    <p className="text-[10px] text-gray-500 mt-2">
                      La sala se crea automáticamente en Jitsi (gratis, sin cuenta, global). Envíe el enlace por WhatsApp/email/SMS.
                    </p>
                  </div>

                  {/* Citas programadas */}
                  <div>
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{color:C.navy}}>
                      <Bell size={14}/> Citas programadas ({citasFuturas.length})
                    </h3>
                    {citasFuturas.length===0 && <div className="p-3 text-xs text-gray-500 border rounded">Sin citas programadas.</div>}
                    <div className="space-y-2">
                      {citasFuturas.map(c=>{
                        const p = pacientes.find(x=>x.id===c.pacienteId);
                        return (
                          <div key={c.id} className="p-3 rounded border-l-4" style={{borderColor:C.teal,background:'white'}}>
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm" style={{color:C.navy}}>
                                  {p?.nombre||'Paciente'} — {c.tipoLabel||c.tipo}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  <Calendar size={10} className="inline mr-1"/>{fmtFechaHora(c.fecha)} · {c.duracion} min
                                </div>
                                <div className="text-xs text-gray-600">
                                  <Phone size={10} className="inline mr-1"/>{c.telefono||'—'}
                                  <Mail size={10} className="inline ml-3 mr-1"/>{c.email||'—'}
                                </div>
                                {c.notas && <div className="text-xs text-gray-500 mt-1 italic">{c.notas}</div>}
                                <div className="text-[10px] text-gray-400 mt-1 truncate">🎥 {c.sala}</div>
                              </div>
                              <div className="flex gap-1 flex-wrap">
                                <a href={c.sala} target="_blank" rel="noopener" className="px-2 py-1 text-xs rounded text-white flex items-center gap-1" style={{background:C.teal}}>
                                  <Video size={12}/> Entrar
                                </a>
                                <button onClick={()=>enviarRecordatorioCita(c,'wa')} title="WhatsApp" className="px-2 py-1 text-xs rounded text-white" style={{background:'#25D366'}}>
                                  <MessageCircle size={12}/>
                                </button>
                                <button onClick={()=>enviarRecordatorioCita(c,'email')} title="Email" className="px-2 py-1 text-xs rounded text-white" style={{background:C.navy}}>
                                  <Mail size={12}/>
                                </button>
                                <button onClick={()=>enviarRecordatorioCita(c,'sms')} title="SMS" className="px-2 py-1 text-xs rounded text-white" style={{background:C.gold}}>
                                  <Send size={12}/>
                                </button>
                                <button onClick={()=>enviarRecordatorioCita(c,'ics')} title="Calendario (.ics)" className="px-2 py-1 text-xs rounded text-white" style={{background:C.teal}}>
                                  <Calendar size={12}/>
                                </button>
                                <button onClick={()=>{
                                  const doc=pdfCita(c);
                                  descargarPDF(doc,'cita-'+(p?.nombre||c.id).replace(/\s/g,'_'));
                                }} title="PDF" className="px-2 py-1 text-xs rounded text-white" style={{background:C.navy}}>
                                  <Download size={12}/>
                                </button>
                                <button onClick={()=>{if(confirm('¿Eliminar cita?'))eliminarCita(c.id);}} className="px-2 py-1 text-xs rounded text-white" style={{background:C.red}}>
                                  <Trash2 size={12}/>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Modalidades */}
                  <div>
                    <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Modalidades disponibles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {TIPOS_CONSULTA_VIRTUAL.map((t)=>(
                        <div key={t.id} className="p-3 rounded border-l-4 flex justify-between items-start gap-3" style={{borderColor:C.teal,background:C.cream}}>
                          <div className="flex-1">
                            <div className="font-bold text-xs" style={{color:C.navy}}>{t.tipo}</div>
                            <div className="text-[11px] text-gray-700 mt-1">{t.ind}</div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded text-white whitespace-nowrap" style={{background:C.gold}}>{t.duracion} min</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded text-xs flex items-start gap-2" style={{background:C.cream,color:C.navy}}>
                    <Globe size={16} style={{color:C.teal,flexShrink:0,marginTop:2}}/>
                    <div>
                      <strong>Alcance global:</strong> Jitsi Meet funciona en cualquier país sin cuenta. Los recordatorios automáticos se envían por WhatsApp (el más usado en LATAM), email (pacientes corporativos), SMS (respaldo) y archivo .ics (Google Calendar, Outlook, Apple Calendar).
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* === AVANTE CARE === */}
          {tab==='fidelizacion' && (
            <div className="space-y-4">
              {modo==='paciente' ? (
                <>
                  <div className="p-6 rounded text-center" style={{background:C.cream}}>
                    <Award size={40} style={{color:C.gold}} className="mx-auto mb-3"/>
                    <h3 style={{fontFamily:'Georgia,serif',color:C.navy}} className="text-xl font-bold mb-2">Bienvenido a Avante Care</h3>
                    <p className="text-gray-700 mb-4">Su programa de membresía con beneficios exclusivos para acompañarle durante toda su transformación.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {planes.map(pl=>(
                      <div key={pl.id} className="p-4 rounded border-2 flex flex-col" style={{borderColor:pl.color,background:pl.destacado?pl.color:'white',color:pl.destacado?'white':'inherit'}}>
                        {pl.destacado && <div className="text-[10px] uppercase font-bold mb-1" style={{color:pl.destacado?'white':pl.color}}>Más recomendado</div>}
                        <h4 className="font-bold text-lg" style={{fontFamily:'Georgia,serif',color:pl.destacado?'white':pl.color}}>{pl.nombre}</h4>
                        <div className="text-2xl font-bold my-2">{pl.precio}</div>
                        <ul className="text-xs space-y-1 flex-1">
                          {pl.beneficios.map((b,i)=>(
                            <li key={i} className="flex gap-1"><CheckCircle2 size={12} style={{flexShrink:0,marginTop:2}}/>{b}</li>
                          ))}
                        </ul>
                        <button onClick={()=>descargarPDF(pdfPlanCare(pl),'avante-care-'+pl.id)} className="mt-3 px-3 py-2 rounded text-xs font-bold flex items-center justify-center gap-1"
                          style={{background:pl.destacado?'white':pl.color,color:pl.destacado?pl.color:'white'}}>
                          <Download size={12}/> Descargar información
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Captura de leads */}
                  <div className="p-4 rounded border-2 border-dashed" style={{borderColor:C.gold,background:C.cream}}>
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2" style={{color:C.navy}}>
                      <ShoppingCart size={14}/> Solicite que le contactemos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <input className="p-2 border rounded" placeholder="Nombre completo" value={nuevoLead.nombre}
                        onChange={e=>setNuevoLead({...nuevoLead,nombre:e.target.value})}/>
                      <input className="p-2 border rounded" placeholder="Teléfono (WhatsApp)" value={nuevoLead.telefono}
                        onChange={e=>setNuevoLead({...nuevoLead,telefono:e.target.value})}/>
                      <input className="p-2 border rounded" placeholder="Email" value={nuevoLead.email}
                        onChange={e=>setNuevoLead({...nuevoLead,email:e.target.value})}/>
                      <input className="p-2 border rounded" placeholder="País" value={nuevoLead.pais}
                        onChange={e=>setNuevoLead({...nuevoLead,pais:e.target.value})}/>
                      <select className="p-2 border rounded" value={nuevoLead.plan} onChange={e=>setNuevoLead({...nuevoLead,plan:e.target.value})}>
                        {planes.map(pl=><option key={pl.id} value={pl.id}>{pl.nombre}</option>)}
                      </select>
                      <textarea className="p-2 border rounded md:col-span-2" rows={2} placeholder="Comentarios" value={nuevoLead.notas}
                        onChange={e=>setNuevoLead({...nuevoLead,notas:e.target.value})}/>
                    </div>
                    <button onClick={registrarLead} className={btn+" mt-2 text-white flex items-center gap-2"} style={{background:C.gold}}>
                      <Send size={14}/> Enviar solicitud
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Planes editables */}
                  <div>
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{color:C.navy}}>
                      <Award size={14}/> Planes comerciales Avante Care (editables)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {planes.map(pl=>(
                        <div key={pl.id} className="p-3 rounded border-2" style={{borderColor:pl.color}}>
                          <input className="w-full font-bold text-sm mb-1 p-1 border-b" value={pl.nombre}
                            onChange={e=>setPlanes(planes.map(x=>x.id===pl.id?{...x,nombre:e.target.value}:x))}
                            style={{color:pl.color}}/>
                          <input className="w-full text-lg font-bold mb-2 p-1 border-b" value={pl.precio}
                            onChange={e=>setPlanes(planes.map(x=>x.id===pl.id?{...x,precio:e.target.value}:x))}/>
                          <ul className="text-xs space-y-1 mb-2">
                            {pl.beneficios.map((b,i)=>(
                              <li key={i} className="flex gap-1 items-start">
                                <CheckCircle2 size={12} style={{color:pl.color,flexShrink:0,marginTop:2}}/>
                                <input className="flex-1 text-xs p-0.5 border-b border-transparent hover:border-gray-300" value={b}
                                  onChange={e=>setPlanes(planes.map(x=>x.id===pl.id?{...x,beneficios:x.beneficios.map((bb,ii)=>ii===i?e.target.value:bb)}:x))}/>
                                <button onClick={()=>quitarBeneficioPlan(pl.id,i)} className="text-red-500 text-xs">×</button>
                              </li>
                            ))}
                          </ul>
                          <div className="flex gap-1 flex-wrap">
                            <button onClick={()=>agregarBeneficioPlan(pl.id)} className="text-xs px-2 py-1 rounded border" style={{color:pl.color,borderColor:pl.color}}>+ Beneficio</button>
                            <button onClick={()=>descargarPDF(pdfPlanCare(pl),'avante-care-'+pl.id)} className="text-xs px-2 py-1 rounded text-white flex items-center gap-1" style={{background:pl.color}}>
                              <Download size={10}/> PDF
                            </button>
                            <label className="text-xs px-2 py-1 rounded text-white flex items-center gap-1 cursor-pointer" style={{background:C.navy}}>
                              <Upload size={10}/> Doc
                              <input type="file" hidden onChange={e=>subirDocCare(e,pl.id)}/>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documentos descargables */}
                  {docsCare.length>0 && (
                    <div>
                      <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Documentos cargados ({docsCare.length})</h3>
                      <div className="space-y-1">
                        {docsCare.map(d=>{
                          const pl = planes.find(p=>p.id===d.planId);
                          return (
                            <div key={d.id} className="p-2 rounded border flex justify-between items-center">
                              <div className="text-xs flex-1 min-w-0">
                                <div className="font-medium truncate">{d.name}</div>
                                <div className="text-gray-500">{pl?.nombre||'—'} · {(d.size/1024).toFixed(0)} KB · {fmtFecha(d.fecha)}</div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={()=>descargarDocCare(d)} className="text-xs px-2 py-1 rounded text-white" style={{background:C.teal}}>
                                  <Download size={10}/>
                                </button>
                                <button onClick={()=>{if(confirm('¿Eliminar?'))eliminarDocCare(d.id);}} className="text-xs px-2 py-1 rounded text-white" style={{background:C.red}}>
                                  <Trash2 size={10}/>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pipeline comercial */}
                  <div className="p-4 rounded border-l-4" style={{borderColor:C.gold,background:C.cream}}>
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{color:C.navy}}>
                      <ShoppingCart size={14}/> Captura comercial · Prospectos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-2">
                      <input className="p-2 border rounded" placeholder="Nombre" value={nuevoLead.nombre}
                        onChange={e=>setNuevoLead({...nuevoLead,nombre:e.target.value})}/>
                      <input className="p-2 border rounded" placeholder="Teléfono" value={nuevoLead.telefono}
                        onChange={e=>setNuevoLead({...nuevoLead,telefono:e.target.value})}/>
                      <input className="p-2 border rounded" placeholder="Email" value={nuevoLead.email}
                        onChange={e=>setNuevoLead({...nuevoLead,email:e.target.value})}/>
                      <input className="p-2 border rounded" placeholder="País" value={nuevoLead.pais}
                        onChange={e=>setNuevoLead({...nuevoLead,pais:e.target.value})}/>
                      <select className="p-2 border rounded" value={nuevoLead.plan}
                        onChange={e=>setNuevoLead({...nuevoLead,plan:e.target.value})}>
                        {planes.map(pl=><option key={pl.id} value={pl.id}>{pl.nombre}</option>)}
                      </select>
                      <input className="p-2 border rounded" placeholder="Notas" value={nuevoLead.notas}
                        onChange={e=>setNuevoLead({...nuevoLead,notas:e.target.value})}/>
                    </div>
                    <button onClick={registrarLead} className={btn+" text-white flex items-center gap-2"} style={{background:C.gold}}>
                      <PlusCircle size={14}/> Registrar prospecto
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Prospectos ({leads.length})</h3>
                    {leads.length===0 && <div className="text-xs text-gray-500 p-3 border rounded">Sin prospectos aún.</div>}
                    <div className="space-y-1">
                      {leads.slice().reverse().map(l=>{
                        const pl = planes.find(p=>p.id===l.plan);
                        return (
                          <div key={l.id} className="p-2 rounded border flex justify-between items-start gap-2">
                            <div className="text-xs flex-1 min-w-0">
                              <div className="font-bold" style={{color:C.navy}}>{l.nombre}</div>
                              <div className="text-gray-600">{pl?.nombre||l.plan} · {l.pais||'—'} · {fmtFecha(l.fecha)}</div>
                              <div className="text-gray-500">{l.telefono||'—'} · {l.email||'—'}</div>
                              {l.notas && <div className="italic text-gray-500">{l.notas}</div>}
                            </div>
                            <div className="flex gap-1">
                              {l.telefono && <button onClick={()=>contactarLead(l,'wa')} className="px-2 py-1 text-xs rounded text-white" style={{background:'#25D366'}}>
                                <MessageCircle size={10}/>
                              </button>}
                              {l.email && <button onClick={()=>contactarLead(l,'email')} className="px-2 py-1 text-xs rounded text-white" style={{background:C.navy}}>
                                <Mail size={10}/>
                              </button>}
                              <button onClick={()=>{if(confirm('¿Eliminar?'))eliminarLead(l.id);}} className="px-2 py-1 text-xs rounded text-white" style={{background:C.red}}>
                                <Trash2 size={10}/>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>KPIs de experiencia del paciente</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {KPIS_EXPERIENCIA.map((k,i)=>(
                        <div key={i} className="p-3 rounded border" style={{borderColor:C.teal}}>
                          <div className="text-xs uppercase font-bold" style={{color:C.gold}}>{k.cat}</div>
                          <div className="font-bold text-sm" style={{color:C.navy}}>{k.k}</div>
                          <div className="text-xs text-gray-600">Meta: <strong>{k.meta}</strong></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* === EQUIPO === */}
          {tab==='equipo' && (
            <div>
              {modo==='paciente' ? (
                <>
                  <div className="p-6 rounded text-center mb-3" style={{background:C.cream}}>
                    <Users size={40} style={{color:C.teal}} className="mx-auto mb-3"/>
                    <h3 style={{fontFamily:'Georgia,serif',color:C.navy}} className="text-xl font-bold mb-2">Un equipo completo para usted</h3>
                    <p className="text-gray-700">No es solo un cirujano: es todo un equipo multidisciplinario trabajando en su bienestar.</p>
                  </div>
                  <div className="space-y-2">
                    {equipo.map((e,i)=>(
                      <div key={i} className="p-3 rounded border-l-4" style={{borderColor:C.teal,background:'white'}}>
                        <div className="flex justify-between flex-wrap gap-1">
                          <div className="font-bold text-sm" style={{color:C.navy}}>{e.rol}</div>
                          <div className="text-xs font-medium" style={{color:C.teal}}>{e.persona}</div>
                        </div>
                        {e.resp && <div className="text-xs text-gray-700 mt-1">{e.resp}</div>}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded border flex items-start gap-2" style={{borderColor:C.gold,background:C.cream}}>
                    <Info size={16} style={{color:C.gold,flexShrink:0,marginTop:2}}/>
                    <div className="text-xs text-gray-700">Este listado es <strong>editable</strong> y persiste en este navegador. Puede añadir, modificar y eliminar integrantes. Usa &quot;Restaurar&quot; para volver al equipo por defecto.</div>
                  </div>

                  <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{color:C.navy}}><Plus size={14}/>Agregar integrante</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input value={nuevoEquipo.rol} onChange={e=>setNuevoEquipo({...nuevoEquipo,rol:e.target.value})} placeholder="Rol / especialidad" className="px-2 py-1 rounded border text-sm"/>
                      <input value={nuevoEquipo.persona} onChange={e=>setNuevoEquipo({...nuevoEquipo,persona:e.target.value})} placeholder="Nombre" className="px-2 py-1 rounded border text-sm"/>
                      <input value={nuevoEquipo.resp} onChange={e=>setNuevoEquipo({...nuevoEquipo,resp:e.target.value})} placeholder="Responsabilidades" className="px-2 py-1 rounded border text-sm"/>
                    </div>
                    <button onClick={agregarMiembro} className={btn+" mt-2 text-white text-sm flex items-center gap-1"} style={{background:C.gold}}>
                      <Plus size={14}/>Agregar
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm" style={{color:C.navy}}>Integrantes ({equipo.length})</h3>
                    <button onClick={restaurarEquipo} className="text-xs underline" style={{color:C.teal}}>Restaurar equipo por defecto</button>
                  </div>

                  <div className="space-y-2">
                    {equipo.map((e,i)=>(
                      <div key={i} className="p-3 rounded border" style={{borderColor:'#e5e7eb'}}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input value={e.rol||''} onChange={ev=>editarMiembro(i,'rol',ev.target.value)} placeholder="Rol" className="px-2 py-1 rounded border text-sm font-bold" style={{color:C.navy}}/>
                          <input value={e.persona||''} onChange={ev=>editarMiembro(i,'persona',ev.target.value)} placeholder="Nombre" className="px-2 py-1 rounded border text-sm" style={{color:C.teal}}/>
                          <div className="flex gap-2">
                            <input value={e.resp||''} onChange={ev=>editarMiembro(i,'resp',ev.target.value)} placeholder="Responsabilidades" className="flex-1 px-2 py-1 rounded border text-sm"/>
                            <button onClick={()=>eliminarMiembro(i)} className="text-red-600 hover:bg-red-50 p-2 rounded" title="Eliminar"><Trash2 size={14}/></button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {equipo.length===0 && <p className="text-center text-gray-500 py-6 text-sm">Sin integrantes. Use &quot;Restaurar&quot; o agregue nuevos arriba.</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
