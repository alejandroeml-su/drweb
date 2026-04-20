import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, Users, GraduationCap, Heart, Download, Trash2, Plus, ChevronRight, ChevronLeft,
  AlertCircle, CheckCircle2, AlertTriangle, Calendar, Clock, Upload, Share2, FileDown,
  Edit3, Info, Camera, Phone, Mail, MessageCircle, FileUp, FileSpreadsheet
} from 'lucide-react';
import { useLang } from './src_shared/i18n.jsx';
import {
  leerArchivoDataURL, storageGet, storageSet,
  exportarPDF, descargarPDF, enviarPDFWhatsApp, enviarPDFEmail, shareWhatsApp, shareEmail,
  fmtFechaHora
} from './src_shared/utils.js';
import {
  magkosAminian, mace, splendid, adamsSmBoss, bariatricWeightTrajectory, sleevePass
} from './src_shared/clasificaciones.js';

const C = {
  navy: '#0A1F44', teal: '#1A8B9D', gold: '#C9A961', cream: '#FAF7F2',
  green: '#2D8659', yellow: '#E0A82E', red: '#C0392B'
};

// Balón listado como opción ELECTIVA (IFSO/ASMBS) — no sólo puente.
const PROCEDURES = [
  { id: 'sleeve', name: 'Manga Gástrica (SG)' },
  { id: 'rygb', name: 'Bypass Gástrico en Y de Roux (RYGB)' },
  { id: 'oagb', name: 'Bypass Gástrico de Una Anastomosis (OAGB)' },
  { id: 'sadis', name: 'SADI-S' },
  { id: 'bpdds', name: 'BPD-DS' },
  { id: 'balon', name: 'Balón intragástrico (opción electiva · IFSO/ASMBS)' },
  { id: 'rev_sg_rygb', name: 'Revisión: Manga → RYGB' },
  { id: 'rev_sg_oagb', name: 'Revisión: Manga → OAGB' }
];

const COMORBIDITIES = [
  { id: 'hta', label: 'Hipertensión arterial' },
  { id: 'tep', label: 'Antecedente TEP/TVP' },
  { id: 'dm', label: 'Diabetes mellitus' },
  { id: 'aos', label: 'Apnea obstructiva del sueño' },
  { id: 'erge', label: 'ERGE' },
  { id: 'tabaco', label: 'Tabaquismo activo' },
  { id: 'ivc', label: 'Insuficiencia venosa crónica' },
  { id: 'cardio', label: 'Cardiopatía' },
  { id: 'erc', label: 'Enfermedad renal crónica' },
  { id: 'acoag', label: 'Anticoagulación crónica' },
  { id: 'disli', label: 'Dislipidemia' },
  { id: 'iam', label: 'IAM previo' },
  { id: 'ecv', label: 'Enf. cerebrovascular' }
];

const EMPTY_HISTORIA = {
  motivo: '', padecimientoActual: '',
  antFamiliares: '', antPatologicos: '', antNoPatologicos: '', antGinecoObs: '',
  medicamentos: '', alergias: '', habitos: '',
  revisionSistemas: '', examenFisico: '', planImpresion: '', notas: ''
};

const EMPTY_PATIENT = {
  id: '', expediente: null, nombre: '', apellido: '', edad: '', sexo: 'M',
  foto: null,
  telefono: '', email: '',
  medico: '', medicoId: '', fechaRegistro: '',
  peso: '', talla: '',
  comorbilidades: {},
  otrosAntecedentes: '',
  asa: '2', funcional: 'independiente',
  eossMetabolico: 0, eossMecanico: 0, eossPsico: 0,
  procedimiento: 'sleeve',
  historiaClinica: { ...EMPTY_HISTORIA },
  // Campos para clasificaciones avanzadas
  hba1c: '', ldl: '', hdl: '', tg: '', colT: '', alt: '', ast: '',
  insulina: false, estatina: false, anosDM: '', peptidoC: '',
  handgrip: '', masaMagraPct: ''
};

// Gauge semicircular con zonas de color (0 a max) · needle apunta al valor
function GaugeRiesgo({ titulo, valor, max, umbrales, sub, valorLabel, colorTexto = '#0A1F44' }) {
  // umbrales = [bajoHasta, moderadoHasta] (≥moderadoHasta = alto)
  const clamped = Math.max(0, Math.min(max, Number(valor) || 0));
  const pct = clamped / max;
  // Semi-circle: angles from 180° (left) to 360°/0° (right), i.e. from π to 2π on trig, but SVG y-axis inverted.
  const W = 180, H = 110, CX = W / 2, CY = 95, R = 75;
  const polar = (p) => {
    const ang = Math.PI + p * Math.PI; // π..2π
    return [CX + R * Math.cos(ang), CY + R * Math.sin(ang)];
  };
  const arc = (p0, p1, color) => {
    const [x0, y0] = polar(p0);
    const [x1, y1] = polar(p1);
    const large = (p1 - p0) > 0.5 ? 1 : 0;
    return <path d={`M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`} stroke={color} strokeWidth="14" fill="none" strokeLinecap="butt" />;
  };
  const u0 = umbrales[0] / max;
  const u1 = umbrales[1] / max;
  const [nx, ny] = polar(pct);
  return (
    <div className="flex flex-col items-center p-3 rounded" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
      <div className="text-xs font-bold mb-1" style={{ color: colorTexto }}>{titulo}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 120 }}>
        {/* Fondo */}
        <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} stroke="#e5e7eb" strokeWidth="14" fill="none" />
        {/* Zonas */}
        {arc(0, u0, '#2D8659')}
        {arc(u0, u1, '#E0A82E')}
        {arc(u1, 1, '#C0392B')}
        {/* Aguja */}
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="#0A1F44" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={CX} cy={CY} r="5" fill="#C9A961" stroke="#0A1F44" strokeWidth="1.5" />
        {/* Etiquetas 0 y max */}
        <text x="8" y={CY + 18} fontSize="9" fill="#6b7280">0</text>
        <text x={W - 18} y={CY + 18} fontSize="9" fill="#6b7280">{max}</text>
      </svg>
      <div className="text-2xl font-bold" style={{ color: colorTexto, marginTop: -4 }}>{valorLabel != null ? valorLabel : clamped}</div>
      {sub && <div className="text-[10px] text-gray-600 text-center leading-tight">{sub}</div>}
    </div>
  );
}

// Radar de 4 ejes: OS-MRS / EOSS / Caprini / ASA — normalizados 0-100
function RadarRiesgo({ ejes }) {
  const W = 280, H = 240, CX = W / 2, CY = H / 2, R = 85;
  const N = ejes.length;
  const puntoEje = (i, v) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / N;
    const r = R * (v / 100);
    return [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
  };
  const anillo = (p) => Array.from({ length: N }, (_, i) => puntoEje(i, p * 100));
  const pathOf = (pts) => pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ') + ' Z';
  const valores = ejes.map((e, i) => puntoEje(i, e.pct));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
      {[0.25, 0.5, 0.75, 1].map(p => (
        <path key={p} d={pathOf(anillo(p))} stroke="#e5e7eb" fill="none" strokeWidth="1" />
      ))}
      {ejes.map((e, i) => {
        const [x, y] = puntoEje(i, 100);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" />;
      })}
      <path d={pathOf(valores)} fill="#1A8B9D" fillOpacity="0.25" stroke="#1A8B9D" strokeWidth="2" />
      {valores.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#C9A961" stroke="#0A1F44" strokeWidth="1.5" />)}
      {ejes.map((e, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / N;
        const tx = CX + (R + 22) * Math.cos(ang);
        const ty = CY + (R + 22) * Math.sin(ang) + 4;
        return (
          <g key={'l' + i}>
            <text x={tx} y={ty - 6} fontSize="11" fontWeight="bold" textAnchor="middle" fill="#0A1F44">{e.label}</text>
            <text x={tx} y={ty + 6} fontSize="10" textAnchor="middle" fill="#6b7280">{e.valorLabel}</text>
          </g>
        );
      })}
    </svg>
  );
}

function MedicoRow({ m, editarMedico, eliminarMedico, subirFotoMedicoExistente, inputCls, C }) {
  const fileRef = useRef(null);
  return (
    <div className="p-3 border rounded flex items-center gap-3 flex-wrap">
      <div className="flex flex-col items-center gap-1">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center bg-white flex-shrink-0" style={{ borderColor: C.gold }}>
          {m.foto ? <img src={m.foto} alt="" className="w-full h-full object-cover" /> : <Camera size={20} color="#9ca3af" />}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { subirFotoMedicoExistente(m.id, e.target.files?.[0]); e.target.value = ''; }} />
        <div className="flex gap-1">
          <button type="button" className="p-1 rounded text-white" style={{ background: C.teal }} onClick={() => fileRef.current?.click()} title="Cambiar foto">
            <Upload size={11} />
          </button>
          {m.foto && (
            <button type="button" className="p-1 rounded text-red-600" onClick={() => editarMedico(m.id, 'foto', null)} title="Quitar foto">
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-[260px] grid grid-cols-1 md:grid-cols-2 gap-2">
        <input className={inputCls} value={m.nombre || ''} onChange={e => editarMedico(m.id, 'nombre', e.target.value)} placeholder="Nombre" />
        <input className={inputCls} value={m.especialidad || ''} onChange={e => editarMedico(m.id, 'especialidad', e.target.value)} placeholder="Especialidad" />
        <input className={inputCls} value={m.jvpm || ''} onChange={e => editarMedico(m.id, 'jvpm', e.target.value)} placeholder="JVPM" />
        <input className={inputCls} value={m.nue || ''} onChange={e => editarMedico(m.id, 'nue', e.target.value)} placeholder="NUE" />
        <input className={inputCls} value={m.telefono || ''} onChange={e => editarMedico(m.id, 'telefono', e.target.value)} placeholder="Teléfono" />
        <input className={inputCls} value={m.email || ''} onChange={e => editarMedico(m.id, 'email', e.target.value)} placeholder="Email" />
      </div>
      <button onClick={() => eliminarMedico(m.id)} className="text-red-600 p-2 rounded hover:bg-red-50"><Trash2 size={16} /></button>
    </div>
  );
}

function nextExpediente(lista) {
  const usados = new Set(lista.map(p => p.expediente).filter(n => Number.isInteger(n) && n > 0));
  let n = 1;
  while (usados.has(n)) n++;
  return n;
}

function nowLocalInput() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function imcOf(peso, talla) {
  const p = parseFloat(peso), t = parseFloat(talla) / 100;
  return (p && t) ? p / (t * t) : 0;
}

function osmrs(p) {
  let s = 0;
  if (parseFloat(p.edad) >= 45) s++;
  if (p.sexo === 'M') s++;
  if (imcOf(p.peso, p.talla) >= 50) s++;
  if (p.comorbilidades.hta) s++;
  if (p.comorbilidades.tep) s++;
  let clase = 'A', mortalidad = '0.2%';
  if (s >= 4) { clase = 'C'; mortalidad = '2.4%'; }
  else if (s >= 2) { clase = 'B'; mortalidad = '1.1%'; }
  return { score: s, clase, mortalidad };
}
function eossMax(p) { return Math.max(p.eossMetabolico, p.eossMecanico, p.eossPsico); }
function caprini(p) {
  let s = 5; const e = parseFloat(p.edad) || 0;
  if (e >= 75) s += 3; else if (e >= 61) s += 2; else if (e >= 41) s += 1;
  if (p.comorbilidades.tep) s += 3;
  if (p.comorbilidades.ivc) s += 1;
  if (p.comorbilidades.cardio) s += 1;
  if (p.comorbilidades.aos) s += 1;
  if (imcOf(p.peso, p.talla) >= 40) s += 1;
  return s;
}
function scoreIntegrado(p) {
  const o = osmrs(p); const e = eossMax(p); const c = caprini(p);
  const asa = parseInt(p.asa);
  const norm = (o.score / 5) * 35 + (e / 4) * 30 + (Math.min(c, 15) / 15) * 20 + ((asa - 1) / 3) * 15;
  let nivel = 'bajo', color = C.green;
  if (norm >= 60) { nivel = 'alto'; color = C.red; }
  else if (norm >= 35) { nivel = 'moderado'; color = C.yellow; }
  return { valor: Math.round(norm), nivel, color, osmrs: o, eoss: e, caprini: c };
}
function recomendaciones(p) {
  const r = []; const i = imcOf(p.peso, p.talla);
  if (p.comorbilidades.tabaco) r.push({ tipo: 'critico', texto: 'Cesación tabáquica OBLIGATORIA ≥6 semanas previo a cirugía' });
  if (p.comorbilidades.dm) r.push({ tipo: 'critico', texto: 'Optimizar HbA1c <8% (idealmente <7%) si insulinodependiente' });
  if (i >= 50) r.push({ tipo: 'importante', texto: 'IMC ≥50: considerar terapia puente (GLP-1 o balón intragástrico) o estrategia escalonada' });
  if (p.comorbilidades.aos) r.push({ tipo: 'importante', texto: 'Polisomnografía y CPAP perioperatorio obligatorio' });
  if (p.comorbilidades.tep) r.push({ tipo: 'critico', texto: 'Profilaxis extendida ≥4 semanas + valoración hematología' });
  if (p.comorbilidades.cardio) r.push({ tipo: 'importante', texto: 'Valoración cardiológica preoperatoria + ecocardiograma' });
  if (p.comorbilidades.erge && p.procedimiento === 'sleeve') r.push({ tipo: 'importante', texto: 'ERGE significativo: considerar RYGB sobre manga gástrica' });
  if (p.comorbilidades.acoag) r.push({ tipo: 'critico', texto: 'Plan de puenteo anticoagulante con hematología' });
  if (caprini(p) >= 8) r.push({ tipo: 'importante', texto: 'Caprini alto: profilaxis mecánica + farmacológica extendida' });
  return r;
}

const HORARIOS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

export default function AvanteModulo1() {
  const { t } = useLang();
  const [modo, setModo] = useState('clinico');
  const [paso, setPaso] = useState(0);
  const [paciente, setPaciente] = useState({ ...EMPTY_PATIENT, fechaRegistro: nowLocalInput(), expediente: 1 });
  const [pacientes, setPacientes] = useState([]);
  const [vista, setVista] = useState('formulario');
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [citas, setCitas] = useState([]);
  const [nuevaCita, setNuevaCita] = useState({
    pacienteId: '', pacienteNombre: '', telefono: '', email: '',
    fecha: '', hora: '09:00', tipo: 'consulta', motivo: '', medico: '', estado: 'pendiente'
  });
  const [medicos, setMedicos] = useState([]);
  const [nuevoMedico, setNuevoMedico] = useState({ nombre: '', especialidad: '', telefono: '', email: '', jvpm: '', nue: '', foto: null });
  const [verClasificaciones, setVerClasificaciones] = useState(false);
  const fotoRef = useRef(null);
  const fotoMedicoNuevoRef = useRef(null);
  const importRef = useRef(null);

  // Carga inicial
  useEffect(() => {
    (async () => {
      const pac = await storageGet('avante_pacientes');
      if (Array.isArray(pac)) {
        setPacientes(pac);
        setPaciente(p => ({ ...p, expediente: nextExpediente(pac) }));
      }
      const c = await storageGet('avante_citas');
      if (Array.isArray(c)) setCitas(c);
      const med = await storageGet('avante_medicos');
      if (Array.isArray(med)) setMedicos(med);
      setCargando(false);
    })();
  }, []);

  const guardarPacientes = async (lista) => { await storageSet('avante_pacientes', lista); };
  const guardarCitas = async (lista) => { await storageSet('avante_citas', lista); };
  const guardarMedicos = async (lista) => { await storageSet('avante_medicos', lista); };

  const slotOcupado = (f, h) => citas.some(c => c.fecha === f && c.hora === h && c.estado !== 'cancelada');

  // === Médicos (CRUD editable) ===
  const agregarMedico = async () => {
    if (!nuevoMedico.nombre.trim()) return;
    const m = { id: Date.now().toString(), ...nuevoMedico };
    const lista = [...medicos, m];
    setMedicos(lista);
    await guardarMedicos(lista);
    setNuevoMedico({ nombre: '', especialidad: '', telefono: '', email: '', jvpm: '', nue: '', foto: null });
  };
  const subirFotoMedicoNuevo = async (f) => {
    if (!f) return;
    try {
      const r = await leerArchivoDataURL(f, 3 * 1024 * 1024);
      setNuevoMedico(m => ({ ...m, foto: r.dataUrl }));
    } catch (e) { alert(e.message); }
  };
  const subirFotoMedicoExistente = async (id, f) => {
    if (!f) return;
    try {
      const r = await leerArchivoDataURL(f, 3 * 1024 * 1024);
      await editarMedico(id, 'foto', r.dataUrl);
    } catch (e) { alert(e.message); }
  };
  const eliminarMedico = async (id) => {
    const lista = medicos.filter(m => m.id !== id);
    setMedicos(lista);
    await guardarMedicos(lista);
  };
  const editarMedico = async (id, campo, val) => {
    const lista = medicos.map(m => m.id === id ? { ...m, [campo]: val } : m);
    setMedicos(lista);
    await guardarMedicos(lista);
  };

  // === Paciente ===
  const nuevoPaciente = () => {
    setEditandoId(null);
    setPaciente({ ...EMPTY_PATIENT, fechaRegistro: nowLocalInput(), expediente: nextExpediente(pacientes) });
    setPaso(0);
    setVista('formulario');
  };
  const editarPaciente = (p) => {
    setEditandoId(p.id);
    setPaciente({ ...EMPTY_PATIENT, ...p });
    setPaso(0);
    setVista('formulario');
  };
  const guardarPaciente = async () => {
    let lista;
    if (editandoId) {
      lista = pacientes.map(x => x.id === editandoId ? { ...paciente, id: editandoId } : x);
    } else {
      const fechaISO = paciente.fechaRegistro ? new Date(paciente.fechaRegistro).toISOString() : new Date().toISOString();
      const exp = nextExpediente(pacientes);
      const nuevo = { ...paciente, id: Date.now().toString(), fecha: fechaISO, expediente: exp };
      lista = [...pacientes, nuevo];
    }
    setPacientes(lista);
    await guardarPacientes(lista);
    setPaciente({ ...EMPTY_PATIENT, fechaRegistro: nowLocalInput() });
    setEditandoId(null);
    setPaso(0);
    setVista('lista');
  };
  const eliminarPaciente = async (id) => {
    if (!confirm('¿Eliminar paciente?')) return;
    const lista = pacientes.filter(p => p.id !== id);
    setPacientes(lista);
    await guardarPacientes(lista);
  };

  const subirFoto = async (f) => {
    if (!f) return;
    try {
      const r = await leerArchivoDataURL(f, 3 * 1024 * 1024);
      setPaciente(p => ({ ...p, foto: r.dataUrl }));
    } catch (e) { alert(e.message); }
  };

  // === Import/Export ===
  const medicoDe = (p) => {
    if (!p) return null;
    if (p.medicoId) return medicos.find(m => m.id === p.medicoId) || null;
    if (p.medico) return medicos.find(m => m.nombre === p.medico) || null;
    return null;
  };

  const exportarCSV = () => {
    const headers = ['Expediente','Fecha','Nombre','Apellido','Edad','Sexo','Teléfono','Email','IMC','Procedimiento','Médico','JVPM médico','NUE médico','OS-MRS','Clase','EOSS','Caprini','Riesgo'];
    const rows = pacientes.map(p => {
      const s = scoreIntegrado(p);
      const doc = medicoDe(p);
      return [p.expediente,p.fecha,p.nombre,p.apellido||'',p.edad,p.sexo,p.telefono||'',p.email||'',imcOf(p.peso,p.talla).toFixed(1),p.procedimiento,p.medico,doc?.jvpm||'',doc?.nue||'',s.osmrs.score,s.osmrs.clase,s.eoss,s.caprini,s.valor+' '+s.nivel];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'avante_pacientes.csv'; a.click();
  };

  const exportarJSON = () => {
    const data = { exportedAt: new Date().toISOString(), pacientes, citas, medicos };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'avante_backup.json'; a.click();
  };

  const importarArchivo = async (file) => {
    if (!file) return;
    try {
      const txt = await file.text();
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(txt);
        const pacList = Array.isArray(data) ? data : (data.pacientes || []);
        const lista = [...pacientes];
        pacList.forEach(p => {
          if (!p.id) p.id = Date.now().toString() + Math.random().toString(36).slice(2,6);
          if (!p.expediente) p.expediente = nextExpediente(lista);
          lista.push(p);
        });
        setPacientes(lista);
        await guardarPacientes(lista);
        if (data.citas) { setCitas(data.citas); await guardarCitas(data.citas); }
        if (data.medicos) { setMedicos(data.medicos); await guardarMedicos(data.medicos); }
        alert(`Importados ${pacList.length} pacientes`);
      } else if (file.name.endsWith('.csv')) {
        const lines = txt.trim().split(/\r?\n/);
        const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g,'').trim());
        const lista = [...pacientes];
        let nAdded = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].match(/("([^"]|"")*"|[^,]+)/g) || [];
          const obj = {};
          cols.forEach((c, idx) => { obj[headers[idx]] = c.replace(/^"|"$/g,'').replace(/""/g,'"'); });
          const medNombre = obj['Médico'] || obj['medico'] || '';
          const medMatch = medicos.find(mm => mm.nombre === medNombre);
          const p = {
            ...EMPTY_PATIENT,
            id: Date.now().toString() + Math.random().toString(36).slice(2,6),
            nombre: obj['Nombre'] || obj['nombre'] || '',
            apellido: obj['Apellido'] || obj['apellido'] || '',
            edad: obj['Edad'] || obj['edad'] || '',
            sexo: obj['Sexo'] || 'M',
            telefono: obj['Teléfono'] || obj['telefono'] || '',
            email: obj['Email'] || obj['email'] || '',
            medico: medNombre,
            medicoId: medMatch ? medMatch.id : '',
            procedimiento: obj['Procedimiento'] || 'sleeve',
            fecha: obj['Fecha'] || new Date().toISOString(),
            fechaRegistro: nowLocalInput(),
            expediente: nextExpediente(lista)
          };
          lista.push(p);
          nAdded++;
        }
        setPacientes(lista);
        await guardarPacientes(lista);
        alert(`Importados ${nAdded} pacientes desde CSV`);
      } else {
        alert('Formato no soportado. Use JSON o CSV.');
      }
    } catch (e) {
      alert('Error importando: ' + e.message);
    }
  };

  // === PDF individual del paciente ===
  const pdfPaciente = (p) => {
    const s = scoreIntegrado(p);
    const bwt = bariatricWeightTrajectory(p);
    const doc = medicoDe(p);
    const hc = p.historiaClinica || {};
    const hcLineas = [
      hc.motivo && `Motivo de consulta: ${hc.motivo}`,
      hc.padecimientoActual && `Padecimiento actual: ${hc.padecimientoActual}`,
      hc.antFamiliares && `Ant. heredofamiliares: ${hc.antFamiliares}`,
      hc.antPatologicos && `Ant. personales patológicos: ${hc.antPatologicos}`,
      hc.antNoPatologicos && `Ant. personales no patológicos: ${hc.antNoPatologicos}`,
      hc.antGinecoObs && `Ant. gineco-obstétricos: ${hc.antGinecoObs}`,
      hc.medicamentos && `Medicamentos: ${hc.medicamentos}`,
      hc.alergias && `Alergias: ${hc.alergias}`,
      hc.habitos && `Hábitos: ${hc.habitos}`,
      hc.revisionSistemas && `Revisión por sistemas: ${hc.revisionSistemas}`,
      hc.examenFisico && `Exploración física: ${hc.examenFisico}`,
      hc.planImpresion && `Impresión diagnóstica y plan: ${hc.planImpresion}`,
      hc.notas && `Notas: ${hc.notas}`
    ].filter(Boolean);
    const secciones = [
      {
        titulo: 'Datos del paciente',
        lineas: [
          `Expediente: #${p.expediente}   ·   Fecha: ${fmtFechaHora(p.fecha)}`,
          `Nombre: ${p.nombre} ${p.apellido || ''}`,
          `Edad: ${p.edad}   ·   Sexo: ${p.sexo}`,
          `Teléfono: ${p.telefono || '—'}   ·   Email: ${p.email || '—'}`,
          `Médico responsable: ${p.medico || '—'}${doc?.especialidad ? ' · ' + doc.especialidad : ''}`,
          `JVPM médico: ${doc?.jvpm || '—'}   ·   NUE médico: ${doc?.nue || '—'}`
        ]
      },
      ...(hcLineas.length ? [{ titulo: 'Historia clínica completa', lineas: hcLineas }] : []),
      {
        titulo: 'Antropometría y procedimiento propuesto',
        lineas: [
          `Peso: ${p.peso} kg   ·   Talla: ${p.talla} cm   ·   IMC: ${imcOf(p.peso,p.talla).toFixed(1)}`,
          `Procedimiento: ${PROCEDURES.find(x => x.id === p.procedimiento)?.name || p.procedimiento}`,
          `Trayectoria estimada %TWL: 1a ${bwt.trayectoria.y1}%  ·  3a ${bwt.trayectoria.y3}%  ·  5a ${bwt.trayectoria.y5}%`
        ]
      },
      {
        titulo: 'Estratificación de riesgo',
        lineas: [
          `OS-MRS: ${s.osmrs.score}/5  ·  clase ${s.osmrs.clase}  ·  mortalidad ${s.osmrs.mortalidad}`,
          `EOSS: estadio ${s.eoss}/4 (máximo de metabólico, mecánico y psicosocial)`,
          `Caprini: ${s.caprini}`,
          `ASA: ${p.asa}   ·   Estado funcional: ${p.funcional}`,
          `Riesgo integrado: ${s.valor}/100  ·  ${s.nivel.toUpperCase()}`
        ]
      },
      {
        titulo: 'Comorbilidades',
        lineas: [
          Object.entries(p.comorbilidades || {}).filter(([,v]) => v).map(([k]) => COMORBIDITIES.find(c => c.id === k)?.label).filter(Boolean).join(', ') || 'Ninguna reportada',
          p.otrosAntecedentes ? 'Otros antecedentes: ' + p.otrosAntecedentes : ''
        ].filter(Boolean)
      },
      {
        titulo: 'Recomendaciones clínicas',
        lineas: recomendaciones(p).map(r => `• [${r.tipo.toUpperCase()}] ${r.texto}`)
      }
    ];
    return exportarPDF({
      titulo: 'Avante · Estratificación perioperatoria',
      subtitulo: `Módulo 1 — Exp #${p.expediente} · ${p.nombre} ${p.apellido || ''}`,
      secciones,
      footer: 'Avante Complejo Hospitalario · Creamos e innovamos para cuidar de ti'
    });
  };

  // === Citas con WhatsApp/email ===
  const agregarCita = async () => {
    if (!nuevaCita.fecha || !nuevaCita.hora || !nuevaCita.pacienteNombre) return;
    if (slotOcupado(nuevaCita.fecha, nuevaCita.hora)) { alert('Horario ocupado'); return; }
    const c = { ...nuevaCita, id: Date.now().toString(), creada: new Date().toISOString() };
    const lista = [...citas, c];
    setCitas(lista);
    await guardarCitas(lista);
    setNuevaCita({ pacienteId: '', pacienteNombre: '', telefono: '', email: '', fecha: '', hora: '09:00', tipo: 'consulta', motivo: '', medico: '', estado: 'pendiente' });
  };
  const enviarRecordatorioWA = (c) => {
    const msg = `Hola ${c.pacienteNombre}, le recordamos su cita en Avante Complejo Hospitalario el ${c.fecha} a las ${c.hora} (${c.tipo}). Cualquier duda: +503 2537-6161. — Avante`;
    shareWhatsApp(c.telefono, msg);
  };
  const enviarRecordatorioEmail = (c) => {
    const subj = `Recordatorio de cita — Avante (${c.fecha} ${c.hora})`;
    const body = `Estimado/a ${c.pacienteNombre},\n\nLe recordamos su cita en Avante Complejo Hospitalario:\n\nFecha: ${c.fecha}\nHora: ${c.hora}\nTipo: ${c.tipo}\nMédico: ${c.medico || '—'}\n\nCualquier duda: +503 2537-6161.\n\nAvante · Creamos e innovamos para cuidar de ti.`;
    shareEmail(c.email, subj, body);
  };
  const cambiarEstadoCita = async (id, estado) => { const l = citas.map(c => c.id === id ? { ...c, estado } : c); setCitas(l); await guardarCitas(l); };
  const eliminarCita = async (id) => { const l = citas.filter(c => c.id !== id); setCitas(l); await guardarCitas(l); };

  const imc = imcOf(paciente.peso, paciente.talla);
  const score = scoreIntegrado(paciente);
  const recs = recomendaciones(paciente);

  const expedienteActual = editandoId ? paciente.expediente : (paciente.id ? paciente.expediente : nextExpediente(pacientes));

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;

  const inputCls = "w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200";
  const btn = "px-4 py-2 rounded font-medium transition-colors";

  // Paso actual (JSX inline para evitar reconstruir subcomponentes en cada render)
  const renderPaso = () => {
    if (paso === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 p-3 rounded border-2" style={{ background: C.cream, borderColor: C.gold }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-bold" style={{ color: C.navy }}>Expediente</label>
                <div className="px-3 py-2 rounded font-bold text-xl" style={{ background: C.gold, color: C.navy }}>#{expedienteActual}</div>
                <div className="text-xs text-gray-600 mt-1">{editandoId ? 'Editando' : 'Nuevo · auto'}</div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-bold" style={{ color: C.navy }}>Fecha/hora de registro</label>
                <input type="datetime-local" className={inputCls}
                  value={paciente.fechaRegistro || nowLocalInput()}
                  onChange={e => setPaciente({ ...paciente, fechaRegistro: e.target.value })} />
              </div>
            </div>
          </div>
          <div><label className="text-sm font-medium">Nombre</label><input className={inputCls} value={paciente.nombre} onChange={e => setPaciente({ ...paciente, nombre: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Apellido</label><input className={inputCls} value={paciente.apellido} onChange={e => setPaciente({ ...paciente, apellido: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Edad</label><input type="number" className={inputCls} value={paciente.edad} onChange={e => setPaciente({ ...paciente, edad: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Sexo</label>
            <select className={inputCls} value={paciente.sexo} onChange={e => setPaciente({ ...paciente, sexo: e.target.value })}>
              <option value="M">Masculino</option><option value="F">Femenino</option>
            </select>
          </div>
          <div><label className="text-sm font-medium flex items-center gap-1"><Phone size={12} /> Teléfono</label><input type="tel" className={inputCls} value={paciente.telefono} onChange={e => setPaciente({ ...paciente, telefono: e.target.value })} placeholder="+503 7000-0000" /></div>
          <div><label className="text-sm font-medium flex items-center gap-1"><Mail size={12} /> Email</label><input type="email" className={inputCls} value={paciente.email} onChange={e => setPaciente({ ...paciente, email: e.target.value })} /></div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium flex items-center gap-1"><Camera size={12} /> Fotografía</label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 flex items-center justify-center bg-gray-50" style={{ borderColor: C.gold }}>
                {paciente.foto ? <img src={paciente.foto} alt="" className="w-full h-full object-cover" /> : <Camera size={24} color="#9ca3af" />}
              </div>
              <input ref={fotoRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { subirFoto(e.target.files?.[0]); e.target.value = ''; }} />
              <button type="button" className={btn + " text-white text-sm flex items-center gap-1"} style={{ background: C.teal }}
                onClick={() => fotoRef.current?.click()}>
                <Upload size={14} /> Cargar foto
              </button>
              {paciente.foto && (
                <button type="button" className="text-sm text-red-600 flex items-center gap-1"
                  onClick={() => setPaciente({ ...paciente, foto: null })}>
                  <Trash2 size={14} /> Quitar
                </button>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Médico responsable</label>
            <select className={inputCls} value={paciente.medicoId || ''} onChange={e => {
              const m = medicos.find(x => x.id === e.target.value);
              setPaciente({ ...paciente, medicoId: e.target.value, medico: m ? m.nombre : '' });
            }}>
              <option value="">— Seleccionar —</option>
              {medicos.map(m => <option key={m.id} value={m.id}>{m.nombre}{m.especialidad ? ' · ' + m.especialidad : ''}{m.jvpm ? ' · JVPM ' + m.jvpm : ''}</option>)}
            </select>
            {medicos.length === 0 && <p className="text-xs text-gray-500 mt-1">Añada médicos en la pestaña "Médicos" (JVPM y NUE se registran ahí).</p>}
            {paciente.medicoId && (() => {
              const m = medicos.find(x => x.id === paciente.medicoId);
              if (!m) return null;
              return (
                <div className="mt-2 p-2 rounded flex items-center gap-3" style={{ background: C.cream }}>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-center bg-white flex-shrink-0" style={{ borderColor: C.gold }}>
                    {m.foto ? <img src={m.foto} alt="" className="w-full h-full object-cover" /> : <Users size={16} color="#9ca3af" />}
                  </div>
                  <div className="text-xs" style={{ color: C.navy }}>
                    <div className="font-bold">Dr. {m.nombre}{m.especialidad ? ' · ' + m.especialidad : ''}</div>
                    <div>JVPM: {m.jvpm || '—'} · NUE: {m.nue || '—'}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      );
    }
    if (paso === 1) return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="text-sm font-medium">Peso (kg)</label><input type="number" className={inputCls} value={paciente.peso} onChange={e => setPaciente({ ...paciente, peso: e.target.value })} /></div>
        <div><label className="text-sm font-medium">Talla (cm)</label><input type="number" className={inputCls} value={paciente.talla} onChange={e => setPaciente({ ...paciente, talla: e.target.value })} /></div>
        <div><label className="text-sm font-medium">IMC</label>
          <div className="px-3 py-2 rounded font-bold text-lg" style={{ background: C.cream, color: C.navy }}>{imc.toFixed(1)} kg/m²</div>
        </div>
      </div>
    );
    if (paso === 2) return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COMORBIDITIES.map(c => (
            <label key={c.id} className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={!!paciente.comorbilidades[c.id]}
                onChange={e => setPaciente({ ...paciente, comorbilidades: { ...paciente.comorbilidades, [c.id]: e.target.checked } })} />
              <span className="text-sm">{c.label}</span>
            </label>
          ))}
        </div>
        <div>
          <label className="text-sm font-medium">Otros antecedentes (campo libre)</label>
          <textarea className={inputCls + " min-h-[80px]"} rows={3}
            value={paciente.otrosAntecedentes}
            onChange={e => setPaciente({ ...paciente, otrosAntecedentes: e.target.value })}
            placeholder="Agregue cualquier antecedente no listado arriba: farmacológicos, quirúrgicos, alergias, enf. raras, etc."
          />
        </div>
      </div>
    );
    if (paso === 3) {
      const hc = paciente.historiaClinica || { ...EMPTY_HISTORIA };
      const setHc = (k, v) => setPaciente({ ...paciente, historiaClinica: { ...hc, [k]: v } });
      const esMujer = paciente.sexo === 'F';
      const campos = [
        { k: 'motivo', l: 'Motivo de consulta', ph: 'Motivo principal referido por el paciente' },
        { k: 'padecimientoActual', l: 'Padecimiento actual', ph: 'Cronología, evolución, síntomas asociados, tratamientos previos' },
        { k: 'antFamiliares', l: 'Antecedentes heredofamiliares', ph: 'Obesidad, DM, HTA, cáncer, enfermedades cardiovasculares…' },
        { k: 'antPatologicos', l: 'Antecedentes personales patológicos', ph: 'Enfermedades crónicas, hospitalizaciones, cirugías, transfusiones…' },
        { k: 'antNoPatologicos', l: 'Antecedentes personales no patológicos', ph: 'Actividad física, alimentación, sueño, vivienda, escolaridad, ocupación…' },
        ...(esMujer ? [{ k: 'antGinecoObs', l: 'Antecedentes gineco-obstétricos', ph: 'Menarca, ciclos, G/P/C/A, FUR, método anticonceptivo, menopausia…' }] : []),
        { k: 'medicamentos', l: 'Medicamentos actuales', ph: 'Nombre, dosis, frecuencia, duración, indicación' },
        { k: 'alergias', l: 'Alergias', ph: 'Medicamentos, alimentos, materiales (látex, yodo), reacción…' },
        { k: 'habitos', l: 'Hábitos y adicciones', ph: 'Tabaco (paquetes/año), alcohol, drogas, cafeína, ejercicio…' },
        { k: 'revisionSistemas', l: 'Revisión por aparatos y sistemas', ph: 'Cardiorrespiratorio, GI, GU, neuro, endocrino, musculoesquelético, piel…' },
        { k: 'examenFisico', l: 'Exploración física', ph: 'Signos vitales, hábito exterior, cabeza, cuello, tórax, abdomen, extremidades, neurológico…' },
        { k: 'planImpresion', l: 'Impresión diagnóstica y plan', ph: 'Diagnósticos, estudios solicitados, plan terapéutico, interconsultas' },
        { k: 'notas', l: 'Notas adicionales', ph: 'Cualquier dato clínico relevante no incluido arriba' }
      ];
      return (
        <div className="space-y-4">
          <div className="p-3 rounded border-l-4" style={{ borderColor: C.gold, background: C.cream }}>
            <div className="flex items-start gap-2">
              <Info size={18} style={{ color: C.gold, flexShrink: 0, marginTop: 2 }} />
              <div className="text-sm" style={{ color: C.navy }}>
                <strong>Historia clínica completa</strong>
                <p className="mt-1 text-gray-700">Campos libres editables para registrar la historia clínica completa del paciente. Todos los campos se guardan dentro del expediente y se incluyen en el PDF exportable.</p>
              </div>
            </div>
          </div>
          {campos.map(c => (
            <div key={c.k}>
              <label className="text-sm font-medium" style={{ color: C.navy }}>{c.l}</label>
              <textarea className={inputCls + " min-h-[80px]"} rows={3}
                value={hc[c.k] || ''}
                onChange={e => setHc(c.k, e.target.value)}
                placeholder={c.ph} />
            </div>
          ))}
        </div>
      );
    }
    if (paso === 4) return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="text-sm font-medium">ASA</label>
          <select className={inputCls} value={paciente.asa} onChange={e => setPaciente({ ...paciente, asa: e.target.value })}>
            {[1,2,3,4].map(n => <option key={n} value={n}>ASA {n}</option>)}
          </select>
        </div>
        <div><label className="text-sm font-medium">Estado funcional</label>
          <select className={inputCls} value={paciente.funcional} onChange={e => setPaciente({ ...paciente, funcional: e.target.value })}>
            <option value="independiente">Independiente</option>
            <option value="parcial">Dependencia parcial</option>
            <option value="total">Dependencia total</option>
          </select>
        </div>
      </div>
    );
    if (paso === 5) return (
      <div className="space-y-4">
        <div className="p-3 rounded border-l-4" style={{ borderColor: C.teal, background: C.cream }}>
          <div className="flex items-start gap-2">
            <Info size={18} style={{ color: C.teal, flexShrink: 0, marginTop: 2 }} />
            <div className="text-sm">
              <strong style={{ color: C.navy }}>EOSS — Edmonton Obesity Staging System (Sharma & Kushner 2009)</strong>
              <p className="mt-1">Estratifica la obesidad más allá del IMC en tres dominios. Se usa el <em>máximo</em> de los tres como estadio global.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Metabólico</strong> (0-4): 0 sin enfermedad · 1 factores subclínicos · 2 comorbilidad establecida (DM, HTA, SAOS…) · 3 daño de órgano · 4 incapacitante.</li>
                <li><strong>Mecánico</strong> (0-4): osteoartrosis, ERGE, apnea del sueño y limitación funcional. Progresa por severidad del síntoma y de la limitación.</li>
                <li><strong>Psicosocial</strong> (0-4): trastornos de ansiedad/depresión, trastornos alimentarios, discapacidad social o aislamiento.</li>
              </ul>
            </div>
          </div>
        </div>
        {[{ k: 'eossMetabolico', l: 'Metabólico' }, { k: 'eossMecanico', l: 'Mecánico' }, { k: 'eossPsico', l: 'Psicosocial' }].map(d => (
          <div key={d.k}>
            <label className="text-sm font-medium">{d.l} (0-4)</label>
            <div className="flex gap-2 mt-1">
              {[0,1,2,3,4].map(n => (
                <button key={n} type="button" onClick={() => setPaciente({ ...paciente, [d.k]: n })}
                  className="flex-1 py-2 rounded font-bold"
                  style={{ background: paciente[d.k] === n ? C.teal : '#e5e7eb', color: paciente[d.k] === n ? 'white' : '#6b7280' }}>{n}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
    if (paso === 6) return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Procedimiento propuesto</label>
          <select className={inputCls} value={paciente.procedimiento} onChange={e => setPaciente({ ...paciente, procedimiento: e.target.value })}>
            {PROCEDURES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-1">Balón incluido como opción electiva según IFSO/ASMBS, no sólo como puente.</p>
        </div>
        <details className="border rounded">
          <summary className="cursor-pointer p-3 font-medium text-sm" style={{ color: C.navy }}>Datos opcionales para clasificaciones avanzadas</summary>
          <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs">HbA1c (%)</label><input type="number" step="0.1" className={inputCls} value={paciente.hba1c} onChange={e => setPaciente({ ...paciente, hba1c: e.target.value })} /></div>
            <div><label className="text-xs">Años con DM2</label><input type="number" className={inputCls} value={paciente.anosDM} onChange={e => setPaciente({ ...paciente, anosDM: e.target.value })} /></div>
            <div><label className="text-xs">Péptido C (ng/mL)</label><input type="number" step="0.1" className={inputCls} value={paciente.peptidoC} onChange={e => setPaciente({ ...paciente, peptidoC: e.target.value })} /></div>
            <div><label className="text-xs">LDL (mg/dL)</label><input type="number" className={inputCls} value={paciente.ldl} onChange={e => setPaciente({ ...paciente, ldl: e.target.value })} /></div>
            <div><label className="text-xs">HDL (mg/dL)</label><input type="number" className={inputCls} value={paciente.hdl} onChange={e => setPaciente({ ...paciente, hdl: e.target.value })} /></div>
            <div><label className="text-xs">TG (mg/dL)</label><input type="number" className={inputCls} value={paciente.tg} onChange={e => setPaciente({ ...paciente, tg: e.target.value })} /></div>
            <div><label className="text-xs">Col. total</label><input type="number" className={inputCls} value={paciente.colT} onChange={e => setPaciente({ ...paciente, colT: e.target.value })} /></div>
            <div><label className="text-xs">ALT</label><input type="number" className={inputCls} value={paciente.alt} onChange={e => setPaciente({ ...paciente, alt: e.target.value })} /></div>
            <div><label className="text-xs">AST</label><input type="number" className={inputCls} value={paciente.ast} onChange={e => setPaciente({ ...paciente, ast: e.target.value })} /></div>
            <div><label className="text-xs">Handgrip (kg)</label><input type="number" className={inputCls} value={paciente.handgrip} onChange={e => setPaciente({ ...paciente, handgrip: e.target.value })} /></div>
            <div><label className="text-xs">Masa magra %</label><input type="number" className={inputCls} value={paciente.masaMagraPct} onChange={e => setPaciente({ ...paciente, masaMagraPct: e.target.value })} /></div>
            <div className="col-span-2 md:col-span-3 flex flex-wrap gap-4">
              <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={!!paciente.insulina} onChange={e => setPaciente({ ...paciente, insulina: e.target.checked })} /> Insulina actual</label>
              <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={!!paciente.estatina} onChange={e => setPaciente({ ...paciente, estatina: e.target.checked })} /> Estatina actual</label>
            </div>
          </div>
        </details>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4" style={{ background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div style={{ background: C.navy, color: 'white' }} className="p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', color: C.gold }} className="text-3xl font-bold">Avante Complejo Hospitalario</h1>
              <p style={{ fontFamily: 'Georgia, serif' }} className="text-sm italic mt-1">{t('app.lema')}</p>
              <p className="text-xs mt-2 opacity-80">{t('modulo')} 1 · {t('mod.1.titulo')} · {t('comun.pacientes')} · {t('tab.agenda')}</p>
            </div>
            <div className="flex gap-2">
              {[{ id: 'clinico', icon: Activity, labelKey: 'modo.clinico' }, { id: 'academico', icon: GraduationCap, labelKey: 'modo.academico' }, { id: 'paciente', icon: Heart, labelKey: 'modo.paciente' }].map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => setModo(m.id)} className={btn + " flex items-center gap-2 text-sm"}
                    style={{ background: modo === m.id ? C.teal : 'rgba(255,255,255,0.1)', color: 'white' }}>
                    <Icon size={16} /> {t(m.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs principales */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => { setVista('formulario'); setEditandoId(null); }} className={btn} style={{ background: vista === 'formulario' ? C.navy : '#e5e7eb', color: vista === 'formulario' ? 'white' : '#374151' }}>
              {editandoId ? 'Editando' : 'Nueva evaluación'}
            </button>
            <button onClick={() => setVista('lista')} className={btn} style={{ background: vista === 'lista' ? C.navy : '#e5e7eb', color: vista === 'lista' ? 'white' : '#374151' }}>
              <Users size={16} className="inline mr-1" /> {t('comun.pacientes')} ({pacientes.length})
            </button>
            <button onClick={() => setVista('agenda')} className={btn} style={{ background: vista === 'agenda' ? C.navy : '#e5e7eb', color: vista === 'agenda' ? 'white' : '#374151' }}>
              <Calendar size={16} className="inline mr-1" /> {t('tab.agenda')} ({citas.filter(c => c.estado !== 'cancelada' && c.estado !== 'completada').length})
            </button>
            <button onClick={() => setVista('medicos')} className={btn} style={{ background: vista === 'medicos' ? C.navy : '#e5e7eb', color: vista === 'medicos' ? 'white' : '#374151' }}>
              Médicos ({medicos.length})
            </button>
            <button onClick={() => setVista('datos')} className={btn} style={{ background: vista === 'datos' ? C.navy : '#e5e7eb', color: vista === 'datos' ? 'white' : '#374151' }}>
              {t('comun.importar')} / {t('comun.exportar')}
            </button>
          </div>

          {/* === FORMULARIO === */}
          {vista === 'formulario' && (
            <>
              {editandoId && (
                <div className="mb-3 p-3 rounded" style={{ background: C.gold + '30', color: C.navy }}>
                  <strong>Editando paciente #{paciente.expediente}</strong> · Los cambios se guardan al presionar "Guardar paciente".
                </div>
              )}
              {/* Pasos */}
              <div className="flex justify-between mb-6 flex-wrap gap-2">
                {['Demografía', 'Antropometría', 'Antecedentes', 'Historia clínica', 'Estado funcional', 'EOSS', 'Procedimiento'].map((lbl, i) => (
                  <div key={i} onClick={() => setPaso(i)}
                    className="flex-1 min-w-[110px] cursor-pointer text-center px-2 py-2 rounded text-xs font-medium"
                    style={{ background: paso === i ? C.teal : (i < paso ? C.gold : '#e5e7eb'), color: paso >= i ? 'white' : '#6b7280' }}>
                    {i + 1}. {lbl}
                  </div>
                ))}
              </div>
              <div className="mb-6 p-4 border rounded">{renderPaso()}</div>

              {/* Navegación */}
              <div className="flex justify-between mb-6">
                <button onClick={() => setPaso(Math.max(0, paso - 1))} disabled={paso === 0}
                  className={btn + " flex items-center gap-1"} style={{ background: '#e5e7eb', opacity: paso === 0 ? 0.5 : 1 }}>
                  <ChevronLeft size={16} /> Anterior
                </button>
                {paso < 6 ? (
                  <button onClick={() => setPaso(paso + 1)} className={btn + " flex items-center gap-1 text-white"} style={{ background: C.teal }}>
                    Siguiente <ChevronRight size={16} />
                  </button>
                ) : (
                  <button onClick={guardarPaciente} className={btn + " flex items-center gap-1 text-white"} style={{ background: C.gold }}>
                    <CheckCircle2 size={16} /> {editandoId ? 'Guardar cambios' : 'Guardar paciente'}
                  </button>
                )}
              </div>

              {/* Resultados en vivo */}
              {paciente.peso && paciente.talla && paciente.edad && (
                modo === 'paciente' ? (
                  <div className="text-center p-8 rounded-lg" style={{ background: C.cream }}>
                    <div className="inline-flex flex-col gap-3 mb-4">
                      {['red','yellow','green'].map(c => (
                        <div key={c} className="w-20 h-20 rounded-full mx-auto" style={{
                          background: C[c],
                          opacity: (c === 'red' && score.nivel === 'alto') || (c === 'yellow' && score.nivel === 'moderado') || (c === 'green' && score.nivel === 'bajo') ? 1 : 0.2
                        }} />
                      ))}
                    </div>
                    <h2 style={{ fontFamily: 'Georgia, serif', color: C.navy }} className="text-2xl font-bold mb-3">
                      {score.nivel === 'bajo' ? '¡Buenas noticias!' : score.nivel === 'moderado' ? 'Prepararemos su camino' : 'Su salud es nuestra prioridad'}
                    </h2>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <GaugeRiesgo
                        titulo="OS-MRS"
                        valor={score.osmrs.score}
                        max={5}
                        umbrales={[1, 3]}
                        valorLabel={`${score.osmrs.score}/5`}
                        sub={`Clase ${score.osmrs.clase} · ${score.osmrs.mortalidad}`}
                      />
                      <GaugeRiesgo
                        titulo="EOSS"
                        valor={score.eoss}
                        max={4}
                        umbrales={[1, 2]}
                        valorLabel={`Estadio ${score.eoss}`}
                        sub="Carga de enfermedad (0-4)"
                      />
                      <GaugeRiesgo
                        titulo="Caprini"
                        valor={score.caprini}
                        max={15}
                        umbrales={[4, 7]}
                        valorLabel={String(score.caprini)}
                        sub="Riesgo de TEV (puntos)"
                      />
                      <GaugeRiesgo
                        titulo="Riesgo integrado"
                        valor={score.valor}
                        max={100}
                        umbrales={[35, 60]}
                        valorLabel={`${score.valor}/100`}
                        sub={String(score.nivel).toUpperCase()}
                        colorTexto={score.color}
                      />
                    </div>

                    <div className="p-3 rounded border flex flex-col md:flex-row items-center gap-4" style={{ borderColor: C.teal + '40', background: C.cream }}>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm" style={{ color: C.navy }}>Perfil de riesgo integrado</h3>
                        <p className="text-xs text-gray-600">Visión comparada de las cuatro escalas normalizadas a una escala común (0–100) para identificar rápidamente el dominio dominante.</p>
                        <ul className="text-xs mt-2 space-y-0.5">
                          <li><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: C.teal }} /> Mayor valor = mayor riesgo</li>
                          <li><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: C.gold }} /> Cada vértice es un dominio validado</li>
                        </ul>
                      </div>
                      <div className="w-full md:w-[280px]">
                        <RadarRiesgo ejes={[
                          { label: 'OS-MRS', pct: (score.osmrs.score / 5) * 100, valorLabel: `${score.osmrs.score}/5` },
                          { label: 'EOSS', pct: (score.eoss / 4) * 100, valorLabel: `E${score.eoss}` },
                          { label: 'Caprini', pct: Math.min(100, (score.caprini / 15) * 100), valorLabel: String(score.caprini) },
                          { label: 'ASA', pct: ((parseInt(paciente.asa) || 1) / 4) * 100, valorLabel: `ASA ${paciente.asa}` }
                        ]} />
                      </div>
                    </div>

                    {/* Explicación del riesgo integrado */}
                    <details className="p-3 rounded border-l-4" style={{ borderColor: C.gold, background: C.cream }}>
                      <summary className="cursor-pointer font-bold flex items-center gap-2" style={{ color: C.navy }}>
                        <Info size={16} /> ¿Cómo se calcula el Riesgo Integrado?
                      </summary>
                      <div className="text-sm text-gray-700 mt-2 space-y-2">
                        <p>Combinamos cuatro escalas validadas en un índice único (0–100), con la siguiente ponderación:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li><strong>OS-MRS</strong> (35%): mortalidad a 30 días en bariátrica (DeMaria 2007).</li>
                          <li><strong>EOSS</strong> (30%): carga real de enfermedad más allá del IMC (Sharma 2009).</li>
                          <li><strong>Caprini</strong> (20%): riesgo de tromboembolismo venoso.</li>
                          <li><strong>ASA</strong> (15%): reserva fisiológica global.</li>
                        </ul>
                        <p>Bandas: <strong>&lt;35</strong> bajo · <strong>35–59</strong> moderado · <strong>≥60</strong> alto. Sirve para priorizar optimización preop y decidir procedimiento electivo vs. puente.</p>
                      </div>
                    </details>

                    {/* Clasificaciones avanzadas */}
                    <button onClick={() => setVerClasificaciones(v => !v)}
                      className={btn + " text-sm flex items-center gap-1"} style={{ background: C.cream, color: C.navy }}>
                      {verClasificaciones ? '− ' : '+ '}Clasificaciones avanzadas (MAGKOS · MACE · SPLENDID · ADAMS/SM-BOSS · BWTP · SleevePass)
                    </button>
                    {verClasificaciones && (() => {
                      const mg = magkosAminian(paciente);
                      const mc = mace(paciente);
                      const sp = splendid(paciente);
                      const ad = adamsSmBoss(paciente);
                      const bw = bariatricWeightTrajectory(paciente);
                      const sv = sleevePass(paciente);
                      const card = (titulo, badge, color, contenido) => (
                        <div className="p-3 rounded border" style={{ borderColor: color, background: 'white' }}>
                          <div className="flex justify-between items-center mb-1">
                            <strong style={{ color: C.navy }}>{titulo}</strong>
                            <span className="px-2 py-0.5 rounded text-xs text-white" style={{ background: color }}>{badge}</span>
                          </div>
                          <div className="text-xs text-gray-700">{contenido}</div>
                        </div>
                      );
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {card('MAGKOS / Aminian — Hepática', mg.riesgo, mg.color, `${mg.interpretacion} AST/ALT ratio: ${mg.astAlt}.`)}
                          {card('MACE — Sarcopenia', mc.riesgo, mc.color, mc.interpretacion)}
                          {card('SPLENDID — Dislipidemia', sp.nivel, sp.color, sp.interpretacion)}
                          {card('ADAMS / SM-BOSS — DM2', ad.nivel, ad.color, ad.interpretacion)}
                          {card('BWTP — Trayectoria ponderal', bw.trayectoria.y5 + '% TWL 5a', C.teal, `1a ${bw.trayectoria.y1}% · 3a ${bw.trayectoria.y3}% · 5a ${bw.trayectoria.y5}%. Peso estimado 5a: ${bw.pesoEstY5} kg.`)}
                          {card('SleevePass — SG vs RYGB', sv.recomendacion, sv.color, sv.interpretacion)}
                        </div>
                      );
                    })()}

                    {recs.length > 0 && (
                      <div className="p-4 rounded border-l-4" style={{ background: C.cream, borderColor: C.gold }}>
                        <h3 className="font-bold mb-2" style={{ color: C.navy }}>Recomendaciones clínicas</h3>
                        <ul className="space-y-2">
                          {recs.map((r, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              {r.tipo === 'critico'
                                ? <AlertCircle size={16} style={{ color: C.red, flexShrink: 0, marginTop: 2 }} />
                                : <AlertTriangle size={16} style={{ color: C.yellow, flexShrink: 0, marginTop: 2 }} />}
                              <span>{r.texto}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              )}
            </>
          )}

          {/* === LISTA PACIENTES === */}
          {vista === 'lista' && (
            <div>
              <div className="flex justify-between mb-4 flex-wrap gap-2">
                <button onClick={nuevoPaciente} className={btn + " text-white flex items-center gap-1"} style={{ background: C.gold }}>
                  <Plus size={14} /> Nuevo paciente
                </button>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={exportarCSV} disabled={pacientes.length === 0}
                    className={btn + " text-white text-sm flex items-center gap-1"} style={{ background: C.teal, opacity: pacientes.length === 0 ? 0.5 : 1 }}>
                    <FileSpreadsheet size={14} /> CSV
                  </button>
                  <button onClick={exportarJSON} disabled={pacientes.length === 0}
                    className={btn + " text-white text-sm flex items-center gap-1"} style={{ background: C.navy, opacity: pacientes.length === 0 ? 0.5 : 1 }}>
                    <Download size={14} /> JSON backup
                  </button>
                </div>
              </div>

              {pacientes.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay pacientes guardados</p>
              ) : (
                <div className="space-y-2">
                  {pacientes.map(p => {
                    const s = scoreIntegrado(p);
                    return (
                      <div key={p.id} className="p-3 border rounded flex justify-between items-center flex-wrap gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                          <div className="w-12 h-12 rounded-full overflow-hidden border flex-shrink-0 flex items-center justify-center bg-gray-50" style={{ borderColor: C.gold }}>
                            {p.foto
                              ? <img src={p.foto} alt="" className="w-full h-full object-cover" />
                              : <Users size={18} color="#9ca3af" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold flex items-center gap-2 flex-wrap" style={{ color: C.navy }}>
                              <span className="px-2 py-0.5 rounded text-xs text-white" style={{ background: C.gold }}>Exp #{p.expediente || '—'}</span>
                              {p.nombre} {p.apellido || ''}
                            </div>
                            <div className="text-xs text-gray-600">
                              {p.edad}a · {p.sexo} · IMC {imcOf(p.peso, p.talla).toFixed(1)} · {PROCEDURES.find(x => x.id === p.procedimiento)?.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                              <span className="flex items-center gap-1"><Clock size={11} />{fmtFechaHora(p.fecha)}</span>
                              {p.medico && <span>· Dr. {p.medico}</span>}
                              {(() => { const d = medicoDe(p); return d?.jvpm ? <span>· JVPM {d.jvpm}</span> : null; })()}
                              {(() => { const d = medicoDe(p); return d?.nue ? <span>· NUE {d.nue}</span> : null; })()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded text-white text-sm font-bold" style={{ background: s.color }}>{s.valor} · {s.nivel}</span>
                          <button title="Ver/descargar PDF"
                            onClick={() => descargarPDF(pdfPaciente(p), `Avante_Exp${p.expediente}_${p.nombre}`)}
                            className="p-2 rounded" style={{ background: C.cream }}><FileDown size={14} /></button>
                          {p.telefono && (
                            <button title="Enviar PDF por WhatsApp"
                              onClick={() => enviarPDFWhatsApp(pdfPaciente(p), `Avante_Exp${p.expediente}_${p.nombre}`, p.telefono,
                                `Hola ${p.nombre}, le comparto su informe perioperatorio Avante.`)}
                              className="p-2 rounded text-white" style={{ background: '#25D366' }}><MessageCircle size={14} /></button>
                          )}
                          {p.email && (
                            <button title="Enviar PDF por email"
                              onClick={() => enviarPDFEmail(pdfPaciente(p), `Avante_Exp${p.expediente}_${p.nombre}`, p.email,
                                `Informe perioperatorio — Exp #${p.expediente}`,
                                `Estimado/a ${p.nombre},\n\nLe comparto su informe de estratificación perioperatoria Avante.\n\nAtentamente,\nEquipo Avante`)}
                              className="p-2 rounded" style={{ background: '#1a73e8', color: 'white' }}><Mail size={14} /></button>
                          )}
                          <button title="Editar" onClick={() => editarPaciente(p)} className="p-2 rounded" style={{ background: C.teal, color: 'white' }}>
                            <Edit3 size={14} />
                          </button>
                          <button title="Eliminar" onClick={() => eliminarPaciente(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* === AGENDA === */}
          {vista === 'agenda' && (
            <div className="space-y-4">
              <div className="p-4 rounded border" style={{ borderColor: C.teal, background: C.cream }}>
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: C.navy }}><Plus size={16} />Nueva cita</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium">Paciente</label>
                    <select className={inputCls} value={nuevaCita.pacienteId}
                      onChange={e => {
                        const p = pacientes.find(x => x.id === e.target.value);
                        setNuevaCita({
                          ...nuevaCita,
                          pacienteId: e.target.value,
                          pacienteNombre: p ? `${p.nombre} ${p.apellido || ''}`.trim() : nuevaCita.pacienteNombre,
                          telefono: p?.telefono || nuevaCita.telefono,
                          email: p?.email || nuevaCita.email,
                          medico: p?.medico || nuevaCita.medico
                        });
                      }}>
                      <option value="">— Paciente nuevo/externo —</option>
                      {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido || ''}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs font-medium">Nombre (si externo)</label><input className={inputCls} value={nuevaCita.pacienteNombre} onChange={e => setNuevaCita({ ...nuevaCita, pacienteNombre: e.target.value })} /></div>
                  <div><label className="text-xs font-medium flex items-center gap-1"><Phone size={11} />Teléfono</label><input type="tel" className={inputCls} value={nuevaCita.telefono} onChange={e => setNuevaCita({ ...nuevaCita, telefono: e.target.value })} placeholder="+503…" /></div>
                  <div><label className="text-xs font-medium flex items-center gap-1"><Mail size={11} />Email</label><input type="email" className={inputCls} value={nuevaCita.email} onChange={e => setNuevaCita({ ...nuevaCita, email: e.target.value })} /></div>
                  <div><label className="text-xs font-medium">Fecha</label><input type="date" className={inputCls} value={nuevaCita.fecha} onChange={e => setNuevaCita({ ...nuevaCita, fecha: e.target.value })} /></div>
                  <div><label className="text-xs font-medium">Hora</label>
                    <select className={inputCls} value={nuevaCita.hora} onChange={e => setNuevaCita({ ...nuevaCita, hora: e.target.value })}>
                      {HORARIOS.map(h => {
                        const ocupado = nuevaCita.fecha && slotOcupado(nuevaCita.fecha, h);
                        return <option key={h} value={h} disabled={ocupado}>{h}{ocupado ? ' (ocupado)' : ''}</option>;
                      })}
                    </select>
                  </div>
                  <div><label className="text-xs font-medium">Tipo</label>
                    <select className={inputCls} value={nuevaCita.tipo} onChange={e => setNuevaCita({ ...nuevaCita, tipo: e.target.value })}>
                      <option value="consulta">Consulta inicial</option>
                      <option value="preop">Preoperatoria</option>
                      <option value="postop">Postoperatoria/control</option>
                      <option value="nutricion">Nutrición</option>
                      <option value="psicologia">Psicología</option>
                      <option value="laboratorio">Laboratorios</option>
                      <option value="telemedicina">Telemedicina</option>
                    </select>
                  </div>
                  <div><label className="text-xs font-medium">Médico</label>
                    <select className={inputCls} value={nuevaCita.medico} onChange={e => setNuevaCita({ ...nuevaCita, medico: e.target.value })}>
                      <option value="">—</option>
                      {medicos.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2"><label className="text-xs font-medium">Motivo/notas</label><input className={inputCls} value={nuevaCita.motivo} onChange={e => setNuevaCita({ ...nuevaCita, motivo: e.target.value })} /></div>
                </div>
                <button onClick={agregarCita} className={btn + " mt-3 text-white"} style={{ background: C.teal }}><Plus size={14} className="inline mr-1" />Agendar</button>
              </div>

              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: C.navy }}><Calendar size={16} />Citas programadas</h3>
                {citas.length === 0 ? (
                  <p className="text-center text-gray-500 py-6">No hay citas registradas</p>
                ) : (
                  <div className="space-y-2">
                    {[...citas].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora)).map(c => {
                      const colorEstado = c.estado === 'confirmada' ? C.green : c.estado === 'completada' ? C.teal : c.estado === 'cancelada' ? C.red : C.yellow;
                      return (
                        <div key={c.id} className="p-3 border rounded flex justify-between items-center flex-wrap gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm" style={{ color: C.navy }}>{c.pacienteNombre}</div>
                            <div className="text-xs text-gray-600">{c.fecha} · {c.hora} · {c.tipo}{c.medico ? ' · Dr. ' + c.medico : ''}</div>
                            {(c.telefono || c.email) && (
                              <div className="text-xs text-gray-500">{c.telefono || ''} {c.email ? '· ' + c.email : ''}</div>
                            )}
                            {c.motivo && <div className="text-xs text-gray-500 italic">{c.motivo}</div>}
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {c.telefono && <button title="Recordatorio WhatsApp al paciente" onClick={() => enviarRecordatorioWA(c)} className="p-1.5 rounded text-white" style={{ background: '#25D366' }}><MessageCircle size={12} /></button>}
                            {c.email && <button title="Recordatorio email al paciente" onClick={() => enviarRecordatorioEmail(c)} className="p-1.5 rounded text-white" style={{ background: '#1a73e8' }}><Mail size={12} /></button>}
                            {c.medico && (() => {
                              const docM = medicos.find(m => m.nombre === c.medico);
                              return docM?.telefono ? (
                                <button title="Recordatorio WhatsApp al médico" onClick={() => shareWhatsApp(docM.telefono, `Dr. ${c.medico}: recordatorio de cita ${c.pacienteNombre} el ${c.fecha} ${c.hora} (${c.tipo}).`)}
                                  className="p-1.5 rounded text-xs text-white" style={{ background: '#128C7E' }}>Dr.</button>
                              ) : null;
                            })()}
                            <select value={c.estado} onChange={e => cambiarEstadoCita(c.id, e.target.value)} className="text-xs px-2 py-1 rounded border" style={{ color: colorEstado, borderColor: colorEstado }}>
                              <option value="pendiente">Pendiente</option>
                              <option value="confirmada">Confirmada</option>
                              <option value="completada">Completada</option>
                              <option value="cancelada">Cancelada</option>
                            </select>
                            <button onClick={() => eliminarCita(c.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === MÉDICOS === */}
          {vista === 'medicos' && (
            <div className="space-y-4">
              <div className="p-4 rounded border" style={{ borderColor: C.teal, background: C.cream }}>
                <h3 className="font-bold mb-3" style={{ color: C.navy }}>Agregar médico</h3>
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 flex items-center justify-center bg-white" style={{ borderColor: C.gold }}>
                      {nuevoMedico.foto ? <img src={nuevoMedico.foto} alt="" className="w-full h-full object-cover" /> : <Camera size={28} color="#9ca3af" />}
                    </div>
                    <input ref={fotoMedicoNuevoRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { subirFotoMedicoNuevo(e.target.files?.[0]); e.target.value = ''; }} />
                    <div className="flex gap-1">
                      <button type="button" className="px-2 py-1 rounded text-xs text-white flex items-center gap-1" style={{ background: C.teal }}
                        onClick={() => fotoMedicoNuevoRef.current?.click()}>
                        <Upload size={12} /> Foto
                      </button>
                      {nuevoMedico.foto && (
                        <button type="button" className="px-2 py-1 rounded text-xs text-red-600" onClick={() => setNuevoMedico({ ...nuevoMedico, foto: null })}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[260px] grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className={inputCls} placeholder="Nombre" value={nuevoMedico.nombre} onChange={e => setNuevoMedico({ ...nuevoMedico, nombre: e.target.value })} />
                    <input className={inputCls} placeholder="Especialidad" value={nuevoMedico.especialidad} onChange={e => setNuevoMedico({ ...nuevoMedico, especialidad: e.target.value })} />
                    <input className={inputCls} placeholder="JVPM (Junta de Vigilancia)" value={nuevoMedico.jvpm} onChange={e => setNuevoMedico({ ...nuevoMedico, jvpm: e.target.value })} />
                    <input className={inputCls} placeholder="NUE (Número Único de Expediente)" value={nuevoMedico.nue} onChange={e => setNuevoMedico({ ...nuevoMedico, nue: e.target.value })} />
                    <input className={inputCls} placeholder="Teléfono" type="tel" value={nuevoMedico.telefono} onChange={e => setNuevoMedico({ ...nuevoMedico, telefono: e.target.value })} />
                    <input className={inputCls} placeholder="Email" type="email" value={nuevoMedico.email} onChange={e => setNuevoMedico({ ...nuevoMedico, email: e.target.value })} />
                  </div>
                </div>
                <button onClick={agregarMedico} className={btn + " mt-3 text-white"} style={{ background: C.teal }}>
                  <Plus size={14} className="inline mr-1" /> Agregar
                </button>
              </div>
              {medicos.length === 0 ? (
                <p className="text-center text-gray-500 py-6">No hay médicos registrados</p>
              ) : (
                <div className="space-y-2">
                  {medicos.map(m => (
                    <MedicoRow key={m.id} m={m} editarMedico={editarMedico} eliminarMedico={eliminarMedico} subirFotoMedicoExistente={subirFotoMedicoExistente} inputCls={inputCls} C={C} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === IMPORT/EXPORT === */}
          {vista === 'datos' && (
            <div className="space-y-4">
              <div className="p-4 rounded border" style={{ borderColor: C.teal, background: C.cream }}>
                <h3 className="font-bold mb-2" style={{ color: C.navy }}>Importar base externa</h3>
                <p className="text-sm text-gray-600 mb-3">Suba un archivo <strong>JSON</strong> (backup Avante) o <strong>CSV</strong> (con columnas Nombre, Apellido, Edad, Sexo, Teléfono, Email, Médico, Procedimiento, Fecha). El JVPM/NUE se toma del médico asignado.</p>
                <input ref={importRef} type="file" accept=".json,.csv" style={{ display: 'none' }}
                  onChange={e => { importarArchivo(e.target.files?.[0]); e.target.value = ''; }} />
                <button onClick={() => importRef.current?.click()} className={btn + " text-white flex items-center gap-1"} style={{ background: C.navy }}>
                  <FileUp size={14} /> Seleccionar archivo…
                </button>
              </div>
              <div className="p-4 rounded border" style={{ borderColor: C.gold, background: C.cream }}>
                <h3 className="font-bold mb-2" style={{ color: C.navy }}>Exportar base actual</h3>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={exportarCSV} className={btn + " text-white flex items-center gap-1"} style={{ background: C.teal }}>
                    <FileSpreadsheet size={14} /> Exportar CSV
                  </button>
                  <button onClick={exportarJSON} className={btn + " text-white flex items-center gap-1"} style={{ background: C.navy }}>
                    <Download size={14} /> Backup JSON completo
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">El backup JSON incluye pacientes, citas y médicos. El CSV sólo pacientes (sin fotos).</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
