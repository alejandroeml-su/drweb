// ============================================================
// Avante · Módulo Home (landing con sociedades, revistas y evidencia)
// ============================================================

window.AvanteModuloHome = (function () {

  let _charts = [];
  let _bannerTimer = null;
  let _bannerIdx = 0;

  function destroyCharts() {
    _charts.forEach(c => { try { c.destroy(); } catch(e){} });
    _charts = [];
  }
  function detenerBanner() {
    if (_bannerTimer) { clearInterval(_bannerTimer); _bannerTimer = null; }
  }

  // ---------------- i18n local del home ----------------
  const HOME_I18N = {
    es: {
      brand:'Clínica de Obesidad y Metabólica',
      byAvante:'by Avante',
      updateBadge:'Actualización semanal',
      focus:'Foco',
      heroTitle1:'Ciencia global. Cuidado personal.',
      heroTitle2:'Excelencia bariátrica y metabólica.',
      heroIntro:'Plataforma clínica integral que conecta la evidencia publicada en las revistas más prestigiosas del mundo con la toma de decisiones en consulta: estratificación de riesgo, optimización, seguimiento y análisis ejecutivo.',
      ctaStart:'Comenzar estratificación',
      ctaPubmed:'Buscar en PubMed',
      kpi1:'personas vive con obesidad en el mundo',
      kpi2:'adultos con obesidad (OMS)',
      kpi3:'TWL promedio post-bariátrico a 12m',
      kpi4:'remisión de DM2 post-RYGB a 1 año',
      epidemiaTitle:'Proyección global de la obesidad',
      epidemiaSub:'Prevalencia estimada en adultos y niños · fuente: World Obesity Atlas / WHO (cifras redondeadas de referencia)',
      epidAdultos:'Adultos con obesidad (%)',
      epidNinos:'Niños/adolescentes (%)',
      epidAxis:'Prevalencia (%)',
      motto:'Creamos e innovamos para cuidar de ti',
      quote:'"La cirugía bariátrica no solo cambia el peso — transforma la historia metabólica, cardiovascular y oncológica del paciente."',
      bullet1:'Estratificación OS-MRS · EOSS · Caprini',
      bullet2:'Proyección de %TWL por procedimiento',
      bullet3:'Análisis con referencias de NEJM, JAMA, Lancet',
      articlesKicker:'Actualización semanal · PubMed',
      articlesTitle:'Lo más reciente en',
      articlesSub:'rotación temática automática · últimos 180 días',
      refresh:'Actualizar',
      loadingArticles:'Cargando artículos recientes desde PubMed…',
      offline:'No se pudo consultar PubMed en este momento.',
      openPubmed:'Abrir búsqueda manual en PubMed',
      viewPubmed:'Ver en PubMed',
      societiesKicker:'Acceso directo',
      societiesTitle:'Sociedades científicas mundiales',
      societiesSub:'Enlaces a sitios oficiales',
      visitSite:'Visitar sitio oficial',
      journalsKicker:'Evidencia',
      journalsTitle:'Revistas científicas líderes en obesidad y metabolismo',
      open:'Abrir',
      trialsKicker:'Ensayos que cambiaron la práctica',
      trialsTitle:'Literatura pivote en cirugía metabólica',
      ctaBannerTitle:'Listo para iniciar el abordaje clínico',
      ctaBannerSub:'Seleccione un módulo para comenzar: estratificación de riesgo, optimización, seguimiento, manejo no quirúrgico y más.',
      mod1:'Estratificación', mod2:'Optimización', mod3:'Seguimiento', mod7:'Dashboard', mod8:'Biblioteca',
      week:'Semana',
      language:'Idioma',
      // Banners
      banners: [
        { eyebrow:'Bienvenido', title:'Cuidado bariátrico integral',               sub:'Del primer contacto al año post-quirúrgico, con seguimiento estructurado.' },
        { eyebrow:'Evidencia',  title:'Guiado por la literatura mundial',          sub:'STAMPEDE, SM-BOSS, SLEEVEPASS, SOS: decisiones basadas en ensayos pivote.' },
        { eyebrow:'Tecnología', title:'Inteligencia clínica en cada consulta',    sub:'Estratificación, proyecciones y análisis ejecutivo en una sola plataforma.' },
        { eyebrow:'Calidez',    title:'Un equipo multidisciplinario para usted',  sub:'Cirugía, anestesia, nutrición, endocrinología, psicología y cardiología.' }
      ]
    },
    en: {
      brand:'Obesity & Metabolic Clinic',
      byAvante:'by Avante',
      updateBadge:'Weekly update',
      focus:'Focus',
      heroTitle1:'Global science. Personal care.',
      heroTitle2:'Bariatric and metabolic excellence.',
      heroIntro:'An integrated clinical platform connecting evidence from the world\u2019s leading journals with real-world decision making: risk stratification, optimization, follow-up, and executive insight.',
      ctaStart:'Start risk assessment',
      ctaPubmed:'Search PubMed',
      kpi1:'people live with obesity worldwide',
      kpi2:'adults with obesity (WHO)',
      kpi3:'average %TWL at 12 months post-surgery',
      kpi4:'T2D remission after RYGB at 1 year',
      epidemiaTitle:'Global obesity projection',
      epidemiaSub:'Estimated prevalence in adults and children · source: World Obesity Atlas / WHO (rounded reference figures)',
      epidAdultos:'Adults with obesity (%)',
      epidNinos:'Children/adolescents (%)',
      epidAxis:'Prevalence (%)',
      motto:'We create and innovate to care for you',
      quote:'"Bariatric surgery doesn\u2019t just change weight — it rewrites the metabolic, cardiovascular and oncologic story of the patient."',
      bullet1:'OS-MRS · EOSS · Caprini risk stratification',
      bullet2:'Procedure-specific %TWL projections',
      bullet3:'Analysis referenced to NEJM, JAMA, Lancet',
      articlesKicker:'Weekly update · PubMed',
      articlesTitle:'Latest in',
      articlesSub:'automatic topic rotation · last 180 days',
      refresh:'Refresh',
      loadingArticles:'Loading recent articles from PubMed…',
      offline:'PubMed is not reachable right now.',
      openPubmed:'Open manual search in PubMed',
      viewPubmed:'View on PubMed',
      societiesKicker:'Quick access',
      societiesTitle:'Global scientific societies',
      societiesSub:'Links to official sites',
      visitSite:'Visit official site',
      journalsKicker:'Evidence',
      journalsTitle:'Leading journals in obesity and metabolism',
      open:'Open',
      trialsKicker:'Trials that changed practice',
      trialsTitle:'Landmark literature in metabolic surgery',
      ctaBannerTitle:'Ready to start the clinical workflow',
      ctaBannerSub:'Pick a module to begin: risk stratification, optimization, follow-up, non-surgical management and more.',
      mod1:'Stratification', mod2:'Optimization', mod3:'Follow-up', mod7:'Dashboard', mod8:'Library',
      week:'Week',
      language:'Language',
      banners: [
        { eyebrow:'Welcome',    title:'Comprehensive bariatric care',            sub:'From first contact to one-year post-op, with structured follow-up.' },
        { eyebrow:'Evidence',   title:'Guided by world-class literature',         sub:'STAMPEDE, SM-BOSS, SLEEVEPASS, SOS: decisions anchored in landmark trials.' },
        { eyebrow:'Technology', title:'Clinical intelligence in every visit',     sub:'Stratification, projections and executive analytics in one platform.' },
        { eyebrow:'Warmth',     title:'A multidisciplinary team for you',         sub:'Surgery, anesthesia, nutrition, endocrinology, psychology and cardiology.' }
      ]
    },
    pt: {
      brand:'Clínica de Obesidade e Metabólica',
      byAvante:'by Avante',
      updateBadge:'Atualização semanal',
      focus:'Foco',
      heroTitle1:'Ciência global. Cuidado pessoal.',
      heroTitle2:'Excelência bariátrica e metabólica.',
      heroIntro:'Plataforma clínica integral que conecta a evidência publicada nas revistas mais prestigiadas do mundo com a tomada de decisão na consulta: estratificação de risco, otimização, seguimento e análise executiva.',
      ctaStart:'Iniciar estratificação',
      ctaPubmed:'Pesquisar no PubMed',
      kpi1:'pessoas vivem com obesidade no mundo',
      kpi2:'adultos com obesidade (OMS)',
      kpi3:'%TWL médio pós-bariátrico em 12m',
      kpi4:'remissão de DM2 pós-RYGB em 1 ano',
      epidemiaTitle:'Projeção global da obesidade',
      epidemiaSub:'Prevalência estimada em adultos e crianças · fonte: World Obesity Atlas / OMS',
      epidAdultos:'Adultos com obesidade (%)',
      epidNinos:'Crianças/adolescentes (%)',
      epidAxis:'Prevalência (%)',
      motto:'Criamos e inovamos para cuidar de você',
      quote:'"A cirurgia bariátrica não muda só o peso — reescreve a história metabólica, cardiovascular e oncológica do paciente."',
      bullet1:'Estratificação OS-MRS · EOSS · Caprini',
      bullet2:'Projeção de %TWL por procedimento',
      bullet3:'Análise com referências de NEJM, JAMA, Lancet',
      articlesKicker:'Atualização semanal · PubMed',
      articlesTitle:'Mais recente em',
      articlesSub:'rotação temática automática · últimos 180 dias',
      refresh:'Atualizar',
      loadingArticles:'Carregando artigos recentes do PubMed…',
      offline:'PubMed indisponível no momento.',
      openPubmed:'Abrir busca manual no PubMed',
      viewPubmed:'Ver no PubMed',
      societiesKicker:'Acesso rápido',
      societiesTitle:'Sociedades científicas mundiais',
      societiesSub:'Links aos sites oficiais',
      visitSite:'Visitar site oficial',
      journalsKicker:'Evidência',
      journalsTitle:'Principais revistas em obesidade e metabolismo',
      open:'Abrir',
      trialsKicker:'Ensaios que mudaram a prática',
      trialsTitle:'Literatura pivô em cirurgia metabólica',
      ctaBannerTitle:'Pronto para iniciar o fluxo clínico',
      ctaBannerSub:'Escolha um módulo para começar: estratificação, otimização, seguimento, manejo não cirúrgico e mais.',
      mod1:'Estratificação', mod2:'Otimização', mod3:'Seguimento', mod7:'Dashboard', mod8:'Biblioteca',
      week:'Semana',
      language:'Idioma',
      banners: [
        { eyebrow:'Bem-vindo',   title:'Cuidado bariátrico integral',        sub:'Do primeiro contato ao ano pós-operatório, com seguimento estruturado.' },
        { eyebrow:'Evidência',   title:'Guiado pela literatura mundial',     sub:'STAMPEDE, SM-BOSS, SLEEVEPASS, SOS: decisões baseadas em ensaios pivô.' },
        { eyebrow:'Tecnologia',  title:'Inteligência clínica em cada consulta', sub:'Estratificação, projeções e análise executiva em uma plataforma.' },
        { eyebrow:'Humanidade',  title:'Equipe multidisciplinar para você',  sub:'Cirurgia, anestesia, nutrição, endocrinologia, psicologia e cardiologia.' }
      ]
    },
    fr: {
      brand:'Clinique de l\u2019Obésité et Métabolique',
      byAvante:'by Avante',
      updateBadge:'Mise à jour hebdomadaire',
      focus:'Thème',
      heroTitle1:'Science mondiale. Soin personnel.',
      heroTitle2:'Excellence bariatrique et métabolique.',
      heroIntro:'Plateforme clinique intégrée qui relie les preuves publiées dans les plus grandes revues du monde à la décision clinique : stratification du risque, optimisation, suivi et analyse exécutive.',
      ctaStart:'Commencer la stratification',
      ctaPubmed:'Rechercher sur PubMed',
      kpi1:'personnes vivent avec l\u2019obésité dans le monde',
      kpi2:'adultes obèses (OMS)',
      kpi3:'%TWL moyen à 12 mois post-bariatrique',
      kpi4:'rémission DT2 après RYGB à 1 an',
      epidemiaTitle:'Projection mondiale de l\u2019obésité',
      epidemiaSub:'Prévalence estimée chez adultes et enfants · source : World Obesity Atlas / OMS',
      epidAdultos:'Adultes obèses (%)',
      epidNinos:'Enfants/adolescents (%)',
      epidAxis:'Prévalence (%)',
      motto:'Nous créons et innovons pour prendre soin de vous',
      quote:'"La chirurgie bariatrique ne change pas seulement le poids — elle réécrit l\u2019histoire métabolique, cardiovasculaire et oncologique du patient."',
      bullet1:'Stratification OS-MRS · EOSS · Caprini',
      bullet2:'Projection %TWL selon la procédure',
      bullet3:'Analyse avec références NEJM, JAMA, Lancet',
      articlesKicker:'Mise à jour hebdomadaire · PubMed',
      articlesTitle:'Actualités en',
      articlesSub:'rotation thématique automatique · 180 derniers jours',
      refresh:'Actualiser',
      loadingArticles:'Chargement d\u2019articles récents depuis PubMed…',
      offline:'PubMed inaccessible en ce moment.',
      openPubmed:'Ouvrir la recherche manuelle sur PubMed',
      viewPubmed:'Voir sur PubMed',
      societiesKicker:'Accès rapide',
      societiesTitle:'Sociétés scientifiques mondiales',
      societiesSub:'Liens vers les sites officiels',
      visitSite:'Visiter le site officiel',
      journalsKicker:'Preuves',
      journalsTitle:'Revues de référence en obésité et métabolisme',
      open:'Ouvrir',
      trialsKicker:'Essais qui ont changé la pratique',
      trialsTitle:'Littérature pivot en chirurgie métabolique',
      ctaBannerTitle:'Prêt à démarrer le parcours clinique',
      ctaBannerSub:'Choisissez un module : stratification, optimisation, suivi, prise en charge non chirurgicale…',
      mod1:'Stratification', mod2:'Optimisation', mod3:'Suivi', mod7:'Tableau de bord', mod8:'Bibliothèque',
      week:'Semaine',
      language:'Langue',
      banners: [
        { eyebrow:'Bienvenue',    title:'Soins bariatriques complets',           sub:'Du premier contact à 1 an post-op, avec suivi structuré.' },
        { eyebrow:'Preuves',      title:'Guidé par la littérature mondiale',     sub:'STAMPEDE, SM-BOSS, SLEEVEPASS, SOS : décisions ancrées dans les essais pivots.' },
        { eyebrow:'Technologie',  title:'Intelligence clinique à chaque visite', sub:'Stratification, projections et analytique exécutive en une plateforme.' },
        { eyebrow:'Humanité',     title:'Une équipe pluridisciplinaire pour vous', sub:'Chirurgie, anesthésie, nutrition, endocrinologie, psychologie, cardiologie.' }
      ]
    },
    it: {
      brand:'Clinica dell\u2019Obesità e Metabolica',
      byAvante:'by Avante',
      updateBadge:'Aggiornamento settimanale',
      focus:'Focus',
      heroTitle1:'Scienza globale. Cura personale.',
      heroTitle2:'Eccellenza bariatrica e metabolica.',
      heroIntro:'Piattaforma clinica integrata che collega l\u2019evidenza pubblicata sulle riviste più prestigiose del mondo con la decisione clinica: stratificazione del rischio, ottimizzazione, follow-up e analisi esecutiva.',
      ctaStart:'Inizia la stratificazione',
      ctaPubmed:'Cerca su PubMed',
      kpi1:'persone vivono con l\u2019obesità nel mondo',
      kpi2:'adulti con obesità (OMS)',
      kpi3:'%TWL medio a 12 mesi post-bariatrico',
      kpi4:'remissione DM2 dopo RYGB a 1 anno',
      epidemiaTitle:'Proiezione globale dell\u2019obesità',
      epidemiaSub:'Prevalenza stimata in adulti e bambini · fonte: World Obesity Atlas / OMS',
      epidAdultos:'Adulti con obesità (%)',
      epidNinos:'Bambini/adolescenti (%)',
      epidAxis:'Prevalenza (%)',
      motto:'Creiamo e innoviamo per prenderci cura di te',
      quote:'"La chirurgia bariatrica non cambia solo il peso — riscrive la storia metabolica, cardiovascolare e oncologica del paziente."',
      bullet1:'Stratificazione OS-MRS · EOSS · Caprini',
      bullet2:'Proiezione %TWL per procedura',
      bullet3:'Analisi con riferimenti NEJM, JAMA, Lancet',
      articlesKicker:'Aggiornamento settimanale · PubMed',
      articlesTitle:'Novità in',
      articlesSub:'rotazione tematica automatica · ultimi 180 giorni',
      refresh:'Aggiorna',
      loadingArticles:'Caricamento articoli recenti da PubMed…',
      offline:'PubMed non raggiungibile al momento.',
      openPubmed:'Apri ricerca manuale su PubMed',
      viewPubmed:'Vedi su PubMed',
      societiesKicker:'Accesso rapido',
      societiesTitle:'Società scientifiche mondiali',
      societiesSub:'Link ai siti ufficiali',
      visitSite:'Visita il sito ufficiale',
      journalsKicker:'Evidenza',
      journalsTitle:'Principali riviste di obesità e metabolismo',
      open:'Apri',
      trialsKicker:'Studi che hanno cambiato la pratica',
      trialsTitle:'Letteratura pivot in chirurgia metabolica',
      ctaBannerTitle:'Pronto a iniziare il percorso clinico',
      ctaBannerSub:'Seleziona un modulo: stratificazione, ottimizzazione, follow-up, gestione non chirurgica e altro.',
      mod1:'Stratificazione', mod2:'Ottimizzazione', mod3:'Follow-up', mod7:'Dashboard', mod8:'Biblioteca',
      week:'Settimana',
      language:'Lingua',
      banners: [
        { eyebrow:'Benvenuto',   title:'Cura bariatrica integrale',          sub:'Dal primo contatto a 1 anno post-op, con follow-up strutturato.' },
        { eyebrow:'Evidenza',    title:'Guidati dalla letteratura mondiale', sub:'STAMPEDE, SM-BOSS, SLEEVEPASS, SOS: decisioni basate su studi pivot.' },
        { eyebrow:'Tecnologia',  title:'Intelligenza clinica in ogni visita',sub:'Stratificazione, proiezioni e analisi esecutiva in un\u2019unica piattaforma.' },
        { eyebrow:'Umanità',     title:'Un team multidisciplinare per te',   sub:'Chirurgia, anestesia, nutrizione, endocrinologia, psicologia e cardiologia.' }
      ]
    },
    de: {
      brand:'Klinik für Adipositas und Stoffwechsel',
      byAvante:'by Avante',
      updateBadge:'Wöchentliches Update',
      focus:'Fokus',
      heroTitle1:'Globale Wissenschaft. Persönliche Versorgung.',
      heroTitle2:'Bariatrische und metabolische Exzellenz.',
      heroIntro:'Integrierte klinische Plattform, die Evidenz aus den weltweit führenden Fachzeitschriften mit der realen Entscheidungsfindung verbindet: Risikostratifizierung, Optimierung, Nachsorge und Management.',
      ctaStart:'Stratifizierung starten',
      ctaPubmed:'PubMed durchsuchen',
      kpi1:'Menschen leben weltweit mit Adipositas',
      kpi2:'Erwachsene mit Adipositas (WHO)',
      kpi3:'durchschnittliches %TWL 12 Monate post-OP',
      kpi4:'T2D-Remission nach RYGB nach 1 Jahr',
      epidemiaTitle:'Globale Adipositas-Prognose',
      epidemiaSub:'Geschätzte Prävalenz bei Erwachsenen und Kindern · Quelle: World Obesity Atlas / WHO',
      epidAdultos:'Erwachsene mit Adipositas (%)',
      epidNinos:'Kinder/Jugendliche (%)',
      epidAxis:'Prävalenz (%)',
      motto:'Wir schaffen und innovieren, um für Sie zu sorgen',
      quote:'"Adipositaschirurgie verändert nicht nur das Gewicht — sie schreibt die metabolische, kardiovaskuläre und onkologische Geschichte des Patienten neu."',
      bullet1:'Risikostratifizierung OS-MRS · EOSS · Caprini',
      bullet2:'%TWL-Projektion je Eingriff',
      bullet3:'Analyse mit Referenzen aus NEJM, JAMA, Lancet',
      articlesKicker:'Wöchentliches Update · PubMed',
      articlesTitle:'Neues zu',
      articlesSub:'automatische Themenrotation · letzte 180 Tage',
      refresh:'Aktualisieren',
      loadingArticles:'Lade aktuelle Artikel von PubMed…',
      offline:'PubMed ist gerade nicht erreichbar.',
      openPubmed:'Manuelle Suche in PubMed öffnen',
      viewPubmed:'Auf PubMed ansehen',
      societiesKicker:'Schnellzugriff',
      societiesTitle:'Wissenschaftliche Fachgesellschaften',
      societiesSub:'Links zu offiziellen Seiten',
      visitSite:'Offizielle Seite besuchen',
      journalsKicker:'Evidenz',
      journalsTitle:'Führende Zeitschriften zu Adipositas und Stoffwechsel',
      open:'Öffnen',
      trialsKicker:'Studien, die die Praxis verändert haben',
      trialsTitle:'Schlüsselliteratur der metabolischen Chirurgie',
      ctaBannerTitle:'Bereit für den klinischen Ablauf',
      ctaBannerSub:'Wählen Sie ein Modul: Stratifizierung, Optimierung, Nachsorge, nicht-chirurgisches Management und mehr.',
      mod1:'Stratifizierung', mod2:'Optimierung', mod3:'Nachsorge', mod7:'Dashboard', mod8:'Bibliothek',
      week:'Woche',
      language:'Sprache',
      banners: [
        { eyebrow:'Willkommen', title:'Umfassende bariatrische Versorgung',      sub:'Vom Erstkontakt bis 1 Jahr postoperativ — strukturierte Nachsorge.' },
        { eyebrow:'Evidenz',    title:'Geleitet von weltweiter Literatur',        sub:'STAMPEDE, SM-BOSS, SLEEVEPASS, SOS — Entscheidungen auf Basis zentraler Studien.' },
        { eyebrow:'Technologie',title:'Klinische Intelligenz bei jedem Besuch',   sub:'Stratifizierung, Projektionen und Executive-Analytik in einer Plattform.' },
        { eyebrow:'Wärme',      title:'Ein multidisziplinäres Team für Sie',     sub:'Chirurgie, Anästhesie, Ernährung, Endokrinologie, Psychologie und Kardiologie.' }
      ]
    }
  };

  function tr(key) {
    const lang = (typeof getIdioma === 'function' ? getIdioma() : 'es') || 'es';
    const dict = HOME_I18N[lang] || HOME_I18N.es;
    return dict[key] !== undefined ? dict[key] : (HOME_I18N.es[key] !== undefined ? HOME_I18N.es[key] : key);
  }

  // ISO-week id (p.ej. "2026-W15") para cachear contenidos semanales
  function semanaISO(d = new Date()) {
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
    return `${tmp.getUTCFullYear()}-W${String(weekNum).padStart(2,'0')}`;
  }

  // Rotación semanal de foco temático (determinística por semana ISO)
  const FOCOS = [
    { q:'bariatric surgery outcomes',           etiqueta:'Resultados quirúrgicos' },
    { q:'metabolic surgery type 2 diabetes',     etiqueta:'Cirugía metabólica · DM2' },
    { q:'GLP-1 receptor agonist obesity',        etiqueta:'GLP-1 en obesidad' },
    { q:'sleeve gastrectomy long term',          etiqueta:'Manga gástrica · largo plazo' },
    { q:'Roux-en-Y gastric bypass',              etiqueta:'RYGB' },
    { q:'obesity cardiovascular risk',           etiqueta:'Obesidad y riesgo CV' },
    { q:'bariatric revision surgery',            etiqueta:'Cirugía de revisión' },
    { q:'tirzepatide obesity',                   etiqueta:'Tirzepatida · obesidad' },
    { q:'non-alcoholic fatty liver bariatric',   etiqueta:'MASLD post-bariátrica' },
    { q:'endoscopic sleeve gastroplasty',        etiqueta:'ESG endoscópica' },
    { q:'obesity pediatric',                     etiqueta:'Obesidad pediátrica' },
    { q:'metabolic syndrome weight loss',        etiqueta:'Síndrome metabólico' }
  ];

  function focoDeLaSemana() {
    const week = semanaISO();
    const n = parseInt(week.split('-W')[1], 10) || 1;
    return FOCOS[n % FOCOS.length];
  }

  // Caché semanal de artículos PubMed vía E-utilities (API pública NCBI con CORS)
  const CACHE_KEY = 'avante_home_semanal';
  const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

  function cargarCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch(e) { return null; }
  }
  function guardarCache(obj) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(obj)); } catch(e) {}
  }

  async function fetchArticulosPubMed(query) {
    const term = encodeURIComponent(query);
    const esearch = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${term}&retmode=json&sort=pub_date&datetype=pdat&reldate=365&retmax=6`;
    const r1 = await fetch(esearch);
    if (!r1.ok) throw new Error('esearch failed: ' + r1.status);
    const d1 = await r1.json();
    const ids = (d1.esearchresult && d1.esearchresult.idlist) || [];
    if (!ids.length) return [];
    const esummary = `${PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const r2 = await fetch(esummary);
    if (!r2.ok) throw new Error('esummary failed: ' + r2.status);
    const d2 = await r2.json();
    const result = d2.result || {};
    return ids.map(id => {
      const a = result[id];
      if (!a) return null;
      const autoresArr = (a.authors || []).slice(0,3).map(x => x.name);
      const autores = autoresArr.join(', ') + ((a.authors||[]).length>3?' et al.':'');
      return {
        id,
        titulo: a.title || '',
        autores,
        revista: a.fulljournalname || a.source || '',
        fecha: a.pubdate || a.epubdate || '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      };
    }).filter(Boolean);
  }

  async function obtenerArticulosSemanales() {
    const week = semanaISO();
    const foco = focoDeLaSemana();
    const cache = cargarCache();
    if (cache && cache.week === week && Array.isArray(cache.items) && cache.items.length) {
      return { items: cache.items, foco, week, desdeCache: true };
    }
    try {
      const items = await fetchArticulosPubMed(foco.q);
      if (items.length) {
        guardarCache({ week, foco, items, ts: Date.now() });
      }
      return { items, foco, week, desdeCache: false };
    } catch (e) {
      if (cache && cache.items) return { items: cache.items, foco, week, desdeCache: true, stale: true };
      return { items: [], foco, week, error: true };
    }
  }

  // Sociedades internacionales — solo dominios raíz verificables
  const SOCIEDADES = [
    {
      nombre: 'IFSO',
      largo: 'International Federation for the Surgery of Obesity and Metabolic Disorders',
      url: 'https://www.ifso.com',
      icon: 'globe',
      color: '#0A1F44',
      desc: 'Federación mundial de cirugía bariátrica y metabólica. Congreso anual, registro global y guías de consenso.'
    },
    {
      nombre: 'World Obesity Federation',
      largo: 'World Obesity Federation',
      url: 'https://www.worldobesity.org',
      icon: 'earth',
      color: '#1A8B9D',
      desc: 'Organización paraguas de la lucha global contra la obesidad. Atlas mundial y Día Mundial de la Obesidad.'
    },
    {
      nombre: 'ASMBS',
      largo: 'American Society for Metabolic and Bariatric Surgery',
      url: 'https://asmbs.org',
      icon: 'flag',
      color: '#C0392B',
      desc: 'Sociedad americana de cirugía bariátrica. Guías clínicas, position statements y acreditación MBSAQIP.'
    },
    {
      nombre: 'The Obesity Society',
      largo: 'The Obesity Society (TOS)',
      url: 'https://www.obesity.org',
      icon: 'users',
      color: '#2D8659',
      desc: 'Sociedad científica multidisciplinaria. Editora de la revista Obesity. ObesityWeek anual.'
    },
    {
      nombre: 'OMA',
      largo: 'Obesity Medicine Association',
      url: 'https://obesitymedicine.org',
      icon: 'pill',
      color: '#C9A961',
      desc: 'Asociación de médicos clínicos de obesidad. Algoritmo OMA de farmacoterapia y nutrición.'
    },
    {
      nombre: 'EASO',
      largo: 'European Association for the Study of Obesity',
      url: 'https://easo.org',
      icon: 'star',
      color: '#0A1F44',
      desc: 'Asociación europea para el estudio de la obesidad. European Congress on Obesity (ECO) y guías EASO.'
    },
    {
      nombre: 'IFSO-LAC',
      largo: 'IFSO Latin American Chapter',
      url: 'https://www.ifso.com',
      icon: 'map',
      color: '#1A8B9D',
      desc: 'Capítulo latinoamericano de IFSO. Educación, registro regional y cooperación entre cirujanos de la región.'
    },
    {
      nombre: 'WHO Obesity',
      largo: 'World Health Organization — Obesity',
      url: 'https://www.who.int',
      icon: 'activity',
      color: '#C0392B',
      desc: 'Plan de acción mundial de la OMS para prevenir y controlar enfermedades no transmisibles, incluyendo obesidad.'
    }
  ];

  // Revistas científicas de alto impacto
  const REVISTAS = [
    { nombre: 'NEJM',              largo: 'New England Journal of Medicine',           url: 'https://www.nejm.org',               color: '#0A1F44' },
    { nombre: 'JAMA',              largo: 'Journal of the American Medical Association', url: 'https://jamanetwork.com',          color: '#C0392B' },
    { nombre: 'The Lancet',        largo: 'The Lancet',                                 url: 'https://www.thelancet.com',          color: '#1A8B9D' },
    { nombre: 'SOARD',             largo: 'Surgery for Obesity and Related Diseases',   url: 'https://www.soard.org',              color: '#2D8659' },
    { nombre: 'Obesity Surgery',   largo: 'Obesity Surgery (Springer)',                 url: 'https://link.springer.com',          color: '#C9A961' },
    { nombre: 'Int. J. Obesity',   largo: 'International Journal of Obesity (Nature)',  url: 'https://www.nature.com',             color: '#0A1F44' },
    { nombre: 'Obesity',           largo: 'Obesity (The Obesity Society journal)',      url: 'https://onlinelibrary.wiley.com',    color: '#1A8B9D' },
    { nombre: 'Obesity Reviews',   largo: 'Obesity Reviews (IASO/WOF)',                 url: 'https://onlinelibrary.wiley.com',    color: '#C9A961' }
  ];

  // Ensayos pivote — con enlace a búsqueda en PubMed (dominio verificado NCBI)
  const ENSAYOS = [
    {
      titulo: 'Bariatric Surgery versus Intensive Medical Therapy for Diabetes — 5-Year Outcomes (STAMPEDE)',
      autores: 'Schauer PR, Bhatt DL, Kirwan JP, et al.',
      revista: 'N Engl J Med · 2017',
      clave: 'RYGB y SG superaron claramente a la terapia médica intensiva en control glucémico a 5 años en DM2.',
      query: 'STAMPEDE Schauer bariatric NEJM 2017'
    },
    {
      titulo: 'Effect of Laparoscopic Sleeve Gastrectomy vs RYGB on Weight Loss at 5 Years (SM-BOSS)',
      autores: 'Peterli R, Wölnerhanssen BK, Peters T, et al.',
      revista: 'JAMA · 2018',
      clave: 'SM-BOSS: manga y RYGB equivalentes en %EBMIL a 5 años; RYGB con mejor control de ERGE.',
      query: 'SM-BOSS Peterli JAMA 2018'
    },
    {
      titulo: 'Laparoscopic Sleeve Gastrectomy vs Gastric Bypass at 10 Years (SLEEVEPASS)',
      autores: 'Salminen P, Grönroos S, Helmiö M, et al.',
      revista: 'JAMA Surg · 2022',
      clave: 'A 10 años, RYGB mantuvo mayor pérdida de peso; ambos con remisión duradera de comorbilidades.',
      query: 'SLEEVEPASS Salminen JAMA Surgery 2022'
    },
    {
      titulo: 'Swedish Obese Subjects (SOS) — Long-term mortality and CV outcomes',
      autores: 'Sjöström L, Narbro K, Sjöström CD, et al.',
      revista: 'N Engl J Med · 2007 / JAMA · 2012',
      clave: 'Estudio SOS: reducción de mortalidad global y eventos CV a largo plazo con cirugía bariátrica.',
      query: 'Swedish Obese Subjects Sjostrom NEJM'
    },
    {
      titulo: 'Metabolic Surgery vs Medical Therapy for Type 2 Diabetes — 10-Year Follow-up',
      autores: 'Mingrone G, Panunzi S, De Gaetano A, et al.',
      revista: 'Lancet · 2021',
      clave: 'A 10 años, la cirugía metabólica mantuvo remisión de DM2 superior al tratamiento médico.',
      query: 'Mingrone metabolic surgery Lancet 2021'
    },
    {
      titulo: 'Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1)',
      autores: 'Jastreboff AM, Aronne LJ, Ahmad NN, et al.',
      revista: 'N Engl J Med · 2022',
      clave: 'Tirzepatida semanal logró ~20% de pérdida de peso en obesidad sin diabetes a 72 semanas.',
      query: 'SURMOUNT-1 tirzepatide Jastreboff NEJM 2022'
    }
  ];

  function pubmedUrl(q) {
    return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`;
  }

  // Estadísticas globales (World Obesity Atlas / WHO — valores redondeados como referencia pública)
  const EPIDEMIA = {
    anios:   [2010, 2015, 2020, 2025, 2030, 2035],
    adultosPct: [12, 13, 14, 16, 17, 18],
    ninosPct:   [6,  7,  8,  9,  10, 11]
  };

  function langSelectorHTML() {
    const cur = (typeof getIdioma === 'function' ? getIdioma() : 'es') || 'es';
    const list = (typeof IDIOMAS_DISPONIBLES !== 'undefined' ? IDIOMAS_DISPONIBLES : [{code:'es',label:'Español',flag:'🇪🇸'}]);
    return `<div class="flex items-center gap-1 flex-wrap justify-end">
      <span class="text-[10px] uppercase tracking-wider text-white/60 mr-1">${escapeHtml(tr('language'))}:</span>
      ${list.map(l => `
        <button data-home-lang="${l.code}"
                class="text-xs px-2 py-1 rounded border flex items-center gap-1"
                style="background:${cur===l.code?C.gold:'rgba(255,255,255,0.08)'}; color:${cur===l.code?C.navy:'white'}; border-color:${cur===l.code?C.gold:'rgba(255,255,255,0.25)'};"
                title="${escapeHtml(l.label)}">
          <span>${l.flag}</span><span class="hidden md:inline">${escapeHtml(l.label)}</span>
        </button>
      `).join('')}
    </div>`;
  }

  // Fotografías del banner. El usuario puede colocar sus propias imágenes en
  // proyectos/avante/assets/images/banner/ con los nombres 1.jpg … 6.jpg.
  // Si no existen, cada slide cae al degradado de marca automáticamente.
  const BANNER_IMAGES = [
    'assets/images/banner/1.jpg',
    'assets/images/banner/2.jpg',
    'assets/images/banner/3.jpg',
    'assets/images/banner/4.jpg',
    'assets/images/banner/5.jpg',
    'assets/images/banner/6.jpg'
  ];

  function bannerHTML() {
    const banners = tr('banners') || [];
    return `<section class="relative overflow-hidden" style="background:${C.navy};">
      <div id="home-banner" class="relative" style="height:320px;">
        ${banners.map((b, i) => {
          const img = BANNER_IMAGES[i % BANNER_IMAGES.length];
          const gradFallback = `linear-gradient(115deg, ${i%2===0?C.navy:'#132a5c'} 0%, ${i%2===0?C.teal:C.gold} 120%)`;
          return `
          <div class="home-banner-slide absolute inset-0 transition-opacity duration-700"
               data-banner-idx="${i}"
               style="opacity:${i === _bannerIdx ? 1 : 0}; pointer-events:${i === _bannerIdx ? 'auto' : 'none'};
                      background:${gradFallback};">
            <img src="${img}" alt=""
                 onerror="this.style.display='none'"
                 style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center;">
            <div class="absolute inset-0" style="background:linear-gradient(90deg, rgba(10,31,68,0.88) 0%, rgba(10,31,68,0.65) 45%, rgba(10,31,68,0.25) 100%);"></div>
            <div class="relative max-w-6xl mx-auto px-6 h-full flex items-center">
              <div class="max-w-3xl text-white">
                <div class="text-[11px] uppercase tracking-widest mb-2" style="color:${C.gold};">${escapeHtml(b.eyebrow)}</div>
                <div class="text-2xl md:text-4xl font-bold leading-tight mb-2" style="font-family:'Cormorant Garamond',Georgia,serif;">
                  ${escapeHtml(b.title)}
                </div>
                <div class="text-sm md:text-base text-white/90 max-w-2xl leading-snug">${escapeHtml(b.sub)}</div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-10">
        ${banners.map((_, i) => `
          <button data-banner-dot="${i}" class="rounded-full transition-all"
                  style="width:${i===_bannerIdx?'24px':'8px'}; height:8px; background:${i===_bannerIdx?C.gold:'rgba(255,255,255,0.4)'};"></button>
        `).join('')}
      </div>
      <button data-banner-nav="prev" class="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full z-10"
              style="background:rgba(255,255,255,0.12); color:white;" aria-label="prev">
        <i data-lucide="chevron-left" class="w-4 h-4"></i>
      </button>
      <button data-banner-nav="next" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full z-10"
              style="background:rgba(255,255,255,0.12); color:white;" aria-label="next">
        <i data-lucide="chevron-right" class="w-4 h-4"></i>
      </button>
    </section>`;
  }

  function render(container) {
    destroyCharts();
    detenerBanner();

    const focoLoc = focoDeLaSemana();
    const semana = semanaISO();

    container.innerHTML = `
      <div class="min-h-screen" style="background:linear-gradient(180deg, ${C.cream} 0%, #ffffff 100%);">

        ${bannerHTML()}

        <!-- HERO -->
        <section class="relative overflow-hidden" style="background:linear-gradient(135deg, ${C.navy} 0%, #132a5c 60%, ${C.teal} 100%); color:white;">
          <div class="max-w-6xl mx-auto px-6 py-12 relative">
            <div class="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <div class="flex items-center gap-3">
                <div class="brand-mark" style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.25); border-radius:12px; padding:10px;">
                  <i data-lucide="heart-pulse" class="w-6 h-6"></i>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-widest" style="color:${C.gold};">${escapeHtml(tr('brand'))}</div>
                  <div class="text-sm italic" style="font-family:'Cormorant Garamond',Georgia,serif;">${escapeHtml(tr('byAvante'))}</div>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2">
                ${langSelectorHTML()}
                <div class="text-right">
                  <div class="text-[10px] uppercase tracking-wider text-white/60">${escapeHtml(tr('updateBadge'))}</div>
                  <div class="text-xs font-bold" style="color:${C.gold};">
                    <i data-lucide="calendar-clock" class="w-3 h-3 inline"></i>
                    ${escapeHtml(tr('week'))} ${semana} · ${escapeHtml(tr('focus'))}: ${escapeHtml(focoLoc.etiqueta)}
                  </div>
                </div>
              </div>
            </div>
            <h1 class="text-3xl md:text-5xl font-bold leading-tight mb-3" style="font-family:'Cormorant Garamond',Georgia,serif;">
              ${escapeHtml(tr('heroTitle1'))}<br>
              <span style="color:${C.gold};">${escapeHtml(tr('heroTitle2'))}</span>
            </h1>
            <p class="text-white/80 max-w-2xl mb-6 text-sm md:text-base">${escapeHtml(tr('heroIntro'))}</p>
            <div class="flex flex-wrap gap-3">
              <button id="home-start" class="btn font-bold flex items-center gap-2" style="background:${C.gold}; color:${C.navy};">
                <i data-lucide="stethoscope" class="w-4 h-4"></i> ${escapeHtml(tr('ctaStart'))}
              </button>
              <a href="https://pubmed.ncbi.nlm.nih.gov/?term=bariatric+surgery" target="_blank" rel="noopener"
                 class="btn flex items-center gap-2" style="background:rgba(255,255,255,0.12); color:white; border:1px solid rgba(255,255,255,0.3);">
                <i data-lucide="search" class="w-4 h-4"></i> ${escapeHtml(tr('ctaPubmed'))}
              </a>
            </div>

            <!-- KPIs globales -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              ${[
                { v:'1/8',    l:tr('kpi1') },
                { v:'~650 M', l:tr('kpi2') },
                { v:'30%',    l:tr('kpi3') },
                { v:'>80%',   l:tr('kpi4') }
              ].map(k => `
                <div class="p-3 rounded" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.18);">
                  <div class="text-2xl font-bold" style="color:${C.gold};">${k.v}</div>
                  <div class="text-[11px] text-white/75 leading-tight mt-1">${escapeHtml(k.l)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- EPIDEMIA CHART -->
        <section class="max-w-6xl mx-auto px-6 py-10">
          <div class="grid md:grid-cols-3 gap-6">
            <div class="md:col-span-2 p-5 rounded-lg shadow bg-white border" style="border-color:#e5e7eb;">
              <div class="flex items-center gap-2 mb-1">
                <i data-lucide="trending-up" class="w-4 h-4" style="color:${C.teal};"></i>
                <h2 class="text-lg font-bold" style="color:${C.navy}; font-family:Georgia,serif;">${escapeHtml(tr('epidemiaTitle'))}</h2>
              </div>
              <p class="text-xs text-gray-500 mb-3">${escapeHtml(tr('epidemiaSub'))}</p>
              <div style="position:relative; height:260px;">
                <canvas id="chart-epidemia"></canvas>
              </div>
            </div>
            <div class="p-5 rounded-lg shadow text-white" style="background:linear-gradient(135deg, ${C.teal} 0%, ${C.navy} 100%);">
              <div class="flex items-center gap-2 mb-2">
                <i data-lucide="quote" class="w-4 h-4" style="color:${C.gold};"></i>
                <h2 class="text-lg font-bold" style="font-family:'Cormorant Garamond',Georgia,serif;">${escapeHtml(tr('motto'))}</h2>
              </div>
              <p class="text-sm text-white/85 leading-relaxed italic mb-4" style="font-family:'Cormorant Garamond',Georgia,serif;">
                ${escapeHtml(tr('quote'))}
              </p>
              <ul class="space-y-2 text-xs text-white/80">
                <li class="flex gap-2"><i data-lucide="check" class="w-3.5 h-3.5 mt-0.5" style="color:${C.gold};"></i> ${escapeHtml(tr('bullet1'))}</li>
                <li class="flex gap-2"><i data-lucide="check" class="w-3.5 h-3.5 mt-0.5" style="color:${C.gold};"></i> ${escapeHtml(tr('bullet2'))}</li>
                <li class="flex gap-2"><i data-lucide="check" class="w-3.5 h-3.5 mt-0.5" style="color:${C.gold};"></i> ${escapeHtml(tr('bullet3'))}</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- ARTÍCULOS SEMANALES (PubMed) -->
        <section class="max-w-6xl mx-auto px-6 pb-10">
          <div class="flex items-end justify-between mb-4 flex-wrap gap-2">
            <div>
              <div class="text-xs uppercase tracking-widest" style="color:${C.teal};">${escapeHtml(tr('articlesKicker'))}</div>
              <h2 class="text-2xl font-bold" style="color:${C.navy}; font-family:'Cormorant Garamond',Georgia,serif;">
                ${escapeHtml(tr('articlesTitle'))} ${escapeHtml(focoLoc.etiqueta)}
              </h2>
              <div class="text-xs text-gray-500">${escapeHtml(tr('week'))} ${semana} · ${escapeHtml(tr('articlesSub'))}</div>
            </div>
            <button id="home-refresh" class="btn text-xs flex items-center gap-1" style="background:${C.teal}; color:white;">
              <i data-lucide="refresh-cw" class="w-3 h-3"></i> ${escapeHtml(tr('refresh'))}
            </button>
          </div>
          <div id="home-articulos" class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div class="p-6 rounded-lg bg-white border text-center text-sm text-gray-500" style="border-color:#e5e7eb;">
              <i data-lucide="loader" class="w-5 h-5 mx-auto mb-2" style="color:${C.teal};"></i>
              ${escapeHtml(tr('loadingArticles'))}
            </div>
          </div>
        </section>

        <!-- SOCIEDADES -->
        <section class="max-w-6xl mx-auto px-6 pb-10">
          <div class="flex items-end justify-between mb-4">
            <div>
              <div class="text-xs uppercase tracking-widest" style="color:${C.teal};">${escapeHtml(tr('societiesKicker'))}</div>
              <h2 class="text-2xl font-bold" style="color:${C.navy}; font-family:'Cormorant Garamond',Georgia,serif;">${escapeHtml(tr('societiesTitle'))}</h2>
            </div>
            <div class="text-xs text-gray-500 hidden md:block">${escapeHtml(tr('societiesSub'))}</div>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${SOCIEDADES.map(s => `
              <a href="${s.url}" target="_blank" rel="noopener"
                 class="block p-4 rounded-lg shadow bg-white border hover:shadow-lg transition-shadow"
                 style="border-color:#e5e7eb;">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:${s.color}15; color:${s.color};">
                    <i data-lucide="${s.icon}" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(s.nombre)}</div>
                    <div class="text-[10px] text-gray-500 leading-tight">${escapeHtml(s.largo)}</div>
                  </div>
                </div>
                <p class="text-xs text-gray-600 leading-snug">${escapeHtml(s.desc)}</p>
                <div class="text-[11px] mt-2 flex items-center gap-1" style="color:${s.color};">
                  ${escapeHtml(tr('visitSite'))} <i data-lucide="external-link" class="w-3 h-3"></i>
                </div>
              </a>
            `).join('')}
          </div>
        </section>

        <!-- REVISTAS -->
        <section class="max-w-6xl mx-auto px-6 pb-10">
          <div class="flex items-end justify-between mb-4">
            <div>
              <div class="text-xs uppercase tracking-widest" style="color:${C.teal};">${escapeHtml(tr('journalsKicker'))}</div>
              <h2 class="text-2xl font-bold" style="color:${C.navy}; font-family:'Cormorant Garamond',Georgia,serif;">${escapeHtml(tr('journalsTitle'))}</h2>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            ${REVISTAS.map(r => `
              <a href="${r.url}" target="_blank" rel="noopener"
                 class="block p-3 rounded-lg border hover:shadow transition-shadow bg-white"
                 style="border-color:#e5e7eb; border-left:4px solid ${r.color};">
                <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(r.nombre)}</div>
                <div class="text-[10px] text-gray-500 leading-tight mt-0.5">${escapeHtml(r.largo)}</div>
                <div class="text-[11px] mt-2 flex items-center gap-1" style="color:${r.color};">
                  ${escapeHtml(tr('open'))} <i data-lucide="external-link" class="w-3 h-3"></i>
                </div>
              </a>
            `).join('')}
          </div>
        </section>

        <!-- ENSAYOS PIVOTE -->
        <section class="max-w-6xl mx-auto px-6 pb-12">
          <div class="flex items-end justify-between mb-4">
            <div>
              <div class="text-xs uppercase tracking-widest" style="color:${C.teal};">${escapeHtml(tr('trialsKicker'))}</div>
              <h2 class="text-2xl font-bold" style="color:${C.navy}; font-family:'Cormorant Garamond',Georgia,serif;">${escapeHtml(tr('trialsTitle'))}</h2>
            </div>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            ${ENSAYOS.map(e => `
              <div class="p-4 rounded-lg bg-white shadow border" style="border-color:#e5e7eb; border-top:3px solid ${C.gold};">
                <div class="text-[10px] uppercase tracking-wider" style="color:${C.teal};">${escapeHtml(e.revista)}</div>
                <div class="font-bold text-sm mt-1 leading-snug" style="color:${C.navy};">${escapeHtml(e.titulo)}</div>
                <div class="text-[11px] italic text-gray-500 mt-1">${escapeHtml(e.autores)}</div>
                <p class="text-xs text-gray-700 mt-2 leading-snug">${escapeHtml(e.clave)}</p>
                <a href="${pubmedUrl(e.query)}" target="_blank" rel="noopener"
                   class="text-[11px] mt-2 inline-flex items-center gap-1 font-medium" style="color:${C.teal};">
                  <i data-lucide="search" class="w-3 h-3"></i> ${escapeHtml(tr('openPubmed'))}
                </a>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- CTA -->
        <section class="max-w-6xl mx-auto px-6 pb-12">
          <div class="rounded-lg p-6 text-center" style="background:${C.navy}; color:white;">
            <h3 class="text-xl font-bold mb-2" style="font-family:'Cormorant Garamond',Georgia,serif; color:${C.gold};">
              ${escapeHtml(tr('ctaBannerTitle'))}
            </h3>
            <p class="text-sm text-white/80 mb-4">${escapeHtml(tr('ctaBannerSub'))}</p>
            <div class="flex flex-wrap justify-center gap-2">
              ${[
                { id:1, l:tr('mod1') },
                { id:2, l:tr('mod2') },
                { id:3, l:tr('mod3') },
                { id:7, l:tr('mod7') },
                { id:8, l:tr('mod8') }
              ].map(m => `
                <button data-ir-modulo="${m.id}" class="btn text-xs font-bold"
                        style="background:rgba(255,255,255,0.1); color:white; border:1px solid rgba(255,255,255,0.3);">
                  ${m.id} · ${escapeHtml(m.l)}
                </button>
              `).join('')}
            </div>
          </div>
        </section>

      </div>
    `;

    wire(container);
    refrescarIconos();
    setTimeout(initEpidemiaChart, 0);
  }

  function wire(container) {
    const start = container.querySelector('#home-start');
    if (start) start.addEventListener('click', () => irAModulo(1));
    container.querySelectorAll('[data-ir-modulo]').forEach(b => {
      b.addEventListener('click', () => irAModulo(parseInt(b.dataset.irModulo)));
    });
    const refresh = container.querySelector('#home-refresh');
    if (refresh) refresh.addEventListener('click', async () => {
      try { localStorage.removeItem(CACHE_KEY); } catch(e) {}
      const target = container.querySelector('#home-articulos');
      if (target) {
        target.innerHTML = `<div class="md:col-span-2 lg:col-span-3 p-6 rounded-lg bg-white border text-center text-sm text-gray-500" style="border-color:#e5e7eb;">
          <i data-lucide="loader" class="w-5 h-5 mx-auto mb-2" style="color:${C.teal};"></i>
          ${escapeHtml(tr('loadingArticles'))}
        </div>`;
        refrescarIconos();
      }
      await cargarArticulosEnUI(container);
    });

    // Selector de idioma
    container.querySelectorAll('[data-home-lang]').forEach(b => {
      b.addEventListener('click', () => {
        if (typeof setIdioma === 'function') setIdioma(b.dataset.homeLang);
        _bannerIdx = 0;
        render(container);
      });
    });

    // Banner: dots, prev/next y auto-play
    const banners = tr('banners') || [];
    const total = banners.length;
    function mostrarSlide(i) {
      _bannerIdx = ((i % total) + total) % total;
      const slides = container.querySelectorAll('.home-banner-slide');
      slides.forEach((el, idx) => {
        el.style.opacity = idx === _bannerIdx ? 1 : 0;
        el.style.pointerEvents = idx === _bannerIdx ? 'auto' : 'none';
      });
      const dots = container.querySelectorAll('[data-banner-dot]');
      dots.forEach((d, idx) => {
        d.style.width = idx === _bannerIdx ? '24px' : '8px';
        d.style.background = idx === _bannerIdx ? C.gold : 'rgba(255,255,255,0.4)';
      });
    }
    container.querySelectorAll('[data-banner-dot]').forEach(d => {
      d.addEventListener('click', () => { mostrarSlide(parseInt(d.dataset.bannerDot)); reiniciarTimer(); });
    });
    container.querySelectorAll('[data-banner-nav]').forEach(b => {
      b.addEventListener('click', () => {
        mostrarSlide(_bannerIdx + (b.dataset.bannerNav === 'next' ? 1 : -1));
        reiniciarTimer();
      });
    });
    function reiniciarTimer() {
      detenerBanner();
      if (total > 1) _bannerTimer = setInterval(() => mostrarSlide(_bannerIdx + 1), 6000);
    }
    reiniciarTimer();

    cargarArticulosEnUI(container);
  }

  function articulosHTML(data) {
    if (data.error || !data.items.length) {
      const foco = data.foco || focoDeLaSemana();
      const pubmedUrlFoco = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(foco.q)}&sort=date`;
      return `<div class="md:col-span-2 lg:col-span-3 p-5 rounded-lg bg-white border text-center text-sm" style="border-color:#e5e7eb;">
        <i data-lucide="wifi-off" class="w-5 h-5 mx-auto mb-2" style="color:${C.red};"></i>
        <div class="text-gray-600">${escapeHtml(tr('offline'))}</div>
        <a href="${pubmedUrlFoco}" target="_blank" rel="noopener" class="text-xs mt-2 inline-flex items-center gap-1" style="color:${C.teal};">
          ${escapeHtml(tr('openPubmed'))} <i data-lucide="external-link" class="w-3 h-3"></i>
        </a>
      </div>`;
    }
    return data.items.map(a => `
      <a href="${a.url}" target="_blank" rel="noopener"
         class="block p-4 rounded-lg bg-white border hover:shadow-lg transition-shadow"
         style="border-color:#e5e7eb; border-top:3px solid ${C.teal};">
        <div class="text-[10px] uppercase tracking-wider" style="color:${C.teal};">${escapeHtml(a.revista)} · ${escapeHtml(a.fecha)}</div>
        <div class="font-bold text-sm mt-1 leading-snug" style="color:${C.navy};">${escapeHtml(a.titulo)}</div>
        <div class="text-[11px] italic text-gray-500 mt-1">${escapeHtml(a.autores)}</div>
        <div class="text-[11px] mt-2 flex items-center gap-1" style="color:${C.teal};">
          ${escapeHtml(tr('viewPubmed'))} <i data-lucide="external-link" class="w-3 h-3"></i>
        </div>
      </a>
    `).join('');
  }

  async function cargarArticulosEnUI(container) {
    const target = container.querySelector('#home-articulos');
    if (!target) return;
    try {
      const data = await obtenerArticulosSemanales();
      target.innerHTML = articulosHTML(data);
    } catch (e) {
      console.error('[Avante Home] Error cargando artículos:', e);
      target.innerHTML = articulosHTML({ error:true, items:[], foco: focoDeLaSemana() });
    }
    refrescarIconos();
  }

  function irAModulo(id) {
    if (typeof window.setModuloActivo === 'function') {
      window.setModuloActivo(id);
    }
  }

  function initEpidemiaChart() {
    const canvas = document.getElementById('chart-epidemia');
    if (!canvas || typeof Chart === 'undefined') return;
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: EPIDEMIA.anios,
        datasets: [
          {
            label: tr('epidAdultos'),
            data: EPIDEMIA.adultosPct,
            borderColor: C.teal,
            backgroundColor: 'rgba(26,139,157,0.15)',
            fill: true,
            tension: 0.3
          },
          {
            label: tr('epidNinos'),
            data: EPIDEMIA.ninosPct,
            borderColor: C.gold,
            backgroundColor: 'rgba(201,169,97,0.15)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: { display: true, text: tr('epidAxis') },
            beginAtZero: true
          }
        },
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
    _charts.push(chart);
  }

  return {
    render(container) { render(container); }
  };
})();
