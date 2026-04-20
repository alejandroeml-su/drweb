// ============================================================
// Módulo 6 · Educación · Costos · Investigación · Emergencias
// ============================================================

window.AvanteModulo6 = (function () {

  const state = { modo:'clinico', pacientes:[], seleccionado:null, tab:'educacion', paquetes: [], consentimientoEdit: {} };
  let containerRef = null;

  const PAQUETES_DEFAULT = [
    { proc:'sleeve',      honorarios:4500, hospital:6500, anestesia:1200, materiales:2800 },
    { proc:'rygb',        honorarios:5500, hospital:7500, anestesia:1400, materiales:3600 },
    { proc:'oagb',        honorarios:5000, hospital:7000, anestesia:1300, materiales:3200 },
    { proc:'sadis',       honorarios:6500, hospital:8500, anestesia:1600, materiales:4400 },
    { proc:'bpdds',       honorarios:7000, hospital:9000, anestesia:1700, materiales:4800 },
    { proc:'rev_sg_rygb', honorarios:6500, hospital:8500, anestesia:1600, materiales:4200 },
    { proc:'rev_sg_oagb', honorarios:6000, hospital:8000, anestesia:1500, materiales:4000 }
  ];

  function totalPaquete(pq) {
    return (parseFloat(pq.honorarios)||0) + (parseFloat(pq.hospital)||0) + (parseFloat(pq.anestesia)||0) + (parseFloat(pq.materiales)||0);
  }

  function cargar() {
    state.pacientes = storageGet('avante_pacientes') || [];
    const guardados = storageGet('avante_paquetes');
    state.paquetes = guardados && Array.isArray(guardados) ? guardados : PAQUETES_DEFAULT.map(x => ({ ...x }));
    state.consentimientoEdit = storageGet('avante_consentimientos') || {};
  }

  function guardarConsentimientos() {
    storageSet('avante_consentimientos', state.consentimientoEdit);
  }

  function getConsentimiento(p) {
    if (state.consentimientoEdit[p.id]) return state.consentimientoEdit[p.id];
    return consentimiento(p);
  }

  function guardarPaquetes() {
    storageSet('avante_paquetes', state.paquetes);
  }

  const EDUCACION = [
    { tema:'¿Qué es la cirugía bariátrica?', contenido:'La cirugía bariátrica es un conjunto de procedimientos que ayudan a perder peso y mejorar enfermedades asociadas a la obesidad. No es una solución mágica: es una herramienta poderosa que requiere su compromiso de por vida con cambios en alimentación, ejercicio y seguimiento.' },
    { tema:'¿Cómo me preparo?', contenido:'Necesitará evaluaciones médicas (cardio, nutrición, psicología), exámenes de laboratorio, posiblemente endoscopia. Si fuma, debe suspenderlo al menos 6 semanas antes. Si tiene diabetes, optimizaremos su control. La preparación toma típicamente 4-8 semanas.' },
    { tema:'¿Qué pasa el día de la cirugía?', contenido:'Ingresará en ayunas. La cirugía dura 60-120 minutos por laparoscopía (mínimamente invasiva). Despertará en recuperación y subirá a su habitación. Comenzará a caminar el mismo día y a tomar líquidos a las pocas horas.' },
    { tema:'¿Cuánto tiempo estaré hospitalizado?', contenido:'Habitualmente 24-48 horas. En Avante el ambiente está diseñado para que se sienta como en un hotel, con su acompañante a su lado.' },
    { tema:'¿Cuánto peso perderé?', contenido:'Depende del procedimiento y de su compromiso. En promedio, los pacientes pierden 60-80% de su exceso de peso en los primeros 12-18 meses. La meta no es solo el peso: es ganar salud, energía y años de vida.' },
    { tema:'¿Qué riesgos existen?', contenido:'Toda cirugía tiene riesgos. Los más importantes en bariátrica son: fuga de la sutura (~1%), trombosis venosa, sangrado, infección. En manos experimentadas y centros acreditados como Avante, estos riesgos son bajos. La obesidad sin tratar es más peligrosa a largo plazo.' },
    { tema:'¿Cómo será mi vida después?', contenido:'Su relación con la comida cambiará. Comerá porciones pequeñas, masticará lento, tomará vitaminas de por vida, asistirá a sus controles. A cambio: más energía, menos medicamentos, mejor sueño, mayor autoestima y vida más larga.' },
    { tema:'¿Puedo quedar embarazada?', contenido:'Sí, pero recomendamos esperar 12-18 meses después de la cirugía. Use anticoncepción efectiva durante ese tiempo. Cuando se embarace, necesitará suplementación reforzada y seguimiento especializado.' }
  ];

  function consentimiento(p) {
    return `CONSENTIMIENTO INFORMADO - CIRUGÍA BARIÁTRICA
AVANTE COMPLEJO HOSPITALARIO

Paciente: ${p.nombre || '[Nombre]'}
Edad: ${p.edad || '[]'}  IMC: ${imc(p).toFixed(1)}
Procedimiento propuesto: ${PROCS[p.procedimiento] || '[]'}

NATURALEZA DEL PROCEDIMIENTO:
He sido informado(a) que se me realizará ${PROCS[p.procedimiento] || 'el procedimiento'} por vía laparoscópica, bajo anestesia general, con fines de tratamiento de obesidad y comorbilidades asociadas.

ALTERNATIVAS:
Se me han explicado alternativas no quirúrgicas (dieta, ejercicio, farmacoterapia con GLP-1, balón intragástrico, ESG) y otros procedimientos quirúrgicos. Comprendo por qué este procedimiento es el recomendado para mi caso.

BENEFICIOS ESPERADOS:
- Pérdida de peso significativa (60-80% del exceso)
- Mejoría/remisión de comorbilidades (DM, HTA, AOS, ERGE, dislipidemia)
- Mejoría en calidad de vida y expectativa de vida
- Reducción de riesgo cardiovascular y oncológico

RIESGOS Y COMPLICACIONES:
Riesgos generales: sangrado, infección, trombosis venosa profunda, embolia pulmonar, reacciones anestésicas.
Riesgos específicos: fuga anastomótica/de sutura (~1%), estenosis, hernia interna, deficiencias nutricionales, dumping, ERGE de novo, necesidad de reintervención. Mortalidad: <0.3% en centros acreditados.

COMPROMISOS DEL PACIENTE:
- Cumplir con todas las indicaciones pre y postoperatorias
- Mantener seguimiento médico de por vida
- Tomar suplementos nutricionales indicados
- Asistir a citas de nutrición, psicología y cirugía
- Notificar inmediatamente cualquier signo de alarma

DECLARACIÓN:
Declaro que he leído y entendido esta información, he tenido oportunidad de hacer preguntas y han sido respondidas satisfactoriamente. Acepto voluntariamente someterme al procedimiento.

Firma del paciente: _______________________  Fecha: ___________
Firma del testigo: ________________________  Fecha: ___________
Dr. Ángel Henríquez (Cirujano): _______________________`;
  }

  const ASEGURADORAS_DOC = [
    'Carta solicitud de cobertura firmada por cirujano tratante',
    'Historia clínica completa con justificación médica (criterios IFSO/ASMBS)',
    'Cálculo de IMC con peso y talla certificados',
    'Listado de comorbilidades con CIE-10',
    'Reportes de evaluaciones: cardiología, endocrinología, nutrición, psicología',
    'Laboratorios completos vigentes (<60 días)',
    'Endoscopia digestiva alta',
    'Estudios de imagen pertinentes',
    'Cotización detallada del paquete quirúrgico',
    'Consentimiento informado firmado'
  ];

  const VARIABLES_REGISTRO = [
    { cat:'Demográficas',     vars:'Edad, sexo, etnia, ocupación, nivel educativo' },
    { cat:'Antropométricas',  vars:'Peso, talla, IMC, circunferencia abdominal, % grasa corporal' },
    { cat:'Comorbilidades',   vars:'DM2 (HbA1c, antidiabéticos), HTA, AOS, ERGE, dislipidemia, NASH, SOP, depresión' },
    { cat:'Quirúrgicas',      vars:'Procedimiento, duración, sangrado, técnica antirreflujo, drenajes, conversión' },
    { cat:'Postoperatorias',  vars:'Estancia, complicaciones (Clavien-Dindo), reingreso, reintervención, mortalidad' },
    { cat:'Seguimiento',      vars:'Peso a 1/3/6/12/24/60m, %PEP, %PTP, remisión de comorbilidades, déficits nutricionales' },
    { cat:'PROMs',            vars:'BAROS, IWQOL-Lite, calidad de vida SF-36, satisfacción del paciente' },
    { cat:'Específicas Avante', vars:'TAP block + bloqueo visceral autonómico (su línea de investigación), uso de GLP-1 puente' }
  ];

  const LINEAS_INVESTIGACION = [
    'TAP block + bloqueo visceral autonómico en cirugía bariátrica (en curso, su artículo)',
    'Coledocolitiasis post-bariátrica: incidencia y manejo',
    'GLP-1 como puente preoperatorio en IMC≥50',
    'Resultados a largo plazo de manga vs RYGB en población centroamericana',
    'NASH/MAFLD pre y postoperatorio',
    'Costo-efectividad de la cirugía bariátrica en sistema privado salvadoreño'
  ];

  const CODIGOS_EMERGENCIA = [
    { codigo:'CÓDIGO FUGA',       disparador:'Taquicardia >120 + dolor abdominal + fiebre',                         acciones:['Activar equipo quirúrgico','TC con contraste oral STAT','Reservar quirófano','NPO, fluidos IV, antibiótico amplio espectro','Avisar UCI','Reintervención laparoscópica si confirma o alta sospecha clínica'] },
    { codigo:'CÓDIGO TEP',        disparador:'Disnea súbita + taquicardia + desaturación',                          acciones:['Oxígeno suplementario','Angio-TC pulmonar STAT','Anticoagulación terapéutica empírica si alta probabilidad','Avisar UCI / cardiología','Eco transtorácico (sobrecarga VD)','Considerar trombolisis si inestabilidad'] },
    { codigo:'CÓDIGO HERNIA',     disparador:'Dolor abdominal cólico tardío + vómito biliar (post-RYGB/OAGB)',      acciones:['TC abdominal urgente','NPO, sonda nasogástrica','Laparoscopía exploradora si alta sospecha aún con TC negativa','Cierre de defectos mesentéricos','Resección intestinal si compromiso vascular'] },
    { codigo:'CÓDIGO WERNICKE',   disparador:'Confusión + ataxia + nistagmo + vómito persistente',                 acciones:['Tiamina 500mg IV c/8h x 3 días ANTES de cualquier glucosa','Hidratación cuidadosa','Evaluación neurológica','RM cerebro si disponible','Reevaluar nutrición y soporte enteral/parenteral'] },
    { codigo:'CÓDIGO HEMORRAGIA', disparador:'Hipotensión + taquicardia + caída Hb + sangrado',                    acciones:['Reanimación con cristaloides','Tipificar y cruzar 4U PRBC','Endoscopia urgente si sangrado intraluminal','TC con contraste si sangrado intraabdominal','Reintervención si inestabilidad'] }
  ];

  // ----------------------- UI -----------------------

  function tabsHTML() {
    const tabs = [
      { id:'educacion',     icon:'book-open',    l:'Educación' },
      { id:'costos',        icon:'dollar-sign',  l:'Costos/Aseguradoras' },
      { id:'investigacion', icon:'flask-conical', l:'Investigación' },
      { id:'emergencias',   icon:'siren',        l:'Emergencias' }
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

  function educacionHTML(p) {
    const edu = `<div>
      <div class="flex justify-between items-center flex-wrap gap-2 mb-2">
        <h3 class="font-bold text-sm" style="color:${C.navy};">Material educativo para el paciente</h3>
        <button id="btn-edu-pdf" class="btn text-white text-sm flex items-center gap-1" style="background:${C.teal};">
          <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Descargar guía en PDF
        </button>
      </div>
      <div class="space-y-2">
        ${EDUCACION.map(e => `<div class="p-3 rounded border-l-4" style="background:${C.cream}; border-color:${C.gold};">
          <div class="font-bold text-sm mb-1" style="color:${C.navy};">${escapeHtml(e.tema)}</div>
          <div class="text-sm text-gray-700">${escapeHtml(e.contenido)}</div>
        </div>`).join('')}
      </div>
    </div>`;
    if (state.modo === 'paciente') return `<div class="space-y-4">${edu}</div>`;
    return `<div class="space-y-4">
      ${edu}
      <div>
        <h3 class="font-bold mb-2 text-sm flex items-center gap-1" style="color:${C.navy};">
          <i data-lucide="file-edit" class="w-4 h-4"></i> Consentimiento informado (editable)
        </h3>
        <div class="text-xs text-gray-600 mb-2">
          Puede modificar libremente el texto del consentimiento. Los cambios se guardan automáticamente por paciente y se usan al generar el PDF.
        </div>
        <textarea id="txt-cons" rows="18" class="w-full p-3 rounded border font-mono text-xs"
          style="background:${C.cream}; border-color:${C.teal}; color:${C.navy};">${escapeHtml(getConsentimiento(p))}</textarea>
        <div class="flex gap-2 mt-2 flex-wrap">
          <button id="btn-copiar-cons" class="btn text-white text-sm flex items-center gap-1" style="background:${C.gold};">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copiar
          </button>
          <button id="btn-pdf-cons" class="btn text-white text-sm flex items-center gap-1" style="background:${C.teal};">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Descargar PDF firmado
          </button>
          <button id="btn-reset-cons" class="btn text-sm" style="background:#e5e7eb;">
            Restablecer plantilla
          </button>
        </div>
      </div>
    </div>`;
  }

  function costosHTML(p) {
    if (state.modo === 'paciente') {
      return `<div class="p-6 rounded text-center" style="background:${C.cream};">
        <i data-lucide="dollar-sign" class="w-10 h-10 mx-auto mb-3" style="color:${C.teal};"></i>
        <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Inversión en su salud</h3>
        <p class="text-gray-700 mb-4">Trabajamos con las principales aseguradoras médicas y ofrecemos planes de financiamiento. Le ayudaremos en cada paso del trámite.</p>
        <button class="btn text-white" style="background:${C.teal};">Cotización personalizada</button>
      </div>`;
    }
    const campo = (pq, key, label) => `
      <div class="p-2 rounded" style="background:${C.cream};">
        <label class="text-[11px] text-gray-600 block">${label}</label>
        <div class="flex items-center gap-1">
          <span class="font-bold" style="color:${C.navy};">$</span>
          <input type="number" data-paquete-proc="${pq.proc}" data-paquete-campo="${key}" value="${escapeHtml(pq[key])}"
            class="w-full bg-transparent font-bold outline-none" style="color:${C.navy};">
        </div>
      </div>`;

    return `<div class="space-y-4">
      <div class="p-3 rounded text-xs" style="background:${C.cream}; color:${C.navy};">
        <i data-lucide="info" class="w-3.5 h-3.5 inline mr-1"></i>
        Los precios son editables y se guardan localmente. Ajuste a los valores tropicalizados de su mercado.
        <button id="btn-reset-paquetes" class="ml-2 text-xs underline" style="color:${C.teal};">Restablecer por defecto</button>
      </div>
      ${state.paquetes.map(pq => {
        const total = totalPaquete(pq);
        return `<div class="border rounded p-3">
          <div class="font-bold text-sm mb-2" style="color:${C.navy};">${escapeHtml(PROCS[pq.proc])} <span class="text-xs font-normal text-gray-500">(USD)</span></div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            ${campo(pq, 'honorarios', 'Honorarios médicos')}
            ${campo(pq, 'hospital', 'Hospitalización')}
            ${campo(pq, 'anestesia', 'Anestesia')}
            ${campo(pq, 'materiales', 'Materiales/grapas')}
          </div>
          <div class="mt-2 p-2 rounded text-white text-center" style="background:${C.navy};">
            <span class="text-xs opacity-90">TOTAL: </span>
            <span class="text-xl font-bold" style="color:${C.gold};" data-total-proc="${pq.proc}">$${total.toLocaleString()}</span>
          </div>
        </div>`;
      }).join('')}
      <div>
        <h3 class="font-bold mb-2 text-sm" style="color:${C.navy};">Documentación requerida para aseguradora</h3>
        <ul class="space-y-1 p-3 rounded" style="background:${C.cream};">
          ${ASEGURADORAS_DOC.map(d => `<li class="text-sm flex gap-2">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5 flex-shrink-0 mt-1" style="color:${C.teal};"></i>${escapeHtml(d)}
          </li>`).join('')}
        </ul>
      </div>
    </div>`;
  }

  function investigacionHTML() {
    return `<div class="space-y-4">
      <div>
        <h3 class="font-bold mb-2 text-sm" style="color:${C.navy};">Variables del registro institucional</h3>
        <div class="space-y-2">
          ${VARIABLES_REGISTRO.map(v => `<div class="p-3 rounded border-l-4" style="background:${C.cream}; border-color:${C.teal};">
            <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(v.cat)}</div>
            <div class="text-xs text-gray-700">${escapeHtml(v.vars)}</div>
          </div>`).join('')}
        </div>
      </div>
      <div>
        <h3 class="font-bold mb-2 text-sm" style="color:${C.navy};">Líneas de investigación activas Avante</h3>
        <ul class="space-y-1 p-3 rounded" style="background:${C.cream};">
          ${LINEAS_INVESTIGACION.map(l => `<li class="text-sm flex gap-2">
            <i data-lucide="flask-conical" class="w-3.5 h-3.5 flex-shrink-0 mt-1" style="color:${C.gold};"></i>${escapeHtml(l)}
          </li>`).join('')}
        </ul>
      </div>
    </div>`;
  }

  function telefonoBanner() {
    return `<a href="tel:${AVANTE_TEL.replace(/\s|-/g,'')}" class="block p-4 rounded-lg mb-4 text-white text-center no-underline" style="background:${C.red};">
      <div class="flex items-center justify-center gap-3">
        <i data-lucide="phone-call" class="w-6 h-6"></i>
        <div>
          <div class="text-xs uppercase opacity-90">Línea de emergencia Avante 24/7</div>
          <div class="text-2xl font-bold tracking-wide">${AVANTE_TEL}</div>
        </div>
      </div>
    </a>`;
  }

  function emergenciasHTML() {
    if (state.modo === 'paciente') {
      return `<div>
        ${telefonoBanner()}
        <div class="p-6 rounded text-center" style="background:${C.cream};">
          <i data-lucide="siren" class="w-10 h-10 mx-auto mb-3" style="color:${C.red};"></i>
          <h3 class="text-xl font-bold mb-2" style="font-family:Georgia,serif; color:${C.navy};">Estamos preparados 24/7</h3>
          <p class="text-gray-700 mb-4">Si presenta fiebre, dolor severo, vómito persistente, disnea o sangrado, llame de inmediato al número anterior.</p>
        </div>
      </div>`;
    }
    return `<div class="space-y-3">
      ${telefonoBanner()}
      <div class="flex justify-between items-center flex-wrap gap-2">
        <h3 class="font-bold text-sm" style="color:${C.navy};">Códigos de activación rápida</h3>
        <button id="btn-emerg-pdf" class="btn text-white text-sm flex items-center gap-1" style="background:${C.red};">
          <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Descargar PDF para fellows
        </button>
      </div>
      ${CODIGOS_EMERGENCIA.map(c => `<div class="p-4 rounded border-l-4" style="border-color:${C.red}; background:${C.cream};">
        <div class="flex items-center gap-2 mb-1">
          <i data-lucide="alert-circle" class="w-5 h-5" style="color:${C.red};"></i>
          <div class="font-bold" style="color:${C.red};">${escapeHtml(c.codigo)}</div>
        </div>
        <div class="text-xs italic text-gray-600 mb-2">Disparador: ${escapeHtml(c.disparador)}</div>
        <ul class="space-y-1">
          ${c.acciones.map(a => `<li class="text-sm flex gap-2">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5 flex-shrink-0 mt-1" style="color:${C.teal};"></i>${escapeHtml(a)}
          </li>`).join('')}
        </ul>
      </div>`).join('')}
    </div>`;
  }

  function educacionPDF() {
    descargarPDF({
      titulo: 'Guía educativa para el paciente',
      subtitulo: 'Cirugía bariátrica · Avante Complejo Hospitalario',
      secciones: EDUCACION.map(e => ({ titulo: e.tema, texto: e.contenido })),
      nombreArchivo: 'avante_guia_paciente.pdf',
      firmaPaciente: false
    });
  }

  function consentimientoPDF(p) {
    const texto = getConsentimiento(p);
    const bloques = texto.split(/\n(?=[A-ZÁÉÍÓÚÑ ]+:)/);
    const secciones = bloques.map(b => {
      const m = b.match(/^([A-ZÁÉÍÓÚÑ ]+):\s*([\s\S]*)$/);
      if (m) return { titulo: m[1].trim(), texto: m[2].trim() };
      return { titulo: 'Consentimiento', texto: b.trim() };
    });
    descargarPDF({
      titulo: 'Consentimiento informado — Cirugía bariátrica',
      subtitulo: 'Módulo 6 · Documentación legal',
      paciente: p,
      secciones,
      nombreArchivo: `avante_consentimiento_${(p.nombre || 'paciente').replace(/\s+/g,'_')}.pdf`
    });
  }

  function emergenciasPDF() {
    descargarPDF({
      titulo: 'Códigos de emergencia bariátrica',
      subtitulo: 'Módulo 6 · Guía para fellows y equipo de guardia',
      secciones: [
        { titulo: 'Línea Avante 24/7',
          texto: `Ante cualquier duda o activación de código, contacte de inmediato:\n\n${AVANTE_TEL}` },
        ...CODIGOS_EMERGENCIA.map(c => ({
          titulo: `${c.codigo}  ·  ${c.disparador}`,
          texto: c.acciones.map(a => '• ' + a).join('\n')
        })),
        { titulo: 'Principios generales',
          texto: '• No retrase imagen diagnóstica por sospecha clínica — actúe.\n• Tiamina ANTES de glucosa en todo paciente bariátrico con alteración neurológica.\n• Ante inestabilidad hemodinámica post-bariátrica: quirófano primero, imagen después si tiempo lo permite.\n• Siempre avisar al cirujano tratante y a UCI de forma paralela.' }
      ],
      nombreArchivo: 'avante_codigos_emergencia.pdf',
      firmaPaciente: false
    });
  }

  function render(container) {
    containerRef = container;
    container.innerHTML = `
      <div class="min-h-screen p-4">
        <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          ${headerHTML(6, 'Educación · Costos · Investigación · Emergencias', state.modo)}
          <div class="p-6">
            ${!state.seleccionado ? `
              <h2 class="font-bold mb-3 flex items-center gap-2" style="color:${C.navy};">
                <i data-lucide="users" class="w-5 h-5"></i> Seleccione paciente
              </h2>
              ${listaPacientesHTML(state.pacientes)}
            ` : (() => {
              const p = state.seleccionado;
              const panel = state.tab === 'educacion' ? educacionHTML(p)
                         : state.tab === 'costos'     ? costosHTML(p)
                         : state.tab === 'investigacion' ? investigacionHTML()
                         : emergenciasHTML();
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

    const p = state.seleccionado;
    const bCop = container.querySelector('#btn-copiar-cons');
    const bConsPdf = container.querySelector('#btn-pdf-cons');
    if (p && bCop) bCop.addEventListener('click', () => copiarAlPortapapeles(getConsentimiento(p)));
    if (p && bConsPdf) bConsPdf.addEventListener('click', () => consentimientoPDF(p));

    const txtCons = container.querySelector('#txt-cons');
    if (p && txtCons) txtCons.addEventListener('input', e => {
      state.consentimientoEdit[p.id] = e.target.value;
      guardarConsentimientos();
    });
    const bResetCons = container.querySelector('#btn-reset-cons');
    if (p && bResetCons) bResetCons.addEventListener('click', () => {
      if (!confirm('¿Restablecer el consentimiento a la plantilla por defecto?')) return;
      delete state.consentimientoEdit[p.id];
      guardarConsentimientos();
      render(containerRef);
    });

    const bEduPdf = container.querySelector('#btn-edu-pdf');
    if (bEduPdf) bEduPdf.addEventListener('click', educacionPDF);
    const bEmergPdf = container.querySelector('#btn-emerg-pdf');
    if (bEmergPdf) bEmergPdf.addEventListener('click', emergenciasPDF);

    // Costos editables
    container.querySelectorAll('[data-paquete-proc]').forEach(inp => {
      inp.addEventListener('input', e => {
        const proc = inp.dataset.paqueteProc;
        const campo = inp.dataset.paqueteCampo;
        const pq = state.paquetes.find(x => x.proc === proc);
        if (!pq) return;
        pq[campo] = parseFloat(e.target.value) || 0;
        guardarPaquetes();
        const totalEl = container.querySelector(`[data-total-proc="${proc}"]`);
        if (totalEl) totalEl.textContent = '$' + totalPaquete(pq).toLocaleString();
      });
    });
    const bReset = container.querySelector('#btn-reset-paquetes');
    if (bReset) bReset.addEventListener('click', () => {
      if (!confirm('¿Restablecer los precios por defecto?')) return;
      state.paquetes = PAQUETES_DEFAULT.map(x => ({ ...x }));
      guardarPaquetes();
      render(containerRef);
    });
  }

  return { render(container) { cargar(); render(container); } };
})();
