import React, { useState } from 'react';
import { Home, Stethoscope, ClipboardList, Activity, Pill, Scissors, BookOpen, LayoutDashboard, Package, FlaskConical, Menu, X, Globe } from 'lucide-react';
import { LangProvider, useLang, IDIOMAS } from './src_shared/i18n.jsx';

import Modulo0 from './avante_modulo0';
import Modulo1 from './avante_modulo1';
import Modulo2 from './avante_modulo2';
import Modulo3 from './avante_modulo3';
import Modulo4 from './avante_modulo4';
import Modulo5 from './avante_modulo5';
import Modulo6 from './avante_modulo6';
import Modulo7 from './avante_modulo7';
import Modulo8 from './avante_modulo8';
import Modulo9 from './avante_modulo9';

const C = { navy: '#0A1F44', teal: '#1A8B9D', gold: '#C9A961', cream: '#FAF7F2' };

// Organización temporal: antes (preop) · durante (perioperatorio) · después (posop) · transversales
const MODULOS = [
  { id: 0, comp: Modulo0, icon: Home, tKey: 'nav.inicio', subKey: null, seccion: 'inicio' },
  // ANTES — evaluación y optimización preoperatoria
  { id: 1, comp: Modulo1, icon: Stethoscope, tKey: 'mod.1.titulo', subKey: 'mod.1.sub', seccion: 'antes' },
  { id: 2, comp: Modulo2, icon: ClipboardList, tKey: 'mod.2.titulo', subKey: 'mod.2.sub', seccion: 'antes' },
  { id: 4, comp: Modulo4, icon: Pill, tKey: 'mod.4.titulo', subKey: 'mod.4.sub', seccion: 'antes' },
  // DURANTE — acto quirúrgico / endoscópico y calidad perioperatoria
  { id: 5, comp: Modulo5, icon: Scissors, tKey: 'mod.5.titulo', subKey: 'mod.5.sub', seccion: 'durante' },
  // DESPUÉS — seguimiento, educación, dashboard y paquete
  { id: 3, comp: Modulo3, icon: Activity, tKey: 'mod.3.titulo', subKey: 'mod.3.sub', seccion: 'despues' },
  { id: 6, comp: Modulo6, icon: BookOpen, tKey: 'mod.6.titulo', subKey: 'mod.6.sub', seccion: 'despues' },
  { id: 7, comp: Modulo7, icon: LayoutDashboard, tKey: 'mod.7.titulo', subKey: 'mod.7.sub', seccion: 'despues' },
  { id: 8, comp: Modulo8, icon: Package, tKey: 'mod.8.titulo', subKey: 'mod.8.sub', seccion: 'despues' },
  // TRANSVERSAL — cruza datos de toda la plataforma
  { id: 9, comp: Modulo9, icon: FlaskConical, tKey: 'mod.9.titulo', subKey: 'mod.9.sub', seccion: 'transversal' }
];

const SECCIONES = [
  { k: 'antes', l: { es:'Antes · Preoperatorio', en:'Before · Preoperative', fr:'Avant · Préopératoire', de:'Vor · Präoperativ', it:'Prima · Preoperatoria', pt:'Antes · Pré-operatório', ru:'До · Предоперационно', zh:'术前', ja:'術前', ko:'수술 전', ar:'قبل · ما قبل الجراحة', hi:'पूर्व · सर्जरी-पूर्व' } },
  { k: 'durante', l: { es:'Durante · Perioperatorio', en:'During · Perioperative', fr:'Pendant · Périopératoire', de:'Während · Perioperativ', it:'Durante · Perioperatoria', pt:'Durante · Perioperatório', ru:'Во время · Периоперационно', zh:'围术期', ja:'周術期', ko:'수술 중', ar:'أثناء · حول الجراحة', hi:'दौरान · परिचालन' } },
  { k: 'despues', l: { es:'Después · Posoperatorio', en:'After · Postoperative', fr:'Après · Postopératoire', de:'Nach · Postoperativ', it:'Dopo · Postoperatoria', pt:'Depois · Pós-operatório', ru:'После · Послеоперационно', zh:'术后', ja:'術後', ko:'수술 후', ar:'بعد · ما بعد الجراحة', hi:'बाद · सर्जरी-बाद' } },
  { k: 'transversal', l: { es:'Transversal · Investigación', en:'Cross-sectional · Research', fr:'Transversal · Recherche', de:'Transversal · Forschung', it:'Trasversale · Ricerca', pt:'Transversal · Pesquisa', ru:'Сквозное · Исследование', zh:'跨模块 · 研究', ja:'横断 · 研究', ko:'교차 · 연구', ar:'شامل · البحث', hi:'अनुप्रस्थ · अनुसंधान' } }
];

function Shell() {
  const [activo, setActivo] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { lang, setLang, t } = useLang();
  const ModuloActivo = MODULOS.find(m => m.id === activo).comp;

  return (
    <div className="flex min-h-screen" style={{ background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      <aside className={`${menuAbierto ? 'block' : 'hidden'} md:block fixed md:relative z-20 w-72 min-h-screen`} style={{ background: C.navy }}>
        <div className="p-5 border-b border-white/10">
          <h1 style={{ fontFamily: 'Georgia, serif', color: C.gold }} className="text-xl font-bold leading-tight">
            {t('app.titulo')}
          </h1>
          <p className="text-xs text-white/70 mt-1">{t('app.subtitulo')}</p>
          <p style={{ fontFamily: 'Georgia, serif' }} className="text-xs italic text-white/60 mt-1">{t('app.lema')}</p>
        </div>

        <div className="p-3 border-b border-white/10 flex items-center gap-2">
          <Globe size={14} style={{ color: C.gold }} />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="flex-1 text-xs px-2 py-1 rounded bg-white/10 text-white border border-white/20"
          >
            {IDIOMAS.map(l => (
              <option key={l.code} value={l.code} style={{ color: '#0A1F44' }}>{l.name}</option>
            ))}
          </select>
        </div>

        <nav className="p-3 space-y-3">
          {/* Inicio suelto */}
          {MODULOS.filter(m => m.seccion === 'inicio').map(m => {
            const Icon = m.icon;
            const sel = m.id === activo;
            return (
              <button key={m.id} onClick={() => { setActivo(m.id); setMenuAbierto(false); }}
                className="w-full text-left p-3 rounded transition-colors flex items-start gap-3"
                style={{ background: sel ? C.teal : 'transparent', color: 'white' }}>
                <Icon size={18} style={{ color: sel ? 'white' : C.gold, flexShrink: 0, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold opacity-80">{t('nav.inicio').toUpperCase()}</div>
                  <div className="text-sm font-bold truncate">{t('nav.inicio')}</div>
                </div>
              </button>
            );
          })}

          {/* Secciones temporales agrupadas */}
          {SECCIONES.map(sec => {
            const items = MODULOS.filter(m => m.seccion === sec.k);
            if (items.length === 0) return null;
            const label = sec.l[lang] || sec.l.es;
            return (
              <div key={sec.k}>
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded" style={{ color: C.gold, borderLeft: `2px solid ${C.gold}` }}>
                  {label}
                </div>
                <div className="mt-1 space-y-1">
                  {items.map(m => {
                    const Icon = m.icon;
                    const sel = m.id === activo;
                    return (
                      <button key={m.id} onClick={() => { setActivo(m.id); setMenuAbierto(false); }}
                        className="w-full text-left p-3 rounded transition-colors flex items-start gap-3"
                        style={{ background: sel ? C.teal : 'transparent', color: 'white' }}>
                        <Icon size={18} style={{ color: sel ? 'white' : C.gold, flexShrink: 0, marginTop: 2 }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold opacity-80">{t('nav.modulo')} {m.id}</div>
                          <div className="text-sm font-bold truncate">{t(m.tKey)}</div>
                          {m.subKey && <div className="text-xs opacity-70 truncate">{t(m.subKey)}</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      <button onClick={() => setMenuAbierto(!menuAbierto)}
        className="md:hidden fixed top-4 right-4 z-30 p-2 rounded shadow-lg"
        style={{ background: C.navy, color: 'white' }}>
        {menuAbierto ? <X size={20} /> : <Menu size={20} />}
      </button>

      <main className="flex-1 min-w-0">
        <ModuloActivo />
      </main>
    </div>
  );
}

export default function AvantePlataforma() {
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  );
}
