// ============================================================
// Módulo 2 · Optimización · Selección · Profilaxis
// ============================================================

window.AvanteModulo2 = (function () {

  const state = { modo:'clinico', pacientes:[], seleccionado:null, tab:'optimizacion' };
  let containerRef = null;

  function cargar() { state.pacientes = storageGet('avante_pacientes') || []; }

  // ------------------- Motores clínicos -------------------

  function planOptimizacion(p) {
    const items = []; const i = imc(p); const c = p.comorbilidades || {};
    if (c.tabaco) items.push({ prio:'critico',    area:'Cesación tabáquica',   accion:'Suspensión obligatoria ≥6 semanas previo a cirugía. Bupropión o vareniclina + apoyo conductual.', tiempo:'6-8 semanas' });
    if (c.dm)     items.push({ prio:'critico',    area:'Control glucémico',    accion:'Optimizar HbA1c <8% (meta <7% si insulinodependiente). Ajuste con endocrinología.', tiempo:'8-12 semanas' });
    if (i >= 50)  items.push({ prio:'importante', area:'Pérdida puente',       accion:'IMC≥50: terapia puente con GLP-1 (semaglutida/tirzepatida) o balón intragástrico 4-6 meses para reducir IMC ≥10%.', tiempo:'4-6 meses' });
    if (c.aos)    items.push({ prio:'importante', area:'AOS',                  accion:'Polisomnografía + titulación CPAP. Uso ≥4h/noche por ≥4 semanas previas.', tiempo:'4-6 semanas' });
    if (c.cardio) items.push({ prio:'importante', area:'Cardiología',          accion:'Valoración cardiológica + ecocardiograma + ECG. Optimizar betabloqueo si indicado.', tiempo:'2-4 semanas' });
    if (c.erc)    items.push({ prio:'importante', area:'Nefrología',           accion:'TFG, electrolitos, ajuste de fármacos nefrotóxicos. Valoración nefrológica.', tiempo:'2-4 semanas' });
    if (c.acoag)  items.push({ prio:'critico',    area:'Anticoagulación',      accion:'Plan de puenteo con hematología. Suspender ACOD 48-72h previo según función renal.', tiempo:'1 semana' });
    if (c.disli)  items.push({ prio:'rutina',     area:'Dislipidemia',         accion:'Continuar estatina perioperatoria. Perfil lipídico basal.', tiempo:'rutina' });
    items.push({ prio:'rutina', area:'Nutrición', accion:'Dieta hipocalórica hiperproteica 2 semanas previas. Suplementación: tiamina, B12, hierro, vit D, calcio.', tiempo:'2-4 semanas' });
    items.push({ prio:'rutina', area:'Psicología', accion:'Evaluación psicológica + contrato conductual + grupo de apoyo.', tiempo:'4-8 semanas' });
    return items;
  }

  function recomendarProcedimiento(p) {
    const i = imc(p); const c = p.comorbilidades || {};
    const cand = [];
    if (c.erge) {
      cand.push({ proc:'rygb', score:95, razon:'ERGE significativo: RYGB es gold standard antirreflujo' });
      cand.push({ proc:'oagb', score:60, razon:'Alternativa con riesgo de reflujo biliar' });
    } else if (i >= 60) {
      cand.push({ proc:'bpdds',  score:90, razon:'IMC≥60: máxima pérdida de peso, considerar 2 tiempos' });
      cand.push({ proc:'sadis',  score:88, razon:'SADI-S: simplificación técnica con resultados similares' });
      cand.push({ proc:'sleeve', score:70, razon:'Primer tiempo de estrategia escalonada' });
    } else if (i >= 50 && c.dm) {
      cand.push({ proc:'rygb',  score:92, razon:'IMC≥50 + DM: RYGB con remisión metabólica superior' });
      cand.push({ proc:'sadis', score:85, razon:'Alternativa hipoabsortiva con buen control DM' });
      cand.push({ proc:'oagb',  score:80, razon:'Buen control metabólico, menor complejidad técnica' });
    } else if (c.dm) {
      cand.push({ proc:'rygb',   score:90, razon:'DM: remisión ~80%, gold standard metabólico' });
      cand.push({ proc:'oagb',   score:85, razon:'Remisión DM comparable a RYGB' });
      cand.push({ proc:'sleeve', score:70, razon:'Remisión DM ~60%, opción más simple' });
    } else {
      cand.push({ proc:'sleeve', score:88, razon:'Bajo riesgo, técnica más simple, buena pérdida de peso' });
      cand.push({ proc:'rygb',   score:80, razon:'Estándar comparativo con buenos resultados' });
      cand.push({ proc:'oagb',   score:78, razon:'Una anastomosis, técnica reproducible' });
    }
    if (c.acoag) cand.forEach(x => { if (x.proc === 'bpdds' || x.proc === 'sadis') x.score -= 15; });
    return cand.sort((a,b) => b.score - a.score).slice(0, 3);
  }

  function protocoloProfilaxis(p) {
    const c = p.comorbilidades || {}; const i = imc(p);
    let cap = 5; const e = parseFloat(p.edad) || 0;
    if (e >= 75) cap += 3; else if (e >= 61) cap += 2; else if (e >= 41) cap += 1;
    if (c.tep) cap += 3;
    if (c.ivc) cap += 1;
    if (c.cardio) cap += 1;
    if (c.aos) cap += 1;
    if (i >= 40) cap += 1;

    const tev = cap >= 8
      ? { nivel:'alto', plan:'HBPM dosis ajustada por peso (enoxaparina 40mg c/12h si IMC≥40 o 60mg c/12h si IMC≥50) + CCN. Profilaxis extendida 2-4 semanas post-alta.' }
      : cap >= 5
      ? { nivel:'moderado-alto', plan:'HBPM (enoxaparina 40mg SC c/24h, ajustar a c/12h si IMC≥40) + compresión neumática intermitente. Iniciar 12h post-op.' }
      : { nivel:'moderado', plan:'HBPM estándar + medias de compresión + deambulación temprana.' };

    const atb = { plan:'Cefazolina 2g IV (3g si peso>120kg) 30-60min pre-incisión. Re-dosificar a las 4h o si pérdida >1500mL.' };

    const eras = [
      'Ayuno mínimo: sólidos 6h, líquidos claros 2h',
      'Carga de carbohidratos 2h pre-op (si no DM descompensada)',
      'Profilaxis antiemética multimodal (ondansetrón + dexametasona)',
      'Analgesia multimodal: TAP block + bloqueo visceral autonómico (su técnica) + paracetamol/AINE',
      'Evitar opioides sistémicos, minimizar fluidos IV',
      'Sonda vesical solo si necesaria, retirar <24h',
      'Movilización <6h post-op, dieta líquida <12h',
      'Egreso 24-48h con criterios objetivos'
    ];
    return { tev, caprini:cap, atb, eras };
  }

  function exportarPlan() {
    const p = state.seleccionado;
    if (!p) return;
    const opt = planOptimizacion(p);
    const proc = recomendarProcedimiento(p);
    const prof = protocoloProfilaxis(p);

    descargarPDF({
      titulo: 'Plan perioperatorio',
      subtitulo: 'Módulo 2 · Optimización · Selección · Profilaxis',
      paciente: p,
      secciones: [
        { titulo: 'Optimización preoperatoria',
          texto: opt.map(x => `• [${x.prio.toUpperCase()}] ${x.area} (${x.tiempo})\n   ${x.accion}`).join('\n\n') },
        { titulo: 'Selección de procedimiento',
          texto: proc.map((x,i) => `${i+1}. ${PROCS[x.proc]} — ${x.score}/100\n   ${x.razon}`).join('\n\n') },
        { titulo: `Profilaxis TEV · Caprini ${prof.caprini} · riesgo ${prof.tev.nivel}`,
          texto: prof.tev.plan },
        { titulo: 'Profilaxis antibiótica',
          texto: prof.atb.plan },
        { titulo: 'Protocolo ERAS bariátrico',
          texto: prof.eras.map(x => '• ' + x).join('\n') }
      ],
      nombreArchivo: `avante_plan_${(p.nombre || 'paciente').replace(/\s+/g,'_')}.pdf`
    });
  }

  // ----------------------- UI -----------------------

  function tabsHTML() {
    const tabs = [
      { id:'optimizacion', icon:'pill',        l:'Optimización' },
      { id:'seleccion',    icon:'stethoscope', l:'Selección procedimiento' },
      { id:'profilaxis',   icon:'shield',      l:'Profilaxis perioperatoria' }
    ];
    return `<div class="flex gap-2 mb-4 border-b tabs-scroll overflow-x-auto">
      ${tabs.map(t => `
        <button data-tab="${t.id}" class="px-4 py-2 flex items-center gap-2 text-sm font-medium border-b-2 whitespace-nowrap"
          style="border-color:${state.tab===t.id?C.gold:'transparent'}; color:${state.tab===t.id?C.navy:'#6b7280'};">
          <i data-lucide="${t.icon}" class="w-4 h-4"></i> ${t.l}
        </button>
      `).join('')}
    </div>`;
  }

  function optimizacionHTML(p) {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="heart" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Le prepararemos paso a paso</h3>
        <p class="text-gray-700 mb-4">Antes de su cirugía trabajaremos juntos para llevarle al mejor estado de salud posible. Su equipo médico le acompañará en cada etapa.</p>
        <button class="btn text-white" style="background:${C.teal};">Conocer mi plan personalizado</button>
      </div>`;
    }
    return `<div class="space-y-2">
      ${planOptimizacion(p).map(x => {
        const col = x.prio === 'critico' ? C.red : x.prio === 'importante' ? C.yellow : C.teal;
        const icon = x.prio === 'critico' ? 'alert-circle' : x.prio === 'importante' ? 'alert-triangle' : 'check-circle-2';
        return `<div class="p-3 border-l-4 rounded flex gap-3" style="border-color:${col}; background:${C.cream};">
          <i data-lucide="${icon}" class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:${col};"></i>
          <div class="flex-1">
            <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(x.area)} <span class="text-xs font-normal text-gray-500">· ${x.tiempo}</span></div>
            <div class="text-sm text-gray-700">${escapeHtml(x.accion)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }

  function seleccionHTML(p) {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="stethoscope" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Elegiremos juntos su mejor opción</h3>
        <p class="text-gray-700 mb-4">Existen varias técnicas quirúrgicas. Su cirujano analizará cuál es la más segura y efectiva para usted.</p>
        <button class="btn text-white" style="background:${C.teal};">Hablar con mi cirujano</button>
      </div>`;
    }
    const lista = recomendarProcedimiento(p);
    return `<div class="space-y-3">
      ${lista.map((x,i) => `
        <div class="p-4 rounded border" style="border-color:${i===0?C.gold:'#e5e7eb'}; background:${i===0?C.cream:'white'};">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                ${i===0 ? `<span class="px-2 py-0.5 rounded text-xs font-bold text-white" style="background:${C.gold};">PRIMERA OPCIÓN</span>` : ''}
                <div class="font-bold" style="color:${C.navy};">${escapeHtml(PROCS[x.proc])}</div>
              </div>
              <div class="text-sm text-gray-700 mt-1">${escapeHtml(x.razon)}</div>
            </div>
            <div class="text-2xl font-bold" style="color:${C.teal};">${x.score}</div>
          </div>
        </div>
      `).join('')}
      ${state.modo === 'academico' ? `
        <div class="p-3 rounded border text-xs text-gray-700" style="border-color:${C.teal};">
          <strong style="color:${C.navy};">Notas:</strong> Algoritmo basado en IFSO/ASMBS guidelines. ERGE → preferencia RYGB (gold standard antirreflujo). IMC≥60 → considerar BPD-DS/SADI-S o estrategia en 2 tiempos. DM con HbA1c elevada → priorizar bypass por superioridad metabólica.
        </div>` : ''}
    </div>`;
  }

  function profilaxisHTML(p) {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="shield" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Su seguridad es nuestra prioridad</h3>
        <p class="text-gray-700">Aplicamos los protocolos internacionales más rigurosos para prevenir complicaciones durante y después de su cirugía.</p>
      </div>`;
    }
    const pr = protocoloProfilaxis(p);
    return `<div class="space-y-3">
      <div class="p-4 rounded" style="background:${C.cream};">
        <div class="font-bold text-sm mb-1" style="color:${C.navy};">Profilaxis TEV (Caprini ${pr.caprini} · riesgo ${pr.tev.nivel})</div>
        <div class="text-sm text-gray-700">${escapeHtml(pr.tev.plan)}</div>
      </div>
      <div class="p-4 rounded" style="background:${C.cream};">
        <div class="font-bold text-sm mb-1" style="color:${C.navy};">Profilaxis antibiótica</div>
        <div class="text-sm text-gray-700">${escapeHtml(pr.atb.plan)}</div>
      </div>
      <div class="p-4 rounded" style="background:${C.cream};">
        <div class="font-bold text-sm mb-2" style="color:${C.navy};">Protocolo ERAS Bariátrico</div>
        <ul class="space-y-1">
          ${pr.eras.map(e => `<li class="text-sm text-gray-700 flex gap-2">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5 flex-shrink-0 mt-1" style="color:${C.teal};"></i>${escapeHtml(e)}
          </li>`).join('')}
        </ul>
      </div>
    </div>`;
  }

  function render(container) {
    containerRef = container;
    container.innerHTML = `
      <div class="min-h-screen p-4">
        <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          ${headerHTML(2, 'Optimización · Selección · Profilaxis Perioperatoria', state.modo)}
          <div class="p-6">
            ${!state.seleccionado ? `
              <h2 class="font-bold mb-3 flex items-center gap-2" style="color:${C.navy};">
                <i data-lucide="users" class="w-5 h-5"></i> Seleccione un paciente del Módulo 1
              </h2>
              ${listaPacientesHTML(state.pacientes, 'No hay pacientes guardados. Complete primero una evaluación en el Módulo 1.')}
            ` : (() => {
              const p = state.seleccionado;
              const panel = state.tab === 'optimizacion' ? optimizacionHTML(p)
                         : state.tab === 'seleccion'    ? seleccionHTML(p)
                         : profilaxisHTML(p);
              return `
                <div class="flex justify-between items-center mb-4 p-3 rounded flex-wrap gap-2" style="background:${C.cream};">
                  <div>
                    <div class="font-bold" style="color:${C.navy};">${escapeHtml(p.nombre)}</div>
                    <div class="text-xs text-gray-600">${escapeHtml(p.edad)}a · ${escapeHtml(p.sexo)} · IMC ${imc(p).toFixed(1)} · Procedimiento propuesto: ${escapeHtml(PROCS[p.procedimiento] || '')}</div>
                  </div>
                  <div class="flex gap-2">
                    <button id="btn-exportar" class="btn text-white text-sm flex items-center gap-1" style="background:${C.teal};">
                      <i data-lucide="download" class="w-3.5 h-3.5"></i> Exportar plan
                    </button>
                    <button id="btn-cambiar" class="btn text-sm" style="background:#e5e7eb;">Cambiar paciente</button>
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
    if (be) be.addEventListener('click', exportarPlan);
  }

  return {
    render(container) { cargar(); render(container); },
    planOptimizacion,
    recomendarProcedimiento,
    protocoloProfilaxis
  };
})();
