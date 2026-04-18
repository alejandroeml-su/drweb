import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthCallback from './pages/AuthCallback';
import { LangProvider, useLang, IDIOMAS } from './lib/i18n';
import { AuthProvider, useAuth } from './lib/auth';
import { C, storageGet, storageSet } from './lib/data';
import {
  Home, Stethoscope, ClipboardList, Activity, Pill,
  Scissors, BookOpen, LayoutDashboard, Package,
  Menu, X, Globe, ChevronLeft, LogIn, LogOut, User, Loader2
} from 'lucide-react';

import Modulo0 from './modules/Modulo0';
import Modulo1 from './modules/Modulo1';
import Modulo2_3 from './modules/Modulo2_3';
import Modulo4_5 from './modules/Modulo4_5';
import Modulo6_7_8 from './modules/Modulo6_7_8';

const MODULOS = [
  { id: 0, icon: Home, tKey: 'nav.inicio', subKey: '' },
  { id: 1, icon: Stethoscope, tKey: 'mod.1.titulo', subKey: 'mod.1.sub' },
  { id: 2, icon: ClipboardList, tKey: 'mod.2.titulo', subKey: 'mod.2.sub' },
  { id: 3, icon: Activity, tKey: 'mod.3.titulo', subKey: 'mod.3.sub' },
  { id: 4, icon: Pill, tKey: 'mod.4.titulo', subKey: 'mod.4.sub' },
  { id: 5, icon: Scissors, tKey: 'mod.5.titulo', subKey: 'mod.5.sub' },
  { id: 6, icon: BookOpen, tKey: 'mod.6.titulo', subKey: 'mod.6.sub' },
  { id: 7, icon: LayoutDashboard, tKey: 'mod.7.titulo', subKey: 'mod.7.sub' },
  { id: 8, icon: Package, tKey: 'mod.8.titulo', subKey: 'mod.8.sub' },
];

function ModuleRenderer({ id }: { id: number }) {
  switch (id) {
    case 0: return <Modulo0 />;
    case 1: return <Modulo1 />;
    case 2: return <Modulo2_3 initialTab="opt" />;
    case 3: return <Modulo2_3 initialTab="seg" />;
    case 4: return <Modulo4_5 initialTab="noqx" />;
    case 5: return <Modulo4_5 initialTab="plastica" />;
    case 6: return <Modulo6_7_8 initialTab="edu" />;
    case 7: return <Modulo6_7_8 initialTab="dash" />;
    case 8: return <Modulo6_7_8 initialTab="paquete" />;
    default: return <Modulo0 />;
  }
}

function LoginScreen() {
  const { login } = useAuth();
  const { t } = useLang();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1a3a6a 100%)` }}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center" style={{ background: `${C.teal}15` }}>
          <Stethoscope size={40} style={{ color: C.teal }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', color: C.navy }} className="text-2xl font-bold">
            {t('app.titulo')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t('app.subtitulo')}</p>
          <p style={{ fontFamily: 'Georgia, serif' }} className="text-xs italic text-gray-400 mt-1">
            {t('app.lema')}
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Inicie sesión para acceder a la plataforma y sincronizar sus datos en todos sus dispositivos.
          </p>
          <button
            onClick={login}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
            style={{ background: C.teal }}
          >
            <LogIn size={18} /> Iniciar Sesión
          </button>
        </div>
        <p className="text-[10px] text-gray-400">
          Sus datos se guardarán de forma segura en la nube y estarán disponibles en cualquier dispositivo.
        </p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.navy }}>
      <div className="text-center space-y-4">
        <Loader2 size={40} className="animate-spin mx-auto" style={{ color: C.gold }} />
        <p className="text-white/70 text-sm">Cargando...</p>
      </div>
    </div>
  );
}

function Shell() {
  const [activo, setActivo] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const { lang, setLang, t } = useLang();
  const { user, loading, login, logout } = useAuth();

  useEffect(() => {
    const saved = storageGet('avante_custom_title') as string | null;
    if (saved) setCustomTitle(saved);
  }, []);

  const displayTitle = customTitle || t('app.titulo');

  const saveTitle = () => {
    storageSet('avante_custom_title', customTitle);
    setEditingTitle(false);
  };

  const navTo = (id: number) => {
    setActivo(id);
    setMenuAbierto(false);
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginScreen />;

  const bottomNavItems = [
    { id: 0, icon: Home, label: t('nav.inicio') },
    { id: 1, icon: Stethoscope, label: t('mod.1.titulo').split(' ')[0] },
    { id: 3, icon: Activity, label: t('mod.3.titulo').split(' ')[0] },
    { id: 7, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 8, icon: Package, label: t('mod.8.titulo').split(' ')[0] },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Mobile overlay */}
      {menuAbierto && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`
          fixed md:relative z-40
          ${menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${sidebarCollapsed ? 'md:w-20' : 'md:w-72'}
          w-72 min-h-screen transition-all duration-300 ease-in-out
        `}
        style={{ background: C.navy }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <div className="space-y-1">
                  <input
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveTitle()}
                    onBlur={saveTitle}
                    autoFocus
                    placeholder={t('app.titulo')}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-white/40"
                    style={{ fontFamily: 'Georgia, serif' }}
                  />
                  <p className="text-[9px] text-white/40">Enter para guardar · Vacío = título por defecto</p>
                </div>
              ) : (
                <h1
                  style={{ fontFamily: 'Georgia, serif', color: C.gold }}
                  className="text-lg font-bold leading-tight truncate cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setEditingTitle(true)}
                  title="Clic para personalizar el nombre de su institución"
                >
                  {displayTitle}
                </h1>
              )}
              <p className="text-[10px] text-white/70 mt-0.5">{t('app.subtitulo')}</p>
              <p style={{ fontFamily: 'Georgia, serif' }} className="text-[10px] italic text-white/50 mt-0.5">
                {t('app.lema')}
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
          >
            <ChevronLeft size={16} className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setMenuAbierto(false)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-white/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Language selector */}
        {!sidebarCollapsed && (
          <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
            <Globe size={14} style={{ color: C.gold }} />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 outline-none"
            >
              {IDIOMAS.map(l => (
                <option key={l.code} value={l.code} className="bg-gray-800 text-white">
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation items */}
        <nav className="p-2 space-y-0.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {MODULOS.map(m => {
            const Icon = m.icon;
            const isActive = activo === m.id;
            return (
              <button
                key={m.id}
                onClick={() => navTo(m.id)}
                className={`
                  w-full flex items-center gap-3 rounded-xl transition-all duration-200
                  ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-white/15 shadow-lg shadow-black/20'
                    : 'hover:bg-white/8'
                  }
                `}
                title={sidebarCollapsed ? t(m.tKey) : undefined}
              >
                <div
                  className={`flex items-center justify-center rounded-lg transition-colors ${sidebarCollapsed ? 'w-10 h-10' : 'w-9 h-9'}`}
                  style={{
                    background: isActive ? C.teal : 'transparent',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  <Icon size={sidebarCollapsed ? 20 : 18} />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.8)' }}
                    >
                      {m.id > 0 && <span className="text-[10px] opacity-50 mr-1">M{m.id}</span>}
                      {t(m.tKey)}
                    </div>
                    {m.subKey && (
                      <div className="text-[10px] text-white/40 truncate">{t(m.subKey)}</div>
                    )}
                  </div>
                )}
                {!sidebarCollapsed && isActive && (
                  <div className="w-1 h-8 rounded-full" style={{ background: C.gold }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User section at bottom */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10">
                <User size={14} className="text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/60 truncate">Conectado</p>
              </div>
              <button
                onClick={logout}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 flex justify-center">
            <button
              onClick={logout}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {/* Mobile header */}
        <header
          className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 shadow-sm"
          style={{ background: C.navy }}
        >
          <button
            onClick={() => setMenuAbierto(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 style={{ color: C.gold, fontFamily: 'Georgia, serif' }} className="text-base font-bold truncate">
              {activo === 0 ? displayTitle : t(MODULOS[activo].tKey)}
            </h1>
            {activo > 0 && MODULOS[activo].subKey && (
              <p className="text-[10px] text-white/50 truncate">{t(MODULOS[activo].subKey)}</p>
            )}
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 outline-none w-16"
          >
            {IDIOMAS.map(l => (
              <option key={l.code} value={l.code} className="bg-gray-800">{l.flag}</option>
            ))}
          </select>
        </header>

        {/* Module content */}
        <div className="p-3 md:p-6 max-w-7xl mx-auto">
          <ModuleRenderer id={activo} />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around px-1 py-1">
          {bottomNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activo === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navTo(item.id)}
                className="flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-[56px]"
                style={{
                  color: isActive ? C.teal : '#9CA3AF',
                  background: isActive ? `${C.teal}15` : 'transparent',
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] mt-0.5 font-medium truncate max-w-[60px]">
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setMenuAbierto(true)}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-xl min-w-[56px]"
            style={{ color: '#9CA3AF' }}
          >
            <Menu size={22} strokeWidth={1.8} />
            <span className="text-[10px] mt-0.5 font-medium">Más</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<Shell />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}