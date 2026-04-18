import React, { useState, useMemo } from 'react';
import {
  BookOpen, DollarSign, FlaskConical, Siren, BarChart3, Video, Award,
  Users, TrendingUp, CheckCircle2, Calendar, Star, Download, Mail,
  Phone, FileText, ChevronRight, ExternalLink, MessageCircle
} from 'lucide-react';
import { useLang } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import {
  C, PROCS, Patient, EDUCACION, EQUIPO, EVIDENCIA,
  calcIMC, storageGet, fmtFechaHora,
  exportarPDF, descargarPDF, shareWhatsApp, shareEmail
} from '../lib/data';

type MainTab = 'edu' | 'dash' | 'paquete';

export default function Modulo6_7_8({ initialTab = 'edu' }: { initialTab?: string }) {
  const { t } = useLang();
  const [mainTab, setMainTab] = useState<MainTab>(initialTab as MainTab);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setMainTab('edu')}
          className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${mainTab === 'edu' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          style={mainTab === 'edu' ? { color: C.navy } : {}}
        >
          {t('mod.6.titulo')}
        </button>
        <button
          onClick={() => setMainTab('dash')}
          className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${mainTab === 'dash' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          style={mainTab === 'dash' ? { color: C.navy } : {}}
        >
          Dashboard
        </button>
        <button
          onClick={() => setMainTab('paquete')}
          className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${mainTab === 'paquete' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          style={mainTab === 'paquete' ? { color: C.navy } : {}}
        >
          {t('mod.8.titulo')}
        </button>
      </div>

      {mainTab === 'edu' && <EducacionView />}
      {mainTab === 'dash' && <DashboardView />}
      {mainTab === 'paquete' && <PaqueteView />}
    </div>
  );
}

function EducacionView() {
  const { t } = useLang();
  const [subTab, setSubTab] = useState<'edu' | 'costos' | 'invest' | 'emerg'>('edu');
  const [expandedEdu, setExpandedEdu] = useState<number | null>(null);

  const subTabs = [
    { id: 'edu' as const, label: t('tab.educacion') },
    { id: 'costos' as const, label: t('tab.costos') },
    { id: 'invest' as const, label: t('tab.investigacion') },
    { id: 'emerg' as const, label: t('tab.emergencias') },
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

      {subTab === 'edu' && (
        <div className="space-y-2">
          {EDUCACION.map((edu, i) => (
            <div key={i} className="rounded-xl border border-gray-100 overflow-hidden bg-white">
              <button
                onClick={() => setExpandedEdu(expandedEdu === i ? null : i)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} style={{ color: C.teal }} />
                  <span className="text-sm font-medium" style={{ color: C.navy }}>{edu.tema}</span>
                </div>
                <ChevronRight size={16} className={`text-gray-400 transition-transform ${expandedEdu === i ? 'rotate-90' : ''}`} />
              </button>
              {expandedEdu === i && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-xs text-gray-600 leading-relaxed">{edu.contenido}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {subTab === 'costos' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Estimación de Costos (referencia)</h4>
            <div className="space-y-2">
              {[
                { proc: 'Manga Gástrica', rango: '$8,000 - $15,000 USD', incluye: 'Cirugía, hospitalización 24-48h, seguimiento 1 mes' },
                { proc: 'Bypass Gástrico (RYGB)', rango: '$10,000 - $20,000 USD', incluye: 'Cirugía, hospitalización 48-72h, seguimiento 1 mes' },
                { proc: 'Balón Intragástrico', rango: '$3,000 - $8,000 USD', incluye: 'Procedimiento endoscópico, seguimiento 6 meses' },
                { proc: 'Revisión Bariátrica', rango: '$12,000 - $25,000 USD', incluye: 'Según complejidad, hospitalización variable' },
              ].map((c, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: C.navy }}>{c.proc}</span>
                    <span className="text-xs font-bold" style={{ color: C.teal }}>{c.rango}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">{c.incluye}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-3 italic">
              * Los costos son referenciales y pueden variar según el caso clínico, aseguradora y país.
            </p>
          </div>
        </div>
      )}

      {subTab === 'invest' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Variables para Registro de Investigación</h4>
            <div className="space-y-2">
              {[
                { cat: 'Demográficas', vars: 'Edad, sexo, etnia, ocupación, nivel educativo' },
                { cat: 'Antropométricas', vars: 'Peso, talla, IMC, circunferencia de cintura, composición corporal' },
                { cat: 'Comorbilidades', vars: 'DM2, HTA, AOS, dislipidemia, ERGE, artropatía' },
                { cat: 'Quirúrgicas', vars: 'Procedimiento, duración, sangrado, complicaciones, conversión' },
                { cat: 'Seguimiento', vars: '%EWL, %TWL, remisión de comorbilidades, calidad de vida' },
                { cat: 'Laboratorio', vars: 'Hb, albúmina, B12, hierro, vitamina D, HbA1c, perfil lipídico' },
              ].map((v, i) => (
                <div key={i} className="p-2 rounded-lg bg-gray-50">
                  <span className="text-xs font-bold" style={{ color: C.navy }}>{v.cat}: </span>
                  <span className="text-xs text-gray-600">{v.vars}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'emerg' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-red-200 bg-red-50">
            <div className="flex items-center gap-2 mb-3">
              <Siren size={20} style={{ color: C.red }} />
              <h4 className="font-bold text-sm" style={{ color: C.red }}>Protocolos de Emergencia</h4>
            </div>
            <div className="space-y-3">
              {[
                { titulo: 'Fuga anastomótica', pasos: ['Estabilización hemodinámica', 'TC abdomen con contraste oral hidrosoluble', 'NPO + ATB amplio espectro', 'Drenaje percutáneo vs reintervención', 'UCI si inestable'] },
                { titulo: 'Sangrado postoperatorio', pasos: ['Reposición de volumen + hemoderivados', 'Monitoreo continuo Hb/Hcto', 'Endoscopia si sangrado intraluminal', 'Reintervención si inestable o caída Hb persistente'] },
                { titulo: 'TEP masivo', pasos: ['AngioTC de tórax urgente', 'Anticoagulación terapéutica inmediata', 'Trombolisis si inestabilidad hemodinámica', 'Filtro VCI si contraindicación a anticoagulación'] },
                { titulo: 'Obstrucción intestinal', pasos: ['Descompresión con SNG', 'TC abdomen', 'Manejo conservador 24-48h si parcial', 'Reintervención si completa o no mejora'] },
              ].map((e, i) => (
                <div key={i} className="p-3 rounded-lg bg-white border border-red-100">
                  <h5 className="text-xs font-bold mb-2" style={{ color: C.red }}>{e.titulo}</h5>
                  <ol className="space-y-1">
                    {e.pasos.map((p, j) => (
                      <li key={j} className="flex items-start gap-2 text-[11px] text-gray-600">
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: C.red }}>{j + 1}</span>
                        {p}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardView() {
  const { t } = useLang();
  const [subTab, setSubTab] = useState<'dash' | 'equipo' | 'tele'>('dash');
  const { patients: pacientes } = useAuth();

  const stats = useMemo(() => {
    const total = pacientes.length;
    const avgIMC = total ? pacientes.reduce((s, p) => s + calcIMC(p.peso, p.talla), 0) / total : 0;
    const procs: Record<string, number> = {};
    pacientes.forEach(p => { procs[p.procedimiento] = (procs[p.procedimiento] || 0) + 1; });
    const sexoM = pacientes.filter(p => p.sexo === 'M').length;
    return { total, avgIMC, procs, sexoM, sexoF: total - sexoM };
  }, [pacientes]);

  const subTabs = [
    { id: 'dash' as const, label: t('tab.dashboard') },
    { id: 'equipo' as const, label: 'Equipo' },
    { id: 'tele' as const, label: t('tab.telemedicina') },
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

      {subTab === 'dash' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Pacientes" value={stats.total.toString()} icon={Users} color={C.navy} />
            <StatCard label="IMC Promedio" value={stats.avgIMC.toFixed(1)} icon={BarChart3} color={C.teal} />
            <StatCard label="Masculino" value={stats.sexoM.toString()} icon={TrendingUp} color="#3B82F6" />
            <StatCard label="Femenino" value={stats.sexoF.toString()} icon={TrendingUp} color="#EC4899" />
          </div>

          {Object.keys(stats.procs).length > 0 && (
            <div className="p-4 rounded-xl bg-white border border-gray-100">
              <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Distribución por Procedimiento</h4>
              <div className="space-y-2">
                {Object.entries(stats.procs).sort((a, b) => b[1] - a[1]).map(([proc, count]) => (
                  <div key={proc} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-700">{PROCS[proc] || proc}</span>
                        <span className="text-xs font-bold" style={{ color: C.navy }}>{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(count / stats.total) * 100}%`, background: C.teal }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.total === 0 && (
            <div className="text-center py-12 text-gray-400">
              <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Registre pacientes para ver estadísticas</p>
            </div>
          )}
        </div>
      )}

      {subTab === 'equipo' && (
        <div className="space-y-2">
          {EQUIPO.map((m, i) => (
            <div key={i} className="p-3 rounded-xl bg-white border border-gray-100 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: C.navy }}>
                {m.persona.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: C.navy }}>{m.persona}</div>
                <div className="text-[11px] font-medium" style={{ color: C.teal }}>{m.rol}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{m.resp}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'tele' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Tipos de Consulta Virtual</h4>
            <div className="space-y-2">
              {[
                { tipo: 'Primera consulta informativa', duracion: '30 min', ind: 'Pacientes evaluando opciones' },
                { tipo: 'Control postoperatorio temprano', duracion: '15 min', ind: '48-72h, 1 semana post-egreso' },
                { tipo: 'Seguimiento ponderal', duracion: '20 min', ind: '1, 3, 6, 12 meses' },
                { tipo: 'Consulta nutricional', duracion: '30 min', ind: 'Ajuste dietario, suplementación' },
                { tipo: 'Consulta psicológica', duracion: '45 min', ind: 'Seguimiento conductual' },
              ].map((c, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.teal}15` }}>
                    <Video size={18} style={{ color: C.teal }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold" style={{ color: C.navy }}>{c.tipo}</div>
                    <div className="text-[10px] text-gray-500">{c.duracion} · {c.ind}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaqueteView() {
  const { t } = useLang();
  const [subTab, setSubTab] = useState<'resumen' | 'evidencia' | 'docs'>('resumen');
  const { patients: pacientes } = useAuth();
  const [selId, setSelId] = useState('');

  const selPac = pacientes.find(p => p.id === selId) || null;

  const subTabs = [
    { id: 'resumen' as const, label: t('tab.resumen') },
    { id: 'evidencia' as const, label: t('tab.evidencia') },
    { id: 'docs' as const, label: t('tab.documentos') },
  ];

  const exportResumen = async () => {
    if (!selPac) return;
    const i = calcIMC(selPac.peso, selPac.talla);
    const comorbStr = Object.entries(selPac.comorbilidades || {}).filter(([, v]) => v).map(([k]) => k).join(', ') || 'Ninguna';
    const doc = await exportarPDF({
      titulo: `Paquete del Paciente — ${selPac.nombre} ${selPac.apellido}`,
      subtitulo: 'Avante Complejo Hospitalario',
      secciones: [
        { titulo: 'Datos Generales', lineas: [`Nombre: ${selPac.nombre} ${selPac.apellido}`, `Edad: ${selPac.edad} | Sexo: ${selPac.sexo}`, `IMC: ${i.toFixed(1)} kg/m²`, `Procedimiento: ${PROCS[selPac.procedimiento] || selPac.procedimiento}`] },
        { titulo: 'Comorbilidades', lineas: [comorbStr] },
        { titulo: 'Contacto', lineas: [`Tel: ${selPac.telefono || '—'}`, `Email: ${selPac.email || '—'}`] },
      ],
    });
    descargarPDF(doc, `avante_paquete_${selPac.apellido}`);
  };

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

      {subTab === 'resumen' && (
        <div className="space-y-3">
          <select
            value={selId}
            onChange={e => setSelId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': C.teal } as React.CSSProperties}
          >
            <option value="">{t('lbl.seleccione')}</option>
            {pacientes.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
            ))}
          </select>

          {selPac ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ background: C.navy }}>
                    {selPac.nombre[0]}{selPac.apellido[0]}
                  </div>
                  <div>
                    <div className="font-bold text-base" style={{ color: C.navy }}>{selPac.nombre} {selPac.apellido}</div>
                    <div className="text-xs text-gray-500">{selPac.edad} años · {selPac.sexo === 'M' ? 'Masculino' : 'Femenino'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <div className="text-xl font-bold" style={{ color: C.navy }}>{calcIMC(selPac.peso, selPac.talla).toFixed(1)}</div>
                    <div className="text-[10px] text-gray-500">IMC</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <div className="text-xl font-bold" style={{ color: C.teal }}>{selPac.peso}</div>
                    <div className="text-[10px] text-gray-500">Peso (kg)</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <div className="text-xl font-bold" style={{ color: C.gold }}>{selPac.talla}</div>
                    <div className="text-[10px] text-gray-500">Talla (cm)</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-100">
                <h4 className="font-bold text-sm mb-2" style={{ color: C.navy }}>Procedimiento</h4>
                <div className="p-2 rounded-lg text-sm" style={{ background: `${C.teal}10`, color: C.teal }}>
                  {PROCS[selPac.procedimiento] || selPac.procedimiento}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={exportResumen} className="flex-1 py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2" style={{ background: C.navy }}>
                  <Download size={16} /> PDF
                </button>
                <button
                  onClick={() => shareWhatsApp(selPac.telefono, `Resumen: ${selPac.nombre} ${selPac.apellido}, IMC ${calcIMC(selPac.peso, selPac.talla).toFixed(1)}`)}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 bg-green-600"
                >
                  <MessageCircle size={16} /> WhatsApp
                </button>
                <button
                  onClick={() => shareEmail(selPac.email, 'Resumen Avante', `Paciente: ${selPac.nombre} ${selPac.apellido}`)}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 bg-blue-600"
                >
                  <Mail size={16} /> Email
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('lbl.seleccione')}</p>
            </div>
          )}
        </div>
      )}

      {subTab === 'evidencia' && (
        <div className="space-y-2">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Base de Evidencia Científica</h4>
            <div className="space-y-2">
              {EVIDENCIA.map((e, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-700 leading-relaxed">{e.cita}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500">{e.fuente}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">{e.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'docs' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h4 className="font-bold text-sm mb-3" style={{ color: C.navy }}>Documentos y Guías</h4>
            <div className="space-y-2">
              {[
                { nombre: 'Guía del paciente bariátrico', desc: 'Información completa sobre preparación, cirugía y recuperación' },
                { nombre: 'Consentimiento informado', desc: 'Documento legal para firma del paciente' },
                { nombre: 'Plan nutricional postoperatorio', desc: 'Fases dietarias detalladas' },
                { nombre: 'Guía de suplementación', desc: 'Vitaminas y minerales de por vida' },
                { nombre: 'Signos de alarma', desc: 'Cuándo acudir a urgencias' },
                { nombre: 'Guía de ejercicio', desc: 'Programa de actividad física progresiva' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.gold}15` }}>
                    <FileText size={18} style={{ color: C.gold }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold" style={{ color: C.navy }}>{doc.nombre}</div>
                    <div className="text-[10px] text-gray-500">{doc.desc}</div>
                  </div>
                  <Download size={14} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-gray-500">{label}</div>
    </div>
  );
}