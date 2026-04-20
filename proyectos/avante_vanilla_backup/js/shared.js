// ============================================================
// Avante · Constantes y utilidades compartidas
// ============================================================

const C = {
  navy:  '#0A1F44',
  teal:  '#1A8B9D',
  gold:  '#C9A961',
  cream: '#FAF7F2',
  green: '#2D8659',
  yellow:'#E0A82E',
  red:   '#C0392B'
};

const AVANTE_TEL = '+503 2537-6161';

const PROCEDURES = [
  { id: 'sleeve',       name: 'Manga Gástrica (SG)' },
  { id: 'rygb',         name: 'Bypass Gástrico en Y de Roux (RYGB)' },
  { id: 'oagb',         name: 'Bypass Gástrico de Una Anastomosis (OAGB)' },
  { id: 'sadis',        name: 'SADI-S' },
  { id: 'bpdds',        name: 'BPD-DS' },
  { id: 'rev_sg_rygb',  name: 'Revisión: Manga → RYGB' },
  { id: 'rev_sg_oagb',  name: 'Revisión: Manga → OAGB' }
];

const PROCS = {
  sleeve:'Manga Gástrica',
  rygb:'RYGB',
  oagb:'OAGB',
  sadis:'SADI-S',
  bpdds:'BPD-DS',
  rev_sg_rygb:'Rev. Manga→RYGB',
  rev_sg_oagb:'Rev. Manga→OAGB'
};

const COMORBIDITIES = [
  { id: 'hta',    label: 'Hipertensión arterial' },
  { id: 'tep',    label: 'Antecedente TEP/TVP' },
  { id: 'dm',     label: 'Diabetes mellitus' },
  { id: 'aos',    label: 'Apnea obstructiva del sueño' },
  { id: 'erge',   label: 'ERGE' },
  { id: 'asma',   label: 'Asma bronquial' },
  { id: 'tabaco', label: 'Tabaquismo activo' },
  { id: 'ivc',    label: 'Insuficiencia venosa crónica' },
  { id: 'cardio', label: 'Cardiopatía' },
  { id: 'erc',    label: 'Enfermedad renal crónica' },
  { id: 'acoag',  label: 'Anticoagulación crónica' },
  { id: 'disli',  label: 'Dislipidemia' }
];

const EMPTY_PATIENT = {
  id: '', nombre: '', edad: '', sexo: 'M',
  expediente: '',
  peso: '', talla: '',
  comorbilidades: {},
  otrosAntecedentes: '',
  asa: '2', funcional: 'independiente',
  eossMetabolico: 0, eossMecanico: 0, eossPsico: 0,
  procedimiento: 'sleeve',
  historia: ''
};

// Correlativo de expediente auto-generado (AVT-YYYY-NNNN)
function siguienteExpediente() {
  const counter = storageGet('avante_expediente_counter') || 0;
  const year = new Date().getFullYear();
  return `AVT-${year}-${String(counter + 1).padStart(4, '0')}`;
}
function confirmarExpediente(valor) {
  if (valor === siguienteExpediente()) {
    const counter = (storageGet('avante_expediente_counter') || 0) + 1;
    storageSet('avante_expediente_counter', counter);
  }
}

// ----------------------- Utilidades -----------------------

function storageGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function calcularIMC(peso, talla) {
  const p = parseFloat(peso), t = parseFloat(talla) / 100;
  if (!p || !t) return 0;
  return p / (t * t);
}
function imc(p) { return calcularIMC(p.peso, p.talla); }

function pep(pesoIni, pesoAct, talla) {
  const pi = parseFloat(pesoIni), pa = parseFloat(pesoAct), t = parseFloat(talla)/100;
  if (!pi || !pa || !t) return 0;
  const pIdeal = 25 * t * t;
  const exceso = pi - pIdeal;
  if (exceso <= 0) return 0;
  return ((pi - pa) / exceso) * 100;
}
function ptp(pesoIni, pesoAct) {
  const pi = parseFloat(pesoIni), pa = parseFloat(pesoAct);
  if (!pi || !pa) return 0;
  return ((pi - pa) / pi) * 100;
}

function calcularOSMRS(p) {
  let score = 0;
  if (parseFloat(p.edad) >= 45) score++;
  if (p.sexo === 'M') score++;
  if (calcularIMC(p.peso, p.talla) >= 50) score++;
  if (p.comorbilidades && p.comorbilidades.hta) score++;
  if (p.comorbilidades && p.comorbilidades.tep) score++;
  let clase = 'A', mortalidad = '0.2%';
  if (score >= 4) { clase = 'C'; mortalidad = '2.4%'; }
  else if (score >= 2) { clase = 'B'; mortalidad = '1.1%'; }
  return { score, clase, mortalidad };
}

function calcularEOSS(p) {
  return Math.max(p.eossMetabolico || 0, p.eossMecanico || 0, p.eossPsico || 0);
}

function calcularCaprini(p) {
  let score = 5;
  const edad = parseFloat(p.edad) || 0;
  const c = p.comorbilidades || {};
  if (edad >= 75) score += 3;
  else if (edad >= 61) score += 2;
  else if (edad >= 41) score += 1;
  if (c.tep) score += 3;
  if (c.ivc) score += 1;
  if (c.cardio) score += 1;
  if (c.aos) score += 1;
  if (calcularIMC(p.peso, p.talla) >= 40) score += 1;
  return score;
}

function scoreIntegrado(p) {
  const osmrs = calcularOSMRS(p);
  const eoss = calcularEOSS(p);
  const caprini = calcularCaprini(p);
  const asaN = parseInt(p.asa) || 1;
  const norm = (osmrs.score / 5) * 35 + (eoss / 4) * 30 + (Math.min(caprini, 15) / 15) * 20 + ((asaN - 1) / 3) * 15;
  let nivel = 'bajo', color = C.green;
  if (norm >= 60) { nivel = 'alto'; color = C.red; }
  else if (norm >= 35) { nivel = 'moderado'; color = C.yellow; }
  return { valor: Math.round(norm), nivel, color, osmrs, eoss, caprini };
}

function recomendaciones(p) {
  const recs = [];
  const i = calcularIMC(p.peso, p.talla);
  const c = p.comorbilidades || {};
  if (c.tabaco) recs.push({ tipo:'critico',    texto:'Cesación tabáquica OBLIGATORIA ≥6 semanas previo a cirugía' });
  if (c.dm)     recs.push({ tipo:'critico',    texto:'Optimizar HbA1c <8% (idealmente <7%) si insulinodependiente' });
  if (i >= 50)  recs.push({ tipo:'importante', texto:'IMC ≥50: considerar terapia puente (GLP-1 o balón intragástrico) previo a cirugía definitiva' });
  if (c.aos)    recs.push({ tipo:'importante', texto:'Polisomnografía y CPAP perioperatorio obligatorio' });
  if (c.tep)    recs.push({ tipo:'critico',    texto:'Profilaxis extendida ≥4 semanas + valoración hematología' });
  if (c.cardio) recs.push({ tipo:'importante', texto:'Valoración cardiológica preoperatoria + ecocardiograma' });
  if (c.erge && p.procedimiento === 'sleeve') recs.push({ tipo:'importante', texto:'ERGE significativo: considerar RYGB sobre manga gástrica' });
  if (c.acoag)  recs.push({ tipo:'critico',    texto:'Plan de puenteo anticoagulante con hematología' });
  if (calcularCaprini(p) >= 8) recs.push({ tipo:'importante', texto:'Caprini alto: profilaxis mecánica + farmacológica extendida' });
  return recs;
}

function descargarTexto(texto, nombreArchivo) {
  const blob = new Blob([texto], { type:'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function descargarCSV(filas, nombreArchivo) {
  const csv = filas.map(r => r.map(v => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function copiarAlPortapapeles(texto) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(texto);
  } else {
    const ta = document.createElement('textarea');
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
  }
}

// -------- Helpers de UI comunes a todos los módulos --------

function headerHTML(numModulo, subtitulo, modoActivo) {
  const modos = [
    { id:'clinico',   icon:'activity',      l:'Clínico' },
    { id:'academico', icon:'graduation-cap', l:'Académico' },
    { id:'paciente',  icon:'heart',          l:'Paciente' }
  ];
  return `
  <div class="module-header">
    <div class="flex justify-between items-start flex-wrap gap-4 relative">
      <div class="flex items-start gap-4">
        <div class="brand-mark-lg"><i data-lucide="heart-pulse" class="w-6 h-6"></i></div>
        <div>
          <h1>Clínica de Obesidad y Metabólica</h1>
          <div class="byline">by <span style="color:${C.gold}; font-weight:600; font-style:normal; letter-spacing:1.5px;">AVANTE</span></div>
          <p class="tagline">Creamos e innovamos para cuidar de ti</p>
          <p class="modulo-label">Módulo ${numModulo} · ${escapeHtml(subtitulo)}</p>
        </div>
      </div>
      <div class="flex gap-2 flex-wrap">
        ${modos.map(m => `
          <button data-modo="${m.id}" class="modo-btn ${modoActivo===m.id?'active':''}">
            <i data-lucide="${m.icon}" class="w-3.5 h-3.5"></i> ${m.l}
          </button>
        `).join('')}
      </div>
    </div>
  </div>`;
}

function listaPacientesHTML(pacientes, mensajeVacio = 'No hay pacientes guardados.') {
  if (!pacientes || pacientes.length === 0) {
    return `<div class="p-8 text-center rounded" style="background:${C.cream};">
      <p class="text-gray-600">${mensajeVacio}</p>
    </div>`;
  }
  return `<div class="space-y-2">
    ${pacientes.map(p => `
      <button data-paciente-id="${p.id}" class="btn-paciente w-full p-3 border rounded text-left hover:shadow flex justify-between items-center bg-white">
        <div>
          <div class="font-bold" style="color:${C.navy};">${escapeHtml(p.nombre || 'Sin nombre')}</div>
          <div class="text-xs text-gray-600">${escapeHtml(p.edad)}a · ${escapeHtml(p.sexo)} · IMC ${imc(p).toFixed(1)} · ${escapeHtml(PROCS[p.procedimiento] || '')}</div>
        </div>
        <i data-lucide="chevron-right" class="w-5 h-5" style="color:${C.teal};"></i>
      </button>
    `).join('')}
  </div>`;
}

function refrescarIconos() {
  if (window.lucide && lucide.createIcons) lucide.createIcons();
}

// ---------- Médico tratante (global) ----------
const MEDICO_DEFAULT = {
  nombre: 'Dr. Ángel Henríquez',
  credencial: 'Cirujano digestivo, hepatobiliopancreático y bariátrico',
  registro: ''
};

function getMedico() {
  return storageGet('avante_medico') || MEDICO_DEFAULT;
}
function setMedico(m) { storageSet('avante_medico', m); }

function getMedicosLista() {
  const l = storageGet('avante_medicos_lista');
  if (l && Array.isArray(l) && l.length) return l;
  return [MEDICO_DEFAULT];
}
function setMedicosLista(l) { storageSet('avante_medicos_lista', l); }

function agregarMedicoALista(m) {
  if (!m || !m.nombre) return;
  const l = getMedicosLista();
  if (!l.find(x => x.nombre === m.nombre)) {
    l.push(m);
    setMedicosLista(l);
  }
}

// Selector reutilizable de médico (dropdown + opción "Otro")
function medicoSelectorHTML(idBase, valorActual) {
  const lista = getMedicosLista();
  const existe = valorActual && lista.find(x => x.nombre === valorActual);
  const esOtro = valorActual && !existe;
  return `
    <select id="${idBase}-select" class="input-base">
      <option value="">— Seleccione médico —</option>
      ${lista.map(x => `<option value="${escapeHtml(x.nombre)}" ${x.nombre===valorActual?'selected':''}>${escapeHtml(x.nombre)}</option>`).join('')}
      <option value="__otro__" ${esOtro?'selected':''}>+ Otro médico (escribir nombre)</option>
    </select>
    <input id="${idBase}-otro" class="input-base mt-2 ${esOtro?'':'hidden'}"
      placeholder="Nombre del médico" value="${esOtro ? escapeHtml(valorActual) : ''}">
  `;
}

function wireMedicoSelector(container, idBase, onChange) {
  const sel = container.querySelector('#' + idBase + '-select');
  const inp = container.querySelector('#' + idBase + '-otro');
  if (!sel) return;
  sel.addEventListener('change', () => {
    if (sel.value === '__otro__') {
      inp.classList.remove('hidden');
      inp.focus();
      onChange(inp.value || '');
    } else {
      inp.classList.add('hidden');
      onChange(sel.value);
    }
  });
  if (inp) inp.addEventListener('input', () => onChange(inp.value));
}

// ============================================================
// Internacionalización (i18n) · principalmente para Módulo 1
// ============================================================
const IDIOMAS_DISPONIBLES = [
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' }
];

const I18N = {
  es: {
    nuevaEvaluacion:'Nueva evaluación', pacientes:'Pacientes', buscarPaciente:'Buscar paciente por nombre, expediente o médico…',
    importarJSON:'Importar pacientes (JSON)', exportarCSV:'Exportar CSV',
    idioma:'Idioma', sinPacientes:'No hay pacientes guardados',
    pasos:['Demografía','Antropometría','Comorbilidades','Estado funcional','EOSS','Procedimiento','Historia clínica'],
    nombreCompleto:'Nombre completo', expediente:'Nº de expediente', expedientePlaceholder:'Auto-generado, editable',
    edad:'Edad', sexo:'Sexo', masculino:'Masculino', femenino:'Femenino',
    medicoIngresa:'Médico que ingresa al paciente', medicoAyuda:'Seleccione de la lista o elija "Otro" para escribirlo.',
    peso:'Peso (kg)', talla:'Talla (cm)', imcCalc:'IMC calculado',
    comorbilidades:'Comorbilidades', otrosAntecedentes:'Otros antecedentes personales',
    otrosAntecedentesPH:'Padecimientos o antecedentes específicos que no estén en la lista (cirugías previas, alergias, psiquiátricos, familiares, etc.)',
    asa:'ASA', estadoFuncional:'Estado funcional', independiente:'Independiente', dependenciaParcial:'Dependencia parcial', dependenciaTotal:'Dependencia total',
    dimMetabolico:'Metabólico', dimMecanico:'Mecánico', dimPsico:'Psicosocial',
    procedimientoPropuesto:'Procedimiento propuesto',
    historiaResumida:'Historia clínica resumida',
    historiaAyuda:'Antecedentes, evolución, hallazgos relevantes, medicación actual, observaciones. Se incluirá en el reporte PDF del paciente.',
    anterior:'Anterior', siguiente:'Siguiente', vistaPreviaPDF:'Vista previa PDF', guardarPaciente:'Guardar paciente',
    riesgoIntegrado:'Riesgo integrado', mortalidad:'Mortalidad', estadio:'Estadio',
    recomendacionesClinicas:'Recomendaciones clínicas',
    ingresoLbl:'Ingreso', exp:'Exp.',
    confirmarImportar:'¿Importar pacientes desde archivo JSON? Se añadirán a la lista actual.',
    importadoOk:(n) => `Se importaron ${n} paciente(s) correctamente.`, importadoError:'El archivo no contiene un arreglo de pacientes válido.'
  },
  en: {
    nuevaEvaluacion:'New assessment', pacientes:'Patients', buscarPaciente:'Search by name, record number or physician…',
    importarJSON:'Import patients (JSON)', exportarCSV:'Export CSV',
    idioma:'Language', sinPacientes:'No patients saved yet',
    pasos:['Demographics','Anthropometry','Comorbidities','Functional status','EOSS','Procedure','Clinical history'],
    nombreCompleto:'Full name', expediente:'Record number', expedientePlaceholder:'Auto-generated, editable',
    edad:'Age', sexo:'Sex', masculino:'Male', femenino:'Female',
    medicoIngresa:'Admitting physician', medicoAyuda:'Pick from the list or choose "Other" to type it.',
    peso:'Weight (kg)', talla:'Height (cm)', imcCalc:'Calculated BMI',
    comorbilidades:'Comorbidities', otrosAntecedentes:'Other personal history',
    otrosAntecedentesPH:'Specific conditions or history not listed (prior surgery, allergies, psychiatric, family history, etc.)',
    asa:'ASA', estadoFuncional:'Functional status', independiente:'Independent', dependenciaParcial:'Partial dependence', dependenciaTotal:'Full dependence',
    dimMetabolico:'Metabolic', dimMecanico:'Mechanical', dimPsico:'Psychosocial',
    procedimientoPropuesto:'Proposed procedure',
    historiaResumida:'Clinical history (summary)',
    historiaAyuda:'Background, evolution, relevant findings, current medication, observations. Will be embedded in the patient PDF report.',
    anterior:'Previous', siguiente:'Next', vistaPreviaPDF:'PDF preview', guardarPaciente:'Save patient',
    riesgoIntegrado:'Integrated risk', mortalidad:'Mortality', estadio:'Stage',
    recomendacionesClinicas:'Clinical recommendations',
    ingresoLbl:'Admitted by', exp:'Rec.',
    confirmarImportar:'Import patients from JSON file? They will be appended to the current list.',
    importadoOk:(n) => `Successfully imported ${n} patient(s).`, importadoError:'File does not contain a valid patient array.'
  },
  pt: {
    nuevaEvaluacion:'Nova avaliação', pacientes:'Pacientes', buscarPaciente:'Buscar por nome, prontuário ou médico…',
    importarJSON:'Importar pacientes (JSON)', exportarCSV:'Exportar CSV',
    idioma:'Idioma', sinPacientes:'Nenhum paciente salvo',
    pasos:['Demografia','Antropometria','Comorbidades','Estado funcional','EOSS','Procedimento','História clínica'],
    nombreCompleto:'Nome completo', expediente:'Nº de prontuário', expedientePlaceholder:'Auto-gerado, editável',
    edad:'Idade', sexo:'Sexo', masculino:'Masculino', femenino:'Feminino',
    medicoIngresa:'Médico que admite o paciente', medicoAyuda:'Escolha da lista ou "Outro" para digitar.',
    peso:'Peso (kg)', talla:'Altura (cm)', imcCalc:'IMC calculado',
    comorbilidades:'Comorbidades', otrosAntecedentes:'Outros antecedentes pessoais',
    otrosAntecedentesPH:'Condições ou antecedentes específicos não listados (cirurgias prévias, alergias, psiquiátricos, familiares, etc.)',
    asa:'ASA', estadoFuncional:'Estado funcional', independiente:'Independente', dependenciaParcial:'Dependência parcial', dependenciaTotal:'Dependência total',
    dimMetabolico:'Metabólico', dimMecanico:'Mecânico', dimPsico:'Psicossocial',
    procedimientoPropuesto:'Procedimento proposto',
    historiaResumida:'História clínica resumida',
    historiaAyuda:'Antecedentes, evolução, achados relevantes, medicação atual, observações. Será incluído no PDF do paciente.',
    anterior:'Anterior', siguiente:'Próximo', vistaPreviaPDF:'Prévia em PDF', guardarPaciente:'Salvar paciente',
    riesgoIntegrado:'Risco integrado', mortalidad:'Mortalidade', estadio:'Estágio',
    recomendacionesClinicas:'Recomendações clínicas',
    ingresoLbl:'Admissão', exp:'Pront.',
    confirmarImportar:'Importar pacientes do arquivo JSON? Serão adicionados à lista atual.',
    importadoOk:(n) => `${n} paciente(s) importado(s) com sucesso.`, importadoError:'O arquivo não contém uma lista válida de pacientes.'
  },
  fr: {
    nuevaEvaluacion:'Nouvelle évaluation', pacientes:'Patients', buscarPaciente:'Rechercher par nom, dossier ou médecin…',
    importarJSON:'Importer patients (JSON)', exportarCSV:'Exporter CSV',
    idioma:'Langue', sinPacientes:'Aucun patient enregistré',
    pasos:['Démographie','Anthropométrie','Comorbidités','Statut fonctionnel','EOSS','Procédure','Histoire clinique'],
    nombreCompleto:'Nom complet', expediente:'N° de dossier', expedientePlaceholder:'Auto-généré, modifiable',
    edad:'Âge', sexo:'Sexe', masculino:'Masculin', femenino:'Féminin',
    medicoIngresa:'Médecin admetteur', medicoAyuda:'Choisissez dans la liste ou "Autre" pour saisir.',
    peso:'Poids (kg)', talla:'Taille (cm)', imcCalc:'IMC calculé',
    comorbilidades:'Comorbidités', otrosAntecedentes:'Autres antécédents personnels',
    otrosAntecedentesPH:'Pathologies ou antécédents spécifiques non listés (chirurgies antérieures, allergies, psychiatriques, familiaux, etc.)',
    asa:'ASA', estadoFuncional:'Statut fonctionnel', independiente:'Autonome', dependenciaParcial:'Dépendance partielle', dependenciaTotal:'Dépendance totale',
    dimMetabolico:'Métabolique', dimMecanico:'Mécanique', dimPsico:'Psychosocial',
    procedimientoPropuesto:'Procédure proposée',
    historiaResumida:'Histoire clinique résumée',
    historiaAyuda:'Antécédents, évolution, constatations, médication actuelle, observations. Sera intégré au PDF du patient.',
    anterior:'Précédent', siguiente:'Suivant', vistaPreviaPDF:'Aperçu PDF', guardarPaciente:'Enregistrer patient',
    riesgoIntegrado:'Risque intégré', mortalidad:'Mortalité', estadio:'Stade',
    recomendacionesClinicas:'Recommandations cliniques',
    ingresoLbl:'Admission', exp:'Doss.',
    confirmarImportar:'Importer les patients du fichier JSON ? Ils seront ajoutés à la liste actuelle.',
    importadoOk:(n) => `${n} patient(s) importé(s) avec succès.`, importadoError:'Le fichier ne contient pas de tableau de patients valide.'
  },
  it: {
    nuevaEvaluacion:'Nuova valutazione', pacientes:'Pazienti', buscarPaciente:'Cerca per nome, cartella o medico…',
    importarJSON:'Importa pazienti (JSON)', exportarCSV:'Esporta CSV',
    idioma:'Lingua', sinPacientes:'Nessun paziente salvato',
    pasos:['Demografia','Antropometria','Comorbidità','Stato funzionale','EOSS','Procedura','Storia clinica'],
    nombreCompleto:'Nome completo', expediente:'N° cartella', expedientePlaceholder:'Auto-generato, modificabile',
    edad:'Età', sexo:'Sesso', masculino:'Maschio', femenino:'Femmina',
    medicoIngresa:'Medico accettante', medicoAyuda:'Seleziona dall\'elenco o "Altro" per digitare.',
    peso:'Peso (kg)', talla:'Altezza (cm)', imcCalc:'BMI calcolato',
    comorbilidades:'Comorbidità', otrosAntecedentes:'Altri antecedenti personali',
    otrosAntecedentesPH:'Condizioni o antecedenti non elencati (interventi precedenti, allergie, psichiatrici, familiari, ecc.)',
    asa:'ASA', estadoFuncional:'Stato funzionale', independiente:'Indipendente', dependenciaParcial:'Parzialmente dipendente', dependenciaTotal:'Totalmente dipendente',
    dimMetabolico:'Metabolico', dimMecanico:'Meccanico', dimPsico:'Psicosociale',
    procedimientoPropuesto:'Procedura proposta',
    historiaResumida:'Storia clinica sintetica',
    historiaAyuda:'Antecedenti, evoluzione, reperti, terapia attuale, osservazioni. Incluso nel PDF del paziente.',
    anterior:'Precedente', siguiente:'Successivo', vistaPreviaPDF:'Anteprima PDF', guardarPaciente:'Salva paziente',
    riesgoIntegrado:'Rischio integrato', mortalidad:'Mortalità', estadio:'Stadio',
    recomendacionesClinicas:'Raccomandazioni cliniche',
    ingresoLbl:'Ammissione', exp:'Cart.',
    confirmarImportar:'Importare pazienti dal file JSON? Verranno aggiunti all\'elenco attuale.',
    importadoOk:(n) => `${n} paziente/i importato/i correttamente.`, importadoError:'Il file non contiene un elenco valido di pazienti.'
  },
  de: {
    nuevaEvaluacion:'Neue Beurteilung', pacientes:'Patienten', buscarPaciente:'Suche nach Name, Akte oder Arzt…',
    importarJSON:'Patienten importieren (JSON)', exportarCSV:'CSV exportieren',
    idioma:'Sprache', sinPacientes:'Keine Patienten gespeichert',
    pasos:['Demografie','Anthropometrie','Komorbiditäten','Funktioneller Status','EOSS','Eingriff','Klinische Anamnese'],
    nombreCompleto:'Vollständiger Name', expediente:'Aktennummer', expedientePlaceholder:'Automatisch, bearbeitbar',
    edad:'Alter', sexo:'Geschlecht', masculino:'Männlich', femenino:'Weiblich',
    medicoIngresa:'Aufnehmender Arzt', medicoAyuda:'Aus der Liste wählen oder "Andere" eingeben.',
    peso:'Gewicht (kg)', talla:'Größe (cm)', imcCalc:'Berechneter BMI',
    comorbilidades:'Komorbiditäten', otrosAntecedentes:'Weitere persönliche Vorgeschichte',
    otrosAntecedentesPH:'Spezifische Zustände oder Vorgeschichte, die nicht aufgeführt sind (frühere OPs, Allergien, psychiatrische, familiäre usw.)',
    asa:'ASA', estadoFuncional:'Funktioneller Status', independiente:'Selbstständig', dependenciaParcial:'Teilweise abhängig', dependenciaTotal:'Vollständig abhängig',
    dimMetabolico:'Metabolisch', dimMecanico:'Mechanisch', dimPsico:'Psychosozial',
    procedimientoPropuesto:'Vorgeschlagener Eingriff',
    historiaResumida:'Klinische Anamnese (Zusammenfassung)',
    historiaAyuda:'Vorgeschichte, Verlauf, relevante Befunde, aktuelle Medikation, Bemerkungen. Wird in den PDF-Bericht aufgenommen.',
    anterior:'Zurück', siguiente:'Weiter', vistaPreviaPDF:'PDF-Vorschau', guardarPaciente:'Patient speichern',
    riesgoIntegrado:'Integriertes Risiko', mortalidad:'Mortalität', estadio:'Stadium',
    recomendacionesClinicas:'Klinische Empfehlungen',
    ingresoLbl:'Aufnahme', exp:'Akte',
    confirmarImportar:'Patienten aus JSON-Datei importieren? Sie werden der aktuellen Liste hinzugefügt.',
    importadoOk:(n) => `${n} Patient(en) erfolgreich importiert.`, importadoError:'Die Datei enthält kein gültiges Patienten-Array.'
  }
};

function getIdioma() {
  return storageGet('avante_idioma') || 'es';
}
function setIdioma(code) {
  storageSet('avante_idioma', code);
}
function t(key) {
  const dict = I18N[getIdioma()] || I18N.es;
  return dict[key] !== undefined ? dict[key] : (I18N.es[key] !== undefined ? I18N.es[key] : key);
}

// ---------- Exportación PDF ----------
function descargarPDF({ titulo, subtitulo, paciente, secciones, nombreArchivo, firmaPaciente = true }) {
  if (!(window.jspdf && window.jspdf.jsPDF)) {
    alert('jsPDF no se pudo cargar. Verifique su conexión a internet.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const medico = getMedico();
  const pageW = 210, pageH = 297, mL = 15, mR = 15, maxW = pageW - mL - mR;

  // Encabezado institucional
  doc.setFillColor(10, 31, 68);
  doc.rect(0, 0, pageW, 30, 'F');
  // detalle dorado
  doc.setFillColor(201, 169, 97);
  doc.rect(0, 30, pageW, 1.2, 'F');
  doc.setDrawColor(201, 169, 97);
  doc.setLineWidth(0.8);
  doc.circle(pageW - 18, 15, 7, 'S');

  doc.setTextColor(201, 169, 97);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Clínica de Obesidad y Metabólica', mL, 13);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('by AVANTE  ·  Creamos e innovamos para cuidar de ti', mL, 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Tel. ' + AVANTE_TEL + '  ·  Línea 24/7', mL, 25);

  let y = 38;
  doc.setTextColor(10, 31, 68);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(titulo || 'Documento clínico', mL, y);
  y += 5;
  if (subtitulo) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitulo, mL, y);
    y += 5;
  }
  y += 3;

  // Bloque de paciente
  if (paciente) {
    doc.setFillColor(250, 247, 242);
    doc.rect(mL, y, maxW, 22, 'F');
    doc.setTextColor(10, 31, 68);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Paciente: ' + (paciente.nombre || '—'), mL + 3, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const imcV = imc(paciente);
    const linea1 = `Edad: ${paciente.edad || '—'}   Sexo: ${paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : '—'}   IMC: ${imcV ? imcV.toFixed(1) : '—'} kg/m²`;
    const linea2 = `Expediente: ${paciente.expediente || '—'}   Procedimiento: ${PROCS[paciente.procedimiento] || '—'}`;
    doc.text(linea1, mL + 3, y + 12);
    doc.text(linea2, mL + 3, y + 17);
    y += 28;
  }

  // Secciones
  const saltoSiHaceFalta = (alto) => {
    if (y + alto > pageH - 45) { doc.addPage(); y = 20; }
  };
  (secciones || []).forEach(sec => {
    saltoSiHaceFalta(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 31, 68);
    doc.setFontSize(11);
    doc.text(sec.titulo || '', mL, y);
    y += 2;
    doc.setDrawColor(201, 169, 97);
    doc.setLineWidth(0.5);
    doc.line(mL, y, mL + maxW, y);
    y += 4;

    if (sec.texto) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      const texto = String(sec.texto);
      const lineas = doc.splitTextToSize(texto, maxW);
      lineas.forEach(l => {
        saltoSiHaceFalta(5);
        doc.text(l, mL, y);
        y += 4.5;
      });
      y += 2;
    }

    // Imagen (base64) — útil para gráficas de Chart.js
    if (sec.imagen) {
      const imgAlto = sec.imagenAlto || 70;
      const imgAncho = sec.imagenAncho || maxW;
      saltoSiHaceFalta(imgAlto + 4);
      try {
        doc.addImage(sec.imagen, 'PNG', mL, y, imgAncho, imgAlto);
      } catch (e) {}
      y += imgAlto + 4;
    }

    // Grid de métricas (KPIs en cajitas)
    if (sec.metricas && sec.metricas.length) {
      const cols = 3;
      const cellW = maxW / cols;
      const cellH = 14;
      const filas = Math.ceil(sec.metricas.length / cols);
      saltoSiHaceFalta(filas * cellH + 4);
      sec.metricas.forEach((met, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = mL + col * cellW;
        const yy = y + row * cellH;
        doc.setFillColor(250, 247, 242);
        doc.rect(x + 1, yy, cellW - 2, cellH - 2, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(met.label || '', x + 3, yy + 4);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(10, 31, 68);
        doc.text(String(met.valor || '—'), x + 3, yy + 10);
      });
      y += filas * cellH + 2;
    }

    y += 4;
  });

  // Bloque de firmas (al pie)
  if (y > pageH - 45) { doc.addPage(); y = 20; }
  const yFirma = Math.max(y + 8, pageH - 40);
  doc.setDrawColor(10, 31, 68);
  doc.setLineWidth(0.4);
  doc.line(mL, yFirma, mL + 85, yFirma);
  if (firmaPaciente) doc.line(pageW - mR - 85, yFirma, pageW - mR, yFirma);

  doc.setTextColor(10, 31, 68);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(medico.nombre || 'Firma del médico', mL, yFirma + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (medico.credencial) {
    const credLines = doc.splitTextToSize(medico.credencial, 85);
    credLines.forEach((l, i) => doc.text(l, mL, yFirma + 9 + i * 4));
  }
  if (medico.registro) doc.text('JVPM / Reg.: ' + medico.registro, mL, yFirma + 17);

  if (firmaPaciente) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Firma del paciente', pageW - mR - 85, yFirma + 5);
  }
  const fecha = new Date().toLocaleDateString('es-SV');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Fecha: ' + fecha, pageW - mR - 85, yFirma + 10);

  // Pie de página con paginación
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(201, 169, 97);
    doc.setLineWidth(0.3);
    doc.line(mL, pageH - 12, pageW - mR, pageH - 12);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`Clínica de Obesidad y Metabólica · by AVANTE  ·  ${AVANTE_TEL}  ·  Página ${i} de ${total}`, pageW / 2, pageH - 8, { align: 'center' });
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(150, 150, 150);
    doc.text('Idea original y desarrollo conceptual: Dr. Ángel Henríquez', pageW / 2, pageH - 4, { align: 'center' });
  }

  const nombre = nombreArchivo || (titulo || 'documento').replace(/\s+/g, '_') + '.pdf';
  doc.save(nombre);
}
