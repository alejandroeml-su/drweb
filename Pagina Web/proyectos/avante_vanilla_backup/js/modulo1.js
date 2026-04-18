// ============================================================
// Módulo 1 · Estratificación de Riesgo Quirúrgico Bariátrico
// ============================================================

window.AvanteModulo1 = (function () {

  const state = {
    modo: 'clinico',
    paso: 0,
    paciente: JSON.parse(JSON.stringify(EMPTY_PATIENT)),
    pacientes: [],
    vista: 'formulario',
    filtroBusqueda: ''
  };

  let containerRef = null;
  let _charts = [];
  function destroyCharts() {
    _charts.forEach(c => { try { c.destroy(); } catch(e){} });
    _charts = [];
  }

  // Trayectoria promedio de %TWL (total weight loss) mes a mes 0-12,
  // derivada de promedios publicados: SLEEVEPASS (JAMA Surg 2022),
  // SM-BOSS (JAMA 2018), STAMPEDE (NEJM 2017), IFSO Global Registry.
  const TRAYECTORIAS_TWL = {
    sleeve:      [0,  7, 12, 16, 20, 23, 25, 27, 28, 29, 29, 30, 30],
    rygb:        [0,  8, 14, 19, 23, 27, 30, 32, 33, 34, 34, 35, 35],
    oagb:        [0,  8, 14, 19, 24, 28, 31, 33, 34, 35, 35, 35, 35],
    sadis:       [0,  9, 16, 22, 27, 31, 34, 36, 37, 38, 38, 38, 38],
    bpdds:       [0,  9, 17, 23, 28, 32, 35, 37, 39, 40, 41, 41, 42],
    rev_sg_rygb: [0,  4,  7, 10, 12, 14, 15, 16, 17, 18, 18, 19, 19],
    rev_sg_oagb: [0,  4,  7, 10, 12, 14, 15, 16, 17, 18, 18, 19, 19]
  };

  function trayectoriaPaciente(p) {
    const peso = parseFloat(p.peso) || 0;
    const twl = TRAYECTORIAS_TWL[p.procedimiento] || TRAYECTORIAS_TWL.sleeve;
    return {
      meses: [0,1,2,3,4,5,6,7,8,9,10,11,12],
      twlPct: twl,
      pesoProy: twl.map(pct => +(peso * (1 - pct/100)).toFixed(1))
    };
  }

  // Descripciones clínicas del EOSS (Sharma & Kushner, Int J Obes 2009)
  // por dimensión y estadio, con ejemplos concretos para facilitar el puntaje.
  const EOSS_STAGES = {
    metabolico: [
      { stage:0, titulo:'Sin factores',           ej:'Glucosa, presión arterial, perfil lipídico y función hepática totalmente normales.' },
      { stage:1, titulo:'Factores subclínicos',   ej:'Pre-diabetes (HbA1c 5.7–6.4%), pre-hipertensión, dislipidemia leve, esteatosis hepática sin fibrosis.' },
      { stage:2, titulo:'Enfermedad establecida', ej:'DM2, HTA, dislipidemia, AOS, SOP o NASH que requieren tratamiento médico.' },
      { stage:3, titulo:'Daño de órgano blanco',  ej:'Infarto previo, insuficiencia cardiaca, nefropatía, retinopatía o neuropatía diabética.' },
      { stage:4, titulo:'Enfermedad terminal',    ej:'Insuficiencia cardiaca/renal avanzada, ECV incapacitante, complicaciones metabólicas graves.' }
    ],
    mecanico: [
      { stage:0, titulo:'Sin síntomas',           ej:'Sin dolor articular, disnea de esfuerzo ni limitaciones físicas atribuibles al peso.' },
      { stage:1, titulo:'Molestias leves',        ej:'Dolor articular ocasional, disnea con ejercicio intenso, fatiga leve esporádica.' },
      { stage:2, titulo:'Limitación moderada',    ej:'Artrosis sintomática de rodilla/cadera, dolor lumbar crónico, disnea con actividades cotidianas.' },
      { stage:3, titulo:'Limitación importante',  ej:'Movilidad significativamente limitada, necesidad de ayuda para algunas actividades diarias.' },
      { stage:4, titulo:'Discapacidad severa',    ej:'Dependencia para actividades básicas, silla de ruedas, disnea en reposo.' }
    ],
    psico: [
      { stage:0, titulo:'Bienestar',              ej:'Buen estado de ánimo, sin estigma percibido, red social funcional, sin trastornos psiquiátricos.' },
      { stage:1, titulo:'Estrés leve',            ej:'Preocupación por el peso, baja autoestima, estrés leve, sin diagnóstico psiquiátrico.' },
      { stage:2, titulo:'Trastorno establecido',  ej:'Depresión o ansiedad leve-moderada, trastorno por atracón, en tratamiento activo.' },
      { stage:3, titulo:'Trastorno severo',       ej:'Depresión mayor, trastorno de conducta alimentaria severo, ideación suicida previa.' },
      { stage:4, titulo:'Incapacitante',          ej:'Psicopatología severa e incapacitante, hospitalización psiquiátrica previa o actual.' }
    ]
  };

  function cargar() {
    state.pacientes = storageGet('avante_pacientes') || [];
    // Auto-generar expediente al abrir formulario nuevo
    if (!state.paciente.expediente) {
      state.paciente.expediente = siguienteExpediente();
    }
  }

  function guardarPacientes() {
    storageSet('avante_pacientes', state.pacientes);
  }

  function guardarPaciente() {
    if (state.paciente.medicoIngresoNombre) {
      const lista = getMedicosLista();
      if (!lista.find(x => x.nombre === state.paciente.medicoIngresoNombre)) {
        agregarMedicoALista({ nombre: state.paciente.medicoIngresoNombre, credencial: '', registro: '' });
      }
    }
    const medicoActivo = getMedicosLista().find(x => x.nombre === state.paciente.medicoIngresoNombre) || getMedico();
    // Confirmar consumo del correlativo sólo si no se editó
    confirmarExpediente(state.paciente.expediente);
    const nuevo = {
      ...state.paciente,
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      medicoIngreso: medicoActivo
    };
    state.pacientes.push(nuevo);
    guardarPacientes();
    state.paciente = JSON.parse(JSON.stringify(EMPTY_PATIENT));
    state.paciente.expediente = siguienteExpediente();
    state.paso = 0;
    state.vista = 'lista';
    render(containerRef);
  }

  function eliminarPaciente(id) {
    if (!confirm('¿Eliminar este paciente?')) return;
    state.pacientes = state.pacientes.filter(p => p.id !== id);
    guardarPacientes();
    render(containerRef);
  }

  function exportarCSV() {
    const headers = ['Fecha','Expediente','Nombre','Edad','Sexo','IMC','Procedimiento','OS-MRS','Clase','EOSS','Caprini','Riesgo Integrado','Médico'];
    const rows = state.pacientes.map(p => {
      const s = scoreIntegrado(p);
      return [
        p.fecha, p.expediente || '', p.nombre, p.edad, p.sexo,
        imc(p).toFixed(1),
        PROCS[p.procedimiento] || p.procedimiento,
        s.osmrs.score, s.osmrs.clase, s.eoss, s.caprini,
        s.valor + ' (' + s.nivel + ')',
        (p.medicoIngreso && p.medicoIngreso.nombre) || ''
      ];
    });
    descargarCSV([headers, ...rows], 'avante_pacientes.csv');
  }

  // -------- Importación de pacientes desde archivo JSON --------
  function importarPacientesArchivo(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) throw new Error('not array');
        if (!confirm(t('confirmarImportar'))) return;
        const base = Date.now();
        const normalizados = data.map((p, i) => ({
          ...JSON.parse(JSON.stringify(EMPTY_PATIENT)),
          ...p,
          id: (base + i).toString(),
          fecha: p.fecha || new Date().toISOString()
        }));
        state.pacientes = state.pacientes.concat(normalizados);
        guardarPacientes();
        alert(t('importadoOk')(normalizados.length));
        render(containerRef);
      } catch (err) {
        alert(t('importadoError'));
      }
    };
    reader.readAsText(file);
  }

  function reportePDF(p) {
    const s = scoreIntegrado(p);
    const recs = recomendaciones(p);
    const comorbTxt = Object.entries(p.comorbilidades || {})
      .filter(([,v]) => v)
      .map(([k]) => {
        const c = COMORBIDITIES.find(x => x.id === k);
        return c ? '• ' + c.label : '';
      })
      .filter(Boolean)
      .join('\n') || 'Sin comorbilidades registradas.';

    const secciones = [
      { titulo: 'Historia clínica', texto: p.historia ? p.historia : 'No se registró historia clínica.' },
      { titulo: 'Antropometría y datos básicos',
        texto: `Peso: ${p.peso || '—'} kg\nTalla: ${p.talla || '—'} cm\nIMC: ${imc(p).toFixed(1)} kg/m²\nEstado funcional: ${p.funcional}\nASA: ${p.asa}` },
      { titulo: 'Comorbilidades', texto: comorbTxt }
    ];
    if (p.otrosAntecedentes && p.otrosAntecedentes.trim()) {
      secciones.push({ titulo: 'Otros antecedentes personales', texto: p.otrosAntecedentes });
    }
    // Proyección de pérdida de peso si hay datos suficientes
    if (p.peso && p.procedimiento) {
      const tray = trayectoriaPaciente(p);
      const pesoFinal = tray.pesoProy[12];
      const twlFinal = tray.twlPct[12];
      const kgPerdidos = (parseFloat(p.peso) - pesoFinal).toFixed(1);
      const imcFinal = p.talla ? (pesoFinal / Math.pow(parseFloat(p.talla)/100, 2)).toFixed(1) : '—';
      secciones.push({
        titulo: 'Proyección de pérdida de peso a 12 meses',
        texto:
`Procedimiento: ${PROCS[p.procedimiento] || '—'}
Peso inicial: ${p.peso} kg → Peso proyectado a 12m: ${pesoFinal} kg
Pérdida esperada: ${kgPerdidos} kg (${twlFinal}% del peso total)
IMC proyectado a 12m: ${imcFinal} kg/m²

Trayectoria mensual (%TWL):
${tray.meses.map((m, i) => `  Mes ${m}: ${tray.twlPct[i]}% (${tray.pesoProy[i]} kg)`).join('\n')}

Estimación basada en promedios publicados: SLEEVEPASS (JAMA Surg 2022), SM-BOSS (JAMA 2018), STAMPEDE (NEJM 2017), IFSO Global Registry. Los resultados individuales varían según adherencia, comorbilidades y factores biológicos.`,
        metricas: [
          { label:'Peso inicial',  valor: p.peso + ' kg' },
          { label:'Peso a 12m',    valor: pesoFinal + ' kg' },
          { label:'Kg a perder',   valor: '−' + kgPerdidos },
          { label:'%TWL esperado', valor: twlFinal + '%' },
          { label:'IMC actual',    valor: imc(p).toFixed(1) },
          { label:'IMC a 12m',     valor: imcFinal }
        ]
      });
    }

    secciones.push(
      { titulo: 'Escalas de riesgo',
        texto:
`OS-MRS: ${s.osmrs.score}/5 — Clase ${s.osmrs.clase} — Mortalidad esperada ${s.osmrs.mortalidad}
EOSS: Estadio ${s.eoss}
Caprini: ${s.caprini} puntos
Riesgo integrado: ${s.valor}/100 (${s.nivel.toUpperCase()})` },
      { titulo: 'Recomendaciones clínicas',
        texto: recs.length ? recs.map(r => `[${r.tipo.toUpperCase()}] ${r.texto}`).join('\n') : 'Sin recomendaciones adicionales.' }
    );

    descargarPDF({
      titulo: 'Estratificación de Riesgo Quirúrgico Bariátrico',
      subtitulo: 'Módulo 1 · Evaluación preoperatoria',
      paciente: p,
      secciones,
      nombreArchivo: `avante_riesgo_${(p.nombre || 'paciente').replace(/\s+/g,'_')}.pdf`
    });
  }

  // --------------------- Plantillas ---------------------

  function selectorIdiomaHTML() {
    const actual = getIdioma();
    return `<select id="sel-idioma" class="input-base" style="max-width:190px;">
      ${IDIOMAS_DISPONIBLES.map(i => `<option value="${i.code}" ${i.code===actual?'selected':''}>${i.flag} ${i.label}</option>`).join('')}
    </select>`;
  }

  function pasosHTML() {
    const titulos = t('pasos');
    return `<div class="flex justify-between mb-6 flex-wrap gap-2">
      ${titulos.map((tt,i) => {
        const bg = state.paso === i ? C.teal : (i < state.paso ? C.gold : '#e5e7eb');
        const col = state.paso >= i ? 'white' : '#6b7280';
        return `<div data-ir-paso="${i}" class="flex-1 min-w-fit cursor-pointer text-center px-2 py-2 rounded text-xs font-medium"
          style="background:${bg}; color:${col};">${i+1}. ${tt}</div>`;
      }).join('')}
    </div>`;
  }

  function pasoContentHTML() {
    const p = state.paciente;
    const iCls = 'input-base';
    if (state.paso === 0) {
      const medicoSel = p.medicoIngresoNombre || getMedico().nombre;
      return `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="text-sm font-medium">${t('nombreCompleto')}</label>
          <input class="${iCls}" data-campo="nombre" value="${escapeHtml(p.nombre)}"></div>
        <div><label class="text-sm font-medium">${t('expediente')}</label>
          <input class="${iCls}" data-campo="expediente" value="${escapeHtml(p.expediente)}" placeholder="${t('expedientePlaceholder')}"></div>
        <div><label class="text-sm font-medium">${t('edad')}</label>
          <input type="number" class="${iCls}" data-campo="edad" value="${escapeHtml(p.edad)}"></div>
        <div><label class="text-sm font-medium">${t('sexo')}</label>
          <select class="${iCls}" data-campo="sexo">
            <option value="M" ${p.sexo==='M'?'selected':''}>${t('masculino')}</option>
            <option value="F" ${p.sexo==='F'?'selected':''}>${t('femenino')}</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="text-sm font-medium">${t('medicoIngresa')}</label>
          <p class="text-xs text-gray-500 mb-1">${t('medicoAyuda')}</p>
          ${medicoSelectorHTML('mod1-medico', medicoSel)}
        </div>
      </div>`;
    }
    if (state.paso === 1) {
      return `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label class="text-sm font-medium">${t('peso')}</label>
          <input type="number" class="${iCls}" data-campo="peso" value="${escapeHtml(p.peso)}"></div>
        <div><label class="text-sm font-medium">${t('talla')}</label>
          <input type="number" class="${iCls}" data-campo="talla" value="${escapeHtml(p.talla)}"></div>
        <div><label class="text-sm font-medium">${t('imcCalc')}</label>
          <div id="imc-live" class="px-3 py-2 rounded font-bold text-lg" style="background:${C.cream}; color:${C.navy};">${imc(p).toFixed(1)} kg/m²</div>
        </div>
      </div>`;
    }
    if (state.paso === 2) {
      return `<div class="space-y-4">
        <div>
          <label class="text-sm font-medium block mb-2">${t('comorbilidades')}</label>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            ${COMORBIDITIES.map(c => `
              <label class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50">
                <input type="checkbox" data-comorb="${c.id}" ${p.comorbilidades[c.id]?'checked':''}>
                <span class="text-sm">${c.label}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div>
          <label class="text-sm font-medium">${t('otrosAntecedentes')}</label>
          <textarea class="${iCls}" data-campo="otrosAntecedentes" rows="3" placeholder="${t('otrosAntecedentesPH')}">${escapeHtml(p.otrosAntecedentes || '')}</textarea>
        </div>
      </div>`;
    }
    if (state.paso === 3) {
      return `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="text-sm font-medium">${t('asa')}</label>
          <select class="${iCls}" data-campo="asa">
            ${[1,2,3,4].map(n => `<option value="${n}" ${p.asa==String(n)?'selected':''}>ASA ${n}</option>`).join('')}
          </select>
        </div>
        <div><label class="text-sm font-medium">${t('estadoFuncional')}</label>
          <select class="${iCls}" data-campo="funcional">
            <option value="independiente" ${p.funcional==='independiente'?'selected':''}>${t('independiente')}</option>
            <option value="parcial" ${p.funcional==='parcial'?'selected':''}>${t('dependenciaParcial')}</option>
            <option value="total" ${p.funcional==='total'?'selected':''}>${t('dependenciaTotal')}</option>
          </select>
        </div>
      </div>`;
    }
    if (state.paso === 4) {
      const dims = [
        { k:'eossMetabolico', key:'metabolico', l:t('dimMetabolico') },
        { k:'eossMecanico',   key:'mecanico',   l:t('dimMecanico') },
        { k:'eossPsico',      key:'psico',      l:t('dimPsico') }
      ];
      return `<div class="space-y-4">
        <div class="p-3 rounded text-xs" style="background:${C.cream}; border-left:3px solid ${C.teal};">
          <div class="font-bold mb-1" style="color:${C.navy};">¿Qué es el EOSS?</div>
          <div class="text-gray-700">Sistema de Estadificación de Edmonton (Sharma &amp; Kushner, 2009). Estratifica la gravedad de la obesidad <em>más allá del IMC</em> evaluando 3 dimensiones. Puntúe cada una de <strong>0</strong> (sin impacto) a <strong>4</strong> (enfermedad terminal/incapacitante). El estadio final será el <strong>más alto</strong> de las tres.</div>
        </div>
        ${dims.map(d => {
          const sel = p[d.k] || 0;
          const stages = EOSS_STAGES[d.key];
          return `
          <div class="border rounded overflow-hidden" style="border-color:#e5e7eb;">
            <div class="p-3" style="background:${C.cream};">
              <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div class="font-bold text-sm" style="color:${C.navy};">${d.l}</div>
                <div class="text-xs text-gray-600">Estadio seleccionado: <strong style="color:${C.teal};">${sel}</strong></div>
              </div>
              <div class="flex gap-2">
                ${[0,1,2,3,4].map(n => `
                  <button data-eoss-k="${d.k}" data-eoss-v="${n}" class="flex-1 py-2 rounded font-bold text-sm"
                    style="background:${p[d.k]===n?C.teal:'white'}; color:${p[d.k]===n?'white':'#6b7280'}; border:1px solid ${p[d.k]===n?C.teal:'#e5e7eb'};">${n}</button>
                `).join('')}
              </div>
            </div>
            <div>
              ${stages.map((s,idx) => `
                <div class="flex gap-3 p-2.5 text-xs ${idx>0?'border-t':''}" style="background:${s.stage===sel?'#ecfeff':'white'}; border-color:#f1f5f9; ${s.stage===sel?'':'opacity:0.75;'}">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold" style="background:${s.stage===sel?C.teal:'#e5e7eb'}; color:${s.stage===sel?'white':'#6b7280'};">${s.stage}</div>
                  <div class="flex-1 min-w-0">
                    <div class="font-bold" style="color:${C.navy};">${escapeHtml(s.titulo)}</div>
                    <div class="text-gray-700">${escapeHtml(s.ej)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>`;
    }
    if (state.paso === 5) {
      return `<div>
        <label class="text-sm font-medium">${t('procedimientoPropuesto')}</label>
        <select class="${iCls}" data-campo="procedimiento">
          ${PROCEDURES.map(x => `<option value="${x.id}" ${p.procedimiento===x.id?'selected':''}>${x.name}</option>`).join('')}
        </select>
      </div>`;
    }
    if (state.paso === 6) {
      return `<div>
        <label class="text-sm font-medium">${t('historiaResumida')}</label>
        <p class="text-xs text-gray-500 mb-2">${t('historiaAyuda')}</p>
        <textarea class="${iCls}" data-campo="historia" rows="10">${escapeHtml(p.historia)}</textarea>
      </div>`;
    }
    return '';
  }

  function semaforoHTML() {
    const s = scoreIntegrado(state.paciente);
    const mensajes = {
      bajo:     { t:'¡Buenas noticias!',           txt:'Su perfil sugiere que es un buen candidato para evaluación quirúrgica. Le acompañaremos en cada paso del camino.' },
      moderado: { t:'Necesitamos prepararle bien', txt:'Su caso requiere optimización previa. Con el plan adecuado, podemos llevarle al mejor estado posible para su cirugía.' },
      alto:     { t:'Su salud es nuestra prioridad', txt:'Su caso necesita evaluación multidisciplinaria detallada. Existen alternativas seguras y efectivas que exploraremos juntos.' }
    };
    const m = mensajes[s.nivel];
    const circ = (c, nivel) => `<div class="w-20 h-20 rounded-full mx-auto" style="background:${C[c]}; opacity:${s.nivel===nivel?1:0.2};"></div>`;
    return `<div class="text-center p-8 rounded-lg" style="background:${C.cream};">
      <div class="inline-flex flex-col gap-3 mb-4">
        ${circ('red','alto')}
        ${circ('yellow','moderado')}
        ${circ('green','bajo')}
      </div>
      <h2 class="text-2xl font-bold mb-3" style="font-family:Georgia,serif; color:${C.navy};">${m.t}</h2>
      <p class="text-gray-700 mb-6 max-w-md mx-auto">${m.txt}</p>
      <button class="btn text-white" style="background:${C.teal};">Agendar consulta personalizada</button>
    </div>`;
  }

  function proyeccionHTML() {
    const p = state.paciente;
    const peso = parseFloat(p.peso) || 0;
    if (!peso || !p.procedimiento) return '';
    const tray = trayectoriaPaciente(p);
    const twlFinal = tray.twlPct[12];
    const pesoFinal = tray.pesoProy[12];
    const kgPerdidos = +(peso - pesoFinal).toFixed(1);
    const imcFinal = p.talla ? (pesoFinal / Math.pow(parseFloat(p.talla)/100, 2)).toFixed(1) : '—';
    return `<div class="p-4 rounded-lg border bg-white" style="border-color:#e5e7eb;">
      <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
        <h3 class="font-bold text-sm flex items-center gap-1" style="color:${C.navy};">
          <i data-lucide="trending-down" class="w-4 h-4" style="color:${C.teal};"></i>
          Proyección de pérdida de peso a 12 meses
        </h3>
        <div class="text-[10px] text-gray-500">${escapeHtml(PROCS[p.procedimiento] || '')}</div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div class="p-2 rounded text-center" style="background:${C.cream};">
          <div class="text-[10px] text-gray-600 uppercase">Peso actual</div>
          <div class="text-lg font-bold" style="color:${C.navy};">${peso} kg</div>
        </div>
        <div class="p-2 rounded text-center" style="background:${C.cream};">
          <div class="text-[10px] text-gray-600 uppercase">Peso a 12m</div>
          <div class="text-lg font-bold" style="color:${C.teal};">${pesoFinal} kg</div>
        </div>
        <div class="p-2 rounded text-center" style="background:${C.cream};">
          <div class="text-[10px] text-gray-600 uppercase">Kg a perder</div>
          <div class="text-lg font-bold" style="color:${C.gold};">−${kgPerdidos}</div>
        </div>
        <div class="p-2 rounded text-center" style="background:${C.cream};">
          <div class="text-[10px] text-gray-600 uppercase">%TWL esperado</div>
          <div class="text-lg font-bold" style="color:${C.green};">${twlFinal}%</div>
        </div>
      </div>
      <div style="position:relative; height:240px;"><canvas id="chart-trayectoria"></canvas></div>
      <div class="mt-2 text-[10px] text-gray-500 leading-tight">IMC proyectado a 12 meses: <strong>${imcFinal} kg/m²</strong>. Estimación basada en promedios publicados (SLEEVEPASS 2022, SM-BOSS 2018, STAMPEDE 2017, IFSO Global Registry). Los resultados individuales varían según adherencia al seguimiento, comorbilidades y factores biológicos.</div>
    </div>`;
  }

  function initProyeccionChart() {
    if (!window.Chart || !containerRef) return;
    const el = containerRef.querySelector('#chart-trayectoria');
    if (!el) return;
    const p = state.paciente;
    const tray = trayectoriaPaciente(p);
    _charts.push(new Chart(el, {
      type:'line',
      data:{
        labels: tray.meses.map(m => m + 'm'),
        datasets:[
          {
            label:'Peso proyectado (kg)',
            data: tray.pesoProy,
            borderColor: C.teal,
            backgroundColor: 'rgba(26, 139, 157, 0.15)',
            fill:true,
            tension:0.35,
            yAxisID:'y1',
            pointBackgroundColor: C.teal,
            pointRadius:3
          },
          {
            label:'% Pérdida total (TWL)',
            data: tray.twlPct,
            borderColor: C.gold,
            backgroundColor: C.gold,
            borderDash:[4,4],
            fill:false,
            tension:0.35,
            yAxisID:'y2',
            pointBackgroundColor: C.gold,
            pointRadius:3
          }
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        scales:{
          y1:{ position:'left', title:{ display:true, text:'Peso (kg)', color:C.teal, font:{ size:10 } }, ticks:{ color:'#6b7280' }, grid:{ color:'#f3f4f6' } },
          y2:{ position:'right', beginAtZero:true, title:{ display:true, text:'%TWL', color:C.gold, font:{ size:10 } }, ticks:{ color:'#6b7280', callback:v => v+'%' }, grid:{ drawOnChartArea:false } },
          x:{ title:{ display:true, text:'Meses post-cirugía', color:'#6b7280', font:{ size:10 } }, ticks:{ color:'#6b7280' }, grid:{ color:'#f3f4f6' } }
        },
        plugins:{ legend:{ position:'top', labels:{ font:{ size:10 }, color:C.navy, boxWidth:12 } } }
      }
    }));
  }

  function resultadosHTML() {
    if (state.modo === 'paciente') return semaforoHTML();
    const p = state.paciente;
    const s = scoreIntegrado(p);
    const recs = recomendaciones(p);
    return `<div class="space-y-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="p-4 rounded" style="background:${C.cream};">
          <div class="text-xs text-gray-600">OS-MRS</div>
          <div class="text-2xl font-bold" style="color:${C.navy};">${s.osmrs.score}/5</div>
          <div class="text-xs">${t('mortalidad')} ${s.osmrs.mortalidad}</div>
        </div>
        <div class="p-4 rounded" style="background:${C.cream};">
          <div class="text-xs text-gray-600">EOSS</div>
          <div class="text-2xl font-bold" style="color:${C.navy};">${t('estadio')} ${s.eoss}</div>
        </div>
        <div class="p-4 rounded" style="background:${C.cream};">
          <div class="text-xs text-gray-600">Caprini</div>
          <div class="text-2xl font-bold" style="color:${C.navy};">${s.caprini}</div>
        </div>
        <div class="p-4 rounded text-white" style="background:${s.color};">
          <div class="text-xs opacity-90">${t('riesgoIntegrado')}</div>
          <div class="text-2xl font-bold">${s.valor}/100</div>
          <div class="text-xs uppercase">${s.nivel}</div>
        </div>
      </div>
      ${recs.length ? `
        <div class="p-4 rounded border-l-4" style="background:${C.cream}; border-color:${C.gold};">
          <h3 class="font-bold mb-2" style="color:${C.navy};">${t('recomendacionesClinicas')}</h3>
          <ul class="space-y-2">
            ${recs.map(r => {
              const icon = r.tipo === 'critico' ? 'alert-circle' : 'alert-triangle';
              const col = r.tipo === 'critico' ? C.red : C.yellow;
              return `<li class="flex gap-2 text-sm">
                <i data-lucide="${icon}" class="w-4 h-4 flex-shrink-0 mt-0.5" style="color:${col};"></i>
                <span>${escapeHtml(r.texto)}</span>
              </li>`;
            }).join('')}
          </ul>
        </div>` : ''}
      ${proyeccionHTML()}
      ${state.modo === 'academico' ? `
        <div class="p-4 rounded border" style="border-color:${C.teal};">
          <h3 class="font-bold mb-2" style="color:${C.navy};">Notas académicas</h3>
          <p class="text-sm text-gray-700">OS-MRS (DeMaria 2007): 5 variables binarias. EOSS (Sharma & Kushner 2009): estratifica más allá del IMC. Caprini: baseline 5 puntos por cirugía bariátrica mayor + factores. Score integrado: ponderación 35/30/20/15 (OS-MRS/EOSS/Caprini/ASA).</p>
        </div>` : ''}
    </div>`;
  }

  function pacienteCoincide(p, q) {
    if (!q) return true;
    const needle = q.toLowerCase();
    const medico = (p.medicoIngreso && p.medicoIngreso.nombre) || '';
    return (p.nombre || '').toLowerCase().includes(needle)
      || (p.expediente || '').toLowerCase().includes(needle)
      || medico.toLowerCase().includes(needle);
  }

  function listaVistaHTML() {
    const filtrados = state.pacientes.filter(p => pacienteCoincide(p, state.filtroBusqueda));
    return `<div>
      <div class="flex flex-wrap gap-2 mb-4 items-center">
        <div class="flex-1 min-w-[220px]">
          <input id="inp-buscar" class="input-base" value="${escapeHtml(state.filtroBusqueda)}" placeholder="${t('buscarPaciente')}">
        </div>
        <button id="btn-importar" class="btn flex items-center gap-1 text-white" style="background:${C.navy};">
          <i data-lucide="upload" class="w-4 h-4"></i> ${t('importarJSON')}
        </button>
        <input id="file-importar" type="file" accept="application/json,.json" class="hidden">
        <button id="btn-export-csv" class="btn flex items-center gap-1 text-white" ${state.pacientes.length===0?'disabled':''} style="background:${C.teal};">
          <i data-lucide="download" class="w-4 h-4"></i> ${t('exportarCSV')}
        </button>
      </div>
      ${filtrados.length === 0
        ? `<p class="text-center text-gray-500 py-8">${t('sinPacientes')}</p>`
        : `<div class="space-y-2">
            ${filtrados.map(p => {
              const s = scoreIntegrado(p);
              const medNom = (p.medicoIngreso && p.medicoIngreso.nombre) || '—';
              return `<div class="p-3 border rounded flex justify-between items-center flex-wrap gap-2">
                <div class="min-w-0">
                  <div class="font-bold" style="color:${C.navy};">${escapeHtml(p.nombre || 'Sin nombre')}</div>
                  <div class="text-xs text-gray-600">${escapeHtml(p.edad)}a · ${escapeHtml(p.sexo)} · IMC ${imc(p).toFixed(1)} · ${escapeHtml(PROCS[p.procedimiento] || '')}</div>
                  <div class="text-[11px] text-gray-500">${t('ingresoLbl')}: ${escapeHtml(medNom)}${p.expediente ? ' · ' + t('exp') + ' ' + escapeHtml(p.expediente) : ''}</div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded text-white text-sm font-bold" style="background:${s.color};">${s.valor} · ${s.nivel}</span>
                  <button data-pdf="${p.id}" class="p-2 rounded hover:bg-gray-100" title="Reporte PDF" style="color:${C.teal};">
                    <i data-lucide="file-text" class="w-4 h-4"></i>
                  </button>
                  <button data-eliminar="${p.id}" class="text-red-600 hover:bg-red-50 p-2 rounded" title="Eliminar">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>`;
            }).join('')}
          </div>`}
    </div>`;
  }

  function render(container) {
    containerRef = container;
    destroyCharts();
    const p = state.paciente;
    const mostrarResultados = p.peso && p.talla && p.edad;

    container.innerHTML = `
      <div class="min-h-screen p-4">
        <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          ${headerHTML(1, 'Estratificación de Riesgo Quirúrgico Bariátrico', state.modo)}
          <div class="p-6">
            <div class="flex gap-2 mb-4 flex-wrap items-center">
              <button data-vista="formulario" class="btn" style="background:${state.vista==='formulario'?C.navy:'#e5e7eb'}; color:${state.vista==='formulario'?'white':'#374151'};">${t('nuevaEvaluacion')}</button>
              <button data-vista="lista" class="btn" style="background:${state.vista==='lista'?C.navy:'#e5e7eb'}; color:${state.vista==='lista'?'white':'#374151'};">
                <i data-lucide="users" class="w-4 h-4 inline mr-1"></i> ${t('pacientes')} (${state.pacientes.length})
              </button>
              <div class="ml-auto flex items-center gap-2">
                <i data-lucide="languages" class="w-4 h-4" style="color:${C.teal};"></i>
                <span class="text-xs text-gray-600">${t('idioma')}:</span>
                ${selectorIdiomaHTML()}
              </div>
            </div>
            ${state.vista === 'formulario' ? `
              ${pasosHTML()}
              <div class="mb-6 p-4 border rounded">${pasoContentHTML()}</div>
              <div class="flex justify-between mb-6 flex-wrap gap-2">
                <button id="btn-anterior" class="btn flex items-center gap-1" ${state.paso===0?'disabled':''} style="background:#e5e7eb;">
                  <i data-lucide="chevron-left" class="w-4 h-4"></i> ${t('anterior')}
                </button>
                ${state.paso < t('pasos').length - 1
                  ? `<button id="btn-siguiente" class="btn flex items-center gap-1 text-white" style="background:${C.teal};">${t('siguiente')} <i data-lucide="chevron-right" class="w-4 h-4"></i></button>`
                  : `<div class="flex gap-2 flex-wrap">
                      <button id="btn-pdf-actual" class="btn flex items-center gap-1 text-white" style="background:${C.teal};"><i data-lucide="file-text" class="w-4 h-4"></i> ${t('vistaPreviaPDF')}</button>
                      <button id="btn-guardar" class="btn flex items-center gap-1 text-white" style="background:${C.gold};"><i data-lucide="check-circle-2" class="w-4 h-4"></i> ${t('guardarPaciente')}</button>
                    </div>`}
              </div>
              ${mostrarResultados ? resultadosHTML() : ''}
            ` : listaVistaHTML()}
          </div>
        </div>
      </div>
    `;

    wire(container);
    refrescarIconos();
    // Inicializar gráfico de proyección si corresponde
    if (state.vista === 'formulario' && state.modo !== 'paciente' && p.peso && p.talla && p.edad && p.procedimiento) {
      setTimeout(initProyeccionChart, 0);
    }
  }

  function actualizarIMCLive() {
    const el = containerRef && containerRef.querySelector('#imc-live');
    if (el) el.textContent = imc(state.paciente).toFixed(1) + ' kg/m²';
  }

  function wire(container) {
    container.querySelectorAll('[data-modo]').forEach(b => {
      b.addEventListener('click', () => { state.modo = b.dataset.modo; render(containerRef); });
    });
    container.querySelectorAll('[data-vista]').forEach(b => {
      b.addEventListener('click', () => { state.vista = b.dataset.vista; render(containerRef); });
    });
    container.querySelectorAll('[data-ir-paso]').forEach(el => {
      el.addEventListener('click', () => { state.paso = parseInt(el.dataset.irPaso); render(containerRef); });
    });

    // Selector de idioma
    const selIdioma = container.querySelector('#sel-idioma');
    if (selIdioma) {
      selIdioma.addEventListener('change', e => {
        setIdioma(e.target.value);
        render(containerRef);
      });
    }

    // IMPORTANTE: no volver a renderizar en cada tecla (conserva el foco del input).
    container.querySelectorAll('input[data-campo], textarea[data-campo]').forEach(inp => {
      inp.addEventListener('input', e => {
        state.paciente[inp.dataset.campo] = e.target.value;
        if (inp.dataset.campo === 'peso' || inp.dataset.campo === 'talla') actualizarIMCLive();
      });
    });
    container.querySelectorAll('select[data-campo]').forEach(sel => {
      sel.addEventListener('change', e => {
        state.paciente[sel.dataset.campo] = e.target.value;
      });
    });

    wireMedicoSelector(container, 'mod1-medico', valor => {
      state.paciente.medicoIngresoNombre = valor;
    });

    container.querySelectorAll('[data-comorb]').forEach(chk => {
      chk.addEventListener('change', e => {
        state.paciente.comorbilidades[chk.dataset.comorb] = e.target.checked;
      });
    });
    container.querySelectorAll('[data-eoss-k]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.paciente[btn.dataset.eossK] = parseInt(btn.dataset.eossV);
        render(containerRef);
      });
    });
    const bAnt = container.querySelector('#btn-anterior');
    if (bAnt) bAnt.addEventListener('click', () => { state.paso = Math.max(0, state.paso - 1); render(containerRef); });
    const bSig = container.querySelector('#btn-siguiente');
    if (bSig) bSig.addEventListener('click', () => { state.paso = state.paso + 1; render(containerRef); });
    const bGuardar = container.querySelector('#btn-guardar');
    if (bGuardar) bGuardar.addEventListener('click', guardarPaciente);
    const bPdfActual = container.querySelector('#btn-pdf-actual');
    if (bPdfActual) bPdfActual.addEventListener('click', () => reportePDF({ ...state.paciente, medicoIngreso: getMedico() }));

    // Buscador de pacientes (preservando el foco)
    const inpBuscar = container.querySelector('#inp-buscar');
    if (inpBuscar) {
      inpBuscar.addEventListener('input', e => {
        state.filtroBusqueda = e.target.value;
        // Re-renderizamos sólo la lista para mantener el foco del input
        const nuevo = document.createElement('div');
        nuevo.innerHTML = listaVistaHTML();
        // Truco: guardamos posición del cursor
        const pos = e.target.selectionStart;
        render(containerRef);
        const again = containerRef.querySelector('#inp-buscar');
        if (again) { again.focus(); again.setSelectionRange(pos, pos); }
      });
    }

    // Importar pacientes
    const bImp = container.querySelector('#btn-importar');
    const fImp = container.querySelector('#file-importar');
    if (bImp && fImp) {
      bImp.addEventListener('click', () => fImp.click());
      fImp.addEventListener('change', e => {
        const f = e.target.files && e.target.files[0];
        if (f) importarPacientesArchivo(f);
        fImp.value = '';
      });
    }

    const bCsv = container.querySelector('#btn-export-csv');
    if (bCsv) bCsv.addEventListener('click', exportarCSV);
    container.querySelectorAll('[data-eliminar]').forEach(b => {
      b.addEventListener('click', () => eliminarPaciente(b.dataset.eliminar));
    });
    container.querySelectorAll('[data-pdf]').forEach(b => {
      b.addEventListener('click', () => {
        const p = state.pacientes.find(x => x.id === b.dataset.pdf);
        if (p) reportePDF(p);
      });
    });
  }

  return {
    render(container) { cargar(); render(container); },
    reportePDF,
    trayectoriaPaciente,
    TRAYECTORIAS_TWL
  };
})();
