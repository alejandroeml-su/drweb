import React, { useEffect, useRef, useState } from 'react';
import { Globe, Upload, Trash2, ChevronLeft, ChevronRight, ExternalLink, Search, BookOpen, Building2, Newspaper, Calendar, Play, Image as ImageIcon } from 'lucide-react';
import { useLang, IDIOMAS } from './src_shared/i18n.jsx';
import { leerArchivoDataURL, storageGet, storageSet } from './src_shared/utils.js';
import { topicoDeLaSemana, SOCIEDADES, REVISTAS, TOPICOS } from './src_shared/topicos_semanales.js';

const C = { navy: '#0A1F44', teal: '#1A8B9D', gold: '#C9A961', cream: '#FAF7F2' };

const BANNER_KEY = 'avante_banner_items';
const MAX_BANNER = 10;

// Banners institucionales por defecto (se muestran cuando no hay imágenes del usuario)
const DEFAULT_BANNERS = [
  { id: 'default-1', tipo: 'imagen', src: '/banners/banner1.png', esDefault: true },
  { id: 'default-2', tipo: 'imagen', src: '/banners/banner2.png', esDefault: true },
  { id: 'default-3', tipo: 'imagen', src: '/banners/banner3.png', esDefault: true }
];

export default function AvanteModulo0() {
  const { lang, setLang, t } = useLang();
  const [banner, setBanner] = useState([]);
  const [idx, setIdx] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const fileRef = useRef(null);
  const semanaData = topicoDeLaSemana();
  const topico = semanaData.topico;
  const articulos = semanaData.articulos;

  useEffect(() => {
    (async () => {
      const v = await storageGet(BANNER_KEY);
      if (Array.isArray(v) && v.length > 0) setBanner(v);
      setCargando(false);
    })();
  }, []);

  // Items visibles: los del usuario si existen, si no los por defecto
  const itemsVisibles = banner.length > 0 ? banner : DEFAULT_BANNERS;
  const usandoDefaults = banner.length === 0;

  useEffect(() => {
    if (itemsVisibles.length < 2) return;
    const iv = setInterval(() => setIdx(i => (i + 1) % itemsVisibles.length), 6000);
    return () => clearInterval(iv);
  }, [itemsVisibles.length]);

  const subirArchivos = async (files) => {
    const nuevos = [];
    for (const f of files) {
      if (banner.length + nuevos.length >= MAX_BANNER) {
        alert('Máximo ' + MAX_BANNER + ' elementos en el banner');
        break;
      }
      if (!/^image\/|^video\//.test(f.type)) {
        alert('Solo imágenes o videos: ' + f.name);
        continue;
      }
      try {
        const r = await leerArchivoDataURL(f, 8 * 1024 * 1024);
        nuevos.push({
          id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          tipo: f.type.startsWith('video/') ? 'video' : 'imagen',
          dataUrl: r.dataUrl,
          nombre: r.name
        });
      } catch (e) {
        alert(f.name + ': ' + e.message);
      }
    }
    if (nuevos.length) {
      const lista = [...banner, ...nuevos];
      setBanner(lista);
      setIdx(0);
      await storageSet(BANNER_KEY, lista);
    }
  };

  const eliminarItem = async (id) => {
    const lista = banner.filter(b => b.id !== id);
    setBanner(lista);
    setIdx(0);
    await storageSet(BANNER_KEY, lista);
  };

  const buscarPubMed = () => {
    const q = encodeURIComponent(busqueda || topico.pubmedQuery);
    window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${q}`, '_blank', 'noopener');
  };

  const getTitulo = (o) => (lang === 'en' ? o.tituloEn : o.tituloEs) || o.tituloEs;
  const getResumen = (o) => (lang === 'en' ? o.resumenEn : o.resumenEs) || o.resumenEs;

  const current = itemsVisibles[idx % itemsVisibles.length];

  if (cargando) return <div className="p-8 text-center">...</div>;

  return (
    <div className="min-h-screen p-4" style={{ background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header institucional con selector de idioma */}
        <div className="rounded-t-lg p-6 flex flex-wrap justify-between items-start gap-4" style={{ background: C.navy, color: 'white' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', color: C.gold }} className="text-3xl font-bold leading-tight">{t('app.titulo')}</h1>
            <p style={{ fontFamily: 'Georgia, serif' }} className="text-sm italic opacity-90">{t('app.subtitulo')}</p>
            <p style={{ fontFamily: 'Georgia, serif' }} className="text-xs italic opacity-80 mt-1">{t('app.lema')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={18} style={{ color: C.gold }} />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="px-3 py-1.5 rounded border font-medium text-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              {IDIOMAS.map(l => (
                <option key={l.code} value={l.code} style={{ color: '#0A1F44' }}>
                  {l.flag} · {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* BANNER editable con carrusel */}
        <div className="bg-white p-4 shadow border-b">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2" style={{ color: C.navy }}>
              <ImageIcon size={18} style={{ color: C.gold }} />
              <span className="font-bold">{t('inicio.banner')}</span>
              <span className="text-xs text-gray-500">· {banner.length}/{MAX_BANNER}</span>
            </div>
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }}
                onChange={(e) => { subirArchivos(Array.from(e.target.files || [])); e.target.value = ''; }} />
              <button onClick={() => fileRef.current && fileRef.current.click()}
                className="px-3 py-2 rounded text-white text-sm flex items-center gap-1"
                style={{ background: C.teal }}>
                <Upload size={14} /> {t('inicio.bannerUpload')}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">{t('inicio.bannerHint')}</p>

          <div className="relative rounded-lg overflow-hidden" style={{ minHeight: 360, background: C.cream }}>
            {(() => {
              const imgSrc = current?.dataUrl || current?.src;
              return current?.tipo === 'video' ? (
                <video key={current.id} src={current.dataUrl || current.src} autoPlay loop muted playsInline
                  className="w-full h-full object-cover" style={{ minHeight: 360 }} />
              ) : (
                <img key={current?.id} src={imgSrc} alt="" className="w-full h-full object-cover" style={{ minHeight: 360 }} />
              );
            })()}
            {itemsVisibles.length > 1 && (
              <>
                <button onClick={() => setIdx((idx - 1 + itemsVisibles.length) % itemsVisibles.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white"
                  style={{ background: 'rgba(10,31,68,0.7)' }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setIdx((idx + 1) % itemsVisibles.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white"
                  style={{ background: 'rgba(10,31,68,0.7)' }}>
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                  {itemsVisibles.map((_, i) => (
                    <button key={i} onClick={() => setIdx(i)}
                      className="w-2 h-2 rounded-full"
                      style={{ background: i === idx ? C.gold : 'rgba(255,255,255,0.6)' }} />
                  ))}
                </div>
              </>
            )}
            {!usandoDefaults && current && (
              <button onClick={() => eliminarItem(current.id)}
                className="absolute top-2 right-2 p-2 rounded-full text-white"
                style={{ background: 'rgba(192,57,43,0.85)' }} title={t('comun.eliminar')}>
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {itemsVisibles.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {itemsVisibles.map((b, i) => (
                <button key={b.id} onClick={() => setIdx(i)}
                  className="relative flex-shrink-0 w-20 h-14 rounded overflow-hidden border-2"
                  style={{ borderColor: i === idx ? C.gold : 'transparent' }}>
                  {b.tipo === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: C.navy }}>
                      <Play size={18} color="white" />
                    </div>
                  ) : (
                    <img src={b.dataUrl || b.src} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tópico de la semana */}
        <div className="bg-white p-6 shadow border-b">
          <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider" style={{ color: C.teal }}>
            <Calendar size={14} />
            {t('inicio.semana')} {semanaData.semana} · {semanaData.anyo} · {t('inicio.proximaActualizacion')}: {semanaData.proxima.toLocaleDateString(lang === 'es' ? 'es' : lang)}
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', color: C.navy }} className="text-2xl font-bold mb-2">{t('inicio.topicoSemana')}</h2>
          <div className="p-4 rounded-lg border-l-4" style={{ borderColor: C.gold, background: C.cream }}>
            <h3 className="font-bold text-lg mb-2" style={{ color: C.navy }}>{getTitulo(topico)}</h3>
            <p className="text-sm text-gray-700 mb-3">{getResumen(topico)}</p>
            <button onClick={() => window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(topico.pubmedQuery)}`, '_blank', 'noopener')}
              className="px-3 py-1.5 rounded text-sm text-white inline-flex items-center gap-1" style={{ background: C.teal }}>
              <Search size={14} /> {t('inicio.leerMas')}
            </button>
          </div>
          {/* Roadmap próximos 11 tópicos */}
          <details className="mt-4">
            <summary className="text-xs text-gray-500 cursor-pointer">Ver próximos tópicos programados</summary>
            <ol className="text-xs mt-2 space-y-1 text-gray-600 list-decimal pl-5">
              {TOPICOS.map((x, i) => (
                <li key={i} className={i === (semanaData.semana - 1) % TOPICOS.length ? 'font-bold' : ''} style={{ color: i === (semanaData.semana - 1) % TOPICOS.length ? C.navy : '' }}>
                  {getTitulo(x)}
                </li>
              ))}
            </ol>
          </details>
        </div>

        {/* PubMed search */}
        <div className="bg-white p-6 shadow border-b">
          <h2 style={{ fontFamily: 'Georgia, serif', color: C.navy }} className="text-xl font-bold mb-3 flex items-center gap-2">
            <Search size={18} style={{ color: C.gold }} /> {t('inicio.pubmed')}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <input
              className="flex-1 min-w-[200px] px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2"
              placeholder={t('inicio.pubmedPh')}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarPubMed()}
            />
            <button onClick={buscarPubMed} className="px-4 py-2 rounded text-white font-medium" style={{ background: C.navy }}>
              {t('comun.buscar')} PubMed →
            </button>
          </div>
        </div>

        {/* Sociedades y revistas */}
        <div className="grid md:grid-cols-2 gap-0">
          <div className="bg-white p-6 shadow border-b md:border-r">
            <h2 style={{ fontFamily: 'Georgia, serif', color: C.navy }} className="text-xl font-bold mb-3 flex items-center gap-2">
              <Building2 size={18} style={{ color: C.gold }} /> {t('inicio.sociedades')}
            </h2>
            <ul className="space-y-2">
              {SOCIEDADES.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm flex items-start gap-2 hover:underline" style={{ color: C.teal }}>
                    <ExternalLink size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{s.nombre}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 shadow border-b">
            <h2 style={{ fontFamily: 'Georgia, serif', color: C.navy }} className="text-xl font-bold mb-3 flex items-center gap-2">
              <BookOpen size={18} style={{ color: C.gold }} /> {t('inicio.revistas')}
            </h2>
            <ul className="space-y-2">
              {REVISTAS.map((r, i) => (
                <li key={i}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm flex items-start gap-2 hover:underline" style={{ color: C.teal }}>
                    <ExternalLink size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{r.nombre}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Seis artículos destacados */}
        <div className="bg-white p-6 shadow rounded-b-lg">
          <h2 style={{ fontFamily: 'Georgia, serif', color: C.navy }} className="text-xl font-bold mb-4 flex items-center gap-2">
            <Newspaper size={18} style={{ color: C.gold }} /> {t('inicio.articulos')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {articulos.map((a, i) => (
              <a key={i} href={a.doi} target="_blank" rel="noopener noreferrer"
                className="block p-4 rounded-lg border hover:shadow transition"
                style={{ borderColor: '#e5e7eb', background: C.cream }}>
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: C.teal }}>{a.revista} · {a.anyo}</div>
                <div className="font-bold text-sm mb-1" style={{ color: C.navy }}>{getTitulo(a)}</div>
                <div className="text-xs text-gray-600 italic">{a.autor}</div>
                <div className="mt-2 text-xs flex items-center gap-1" style={{ color: C.teal }}>
                  <ExternalLink size={12} /> {t('inicio.leerMas')}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
