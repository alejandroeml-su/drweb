// ============================================================
// Módulo 4 · Manejo No Quirúrgico · Revisión · Metabólico · Conductual
// ============================================================

window.AvanteModulo4 = (function () {

  const state = { modo:'clinico', pacientes:[], seleccionado:null, tab:'noqx', screening:{} };
  let containerRef = null;

  function cargar() { state.pacientes = storageGet('avante_pacientes') || []; }

  function terapiasNoQx(p) {
    const i = imc(p); const c = p.comorbilidades || {}; const op = [];
    if (i >= 27 && i < 35) {
      op.push({ t:'GLP-1 / GIP-GLP-1', ind:'IMC 27-34.9 con comorbilidad o ≥30 sin comorbilidad', det:'Semaglutida 2.4mg SC semanal o tirzepatida 5-15mg SC semanal. Pérdida esperada: 15-22% peso corporal a 68 sem.', evid:'STEP-1, SURMOUNT-1' });
      op.push({ t:'Balón intragástrico', ind:'IMC 27-40, fracaso a tratamiento médico', det:'Orbera (líquido, 6m) u Obalon. Pérdida esperada: 10-15% peso corporal. Reversible.', evid:'Metaanálisis ASGE' });
    } else if (i >= 30 && i < 40) {
      op.push({ t:'GLP-1 / GIP-GLP-1', ind:'Primera línea farmacológica', det:'Semaglutida 2.4mg o tirzepatida. Considerar como puente o alternativa a cirugía si paciente no apto/no desea.', evid:'STEP, SURMOUNT' });
      op.push({ t:'ESG (Gastroplastia endoscópica en manga)', ind:'IMC 30-40, no candidato o no desea cirugía', det:'Sutura endoscópica (Apollo OverStitch). Pérdida esperada: 15-20% peso corporal a 12-24 meses. Ambulatorio.', evid:'MERIT trial, NEJM 2022' });
      op.push({ t:'Balón intragástrico', ind:'Como puente o alternativa temporal', det:'6 meses de duración. Útil para inducir cambios conductuales tempranos.', evid:'ASGE guidelines' });
    } else if (i >= 40) {
      op.push({ t:'Puente farmacológico GLP-1', ind:'IMC≥50 o alto riesgo quirúrgico', det:'Semaglutida/tirzepatida 4-6 meses pre-cirugía para reducir IMC ≥10% y disminuir morbilidad operatoria.', evid:'Estrategia bridge' });
      op.push({ t:'Balón intragástrico puente', ind:'IMC≥50 con riesgo quirúrgico alto', det:'Reducción 10-15% peso previo a cirugía definitiva.', evid:'ASMBS position' });
    }
    return op;
  }

  const REVISIONES = [
    { causa:'Pérdida ponderal insuficiente post-manga (<25% PTP a 18m)', opc:'Conversión a RYGB u OAGB. SADI-S si IMC sigue ≥45.', evid:'Mayor pérdida adicional con SADI-S vs RYGB en metaanálisis' },
    { causa:'Recuperación de peso post-RYGB',                             opc:'Revisión endoscópica de anastomosis (TORe), reinforzamiento de pouch, o conversión a distalización. Optimizar farmacoterapia (GLP-1).', evid:'TORe: ~10% pérdida adicional' },
    { causa:'ERGE refractario post-manga',                                opc:'Conversión a RYGB (gold standard antirreflujo). Reparación hiatal concomitante si hernia.', evid:'Resolución ERGE >85% con conversión a RYGB' },
    { causa:'Estenosis de manga sintomática',                             opc:'Dilatación endoscópica (1-3 sesiones). Si falla: conversión a RYGB.', evid:'Éxito endoscópico 70-80%' },
    { causa:'Reflujo biliar post-OAGB',                                   opc:'Conversión a RYGB con asa larga. Manejo médico inicial con sucralfato.', evid:'~2-5% requieren conversión' },
    { causa:'Malnutrición severa post-BPD-DS/SADI-S',                     opc:'Alargamiento de canal común. Soporte nutricional intensivo previo.', evid:'<3% requieren revisión por malnutrición' },
    { causa:'Fístula gastrogástrica post-RYGB',                           opc:'Cierre endoscópico (clips OTSC) o reintervención laparoscópica.', evid:'Endoscopia primera línea' },
    { causa:'Hernia interna post-RYGB/OAGB',                              opc:'EMERGENCIA. Laparoscopía exploradora + cierre de defectos mesentéricos.', evid:'Mortalidad si retraso diagnóstico' }
  ];

  function metabolico(p) {
    const c = p.comorbilidades || {}; const items = [];
    if (c.dm)    items.push({ area:'Diabetes mellitus', plan:'Suspender sulfonilureas e insulina basal-bolo al alta. Mantener metformina si TFG permite. Monitoreo glucémico estrecho primer mes. Reevaluar HbA1c a 3 y 6 meses. Remisión esperada: RYGB 75-80%, manga 60%, SADI-S/BPD-DS >85%.', gravedad:'critico' });
    if (c.erge)  items.push({ area:'ERGE', plan:'IBP profiláctico 6 meses post-manga. Si síntomas persisten: pHmetría/manometría a los 6 meses. Considerar conversión si refractario.', gravedad:'importante' });
    if (c.aos)   items.push({ area:'Apnea del sueño', plan:'Reevaluación con polisomnografía a los 6 meses post-cirugía. Resolución esperada 60-80%. Suspender CPAP solo con estudio negativo.', gravedad:'importante' });
    if (c.hta)   items.push({ area:'Hipertensión', plan:'Reducir antihipertensivos progresivamente desde el alta. Monitoreo PA semanal primer mes. Resolución esperada 60-70%.', gravedad:'importante' });
    if (c.disli) items.push({ area:'Dislipidemia', plan:'Perfil lipídico a 3 y 6 meses. Reducir/suspender estatinas según evolución. Mejoría esperada >70%.', gravedad:'rutina' });
    items.push({ area:'NASH/MAFLD', plan:'Elastografía hepática (FibroScan) basal y a 12 meses. Mejoría histológica esperada >80%. Vigilar fibrosis residual.', gravedad:'importante' });
    return items;
  }

  const CONDUCTUAL = [
    { fase:'Pre-operatorio', acciones:['Evaluación psicológica estructurada (BES, BDI)','Identificar trastorno por atracón / picoteo / comer emocional','Contrato conductual','Grupo de apoyo bariátrico','Expectativas realistas de pérdida ponderal'] },
    { fase:'0-3 meses',      acciones:['Sesiones quincenales de acompañamiento','Manejo de duelo alimentario','Reorganización de rutinas familiares','Detección temprana de transferencia adictiva'] },
    { fase:'3-12 meses',     acciones:['Sesiones mensuales','Trabajo de imagen corporal','Identificación de hambre fisiológica vs emocional','Prevención de recaídas conductuales','Actividad física estructurada'] },
    { fase:'>12 meses',      acciones:['Seguimiento semestral mínimo','Vigilancia activa de recuperación de peso','Manejo de transferencia adictiva (alcohol, sustancias)','Soporte en cambios vitales (pareja, sexualidad, autoestima)','Reincorporación si signos de descompensación'] }
  ];

  const SCREENING_CONDUCTUAL = [
    { q:'¿Episodios de comer grandes cantidades sintiendo pérdida de control?', flag:'Trastorno por atracón' },
    { q:'¿Picoteo continuo durante el día sin hambre real?', flag:'Grazing' },
    { q:'¿Come cuando está triste, ansioso o aburrido?', flag:'Comer emocional' },
    { q:'¿Antecedente de trastorno depresivo o ansiedad?', flag:'Comorbilidad psiquiátrica' },
    { q:'¿Consumo de alcohol >2 unidades/día o en aumento?', flag:'Riesgo transferencia adictiva' },
    { q:'¿Expectativas de pérdida >70% de exceso de peso a 6 meses?', flag:'Expectativas irreales' }
  ];

  function exportar() {
    const p = state.seleccionado; if (!p) return;
    const noqx = terapiasNoQx(p);
    const met = metabolico(p);
    const flags = Object.entries(state.screening).filter(([,v]) => v).map(([k]) => SCREENING_CONDUCTUAL[parseInt(k)].flag);

    descargarPDF({
      titulo: 'Manejo integral no quirúrgico',
      subtitulo: 'Módulo 4 · No Qx · Metabólico · Conductual',
      paciente: p,
      secciones: [
        { titulo: 'Terapias no quirúrgicas aplicables',
          texto: noqx.length ? noqx.map(x => `• ${x.t}\n   Indicación: ${x.ind}\n   ${x.det}`).join('\n\n') : 'IMC fuera del rango estándar para terapias no quirúrgicas.' },
        { titulo: 'Manejo metabólico por comorbilidad',
          texto: met.map(x => `• [${x.gravedad.toUpperCase()}] ${x.area}\n   ${x.plan}`).join('\n\n') },
        { titulo: 'Banderas conductuales identificadas',
          texto: flags.length ? flags.map(f => '• ' + f).join('\n') : 'Sin banderas identificadas en el tamizaje.' }
      ],
      nombreArchivo: `avante_manejo_${(p.nombre || 'paciente').replace(/\s+/g,'_')}.pdf`
    });
  }

  // ----------------------- UI -----------------------

  function tabsHTML() {
    const tabs = [
      { id:'noqx',       icon:'pill',       l:'No quirúrgico' },
      { id:'revision',   icon:'refresh-cw', l:'Revisión' },
      { id:'metabolico', icon:'sparkles',   l:'Metabólico' },
      { id:'conductual', icon:'brain',      l:'Conductual' }
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

  function noQxHTML(p) {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="pill" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Existen alternativas para usted</h3>
        <p class="text-gray-700 mb-4">No siempre la cirugía es el primer paso. Tenemos opciones farmacológicas y endoscópicas modernas que podrían ser ideales para su caso.</p>
        <button class="btn text-white" style="background:${C.teal};">Conocer mis opciones</button>
      </div>`;
    }
    const lista = terapiasNoQx(p);
    if (lista.length === 0) {
      return `<div class="p-4 rounded text-sm text-gray-600" style="background:${C.cream};">IMC fuera del rango de terapias no quirúrgicas estándar. Evaluación individualizada.</div>`;
    }
    return `<div class="space-y-3">
      ${lista.map(t => `<div class="p-4 rounded border-l-4" style="background:${C.cream}; border-color:${C.gold};">
        <div class="font-bold" style="color:${C.navy};">${escapeHtml(t.t)}</div>
        <div class="text-xs italic text-gray-600 mt-1">Indicación: ${escapeHtml(t.ind)}</div>
        <div class="text-sm text-gray-700 mt-2">${escapeHtml(t.det)}</div>
        ${state.modo === 'academico' ? `<div class="text-xs mt-2 font-medium" style="color:${C.teal};">Evidencia: ${escapeHtml(t.evid)}</div>` : ''}
      </div>`).join('')}
    </div>`;
  }

  function revisionHTML() {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="refresh-cw" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Si su cirugía previa no dio el resultado esperado</h3>
        <p class="text-gray-700">Existen opciones seguras de revisión. Evaluemos juntos su caso particular.</p>
      </div>`;
    }
    return `<div class="space-y-2">
      ${REVISIONES.map(r => `<div class="p-3 rounded border-l-4" style="border-color:${C.teal}; background:${C.cream};">
        <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(r.causa)}</div>
        <div class="text-sm text-gray-700 mt-1">${escapeHtml(r.opc)}</div>
        ${state.modo === 'academico' ? `<div class="text-xs mt-1 italic" style="color:${C.teal};">${escapeHtml(r.evid)}</div>` : ''}
      </div>`).join('')}
    </div>`;
  }

  function metabolicoHTML(p) {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="sparkles" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Su salud metabólica mejorará</h3>
        <p class="text-gray-700">Diabetes, presión, colesterol e hígado graso suelen mejorar dramáticamente. Su equipo ajustará sus medicamentos a medida que avanza.</p>
      </div>`;
    }
    return `<div class="space-y-2">
      ${metabolico(p).map(m => {
        const col = m.gravedad === 'critico' ? C.red : m.gravedad === 'importante' ? C.yellow : C.teal;
        const icon = m.gravedad === 'critico' ? 'alert-circle' : m.gravedad === 'importante' ? 'alert-triangle' : 'check-circle-2';
        return `<div class="p-3 rounded border-l-4 flex gap-3" style="border-color:${col}; background:${C.cream};">
          <i data-lucide="${icon}" class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:${col};"></i>
          <div class="flex-1">
            <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(m.area)}</div>
            <div class="text-sm text-gray-700">${escapeHtml(m.plan)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }

  function conductualHTML() {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="brain" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Su mente también merece cuidado</h3>
        <p class="text-gray-700 mb-4">El acompañamiento psicológico es parte central de su transformación. No está solo en este proceso.</p>
        <button class="btn text-white" style="background:${C.teal};">Agendar con psicología</button>
      </div>`;
    }
    return `<div class="space-y-4">
      <div>
        <h3 class="font-bold mb-2 text-sm" style="color:${C.navy};">Tamizaje rápido</h3>
        <div class="space-y-1">
          ${SCREENING_CONDUCTUAL.map((s,i) => `<label class="flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-gray-50">
            <input type="checkbox" data-scr="${i}" ${state.screening[i]?'checked':''} class="mt-1">
            <div class="flex-1 text-sm">
              <div>${escapeHtml(s.q)}</div>
              ${state.screening[i] ? `<div class="text-xs font-bold" style="color:${C.red};">⚠ ${escapeHtml(s.flag)}</div>` : ''}
            </div>
          </label>`).join('')}
        </div>
      </div>
      <div>
        <h3 class="font-bold mb-2 text-sm" style="color:${C.navy};">Plan conductual por fase</h3>
        <div class="space-y-2">
          ${CONDUCTUAL.map(f => `<div class="p-3 rounded border-l-4" style="background:${C.cream}; border-color:${C.gold};">
            <div class="font-bold text-sm mb-1" style="color:${C.navy};">${escapeHtml(f.fase)}</div>
            <ul class="space-y-1">
              ${f.acciones.map(a => `<li class="text-xs text-gray-700 flex gap-2">
                <i data-lucide="check-circle-2" class="w-3 h-3 flex-shrink-0 mt-1" style="color:${C.teal};"></i>${escapeHtml(a)}
              </li>`).join('')}
            </ul>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function render(container) {
    containerRef = container;
    container.innerHTML = `
      <div class="min-h-screen p-4">
        <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          ${headerHTML(4, 'Manejo Integral No Quirúrgico, Revisión y Conductual', state.modo)}
          <div class="p-6">
            ${!state.seleccionado ? `
              <h2 class="font-bold mb-3 flex items-center gap-2" style="color:${C.navy};">
                <i data-lucide="users" class="w-5 h-5"></i> Seleccione paciente
              </h2>
              ${listaPacientesHTML(state.pacientes)}
            ` : (() => {
              const p = state.seleccionado;
              const panel = state.tab === 'noqx' ? noQxHTML(p)
                         : state.tab === 'revision' ? revisionHTML()
                         : state.tab === 'metabolico' ? metabolicoHTML(p)
                         : conductualHTML();
              return `
                <div class="flex justify-between items-center mb-4 p-3 rounded flex-wrap gap-2" style="background:${C.cream};">
                  <div>
                    <div class="font-bold" style="color:${C.navy};">${escapeHtml(p.nombre)}</div>
                    <div class="text-xs text-gray-600">IMC ${imc(p).toFixed(1)} · ${escapeHtml(PROCS[p.procedimiento] || '')}</div>
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
    container.querySelectorAll('[data-scr]').forEach(c => c.addEventListener('change', e => {
      state.screening[c.dataset.scr] = e.target.checked;
      render(containerRef);
    }));
    const bc = container.querySelector('#btn-cambiar');
    if (bc) bc.addEventListener('click', () => { state.seleccionado = null; render(containerRef); });
    const be = container.querySelector('#btn-exportar');
    if (be) be.addEventListener('click', exportar);
  }

  return { render(container) { cargar(); render(container); } };
})();
