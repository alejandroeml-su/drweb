// ============================================================
// Módulo 3 · Seguimiento Postoperatorio Integral
// ============================================================

window.AvanteModulo3 = (function () {

  let _charts = [];
  function destroyCharts() {
    _charts.forEach(c => { try { c.destroy(); } catch(e){} });
    _charts = [];
  }

  const HITO_MESES = { '1m':1, '3m':3, '6m':6, '12m':12, '18m':18, '24m':24, 'anual':12 };

  const state = {
    modo:'clinico',
    pacientes:[],
    seleccionado:null,
    tab:'temprano',
    seguimientos:{},
    complicacionesMarcadas:{},
    pesoNuevo:'',
    notaNueva:'',
    hitoNuevo:'1m'
  };
  let containerRef = null;

  function cargar() {
    state.pacientes = storageGet('avante_pacientes') || [];
    state.seguimientos = storageGet('avante_seguimientos') || {};
    state.complicacionesMarcadas = storageGet('avante_complicaciones') || {};
  }

  function guardarComplicaciones() {
    storageSet('avante_complicaciones', state.complicacionesMarcadas);
  }

  const TEMPRANO = [
    { h:'24h',       items:['Signos vitales c/4h','Tolerancia a líquidos claros','Movilización activa','Drenaje (si presente): características','Dolor EVA <4','Profilaxis TEV continua'] },
    { h:'48h',       items:['Test de azul de metileno o estudio contrastado si protocolo','Avance a líquidos completos','Retirar sonda vesical si fue colocada','Egreso si criterios cumplidos'] },
    { h:'72h-1 sem', items:['Control telefónico 24-48h post-egreso','Dieta líquida hiperproteica','Hidratación ≥1.5L/día','Profilaxis TEV extendida (HBPM 2-4 sem)','Signos de alarma: taquicardia >120, fiebre, dolor abdominal severo'] }
  ];

  const FASES = [
    { fase:'Fase 1 - Líquidos claros',   tiempo:'Día 1-3',   contenido:'Agua, caldo desgrasado, gelatina sin azúcar, té. 30mL c/15min.' },
    { fase:'Fase 2 - Líquidos completos',tiempo:'Día 4-14',  contenido:'Proteína en polvo (60g/día), leche descremada/almendras, yogurt líquido. Sin azúcar.' },
    { fase:'Fase 3 - Purés',             tiempo:'Sem 3-4',   contenido:'Proteína blanda (huevo, atún, pollo molido), verduras cocidas en puré. 3 comidas + 2 colaciones.' },
    { fase:'Fase 4 - Sólidos blandos',   tiempo:'Sem 5-6',   contenido:'Pescado, pollo desmenuzado, vegetales cocidos. Masticar 20-30 veces.' },
    { fase:'Fase 5 - Dieta regular',     tiempo:'Sem 7+',    contenido:'Dieta hiperproteica 60-80g/día, evitar azúcares simples, hidratación entre comidas.' }
  ];

  function suplementacion(proc) {
    const base = [
      'Multivitamínico bariátrico 2/día (con hierro)',
      'Calcio citrato 1200-1500mg/día (dividido)',
      'Vitamina D3 3000 UI/día',
      'Vitamina B12 500mcg SL/día o 1000mcg IM mensual',
      'Tiamina 12mg/día (50-100mg primeros 3 meses)'
    ];
    if (['rygb','oagb','rev_sg_rygb','rev_sg_oagb'].includes(proc)) {
      base.push('Hierro elemental 45-60mg/día (mujeres premenopáusicas: 2 dosis)');
    }
    if (['sadis','bpdds'].includes(proc)) {
      base.push('Hierro elemental 60-100mg/día');
      base.push('Vitaminas liposolubles: A 10000 UI, E 400 UI, K 300mcg');
      base.push('Zinc 16mg/día + Cobre 2mg/día');
    }
    return base;
  }

  const LABS = {
    '1m':   ['Hemograma','Glucosa','Creatinina','Electrolitos','PFH'],
    '3m':   ['Hemograma','Glucosa/HbA1c','Perfil lipídico','PFH','Hierro/ferritina','B12','Vit D','PTH','Albúmina'],
    '6m':   ['Igual que 3m + Ácido fólico, Zinc, Calcio iónico'],
    '12m':  ['Panel bariátrico completo: hemograma, química, hierro/ferritina, B12, fólico, vit D, PTH, calcio, zinc, cobre, A/E (si malabsortivo), tiamina'],
    'anual':['Panel bariátrico completo + DEXA si >40a o factores riesgo']
  };

  const COMPLICACIONES = [
    { sx:'Taquicardia >120 + dolor + fiebre',                                         dx:'Sospecha fuga anastomótica',                        accion:'TC con contraste oral urgente. Reintervención si confirma. Mortalidad sin diagnóstico oportuno: alta.', gravedad:'critico' },
    { sx:'Disnea súbita + taquicardia + desaturación',                                dx:'TEP',                                               accion:'Angio-TC urgente. Anticoagulación terapéutica.',                                                        gravedad:'critico' },
    { sx:'Vómito persistente + intolerancia oral',                                    dx:'Estenosis / edema anastomótico / torsión',          accion:'Endoscopía + estudio contrastado. Hidratación IV + tiamina.',                                           gravedad:'importante' },
    { sx:'Dolor abdominal cólico tardío (>30d) + vómito biliar',                      dx:'Hernia interna (RYGB/OAGB)',                        accion:'TC abdominal. Laparoscopía exploradora urgente si sospecha alta.',                                      gravedad:'critico' },
    { sx:'Pirosis + regurgitación post-manga',                                        dx:'ERGE de novo / hernia hiatal',                      accion:'IBP. Manometría + pHmetría. Considerar conversión a RYGB.',                                             gravedad:'importante' },
    { sx:'Ictericia + dolor HCD + colangitis',                                        dx:'Coledocolitiasis post-bariátrica',                  accion:'CPRE convencional (manga) o asistida por laparoscopía/EUS (RYGB). Su área de expertise.',               gravedad:'importante' },
    { sx:'Pérdida ponderal insuficiente (<50% PEP a 18m)',                            dx:'Falla del procedimiento',                           accion:'Estudio metabólico, evaluar adherencia, considerar revisión quirúrgica.',                              gravedad:'rutina' },
    { sx:'Confusión + ataxia + nistagmo',                                             dx:'Encefalopatía de Wernicke (déficit B1)',            accion:'EMERGENCIA. Tiamina 500mg IV c/8h x 3 días ANTES de cualquier glucosa.',                                gravedad:'critico' },
    { sx:'Anemia + fatiga + palidez',                                                 dx:'Deficiencia de hierro/B12',                         accion:'Hierro IV si refractario a oral. B12 IM. Investigar malabsorción.',                                     gravedad:'importante' },
    { sx:'Síncope postprandial + sudoración',                                         dx:'Síndrome de dumping (RYGB)',                        accion:'Modificación dietaria, evitar azúcares simples. Acarbosa si persiste.',                                 gravedad:'importante' }
  ];

  function guardarSeguimiento() {
    if (!state.seleccionado || !state.pesoNuevo) return;
    const id = state.seleccionado.id;
    const lista = state.seguimientos[id] || [];
    lista.push({
      id: Date.now().toString(),
      hito: state.hitoNuevo,
      peso: state.pesoNuevo,
      nota: state.notaNueva || '',
      fecha: new Date().toISOString()
    });
    state.seguimientos[id] = lista;
    storageSet('avante_seguimientos', state.seguimientos);
    state.pesoNuevo = '';
    state.notaNueva = '';
    render(containerRef);
  }

  function eliminarSeguimiento(pacienteId, entryId) {
    const lista = state.seguimientos[pacienteId] || [];
    state.seguimientos[pacienteId] = lista.filter(x => x.id !== entryId);
    storageSet('avante_seguimientos', state.seguimientos);
    render(containerRef);
  }

  function exportar() {
    const p = state.seleccionado;
    if (!p) return;
    const segs = state.seguimientos[p.id] || [];
    const complMarcadas = state.complicacionesMarcadas[p.id] || {};

    const evolucionTxt = segs.length
      ? segs.map(s => {
          const ptpV = ptp(p.peso, s.peso).toFixed(1);
          const pepV = pep(p.peso, s.peso, p.talla).toFixed(1);
          const imcAct = (parseFloat(s.peso) / Math.pow(parseFloat(p.talla) / 100, 2)).toFixed(1);
          const fecha = new Date(s.fecha).toLocaleDateString('es-SV');
          let line = `${s.hito} (${fecha}) — Peso: ${s.peso} kg | IMC: ${imcAct} | %PTP: ${ptpV}% | %PEP: ${pepV}%`;
          if (s.nota) line += '\n   Nota: ' + s.nota;
          return line;
        }).join('\n\n')
      : 'Sin registros de seguimiento.';

    const complTxt = Object.keys(complMarcadas).filter(k => complMarcadas[k]).length
      ? COMPLICACIONES
          .map((c, i) => complMarcadas[i] ? `• [${c.gravedad.toUpperCase()}] ${c.sx} → ${c.dx}\n   Conducta: ${c.accion}` : null)
          .filter(Boolean)
          .join('\n\n')
      : 'El paciente no ha presentado complicaciones registradas.';

    descargarPDF({
      titulo: 'Seguimiento postoperatorio',
      subtitulo: 'Módulo 3 · Evolución clínica y ponderal',
      paciente: p,
      secciones: [
        { titulo: 'Datos base',
          texto: `Peso inicial: ${p.peso} kg\nTalla: ${p.talla} cm\nIMC inicial: ${imc(p).toFixed(1)} kg/m²\nProcedimiento: ${PROCS[p.procedimiento]}` },
        { titulo: 'Evolución ponderal y notas clínicas', texto: evolucionTxt },
        { titulo: 'Complicaciones presentadas', texto: complTxt },
        { titulo: 'Suplementación indicada', texto: suplementacion(p.procedimiento).map(x => '• ' + x).join('\n') }
      ],
      nombreArchivo: `avante_seguimiento_${(p.nombre || 'paciente').replace(/\s+/g,'_')}.pdf`
    });
  }

  // ----------------------- UI -----------------------

  function tabsHTML() {
    const tabs = [
      { id:'temprano',       icon:'calendar',       l:'Temprano' },
      { id:'tardio',         icon:'trending-down',  l:'Evolución' },
      { id:'nutricion',      icon:'apple',          l:'Nutrición' },
      { id:'complicaciones', icon:'alert-octagon',  l:'Complicaciones' }
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

  function tempranoHTML() {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="calendar" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Sus primeros días con nosotros</h3>
        <p class="text-gray-700 mb-4">Le acompañaremos cada hora durante su recuperación inicial. Cualquier inquietud, su equipo está disponible 24/7.</p>
        <button class="btn text-white" style="background:${C.teal};">Línea de atención Avante</button>
      </div>`;
    }
    return `<div class="space-y-3">
      ${TEMPRANO.map(b => `
        <div class="p-4 rounded border-l-4" style="background:${C.cream}; border-color:${C.teal};">
          <div class="font-bold mb-2" style="color:${C.navy};">${b.h}</div>
          <ul class="space-y-1">
            ${b.items.map(x => `<li class="text-sm flex gap-2">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5 flex-shrink-0 mt-1" style="color:${C.teal};"></i>${escapeHtml(x)}
            </li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>`;
  }

  function tardioHTML() {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="heart" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Su transformación, paso a paso</h3>
        <p class="text-gray-700">Celebraremos juntos cada control: 1, 3, 6 y 12 meses. Su progreso es nuestro mayor logro.</p>
      </div>`;
    }
    const p = state.seleccionado;
    const segs = state.seguimientos[p.id] || [];
    return `<div>
      <div class="p-3 rounded mb-3" style="background:${C.cream};">
        <div class="flex gap-2 items-end flex-wrap mb-2">
          <div class="flex-1 min-w-32">
            <label class="text-xs font-medium">Hito</label>
            <select id="sel-hito" class="w-full px-2 py-1 rounded border text-sm">
              ${['1m','3m','6m','12m','18m','24m','anual'].map(h => `<option ${state.hitoNuevo===h?'selected':''}>${h}</option>`).join('')}
            </select>
          </div>
          <div class="flex-1 min-w-32">
            <label class="text-xs font-medium">Peso actual (kg)</label>
            <input id="inp-peso" type="number" value="${escapeHtml(state.pesoNuevo)}" class="w-full px-2 py-1 rounded border text-sm">
          </div>
          <button id="btn-registrar" class="btn text-white text-sm flex items-center gap-1" style="background:${C.gold};">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Registrar
          </button>
        </div>
        <label class="text-xs font-medium">Nota clínica de la visita (opcional)</label>
        <textarea id="inp-nota" rows="2" class="w-full px-2 py-1 rounded border text-sm"
          placeholder="Síntomas, adherencia dietaria, examen físico, laboratorios, plan…">${escapeHtml(state.notaNueva)}</textarea>
      </div>
      ${segs.length ? `<div class="space-y-2 mb-4">
        ${segs.map(s => {
          const ptpV = ptp(p.peso, s.peso);
          const pepV = pep(p.peso, s.peso, p.talla);
          const meta = pepV >= 50 ? 'green' : pepV >= 25 ? 'yellow' : 'red';
          const imcAct = (parseFloat(s.peso) / Math.pow(parseFloat(p.talla)/100, 2)).toFixed(1);
          return `<div class="p-3 rounded border">
            <div class="flex justify-between items-start gap-2 mb-2">
              <div>
                <div class="font-bold text-sm" style="color:${C.navy};">${s.hito} · ${new Date(s.fecha).toLocaleDateString()}</div>
                <div class="text-xs text-gray-600">${s.peso} kg · IMC actual ${imcAct}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-bold" style="color:${C[meta]};">%PEP ${pepV.toFixed(1)}%</div>
                <div class="text-xs text-gray-600">%PTP ${ptpV.toFixed(1)}%</div>
              </div>
              <button data-seg-del="${s.id}" class="text-xs px-2 py-1 rounded" style="background:#fee2e2; color:${C.red};" title="Eliminar">🗑</button>
            </div>
            <textarea data-seg-nota="${s.id}" rows="2" class="w-full px-2 py-1 rounded border text-xs"
              placeholder="Nota clínica…">${escapeHtml(s.nota || '')}</textarea>
          </div>`;
        }).join('')}
      </div>` : ''}
      <div class="p-4 rounded border mb-3" style="border-color:${C.teal}; background:#fff;">
        <div class="flex items-center justify-between mb-2">
          <div class="font-bold text-sm" style="color:${C.navy};">
            <i data-lucide="trending-down" class="w-4 h-4 inline"></i>
            Proyección vs. evolución real — ${PROCS[p.procedimiento] || ''}
          </div>
          <div class="text-[10px] text-gray-500">Referencia: literatura · 12 meses</div>
        </div>
        <div style="position:relative; height:260px;">
          <canvas id="chart-proyeccion-seg"></canvas>
        </div>
        <div class="text-[10px] text-gray-500 mt-2 italic">
          Línea dorada: trayectoria promedio esperada de %TWL según procedimiento (SLEEVEPASS, SM-BOSS, STAMPEDE, IFSO Global Registry). Puntos teal: mediciones reales del paciente.
        </div>
      </div>
      <div class="p-3 rounded border" style="border-color:${C.teal};">
        <div class="font-bold text-sm mb-2" style="color:${C.navy};">Laboratorios sugeridos por hito</div>
        ${Object.entries(LABS).map(([k,v]) => `<div class="text-xs mb-1"><strong>${k}:</strong> ${Array.isArray(v)?v.join(', '):v}</div>`).join('')}
      </div>
    </div>`;
  }

  function initProyeccionSegChart() {
    const p = state.seleccionado;
    if (!p || state.tab !== 'tardio') return;
    const canvas = document.getElementById('chart-proyeccion-seg');
    if (!canvas || typeof Chart === 'undefined') return;
    if (!window.AvanteModulo1 || !window.AvanteModulo1.trayectoriaPaciente) return;

    const tray = window.AvanteModulo1.trayectoriaPaciente(p);
    const pesoInicial = parseFloat(p.peso) || 0;
    const segs = state.seguimientos[p.id] || [];

    const realesTWL = segs.map(s => {
      const mes = HITO_MESES[s.hito] || 0;
      const pesoAct = parseFloat(s.peso) || 0;
      const twl = pesoInicial ? ((pesoInicial - pesoAct) / pesoInicial) * 100 : 0;
      return { x: mes, y: +twl.toFixed(1) };
    }).filter(pt => pt.x >= 0 && pt.x <= 12);

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: tray.meses,
        datasets: [
          {
            label: '%TWL esperado',
            data: tray.twlPct,
            borderColor: '#C9A961',
            backgroundColor: 'rgba(201,169,97,0.15)',
            fill: true,
            tension: 0.3,
            pointRadius: 3
          },
          {
            label: '%TWL real del paciente',
            data: realesTWL,
            borderColor: '#14B8A6',
            backgroundColor: '#14B8A6',
            showLine: false,
            pointRadius: 6,
            pointHoverRadius: 8,
            parsing: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            min: 0,
            max: 12,
            title: { display: true, text: 'Meses desde cirugía' },
            ticks: { stepSize: 1 }
          },
          y: {
            title: { display: true, text: '% pérdida de peso total (%TWL)' },
            beginAtZero: true
          }
        },
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`
            }
          }
        }
      }
    });
    _charts.push(chart);
  }

  function nutricionHTML() {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="apple" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Su nueva relación con la comida</h3>
        <p class="text-gray-700">Nuestro equipo de nutrición le guiará en cada fase para que recupere fuerza y disfrute comer.</p>
      </div>`;
    }
    const p = state.seleccionado;
    return `<div class="space-y-3">
      <div>
        <h3 class="font-bold mb-2 text-sm" style="color:${C.navy};">Fases dietarias</h3>
        <div class="space-y-2">
          ${FASES.map(f => `<div class="p-3 rounded border-l-4" style="background:${C.cream}; border-color:${C.gold};">
            <div class="font-bold text-sm" style="color:${C.navy};">${f.fase} <span class="text-xs font-normal text-gray-500">· ${f.tiempo}</span></div>
            <div class="text-xs text-gray-700 mt-1">${escapeHtml(f.contenido)}</div>
          </div>`).join('')}
        </div>
      </div>
      <div>
        <h3 class="font-bold mb-2 text-sm" style="color:${C.navy};">Suplementación para ${PROCS[p.procedimiento]}</h3>
        <ul class="space-y-1 p-3 rounded" style="background:${C.cream};">
          ${suplementacion(p.procedimiento).map(s => `<li class="text-sm flex gap-2">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5 flex-shrink-0 mt-1" style="color:${C.teal};"></i>${escapeHtml(s)}
          </li>`).join('')}
        </ul>
      </div>
    </div>`;
  }

  function complicacionesHTML() {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="shield" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Si algo no se siente bien, llámenos</h3>
        <p class="text-gray-700 mb-4">Fiebre, dolor severo, vómito persistente o falta de aire son señales para contactarnos de inmediato.</p>
        <button class="btn text-white" style="background:${C.red};">Línea de emergencia 24/7</button>
      </div>`;
    }
    const p = state.seleccionado;
    const marcadas = state.complicacionesMarcadas[p.id] || {};
    const totalMarcadas = Object.keys(marcadas).filter(k => marcadas[k]).length;
    return `<div>
      <div class="p-3 rounded mb-3 text-xs" style="background:${C.cream}; color:${C.navy};">
        <i data-lucide="check-square" class="w-3.5 h-3.5 inline"></i>
        Marque las complicaciones que el paciente ha presentado. Quedarán registradas en el PDF de seguimiento.
        ${totalMarcadas ? `<span class="ml-2 font-bold" style="color:${C.red};">${totalMarcadas} marcada(s)</span>` : ''}
      </div>
      <div class="space-y-2">
      ${COMPLICACIONES.map((c, i) => {
        const col = c.gravedad === 'critico' ? C.red : c.gravedad === 'importante' ? C.yellow : C.teal;
        const icon = c.gravedad === 'critico' ? 'alert-circle' : c.gravedad === 'importante' ? 'alert-triangle' : 'check-circle-2';
        const checked = marcadas[i] ? 'checked' : '';
        return `<label class="p-3 rounded border-l-4 flex gap-3 cursor-pointer" style="border-color:${col}; background:${marcadas[i] ? '#fef2f2' : C.cream};">
          <input type="checkbox" data-comp-idx="${i}" ${checked} class="mt-1 flex-shrink-0">
          <i data-lucide="${icon}" class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:${col};"></i>
          <div class="flex-1">
            <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(c.sx)}</div>
            <div class="text-xs text-gray-600 italic">→ ${escapeHtml(c.dx)}</div>
            <div class="text-sm text-gray-700 mt-1">${escapeHtml(c.accion)}</div>
          </div>
        </label>`;
      }).join('')}
      </div>
    </div>`;
  }

  function render(container) {
    containerRef = container;
    destroyCharts();
    container.innerHTML = `
      <div class="min-h-screen p-4">
        <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          ${headerHTML(3, 'Seguimiento Postoperatorio Integral', state.modo)}
          <div class="p-6">
            ${!state.seleccionado ? `
              <h2 class="font-bold mb-3 flex items-center gap-2" style="color:${C.navy};">
                <i data-lucide="users" class="w-5 h-5"></i> Pacientes operados
              </h2>
              ${listaPacientesHTML(state.pacientes)}
            ` : (() => {
              const p = state.seleccionado;
              const panel = state.tab === 'temprano' ? tempranoHTML()
                         : state.tab === 'tardio'   ? tardioHTML()
                         : state.tab === 'nutricion' ? nutricionHTML()
                         : complicacionesHTML();
              return `
                <div class="flex justify-between items-center mb-4 p-3 rounded flex-wrap gap-2" style="background:${C.cream};">
                  <div>
                    <div class="font-bold" style="color:${C.navy};">${escapeHtml(p.nombre)}</div>
                    <div class="text-xs text-gray-600">${escapeHtml(PROCS[p.procedimiento] || '')} · Peso inicial ${escapeHtml(p.peso)}kg · IMC ${imc(p).toFixed(1)}</div>
                  </div>
                  <div class="flex gap-2">
                    <button id="btn-exportar" class="btn text-white text-sm flex items-center gap-1" style="background:${C.teal};">
                      <i data-lucide="download" class="w-3.5 h-3.5"></i> Exportar
                    </button>
                    <button id="btn-cambiar" class="btn text-sm" style="background:#e5e7eb;">Cambiar</button>
                  </div>
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
  }

  function wire(container) {
    container.querySelectorAll('[data-modo]').forEach(b => b.addEventListener('click', () => { state.modo = b.dataset.modo; render(containerRef); }));
    container.querySelectorAll('[data-paciente-id]').forEach(b => b.addEventListener('click', () => {
      state.seleccionado = state.pacientes.find(p => p.id === b.dataset.pacienteId);
      render(containerRef);
    }));
    container.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { state.tab = b.dataset.tab; render(containerRef); }));
    const bc = container.querySelector('#btn-cambiar');
    if (bc) bc.addEventListener('click', () => { state.seleccionado = null; render(containerRef); });
    const be = container.querySelector('#btn-exportar');
    if (be) be.addEventListener('click', exportar);
    const sh = container.querySelector('#sel-hito');
    if (sh) sh.addEventListener('change', e => { state.hitoNuevo = e.target.value; });
    const ip = container.querySelector('#inp-peso');
    if (ip) ip.addEventListener('input', e => { state.pesoNuevo = e.target.value; });
    const inota = container.querySelector('#inp-nota');
    if (inota) inota.addEventListener('input', e => { state.notaNueva = e.target.value; });
    const br = container.querySelector('#btn-registrar');
    if (br) br.addEventListener('click', guardarSeguimiento);

    container.querySelectorAll('[data-seg-nota]').forEach(t => {
      t.addEventListener('input', e => {
        const p = state.seleccionado;
        if (!p) return;
        const lista = state.seguimientos[p.id] || [];
        const entry = lista.find(x => x.id === t.dataset.segNota);
        if (entry) {
          entry.nota = e.target.value;
          storageSet('avante_seguimientos', state.seguimientos);
        }
      });
    });
    container.querySelectorAll('[data-seg-del]').forEach(b => {
      b.addEventListener('click', () => {
        if (!confirm('¿Eliminar este registro de seguimiento?')) return;
        eliminarSeguimiento(state.seleccionado.id, b.dataset.segDel);
      });
    });
    container.querySelectorAll('[data-comp-idx]').forEach(cb => {
      cb.addEventListener('change', e => {
        const p = state.seleccionado;
        if (!p) return;
        if (!state.complicacionesMarcadas[p.id]) state.complicacionesMarcadas[p.id] = {};
        state.complicacionesMarcadas[p.id][cb.dataset.compIdx] = e.target.checked;
        guardarComplicaciones();
        render(containerRef);
      });
    });

    if (state.seleccionado && state.tab === 'tardio') {
      setTimeout(initProyeccionSegChart, 0);
    }
  }

  return {
    render(container) { cargar(); render(container); }
  };
})();
