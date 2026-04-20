// ============================================================
// Módulo 8 · Biblioteca Documental & Análisis Clínico por Paciente
// ============================================================

window.AvanteModulo8 = (function () {

  const state = {
    modo: 'clinico',
    pacientes: [],
    seleccionado: null,
    tab: 'biblioteca'
  };
  let containerRef = null;

  function cargar() { state.pacientes = storageGet('avante_pacientes') || []; }

  // ------------- Referencias científicas canónicas -------------
  function referencias() {
    return [
      'Schauer PR, et al. Bariatric surgery versus intensive medical therapy for diabetes — 5-year outcomes (STAMPEDE). N Engl J Med 2017; 376:641-651.',
      'Peterli R, et al. Effect of laparoscopic sleeve gastrectomy vs Roux-en-Y gastric bypass on weight loss in patients with morbid obesity (SM-BOSS). JAMA 2018; 319(3):255-265.',
      'Salminen P, et al. Long-term effect of sleeve gastrectomy vs Roux-en-Y gastric bypass on weight loss and comorbidities (SLEEVEPASS, 10-year). JAMA Surg 2022; 157(8):656-666.',
      'Sjöström L, et al. Bariatric surgery and long-term cardiovascular events (SOS). JAMA 2012; 307(1):56-65.',
      'Mingrone G, et al. Metabolic surgery versus conventional medical therapy in patients with type 2 diabetes: 10-year follow-up. Lancet 2021; 397:293-304.',
      'Sharma AM, Kushner RF. A proposed clinical staging system for obesity (EOSS). Int J Obes 2009; 33:289-295.',
      'DeMaria EJ, et al. Validation of the Obesity Surgery Mortality Risk Score (OS-MRS). Ann Surg 2007; 246:578-584.',
      'Eisenberg D, et al. 2022 ASMBS/IFSO Indications for Metabolic and Bariatric Surgery. Surg Obes Relat Dis 2022; 18(12):1345-1356.',
      'Stenberg E, et al. Guidelines for Perioperative Care in Bariatric Surgery: ERAS Society Recommendations (2021 update). World J Surg 2022; 46:729-751.',
      'Arterburn DE, et al. Association between bariatric surgery and long-term survival. JAMA 2015; 313(1):62-70.'
    ];
  }

  // -------- Biblioteca de documentos globales (no por paciente) --------
  function documentosGlobales() {
    return [
      {
        id:'guia-paciente',
        titulo:'Guía del paciente bariátrico',
        descripcion:'Documento educativo con preparación, dieta progresiva, alarmas y contactos.',
        icon:'book-open',
        generar:() => descargarPDF({
          titulo:'Guía del paciente bariátrico',
          subtitulo:'Información general para pacientes y familiares',
          secciones:[
            { titulo:'Antes de la cirugía',
              texto:'• Cumpla la dieta preoperatoria (líquida hiperproteica 2 semanas previas).\n• Suspenda tabaco ≥6 semanas antes.\n• Lleve al hospital sus medicamentos habituales y estudios recientes.\n• Mantenga profilaxis según indicaciones (medias de compresión, caminar).\n• Ayuno: sólidos 6h, líquidos claros 2h previos.' },
            { titulo:'El día de la cirugía',
              texto:'• Acuda en ayuno e higiene preoperatoria.\n• Traiga acompañante.\n• Anestesia general, laparoscópica, duración aproximada 1-3h.\n• Despertará con líquidos IV, profilaxis antitrombótica y analgesia multimodal.' },
            { titulo:'Después de la cirugía',
              texto:'• Movilización temprana (<6h post-op).\n• Progresión de dieta: claros → completos → purés → sólidos (6 semanas).\n• Hidratación ≥1.5L/día en sorbos pequeños, separada de las comidas.\n• Suplementos obligatorios: multivitamínico bariátrico, calcio citrato, vit D, B12, hierro.\n• Control telefónico 24-48h post-alta y presencial a los 7-10 días.' },
            { titulo:'Signos de alarma — contacte de inmediato',
              texto:'• Taquicardia sostenida >120 lpm.\n• Fiebre >38.5°C.\n• Dolor abdominal severo o progresivo.\n• Vómito persistente, imposibilidad de tolerar líquidos.\n• Sangrado digestivo, disnea, dolor torácico, hinchazón asimétrica de pierna.' },
            { titulo:'Contacto 24/7',
              texto:`Línea directa AVANTE: ${AVANTE_TEL}\nEn caso de emergencia grave acuda al servicio de urgencias más cercano e informe que es paciente bariátrico reciente.` }
          ],
          nombreArchivo:'avante_guia_paciente.pdf',
          firmaPaciente:false
        })
      },
      {
        id:'codigos-emergencia',
        titulo:'Códigos de emergencia bariátrica',
        descripcion:'Protocolo rápido para personal de urgencias ante fuga, sangrado o TEP postoperatorio.',
        icon:'siren',
        generar:() => descargarPDF({
          titulo:'Códigos de emergencia bariátrica',
          subtitulo:'Algoritmos rápidos para personal médico',
          secciones:[
            { titulo:'Código FUGA (sospecha de dehiscencia/fuga)',
              texto:'Triada: taquicardia persistente + dolor abdominal + fiebre.\n1) NPO, líquidos IV, O₂.\n2) Laboratorios urgentes + PCR + lactato.\n3) TC con contraste oral hidrosoluble (no bario).\n4) Avisar al cirujano bariatra y quirófano disponible.\n5) ATB amplio espectro empírico. Reintervención si inestabilidad o fuga confirmada.' },
            { titulo:'Código SANGRADO',
              texto:'Hipotensión, caída de Hb >2 g/dL, drenaje hemático o melena.\n1) Dos vías periféricas gruesas + cruzar 2-4 U.\n2) Suspender HBPM. Reversión si corresponde.\n3) Endoscopia temprana en sangrado intraluminal; laparoscopia/laparotomía si hemoperitoneo.\n4) Transfusión guiada por Hb y estabilidad.' },
            { titulo:'Código TEP',
              texto:'Disnea súbita, taquicardia, desaturación, dolor torácico.\n1) O₂, monitor, acceso IV.\n2) AngioTC pulmonar urgente (o eco-Doppler + D-dímero si no disponible).\n3) Anticoagulación plena si no hay contraindicación.\n4) Considerar trombólisis si inestabilidad hemodinámica.' },
            { titulo:'Contacto permanente',
              texto:`Clínica de Obesidad y Metabólica by AVANTE — ${AVANTE_TEL}\nSolicite al bariatra de guardia. Todo paciente operado <90 días debe ser evaluado por el equipo bariátrico antes del alta.` }
          ],
          nombreArchivo:'avante_codigos_emergencia.pdf',
          firmaPaciente:false
        })
      },
      {
        id:'checklist-ingreso',
        titulo:'Checklist de ingreso hospitalario',
        descripcion:'Lista de verificación para el día de la cirugía.',
        icon:'clipboard-check',
        generar:() => descargarPDF({
          titulo:'Checklist de ingreso hospitalario',
          subtitulo:'Preoperatorio inmediato',
          secciones:[
            { titulo:'Verificación documental',
              texto:'□ Consentimiento informado firmado\n□ Estudios preoperatorios completos (laboratorio, ECG, Rx tórax, endoscopia)\n□ Valoración cardiológica si indicada\n□ Valoración neumológica / CPAP disponible si AOS\n□ Valoración nutricional y psicológica' },
            { titulo:'Preparación del paciente',
              texto:'□ Ayuno respetado\n□ Baño antiséptico\n□ Medias de compresión colocadas\n□ Vía periférica permeable\n□ Marcaje de sitio quirúrgico' },
            { titulo:'Plan perioperatorio',
              texto:'□ Profilaxis antibiótica programada\n□ HBPM en tiempo reglamentario\n□ Reserva de hemoderivados si indicado\n□ Equipo y consumibles verificados\n□ UCI / camilla bariátrica disponible' }
          ],
          nombreArchivo:'avante_checklist_ingreso.pdf',
          firmaPaciente:false
        })
      }
    ];
  }

  // -------- Análisis clínico por paciente (con citas) --------
  function analisisClinico(p) {
    const i = imc(p);
    const c = p.comorbilidades || {};
    const s = scoreIntegrado(p);
    const parrafos = [];

    parrafos.push(
`Perfil clínico: paciente de ${p.edad || '—'} años, sexo ${p.sexo==='M'?'masculino':'femenino'}, IMC ${i.toFixed(1)} kg/m². Estratificación integrada: ${s.valor}/100 (${s.nivel.toUpperCase()}); OS-MRS ${s.osmrs.score}/5 (clase ${s.osmrs.clase}, mortalidad esperada ${s.osmrs.mortalidad}); EOSS estadio ${s.eoss}; Caprini ${s.caprini} pts. La indicación quirúrgica y la selección técnica deben alinearse con las guías ASMBS/IFSO 2022, que reconocen IMC ≥35 kg/m² con o sin comorbilidades como indicación sólida, e IMC 30-34.9 kg/m² con enfermedad metabólica no controlada.`
    );

    if (c.dm) parrafos.push(
`Diabetes tipo 2: en el ensayo STAMPEDE a 5 años (Schauer, NEJM 2017), la cirugía metabólica logró HbA1c ≤6% en 29% (RYGB) y 23% (manga) frente a 5% del tratamiento médico intensivo. El seguimiento a 10 años del grupo italiano de Mingrone (Lancet 2021) demuestra remisión sostenida y menor incidencia de complicaciones micro y macrovasculares. En este paciente, un procedimiento con componente hipoabsortivo (RYGB/OAGB/SADI-S) ofrece mayor probabilidad de remisión metabólica que la manga gástrica pura.`
    );

    if (c.erge) parrafos.push(
`ERGE significativo: la manga gástrica se asocia a novo o empeoramiento del reflujo hasta en 30% a 5 años (SLEEVEPASS 2022). El RYGB sigue siendo el estándar antirreflujo y debe priorizarse. Si se mantiene la manga, documentar endoscopia e índice de DeMeester preoperatorios como línea basal.`
    );

    if (i >= 50) parrafos.push(
`Obesidad extrema (IMC ≥50): terapia puente con agonistas GLP-1/GIP (semaglutida, tirzepatida) o balón intragástrico durante 4-6 meses puede reducir el IMC ≥10%, disminuyendo el riesgo perioperatorio. En IMC ≥60, BPD-DS o SADI-S ofrecen la mayor pérdida sostenida a largo plazo, aunque con mayor complejidad técnica y requerimiento de vigilancia nutricional estricta (IFSO Global Registry).`
    );

    if (c.aos) parrafos.push(
`Apnea obstructiva del sueño: polisomnografía confirmatoria y adherencia ≥4 h/noche al CPAP durante ≥4 semanas preoperatorias. El uso perioperatorio reduce eventos cardiopulmonares y reintubación. Mantener CPAP en sala de recuperación y durante el primer postoperatorio.`
    );

    if (c.tabaco) parrafos.push(
`Tabaquismo activo: la cesación ≥6 semanas previas es obligatoria; duplica el riesgo de fuga anastomótica y úlcera marginal (especialmente en RYGB/OAGB). Apoyo farmacológico con vareniclina o bupropión aumenta la tasa de éxito.`
    );

    if (c.tep || s.caprini >= 8) parrafos.push(
`Riesgo tromboembólico elevado (Caprini ${s.caprini}): profilaxis mecánica (compresión neumática) + farmacológica con HBPM ajustada por peso, extendida 2-4 semanas post-alta. En antecedente de TEP/TVP, valoración por hematología y considerar filtro de vena cava sólo en casos seleccionados.`
    );

    parrafos.push(
`Protocolo ERAS bariátrico (Stenberg, World J Surg 2022): carga de carbohidratos 2h pre-op si no hay DM descompensada, analgesia multimodal opioid-sparing (TAP block + bloqueo visceral autonómico, paracetamol, AINE), antieméticos profilácticos, movilización <6h, líquidos claros <12h, egreso a las 24-48h con criterios objetivos. La adherencia al bundle reduce complicaciones y estancia hospitalaria.`
    );

    parrafos.push(
`Seguimiento postoperatorio a largo plazo: los estudios SOS (JAMA 2012) y Arterburn (JAMA 2015) demuestran reducción de mortalidad global, cardiovascular y por cáncer en pacientes operados. El seguimiento debe incluir controles clínicos a 1-3-6-12 meses y luego anual, con perfil bioquímico, vitaminas liposolubles, hierro, B12, PTH y DEXA según protocolo, además de apoyo conductual y nutricional continuo para consolidar los resultados.`
    );

    return parrafos;
  }

  // -------- Descarga del resumen integral por paciente --------
  function descargarResumenCompleto(p) {
    const s = scoreIntegrado(p);
    const recs = recomendaciones(p);
    const mod2 = window.AvanteModulo2;
    const opt = mod2 && mod2.planOptimizacion ? mod2.planOptimizacion(p) : [];
    const procRec = mod2 && mod2.recomendarProcedimiento ? mod2.recomendarProcedimiento(p) : [];
    const prof = mod2 && mod2.protocoloProfilaxis ? mod2.protocoloProfilaxis(p) : null;
    const parrafos = analisisClinico(p);
    const refs = referencias();

    const comorbTxt = Object.entries(p.comorbilidades || {})
      .filter(([,v]) => v)
      .map(([k]) => {
        const c = COMORBIDITIES.find(x => x.id === k);
        return c ? '• ' + c.label : '';
      })
      .filter(Boolean)
      .join('\n') || 'Sin comorbilidades registradas.';

    const secciones = [];

    secciones.push({
      titulo:'Datos clínicos básicos',
      texto:
`Nombre: ${p.nombre || '—'}
Expediente: ${p.expediente || '—'}
Edad: ${p.edad || '—'}   Sexo: ${p.sexo==='M'?'Masculino':'Femenino'}
Peso: ${p.peso || '—'} kg   Talla: ${p.talla || '—'} cm   IMC: ${imc(p).toFixed(1)} kg/m²
Estado funcional: ${p.funcional}   ASA: ${p.asa}
Procedimiento propuesto: ${PROCS[p.procedimiento] || '—'}`
    });

    if (p.historia && p.historia.trim()) {
      secciones.push({ titulo:'Historia clínica', texto:p.historia });
    }

    secciones.push({ titulo:'Comorbilidades', texto:comorbTxt });
    if (p.otrosAntecedentes && p.otrosAntecedentes.trim()) {
      secciones.push({ titulo:'Otros antecedentes personales', texto:p.otrosAntecedentes });
    }

    secciones.push({
      titulo:'Estratificación de riesgo integrada',
      texto:
`OS-MRS: ${s.osmrs.score}/5 — Clase ${s.osmrs.clase} — Mortalidad esperada ${s.osmrs.mortalidad}
EOSS: Estadio ${s.eoss}
Caprini: ${s.caprini} puntos
Riesgo integrado: ${s.valor}/100 (${s.nivel.toUpperCase()})`,
      metricas:[
        { label:'OS-MRS', valor:`${s.osmrs.score}/5` },
        { label:'EOSS', valor:`E${s.eoss}` },
        { label:'Caprini', valor:s.caprini },
        { label:'Riesgo', valor:`${s.valor}/100` },
        { label:'Clase', valor:s.osmrs.clase },
        { label:'Nivel', valor:s.nivel.toUpperCase() }
      ]
    });

    if (opt.length) {
      secciones.push({
        titulo:'Plan de optimización preoperatoria',
        texto: opt.map(x => `• [${x.prio.toUpperCase()}] ${x.area} (${x.tiempo})\n   ${x.accion}`).join('\n\n')
      });
    }

    if (procRec.length) {
      secciones.push({
        titulo:'Recomendación de procedimiento (algoritmo IFSO/ASMBS)',
        texto: procRec.map((x,i) => `${i+1}. ${PROCS[x.proc]} — ${x.score}/100\n   ${x.razon}`).join('\n\n')
      });
    }

    if (prof) {
      secciones.push({
        titulo:`Profilaxis perioperatoria (Caprini ${prof.caprini} · ${prof.tev.nivel})`,
        texto:
`TEV: ${prof.tev.plan}
Antibiótica: ${prof.atb.plan}
ERAS:
${prof.eras.map(e => '• ' + e).join('\n')}`
      });
    }

    if (recs.length) {
      secciones.push({
        titulo:'Recomendaciones clínicas adicionales',
        texto: recs.map(r => `[${r.tipo.toUpperCase()}] ${r.texto}`).join('\n')
      });
    }

    const mod1 = window.AvanteModulo1;
    if (mod1 && mod1.trayectoriaPaciente && p.procedimiento && p.peso) {
      const tray = mod1.trayectoriaPaciente(p);
      const pesoInicial = parseFloat(p.peso) || 0;
      const twl12 = tray.twlPct[12];
      const peso12 = tray.pesoProy[12];
      const kgPerdidos = (pesoInicial - peso12).toFixed(1);
      const tallaM = (parseFloat(p.talla) || 0) / 100;
      const imc12 = tallaM ? (peso12 / (tallaM*tallaM)).toFixed(1) : '—';

      const hitos = [
        { m:3,  label:'3 meses'  },
        { m:6,  label:'6 meses'  },
        { m:9,  label:'9 meses'  },
        { m:12, label:'12 meses' }
      ];
      const trayTxt = hitos.map(h => {
        return `• ${h.label}: %TWL ${tray.twlPct[h.m]}% — Peso estimado ${tray.pesoProy[h.m]} kg`;
      }).join('\n');

      secciones.push({
        titulo:'Proyección de pérdida de peso a 12 meses',
        texto:
`Procedimiento: ${PROCS[p.procedimiento]}
Peso inicial: ${pesoInicial} kg

${trayTxt}

Al completar el primer año se espera alcanzar aproximadamente ${twl12}% de pérdida del peso total (${kgPerdidos} kg perdidos), con un peso final estimado de ${peso12} kg e IMC ${imc12} kg/m².

Referencias: trayectorias promedio extraídas de SLEEVEPASS (JAMA Surg 2022), SM-BOSS (JAMA 2018), STAMPEDE (NEJM 2017) e IFSO Global Registry. La evolución real depende de adherencia dietaria, actividad física, suplementación y seguimiento multidisciplinario.`,
        metricas:[
          { label:'Proc.',    valor:(PROCS[p.procedimiento]||'').split(' ')[0] },
          { label:'%TWL 12m', valor:`${twl12}%` },
          { label:'Peso 12m', valor:`${peso12} kg` },
          { label:'Δ peso',   valor:`-${kgPerdidos} kg` },
          { label:'IMC 12m',  valor:imc12 },
          { label:'Meta',     valor:twl12 >= 25 ? 'Esperada' : 'Revisar' }
        ]
      });
    }

    secciones.push({
      titulo:'Análisis clínico basado en evidencia',
      texto: parrafos.join('\n\n')
    });

    secciones.push({
      titulo:'Referencias bibliográficas',
      texto: refs.map((r,i) => `${i+1}. ${r}`).join('\n')
    });

    descargarPDF({
      titulo:'Resumen integral del paciente bariátrico',
      subtitulo:'Módulo 8 · Análisis clínico basado en evidencia',
      paciente:p,
      secciones,
      nombreArchivo:`avante_resumen_integral_${(p.nombre || 'paciente').replace(/\s+/g,'_')}.pdf`
    });
  }

  // ---------------- Documentos por paciente (listado) ----------------
  function documentosPorPaciente(p) {
    return [
      {
        id:'resumen-integral',
        titulo:'Resumen integral + análisis clínico',
        descripcion:'Estratificación, plan, recomendación de procedimiento y análisis basado en evidencia con referencias.',
        icon:'file-text',
        destacado:true,
        generar:() => descargarResumenCompleto(p)
      },
      {
        id:'riesgo',
        titulo:'Reporte de estratificación de riesgo',
        descripcion:'Módulo 1 · OS-MRS, EOSS, Caprini y recomendaciones.',
        icon:'shield-alert',
        generar:() => {
          // Delegamos al módulo 1 si está cargado
          if (window.AvanteModulo1 && window.AvanteModulo1.reportePDF) {
            window.AvanteModulo1.reportePDF(p);
          }
        }
      },
      {
        id:'plan-peri',
        titulo:'Plan perioperatorio',
        descripcion:'Módulo 2 · Optimización, selección y profilaxis.',
        icon:'clipboard-list',
        generar:() => {
          const mod2 = window.AvanteModulo2;
          if (!mod2) return;
          const opt = mod2.planOptimizacion(p);
          const proc = mod2.recomendarProcedimiento(p);
          const prof = mod2.protocoloProfilaxis(p);
          descargarPDF({
            titulo:'Plan perioperatorio',
            subtitulo:'Módulo 2 · Optimización · Selección · Profilaxis',
            paciente:p,
            secciones:[
              { titulo:'Optimización preoperatoria',
                texto:opt.map(x => `• [${x.prio.toUpperCase()}] ${x.area} (${x.tiempo})\n   ${x.accion}`).join('\n\n') },
              { titulo:'Selección de procedimiento',
                texto:proc.map((x,i) => `${i+1}. ${PROCS[x.proc]} — ${x.score}/100\n   ${x.razon}`).join('\n\n') },
              { titulo:`Profilaxis TEV · Caprini ${prof.caprini} · riesgo ${prof.tev.nivel}`, texto:prof.tev.plan },
              { titulo:'Profilaxis antibiótica', texto:prof.atb.plan },
              { titulo:'Protocolo ERAS bariátrico', texto:prof.eras.map(x => '• ' + x).join('\n') }
            ],
            nombreArchivo:`avante_plan_${(p.nombre || 'paciente').replace(/\s+/g,'_')}.pdf`
          });
        }
      }
    ];
  }

  // --------------------- UI ---------------------

  function tarjetaDoc(d) {
    const color = d.destacado ? C.gold : C.teal;
    const bg = d.destacado ? C.cream : 'white';
    return `<div class="p-4 border rounded flex gap-3 items-start" style="background:${bg}; border-color:${d.destacado?C.gold:'#e5e7eb'};">
      <div class="p-2 rounded" style="background:${color};">
        <i data-lucide="${d.icon}" class="w-5 h-5 text-white"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-bold text-sm" style="color:${C.navy};">${escapeHtml(d.titulo)}</div>
        <div class="text-xs text-gray-600 mt-1">${escapeHtml(d.descripcion)}</div>
      </div>
      <button data-doc="${d.id}" class="btn text-white text-xs flex items-center gap-1 flex-shrink-0" style="background:${color};">
        <i data-lucide="download" class="w-3.5 h-3.5"></i> PDF
      </button>
    </div>`;
  }

  function bibliotecaHTML() {
    const docs = documentosGlobales();
    return `<div>
      <h3 class="font-bold mb-3 flex items-center gap-2" style="color:${C.navy};">
        <i data-lucide="library" class="w-5 h-5"></i> Biblioteca documental global
      </h3>
      <p class="text-xs text-gray-600 mb-4">Documentos clínicos y educativos no ligados a un paciente específico.</p>
      <div class="space-y-2">
        ${docs.map(tarjetaDoc).join('')}
      </div>
    </div>`;
  }

  function resumenPacienteHTML() {
    if (!state.seleccionado) {
      return `<div>
        <h3 class="font-bold mb-3 flex items-center gap-2" style="color:${C.navy};">
          <i data-lucide="users" class="w-5 h-5"></i> Seleccione un paciente
        </h3>
        ${listaPacientesHTML(state.pacientes, 'No hay pacientes guardados. Complete primero una evaluación en el Módulo 1.')}
      </div>`;
    }
    const p = state.seleccionado;
    const s = scoreIntegrado(p);
    const docs = documentosPorPaciente(p);
    return `<div>
      <div class="flex justify-between items-center mb-4 p-3 rounded flex-wrap gap-2" style="background:${C.cream};">
        <div>
          <div class="font-bold" style="color:${C.navy};">${escapeHtml(p.nombre)}</div>
          <div class="text-xs text-gray-600">${escapeHtml(p.edad)}a · ${escapeHtml(p.sexo)} · IMC ${imc(p).toFixed(1)} · ${escapeHtml(PROCS[p.procedimiento] || '')}</div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded text-white text-sm font-bold" style="background:${s.color};">${s.valor} · ${s.nivel}</span>
          <button id="btn-cambiar" class="btn text-sm" style="background:#e5e7eb;">Cambiar paciente</button>
        </div>
      </div>
      <h3 class="font-bold mb-2 flex items-center gap-2" style="color:${C.navy};">
        <i data-lucide="folder-open" class="w-5 h-5"></i> Documentos disponibles para este paciente
      </h3>
      <div class="space-y-2 mb-4">
        ${docs.map(tarjetaDoc).join('')}
      </div>
      ${state.modo === 'academico' ? `
        <div class="p-4 rounded border mt-4" style="border-color:${C.teal}; background:white;">
          <h4 class="font-bold mb-2 text-sm" style="color:${C.navy};">Análisis clínico (vista previa)</h4>
          <div class="space-y-2 text-xs text-gray-700">
            ${analisisClinico(p).map(pp => `<p>${escapeHtml(pp)}</p>`).join('')}
          </div>
          <div class="mt-3 pt-2 border-t">
            <div class="text-[11px] font-bold mb-1" style="color:${C.navy};">Referencias</div>
            <ol class="text-[10px] text-gray-600 list-decimal pl-4 space-y-0.5">
              ${referencias().map(r => `<li>${escapeHtml(r)}</li>`).join('')}
            </ol>
          </div>
        </div>` : ''}
    </div>`;
  }

  function tabsHTML() {
    const tabs = [
      { id:'biblioteca',    icon:'library',     l:'Biblioteca' },
      { id:'resumen',       icon:'user-search', l:'Resumen por paciente' }
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

  function render(container) {
    containerRef = container;
    const panel = state.tab === 'biblioteca' ? bibliotecaHTML() : resumenPacienteHTML();

    container.innerHTML = `
      <div class="min-h-screen p-4">
        <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          ${headerHTML(8, 'Biblioteca Documental & Análisis Clínico', state.modo)}
          <div class="p-6">
            ${tabsHTML()}
            ${panel}
            <div class="mt-6 pt-3 border-t text-[10px] text-center text-gray-400 italic">
              Idea original y desarrollo conceptual: Dr. Ángel Henríquez · Compartido para mejorar el cuidado bariátrico en todo el mundo.
            </div>
          </div>
        </div>
      </div>
    `;
    wire(container);
    refrescarIconos();
  }

  function wire(container) {
    container.querySelectorAll('[data-modo]').forEach(b => b.addEventListener('click', () => { state.modo = b.dataset.modo; render(containerRef); }));
    container.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { state.tab = b.dataset.tab; render(containerRef); }));
    container.querySelectorAll('[data-paciente-id]').forEach(b => b.addEventListener('click', () => {
      state.seleccionado = state.pacientes.find(p => p.id === b.dataset.pacienteId);
      render(containerRef);
    }));
    const bc = container.querySelector('#btn-cambiar');
    if (bc) bc.addEventListener('click', () => { state.seleccionado = null; render(containerRef); });

    container.querySelectorAll('[data-doc]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.doc;
        const fuente = state.tab === 'biblioteca' ? documentosGlobales() : (state.seleccionado ? documentosPorPaciente(state.seleccionado) : []);
        const doc = fuente.find(d => d.id === id);
        if (doc && typeof doc.generar === 'function') doc.generar();
      });
    });
  }

  return {
    render(container) { cargar(); render(container); },
    analisisClinico,
    referencias,
    descargarResumenCompleto
  };
})();
