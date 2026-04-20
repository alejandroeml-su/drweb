// ============================================================
// Módulo 5 · Plástica · Poblaciones · Calidad · Documentación
// ============================================================

window.AvanteModulo5 = (function () {

  const state = {
    modo:'clinico', pacientes:[], seleccionado:null, tab:'plastica', tipoDoc:'notaop',
    // Borradores editables de documentos por paciente (no persistidos)
    notaOp: {},
    alta: {}
  };
  let containerRef = null;

  function cargar() { state.pacientes = storageGet('avante_pacientes') || []; }

  const ADYUVANTES_TRANSOP = [
    { k:'tap',         l:'TAP block bilateral guiado por ultrasonido' },
    { k:'autonomico',  l:'Bloqueo visceral autonómico transoperatorio (su técnica)' },
    { k:'hemostasia',  l:'Hemostasia meticulosa verificada con lavado' },
    { k:'fuga_azul',   l:'Test de fuga con azul de metileno' },
    { k:'fuga_aire',   l:'Test de fuga con aire (inmersión)' },
    { k:'refuerzo',    l:'Refuerzo de línea de engrapado (oversewing / sellantes)' },
    { k:'cierre_mes',  l:'Cierre de defectos mesentéricos (RYGB/OAGB)' }
  ];

  function notaOpDefault(p) {
    return {
      fecha: new Date().toLocaleDateString('es-SV'),
      diagnostico: `Obesidad clase ${imc(p) >= 40 ? 'III' : imc(p) >= 35 ? 'II' : 'I'}${p.comorbilidades && p.comorbilidades.dm ? ' + DM2' : ''}${p.comorbilidades && p.comorbilidades.hta ? ' + HTA' : ''}`,
      procedimiento: PROCS[p.procedimiento] || '',
      hallazgos: '- Acceso laparoscópico, neumoperitoneo a 15 mmHg\n- Anatomía: \n- Hígado: ',
      tecnica: '',
      adyuvantes: { tap:true, autonomico:true, hemostasia:true, fuga_azul:false, fuga_aire:false, refuerzo:false, cierre_mes:false },
      sangrado: '',
      tiempo: '',
      drenaje: 'No',
      complicaciones: 'Ninguna',
      plan: `- Profilaxis TEV: HBPM
- IBP postoperatorio
- Inicio de líquidos claros a las 6h si tolerancia
- Movilización temprana`
    };
  }

  function getNotaOp(p) {
    if (!state.notaOp[p.id]) state.notaOp[p.id] = notaOpDefault(p);
    if (!state.notaOp[p.id].adyuvantes) {
      state.notaOp[p.id].adyuvantes = notaOpDefault(p).adyuvantes;
    }
    return state.notaOp[p.id];
  }

  function altaDefault(p) {
    return {
      fecha: new Date().toLocaleDateString('es-SV'),
      observaciones: '',
      indicacionesExtra: ''
    };
  }
  function getAlta(p) {
    if (!state.alta[p.id]) state.alta[p.id] = altaDefault(p);
    return state.alta[p.id];
  }

  function evaluarPlastica(p) {
    const i = imc(p);
    const elegible = i < 32;
    const items = [
      { criterio:'Peso estable',               cumple:'Pendiente registro',              det:'Estabilidad ponderal ≥6 meses (variación <5%)' },
      { criterio:'Tiempo desde cirugía bariátrica', cumple:'≥18 meses recomendado',       det:'Permite resolución de pérdida activa y estabilización metabólica' },
      { criterio:'IMC actual',                 cumple: i < 32 ? '✓ Elegible (<32)' : '⚠ Aún elevado', det:'IMC <30-32 ideal para resultados óptimos y menor riesgo' },
      { criterio:'Estado nutricional',         cumple:'Verificar laboratorios',          det:'Albúmina >3.5, hemoglobina >12, sin déficits de micronutrientes' },
      { criterio:'No tabaquismo',              cumple:'Verificar',                       det:'Cesación ≥6 semanas obligatoria por riesgo de necrosis cutánea' },
      { criterio:'Salud psicológica',          cumple:'Evaluar',                         det:'Expectativas realistas, sin trastorno dismórfico activo' }
    ];
    return { elegible, items };
  }

  const SECUENCIA_PLASTICA = [
    { orden:1, proc:'Abdominoplastia / Bodylift inferior', tiempo:'18-24m post-bariátrica', det:'Primer procedimiento típico. Resección de delantal abdominal, reconstrucción de pared. Bodylift circunferencial si flacidez glútea/muslos.' },
    { orden:2, proc:'Mamoplastia / Mastopexia (mujeres) o Ginecomastia (hombres)', tiempo:'+3-6m del primero', det:'Reconstrucción mamaria con o sin implante. En hombres: resección glandular y cutánea.' },
    { orden:3, proc:'Braquioplastia + Cruroplastia', tiempo:'+3-6m', det:'Brazos y muslos. A menudo combinables. Cicatriz visible → manejar expectativas.' },
    { orden:4, proc:'Lifting facial / cervical', tiempo:'Opcional, último', det:'En pacientes con flacidez facial significativa post-pérdida ponderal masiva.' }
  ];

  function poblacionEspecial(p) {
    const items = []; const e = parseFloat(p.edad) || 0; const i = imc(p);
    if (e < 18) items.push({ grupo:'Adolescente', consid:['IMC ≥35 con comorbilidad mayor o ≥40','Madurez esquelética (Tanner ≥4)','Consentimiento informado familiar','Manga gástrica preferida (Teen-LABS)','Adherencia al seguimiento crítica','Soporte multidisciplinario obligatorio (pediatría, endocrino, psicología)'] });
    if (e >= 65) items.push({ grupo:'Adulto mayor (≥65a)', consid:['Evaluación cardiopulmonar exhaustiva','Valoración geriátrica integral','Manga gástrica generalmente preferida (menor morbilidad)','Mayor riesgo de complicaciones → consentimiento detallado','Beneficio metabólico bien documentado','Sarcopenia: monitoreo proteico estricto'] });
    if (p.sexo === 'F' && e >= 18 && e <= 45) items.push({ grupo:'Mujer en edad fértil', consid:['Anticoncepción efectiva 12-18m post-cirugía','Embarazo desaconsejado primer año','Consejería preconcepcional','Suplementación reforzada si embarazo (folato, hierro, B12)','RYGB: vigilar dumping en embarazo','Parto: comunicar al obstetra historia bariátrica'] });
    if (i >= 30 && i < 35) items.push({ grupo:'Cirugía metabólica (IMC 30-34.9)', consid:['Indicación: DM2 no controlada con tratamiento óptimo','Criterios IFSO/ADA 2022','RYGB u OAGB preferidos por efecto incretínico','Objetivo: remisión metabólica, no solo pérdida ponderal','Seguimiento metabólico estricto'] });
    if (items.length === 0) items.push({ grupo:'Población general', consid:['Sin consideraciones especiales por edad/sexo/IMC','Aplicar protocolo estándar de los Módulos 1-4'] });
    return items;
  }

  // KPIs con valores institucionales (editables en localStorage · demo).
  // mejorMenor=true: objetivo descendente (mortalidad, fuga, TEV, etc.)
  // mejorMenor=false: objetivo ascendente (%PEP, remisión, adherencia, PROMs)
  const KPIS_DEFAULT = [
    { id:'mort30',  k:'Mortalidad ≤30 días',       meta:0.3, actual:0.08, unidad:'%', mejorMenor:true,  cat:'Seguridad' },
    { id:'mort90',  k:'Mortalidad ≤90 días',       meta:0.5, actual:0.15, unidad:'%', mejorMenor:true,  cat:'Seguridad' },
    { id:'reint',   k:'Reintervención ≤30 días',   meta:3,   actual:1.2,  unidad:'%', mejorMenor:true,  cat:'Seguridad' },
    { id:'fuga',    k:'Fuga anastomótica',         meta:1,   actual:0.4,  unidad:'%', mejorMenor:true,  cat:'Seguridad' },
    { id:'tev',     k:'TEV sintomática',           meta:0.5, actual:0.12, unidad:'%', mejorMenor:true,  cat:'Seguridad' },
    { id:'reing',   k:'Reingreso ≤30 días',        meta:5,   actual:2.1,  unidad:'%', mejorMenor:true,  cat:'Calidad' },
    { id:'los',     k:'Estancia hospitalaria',     meta:2,   actual:1.8,  unidad:'d', mejorMenor:true,  cat:'Eficiencia' },
    { id:'adher',   k:'Adherencia seguimiento 12m',meta:70,  actual:82,   unidad:'%', mejorMenor:false, cat:'Calidad' },
    { id:'pep',     k:'%PEP a 12m',                meta:50,  actual:68,   unidad:'%', mejorMenor:false, cat:'Outcomes' },
    { id:'ptp',     k:'%PTP a 12m',                meta:25,  actual:31,   unidad:'%', mejorMenor:false, cat:'Outcomes' },
    { id:'rdm',     k:'Remisión DM2 a 12m',        meta:60,  actual:74,   unidad:'%', mejorMenor:false, cat:'Outcomes metabólicos' },
    { id:'rhta',    k:'Resolución HTA a 12m',      meta:60,  actual:69,   unidad:'%', mejorMenor:false, cat:'Outcomes metabólicos' },
    { id:'baros',   k:'BAROS bueno-excelente',     meta:80,  actual:89,   unidad:'%', mejorMenor:false, cat:'PROMs' }
  ];

  function getKPIs() {
    const guardados = storageGet('avante_kpis_calidad');
    if (guardados && Array.isArray(guardados) && guardados.length) {
      return KPIS_DEFAULT.map(d => {
        const s = guardados.find(x => x.id === d.id);
        return s ? { ...d, actual: s.actual } : d;
      });
    }
    return KPIS_DEFAULT;
  }
  function setKPIs(arr) { storageSet('avante_kpis_calidad', arr.map(x => ({ id:x.id, actual:x.actual }))); }

  function cumplimiento(k) {
    const m = Number(k.meta), a = Number(k.actual);
    if (!isFinite(a) || !isFinite(m) || m === 0) return 0;
    if (k.mejorMenor) {
      if (a <= m) return 100;
      return Math.max(0, Math.round(100 - ((a - m) / m) * 100));
    }
    return Math.min(150, Math.round((a / m) * 100));
  }

  function categoriaScore(kpis, cat) {
    const items = kpis.filter(k => k.cat === cat);
    if (!items.length) return 0;
    return Math.round(items.reduce((acc, k) => acc + Math.min(100, cumplimiento(k)), 0) / items.length);
  }

  function scoreGlobal(kpis) {
    return Math.round(kpis.reduce((acc, k) => acc + Math.min(100, cumplimiento(k)), 0) / kpis.length);
  }

  // Serie simulada (12 meses) — complicaciones totales por mes (demo institucional)
  const TENDENCIA_MESES = ['Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic','Ene','Feb','Mar'];
  const TENDENCIA_COMPL = [4.8, 4.2, 3.9, 3.6, 3.4, 3.1, 2.9, 2.6, 2.4, 2.2, 2.0, 1.9];
  const TENDENCIA_VOLUM = [18, 21, 24, 22, 27, 25, 29, 31, 28, 33, 35, 34];

  let _charts = [];
  function destroyCharts() {
    _charts.forEach(c => { try { c.destroy(); } catch(e){} });
    _charts = [];
  }

  function notaOpSecciones(p, n) {
    const ady = n.adyuvantes || {};
    const adyTxt = ADYUVANTES_TRANSOP
      .map(a => `${ady[a.k] ? '[✓]' : '[ ]'} ${a.l}`)
      .join('\n');
    const tecnicaTxt = (n.tecnica || '—') + '\n\nAdyuvantes transoperatorios:\n' + adyTxt;
    return [
      { titulo:'Datos del procedimiento',
        texto:`Fecha: ${n.fecha}\nDiagnóstico: ${n.diagnostico}\nProcedimiento: ${n.procedimiento}` },
      { titulo:'Hallazgos',           texto: n.hallazgos || '—' },
      { titulo:'Técnica quirúrgica',  texto: tecnicaTxt },
      { titulo:'Detalles operatorios',
        texto:`Sangrado estimado: ${n.sangrado || '—'} mL\nTiempo quirúrgico: ${n.tiempo || '—'} min\nDrenaje: ${n.drenaje}\nComplicaciones intraoperatorias: ${n.complicaciones || 'Ninguna'}` },
      { titulo:'Plan postoperatorio', texto: n.plan || '—' }
    ];
  }

  function altaSecciones(p, a) {
    const indicacionesBase =
`1. Dieta líquida hiperproteica fase 2 por 14 días, luego progresar
2. HBPM (enoxaparina) SC c/24h por 14-28 días
3. IBP (omeprazol 20mg) c/12h por 6 meses
4. Multivitamínico bariátrico al iniciar fase de purés
5. Hidratación: ≥1.5 L/día en sorbos pequeños
6. Movilización activa, evitar ejercicio intenso 4 semanas
7. Analgesia: paracetamol 1g c/8h, evitar AINEs`;
    return [
      { titulo:'Procedimiento realizado', texto: `${PROCS[p.procedimiento] || '—'}\nFecha de egreso: ${a.fecha}` },
      { titulo:'Indicaciones al alta', texto: indicacionesBase + (a.indicacionesExtra ? '\n\nAdicional:\n' + a.indicacionesExtra : '') },
      { titulo:'Signos de alarma',
        texto:`- Taquicardia >120, fiebre >38°C
- Dolor abdominal severo o en aumento
- Vómito persistente, intolerancia oral
- Disnea, dolor torácico
- Sangrado por herida o digestivo` },
      { titulo:'Citas de control',
        texto:`- Control telefónico: 48-72h
- Consulta presencial: 7-10 días
- Nutrición: 14 días
- Psicología: 21 días` },
      { titulo:'Observaciones', texto: a.observaciones || 'Sin observaciones adicionales.' },
      { titulo:'Línea Avante 24/7', texto: AVANTE_TEL }
    ];
  }

  // ----------------------- UI -----------------------

  function tabsHTML() {
    const tabs = [
      { id:'plastica',    icon:'scissors',    l:'Plástica' },
      { id:'poblaciones', icon:'user-check',  l:'Poblaciones' },
      { id:'calidad',     icon:'bar-chart-3', l:'Calidad' },
      { id:'docs',        icon:'file-text',   l:'Documentación' }
    ];
    return `<div class="flex gap-1 mb-4 border-b tabs-scroll overflow-x-auto">
      ${tabs.map(t => `
        <button data-tab="${t.id}" class="px-3 py-2 flex items-center gap-1 text-sm font-medium border-b-2 whitespace-nowrap"
          style="border-color:${state.tab===t.id?C.gold:'transparent'}; color:${state.tab===t.id?C.navy:'#6b7280'};">
          <i data-lucide="${t.icon}" class="w-3.5 h-3.5"></i> ${t.l}
        </button>
      `).join('')}
    </div>`;
  }

  function plasticaHTML(p) {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="scissors" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">El siguiente paso de su transformación</h3>
        <p class="text-gray-700 mb-4">Cuando su peso esté estable, evaluaremos juntos las opciones de cirugía plástica que mejor se adapten a usted.</p>
        <button class="btn text-white" style="background:${C.teal};">Consulta de plástica</button>
      </div>`;
    }
    const ev = evaluarPlastica(p);
    return `<div class="space-y-4">
      <div>
        <h3 class="font-bold mb-2 text-sm" style="color:${C.navy};">Criterios de elegibilidad</h3>
        <div class="space-y-2">
          ${ev.items.map(c => `<div class="p-3 rounded flex gap-2" style="background:${C.cream};">
            <i data-lucide="check-circle-2" class="w-4 h-4 flex-shrink-0 mt-0.5" style="color:${C.teal};"></i>
            <div class="flex-1">
              <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(c.criterio)} <span class="text-xs font-normal text-gray-600">→ ${escapeHtml(c.cumple)}</span></div>
              <div class="text-xs text-gray-700">${escapeHtml(c.det)}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div>
        <h3 class="font-bold mb-2 text-sm" style="color:${C.navy};">Secuencia recomendada</h3>
        <div class="space-y-2">
          ${SECUENCIA_PLASTICA.map(s => `<div class="p-3 rounded border-l-4" style="background:${C.cream}; border-color:${C.gold};">
            <div class="font-bold text-sm" style="color:${C.navy};">${s.orden}. ${escapeHtml(s.proc)} <span class="text-xs font-normal text-gray-500">· ${s.tiempo}</span></div>
            <div class="text-xs text-gray-700 mt-1">${escapeHtml(s.det)}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function poblacionesHTML(p) {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="user-check" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Su caso es único</h3>
        <p class="text-gray-700">Adaptamos el tratamiento a su edad, condición y necesidades particulares.</p>
      </div>`;
    }
    return `<div class="space-y-3">
      ${poblacionEspecial(p).map(g => `<div class="p-4 rounded border-l-4" style="background:${C.cream}; border-color:${C.teal};">
        <div class="font-bold mb-2" style="color:${C.navy};">${escapeHtml(g.grupo)}</div>
        <ul class="space-y-1">
          ${g.consid.map(x => `<li class="text-sm flex gap-2">
            <i data-lucide="alert-triangle" class="w-3.5 h-3.5 flex-shrink-0 mt-1" style="color:${C.gold};"></i>${escapeHtml(x)}
          </li>`).join('')}
        </ul>
      </div>`).join('')}
    </div>`;
  }

  function calidadHTML() {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="bar-chart-3" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Calidad medida y certificada</h3>
        <p class="text-gray-700">Avante mide y publica sus indicadores de calidad para garantizar el mejor resultado posible para cada paciente.</p>
      </div>`;
    }

    const kpis = getKPIs();
    const total = scoreGlobal(kpis);
    const cats = ['Seguridad','Calidad','Eficiencia','Outcomes','Outcomes metabólicos','PROMs'];
    const destacados = ['mort30','fuga','tev','reing'];
    const cajasDest = kpis.filter(k => destacados.includes(k.id));

    const scoreColor = total >= 90 ? C.green : total >= 75 ? C.teal : total >= 60 ? C.yellow : C.red;

    const iconoCat = {
      'Seguridad':'shield-check',
      'Calidad':'award',
      'Eficiencia':'zap',
      'Outcomes':'trending-up',
      'Outcomes metabólicos':'activity',
      'PROMs':'smile'
    };

    // Filas por categoría con barras de progreso
    const filasPorCat = cats.map(cat => {
      const items = kpis.filter(k => k.cat === cat);
      if (!items.length) return '';
      const catScore = categoriaScore(kpis, cat);
      const col = catScore >= 90 ? C.green : catScore >= 75 ? C.teal : catScore >= 60 ? C.yellow : C.red;
      return `<div class="p-4 rounded border" style="border-color:${C.teal}; background:white;">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded" style="background:${col}1a; color:${col};">
              <i data-lucide="${iconoCat[cat] || 'circle'}" class="w-4 h-4"></i>
            </div>
            <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(cat)}</div>
          </div>
          <div class="text-xs font-bold" style="color:${col};">${catScore}/100</div>
        </div>
        <div class="space-y-2">
          ${items.map(k => {
            const comp = cumplimiento(k);
            const cumple = comp >= 100;
            const ancho = Math.min(100, comp);
            const barCol = cumple ? C.green : (comp >= 75 ? C.yellow : C.red);
            const signo = k.mejorMenor ? '≤' : '≥';
            return `<div>
              <div class="flex justify-between items-center text-[11px] mb-1">
                <span class="text-gray-700">${escapeHtml(k.k)}</span>
                <span class="font-mono" style="color:${C.navy};">
                  <strong>${k.actual}${k.unidad}</strong>
                  <span class="text-gray-400"> / meta ${signo}${k.meta}${k.unidad}</span>
                  ${cumple ? `<i data-lucide="check" class="inline w-3 h-3 ml-1" style="color:${C.green};"></i>` : `<i data-lucide="alert-triangle" class="inline w-3 h-3 ml-1" style="color:${C.yellow};"></i>`}
                </span>
              </div>
              <div class="w-full h-2 rounded-full overflow-hidden" style="background:#f1f5f9;">
                <div class="h-full rounded-full transition-all" style="width:${ancho}%; background:${barCol};"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');

    return `<div class="space-y-5">

      <!-- Score global + acreditación -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="p-5 rounded-lg text-white shadow-md md:col-span-1" style="background:linear-gradient(135deg, ${C.navy}, ${C.teal});">
          <div class="text-[11px] uppercase tracking-wider opacity-80 mb-1">Score global de calidad</div>
          <div class="flex items-end gap-2">
            <div class="text-5xl font-bold">${total}</div>
            <div class="text-sm opacity-80 mb-1">/100</div>
          </div>
          <div class="mt-2 h-1.5 rounded-full" style="background:rgba(255,255,255,0.2);">
            <div class="h-full rounded-full" style="width:${total}%; background:${C.gold};"></div>
          </div>
          <div class="mt-2 text-[11px] opacity-90">${kpis.filter(k => cumplimiento(k) >= 100).length} de ${kpis.length} indicadores en meta</div>
        </div>
        <div class="p-4 rounded-lg flex items-center gap-3" style="background:${C.cream};">
          <div class="p-2 rounded" style="background:${C.gold};"><i data-lucide="award" class="w-6 h-6 text-white"></i></div>
          <div>
            <div class="text-[11px] uppercase font-bold" style="color:${C.gold};">Acreditación</div>
            <div class="text-sm font-bold" style="color:${C.navy};">MBSAQIP · Vigente</div>
            <div class="text-[10px] text-gray-600">Programa de acreditación ASMBS/ACS</div>
          </div>
        </div>
        <div class="p-4 rounded-lg flex items-center gap-3" style="background:${C.cream};">
          <div class="p-2 rounded" style="background:${C.teal};"><i data-lucide="database" class="w-6 h-6 text-white"></i></div>
          <div>
            <div class="text-[11px] uppercase font-bold" style="color:${C.teal};">Registro</div>
            <div class="text-sm font-bold" style="color:${C.navy};">IFSO Global Registry</div>
            <div class="text-[10px] text-gray-600">Reporte anual de outcomes</div>
          </div>
        </div>
      </div>

      <!-- KPIs destacados -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        ${cajasDest.map(k => {
          const comp = cumplimiento(k);
          const cumple = comp >= 100;
          const col = cumple ? C.green : (comp >= 75 ? C.yellow : C.red);
          const icon = cumple ? 'trending-down' : 'alert-circle';
          return `<div class="p-4 rounded-lg border-l-4 shadow-sm" style="background:white; border-color:${col};">
            <div class="flex items-center justify-between text-[10px] uppercase font-bold mb-1" style="color:#9ca3af;">
              <span>${escapeHtml(k.k)}</span>
              <i data-lucide="${icon}" class="w-3.5 h-3.5" style="color:${col};"></i>
            </div>
            <div class="flex items-baseline gap-1">
              <div class="text-2xl font-bold" style="color:${C.navy};">${k.actual}</div>
              <div class="text-xs text-gray-500">${k.unidad}</div>
            </div>
            <div class="text-[10px] text-gray-500">Meta ≤${k.meta}${k.unidad} · <span style="color:${col}; font-weight:bold;">${cumple?'EN META':comp+'%'}</span></div>
          </div>`;
        }).join('')}
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-lg border bg-white" style="border-color:#e5e7eb;">
          <h3 class="text-xs font-bold uppercase mb-2 flex items-center gap-1" style="color:${C.navy};">
            <i data-lucide="radar" class="w-4 h-4" style="color:${C.teal};"></i> Desempeño por categoría
          </h3>
          <div style="position:relative; height:260px;"><canvas id="chart-radar"></canvas></div>
        </div>
        <div class="p-4 rounded-lg border bg-white" style="border-color:#e5e7eb;">
          <h3 class="text-xs font-bold uppercase mb-2 flex items-center gap-1" style="color:${C.navy};">
            <i data-lucide="bar-chart-3" class="w-4 h-4" style="color:${C.teal};"></i> Cumplimiento por indicador
          </h3>
          <div style="position:relative; height:260px;"><canvas id="chart-barras"></canvas></div>
        </div>
      </div>

      <div class="p-4 rounded-lg border bg-white" style="border-color:#e5e7eb;">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-xs font-bold uppercase flex items-center gap-1" style="color:${C.navy};">
            <i data-lucide="line-chart" class="w-4 h-4" style="color:${C.teal};"></i> Tendencia institucional · últimos 12 meses
          </h3>
          <div class="text-[10px] text-gray-500">Volumen mensual de cirugías y tasa de complicaciones (%)</div>
        </div>
        <div style="position:relative; height:240px;"><canvas id="chart-tendencia"></canvas></div>
      </div>

      <!-- KPIs agrupados con barras de progreso -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-xs font-bold uppercase" style="color:${C.navy};">Indicadores por dimensión</h3>
          <button id="btn-pdf-calidad" class="btn text-white text-xs flex items-center gap-1" style="background:${C.teal};">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> Exportar dashboard PDF
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${filasPorCat}
        </div>
      </div>

      ${state.modo === 'academico' ? `<div class="p-3 rounded text-xs text-gray-700" style="background:${C.cream};">
        <strong style="color:${C.navy};">Marco:</strong> KPIs alineados con MBSAQIP, IFSO Global Registry y BAROS. Los valores presentados son institucionales (demo editable en localStorage).
        Referencias: Brethauer SA et al. Standardized outcomes reporting in metabolic and bariatric surgery. SOARD 2015; 11(3):489-506.
      </div>` : ''}
    </div>`;
  }

  function initCalidadCharts() {
    if (!window.Chart || !containerRef) return;
    const kpis = getKPIs();
    const cats = ['Seguridad','Calidad','Eficiencia','Outcomes','Outcomes metabólicos','PROMs'];

    // Radar
    const elR = containerRef.querySelector('#chart-radar');
    if (elR) {
      _charts.push(new Chart(elR, {
        type:'radar',
        data:{
          labels: cats,
          datasets:[{
            label:'Desempeño (%)',
            data: cats.map(c => categoriaScore(kpis, c)),
            backgroundColor:'rgba(26, 139, 157, 0.25)',
            borderColor:C.teal,
            borderWidth:2,
            pointBackgroundColor:C.gold,
            pointRadius:4
          }]
        },
        options:{
          responsive:true, maintainAspectRatio:false,
          scales:{ r:{ suggestedMin:0, suggestedMax:100, ticks:{ stepSize:20, color:'#9ca3af', backdropColor:'transparent' }, grid:{ color:'#e5e7eb' }, pointLabels:{ color:C.navy, font:{ size:10, weight:'bold' } } } },
          plugins:{ legend:{ display:false } }
        }
      }));
    }

    // Barras horizontales
    const elB = containerRef.querySelector('#chart-barras');
    if (elB) {
      const labels = kpis.map(k => k.k);
      const valores = kpis.map(k => Math.min(150, cumplimiento(k)));
      const colores = valores.map(v => v >= 100 ? C.green : (v >= 75 ? C.yellow : C.red));
      _charts.push(new Chart(elB, {
        type:'bar',
        data:{ labels, datasets:[{ label:'Cumplimiento (%)', data:valores, backgroundColor:colores, borderRadius:4 }] },
        options:{
          responsive:true, maintainAspectRatio:false, indexAxis:'y',
          scales:{
            x:{ beginAtZero:true, max:150, grid:{ color:'#f3f4f6' }, ticks:{ color:'#6b7280', callback:v => v+'%' } },
            y:{ grid:{ display:false }, ticks:{ color:C.navy, font:{ size:9 } } }
          },
          plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label: ctx => ctx.parsed.x + '% de cumplimiento' } } }
        }
      }));
    }

    // Tendencia dual (línea + barras)
    const elT = containerRef.querySelector('#chart-tendencia');
    if (elT) {
      _charts.push(new Chart(elT, {
        type:'bar',
        data:{
          labels: TENDENCIA_MESES,
          datasets:[
            { type:'bar',  label:'Volumen quirúrgico', data:TENDENCIA_VOLUM, backgroundColor:C.teal+'55', borderColor:C.teal, borderWidth:1, yAxisID:'y1', borderRadius:3 },
            { type:'line', label:'Complicaciones (%)',  data:TENDENCIA_COMPL, borderColor:C.red, backgroundColor:C.red, tension:0.35, pointRadius:3, pointBackgroundColor:C.red, yAxisID:'y2' }
          ]
        },
        options:{
          responsive:true, maintainAspectRatio:false,
          interaction:{ mode:'index', intersect:false },
          scales:{
            y1:{ position:'left', beginAtZero:true, title:{ display:true, text:'Cirugías', color:C.teal, font:{ size:10 } }, ticks:{ color:'#6b7280' }, grid:{ color:'#f3f4f6' } },
            y2:{ position:'right', beginAtZero:true, max:6, title:{ display:true, text:'Complicaciones %', color:C.red, font:{ size:10 } }, ticks:{ color:'#6b7280' }, grid:{ drawOnChartArea:false } },
            x:{ ticks:{ color:'#6b7280' }, grid:{ display:false } }
          },
          plugins:{ legend:{ position:'top', labels:{ font:{ size:10 }, color:C.navy } } }
        }
      }));
    }
  }

  function exportarDashboardCalidad() {
    const kpis = getKPIs();
    const total = scoreGlobal(kpis);
    const cats = ['Seguridad','Calidad','Eficiencia','Outcomes','Outcomes metabólicos','PROMs'];
    const metricas = cats.map(cat => ({ label:cat, valor:categoriaScore(kpis, cat) + '/100' }));
    metricas.unshift({ label:'SCORE GLOBAL', valor:total + '/100' });

    // Captura de gráficos a imagen (si existen)
    const secciones = [];
    secciones.push({ titulo:'Resumen ejecutivo de calidad', texto:`Score global: ${total}/100\nIndicadores en meta: ${kpis.filter(k => cumplimiento(k) >= 100).length}/${kpis.length}\nAcreditaciones: MBSAQIP · IFSO Global Registry\nMarco de referencia: ASMBS/IFSO 2022 · Brethauer SA, SOARD 2015`, metricas });

    const radar = containerRef && containerRef.querySelector('#chart-radar');
    if (radar) { try { secciones.push({ titulo:'Desempeño por categoría', imagen: radar.toDataURL('image/png'), imagenAlto:70 }); } catch(e){} }
    const barras = containerRef && containerRef.querySelector('#chart-barras');
    if (barras) { try { secciones.push({ titulo:'Cumplimiento por indicador', imagen: barras.toDataURL('image/png'), imagenAlto:85 }); } catch(e){} }
    const tend = containerRef && containerRef.querySelector('#chart-tendencia');
    if (tend) { try { secciones.push({ titulo:'Tendencia institucional (12 meses)', imagen: tend.toDataURL('image/png'), imagenAlto:70 }); } catch(e){} }

    secciones.push({
      titulo:'Detalle de indicadores',
      texto: kpis.map(k => {
        const comp = cumplimiento(k);
        const estado = comp >= 100 ? 'EN META' : comp + '%';
        const signo = k.mejorMenor ? '≤' : '≥';
        return `• [${k.cat}] ${k.k}: ${k.actual}${k.unidad} (meta ${signo}${k.meta}${k.unidad}) — ${estado}`;
      }).join('\n')
    });

    descargarPDF({
      titulo:'Dashboard de Calidad Bariátrica',
      subtitulo:'Módulo 5 · Indicadores institucionales',
      secciones,
      nombreArchivo:'avante_dashboard_calidad.pdf',
      firmaPaciente:false
    });
  }

  function notaOpFormHTML(p) {
    const n = getNotaOp(p);
    const iCls = 'w-full px-3 py-2 border rounded text-sm';
    return `<div class="space-y-3">
      <div class="p-3 rounded text-xs" style="background:${C.cream}; color:${C.navy};">
        Complete los campos editables. Al generar el PDF se incluyen automáticamente los datos del paciente y la firma del médico tratante (configurable en la barra lateral).
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label class="text-xs font-medium">Fecha</label>
          <input class="${iCls}" data-nota="fecha" value="${escapeHtml(n.fecha)}"></div>
        <div><label class="text-xs font-medium">Procedimiento</label>
          <input class="${iCls}" data-nota="procedimiento" value="${escapeHtml(n.procedimiento)}"></div>
        <div class="md:col-span-2"><label class="text-xs font-medium">Diagnóstico</label>
          <input class="${iCls}" data-nota="diagnostico" value="${escapeHtml(n.diagnostico)}"></div>
      </div>
      <div>
        <label class="text-xs font-medium">Hallazgos</label>
        <textarea class="${iCls}" rows="4" data-nota="hallazgos">${escapeHtml(n.hallazgos)}</textarea>
      </div>
      <div>
        <label class="text-xs font-medium">Técnica quirúrgica (descripción detallada)</label>
        <textarea class="${iCls}" rows="8" data-nota="tecnica" placeholder="Describa paso a paso el procedimiento realizado...">${escapeHtml(n.tecnica)}</textarea>
      </div>
      <div class="p-3 rounded" style="background:${C.cream}; border-left:3px solid ${C.gold};">
        <div class="text-xs font-bold mb-2 flex items-center gap-1" style="color:${C.navy};">
          <i data-lucide="check-square" class="w-3.5 h-3.5"></i> Adyuvantes transoperatorios
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
          ${ADYUVANTES_TRANSOP.map(a => `
            <label class="flex items-start gap-2 text-xs cursor-pointer">
              <input type="checkbox" data-ady="${a.k}" ${n.adyuvantes[a.k] ? 'checked' : ''} class="mt-0.5">
              <span>${escapeHtml(a.l)}</span>
            </label>
          `).join('')}
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div><label class="text-xs font-medium">Sangrado (mL)</label>
          <input type="number" class="${iCls}" data-nota="sangrado" value="${escapeHtml(n.sangrado)}"></div>
        <div><label class="text-xs font-medium">Tiempo (min)</label>
          <input type="number" class="${iCls}" data-nota="tiempo" value="${escapeHtml(n.tiempo)}"></div>
        <div><label class="text-xs font-medium">Drenaje</label>
          <select class="${iCls}" data-nota="drenaje">
            <option ${n.drenaje==='No'?'selected':''}>No</option>
            <option ${n.drenaje==='Sí'?'selected':''}>Sí</option>
          </select>
        </div>
        <div><label class="text-xs font-medium">Complicaciones</label>
          <input class="${iCls}" data-nota="complicaciones" value="${escapeHtml(n.complicaciones)}"></div>
      </div>
      <div>
        <label class="text-xs font-medium">Plan postoperatorio</label>
        <textarea class="${iCls}" rows="6" data-nota="plan">${escapeHtml(n.plan)}</textarea>
      </div>
    </div>`;
  }

  function altaFormHTML(p) {
    const a = getAlta(p);
    const iCls = 'w-full px-3 py-2 border rounded text-sm';
    return `<div class="space-y-3">
      <div class="p-3 rounded text-xs" style="background:${C.cream}; color:${C.navy};">
        El PDF genera automáticamente las indicaciones estándar. Aquí puede añadir observaciones o indicaciones específicas del paciente.
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label class="text-xs font-medium">Fecha de egreso</label>
          <input class="${iCls}" data-alta="fecha" value="${escapeHtml(a.fecha)}"></div>
      </div>
      <div>
        <label class="text-xs font-medium">Indicaciones adicionales</label>
        <textarea class="${iCls}" rows="4" data-alta="indicacionesExtra" placeholder="Específicas de este paciente (ajustes, medicamentos crónicos, etc.)">${escapeHtml(a.indicacionesExtra)}</textarea>
      </div>
      <div>
        <label class="text-xs font-medium">Observaciones</label>
        <textarea class="${iCls}" rows="5" data-alta="observaciones" placeholder="Evolución durante la hospitalización, hallazgos relevantes, comentarios...">${escapeHtml(a.observaciones)}</textarea>
      </div>
    </div>`;
  }

  function docsHTML(p) {
    const form = state.tipoDoc === 'notaop' ? notaOpFormHTML(p) : altaFormHTML(p);
    return `<div>
      <div class="flex gap-2 mb-3">
        <button data-doc="notaop" class="btn text-sm" style="background:${state.tipoDoc==='notaop'?C.navy:'#e5e7eb'}; color:${state.tipoDoc==='notaop'?'white':'#374151'};">Nota operatoria</button>
        <button data-doc="alta" class="btn text-sm" style="background:${state.tipoDoc==='alta'?C.navy:'#e5e7eb'}; color:${state.tipoDoc==='alta'?'white':'#374151'};">Resumen de egreso</button>
      </div>
      ${form}
      <div class="flex gap-2 mt-4 flex-wrap">
        <button id="btn-pdf" class="btn text-white text-sm flex items-center gap-1" style="background:${C.teal};">
          <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Generar PDF firmado
        </button>
      </div>
    </div>`;
  }

  function render(container) {
    containerRef = container;
    destroyCharts();
    container.innerHTML = `
      <div class="min-h-screen p-4">
        <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          ${headerHTML(5, 'Plástica · Poblaciones Especiales · Calidad · Documentación', state.modo)}
          <div class="p-6">
            ${!state.seleccionado ? `
              <h2 class="font-bold mb-3 flex items-center gap-2" style="color:${C.navy};">
                <i data-lucide="users" class="w-5 h-5"></i> Seleccione paciente
              </h2>
              ${listaPacientesHTML(state.pacientes)}
            ` : (() => {
              const p = state.seleccionado;
              const panel = state.tab === 'plastica' ? plasticaHTML(p)
                         : state.tab === 'poblaciones' ? poblacionesHTML(p)
                         : state.tab === 'calidad' ? calidadHTML()
                         : docsHTML(p);
              return `
                <div class="flex justify-between items-center mb-4 p-3 rounded flex-wrap gap-2" style="background:${C.cream};">
                  <div>
                    <div class="font-bold" style="color:${C.navy};">${escapeHtml(p.nombre)}</div>
                    <div class="text-xs text-gray-600">${escapeHtml(p.edad)}a · IMC ${imc(p).toFixed(1)} · ${escapeHtml(PROCS[p.procedimiento] || '')}</div>
                  </div>
                  <button id="btn-cambiar" class="btn text-sm" style="background:#e5e7eb;">Cambiar</button>
                </div>
                ${tabsHTML()}
                ${panel}
              `;
            })()}
          </div>
        </div>
      </div>
    `;
    wire(container);
    refrescarIconos();
    // Inicializar gráficos si el tab calidad está activo
    if (state.seleccionado && state.tab === 'calidad' && state.modo !== 'paciente') {
      // Esperar al siguiente tick para que Chart.js encuentre los canvas
      setTimeout(initCalidadCharts, 0);
    }
  }

  function wire(container) {
    container.querySelectorAll('[data-modo]').forEach(b => b.addEventListener('click', () => { state.modo = b.dataset.modo; render(containerRef); }));
    container.querySelectorAll('[data-paciente-id]').forEach(b => b.addEventListener('click', () => {
      state.seleccionado = state.pacientes.find(p => p.id === b.dataset.pacienteId);
      render(containerRef);
    }));
    container.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { state.tab = b.dataset.tab; render(containerRef); }));
    container.querySelectorAll('[data-doc]').forEach(b => b.addEventListener('click', () => { state.tipoDoc = b.dataset.doc; render(containerRef); }));
    const bc = container.querySelector('#btn-cambiar');
    if (bc) bc.addEventListener('click', () => { state.seleccionado = null; render(containerRef); });

    const bPdfCal = container.querySelector('#btn-pdf-calidad');
    if (bPdfCal) bPdfCal.addEventListener('click', exportarDashboardCalidad);

    const p = state.seleccionado;
    if (!p) return;

    // Campos editables de nota operatoria
    container.querySelectorAll('[data-nota]').forEach(el => {
      const evt = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evt, e => {
        getNotaOp(p)[el.dataset.nota] = e.target.value;
      });
    });
    // Checklist de adyuvantes transoperatorios
    container.querySelectorAll('[data-ady]').forEach(cb => {
      cb.addEventListener('change', e => {
        getNotaOp(p).adyuvantes[cb.dataset.ady] = e.target.checked;
      });
    });
    // Campos editables de alta
    container.querySelectorAll('[data-alta]').forEach(el => {
      el.addEventListener('input', e => {
        getAlta(p)[el.dataset.alta] = e.target.value;
      });
    });

    const bPdf = container.querySelector('#btn-pdf');
    if (bPdf) bPdf.addEventListener('click', () => {
      if (state.tipoDoc === 'notaop') {
        const n = getNotaOp(p);
        descargarPDF({
          titulo: 'Nota operatoria',
          subtitulo: 'Módulo 5 · Documentación quirúrgica',
          paciente: p,
          secciones: notaOpSecciones(p, n),
          nombreArchivo: `avante_nota_op_${(p.nombre || 'paciente').replace(/\s+/g,'_')}.pdf`,
          firmaPaciente: false
        });
      } else {
        const a = getAlta(p);
        descargarPDF({
          titulo: 'Resumen de egreso',
          subtitulo: 'Módulo 5 · Documentación hospitalaria',
          paciente: p,
          secciones: altaSecciones(p, a),
          nombreArchivo: `avante_alta_${(p.nombre || 'paciente').replace(/\s+/g,'_')}.pdf`
        });
      }
    });
  }

  return { render(container) { cargar(); render(container); } };
})();
