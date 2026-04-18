import React, { useState } from 'react';
import {
  Users, Plus, Download, Trash2, Edit3, CheckCircle2,
  AlertCircle, ChevronRight, Calendar,
  Search, Phone, Mail, Save, X, Loader2
} from 'lucide-react';
import { useLang } from '../lib/i18n';
import { useAuth, Appointment } from '../lib/auth';
import {
  C, PROCEDURES, COMORBIDITIES, EMPTY_PATIENT, Patient,
  calcIMC, calcOSMRS, calcEOSS, calcCaprini,
  fmtFechaHora, nowLocalInput,
  exportarPDF, descargarPDF
} from '../lib/data';

type TabType = 'pacientes' | 'clasificaciones' | 'agenda';

export default function Modulo1() {
  const { t } = useLang();
  const { patients, patientsLoading, savePatient, deletePatient } = useAuth();
  const [tab, setTab] = useState<TabType>('pacientes');
  const [selPac, setSelPac] = useState<Patient | null>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<Patient>({ ...EMPTY_PATIENT });
  const [busqueda, setBusqueda] = useState('');
  const [saving, setSaving] = useState(false);

  const guardar = async () => {
    const p = { ...form };
    if (!p.nombre || !p.apellido) return;
    setSaving(true);
    try {
      const saved = await savePatient(p);
      if (saved) {
        setSelPac(saved);
        setEditando(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id: string) => {
    await deletePatient(id);
    if (selPac?.id === id) setSelPac(null);
  };

  const nuevoP = () => {
    setForm({ ...EMPTY_PATIENT });
    setEditando(true);
    setSelPac(null);
  };

  const editarP = (p: Patient) => {
    setForm({ ...p });
    setEditando(true);
  };

  const filtrados = patients.filter(p => {
    const q = busqueda.toLowerCase();
    return !q || `${p.nombre} ${p.apellido} ${p.expediente || ''}`.toLowerCase().includes(q);
  });

  const exportPDF = async (p: Patient) => {
    const i = calcIMC(p.peso, p.talla);
    const osmrs = calcOSMRS(p);
    const caprini = calcCaprini(p);
    const doc = await exportarPDF({
      titulo: `${p.nombre} ${p.apellido}`,
      subtitulo: 'Estratificación de Riesgo — Avante',
      secciones: [
        { titulo: 'Datos del Paciente', lineas: [`Edad: ${p.edad} | Sexo: ${p.sexo} | IMC: ${i.toFixed(1)}`, `Procedimiento: ${p.procedimiento}`, `Registro: ${fmtFechaHora(p.fechaRegistro)}`] },
        { titulo: 'OS-MRS', lineas: [`Score: ${osmrs.score}/5 — Riesgo: ${osmrs.riesgo}`, ...osmrs.detalles] },
        { titulo: 'Caprini TEP', lineas: [`Score: ${caprini.score} — Riesgo: ${caprini.riesgo}`, `Profilaxis: ${caprini.profilaxis}`] },
      ],
    });
    descargarPDF(doc, `avante_${p.apellido}_riesgo`);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'pacientes', label: t('tab.pacientes') },
    { id: 'clasificaciones', label: t('tab.clasificaciones') },
    { id: 'agenda', label: t('tab.agenda') },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tb => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 min-w-[80px] px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              tab === tb.id ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={tab === tb.id ? { color: C.navy } : {}}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Patient Form Modal */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50" onClick={() => setEditando(false)}>
          <div
            className="bg-white w-full md:w-[600px] md:max-h-[85vh] max-h-[90vh] rounded-t-3xl md:rounded-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ color: C.navy }}>
                {form.id ? t('btn.editar') : t('btn.nuevo')}
              </h3>
              <button onClick={() => setEditando(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{t('lbl.nombre')}</label>
                  <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': C.teal } as React.CSSProperties} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{t('lbl.apellido')}</label>
                  <input value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': C.teal } as React.CSSProperties} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{t('lbl.edad')}</label>
                  <input type="number" value={form.edad} onChange={e => setForm({ ...form, edad: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': C.teal } as React.CSSProperties} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{t('lbl.sexo')}</label>
                  <select value={form.sexo} onChange={e => setForm({ ...form, sexo: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': C.teal } as React.CSSProperties}>
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">ASA</label>
                  <select value={form.asa} onChange={e => setForm({ ...form, asa: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': C.teal } as React.CSSProperties}>
                    {['1', '2', '3', '4'].map(v => <option key={v} value={v}>ASA {v}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{t('lbl.peso')}</label>
                  <input type="number" value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': C.teal } as React.CSSProperties} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{t('lbl.talla')}</label>
                  <input type="number" value={form.talla} onChange={e => setForm({ ...form, talla: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': C.teal } as React.CSSProperties} />
                </div>
              </div>
              {form.peso && form.talla && (
                <div className="p-3 rounded-xl text-center text-sm font-bold" style={{ background: `${C.teal}15`, color: C.teal }}>
                  {t('lbl.imc')}: {calcIMC(form.peso, form.talla).toFixed(1)} kg/m²
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('lbl.procedimiento')}</label>
                <select value={form.procedimiento} onChange={e => setForm({ ...form, procedimiento: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': C.teal } as React.CSSProperties}>
                  {PROCEDURES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block"><Phone size={12} className="inline mr-1" />Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': C.teal } as React.CSSProperties} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block"><Mail size={12} className="inline mr-1" />Email</label>
                  <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': C.teal } as React.CSSProperties} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">{t('lbl.comorbilidades')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {COMORBIDITIES.map(c => (
                    <label key={c.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!form.comorbilidades?.[c.id]}
                        onChange={e => setForm({ ...form, comorbilidades: { ...form.comorbilidades, [c.id]: e.target.checked } })}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: C.teal }}
                      />
                      <span className="text-xs text-gray-700">{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={guardar}
                disabled={saving}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: C.teal }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Guardando...' : t('btn.guardar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {tab === 'pacientes' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder={t('btn.buscar') + '...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': C.teal } as React.CSSProperties}
              />
            </div>
            <button
              onClick={nuevoP}
              className="px-4 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
              style={{ background: C.teal }}
            >
              <Plus size={16} /> <span className="hidden sm:inline">{t('btn.nuevo')}</span>
            </button>
          </div>

          {patientsLoading ? (
            <div className="text-center py-16">
              <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: C.teal }} />
              <p className="text-sm text-gray-400">Cargando pacientes...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('lbl.sinPacientes')}</p>
              <button onClick={nuevoP} className="mt-3 text-sm font-medium" style={{ color: C.teal }}>
                + {t('btn.nuevo')}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtrados.map(p => {
                const i = calcIMC(p.peso, p.talla);
                const osmrs = calcOSMRS(p);
                const isSelected = selPac?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelPac(isSelected ? null : p)}
                    className={`p-3 md:p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected ? 'border-2 shadow-md' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                    style={isSelected ? { borderColor: C.teal, background: `${C.teal}08` } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: C.navy }}
                      >
                        {p.nombre[0]}{p.apellido[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate" style={{ color: C.navy }}>
                          {p.nombre} {p.apellido}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {p.edad}a · {p.sexo} · IMC {i.toFixed(1)} · {PROCEDURES.find(x => x.id === p.procedimiento)?.name?.split('(')[0] || p.procedimiento}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-white"
                          style={{ background: osmrs.color }}
                        >
                          {osmrs.score}/5
                        </span>
                        <ChevronRight size={16} className={`text-gray-300 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded-lg bg-gray-50">
                            <div className="text-lg font-bold" style={{ color: C.navy }}>{i.toFixed(1)}</div>
                            <div className="text-[10px] text-gray-500">IMC</div>
                          </div>
                          <div className="p-2 rounded-lg" style={{ background: `${osmrs.color}15` }}>
                            <div className="text-lg font-bold" style={{ color: osmrs.color }}>{osmrs.score}</div>
                            <div className="text-[10px] text-gray-500">OS-MRS</div>
                          </div>
                          <div className="p-2 rounded-lg" style={{ background: `${calcCaprini(p).color}15` }}>
                            <div className="text-lg font-bold" style={{ color: calcCaprini(p).color }}>{calcCaprini(p).score}</div>
                            <div className="text-[10px] text-gray-500">Caprini</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => editarP(p)} className="flex-1 py-2 rounded-lg text-xs font-medium border border-gray-200 flex items-center justify-center gap-1 hover:bg-gray-50">
                            <Edit3 size={14} /> {t('btn.editar')}
                          </button>
                          <button onClick={() => exportPDF(p)} className="flex-1 py-2 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-1" style={{ background: C.navy }}>
                            <Download size={14} /> PDF
                          </button>
                          <button onClick={() => eliminar(p.id)} className="py-2 px-3 rounded-lg text-xs text-red-500 border border-red-200 hover:bg-red-50">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Classifications Tab */}
      {tab === 'clasificaciones' && (
        <div className="space-y-3">
          {!selPac ? (
            <div className="text-center py-16 text-gray-400">
              <AlertCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('lbl.seleccione')}</p>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-white border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: C.navy }}>
                  {selPac.nombre[0]}{selPac.apellido[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: C.navy }}>{selPac.nombre} {selPac.apellido}</div>
                  <div className="text-[11px] text-gray-500">IMC: {calcIMC(selPac.peso, selPac.talla).toFixed(1)}</div>
                </div>
              </div>

              {/* OS-MRS */}
              {(() => {
                const r = calcOSMRS(selPac);
                return (
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${r.color}40` }}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ background: `${r.color}10` }}>
                      <h4 className="font-bold text-sm" style={{ color: C.navy }}>OS-MRS (Obesity Surgery Mortality Risk Score)</h4>
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: r.color }}>{r.score}/5</span>
                    </div>
                    <div className="p-4 bg-white space-y-1">
                      {r.detalles.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle2 size={14} style={{ color: r.color }} />
                          {d}
                        </div>
                      ))}
                      <div className="mt-2 p-2 rounded-lg text-xs font-medium" style={{ background: `${r.color}10`, color: r.color }}>
                        Riesgo: {r.riesgo.toUpperCase()}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* EOSS */}
              {(() => {
                const e = calcEOSS(selPac);
                return (
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${e.color}40` }}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ background: `${e.color}10` }}>
                      <h4 className="font-bold text-sm" style={{ color: C.navy }}>EOSS (Edmonton Obesity Staging System)</h4>
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: e.color }}>{e.riesgo}</span>
                    </div>
                    <div className="p-4 bg-white grid grid-cols-3 gap-3 text-center">
                      <div className="p-2 rounded-lg bg-gray-50">
                        <div className="text-lg font-bold" style={{ color: C.navy }}>{e.metabolico}</div>
                        <div className="text-[10px] text-gray-500">Metabólico</div>
                      </div>
                      <div className="p-2 rounded-lg bg-gray-50">
                        <div className="text-lg font-bold" style={{ color: C.navy }}>{e.mecanico}</div>
                        <div className="text-[10px] text-gray-500">Mecánico</div>
                      </div>
                      <div className="p-2 rounded-lg bg-gray-50">
                        <div className="text-lg font-bold" style={{ color: C.navy }}>{e.psico}</div>
                        <div className="text-[10px] text-gray-500">Psicosocial</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Caprini */}
              {(() => {
                const c = calcCaprini(selPac);
                return (
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${c.color}40` }}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ background: `${c.color}10` }}>
                      <h4 className="font-bold text-sm" style={{ color: C.navy }}>Caprini (Riesgo TEP)</h4>
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: c.color }}>{c.score} pts</span>
                    </div>
                    <div className="p-4 bg-white space-y-2">
                      <div className="text-xs text-gray-600"><strong>Riesgo:</strong> {c.riesgo}</div>
                      <div className="p-2 rounded-lg text-xs" style={{ background: `${c.color}10`, color: c.color }}>
                        <strong>Profilaxis:</strong> {c.profilaxis}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* Agenda Tab */}
      {tab === 'agenda' && (
        <AgendaTab />
      )}
    </div>
  );
}

function AgendaTab() {
  const { t } = useLang();
  const { appointments, appointmentsLoading, saveAppointment, deleteAppointment } = useAuth();
  const [nueva, setNueva] = useState(false);
  const [form, setForm] = useState({ paciente_nombre: '', fecha: nowLocalInput(), tipo: 'consulta', notas: '' });
  const [saving, setSaving] = useState(false);

  const guardar = async () => {
    if (!form.paciente_nombre) return;
    setSaving(true);
    try {
      await saveAppointment(form);
      setNueva(false);
      setForm({ paciente_nombre: '', fecha: nowLocalInput(), tipo: 'consulta', notas: '' });
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id: string) => {
    await deleteAppointment(id);
  };

  const sorted = [...appointments].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  return (
    <div className="space-y-3">
      <button
        onClick={() => setNueva(!nueva)}
        className="w-full py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90"
        style={{ background: C.teal }}
      >
        <Plus size={16} /> Nueva cita
      </button>

      {nueva && (
        <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-3">
          <input
            value={form.paciente_nombre}
            onChange={e => setForm({ ...form, paciente_nombre: e.target.value })}
            placeholder="Nombre del paciente"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': C.teal } as React.CSSProperties}
          />
          <input
            type="datetime-local"
            value={form.fecha}
            onChange={e => setForm({ ...form, fecha: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': C.teal } as React.CSSProperties}
          />
          <select
            value={form.tipo}
            onChange={e => setForm({ ...form, tipo: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': C.teal } as React.CSSProperties}
          >
            <option value="consulta">Consulta</option>
            <option value="preop">Evaluación preoperatoria</option>
            <option value="cirugia">Cirugía</option>
            <option value="seguimiento">Seguimiento</option>
            <option value="nutricion">Nutrición</option>
            <option value="psicologia">Psicología</option>
          </select>
          <textarea
            value={form.notas}
            onChange={e => setForm({ ...form, notas: e.target.value })}
            placeholder="Notas..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
            style={{ '--tw-ring-color': C.teal } as React.CSSProperties}
          />
          <button
            onClick={guardar}
            disabled={saving}
            className="w-full py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: C.teal }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}

      {appointmentsLoading ? (
        <div className="text-center py-16">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: C.teal }} />
          <p className="text-sm text-gray-400">Cargando citas...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Sin citas programadas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(c => (
            <div key={c.id} className="p-3 rounded-xl bg-white border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.teal}15` }}>
                <Calendar size={18} style={{ color: C.teal }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: C.navy }}>{c.paciente_nombre}</div>
                <div className="text-[11px] text-gray-500">{fmtFechaHora(c.fecha)} · {c.tipo}</div>
                {c.notas && <div className="text-[11px] text-gray-400 truncate">{c.notas}</div>}
              </div>
              <button onClick={() => eliminar(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}