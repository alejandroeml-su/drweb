import React, { useState, useEffect } from 'react';
import {
  Globe, Search, BookOpen, Building2, Newspaper,
  Calendar, ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLang } from '../lib/i18n';
import { C, IMAGES, SOCIEDADES, REVISTAS, topicoDeLaSemana } from '../lib/data';
import Dashboard from '../components/Dashboard';

const BANNER_IMAGES = [
  { url: IMAGES.hospital, titulo: 'Avante Complejo Hospitalario' },
  { url: IMAGES.team, titulo: 'Equipo Multidisciplinario' },
  { url: IMAGES.patient, titulo: 'Resultados que Transforman Vidas' },
  { url: IMAGES.abstract, titulo: 'Innovación Médica' },
];

export default function Modulo0() {
  const { lang, t } = useLang();
  const [idx, setIdx] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const semana = topicoDeLaSemana(lang);

  useEffect(() => {
    const iv = setInterval(() => setIdx(i => (i + 1) % BANNER_IMAGES.length), 5000);
    return () => clearInterval(iv);
  }, []);

  const buscarPubMed = () => {
    const q = encodeURIComponent(busqueda || semana.topico.pubmedQuery);
    window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${q}`, '_blank', 'noopener');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Hero Banner Carousel */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ aspectRatio: '16/7' }}>
        <div className="absolute inset-0">
          <img
            src={BANNER_IMAGES[idx].url}
            alt={BANNER_IMAGES[idx].titulo}
            className="w-full h-full object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <h2
            className="text-xl md:text-3xl font-bold text-white mb-1"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {BANNER_IMAGES[idx].titulo}
          </h2>
          <p className="text-white/70 text-xs md:text-sm">{t('app.lema')}</p>
        </div>
        {/* Navigation arrows */}
        <button
          onClick={() => setIdx(i => (i - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setIdx(i => (i + 1) % BANNER_IMAGES.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {BANNER_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white w-6' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </div>

      {/* Dashboard Analytics Panel */}
      <Dashboard />

      {/* Topic of the Week */}
      <div className="rounded-2xl p-4 md:p-6 shadow-sm border" style={{ background: C.cream, borderColor: `${C.gold}30` }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.teal}15` }}>
            <Calendar size={20} style={{ color: C.teal }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: C.navy }}>
              {t('inicio.topicoSemana')}
            </h3>
            <p className="text-[10px] text-gray-500">{t('inicio.semana')} {semana.semana}</p>
          </div>
        </div>
        <h4 className="font-bold text-base md:text-lg mb-2" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>
          {semana.titulo}
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed">{semana.resumen}</p>
      </div>

      {/* PubMed Search */}
      <div className="rounded-2xl p-4 md:p-6 bg-white shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.navy}10` }}>
            <Search size={20} style={{ color: C.navy }} />
          </div>
          <h3 className="font-bold text-sm" style={{ color: C.navy }}>{t('inicio.pubmed')}</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarPubMed()}
            placeholder={t('inicio.pubmedPh')}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': C.teal } as React.CSSProperties}
          />
          <button
            onClick={buscarPubMed}
            className="px-5 py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95"
            style={{ background: C.teal }}
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Societies & Journals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Societies */}
        <div className="rounded-2xl p-4 md:p-6 bg-white shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.teal}15` }}>
              <Building2 size={20} style={{ color: C.teal }} />
            </div>
            <h3 className="font-bold text-sm" style={{ color: C.navy }}>{t('inicio.sociedades')}</h3>
          </div>
          <div className="space-y-2">
            {SOCIEDADES.map(s => (
              <a
                key={s.nombre}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: C.navy }}>
                  {s.nombre.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: C.navy }}>{s.nombre}</div>
                  <div className="text-[11px] text-gray-500 truncate">{s.desc}</div>
                </div>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-teal-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Journals */}
        <div className="rounded-2xl p-4 md:p-6 bg-white shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.gold}20` }}>
              <Newspaper size={20} style={{ color: C.gold }} />
            </div>
            <h3 className="font-bold text-sm" style={{ color: C.navy }}>{t('inicio.revistas')}</h3>
          </div>
          <div className="space-y-2">
            {REVISTAS.map(r => (
              <a
                key={r.nombre}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${C.gold}15`, color: C.gold }}>
                  <BookOpen size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: C.navy }}>{r.nombre}</div>
                  <div className="text-[11px] text-gray-500 truncate">{r.desc}</div>
                </div>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="rounded-2xl p-4 md:p-6 bg-white shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.navy}10` }}>
            <Globe size={20} style={{ color: C.navy }} />
          </div>
          <h3 className="font-bold text-sm" style={{ color: C.navy }}>{t('inicio.idiomaTitulo')}</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {[
            { code: 'es', flag: '🇪🇸', name: 'Español' },
            { code: 'en', flag: '🇺🇸', name: 'English' },
            { code: 'fr', flag: '🇫🇷', name: 'Français' },
            { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
            { code: 'it', flag: '🇮🇹', name: 'Italiano' },
            { code: 'pt', flag: '🇧🇷', name: 'Português' },
            { code: 'ru', flag: '🇷🇺', name: 'Русский' },
            { code: 'zh', flag: '🇨🇳', name: '中文' },
            { code: 'ja', flag: '🇯🇵', name: '日本語' },
            { code: 'ko', flag: '🇰🇷', name: '한국어' },
            { code: 'ar', flag: '🇸🇦', name: 'العربية' },
            { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
          ].map(l => (
            <div
              key={l.code}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 bg-gray-50/50"
            >
              <span className="text-lg">{l.flag}</span>
              <span className="text-xs font-medium text-gray-700 truncate">{l.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}