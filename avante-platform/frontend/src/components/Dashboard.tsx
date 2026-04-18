import React, { useMemo } from 'react';
import {
  Users, CalendarClock, Activity, AlertTriangle,
  TrendingUp, Heart
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useLang } from '../lib/i18n';
import { useAuth, Appointment } from '../lib/auth';
import { Patient, C, PROCS, COMORBIDITIES, calcIMC, calcOSMRS } from '../lib/data';

/* ── Stat Card ── */
function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string | number; accent: string;
}) {
  return (
    <div className="rounded-2xl p-4 md:p-5 bg-white shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}15` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold" style={{ color: C.navy }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function getUpcomingAppointments(appointments: Appointment[]): Appointment[] {
  const now = new Date();
  return appointments
    .filter(a => {
      if (!a.fecha) return false;
      const d = new Date(a.fecha);
      return d >= now;
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);
}

const RISK_COLORS = [C.green, C.yellow, C.red];

/* ── Main Dashboard ── */
export default function Dashboard() {
  const { t } = useLang();
  const { user, patients, appointments } = useAuth();

  /* Computed analytics */
  const stats = useMemo(() => {
    if (!patients.length) return null;

    // Procedures count
    const procMap: Record<string, number> = {};
    patients.forEach(p => {
      const key = p.procedimiento || 'sleeve';
      procMap[key] = (procMap[key] || 0) + 1;
    });
    const procData = Object.entries(procMap)
      .map(([id, count]) => ({ name: PROCS[id] || id, count }))
      .sort((a, b) => b.count - a.count);

    // Risk distribution (OS-MRS)
    let low = 0, moderate = 0, high = 0;
    patients.forEach(p => {
      const r = calcOSMRS(p);
      if (r.score >= 4) high++;
      else if (r.score >= 2) moderate++;
      else low++;
    });
    const riskData = [
      { name: t('dash.riesgoBajo'), value: low, color: C.green },
      { name: t('dash.riesgoModerado'), value: moderate, color: C.yellow },
      { name: t('dash.riesgoAlto'), value: high, color: C.red },
    ].filter(d => d.value > 0);

    // Average BMI
    let bmiSum = 0, bmiCount = 0;
    patients.forEach(p => {
      const bmi = calcIMC(p.peso, p.talla);
      if (bmi > 0) { bmiSum += bmi; bmiCount++; }
    });
    const avgBMI = bmiCount > 0 ? (bmiSum / bmiCount).toFixed(1) : '—';

    // Top comorbidities
    const comorbMap: Record<string, number> = {};
    patients.forEach(p => {
      if (p.comorbilidades) {
        Object.entries(p.comorbilidades).forEach(([k, v]) => {
          if (v) comorbMap[k] = (comorbMap[k] || 0) + 1;
        });
      }
    });
    const comorbData = Object.entries(comorbMap)
      .map(([id, count]) => {
        const found = COMORBIDITIES.find(c => c.id === id);
        return { name: found ? found.label : id, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Upcoming appointments
    const upcoming = getUpcomingAppointments(appointments);

    return {
      total: patients.length,
      upcomingCount: upcoming.length,
      avgBMI,
      highRisk: high,
      procData,
      riskData,
      comorbData,
      upcoming,
    };
  }, [patients, appointments, t]);

  if (!user) {
    return (
      <div className="rounded-2xl p-8 bg-white shadow-sm border border-gray-100 text-center">
        <Activity size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 text-sm">{t('dash.sinDatos')}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-2xl p-8 bg-white shadow-sm border border-gray-100 text-center">
        <Users size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 text-sm">{t('dash.sinDatos')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.teal}15` }}>
          <TrendingUp size={20} style={{ color: C.teal }} />
        </div>
        <h3 className="font-bold text-base md:text-lg" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>
          {t('dash.titulo')}
        </h3>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={<Users size={22} style={{ color: C.teal }} />}
          label={t('dash.totalPacientes')}
          value={stats.total}
          accent={C.teal}
        />
        <StatCard
          icon={<CalendarClock size={22} style={{ color: C.gold }} />}
          label={t('dash.citasPendientes')}
          value={stats.upcomingCount}
          accent={C.gold}
        />
        <StatCard
          icon={<Activity size={22} style={{ color: C.navy }} />}
          label={t('dash.imcPromedio')}
          value={stats.avgBMI}
          accent={C.navy}
        />
        <StatCard
          icon={<AlertTriangle size={22} style={{ color: C.red }} />}
          label={t('dash.altoRiesgo')}
          value={stats.highRisk}
          accent={C.red}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Procedures Bar Chart */}
        <div className="rounded-2xl p-4 md:p-6 bg-white shadow-sm border border-gray-100">
          <h4 className="font-bold text-sm mb-4" style={{ color: C.navy }}>
            {t('dash.porProcedimiento')}
          </h4>
          {stats.procData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.procData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#666' }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#666' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                  formatter={(value: number) => [`${value} ${t('dash.pacientes')}`, '']}
                />
                <Bar dataKey="count" fill={C.teal} radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">—</div>
          )}
        </div>

        {/* Risk Pie Chart */}
        <div className="rounded-2xl p-4 md:p-6 bg-white shadow-sm border border-gray-100">
          <h4 className="font-bold text-sm mb-4" style={{ color: C.navy }}>
            {t('dash.distribucionRiesgo')}
          </h4>
          {stats.riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                  formatter={(value: number) => [`${value} ${t('dash.pacientes')}`, '']}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">—</div>
          )}
        </div>
      </div>

      {/* Bottom Row: Comorbidities + Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Comorbidities */}
        <div className="rounded-2xl p-4 md:p-6 bg-white shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={18} style={{ color: C.red }} />
            <h4 className="font-bold text-sm" style={{ color: C.navy }}>
              {t('dash.comorbilidades')}
            </h4>
          </div>
          {stats.comorbData.length > 0 ? (
            <div className="space-y-2.5">
              {stats.comorbData.map((item, i) => {
                const maxCount = stats.comorbData[0]?.count || 1;
                const pct = (item.count / maxCount) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-700 truncate pr-2">{item.name}</span>
                      <span className="text-xs font-semibold" style={{ color: C.navy }}>{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.teal}, ${C.navy})` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">—</p>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="rounded-2xl p-4 md:p-6 bg-white shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock size={18} style={{ color: C.gold }} />
            <h4 className="font-bold text-sm" style={{ color: C.navy }}>
              {t('dash.proximasCitas')}
            </h4>
          </div>
          {stats.upcoming.length > 0 ? (
            <div className="space-y-2">
              {stats.upcoming.map((apt, i) => {
                const d = new Date(apt.fecha);
                const dateStr = d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
                const timeStr = d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div
                    key={apt.id || i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-100"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white shrink-0"
                      style={{ background: C.navy }}
                    >
                      <span className="text-[10px] font-medium leading-none">
                        {d.toLocaleDateString('es-SV', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-sm font-bold leading-none">{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: C.navy }}>
                        {apt.paciente_nombre || '—'}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {dateStr} · {timeStr}
                        {apt.tipo ? ` · ${apt.tipo}` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CalendarClock size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-400 text-sm">{t('dash.sinCitas')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}