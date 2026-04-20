import React, { useState, useEffect } from 'react';
import { Activity, GraduationCap, Heart, Users, Scissors, UserCheck, BarChart3, FileText, ChevronRight, CheckCircle2, AlertTriangle, Download, Copy, Upload, Image as ImageIcon, Film, Trash2, Share2, Mail, Save, Shield } from 'lucide-react';
import { exportarPDF, descargarPDF, enviarPDFWhatsApp, enviarPDFEmail, storageGet, storageSet, leerArchivoDataURL, fmtFechaHora } from './src_shared/utils.js';
import { calcularTodas } from './src_shared/clasificaciones.js';
import { useLang } from './src_shared/i18n.jsx';

const C = { navy:'#0A1F44', teal:'#1A8B9D', gold:'#C9A961', cream:'#FAF7F2', green:'#2D8659', yellow:'#E0A82E', red:'#C0392B' };
const PROCS = { sleeve:'Manga Gástrica', rygb:'RYGB', oagb:'OAGB', sadis:'SADI-S', bpdds:'BPD-DS', balon:'Balón intragástrico', rev_sg_rygb:'Rev. Manga→RYGB', rev_sg_oagb:'Rev. Manga→OAGB' };

function imc(p){const pe=parseFloat(p.peso),t=parseFloat(p.talla)/100;return (pe&&t)?pe/(t*t):0;}
function nowLocalInput(){const d=new Date();const off=d.getTimezoneOffset();return new Date(d.getTime()-off*60000).toISOString().slice(0,16);}

function evaluarPlastica(p){
  const items=[]; const i=imc(p);
  const elegible = i<32;
  items.push({criterio:'Peso estable',cumple:'Pendiente',det:'Variación <5% en 6 meses'});
  items.push({criterio:'Tiempo post-bariátrica',cumple:'≥18 meses',det:'Permite estabilización ponderal y metabólica'});
  items.push({criterio:'IMC actual',cumple:i<32?'✓ Elegible':'⚠ Aún elevado',det:'<30-32 óptimo'});
  items.push({criterio:'Estado nutricional',cumple:'Verificar',det:'Albúmina >3.5, Hb >12, sin déficits'});
  items.push({criterio:'No tabaquismo',cumple:'Verificar',det:'Cesación ≥6 semanas'});
  items.push({criterio:'Salud psicológica',cumple:'Evaluar',det:'Expectativas realistas'});
  return {elegible,items};
}

const SECUENCIA_PLASTICA = [
  {orden:1,proc:'Abdominoplastia / Bodylift inferior',tiempo:'18-24m post-bariátrica',det:'Resección de delantal abdominal, reconstrucción de pared.'},
  {orden:2,proc:'Mamoplastia / Mastopexia / Ginecomastia',tiempo:'+3-6m',det:'Reconstrucción mamaria. En hombres: resección glandular.'},
  {orden:3,proc:'Braquioplastia + Cruroplastia',tiempo:'+3-6m',det:'Brazos y muslos. Cicatriz visible — manejar expectativas.'},
  {orden:4,proc:'Lifting facial / cervical',tiempo:'Opcional',det:'Pacientes con flacidez facial significativa.'}
];

function poblacionEspecial(p){
  const items=[]; const e=parseFloat(p.edad)||0; const i=imc(p);
  if(e<18) items.push({grupo:'Adolescente',consid:['IMC ≥35 + comorbilidad o ≥40','Madurez esquelética (Tanner ≥4)','Consentimiento familiar','Manga gástrica preferida (Teen-LABS)','Soporte multidisciplinario obligatorio']});
  if(e>=65) items.push({grupo:'Adulto mayor (≥65a)',consid:['Valoración cardiopulmonar exhaustiva','Valoración geriátrica integral','Manga preferida (menor morbilidad)','Sarcopenia: monitoreo proteico estricto']});
  if(p.sexo==='F'&&e>=18&&e<=45) items.push({grupo:'Mujer en edad fértil',consid:['Anticoncepción efectiva 12-18m post-cirugía','Consejería preconcepcional','Suplementación reforzada si embarazo']});
  if(i>=30&&i<35) items.push({grupo:'Cirugía metabólica (IMC 30-34.9)',consid:['DM2 no controlada con tratamiento óptimo','Criterios IFSO/ADA 2022','RYGB/OAGB preferidos']});
  if(items.length===0) items.push({grupo:'Población general',consid:['Sin consideraciones especiales. Protocolo estándar.']});
  return items;
}

const KPIS = [
  {k:'Mortalidad ≤30 días',meta:'<0.3%',cat:'Seguridad'},
  {k:'Mortalidad ≤90 días',meta:'<0.5%',cat:'Seguridad'},
  {k:'Reintervención ≤30 días',meta:'<3%',cat:'Seguridad'},
  {k:'Reingreso ≤30 días',meta:'<5%',cat:'Calidad'},
  {k:'Fuga anastomótica',meta:'<1%',cat:'Seguridad'},
  {k:'TEV sintomática',meta:'<0.5%',cat:'Seguridad'},
  {k:'Estancia hospitalaria',meta:'1.5-2 días',cat:'Eficiencia'},
  {k:'%PEP a 12m',meta:'≥50%',cat:'Outcomes'},
  {k:'%PTP a 12m',meta:'≥25%',cat:'Outcomes'},
  {k:'Remisión DM2 a 12m',meta:'≥60%',cat:'Metabólico'},
  {k:'Resolución HTA a 12m',meta:'≥60%',cat:'Metabólico'},
  {k:'Adherencia 12m',meta:'≥70%',cat:'Calidad'},
  {k:'BAROS Bueno-Excelente',meta:'>80%',cat:'PROMs'},
  {k:'Acreditación MBSAQIP',meta:'Vigente',cat:'Institucional'}
];

// === PLANTILLA EDITABLE NOTA OPERATORIA ===
function plantillaNotaOpInicial(p, nota){
  const n = nota || {};
  return {
    fechaCirugia: n.fechaCirugia || '',
    horaIncision: n.horaIncision || '',
    horaFinCirugia: n.horaFinCirugia || '',
    horaInduccionAnes: n.horaInduccionAnes || '',
    horaFinAnes: n.horaFinAnes || '',
    cirujano: n.cirujano || 'Dr. Ángel Henríquez',
    cirujano2: n.cirujano2 || '',
    cirujano3: n.cirujano3 || '',
    primerAyudante: n.primerAyudante || '',
    anestesiologo: n.anestesiologo || '',
    instrumentista: n.instrumentista || '',
    procedimiento: n.procedimiento || (PROCS[p.procedimiento]||''),
    hallazgos: n.hallazgos || 'Acceso laparoscópico, neumoperitoneo 15 mmHg.\nHígado: aspecto normal/esteatósico.\nAnatomía gastroesofágica: sin hernia hiatal.',
    tecnica: n.tecnica || 'Descripción técnica detallada…\nHemostasia verificada.\nTest de fuga (azul de metileno / aire): negativo.\nDrenaje: sí/no.',
    sangrado: n.sangrado || '',
    tamanoBujia: n.tamanoBujia || '36-40 Fr',
    complicaciones: n.complicaciones || 'Ninguna',
    analgesia: n.analgesia || { tap:true, autonomico:true, paracetamol:true, aine:true, opioideEvitar:true, epidural:false, bloqueoCuadrado:false, infiltracionPuerto:true },
    planPostop: n.planPostop || 'Profilaxis TEV con HBPM\nIBP postoperatorio\nLíquidos claros a las 6h si tolerancia\nMovilización temprana'
  };
}

const OPCIONES_ANALGESIA = [
  {k:'tap',l:'TAP block (transverso abdominal)'},
  {k:'autonomico',l:'Bloqueo visceral autonómico (su técnica)'},
  {k:'cuadrado',l:'Bloqueo cuadrado lumbar (QLB)'},
  {k:'epidural',l:'Epidural torácica'},
  {k:'paracetamol',l:'Paracetamol IV'},
  {k:'aine',l:'AINE (ketorolaco/diclofenaco)'},
  {k:'infiltracionPuerto',l:'Infiltración local de puertos (bupivacaína)'},
  {k:'opioideEvitar',l:'Evitar opioides sistémicos'},
  {k:'dexmedetomidina',l:'Dexmedetomidina infusión'},
  {k:'lidocainaIV',l:'Lidocaína IV perioperatoria'},
  {k:'ketamina',l:'Ketamina dosis bajas'}
];

/* ============================================================
 * Gauge semicircular bariátrico — reutilizable
 * invertido=true: mayor valor = mejor (verde a la derecha)
 * umbrales = [limite1, limite2] — aplican sobre max en sentido natural
 * ============================================================ */
function GaugeBar({ titulo, valor, max, umbrales, sub, valorLabel, invertido=false, colorTexto=C.navy }){
  const clamped = Math.max(0, Math.min(max, Number(valor)||0));
  const pct = max>0 ? clamped/max : 0;
  const W=200, H=120, CX=W/2, CY=100, R=80;
  const polar = (p) => { const a = Math.PI + p*Math.PI; return [CX+R*Math.cos(a), CY+R*Math.sin(a)]; };
  const arc = (p0,p1,color) => {
    const [x0,y0]=polar(p0), [x1,y1]=polar(p1);
    return <path d={`M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`} stroke={color} strokeWidth="15" fill="none" strokeLinecap="butt"/>;
  };
  const u0=umbrales[0]/max, u1=umbrales[1]/max;
  const [nx,ny]=polar(pct);
  const [c1,c2,c3] = invertido ? ['#C0392B','#E0A82E','#2D8659'] : ['#2D8659','#E0A82E','#C0392B'];
  return (
    <div className="flex flex-col items-center p-3 rounded-lg" style={{background:'white',border:'1px solid #e5e7eb',boxShadow:'0 1px 2px rgba(0,0,0,.04)'}}>
      <div className="text-xs font-bold mb-1 text-center leading-tight" style={{color:colorTexto}}>{titulo}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{maxHeight:128}}>
        <path d={`M ${CX-R} ${CY} A ${R} ${R} 0 0 1 ${CX+R} ${CY}`} stroke="#e5e7eb" strokeWidth="15" fill="none"/>
        {arc(0,u0,c1)}
        {arc(u0,u1,c2)}
        {arc(u1,1,c3)}
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="#0A1F44" strokeWidth="2.8" strokeLinecap="round"/>
        <circle cx={CX} cy={CY} r="6" fill="#C9A961" stroke="#0A1F44" strokeWidth="1.5"/>
        <text x="8" y={CY+18} fontSize="10" fill="#6b7280">0</text>
        <text x={W-22} y={CY+18} fontSize="10" fill="#6b7280">{max}</text>
      </svg>
      <div className="text-2xl font-bold" style={{color:colorTexto,marginTop:-4}}>{valorLabel!=null?valorLabel:clamped}</div>
      {sub && <div className="text-[10px] text-gray-600 text-center leading-tight">{sub}</div>}
    </div>
  );
}

/* ============================================================
 * Gráfico de líneas proyectivo (12 meses) — IMC, %PTP, %PEP
 * puntos: [{m, v}] — dibuja eje X 0-12 meses, eje Y escala dinámica
 * ============================================================ */
function ProyeccionChart({ titulo, unidad, color, puntos, metaTexto, minY, maxY }){
  const W=360, H=200, PL=40, PR=16, PT=20, PB=34;
  const xs = puntos.map(p=>p.m), ys = puntos.map(p=>p.v);
  const ymax = maxY!=null ? maxY : Math.max(...ys)*1.1;
  const ymin = minY!=null ? minY : Math.min(0, Math.min(...ys));
  const rangeY = ymax-ymin || 1;
  const sx = (m)=> PL + (m/12)*(W-PL-PR);
  const sy = (v)=> PT + (1 - (v-ymin)/rangeY)*(H-PT-PB);
  const path = puntos.map((p,i)=> (i===0?'M':'L') + sx(p.m).toFixed(1) + ',' + sy(p.v).toFixed(1)).join(' ');
  const areaPath = path + ` L ${sx(12).toFixed(1)} ${sy(ymin).toFixed(1)} L ${sx(0).toFixed(1)} ${sy(ymin).toFixed(1)} Z`;
  const gridY = 4;
  return (
    <div className="p-3 rounded-lg" style={{background:'white',border:'1px solid #e5e7eb'}}>
      <div className="flex justify-between items-center mb-1">
        <div className="text-xs font-bold" style={{color:C.navy}}>{titulo}</div>
        {metaTexto && <div className="text-[10px] font-bold px-2 py-0.5 rounded" style={{background:color,color:'white'}}>{metaTexto}</div>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{maxHeight:220}}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        {Array.from({length:gridY+1}).map((_,i)=>{
          const v = ymin + (rangeY*i/gridY);
          const y = sy(v);
          return <g key={i}>
            <line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#f3f4f6" strokeWidth="1"/>
            <text x={PL-6} y={y+3} fontSize="9" textAnchor="end" fill="#6b7280">{v.toFixed(unidad==='kg/m²'?1:0)}</text>
          </g>;
        })}
        {[0,1,2,3,6,9,12].map(m=>{
          const x=sx(m);
          return <g key={m}>
            <line x1={x} y1={PT} x2={x} y2={H-PB} stroke="#f3f4f6" strokeWidth="1"/>
            <text x={x} y={H-PB+14} fontSize="9" textAnchor="middle" fill="#6b7280">{m===0?'Pre':m+'m'}</text>
          </g>;
        })}
        <path d={areaPath} fill={`url(#grad-${color.replace('#','')})`}/>
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {puntos.map((p,i)=>(
          <circle key={i} cx={sx(p.m)} cy={sy(p.v)} r={p.m%3===0||p.m===12?3.5:2} fill="white" stroke={color} strokeWidth="2"/>
        ))}
        {puntos.filter(p=>[0,3,6,12].includes(p.m)).map((p,i)=>(
          <text key={i} x={sx(p.m)} y={sy(p.v)-8} fontSize="9" fontWeight="bold" textAnchor="middle" fill={C.navy}>{p.v.toFixed(unidad==='kg/m²'?1:0)}{unidad==='%'?'%':''}</text>
        ))}
        <text x={PL} y={PT-6} fontSize="9" fill="#9ca3af">{unidad}</text>
      </svg>
    </div>
  );
}

/* ============================================================
 * Trayectorias mensuales por procedimiento
 * Fracción del %TWL a 12m alcanzada cada mes.
 * Basado en curvas de literatura (STAMPEDE/SLEEVEPASS/SM-BOSS).
 * ============================================================ */
const FRAC_TWL_MENSUAL = {
  sleeve:      [0, 0.18, 0.33, 0.46, 0.56, 0.65, 0.73, 0.80, 0.86, 0.91, 0.95, 0.98, 1.00],
  rygb:        [0, 0.20, 0.36, 0.50, 0.60, 0.68, 0.75, 0.82, 0.88, 0.92, 0.96, 0.98, 1.00],
  oagb:        [0, 0.20, 0.36, 0.50, 0.60, 0.68, 0.75, 0.82, 0.88, 0.92, 0.96, 0.98, 1.00],
  sadis:       [0, 0.22, 0.38, 0.52, 0.62, 0.70, 0.77, 0.83, 0.89, 0.93, 0.96, 0.98, 1.00],
  bpdds:       [0, 0.22, 0.38, 0.52, 0.62, 0.70, 0.77, 0.83, 0.89, 0.93, 0.96, 0.98, 1.00],
  balon:       [0, 0.25, 0.45, 0.65, 0.80, 0.92, 1.00, 0.98, 0.92, 0.82, 0.70, 0.58, 0.45],
  rev_sg_rygb: [0, 0.16, 0.30, 0.42, 0.52, 0.62, 0.70, 0.77, 0.84, 0.90, 0.94, 0.97, 1.00],
  rev_sg_oagb: [0, 0.17, 0.32, 0.44, 0.54, 0.63, 0.71, 0.78, 0.85, 0.91, 0.95, 0.97, 1.00]
};

function calcularProyeccion(p, bwtp){
  const proc = p.procedimiento || 'sleeve';
  const fr = FRAC_TWL_MENSUAL[proc] || FRAC_TWL_MENSUAL.sleeve;
  const targetTWL = bwtp ? bwtp.trayectoria.y1 : 25;
  const peso0 = parseFloat(p.peso)||0;
  const tallaM = (parseFloat(p.talla)||0)/100;
  const imc0 = (peso0 && tallaM) ? peso0/(tallaM*tallaM) : 0;
  const pesoIdeal = tallaM ? 25*tallaM*tallaM : 0;
  const exceso = Math.max(0.1, peso0 - pesoIdeal);
  const meses = Array.from({length:13}, (_,m)=>{
    const twl = targetTWL * fr[m];
    const peso = peso0 * (1 - twl/100);
    const imc_m = (peso && tallaM) ? peso/(tallaM*tallaM) : 0;
    const ewl = exceso>0 ? ((peso0-peso)/exceso)*100 : 0;
    return { m, twl:+twl.toFixed(1), peso:+peso.toFixed(1), imc:+imc_m.toFixed(1), ewl:+ewl.toFixed(1) };
  });
  return { meses, peso0, imc0, pesoIdeal:+pesoIdeal.toFixed(1), targetTWL, exceso:+exceso.toFixed(1) };
}

const INDICACIONES_ENDO = [
  'Estudio pre-operatorio bariátrico','Evaluación anatómica post-manga','Evaluación anatómica post-RYGB/OAGB',
  'Estudio de disfagia / vómito','Estudio de dolor abdominal','ERGE refractario','Sospecha de estenosis',
  'Sospecha de fístula','Colocación de balón intragástrico','Retiro de balón intragástrico',
  'Ajuste de balón intragástrico (Spatz)','TORe (Outlet revision)','Gastroplastia endoscópica (ESG)',
  'Dilatación de estenosis','Hemostasia endoscópica','Colocación de clip OTSC','Colocación de stent','Otro'
];
const SEGMENTOS_ENDO = [
  {k:'esofago',l:'Esófago (mucosa, motilidad, hallazgos)'},
  {k:'cardias',l:'Unión gastroesofágica / cardias (hernia hiatal, Hill)'},
  {k:'estomago',l:'Estómago / manga o pouch (mucosa, distensibilidad, estasis)'},
  {k:'piloro',l:'Píloro (permeabilidad)'},
  {k:'anastomosis',l:'Anastomosis gastroyeyunal / entero-entero (diámetro, úlceras)'},
  {k:'duodeno',l:'Duodeno / asa biliopancreática (si accesible)'}
];
function plantillaEndoscopiaInicial(p, endo){
  const e = endo || {};
  return {
    fecha: e.fecha || '',
    endoscopista: e.endoscopista || 'Dr. Ángel Henríquez',
    asistente: e.asistente || '',
    indicacion: e.indicacion || INDICACIONES_ENDO[0],
    sedacion: e.sedacion || 'Sedación profunda con propofol, monitoreo ASA',
    equipo: e.equipo || 'Videoendoscopio Olympus / Fujinon · CO₂ insuflación',
    esofago: e.esofago || 'Mucosa normal. No esofagitis (Los Angeles A/B/C/D). Sin hernia hiatal.',
    cardias: e.cardias || 'Unión gastroesofágica a — cm. Hill I. Sin signos de reflujo.',
    estomago: e.estomago || 'Manga/pouch de calibre regular. Sin estasis, sin úlceras, sin torsión.',
    piloro: e.piloro || 'Píloro permeable, centrado.',
    anastomosis: e.anastomosis || 'Anastomosis de — mm, sin úlceras marginales. Asa aferente sin reflujo biliar.',
    duodeno: e.duodeno || 'Bulbo y segunda porción sin lesiones.',
    hpylori: e.hpylori || 'no_realizado',
    biopsias: e.biopsias || 'No',
    sitioBiopsia: e.sitioBiopsia || '',
    terapeutico: e.terapeutico || 'Ninguno',
    detTerapeutico: e.detTerapeutico || '',
    complicaciones: e.complicaciones || 'Ninguna',
    conclusion: e.conclusion || 'Endoscopia digestiva alta sin hallazgos patológicos relevantes.',
    recomendaciones: e.recomendaciones || 'Continuar IBP según indicación. Control clínico.',
    tiempo: e.tiempo || ''
  };
}

function plantillaAltaInicial(p, alta){
  const a = alta || {};
  return {
    fechaEgreso: a.fechaEgreso || '',
    indicaciones: a.indicaciones || '1. Dieta líquida hiperproteica fase 2 por 14 días, luego progresar\n2. HBPM SC c/24h por 14-28 días\n3. IBP (omeprazol 20mg) c/12h por 6 meses\n4. Multivitamínico bariátrico al iniciar fase purés\n5. Hidratación ≥1.5 L/día\n6. Movilización activa, evitar ejercicio intenso 4 semanas\n7. Analgesia: paracetamol 1g c/8h, evitar AINEs',
    alarmas: a.alarmas || 'Taquicardia >120, fiebre >38°C\nDolor abdominal severo o en aumento\nVómito persistente, intolerancia oral\nDisnea, dolor torácico\nSangrado por herida o digestivo',
    citas: a.citas || 'Control telefónico: 48-72h\nConsulta presencial: 7-10 días\nNutrición: 14 días\nPsicología: 21 días',
    firmaMedico: a.firmaMedico || 'Dr. Ángel Henríquez'
  };
}

export default function Modulo5(){
  const { t } = useLang();
  const [modo,setModo]=useState('clinico');
  const [pacientes,setPacientes]=useState([]);
  const [seleccionado,setSeleccionado]=useState(null);
  const [tab,setTab]=useState('riesgo');
  const [tipoDoc,setTipoDoc]=useState('notaop');
  const [cargando,setCargando]=useState(true);
  const [media,setMedia]=useState({});
  const [mediaEndo,setMediaEndo]=useState({}); // { [pacienteId]: [{id,nombre,tipo,data}] }
  const [notasOp,setNotasOp]=useState({});   // { [pacienteId]: {...} }
  const [altas,setAltas]=useState({});       // { [pacienteId]: {...} }
  const [endoscopias,setEndoscopias]=useState({}); // { [pacienteId]: {...} }
  const [notaOpActual,setNotaOpActual]=useState(null);
  const [altaActual,setAltaActual]=useState(null);
  const [endoActual,setEndoActual]=useState(null);

  useEffect(()=>{(async()=>{
    setPacientes(await storageGet('avante_pacientes')||[]);
    setMedia(await storageGet('avante_op_media')||{});
    setMediaEndo(await storageGet('avante_endo_media')||{});
    setNotasOp(await storageGet('avante_notas_op')||{});
    setAltas(await storageGet('avante_altas')||{});
    setEndoscopias(await storageGet('avante_endoscopias')||{});
    setCargando(false);
  })();},[]);

  useEffect(()=>{
    if(seleccionado){
      setNotaOpActual(plantillaNotaOpInicial(seleccionado, notasOp[seleccionado.id]));
      setAltaActual(plantillaAltaInicial(seleccionado, altas[seleccionado.id]));
      setEndoActual(plantillaEndoscopiaInicial(seleccionado, endoscopias[seleccionado.id]));
    }
  },[seleccionado]);

  const guardarNotaOp=async()=>{
    const act={...notasOp,[seleccionado.id]:notaOpActual};
    setNotasOp(act); await storageSet('avante_notas_op',act);
    alert('Nota operatoria guardada');
  };
  const guardarAlta=async()=>{
    const act={...altas,[seleccionado.id]:altaActual};
    setAltas(act); await storageSet('avante_altas',act);
    alert('Resumen de egreso guardado');
  };
  const guardarEndoscopia=async()=>{
    const act={...endoscopias,[seleccionado.id]:endoActual};
    setEndoscopias(act); await storageSet('avante_endoscopias',act);
    alert('Reporte de endoscopia guardado');
  };

  const subirMedia=async(e)=>{
    if(!seleccionado)return;
    const f=e.target.files&&e.target.files[0]; if(!f)return;
    try{
      const r=await leerArchivoDataURL(f,5*1024*1024);
      const lista=media[seleccionado.id]||[];
      const item={id:Date.now().toString(),nombre:r.name,tipo:r.type,data:r.dataUrl,fecha:new Date().toISOString()};
      const act={...media,[seleccionado.id]:[...lista,item]};
      setMedia(act); await storageSet('avante_op_media',act);
    }catch(err){alert(err.message);}
  };
  const eliminarMedia=async(id)=>{
    const lista=(media[seleccionado.id]||[]).filter(x=>x.id!==id);
    const act={...media,[seleccionado.id]:lista}; setMedia(act);
    await storageSet('avante_op_media',act);
  };

  // Subida de imágenes y videos específicos del reporte de endoscopia
  const subirMediaEndo=async(e)=>{
    if(!seleccionado)return;
    const files=e.target.files; if(!files||!files.length)return;
    try{
      const lista=mediaEndo[seleccionado.id]||[];
      const nuevos=[];
      for(const f of files){
        // 8 MB por archivo para admitir clips de video cortos
        const r=await leerArchivoDataURL(f,8*1024*1024);
        nuevos.push({id:Date.now().toString()+Math.random().toString(36).slice(2,6),nombre:r.name,tipo:r.type,data:r.dataUrl,etiqueta:'',fecha:new Date().toISOString()});
      }
      const act={...mediaEndo,[seleccionado.id]:[...lista,...nuevos]};
      setMediaEndo(act); await storageSet('avante_endo_media',act);
    }catch(err){alert(err.message);}
    e.target.value='';
  };
  const eliminarMediaEndo=async(id)=>{
    const lista=(mediaEndo[seleccionado.id]||[]).filter(x=>x.id!==id);
    const act={...mediaEndo,[seleccionado.id]:lista}; setMediaEndo(act);
    await storageSet('avante_endo_media',act);
  };
  const etiquetarMediaEndo=async(id,etiqueta)=>{
    const lista=(mediaEndo[seleccionado.id]||[]).map(x=>x.id===id?{...x,etiqueta}:x);
    const act={...mediaEndo,[seleccionado.id]:lista}; setMediaEndo(act);
    await storageSet('avante_endo_media',act);
  };

  const notaOpTexto = (n) => {
    if(!n) return '';
    const analgesia = OPCIONES_ANALGESIA.filter(o=>n.analgesia&&n.analgesia[o.k]).map(o=>'• '+o.l).join('\n');
    return `NOTA OPERATORIA · AVANTE COMPLEJO HOSPITALARIO
Paciente: ${seleccionado.nombre||''} ${seleccionado.apellido||''}   JVPM: ${seleccionado.jvpm||'—'}   NUE: ${seleccionado.nue||'—'}
Edad: ${seleccionado.edad||'—'}  Sexo: ${seleccionado.sexo||'—'}  IMC: ${imc(seleccionado).toFixed(1)}

FECHA DE CIRUGÍA: ${n.fechaCirugia||'—'}
TIEMPOS QUIRÚRGICOS: Incisión ${n.horaIncision||'—'} · Fin cirugía ${n.horaFinCirugia||'—'}
TIEMPOS ANESTÉSICOS: Inducción ${n.horaInduccionAnes||'—'} · Fin anestesia ${n.horaFinAnes||'—'}

EQUIPO:
Cirujano 1: ${n.cirujano||''}
Cirujano 2: ${n.cirujano2||'—'}
Cirujano 3: ${n.cirujano3||'—'}
Primer ayudante: ${n.primerAyudante||''}
Anestesiólogo: ${n.anestesiologo||''}
Instrumentista: ${n.instrumentista||''}

PROCEDIMIENTO: ${n.procedimiento||''}

HALLAZGOS:
${n.hallazgos||''}

TÉCNICA:
${n.tecnica||''}
Bujía: ${n.tamanoBujia||'—'}
Sangrado estimado: ${n.sangrado||'—'} mL
Complicaciones intraoperatorias: ${n.complicaciones||'Ninguna'}

ANALGESIA MULTIMODAL:
${analgesia||'—'}

PLAN POSTOPERATORIO:
${n.planPostop||''}

${n.cirujano||''}
Cirugía bariátrica · Avante Complejo Hospitalario`;
  };

  const altaTexto = (a) => {
    if(!a) return '';
    return `RESUMEN DE EGRESO · AVANTE COMPLEJO HOSPITALARIO
Paciente: ${seleccionado.nombre||''} ${seleccionado.apellido||''}
Procedimiento: ${PROCS[seleccionado.procedimiento]||''}
Fecha de egreso: ${a.fechaEgreso||'—'}

INDICACIONES:
${a.indicaciones||''}

SIGNOS DE ALARMA:
${a.alarmas||''}

CITAS DE SEGUIMIENTO:
${a.citas||''}

${a.firmaMedico||''}`;
  };

  const endoscopiaTexto = (e) => {
    if(!e) return '';
    const hp = e.hpylori==='positivo'?'Positivo':e.hpylori==='negativo'?'Negativo':'No realizado';
    return `REPORTE DE ENDOSCOPIA DIGESTIVA ALTA · AVANTE COMPLEJO HOSPITALARIO
Paciente: ${seleccionado.nombre||''} ${seleccionado.apellido||''}   JVPM: ${seleccionado.jvpm||'—'}   NUE: ${seleccionado.nue||'—'}
Edad: ${seleccionado.edad||'—'}  Sexo: ${seleccionado.sexo||'—'}  IMC: ${imc(seleccionado).toFixed(1)}

FECHA: ${e.fecha||'—'}
DURACIÓN: ${e.tiempo||'—'}
ENDOSCOPISTA: ${e.endoscopista||''}
ASISTENTE: ${e.asistente||'—'}
INDICACIÓN: ${e.indicacion||''}
SEDACIÓN: ${e.sedacion||''}
EQUIPO: ${e.equipo||''}

HALLAZGOS POR SEGMENTO:
Esófago: ${e.esofago||'—'}
Unión gastroesofágica / cardias: ${e.cardias||'—'}
Estómago / manga / pouch: ${e.estomago||'—'}
Píloro: ${e.piloro||'—'}
Anastomosis gastroyeyunal / entero-entero: ${e.anastomosis||'—'}
Duodeno / asa biliopancreática: ${e.duodeno||'—'}

H. pylori (rapid urease / biopsia): ${hp}
Biopsias: ${e.biopsias||'—'}${e.sitioBiopsia?` (${e.sitioBiopsia})`:''}

PROCEDIMIENTO TERAPÉUTICO: ${e.terapeutico||'Ninguno'}
${e.detTerapeutico||''}

COMPLICACIONES: ${e.complicaciones||'Ninguna'}

CONCLUSIÓN:
${e.conclusion||''}

RECOMENDACIONES:
${e.recomendaciones||''}

${e.endoscopista||''}
Cirugía bariátrica y endoscopia · Avante Complejo Hospitalario`;
  };

  const copiar=(txt)=>{navigator.clipboard.writeText(txt); alert('Copiado al portapapeles');};

  const construirPDF=()=>{
    const riesgos = calcularTodas(seleccionado);
    return exportarPDF({
      titulo:'Plástica · Calidad · Documentación',
      subtitulo:`${seleccionado.nombre||''} ${seleccionado.apellido||''} · ${PROCS[seleccionado.procedimiento]||''}`,
      secciones:[
        { titulo:'Riesgos personalizados (clasificaciones bariátricas)', lineas:[
          `MAGKOS/Aminian — ${riesgos.magkosAminian.interpretacion}`,
          `MACE — ${riesgos.mace.interpretacion}`,
          `SPLENDID — ${riesgos.splendid.interpretacion}`,
          `ADAMS/SM-BOSS — ${riesgos.adamsSmBoss.interpretacion}`,
          `BWTP — ${riesgos.bwtp.interpretacion}`,
          `SleevePass — ${riesgos.sleevePass.interpretacion}`
        ]},
        { titulo:'Nota operatoria', lineas: notaOpTexto(notaOpActual).split('\n') },
        { titulo:'Reporte de endoscopia', lineas: endoActual ? endoscopiaTexto(endoActual).split('\n') : ['Sin reporte de endoscopia registrado.'] },
        { titulo:'Archivos multimedia de la endoscopia', lineas: ((mediaEndo[seleccionado.id]||[]).length
            ? (mediaEndo[seleccionado.id]||[]).map(m=>`${m.tipo.startsWith('video')?'VIDEO':'IMG'} · ${m.nombre}${m.etiqueta?' — '+m.etiqueta:''}`)
            : ['Sin archivos adjuntos'])
        },
        { titulo:'Resumen de egreso', lineas: altaTexto(altaActual).split('\n') },
        { titulo:'Indicadores de calidad (metas)', lineas: KPIS.map(k=>`${k.k} — meta ${k.meta} (${k.cat})`) }
      ],
      footer:'Avante · Módulo 5'
    });
  };
  const nomArchivo=()=>`modulo5_${seleccionado.nombre||'paciente'}`;
  const descargarPDFPac=()=>descargarPDF(construirPDF(),nomArchivo());
  const whatsapp=()=>enviarPDFWhatsApp(construirPDF(),nomArchivo(),seleccionado.telefono||'',`Documentación Avante - ${seleccionado.nombre||''}`);
  const email=()=>enviarPDFEmail(construirPDF(),nomArchivo(),seleccionado.email||'','Documentación Avante',`Adjunto documentación de ${seleccionado.nombre||''}`);

  const descargarTxt=(txt,nombre)=>{const blob=new Blob([txt],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=nombre;a.click();};

  const btn="px-4 py-2 rounded font-medium transition-colors";
  if(cargando)return <div className="p-8 text-center">Cargando...</div>;

  const riesgos = seleccionado ? calcularTodas(seleccionado) : null;

  return (
    <div className="min-h-screen p-4" style={{background:'#f3f4f6',fontFamily:'system-ui,sans-serif'}}>
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div style={{background:C.navy,color:'white'}} className="p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 style={{fontFamily:'Georgia,serif',color:C.gold}} className="text-3xl font-bold">Avante Complejo Hospitalario</h1>
              <p style={{fontFamily:'Georgia,serif'}} className="text-sm italic mt-1">{t('app.lema')}</p>
              <p className="text-xs mt-2 opacity-80">{t('modulo')} 5 · {t('mod.5.titulo')}</p>
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
                  <div className="text-xs text-gray-600">{seleccionado.edad}a · IMC {imc(seleccionado).toFixed(1)} · {PROCS[seleccionado.procedimiento]||'—'}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={descargarPDFPac} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Download size={14}/>PDF</button>
                  <button onClick={whatsapp} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:'#25D366'}}><Share2 size={14}/>WhatsApp</button>
                  <button onClick={email} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.navy}}><Mail size={14}/>Email</button>
                  <button onClick={()=>setSeleccionado(null)} className={btn+" text-sm"} style={{background:'#e5e7eb'}}>Cambiar</button>
                </div>
              </div>

              <div className="flex gap-1 mb-4 border-b overflow-x-auto">
                {[{id:'riesgo',i:Shield,k:'tab.riesgo'},{id:'plastica',i:Scissors,k:'tab.plastica'},{id:'poblaciones',i:UserCheck,l:'Poblaciones'},{id:'calidad',i:BarChart3,l:'Calidad'},{id:'docs',i:FileText,l:'Documentación'}].map(tb=>{
                  const I=tb.i;
                  return <button key={tb.id} onClick={()=>setTab(tb.id)} className="px-3 py-2 flex items-center gap-1 text-sm font-medium border-b-2 whitespace-nowrap"
                    style={{borderColor:tab===tb.id?C.gold:'transparent',color:tab===tb.id?C.navy:'#6b7280'}}><I size={14}/>{tb.l||t(tb.k)}</button>;
                })}
              </div>

              {tab==='riesgo' && riesgos && (()=>{
                const proy = calcularProyeccion(seleccionado, riesgos.bwtp);
                const procLabel = PROCS[seleccionado.procedimiento]||'procedimiento';
                const imcFinal = proy.meses[12].imc;
                const twlFinal = proy.meses[12].twl;
                const ewlFinal = proy.meses[12].ewl;
                const imcMin = Math.floor(Math.min(...proy.meses.map(m=>m.imc))-1);
                const imcMax = Math.ceil(proy.imc0+1);
                // SleevePass: usar neto (-5..8) llevado a 0..13
                const spNeto = (riesgos.sleevePass.neto||0) + 5;
                return (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-sm mb-3" style={{color:C.navy}}>Riesgos bariátricos clasificados</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          {
                            gauge:<GaugeBar titulo="MAGKOS / Aminian · Resolución MASH" valor={riesgos.magkosAminian.probResolucion} max={100} umbrales={[50,75]} invertido={true} valorLabel={`${riesgos.magkosAminian.probResolucion}%`} sub={`Score ${riesgos.magkosAminian.score} · AST/ALT ${riesgos.magkosAminian.astAlt}`}/>,
                            leyenda:'Predice la probabilidad de resolución de hígado graso (MASH/MASLD) tras cirugía metabólica. Integra IMC, transaminasas, HbA1c, lípidos y edad. Verde = alta probabilidad de reversión hepática.',
                            interp: riesgos.magkosAminian.interpretacion
                          },
                          {
                            gauge:<GaugeBar titulo="MACE · Sensibilidad muscular profunda" valor={riesgos.mace.score} max={7} umbrales={[3,5]} invertido={false} sub={`Riesgo de sarcopenia: ${riesgos.mace.riesgo}`}/>,
                            leyenda:'Estima riesgo de sarcopenia peri-operatoria (pérdida de masa/fuerza muscular). Considera edad, IMC, handgrip y masa magra. Rojo = requiere proteína ≥1.5 g/kg y entrenamiento de resistencia.',
                            interp: riesgos.mace.interpretacion
                          },
                          {
                            gauge:<GaugeBar titulo="SPLENDID · Resolución dislipidemia (3a)" valor={riesgos.splendid.probResolucion} max={100} umbrales={[50,75]} invertido={true} valorLabel={`${riesgos.splendid.probResolucion}%`} sub={`Score ${riesgos.splendid.score} · Nivel ${riesgos.splendid.nivel}`}/>,
                            leyenda:'Probabilidad de normalización del perfil lipídico sin estatina a 3 años (Aminian/Cleveland Clinic, JAMA 2020). Cirugía reduce ~40% los eventos cardiovasculares mayores.',
                            interp: riesgos.splendid.interpretacion
                          },
                          {
                            gauge:<GaugeBar titulo="ADAMS / SM-BOSS · Remisión DM2 (5a)" valor={riesgos.adamsSmBoss.probRemision} max={100} umbrales={[50,75]} invertido={true} valorLabel={`${riesgos.adamsSmBoss.probRemision}%`} sub={`Favorabilidad ${riesgos.adamsSmBoss.nivel}`}/>,
                            leyenda:'Probabilidad de remisión sostenida de DM2 a 5 años (ADAMS 2012 + SM-BOSS 2018). Peor pronóstico con DM de larga evolución, insulina o péptido-C bajo. RYGB/OAGB mejoran el score.',
                            interp: riesgos.adamsSmBoss.interpretacion
                          },
                          {
                            gauge:<GaugeBar titulo="BWTP · %TWL esperado a 12 meses" valor={riesgos.bwtp.trayectoria.y1} max={40} umbrales={[15,25]} invertido={true} valorLabel={`${riesgos.bwtp.trayectoria.y1}%`} sub={`Peso estimado 1a: ${riesgos.bwtp.pesoEstY1} kg`}/>,
                            leyenda:'Bariatric Weight Trajectory: estima el porcentaje de pérdida total de peso a 1/3/5 años según procedimiento prescrito, ajustado por edad y DM2. Verde = trayectoria óptima.',
                            interp: riesgos.bwtp.interpretacion
                          },
                          {
                            gauge:<GaugeBar titulo="SleevePass · Balance Manga vs RYGB" valor={spNeto} max={13} umbrales={[5,8]} invertido={true} valorLabel={riesgos.sleevePass.neto>0?`+${riesgos.sleevePass.neto}`:`${riesgos.sleevePass.neto}`} sub={riesgos.sleevePass.recomendacion}/>,
                            leyenda:'Balance clínico de preferencia entre Manga gástrica y RYGB (Helmiö/Salminen, 10 años). ERGE severo o DM2 mal controlada inclinan a RYGB; anticoagulación o preferencia a Manga.',
                            interp: riesgos.sleevePass.interpretacion
                          }
                        ].map((g,i)=>(
                          <div key={i} className="flex flex-col gap-2">
                            {g.gauge}
                            <div className="px-2 py-1.5 rounded text-[11px] leading-snug" style={{background:C.cream,color:'#374151',borderLeft:`3px solid ${C.gold}`}}>
                              <div className="font-bold mb-0.5" style={{color:C.navy}}>¿Qué significa?</div>
                              <div>{g.leyenda}</div>
                              <div className="mt-1 italic" style={{color:C.teal}}>{g.interp}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                        <h3 className="font-bold text-sm" style={{color:C.navy}}>Proyección a 12 meses — {procLabel}</h3>
                        <div className="text-[11px] text-gray-600">
                          Peso basal <strong>{proy.peso0} kg</strong> · IMC <strong>{proy.imc0.toFixed(1)}</strong> · Peso ideal (IMC 25) <strong>{proy.pesoIdeal} kg</strong> · Exceso <strong>{proy.exceso} kg</strong>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <ProyeccionChart titulo="IMC (kg/m²)" unidad="kg/m²" color={C.teal}
                          puntos={proy.meses.map(x=>({m:x.m,v:x.imc}))}
                          minY={Math.max(18,imcMin)} maxY={imcMax}
                          metaTexto={`${imcFinal.toFixed(1)} a 12m`}/>
                        <ProyeccionChart titulo="%PTP · Pérdida de peso total" unidad="%" color={C.gold}
                          puntos={proy.meses.map(x=>({m:x.m,v:x.twl}))}
                          minY={0} maxY={Math.max(10, Math.ceil(twlFinal*1.15))}
                          metaTexto={`${twlFinal.toFixed(1)}% a 12m`}/>
                        <ProyeccionChart titulo="%PEP · Pérdida del exceso de peso" unidad="%" color={'#2D8659'}
                          puntos={proy.meses.map(x=>({m:x.m,v:x.ewl}))}
                          minY={0} maxY={Math.max(20, Math.ceil(Math.max(...proy.meses.map(x=>x.ewl))*1.1))}
                          metaTexto={`${ewlFinal.toFixed(1)}% a 12m`}/>
                      </div>
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {[3,6,9,12].map(m=>{
                          const x = proy.meses[m];
                          return (
                            <div key={m} className="p-2 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                              <div className="font-bold" style={{color:C.navy}}>Mes {m}</div>
                              <div>Peso: <strong>{x.peso} kg</strong></div>
                              <div>IMC: <strong>{x.imc}</strong></div>
                              <div>%PTP: <strong>{x.twl}%</strong></div>
                              <div>%PEP: <strong>{x.ewl}%</strong></div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 text-[10px] text-gray-500 leading-snug">
                        Proyección basada en trayectorias promedio publicadas (STAMPEDE, SLEEVEPASS, SM-BOSS, SADI-S RCT) ajustadas por edad y DM2. Resultados individuales pueden variar ±8% según adherencia, composición corporal y respuesta metabólica.
                      </div>
                    </div>
                  </div>
                );
              })()}

              {tab==='plastica' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Criterios de elegibilidad</h3>
                    <div className="space-y-2">
                      {evaluarPlastica(seleccionado).items.map((c,i)=>(
                        <div key={i} className="p-3 rounded flex gap-2" style={{background:C.cream}}>
                          <CheckCircle2 size={16} style={{color:C.teal,flexShrink:0,marginTop:2}}/>
                          <div className="flex-1">
                            <div className="font-bold text-sm" style={{color:C.navy}}>{c.criterio} <span className="text-xs font-normal text-gray-600">— {c.cumple}</span></div>
                            <div className="text-xs text-gray-700">{c.det}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Secuencia recomendada</h3>
                    <div className="space-y-2">
                      {SECUENCIA_PLASTICA.map((s,i)=>(
                        <div key={i} className="p-3 rounded border-l-4" style={{background:C.cream,borderColor:C.gold}}>
                          <div className="font-bold text-sm" style={{color:C.navy}}>{s.orden}. {s.proc} <span className="text-xs font-normal text-gray-500">· {s.tiempo}</span></div>
                          <div className="text-xs text-gray-700 mt-1">{s.det}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab==='poblaciones' && (
                <div className="space-y-3">
                  {poblacionEspecial(seleccionado).map((g,i)=>(
                    <div key={i} className="p-4 rounded border-l-4" style={{background:C.cream,borderColor:C.teal}}>
                      <div className="font-bold mb-2" style={{color:C.navy}}>{g.grupo}</div>
                      <ul className="space-y-1">
                        {g.consid.map((x,j)=>(<li key={j} className="text-sm flex gap-2"><AlertTriangle size={14} style={{color:C.gold,flexShrink:0,marginTop:3}}/>{x}</li>))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {tab==='calidad' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {KPIS.map((k,i)=>(
                    <div key={i} className="p-3 rounded border" style={{borderColor:C.teal}}>
                      <div className="text-xs uppercase font-bold" style={{color:C.gold}}>{k.cat}</div>
                      <div className="font-bold text-sm" style={{color:C.navy}}>{k.k}</div>
                      <div className="text-xs text-gray-600">Meta: <strong>{k.meta}</strong></div>
                    </div>
                  ))}
                </div>
              )}

              {tab==='docs' && notaOpActual && altaActual && endoActual && (
                <div>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <button onClick={()=>setTipoDoc('notaop')} className={btn+" text-sm"} style={{background:tipoDoc==='notaop'?C.navy:'#e5e7eb',color:tipoDoc==='notaop'?'white':'#374151'}}>Nota operatoria</button>
                    <button onClick={()=>setTipoDoc('endo')} className={btn+" text-sm"} style={{background:tipoDoc==='endo'?C.navy:'#e5e7eb',color:tipoDoc==='endo'?'white':'#374151'}}>Endoscopia</button>
                    <button onClick={()=>setTipoDoc('alta')} className={btn+" text-sm"} style={{background:tipoDoc==='alta'?C.navy:'#e5e7eb',color:tipoDoc==='alta'?'white':'#374151'}}>Resumen de egreso</button>
                  </div>

                  {tipoDoc==='notaop' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                        <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Tiempos</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {[
                            {k:'fechaCirugia',l:'Fecha y hora de cirugía',t:'datetime-local'},
                            {k:'horaIncision',l:'Hora incisión',t:'time'},
                            {k:'horaFinCirugia',l:'Hora fin cirugía',t:'time'},
                            {k:'horaInduccionAnes',l:'Hora inducción anestesia',t:'time'},
                            {k:'horaFinAnes',l:'Hora fin anestesia',t:'time'}
                          ].map(f=>(
                            <div key={f.k}>
                              <label className="text-xs">{f.l}</label>
                              <input type={f.t} value={notaOpActual[f.k]} onChange={e=>setNotaOpActual({...notaOpActual,[f.k]:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                        <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Equipo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            {k:'cirujano',l:'Cirujano 1'},
                            {k:'cirujano2',l:'Cirujano 2'},
                            {k:'cirujano3',l:'Cirujano 3'},
                            {k:'primerAyudante',l:'Primer ayudante'},
                            {k:'anestesiologo',l:'Anestesiólogo'},
                            {k:'instrumentista',l:'Instrumentista'}
                          ].map(f=>(
                            <div key={f.k}>
                              <label className="text-xs">{f.l}</label>
                              <input value={notaOpActual[f.k]} onChange={e=>setNotaOpActual({...notaOpActual,[f.k]:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                        <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Cuerpo de la nota</h3>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs">Procedimiento</label>
                            <input value={notaOpActual.procedimiento} onChange={e=>setNotaOpActual({...notaOpActual,procedimiento:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                          </div>
                          <div>
                            <label className="text-xs">Hallazgos</label>
                            <textarea value={notaOpActual.hallazgos} onChange={e=>setNotaOpActual({...notaOpActual,hallazgos:e.target.value})} rows={3} className="w-full px-2 py-2 rounded border text-sm"/>
                          </div>
                          <div>
                            <label className="text-xs">Técnica</label>
                            <textarea value={notaOpActual.tecnica} onChange={e=>setNotaOpActual({...notaOpActual,tecnica:e.target.value})} rows={5} className="w-full px-2 py-2 rounded border text-sm"/>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs">Bujía</label>
                              <input value={notaOpActual.tamanoBujia} onChange={e=>setNotaOpActual({...notaOpActual,tamanoBujia:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                            </div>
                            <div>
                              <label className="text-xs">Sangrado (mL)</label>
                              <input type="number" value={notaOpActual.sangrado} onChange={e=>setNotaOpActual({...notaOpActual,sangrado:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                            </div>
                            <div>
                              <label className="text-xs">Complicaciones intraop</label>
                              <input value={notaOpActual.complicaciones} onChange={e=>setNotaOpActual({...notaOpActual,complicaciones:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                        <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Analgesia multimodal (checklist)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          {OPCIONES_ANALGESIA.map(o=>(
                            <label key={o.k} className="flex items-center gap-2 text-sm p-1">
                              <input type="checkbox" checked={!!(notaOpActual.analgesia&&notaOpActual.analgesia[o.k])} onChange={e=>setNotaOpActual({...notaOpActual,analgesia:{...notaOpActual.analgesia,[o.k]:e.target.checked}})}/>
                              {o.l}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs">Plan postoperatorio</label>
                        <textarea value={notaOpActual.planPostop} onChange={e=>setNotaOpActual({...notaOpActual,planPostop:e.target.value})} rows={4} className="w-full px-2 py-2 rounded border text-sm"/>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button onClick={guardarNotaOp} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}><Save size={14}/>Guardar nota</button>
                        <button onClick={()=>copiar(notaOpTexto(notaOpActual))} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Copy size={14}/>Copiar texto</button>
                        <button onClick={()=>descargarTxt(notaOpTexto(notaOpActual),`notaop_${seleccionado.nombre||'pac'}.txt`)} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.navy}}><Download size={14}/>Descargar .txt</button>
                      </div>

                      <div className="mt-4 p-3 rounded border" style={{borderColor:C.teal}}>
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <h4 className="font-bold text-sm flex items-center gap-1" style={{color:C.navy}}><ImageIcon size={14}/>Imágenes y video del reporte operatorio</h4>
                          <label className={btn+" text-white text-sm flex items-center gap-1 cursor-pointer"} style={{background:C.teal}}>
                            <Upload size={14}/>Subir imagen / video
                            <input type="file" accept="image/jpeg,image/jpg,image/png,video/*" onChange={subirMedia} className="hidden"/>
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Formatos: JPG, PNG, MP4. Máx 5MB por archivo.</p>
                        {(media[seleccionado.id]||[]).length===0 ? (
                          <p className="text-xs text-gray-500 text-center py-3">Sin archivos adjuntos</p>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(media[seleccionado.id]||[]).map(m=>(
                              <div key={m.id} className="relative border rounded overflow-hidden group">
                                {m.tipo.startsWith('image') ? (
                                  <a href={m.data} target="_blank" rel="noopener noreferrer"><img src={m.data} alt={m.nombre} className="w-full h-32 object-cover"/></a>
                                ) : m.tipo.startsWith('video') ? (
                                  <video src={m.data} controls className="w-full h-32 object-cover bg-black"/>
                                ) : (
                                  <div className="w-full h-32 flex items-center justify-center bg-gray-100"><FileText size={32}/></div>
                                )}
                                <div className="p-1 flex justify-between items-center text-xs">
                                  <span className="truncate flex items-center gap-1">{m.tipo.startsWith('video')?<Film size={10}/>:<ImageIcon size={10}/>}{m.nombre}</span>
                                  <button onClick={()=>eliminarMedia(m.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={12}/></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {tipoDoc==='endo' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                        <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Datos generales</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs">Fecha y hora</label>
                            <input type="datetime-local" value={endoActual.fecha} onChange={e=>setEndoActual({...endoActual,fecha:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                          </div>
                          <div>
                            <label className="text-xs">Duración</label>
                            <input value={endoActual.tiempo} onChange={e=>setEndoActual({...endoActual,tiempo:e.target.value})} placeholder="ej. 25 min" className="w-full px-2 py-1 rounded border text-sm"/>
                          </div>
                          <div>
                            <label className="text-xs">Indicación</label>
                            <select value={endoActual.indicacion} onChange={e=>setEndoActual({...endoActual,indicacion:e.target.value})} className="w-full px-2 py-1 rounded border text-sm">
                              {INDICACIONES_ENDO.map(i=><option key={i}>{i}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs">Endoscopista</label>
                            <input value={endoActual.endoscopista} onChange={e=>setEndoActual({...endoActual,endoscopista:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                          </div>
                          <div>
                            <label className="text-xs">Asistente</label>
                            <input value={endoActual.asistente} onChange={e=>setEndoActual({...endoActual,asistente:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-xs">Sedación</label>
                            <input value={endoActual.sedacion} onChange={e=>setEndoActual({...endoActual,sedacion:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-xs">Equipo</label>
                            <input value={endoActual.equipo} onChange={e=>setEndoActual({...endoActual,equipo:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                        <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Hallazgos por segmento</h3>
                        <div className="space-y-2">
                          {SEGMENTOS_ENDO.map(s=>(
                            <div key={s.k}>
                              <label className="text-xs">{s.l}</label>
                              <textarea value={endoActual[s.k]} onChange={e=>setEndoActual({...endoActual,[s.k]:e.target.value})} rows={2} className="w-full px-2 py-2 rounded border text-sm"/>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                        <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>H. pylori y biopsias</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs">H. pylori</label>
                            <select value={endoActual.hpylori} onChange={e=>setEndoActual({...endoActual,hpylori:e.target.value})} className="w-full px-2 py-1 rounded border text-sm">
                              <option value="no_realizado">No realizado</option>
                              <option value="positivo">Positivo</option>
                              <option value="negativo">Negativo</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs">Biopsias</label>
                            <select value={endoActual.biopsias} onChange={e=>setEndoActual({...endoActual,biopsias:e.target.value})} className="w-full px-2 py-1 rounded border text-sm">
                              <option>No</option><option>Sí</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs">Sitio / número de biopsias</label>
                            <input value={endoActual.sitioBiopsia} onChange={e=>setEndoActual({...endoActual,sitioBiopsia:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                        <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Procedimiento terapéutico</h3>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs">Tipo</label>
                            <input value={endoActual.terapeutico} onChange={e=>setEndoActual({...endoActual,terapeutico:e.target.value})} placeholder="Ninguno / Dilatación / Hemostasia / OTSC / TORe / ESG / Balón colocado/retirado / Stent" className="w-full px-2 py-1 rounded border text-sm"/>
                          </div>
                          <div>
                            <label className="text-xs">Detalle (material, diámetro, técnica)</label>
                            <textarea value={endoActual.detTerapeutico} onChange={e=>setEndoActual({...endoActual,detTerapeutico:e.target.value})} rows={3} className="w-full px-2 py-2 rounded border text-sm"/>
                          </div>
                          <div>
                            <label className="text-xs">Complicaciones</label>
                            <input value={endoActual.complicaciones} onChange={e=>setEndoActual({...endoActual,complicaciones:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs">Conclusión diagnóstica</label>
                        <textarea value={endoActual.conclusion} onChange={e=>setEndoActual({...endoActual,conclusion:e.target.value})} rows={3} className="w-full px-2 py-2 rounded border text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs">Recomendaciones</label>
                        <textarea value={endoActual.recomendaciones} onChange={e=>setEndoActual({...endoActual,recomendaciones:e.target.value})} rows={3} className="w-full px-2 py-2 rounded border text-sm"/>
                      </div>

                      {/* Imágenes y videos del reporte de endoscopia */}
                      <div className="p-3 rounded border" style={{background:'#FAFAFA',borderColor:C.teal}}>
                        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                          <h4 className="font-bold text-sm flex items-center gap-1" style={{color:C.navy}}><ImageIcon size={14}/>Imágenes y video del reporte de endoscopia</h4>
                          <label className="cursor-pointer text-xs px-2 py-1 rounded flex items-center gap-1" style={{background:C.gold,color:'white'}}>
                            <Upload size={14}/>Subir imagen / video
                            <input type="file" multiple accept="image/jpeg,image/jpg,image/png,video/mp4,video/quicktime,video/webm" onChange={subirMediaEndo} className="hidden"/>
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Formatos: JPG/PNG y MP4/MOV/WEBM · hasta 8 MB por archivo · puede agregar etiquetas por segmento (esófago, cardias, píloro, anastomosis, etc.).</p>
                        {(!mediaEndo[seleccionado.id]||mediaEndo[seleccionado.id].length===0) ? (
                          <p className="text-xs text-gray-500 text-center py-3 italic">Sin imágenes ni videos adjuntos</p>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(mediaEndo[seleccionado.id]||[]).map(m=>(
                              <div key={m.id} className="border rounded overflow-hidden bg-white">
                                {m.tipo.startsWith('image') ? (
                                  <img src={m.data} alt={m.nombre} className="w-full h-32 object-cover"/>
                                ) : m.tipo.startsWith('video') ? (
                                  <video src={m.data} controls className="w-full h-32 object-cover bg-black"/>
                                ) : null}
                                <div className="p-1 flex flex-col gap-1">
                                  <div className="text-[10px] text-gray-600 truncate flex items-center gap-1">
                                    {m.tipo.startsWith('video')?<Film size={10}/>:<ImageIcon size={10}/>}{m.nombre}
                                  </div>
                                  <input
                                    type="text"
                                    value={m.etiqueta||''}
                                    onChange={e=>etiquetarMediaEndo(m.id,e.target.value)}
                                    placeholder="Etiqueta (segmento / hallazgo)"
                                    className="text-[11px] px-1 py-0.5 rounded border"
                                  />
                                  <button onClick={()=>eliminarMediaEndo(m.id)} className="text-[10px] text-red-600 hover:bg-red-50 rounded flex items-center gap-1 self-end"><Trash2 size={10}/>Eliminar</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button onClick={guardarEndoscopia} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}><Save size={14}/>Guardar endoscopia</button>
                        <button onClick={()=>copiar(endoscopiaTexto(endoActual))} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Copy size={14}/>Copiar texto</button>
                        <button onClick={()=>descargarTxt(endoscopiaTexto(endoActual),`endoscopia_${seleccionado.nombre||'pac'}.txt`)} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.navy}}><Download size={14}/>Descargar .txt</button>
                      </div>
                    </div>
                  )}

                  {tipoDoc==='alta' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                        <label className="text-xs">Fecha de egreso</label>
                        <input type="datetime-local" value={altaActual.fechaEgreso} onChange={e=>setAltaActual({...altaActual,fechaEgreso:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs">Indicaciones</label>
                        <textarea value={altaActual.indicaciones} onChange={e=>setAltaActual({...altaActual,indicaciones:e.target.value})} rows={7} className="w-full px-2 py-2 rounded border text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs">Signos de alarma</label>
                        <textarea value={altaActual.alarmas} onChange={e=>setAltaActual({...altaActual,alarmas:e.target.value})} rows={5} className="w-full px-2 py-2 rounded border text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs">Citas de seguimiento</label>
                        <textarea value={altaActual.citas} onChange={e=>setAltaActual({...altaActual,citas:e.target.value})} rows={4} className="w-full px-2 py-2 rounded border text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs">Firma médico</label>
                        <input value={altaActual.firmaMedico} onChange={e=>setAltaActual({...altaActual,firmaMedico:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={guardarAlta} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}><Save size={14}/>Guardar egreso</button>
                        <button onClick={()=>copiar(altaTexto(altaActual))} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Copy size={14}/>Copiar texto</button>
                        <button onClick={()=>descargarTxt(altaTexto(altaActual),`egreso_${seleccionado.nombre||'pac'}.txt`)} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.navy}}><Download size={14}/>Descargar .txt</button>
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
