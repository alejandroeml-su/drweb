// ============================================================
// Módulo 7 · Dashboard · Telemedicina · Fidelización · Equipo
// ============================================================

window.AvanteModulo7 = (function () {

  const state = {
    modo:'clinico', pacientes:[], seguimientos:{}, complicaciones:{}, tab:'dashboard',
    equipo:[], equipoEdit:{ activo:false, idx:-1, rol:'', persona:'', resp:'' }
  };
  let containerRef = null;
  const chartsRef = {};

  const COMPLICACIONES_LBL = [
    'Fuga anastomótica','TEP','Estenosis / edema','Hernia interna','ERGE de novo',
    'Coledocolitiasis','Falla del procedimiento','Wernicke','Anemia/Déficit','Dumping'
  ];

  function cargar() {
    state.pacientes = storageGet('avante_pacientes') || [];
    state.seguimientos = storageGet('avante_seguimientos') || {};
    state.complicaciones = storageGet('avante_complicaciones') || {};
    cargarEquipo();
  }

  const EQUIPO_DEFAULT = [
    { rol:'Cirujano bariátrico líder', persona:'Dr. Ángel Henríquez',       resp:'Indicación quirúrgica, técnica operatoria, seguimiento clínico, decisiones de revisión' },
    { rol:'Co-Director médico',        persona:'Dr. Luis Alonso Martínez Chávez', resp:'Co-liderazgo clínico y administrativo, casos compartidos' },
    { rol:'Anestesiología bariátrica', persona:'Equipo de anestesia',        resp:'Manejo perioperatorio, vía aérea difícil, analgesia multimodal' },
    { rol:'Endocrinología',            persona:'Endocrinólogo asociado',     resp:'Optimización metabólica pre y postoperatoria, manejo DM2' },
    { rol:'Nutrición clínica',         persona:'Nutricionista bariátrica',   resp:'Fases dietarias, suplementación, educación alimentaria' },
    { rol:'Psicología bariátrica',     persona:'Psicólogo clínico',          resp:'Evaluación preoperatoria, acompañamiento conductual, prevención de recaídas' },
    { rol:'Cardiología',               persona:'Cardiólogo de referencia',   resp:'Valoración y optimización cardiovascular preoperatoria' },
    { rol:'Hepatología',               persona:'Hepatólogo asociado',        resp:'NASH/MAFLD, hepatopatía bariátrica' },
    { rol:'Cirugía plástica',          persona:'Cirujano plástico de referencia', resp:'Plástica post-bariátrica en fase tardía' },
    { rol:'Coordinación',              persona:'Coordinador del programa',   resp:'Agendas, seguimiento, comunicación con paciente y aseguradoras' }
  ];

  function cargarEquipo() {
    const e = storageGet('avante_equipo');
    state.equipo = Array.isArray(e) && e.length ? e : EQUIPO_DEFAULT.slice();
  }
  function guardarEquipo() {
    storageSet('avante_equipo', state.equipo);
  }
  function limpiarEdicion() {
    state.equipoEdit = { activo:false, idx:-1, rol:'', persona:'', resp:'' };
  }

  const TIPOS_CONSULTA_VIRTUAL = [
    { tipo:'Primera consulta informativa',   duracion:'30 min', ind:'Pacientes evaluando opciones, pueden ser de fuera de El Salvador' },
    { tipo:'Control postoperatorio temprano',duracion:'15 min', ind:'48-72h, 1 semana post-egreso' },
    { tipo:'Seguimiento ponderal',           duracion:'20 min', ind:'1, 3, 6, 12 meses si paciente vive lejos' },
    { tipo:'Consulta nutricional',           duracion:'30 min', ind:'Ajustes de plan alimentario, dudas de fase' },
    { tipo:'Apoyo psicológico',              duracion:'45 min', ind:'Sesiones de seguimiento conductual' },
    { tipo:'Segunda opinión regional',       duracion:'45 min', ind:'Pacientes de Centroamérica para casos complejos o revisiones' }
  ];

  const BENEFICIOS_AVANTE_CARE = [
    'Acceso prioritario a citas y procedimientos',
    'Línea telefónica directa 24/7 con su equipo médico',
    'Descuentos en laboratorios e imágenes de seguimiento',
    'Talleres mensuales de cocina, ejercicio y mindfulness',
    'Grupo cerrado de pacientes (apoyo entre pares)',
    'Newsletter mensual con contenido educativo',
    'Acceso a charlas con expertos invitados',
    'Aniversario quirúrgico: control completo de cortesía'
  ];

  const KPIS_EXPERIENCIA = [
    { k:'NPS (Net Promoter Score)',           meta:'>70',      cat:'Recomendación' },
    { k:'CSAT global',                        meta:'>90%',     cat:'Satisfacción' },
    { k:'Retención a 12m',                    meta:'>80%',     cat:'Adherencia' },
    { k:'Tasa de referidos',                  meta:'>30%',     cat:'Crecimiento' },
    { k:'Tiempo de espera primera consulta',  meta:'<7 días',  cat:'Acceso' },
    { k:'Resolución de PQRS',                 meta:'<48h',     cat:'Servicio' }
  ];

  // ----------------------- UI -----------------------

  function tabsHTML() {
    const tabs = [
      { id:'dashboard',    icon:'bar-chart-3', l:'Dashboard ejecutivo' },
      { id:'telemedicina', icon:'video',       l:'Telemedicina' },
      { id:'fidelizacion', icon:'award',       l:'Avante Care' },
      { id:'equipo',       icon:'users',       l:'Equipo' }
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

  function calcularMetricas() {
    const total = state.pacientes.length;
    const porProc = {};
    state.pacientes.forEach(p => { porProc[p.procedimiento] = (porProc[p.procedimiento] || 0) + 1; });
    const imcProm = total > 0 ? (state.pacientes.reduce((s,p) => s + imc(p), 0) / total).toFixed(1) : 0;
    const edadProm = total > 0 ? (state.pacientes.reduce((s,p) => s + (parseFloat(p.edad) || 0), 0) / total).toFixed(0) : 0;
    const conSeguimiento = Object.keys(state.seguimientos).length;
    const tasaSeg = total > 0 ? ((conSeguimiento / total) * 100).toFixed(0) : 0;
    const conDM   = state.pacientes.filter(p => p.comorbilidades && p.comorbilidades.dm).length;
    const conERGE = state.pacientes.filter(p => p.comorbilidades && p.comorbilidades.erge).length;
    const conAOS  = state.pacientes.filter(p => p.comorbilidades && p.comorbilidades.aos).length;
    const conHTA  = state.pacientes.filter(p => p.comorbilidades && p.comorbilidades.hta).length;
    const conDisli= state.pacientes.filter(p => p.comorbilidades && p.comorbilidades.disli).length;

    // Distribución por riesgo (clase de obesidad)
    const riesgo = { 'I (30-35)':0, 'II (35-40)':0, 'III (40-50)':0, 'Súper (≥50)':0 };
    state.pacientes.forEach(p => {
      const i = imc(p);
      if (i >= 50) riesgo['Súper (≥50)']++;
      else if (i >= 40) riesgo['III (40-50)']++;
      else if (i >= 35) riesgo['II (35-40)']++;
      else if (i >= 30) riesgo['I (30-35)']++;
    });

    // Agregado de complicaciones marcadas
    const complAgg = COMPLICACIONES_LBL.map(() => 0);
    Object.values(state.complicaciones).forEach(pac => {
      Object.entries(pac).forEach(([idx, val]) => {
        if (val && complAgg[idx] !== undefined) complAgg[idx]++;
      });
    });
    const pacientesConCompl = Object.values(state.complicaciones)
      .filter(pac => Object.values(pac).some(v => v)).length;

    // Serie evolución ponderal promedio por hito
    const hitosOrden = ['1m','3m','6m','12m','18m','24m','anual'];
    const pepPorHito = {};
    hitosOrden.forEach(h => pepPorHito[h] = { suma:0, n:0 });
    Object.entries(state.seguimientos).forEach(([id, segs]) => {
      const p = state.pacientes.find(x => x.id === id);
      if (!p) return;
      segs.forEach(s => {
        const v = pep(p.peso, s.peso, p.talla);
        if (pepPorHito[s.hito] && v > 0) {
          pepPorHito[s.hito].suma += v;
          pepPorHito[s.hito].n++;
        }
      });
    });
    const evolSerie = hitosOrden.map(h => ({
      hito: h,
      pep: pepPorHito[h].n > 0 ? +(pepPorHito[h].suma / pepPorHito[h].n).toFixed(1) : null
    }));

    let pepProm = 0, nPep = 0;
    Object.entries(state.seguimientos).forEach(([id, segs]) => {
      if (segs.length > 0) {
        const p = state.pacientes.find(x => x.id === id);
        if (p) {
          const ult = segs[segs.length - 1];
          const v = pep(p.peso, ult.peso, p.talla);
          if (v > 0) { pepProm += v; nPep++; }
        }
      }
    });
    pepProm = nPep > 0 ? (pepProm / nPep).toFixed(1) : 0;

    return { total, porProc, imcProm, edadProm, conSeguimiento, tasaSeg,
      conDM, conERGE, conAOS, conHTA, conDisli,
      riesgo, complAgg, pacientesConCompl, evolSerie, pepProm };
  }

  function dashboardHTML() {
    const m = calcularMetricas();
    const topProc = Object.entries(m.porProc).sort((a,b) => b[1] - a[1])[0];
    const topLabel = topProc ? PROCS[topProc[0]] : '—';

    return `<div class="space-y-5">
      <div class="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 class="text-xl font-bold" style="font-family:'Cormorant Garamond',Georgia,serif; color:${C.navy};">Dashboard clínico ejecutivo</h2>
          <div class="text-xs text-gray-600">Indicadores agregados de la base de pacientes Avante</div>
        </div>
        <button id="btn-dash-pdf" class="btn text-white text-sm flex items-center gap-1" style="background:${C.teal};">
          <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Descargar dashboard PDF
        </button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div class="p-4 rounded text-white shadow" style="background:linear-gradient(135deg, ${C.navy}, #123256);">
          <div class="text-[10px] uppercase tracking-wide opacity-80">Total pacientes</div>
          <div class="text-3xl font-bold" style="color:${C.gold};">${m.total}</div>
        </div>
        <div class="p-4 rounded shadow" style="background:${C.cream};">
          <div class="text-[10px] uppercase tracking-wide text-gray-600">IMC promedio</div>
          <div class="text-3xl font-bold" style="color:${C.navy};">${m.imcProm}</div>
        </div>
        <div class="p-4 rounded shadow" style="background:${C.cream};">
          <div class="text-[10px] uppercase tracking-wide text-gray-600">Edad promedio</div>
          <div class="text-3xl font-bold" style="color:${C.navy};">${m.edadProm}<span class="text-sm">a</span></div>
        </div>
        <div class="p-4 rounded text-white shadow" style="background:linear-gradient(135deg, ${C.teal}, #0f6975);">
          <div class="text-[10px] uppercase tracking-wide opacity-90">Adherencia seg.</div>
          <div class="text-3xl font-bold">${m.tasaSeg}<span class="text-sm">%</span></div>
        </div>
        <div class="p-4 rounded shadow" style="background:linear-gradient(135deg, ${C.gold}, #b8933d); color:${C.navy};">
          <div class="text-[10px] uppercase tracking-wide opacity-80">%PEP promedio</div>
          <div class="text-3xl font-bold">${m.pepProm}<span class="text-sm">%</span></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded border bg-white shadow-sm" style="border-color:${C.teal};">
          <h3 class="font-bold text-sm mb-2 flex items-center gap-1" style="color:${C.navy};">
            <i data-lucide="pie-chart" class="w-4 h-4" style="color:${C.gold};"></i> Distribución por procedimiento
          </h3>
          <div style="height:220px;"><canvas id="chart-proc"></canvas></div>
        </div>
        <div class="p-4 rounded border bg-white shadow-sm" style="border-color:${C.teal};">
          <h3 class="font-bold text-sm mb-2 flex items-center gap-1" style="color:${C.navy};">
            <i data-lucide="bar-chart-3" class="w-4 h-4" style="color:${C.gold};"></i> Estratificación de riesgo (clase IMC)
          </h3>
          <div style="height:220px;"><canvas id="chart-riesgo"></canvas></div>
        </div>
        <div class="p-4 rounded border bg-white shadow-sm" style="border-color:${C.teal};">
          <h3 class="font-bold text-sm mb-2 flex items-center gap-1" style="color:${C.navy};">
            <i data-lucide="activity" class="w-4 h-4" style="color:${C.gold};"></i> Comorbilidades prevalentes
          </h3>
          <div style="height:220px;"><canvas id="chart-comorb"></canvas></div>
        </div>
        <div class="p-4 rounded border bg-white shadow-sm" style="border-color:${C.teal};">
          <h3 class="font-bold text-sm mb-2 flex items-center gap-1" style="color:${C.navy};">
            <i data-lucide="trending-down" class="w-4 h-4" style="color:${C.gold};"></i> Evolución ponderal %PEP promedio
          </h3>
          <div style="height:220px;"><canvas id="chart-evol"></canvas></div>
        </div>
        <div class="p-4 rounded border bg-white shadow-sm md:col-span-2" style="border-color:${C.red};">
          <h3 class="font-bold text-sm mb-2 flex items-center gap-1" style="color:${C.navy};">
            <i data-lucide="alert-octagon" class="w-4 h-4" style="color:${C.red};"></i>
            Complicaciones registradas
            <span class="ml-2 text-xs font-normal text-gray-500">· ${m.pacientesConCompl} paciente(s) con al menos una complicación</span>
          </h3>
          <div style="height:260px;"><canvas id="chart-compl"></canvas></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="p-4 rounded text-center shadow-sm" style="background:${C.cream};">
          <i data-lucide="users" class="w-6 h-6 mx-auto mb-1" style="color:${C.teal};"></i>
          <div class="text-xs text-gray-600">Con seguimiento activo</div>
          <div class="text-2xl font-bold" style="color:${C.navy};">${m.conSeguimiento}/${m.total}</div>
        </div>
        <div class="p-4 rounded text-center shadow-sm" style="background:${C.cream};">
          <i data-lucide="trending-up" class="w-6 h-6 mx-auto mb-1" style="color:${C.gold};"></i>
          <div class="text-xs text-gray-600">Procedimiento líder</div>
          <div class="text-lg font-bold" style="color:${C.navy};">${escapeHtml(topLabel)}</div>
        </div>
        <div class="p-4 rounded text-center shadow-sm" style="background:${C.cream};">
          <i data-lucide="shield-check" class="w-6 h-6 mx-auto mb-1" style="color:${C.green};"></i>
          <div class="text-xs text-gray-600">Pacientes sin complicaciones</div>
          <div class="text-2xl font-bold" style="color:${C.navy};">${m.total - m.pacientesConCompl}</div>
        </div>
      </div>

      ${state.modo === 'academico' ? `<div class="p-3 rounded text-xs" style="background:${C.cream}; color:${C.navy};">
        <strong>Conexión Balanced Scorecard:</strong> Estos indicadores alimentan las perspectivas Cliente (adherencia, satisfacción), Procesos Internos (volumen, mix de procedimientos), Aprendizaje (registro académico) y Financiera (productividad por procedimiento) del BSC institucional de Avante.
      </div>` : ''}
    </div>`;
  }

  function destruirCharts() {
    Object.keys(chartsRef).forEach(k => {
      if (chartsRef[k] && chartsRef[k].destroy) chartsRef[k].destroy();
      delete chartsRef[k];
    });
  }

  function renderCharts() {
    if (typeof Chart === 'undefined') return;
    destruirCharts();
    const m = calcularMetricas();
    const paleta = [C.teal, C.gold, C.navy, C.green, C.red, '#7c3aed', '#f97316'];

    const cProc = document.getElementById('chart-proc');
    if (cProc && Object.keys(m.porProc).length) {
      const labels = Object.keys(m.porProc).map(k => PROCS[k] || k);
      const data = Object.values(m.porProc);
      chartsRef.proc = new Chart(cProc, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: paleta, borderWidth: 2, borderColor: '#fff' }] },
        options: { responsive:true, maintainAspectRatio:false, animation:{duration:400},
          plugins:{ legend:{ position:'right', labels:{ font:{size:10} } } } }
      });
    }

    const cRie = document.getElementById('chart-riesgo');
    if (cRie) {
      chartsRef.riesgo = new Chart(cRie, {
        type: 'bar',
        data: { labels: Object.keys(m.riesgo),
          datasets: [{ label:'Pacientes', data: Object.values(m.riesgo),
            backgroundColor: [C.green, C.gold, '#f97316', C.red], borderRadius:4 }] },
        options: { responsive:true, maintainAspectRatio:false, animation:{duration:400},
          plugins:{ legend:{display:false} },
          scales:{ y:{ beginAtZero:true, ticks:{ stepSize:1, precision:0 } } } }
      });
    }

    const cCom = document.getElementById('chart-comorb');
    if (cCom) {
      const lbls = ['Diabetes','HTA','ERGE','AOS','Dislipidemia'];
      const vals = [m.conDM, m.conHTA, m.conERGE, m.conAOS, m.conDisli];
      chartsRef.comorb = new Chart(cCom, {
        type: 'bar',
        data: { labels: lbls,
          datasets: [{ label:'Pacientes', data: vals,
            backgroundColor: C.teal, borderRadius:4 }] },
        options: { responsive:true, maintainAspectRatio:false, animation:{duration:400}, indexAxis:'y',
          plugins:{ legend:{display:false} },
          scales:{ x:{ beginAtZero:true, ticks:{ stepSize:1, precision:0 } } } }
      });
    }

    const cEvo = document.getElementById('chart-evol');
    if (cEvo) {
      const labels = m.evolSerie.map(x => x.hito);
      const data = m.evolSerie.map(x => x.pep);
      chartsRef.evol = new Chart(cEvo, {
        type: 'line',
        data: { labels, datasets: [{
          label: '%PEP promedio', data,
          borderColor: C.gold, backgroundColor: 'rgba(201,169,97,0.18)',
          tension:0.35, fill:true, pointBackgroundColor: C.navy, pointRadius:5, spanGaps:true
        }] },
        options: { responsive:true, maintainAspectRatio:false, animation:{duration:400},
          plugins:{ legend:{display:false} },
          scales:{ y:{ beginAtZero:true, suggestedMax:80, ticks:{ callback:v => v+'%' } } } }
      });
    }

    const cCpl = document.getElementById('chart-compl');
    if (cCpl) {
      chartsRef.compl = new Chart(cCpl, {
        type: 'bar',
        data: { labels: COMPLICACIONES_LBL,
          datasets: [{ label:'Casos', data: m.complAgg,
            backgroundColor: C.red, borderRadius:4 }] },
        options: { responsive:true, maintainAspectRatio:false, animation:{duration:400},
          plugins:{ legend:{display:false} },
          scales:{ y:{ beginAtZero:true, ticks:{ stepSize:1, precision:0 } } } }
      });
    }
  }

  function dashboardPDF() {
    const m = calcularMetricas();
    const img = (id) => {
      const c = chartsRef[id];
      return c && c.toBase64Image ? c.toBase64Image() : null;
    };

    descargarPDF({
      titulo: 'Dashboard clínico ejecutivo',
      subtitulo: 'Módulo 7 · Indicadores institucionales Avante',
      secciones: [
        { titulo: 'Indicadores clave',
          metricas: [
            { label:'Total pacientes',     valor: String(m.total) },
            { label:'IMC promedio',        valor: m.imcProm },
            { label:'Edad promedio',       valor: m.edadProm + ' a' },
            { label:'Adherencia seg.',     valor: m.tasaSeg + '%' },
            { label:'%PEP promedio',       valor: m.pepProm + '%' },
            { label:'Con seguimiento',     valor: m.conSeguimiento + '/' + m.total },
            { label:'Sin complicaciones',  valor: String(m.total - m.pacientesConCompl) },
            { label:'Con complicaciones',  valor: String(m.pacientesConCompl) }
          ] },
        { titulo: 'Distribución por procedimiento', imagen: img('proc') },
        { titulo: 'Estratificación de riesgo (clase IMC)', imagen: img('riesgo') },
        { titulo: 'Comorbilidades prevalentes', imagen: img('comorb') },
        { titulo: 'Evolución ponderal %PEP promedio', imagen: img('evol') },
        { titulo: 'Complicaciones registradas', imagen: img('compl') }
      ].filter(s => !('imagen' in s) || s.imagen),
      nombreArchivo: 'avante_dashboard.pdf',
      firmaPaciente: false
    });
  }

  function telemedicinaHTML() {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="video" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Le atendemos donde esté</h3>
        <p class="text-gray-700 mb-4">Sus controles, su nutricionista, su psicólogo: todos accesibles desde su teléfono o computadora.</p>
        <button class="btn text-white" style="background:${C.teal};">Agendar consulta virtual</button>
      </div>`;
    }
    return `<div class="space-y-2">
      <h3 class="font-bold mb-2 text-sm" style="color:${C.navy};">Modalidades de consulta virtual</h3>
      ${TIPOS_CONSULTA_VIRTUAL.map(t => `<div class="p-3 rounded border-l-4 flex justify-between items-start gap-3" style="border-color:${C.teal}; background:${C.cream};">
        <div class="flex-1">
          <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(t.tipo)}</div>
          <div class="text-xs text-gray-700 mt-1">${escapeHtml(t.ind)}</div>
        </div>
        <span class="text-xs px-2 py-1 rounded text-white whitespace-nowrap" style="background:${C.gold};">${escapeHtml(t.duracion)}</span>
      </div>`).join('')}
      <div class="p-3 rounded mt-3 text-xs" style="background:${C.cream}; color:${C.navy};">
        <strong>Alcance regional:</strong> La telemedicina permite a Avante captar pacientes de toda Centroamérica para evaluación inicial y segunda opinión, alineado con la visión de liderazgo regional.
      </div>
    </div>`;
  }

  function fidelizacionHTML() {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="award" class="w-10 h-10 mx-auto mb-3" style="color:${C.gold};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Bienvenido a Avante Care</h3>
        <p class="text-gray-700 mb-4">Su programa de membresía con beneficios exclusivos para acompañarle durante toda su transformación.</p>
        <button class="btn text-white" style="background:${C.gold};">Conocer mi membresía</button>
      </div>`;
    }
    return `<div class="space-y-4">
      <div>
        <h3 class="font-bold mb-2 text-sm" style="color:${C.navy};">Beneficios Avante Care</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          ${BENEFICIOS_AVANTE_CARE.map(b => `<div class="p-2 rounded flex gap-2 text-sm" style="background:${C.cream};">
            <i data-lucide="star" class="w-3.5 h-3.5 flex-shrink-0 mt-1" style="color:${C.gold};"></i>${escapeHtml(b)}
          </div>`).join('')}
        </div>
      </div>
      <div>
        <h3 class="font-bold mb-2 text-sm" style="color:${C.navy};">KPIs de experiencia del paciente</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          ${KPIS_EXPERIENCIA.map(k => `<div class="p-3 rounded border" style="border-color:${C.teal};">
            <div class="text-xs uppercase font-bold" style="color:${C.gold};">${escapeHtml(k.cat)}</div>
            <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(k.k)}</div>
            <div class="text-xs text-gray-600">Meta: <strong>${escapeHtml(k.meta)}</strong></div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function equipoHTML() {
    if (state.modo === 'paciente') {
      return `<div>
        <div class="p-6 rounded text-center mb-4" style="background:${C.cream};">
          <i data-lucide="users" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
          <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Un equipo completo para usted</h3>
          <p class="text-gray-700">No es solo un cirujano: es todo un equipo multidisciplinario trabajando en su bienestar.</p>
        </div>
        <div class="space-y-2">
          ${state.equipo.map(e => `<div class="p-3 rounded border-l-4" style="border-color:${C.teal}; background:${C.cream};">
            <div class="flex justify-between flex-wrap gap-1">
              <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(e.rol)}</div>
              <div class="text-xs font-medium" style="color:${C.teal};">${escapeHtml(e.persona)}</div>
            </div>
            <div class="text-xs text-gray-700 mt-1">${escapeHtml(e.resp)}</div>
          </div>`).join('')}
        </div>
      </div>`;
    }

    const ed = state.equipoEdit;
    const editando = ed.activo;
    const titEditor = ed.idx >= 0 ? 'Editar miembro' : 'Añadir miembro';
    const medicosLista = (typeof getMedicosLista === 'function' ? getMedicosLista() : []) || [];

    return `<div>
      <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div>
          <h3 class="font-bold" style="color:${C.navy};">
            <i data-lucide="users" class="w-4 h-4 inline"></i> Equipo multidisciplinario
          </h3>
          <div class="text-xs text-gray-500">${state.equipo.length} miembro(s) · editable y guardado localmente</div>
        </div>
        <div class="flex gap-2">
          <button id="eq-add" class="btn text-xs text-white flex items-center gap-1" style="background:${C.gold}; color:${C.navy};">
            <i data-lucide="user-plus" class="w-3.5 h-3.5"></i> Añadir miembro
          </button>
          <button id="eq-reset" class="btn text-xs" style="background:#e5e7eb; color:${C.navy};" title="Restaurar equipo por defecto">
            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Restaurar
          </button>
        </div>
      </div>

      ${editando ? `
        <div class="p-4 rounded-lg border mb-4" style="border-color:${C.gold}; background:${C.cream};">
          <div class="flex items-center justify-between mb-3">
            <div class="font-bold text-sm" style="color:${C.navy};">${titEditor}</div>
            <button id="eq-cancel" class="text-xs text-gray-500 hover:text-gray-700">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
          <div class="grid md:grid-cols-2 gap-2 mb-2">
            <div>
              <label class="text-xs font-medium" style="color:${C.navy};">Rol / especialidad</label>
              <input id="eq-rol" type="text" value="${escapeHtml(ed.rol)}" placeholder="Ej. Endocrinología, Nutrición…"
                     class="w-full px-2 py-1 rounded border text-sm">
            </div>
            <div>
              <label class="text-xs font-medium" style="color:${C.navy};">Nombre de la persona</label>
              <input id="eq-persona" type="text" value="${escapeHtml(ed.persona)}" placeholder="Ej. Dr. Juan Pérez"
                     class="w-full px-2 py-1 rounded border text-sm">
              ${medicosLista.length ? `
                <select id="eq-medico-sel" class="w-full px-2 py-1 rounded border text-xs mt-1" style="background:#fff;">
                  <option value="">— Tomar de lista de médicos —</option>
                  ${medicosLista.map(m => `<option value="${escapeHtml(m.nombre)}" data-cred="${escapeHtml(m.credencial||'')}">${escapeHtml(m.nombre)}${m.credencial?' · '+escapeHtml(m.credencial):''}</option>`).join('')}
                </select>` : ''}
            </div>
          </div>
          <div class="mb-3">
            <label class="text-xs font-medium" style="color:${C.navy};">Responsabilidades</label>
            <textarea id="eq-resp" rows="2" placeholder="Área de responsabilidad del miembro…"
                      class="w-full px-2 py-1 rounded border text-sm">${escapeHtml(ed.resp)}</textarea>
          </div>
          <div class="flex gap-2 justify-end">
            <button id="eq-save" class="btn text-white text-sm flex items-center gap-1" style="background:${C.teal};">
              <i data-lucide="save" class="w-3.5 h-3.5"></i> Guardar
            </button>
          </div>
        </div>
      ` : ''}

      <div class="space-y-2">
        ${state.equipo.map((e, i) => `
          <div class="p-3 rounded border-l-4 flex gap-3 items-start" style="border-color:${C.teal}; background:${C.cream};">
            <div class="flex-1 min-w-0">
              <div class="flex justify-between flex-wrap gap-1">
                <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(e.rol)}</div>
                <div class="text-xs font-medium" style="color:${C.teal};">${escapeHtml(e.persona)}</div>
              </div>
              <div class="text-xs text-gray-700 mt-1">${escapeHtml(e.resp || '')}</div>
            </div>
            <div class="flex flex-col gap-1">
              <button data-eq-up="${i}" class="text-[10px] px-2 py-0.5 rounded" style="background:#fff; color:${C.navy}; border:1px solid #e5e7eb;" title="Subir" ${i===0?'disabled style="opacity:0.3;"':''}>▲</button>
              <button data-eq-down="${i}" class="text-[10px] px-2 py-0.5 rounded" style="background:#fff; color:${C.navy}; border:1px solid #e5e7eb;" title="Bajar" ${i===state.equipo.length-1?'disabled style="opacity:0.3;"':''}>▼</button>
            </div>
            <div class="flex gap-1">
              <button data-eq-edit="${i}" class="text-xs px-2 py-1 rounded" style="background:#fff; color:${C.teal}; border:1px solid ${C.teal};" title="Editar">
                <i data-lucide="edit-2" class="w-3 h-3"></i>
              </button>
              <button data-eq-del="${i}" class="text-xs px-2 py-1 rounded" style="background:#fee2e2; color:${C.red};" title="Eliminar">
                <i data-lucide="trash-2" class="w-3 h-3"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  function wireEquipo(container) {
    const add = container.querySelector('#eq-add');
    if (add) add.addEventListener('click', () => {
      state.equipoEdit = { activo:true, idx:-1, rol:'', persona:'', resp:'' };
      render(containerRef);
    });

    const reset = container.querySelector('#eq-reset');
    if (reset) reset.addEventListener('click', () => {
      if (!confirm('¿Restaurar el equipo por defecto? Se perderán los cambios.')) return;
      state.equipo = EQUIPO_DEFAULT.slice();
      guardarEquipo();
      limpiarEdicion();
      render(containerRef);
    });

    container.querySelectorAll('[data-eq-edit]').forEach(b => b.addEventListener('click', () => {
      const i = parseInt(b.dataset.eqEdit);
      const m = state.equipo[i];
      state.equipoEdit = { activo:true, idx:i, rol:m.rol, persona:m.persona, resp:m.resp };
      render(containerRef);
    }));

    container.querySelectorAll('[data-eq-del]').forEach(b => b.addEventListener('click', () => {
      const i = parseInt(b.dataset.eqDel);
      if (!confirm(`¿Eliminar a "${state.equipo[i].persona}" del equipo?`)) return;
      state.equipo.splice(i, 1);
      guardarEquipo();
      render(containerRef);
    }));

    container.querySelectorAll('[data-eq-up]').forEach(b => b.addEventListener('click', () => {
      const i = parseInt(b.dataset.eqUp);
      if (i <= 0) return;
      [state.equipo[i-1], state.equipo[i]] = [state.equipo[i], state.equipo[i-1]];
      guardarEquipo();
      render(containerRef);
    }));
    container.querySelectorAll('[data-eq-down]').forEach(b => b.addEventListener('click', () => {
      const i = parseInt(b.dataset.eqDown);
      if (i >= state.equipo.length - 1) return;
      [state.equipo[i+1], state.equipo[i]] = [state.equipo[i], state.equipo[i+1]];
      guardarEquipo();
      render(containerRef);
    }));

    const cancel = container.querySelector('#eq-cancel');
    if (cancel) cancel.addEventListener('click', () => { limpiarEdicion(); render(containerRef); });

    const medSel = container.querySelector('#eq-medico-sel');
    if (medSel) medSel.addEventListener('change', () => {
      const opt = medSel.options[medSel.selectedIndex];
      if (!opt || !opt.value) return;
      const personaInp = container.querySelector('#eq-persona');
      const rolInp = container.querySelector('#eq-rol');
      if (personaInp) personaInp.value = opt.value;
      if (rolInp && !rolInp.value && opt.dataset.cred) rolInp.value = opt.dataset.cred;
    });

    const save = container.querySelector('#eq-save');
    if (save) save.addEventListener('click', () => {
      const rol = (container.querySelector('#eq-rol')?.value || '').trim();
      const persona = (container.querySelector('#eq-persona')?.value || '').trim();
      const resp = (container.querySelector('#eq-resp')?.value || '').trim();
      if (!rol || !persona) { alert('Rol y nombre son obligatorios.'); return; }
      const nuevo = { rol, persona, resp };
      if (state.equipoEdit.idx >= 0) {
        state.equipo[state.equipoEdit.idx] = nuevo;
      } else {
        state.equipo.push(nuevo);
      }
      guardarEquipo();
      limpiarEdicion();
      render(containerRef);
    });
  }

  function render(container) {
    containerRef = container;
    const panel = state.tab === 'dashboard'    ? dashboardHTML()
               : state.tab === 'telemedicina' ? telemedicinaHTML()
               : state.tab === 'fidelizacion' ? fidelizacionHTML()
               : equipoHTML();
    container.innerHTML = `
      <div class="min-h-screen p-4">
        <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          ${headerHTML(7, 'Dashboard · Telemedicina · Fidelización · Equipo', state.modo)}
          <div class="p-6">
            ${tabsHTML()}
            ${panel}
          </div>
        </div>
      </div>
    `;
    wire(container);
    refrescarIconos();
    if (state.tab === 'dashboard') {
      setTimeout(renderCharts, 30);
    } else {
      destruirCharts();
    }
  }

  function wire(container) {
    container.querySelectorAll('[data-modo]').forEach(b => b.addEventListener('click', () => { state.modo = b.dataset.modo; render(containerRef); }));
    container.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { state.tab = b.dataset.tab; limpiarEdicion(); render(containerRef); }));
    const bPdf = container.querySelector('#btn-dash-pdf');
    if (bPdf) bPdf.addEventListener('click', dashboardPDF);
    if (state.tab === 'equipo') wireEquipo(container);
  }

  return { render(container) { cargar(); render(container); } };
})();
