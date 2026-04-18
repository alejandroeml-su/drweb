import React, { useState } from 'react';
import { Home, Stethoscope, ClipboardList, Activity, Pill, Scissors, BookOpen, LayoutDashboard, Package, Menu, X, Globe } from 'lucide-react';
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

const C = { navy: '#0A1F44', teal: '#1A8B9D', gold: '#C9A961', cream: '#FAF7F2' };

const MODULOS = [
  { id: 0, comp: Modulo0, icon: Home, tKey: 'nav.inicio', subKey: null },
  { id: 1, comp: Modulo1, icon: Stethoscope, tKey: 'mod.1.titulo', subKey: 'mod.1.sub' },
  { id: 2, comp: Modulo2, icon: ClipboardList, tKey: 'mod.2.titulo', subKey: 'mod.2.sub' },
  { id: 3, comp: Modulo3, icon: Activity, tKey: 'mod.3.titulo', subKey: 'mod.3.sub' },
  { id: 4, comp: Modulo4, icon: Pill, tKey: 'mod.4.titulo', subKey: 'mod.4.sub' },
  { id: 5, comp: Modulo5, icon: Scissors, tKey: 'mod.5.titulo', subKey: 'mod.5.sub' },
  { id: 6, comp: Modulo6, icon: BookOpen, tKey: 'mod.6.titulo', subKey: 'mod.6.sub' },
  { id: 7, comp: Modulo7, icon: LayoutDashboard, tKey: 'mod.7.titulo', subKey: 'mod.7.sub' },
  { id: 8, comp: Modulo8, icon: Package, tKey: 'mod.8.titulo', subKey: 'mod.8.sub' }
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

        <nav className="p-3 space-y-1">
          {MODULOS.map(m => {
            const Icon = m.icon;
            const sel = m.id === activo;
            return (
              <button key={m.id} onClick={() => { setActivo(m.id); setMenuAbierto(false); }}
                className="w-full text-left p-3 rounded transition-colors flex items-start gap-3"
                style={{ background: sel ? C.teal : 'transparent', color: 'white' }}>
                <Icon size={18} style={{ color: sel ? 'white' : C.gold, flexShrink: 0, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold opacity-80">
                    {m.id === 0 ? t('nav.inicio').toUpperCase() : `${t('nav.modulo')} ${m.id}`}
                  </div>
                  <div className="text-sm font-bold truncate">{m.id === 0 ? t('nav.inicio') : t(m.tKey)}</div>
                  {m.subKey && <div className="text-xs opacity-70 truncate">{t(m.subKey)}</div>}
                </div>
              </button>
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
