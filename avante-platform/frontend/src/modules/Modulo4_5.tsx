import React, { useState } from 'react';
import {
  Pill, RefreshCw, Brain, Scissors, UserCheck, BarChart3, FileText,
  CheckCircle2, AlertTriangle, AlertCircle, Download, Plus, Save, Trash2, ChevronRight
} from 'lucide-react';
import { useLang } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import {
  C, PROCS, Patient, calcIMC,
  storageGet, storageSet, fmtFechaHora, nowLocalInput,
  exportarPDF, descargarPDF
} from '../lib/data';

type MainTab = 'noqx' | 'plastica';

export default function Modulo4_5({ initialTab = 'noqx' }: { initialTab?: string }) {
  const { t } = useLang();
  const { patients: pacientes } = useAuth();
  const [mainTab, setMainTab] = useState<MainTab>(initialTab as MainTab);
  const [selId, setSelId] = useState<string>('');

  const selPac = pacientes.find(p => p.id === selId) || null;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setMainTab('noqx')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${mainTab === 'noqx' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          style={mainTab === 'noqx' ? { color: C.navy } : {}}
        >
          {t('mod.4.titulo')}
        </button>
        <button
          onClick={() => setMainTab('plastica')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${mainTab === 'plastica' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          style={mainTab === 'plastica' ? { color: C.navy } : {}}
        >
          {t('mod.5.titulo')}
        </button>
      </div>

      <select
        value={selId}
        onChange={e => setSelId(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
        style={{ '--tw-ring-color': C.teal } as React.CSSProperties}
      >
        <option value="">{t('lbl.seleccione')}</option>
        {pacientes.map(p => (
          <option key={p.id} value={p.id}>{p.nombre} {p.apellido} — IMC {calcIMC(p.peso, p.talla).toFixed(1)}</option>
        ))}
      </select>

      {!selPac ? (
        <div className="text-center py-16 text-gray-400">
          <AlertCircle size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('lbl.seleccione')}</p>
        </div>
      ) : mainTab === 'noqx' ? (
        <NoQuirurgicoView paciente={selPac} />
      ) : (
        <PlasticaCalidadView paciente={selPac} />
      )}
    </div>
  );
}

function NoQuirurgicoView({ paciente }: { paciente: Patient }) {
  const { t } = useLang();
  const [subTab, setSubTab] = useState<'noqx' | 'revision' | 'conductual'>('noqx');
  const i = calcIMC(paciente.peso, paciente.talla);

  const terapias = getTerapiasNoQx(i, paciente.comorbilidades);
  const revisiones = getRevisionOptions();

  const subTabs = [
    { id: 'noqx' as const, label: t('tab.noQx') },
    { id: 'revision' as const, label: t('tab.revision') },
    { id: 'conductual' as const, label: t('tab.conductual') },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto">
        {subTabs.map(st => (
          <button
            key={st.id}
            onClick={() => setSubTab(st.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              subTab === st.id ? 'text-white' : 'text-gray-500 bg-gray-100'
            }`}
            style={subTab === st.id ? { background: C.teal } : {}}
          >
            {st.label}
          </button>
        ))}
      </div>

      {subTab === 'noqx' && (
        <div className="space-y-2">
          <div className="p-3 rounded-xl text-center text-sm font-medium" style={{ background: `${C.teal}10`, color: C.teal }}>
            IMC actual: {i.toFixed(1)} kg/m²
          </div>
          {terapias.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Sin opciones no quirúrgicas aplicables para este IMC</div>
          ) : (
            terapias.map((ter, idx) => (
              <div key={idx} className="rounded-xl border border-gray-100 overflow-hidden bg-white">
                <div className="px-4 py-3" style={{ background: `${C.teal}08` }}>
                  <div className="flex items-center gap-2">
                    <Pill size={16} style={{ color: C.teal }} />
                    <span className="font-bold text-sm" style={{ color: C.navy }}>{ter.t}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{ter.ind}</p>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs text-gray-600 leading-relaxed">{ter.det}</p>
                  <div className="text-[10px] px-2 py-1 rounded-lg bg-gray-50 text-gray-500">
                    Evidencia: {ter.evid}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'revision' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Tipos de Cirugía de Revisión</h4>
            <div className="space-y-2">
              {revisiones.map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <RefreshCw size={14} className="flex-shrink-0 mt-0.5" style={{ color: C.teal }} />
                  <span className="text-xs text-gray-700">{r}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Indicaciones de Revisión</h4>
            <div className="space-y-1 text-xs text-gray-600">
              {[
                'Recuperación de peso significativa (mayor al 50% del peso perdido)',
                'Recurrencia de comorbilidades (DM2, HTA, AOS)',
                'Complicaciones crónicas (ERGE intratable, estenosis)',
                'Fístula gastro-gástrica (post-RYGB)',
                'Desnutrición severa no manejable (post-BPD)',
              ].map((ind, i) => (
                <div key={i} className="flex items-start gap-2 p-1.5">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: C.yellow }} />
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'conductual' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Terapia Conductual</h4>
            <div className="space-y-2">
              {[
                { area: 'Alimentación consciente (Mindful eating)', desc: 'Técnicas de atención plena aplicadas a la alimentación. Comer sin distracciones, reconocer señales de saciedad.' },
                { area: 'Manejo del estrés', desc: 'Técnicas de relajación, respiración diafragmática, meditación guiada. Evitar comer emocional.' },
                { area: 'Actividad física progresiva', desc: 'Inicio con caminata 30 min/día. Progresión a ejercicio aeróbico + resistencia 150 min/semana.' },
                { area: 'Grupo de apoyo', desc: 'Sesiones grupales mensuales con otros pacientes bariátricos. Compartir experiencias y estrategias.' },
                { area: 'Prevención de recaídas', desc: 'Identificar triggers, plan de acción ante situaciones de riesgo, seguimiento psicológico regular.' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain size={14} style={{ color: C.teal }} />
                    <span className="text-xs font-bold" style={{ color: C.navy }}>{item.area}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 ml-6">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlasticaCalidadView({ paciente }: { paciente: Patient }) {
  const { t } = useLang();
  const [subTab, setSubTab] = useState<'plastica' | 'poblaciones' | 'calidad' | 'doc'>('plastica');
  const i = calcIMC(paciente.peso, paciente.talla);
  const elegible = i < 32;

  const subTabs = [
    { id: 'plastica' as const, label: t('tab.plastica') },
    { id: 'poblaciones' as const, label: t('tab.poblaciones') },
    { id: 'calidad' as const, label: t('tab.calidad') },
    { id: 'doc' as const, label: t('tab.documentacion') },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto">
        {subTabs.map(st => (
          <button
            key={st.id}
            onClick={() => setSubTab(st.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              subTab === st.id ? 'text-white' : 'text-gray-500 bg-gray-100'
            }`}
            style={subTab === st.id ? { background: C.teal } : {}}
          >
            {st.label}
          </button>
        ))}
      </div>

      {subTab === 'plastica' && (
        <div className="space-y-3">
          <div className={`p-4 rounded-xl border ${elegible ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {elegible ? <CheckCircle2 size={18} style={{ color: C.green }} /> : <AlertTriangle size={18} style={{ color: C.yellow }} />}
              <span className="font-bold text-sm" style={{ color: elegible ? C.green : C.yellow }}>
                {elegible ? 'Elegible para cirugía plástica' : 'IMC aún elevado para plástica'}
              </span>
            </div>
            <p className="text-xs text-gray-600">IMC actual: {i.toFixed(1)} — Óptimo: menor a 30-32</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Criterios de Elegibilidad</h4>
            <div className="space-y-1">
              {[
                { criterio: 'Peso estable', det: 'Variación menor al 5% en 6 meses' },
                { criterio: 'Tiempo post-bariátrica', det: 'Mayor o igual a 18 meses' },
                { criterio: 'Estado nutricional', det: 'Albúmina mayor a 3.5, Hb mayor a 12' },
                { criterio: 'No tabaquismo', det: 'Cesación mayor o igual a 6 semanas' },
                { criterio: 'Salud psicológica', det: 'Expectativas realistas' },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                  <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: C.teal }} />
                  <div>
                    <span className="text-xs font-medium" style={{ color: C.navy }}>{c.criterio}</span>
                    <span className="text-[10px] text-gray-500 ml-1">— {c.det}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Secuencia de Procedimientos</h4>
            <div className="space-y-3">
              {[
                { orden: 1, proc: 'Abdominoplastia / Bodylift inferior', tiempo: '18-24m post-bariátrica' },
                { orden: 2, proc: 'Mamoplastia / Mastopexia / Ginecomastia', tiempo: '+3-6m' },
                { orden: 3, proc: 'Braquioplastia + Cruroplastia', tiempo: '+3-6m' },
                { orden: 4, proc: 'Lifting facial / cervical', tiempo: 'Opcional' },
              ].map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: C.teal }}>
                    {s.orden}
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: C.navy }}>{s.proc}</div>
                    <div className="text-[10px] text-gray-500">{s.tiempo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'poblaciones' && (
        <div className="space-y-3">
          {[
            {
              grupo: 'Adolescentes',
              icon: '👦',
              consid: ['IMC mayor o igual a 35 + comorbilidad o mayor o igual a 40', 'Madurez esquelética (Tanner mayor o igual a 4)', 'Consentimiento familiar', 'Manga gástrica preferida (Teen-LABS)', 'Soporte multidisciplinario obligatorio'],
            },
            {
              grupo: 'Adultos mayores (mayor o igual a 65 años)',
              icon: '👴',
              consid: ['Valoración cardiopulmonar exhaustiva', 'Evaluación de fragilidad', 'Manga gástrica preferida (menor riesgo)', 'Objetivo: mejoría funcional, no solo peso', 'Vigilancia nutricional intensificada'],
            },
            {
              grupo: 'Embarazo post-bariátrica',
              icon: '🤰',
              consid: ['Esperar 12-18 meses post-cirugía', 'Anticoncepción efectiva durante ese periodo', 'Suplementación intensificada', 'Seguimiento conjunto obstetricia-bariátrica', 'Monitoreo nutricional trimestral'],
            },
          ].map((pob, i) => (
            <div key={i} className="rounded-xl border border-gray-100 overflow-hidden bg-white">
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: `${C.navy}08` }}>
                <span className="text-xl">{pob.icon}</span>
                <h4 className="font-bold text-sm" style={{ color: C.navy }}>{pob.grupo}</h4>
              </div>
              <div className="p-4 space-y-1">
                {pob.consid.map((c, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-gray-600">
                    <ChevronRight size={12} className="flex-shrink-0 mt-0.5" style={{ color: C.teal }} />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'calidad' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Indicadores de Calidad</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Mortalidad 30 días', valor: 'menor a 0.3%', ref: 'MBSAQIP' },
                { label: 'Fuga anastomótica', valor: 'menor a 1%', ref: 'IFSO' },
                { label: 'Reoperación 30 días', valor: 'menor a 3%', ref: 'MBSAQIP' },
                { label: 'TEP/TVP', valor: 'menor a 0.5%', ref: 'Caprini' },
                { label: 'Readmisión 30 días', valor: 'menor a 5%', ref: 'MBSAQIP' },
                { label: '%EWL a 12 meses', valor: 'mayor a 50%', ref: 'ASMBS' },
              ].map((ind, i) => (
                <div key={i} className="p-3 rounded-lg bg-gray-50 text-center">
                  <div className="text-sm font-bold" style={{ color: C.navy }}>{ind.valor}</div>
                  <div className="text-[10px] text-gray-600">{ind.label}</div>
                  <div className="text-[9px] text-gray-400">{ind.ref}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'doc' && (
        <div className="space-y-3">
          <NotaOperatoria paciente={paciente} />
        </div>
      )}
    </div>
  );
}

function NotaOperatoria({ paciente }: { paciente: Patient }) {
  const [nota, setNota] = useState({
    fecha: nowLocalInput(),
    cirujano: '',
    procedimiento: PROCS[paciente.procedimiento] || '',
    hallazgos: '',
    tecnica: '',
    complicaciones: 'Ninguna',
    sangrado: '',
    duracion: '',
    notas: '',
  });

  const exportPDF = async () => {
    const doc = await exportarPDF({
      titulo: `Nota Operatoria — ${paciente.nombre} ${paciente.apellido}`,
      subtitulo: 'Avante Complejo Hospitalario',
      secciones: [
        { titulo: 'Datos', lineas: [`Fecha: ${nota.fecha}`, `Cirujano: ${nota.cirujano}`, `Procedimiento: ${nota.procedimiento}`] },
        { titulo: 'Hallazgos', lineas: [nota.hallazgos] },
        { titulo: 'Técnica', lineas: [nota.tecnica] },
        { titulo: 'Complicaciones', lineas: [nota.complicaciones] },
        { titulo: 'Detalles', lineas: [`Sangrado: ${nota.sangrado} mL`, `Duración: ${nota.duracion} min`, nota.notas] },
      ],
    });
    descargarPDF(doc, `avante_nota_op_${paciente.apellido}`);
  };

  return (
    <div className="p-4 rounded-xl bg-white border border-gray-100 space-y-3">
      <h4 className="font-bold text-sm" style={{ color: C.navy }}>Nota Operatoria</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-medium text-gray-500 mb-0.5 block">Fecha</label>
          <input type="datetime-local" value={nota.fecha} onChange={e => setNota({ ...nota, fecha: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-gray-500 mb-0.5 block">Cirujano</label>
          <input value={nota.cirujano} onChange={e => setNota({ ...nota, cirujano: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs" />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-medium text-gray-500 mb-0.5 block">Procedimiento</label>
        <input value={nota.procedimiento} onChange={e => setNota({ ...nota, procedimiento: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs" />
      </div>
      <div>
        <label className="text-[10px] font-medium text-gray-500 mb-0.5 block">Hallazgos</label>
        <textarea value={nota.hallazgos} onChange={e => setNota({ ...nota, hallazgos: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs resize-none" />
      </div>
      <div>
        <label className="text-[10px] font-medium text-gray-500 mb-0.5 block">Técnica quirúrgica</label>
        <textarea value={nota.tecnica} onChange={e => setNota({ ...nota, tecnica: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-medium text-gray-500 mb-0.5 block">Sangrado (mL)</label>
          <input type="number" value={nota.sangrado} onChange={e => setNota({ ...nota, sangrado: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-gray-500 mb-0.5 block">Duración (min)</label>
          <input type="number" value={nota.duracion} onChange={e => setNota({ ...nota, duracion: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs" />
        </div>
      </div>
      <button onClick={exportPDF} className="w-full py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2" style={{ background: C.navy }}>
        <Download size={14} /> Exportar Nota Operatoria PDF
      </button>
    </div>
  );
}

// Helper functions
function getTerapiasNoQx(imc: number, comorbilidades: Record<string, boolean>) {
  const op: Array<{ t: string; ind: string; det: string; evid: string }> = [];
  if (imc >= 27 && imc < 35) {
    op.push({ t: 'GLP-1 / GIP-GLP-1', ind: 'IMC 27-34.9 con comorbilidad o mayor o igual a 30 sin comorbilidad', det: 'Semaglutida 2.4mg SC semanal o tirzepatida 5-15mg SC semanal. Pérdida esperada: 15-22% peso corporal a 68 sem.', evid: 'STEP-1, SURMOUNT-1' });
    op.push({ t: 'Balón intragástrico (electivo IFSO/ASMBS)', ind: 'IMC 27-40, alternativa sin cirugía', det: 'Orbera (6m) u Obalon. Pérdida esperada: 10-15% peso corporal. Reversible.', evid: 'ASGE / IFSO 2024' });
  } else if (imc >= 30 && imc < 40) {
    op.push({ t: 'GLP-1 / GIP-GLP-1', ind: 'Primera línea farmacológica', det: 'Semaglutida 2.4mg o tirzepatida. Considerar como puente o alternativa a cirugía.', evid: 'STEP, SURMOUNT' });
    op.push({ t: 'ESG (Gastroplastia endoscópica en manga)', ind: 'IMC 30-40, no candidato o no desea cirugía', det: 'Sutura endoscópica (Apollo OverStitch). Pérdida 15-20% peso a 12-24 meses.', evid: 'MERIT trial, NEJM 2022' });
  } else if (imc >= 40) {
    op.push({ t: 'Puente farmacológico GLP-1', ind: 'IMC mayor o igual a 50 o alto riesgo quirúrgico', det: 'Semaglutida/tirzepatida 4-6 meses pre-cirugía para reducir IMC.', evid: 'Estrategia bridge' });
    op.push({ t: 'Balón intragástrico puente', ind: 'IMC mayor o igual a 50 con riesgo quirúrgico alto', det: 'Reducción 10-15% peso previo a cirugía definitiva.', evid: 'IFSO/ASMBS' });
  }
  return op;
}

function getRevisionOptions() {
  return [
    'Conversión Manga a RYGB',
    'Conversión Manga a OAGB',
    'Conversión Manga a SADI-S',
    'Conversión RYGB a BPD-DS',
    'Distalización de RYGB',
    'Revisión endoscópica (TORe)',
    'Dilatación endoscópica de estenosis',
    'Reparación de hernia hiatal',
    'Cierre de fístula (OTSC)',
    'Alargamiento de canal común',
    'Retiro/recambio de balón',
  ];
}