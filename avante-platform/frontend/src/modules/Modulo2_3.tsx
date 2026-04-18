import React, { useState } from 'react';
import {
  CheckCircle2, AlertCircle, AlertTriangle, ChevronRight,
  Download, Activity, Apple, FlaskConical, Plus, Save, Trash2
} from 'lucide-react';
import { useLang } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import {
  C, PROCS, LAB_PARAMS, Patient,
  calcIMC, planOptimizacion,
  storageGet, storageSet, fmtFechaHora, nowLocalInput,
  exportarPDF, descargarPDF
} from '../lib/data';

type MainTab = 'opt' | 'seg';

export default function Modulo2_3({ initialTab = 'opt' }: { initialTab?: string }) {
  const { t } = useLang();
  const { patients: pacientes } = useAuth();
  const [mainTab, setMainTab] = useState<MainTab>(initialTab as MainTab);
  const [selId, setSelId] = useState<string>('');

  const selPac = pacientes.find(p => p.id === selId) || null;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setMainTab('opt')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${mainTab === 'opt' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          style={mainTab === 'opt' ? { color: C.navy } : {}}
        >
          {t('mod.2.titulo')}
        </button>
        <button
          onClick={() => setMainTab('seg')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${mainTab === 'seg' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          style={mainTab === 'seg' ? { color: C.navy } : {}}
        >
          {t('mod.3.titulo')}
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
      ) : mainTab === 'opt' ? (
        <OptimizacionView paciente={selPac} />
      ) : (
        <SeguimientoView paciente={selPac} />
      )}
    </div>
  );
}

function OptimizacionView({ paciente }: { paciente: Patient }) {
  const { t } = useLang();
  const [subTab, setSubTab] = useState<'plan' | 'proc' | 'prof'>('plan');
  const plan = planOptimizacion(paciente);
  const i = calcIMC(paciente.peso, paciente.talla);

  const prioColor = (p: string) => p === 'critico' ? C.red : p === 'importante' ? C.yellow : C.green;
  const prioLabel = (p: string) => p === 'critico' ? 'CRÍTICO' : p === 'importante' ? 'IMPORTANTE' : 'RUTINA';

  const exportPDF = async () => {
    const doc = await exportarPDF({
      titulo: `Optimización — ${paciente.nombre} ${paciente.apellido}`,
      subtitulo: 'Plan preoperatorio — Avante',
      secciones: plan.map(item => ({
        titulo: `[${prioLabel(item.prio)}] ${item.area}`,
        lineas: [item.accion, `Tiempo estimado: ${item.tiempo}`],
      })),
    });
    descargarPDF(doc, `avante_${paciente.apellido}_optimizacion`);
  };

  const subTabs = [
    { id: 'plan' as const, label: t('tab.optimizacion') },
    { id: 'proc' as const, label: t('tab.procedimiento') },
    { id: 'prof' as const, label: t('tab.profilaxis') },
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

      {subTab === 'plan' && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <button onClick={exportPDF} className="px-3 py-2 rounded-lg text-xs font-medium text-white flex items-center gap-1" style={{ background: C.navy }}>
              <Download size={14} /> PDF
            </button>
          </div>
          {plan.map((item, idx) => (
            <div key={idx} className="rounded-xl border overflow-hidden" style={{ borderColor: `${prioColor(item.prio)}30` }}>
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: `${prioColor(item.prio)}10` }}>
                <div className="flex items-center gap-2">
                  {item.prio === 'critico' ? <AlertTriangle size={16} style={{ color: prioColor(item.prio) }} /> :
                   item.prio === 'importante' ? <AlertCircle size={16} style={{ color: prioColor(item.prio) }} /> :
                   <CheckCircle2 size={16} style={{ color: prioColor(item.prio) }} />}
                  <span className="font-bold text-sm" style={{ color: C.navy }}>{item.area}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: prioColor(item.prio) }}>
                  {prioLabel(item.prio)}
                </span>
              </div>
              <div className="p-4 bg-white">
                <p className="text-xs text-gray-600 leading-relaxed">{item.accion}</p>
                <p className="text-[10px] text-gray-400 mt-2">Tiempo: {item.tiempo}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'proc' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-2" style={{ color: C.navy }}>Procedimiento seleccionado</h4>
            <div className="p-3 rounded-lg text-sm font-medium" style={{ background: `${C.teal}10`, color: C.teal }}>
              {PROCS[paciente.procedimiento] || paciente.procedimiento}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Indicaciones basadas en IMC</h4>
            <div className="space-y-2 text-xs text-gray-600">
              {i >= 40 && <div className="p-2 rounded-lg bg-red-50 text-red-700">IMC mayor o igual a 40: Indicación absoluta de cirugía bariátrica</div>}
              {i >= 35 && i < 40 && <div className="p-2 rounded-lg bg-yellow-50 text-yellow-700">IMC 35-39.9: Indicación con comorbilidad asociada</div>}
              {i >= 30 && i < 35 && <div className="p-2 rounded-lg bg-blue-50 text-blue-700">IMC 30-34.9: Cirugía metabólica si DM2 mal controlada (ASMBS/IFSO 2022)</div>}
              {i < 30 && <div className="p-2 rounded-lg bg-gray-50 text-gray-600">IMC menor a 30: Evaluar opciones no quirúrgicas</div>}
            </div>
          </div>
        </div>
      )}

      {subTab === 'prof' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Profilaxis TEP</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="p-3 rounded-lg bg-blue-50">
                <strong>HBPM:</strong> Enoxaparina 40mg SC c/12h (IMC mayor o igual a 40) o c/24h. Inicio 6-12h postoperatorio.
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <strong>Mecánica:</strong> Medias de compresión graduada + dispositivo de compresión neumática intermitente.
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <strong>Deambulación:</strong> Inicio a las 4-6h postoperatorias. Mínimo 3 veces/día.
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Profilaxis Antibiótica</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="p-3 rounded-lg bg-green-50">
                <strong>Cefazolina:</strong> 2g IV (3g si mayor a 120kg) 30-60 min antes de incisión.
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <strong>Alergia a penicilina:</strong> Clindamicina 900mg IV + Gentamicina 5mg/kg.
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>ERAS (Enhanced Recovery)</h4>
            <div className="space-y-1 text-xs text-gray-600">
              {[
                'Carga de carbohidratos 2h antes (si no diabético)',
                'Analgesia multimodal: paracetamol + AINE + bloqueo TAP',
                'Procinéticos: metoclopramida 10mg IV',
                'Líquidos claros a las 4h postoperatorias',
                'Deambulación temprana',
                'Retiro temprano de sonda vesical (si se colocó)',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-1.5">
                  <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: C.green }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SeguimientoView({ paciente }: { paciente: Patient }) {
  const { t } = useLang();
  const [subTab, setSubTab] = useState<'d1' | 'labs' | 'nutri' | 'comp'>('d1');
  const [seguimientos, setSeguimientos] = useState<Array<{ fecha: string; peso: string; notas: string; valores: Record<string, string> }>>([]);
  const [nuevoSeg, setNuevoSeg] = useState(false);
  const [formSeg, setFormSeg] = useState({ fecha: nowLocalInput(), peso: '', notas: '', valores: {} as Record<string, string> });

  useEffect(() => {
    const data = storageGet(`avante_seg_${paciente.id}`) as typeof seguimientos | null;
    if (Array.isArray(data)) setSeguimientos(data);
  }, [paciente.id]);

  const guardarSeg = () => {
    const nuevo = { ...formSeg };
    const lista = [...seguimientos, nuevo];
    setSeguimientos(lista);
    storageSet(`avante_seg_${paciente.id}`, lista);
    setNuevoSeg(false);
    setFormSeg({ fecha: nowLocalInput(), peso: '', notas: '', valores: {} });
  };

  const eliminarSeg = (idx: number) => {
    const lista = seguimientos.filter((_, i) => i !== idx);
    setSeguimientos(lista);
    storageSet(`avante_seg_${paciente.id}`, lista);
  };

  const subTabs = [
    { id: 'd1' as const, label: t('tab.temprano') },
    { id: 'labs' as const, label: t('tab.labs') },
    { id: 'nutri' as const, label: t('tab.nutricion') },
    { id: 'comp' as const, label: t('tab.complicaciones') },
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

      {subTab === 'd1' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Checklist Día 1 Postoperatorio</h4>
            <div className="space-y-1">
              {[
                'Signos vitales estables (FC, PA, SatO2, Temp)',
                'Dolor controlado (EVA menor a 4)',
                'Tolerancia a líquidos claros',
                'Deambulación iniciada',
                'Diuresis adecuada (mayor a 0.5 mL/kg/h)',
                'Sin signos de fuga (taquicardia, fiebre, dolor)',
                'HBPM administrada',
                'Espirometría incentiva',
                'Educación al paciente sobre signos de alarma',
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" style={{ accentColor: C.teal }} />
                  <span className="text-xs text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'labs' && (
        <div className="space-y-3">
          <button
            onClick={() => setNuevoSeg(!nuevoSeg)}
            className="w-full py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: C.teal }}
          >
            <Plus size={16} /> Nuevo control
          </button>

          {nuevoSeg && (
            <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Fecha</label>
                  <input type="datetime-local" value={formSeg.fecha} onChange={e => setFormSeg({ ...formSeg, fecha: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Peso (kg)</label>
                  <input type="number" value={formSeg.peso} onChange={e => setFormSeg({ ...formSeg, peso: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {LAB_PARAMS.slice(0, 6).map(lp => (
                  <div key={lp.k}>
                    <label className="text-[10px] font-medium text-gray-500 mb-0.5 block">{lp.l} ({lp.u})</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formSeg.valores[lp.k] || ''}
                      onChange={e => setFormSeg({ ...formSeg, valores: { ...formSeg.valores, [lp.k]: e.target.value } })}
                      className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                      placeholder={`${lp.min}-${lp.max}`}
                    />
                  </div>
                ))}
              </div>
              <textarea
                value={formSeg.notas}
                onChange={e => setFormSeg({ ...formSeg, notas: e.target.value })}
                placeholder="Notas..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none"
              />
              <button onClick={guardarSeg} className="w-full py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: C.teal }}>
                <Save size={14} className="inline mr-1" /> Guardar
              </button>
            </div>
          )}

          {seguimientos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FlaskConical size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">Sin controles registrados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {seguimientos.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium" style={{ color: C.navy }}>{fmtFechaHora(s.fecha)}</div>
                    <div className="flex items-center gap-2">
                      {s.peso && <span className="text-xs font-bold" style={{ color: C.teal }}>{s.peso} kg</span>}
                      <button onClick={() => eliminarSeg(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {Object.entries(s.valores).filter(([, v]) => v).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {Object.entries(s.valores).filter(([, v]) => v).map(([k, v]) => {
                        const param = LAB_PARAMS.find(p => p.k === k);
                        const val = parseFloat(v);
                        const isLow = param && val < param.min;
                        const isHigh = param && val > param.max;
                        return (
                          <span key={k} className={`text-[10px] px-1.5 py-0.5 rounded ${isLow || isHigh ? 'bg-red-50 text-red-600 font-bold' : 'bg-gray-50 text-gray-600'}`}>
                            {param?.l || k}: {v}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {s.notas && <p className="text-[10px] text-gray-500">{s.notas}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'nutri' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Fases Dietarias Postoperatorias</h4>
            {[
              { fase: 'Fase 1 (Día 1-2)', desc: 'Líquidos claros: agua, caldo, gelatina sin azúcar, té', color: '#3B82F6' },
              { fase: 'Fase 2 (Día 3-14)', desc: 'Líquidos completos: proteína líquida, leche descremada, yogur licuado', color: '#8B5CF6' },
              { fase: 'Fase 3 (Semana 3-4)', desc: 'Purés: pollo licuado, huevo revuelto suave, puré de verduras', color: '#F59E0B' },
              { fase: 'Fase 4 (Semana 5-6)', desc: 'Blandos: pescado, pollo desmenuzado, queso cottage', color: '#10B981' },
              { fase: 'Fase 5 (Semana 7+)', desc: 'Dieta regular adaptada: porciones pequeñas, masticar 20-30 veces', color: '#EF4444' },
            ].map((f, i) => (
              <div key={i} className="flex gap-3 mb-3 last:mb-0">
                <div className="w-1 rounded-full flex-shrink-0" style={{ background: f.color }} />
                <div>
                  <div className="text-xs font-bold" style={{ color: f.color }}>{f.fase}</div>
                  <div className="text-xs text-gray-600">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Suplementación de por vida</h4>
            <div className="space-y-1 text-xs text-gray-600">
              {[
                'Multivitamínico bariátrico: 2 tabletas/día',
                'Calcio citrato + Vitamina D3: 1500mg Ca + 3000 UI D3',
                'Vitamina B12: 1000mcg sublingual diario o 1000mcg IM mensual',
                'Hierro: 45-60mg elemental/día (separado del calcio)',
                'Ácido fólico: 400-800mcg/día',
                'Tiamina (B1): 100mg/día primeros 6 meses',
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-1.5">
                  <Apple size={14} className="flex-shrink-0 mt-0.5" style={{ color: C.green }} />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'comp' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Signos de Alarma</h4>
            <div className="space-y-2">
              {[
                { signo: 'Taquicardia persistente (FC mayor a 120)', nivel: 'critico', accion: 'Descartar fuga. TC con contraste oral hidrosoluble.' },
                { signo: 'Fiebre mayor a 38.5°C', nivel: 'critico', accion: 'Hemocultivos, TC abdomen, valorar reintervención.' },
                { signo: 'Dolor abdominal severo progresivo', nivel: 'critico', accion: 'Descartar fuga, sangrado, obstrucción.' },
                { signo: 'Vómitos persistentes', nivel: 'importante', accion: 'Evaluar estenosis, edema anastomótico. Serie EGD.' },
                { signo: 'Sangrado por drenaje o hematemesis', nivel: 'critico', accion: 'Reposición, endoscopia urgente si inestable.' },
                { signo: 'Disnea o dolor torácico', nivel: 'critico', accion: 'Descartar TEP. AngioTC de tórax.' },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-lg border" style={{ borderColor: s.nivel === 'critico' ? `${C.red}30` : `${C.yellow}30`, background: s.nivel === 'critico' ? `${C.red}05` : `${C.yellow}05` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} style={{ color: s.nivel === 'critico' ? C.red : C.yellow }} />
                    <span className="text-xs font-bold" style={{ color: s.nivel === 'critico' ? C.red : C.yellow }}>{s.signo}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 ml-6">{s.accion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}