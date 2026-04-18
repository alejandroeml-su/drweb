// ============================================================
// Avante · Shell principal (navegación entre módulos)
// ============================================================

const MODULOS = [
  { id:0, icon:'home',           titulo:'Inicio',                      sub:'Sociedades · Revistas · Evidencia',       obj: () => AvanteModuloHome },
  { id:1, icon:'stethoscope',    titulo:'Estratificación de Riesgo',  sub:'OS-MRS · EOSS · Caprini',                obj: () => AvanteModulo1 },
  { id:2, icon:'clipboard-list', titulo:'Optimización & Selección',    sub:'Preop · Procedimiento · Profilaxis',     obj: () => AvanteModulo2 },
  { id:3, icon:'activity',       titulo:'Seguimiento Postoperatorio',  sub:'Temprano · Tardío · Nutrición',          obj: () => AvanteModulo3 },
  { id:4, icon:'pill',           titulo:'Manejo No Quirúrgico',        sub:'GLP-1 · ESG · Revisión · Conductual',    obj: () => AvanteModulo4 },
  { id:5, icon:'scissors',       titulo:'Plástica & Calidad',          sub:'Poblaciones · KPIs · Documentación',     obj: () => AvanteModulo5 },
  { id:6, icon:'book-open',      titulo:'Educación & Emergencias',     sub:'Consentimiento · Costos · Códigos',      obj: () => AvanteModulo6 },
  { id:7, icon:'layout-dashboard', titulo:'Dashboard Ejecutivo',        sub:'Telemedicina · Avante Care · Equipo',   obj: () => AvanteModulo7 },
  { id:8, icon:'folder-open',    titulo:'Biblioteca & Análisis',      sub:'Documentos · Resumen por paciente',      obj: () => AvanteModulo8 }
];

let moduloActivo = 0;

window.setModuloActivo = function(id) {
  moduloActivo = parseInt(id);
  const sb = document.getElementById('sidebar');
  if (sb) sb.classList.remove('open');
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function renderSidebar() {
  const nav = document.getElementById('nav-modulos');
  nav.innerHTML = MODULOS.map(m => {
    const sel = m.id === moduloActivo;
    return `<button data-modulo="${m.id}" class="w-full text-left p-3 rounded flex items-start gap-3 transition-colors"
      style="background:${sel ? C.teal : 'transparent'}; color:white;">
      <i data-lucide="${m.icon}" class="w-4 h-4 flex-shrink-0 mt-0.5" style="color:${sel ? 'white' : C.gold};"></i>
      <div class="flex-1 min-w-0">
        <div class="text-xs font-bold opacity-80">${m.id === 0 ? 'INICIO' : 'MÓDULO ' + m.id}</div>
        <div class="text-sm font-bold truncate">${m.titulo}</div>
        <div class="text-xs opacity-70 truncate">${m.sub}</div>
      </div>
    </button>`;
  }).join('');

  nav.querySelectorAll('[data-modulo]').forEach(b => {
    b.addEventListener('click', () => {
      moduloActivo = parseInt(b.dataset.modulo);
      document.getElementById('sidebar').classList.remove('open');
      renderApp();
    });
  });
  refrescarIconos();
}

let medicoEditorEditing = false;

function renderMedicoEditor() {
  const box = document.getElementById('medico-editor');
  if (!box) return;
  const m = getMedico();
  const lista = getMedicosLista();
  const stl = 'background:rgba(255,255,255,0.08); color:white; border:1px solid rgba(255,255,255,0.18);';

  box.innerHTML = `
    <div class="text-xs font-bold mb-2 flex items-center gap-1" style="color:${C.gold};">
      <i data-lucide="user-cog" class="w-3.5 h-3.5"></i> Médico activo
    </div>
    <select id="med-lista" class="w-full text-xs px-2 py-1 rounded mb-2 outline-none" style="${stl}">
      ${lista.map(x => `<option value="${escapeHtml(x.nombre)}" ${x.nombre===m.nombre?'selected':''}>${escapeHtml(x.nombre)}</option>`).join('')}
    </select>
    <div class="flex gap-1 mb-2">
      <button id="med-edit-toggle" class="flex-1 text-[10px] px-2 py-1 rounded" style="${stl}">
        ${medicoEditorEditing ? '× Cerrar' : '+ Añadir / editar'}
      </button>
      ${lista.length > 1 ? `<button id="med-del" class="text-[10px] px-2 py-1 rounded" style="${stl} color:#fca5a5;">🗑</button>` : ''}
    </div>
    <div id="med-fields" class="${medicoEditorEditing ? '' : 'hidden'}">
      <input id="med-nombre" class="w-full text-xs px-2 py-1 rounded mb-1 outline-none" style="${stl}"
        value="${escapeHtml(m.nombre)}" placeholder="Nombre completo">
      <input id="med-cred" class="w-full text-xs px-2 py-1 rounded mb-1 outline-none" style="${stl}"
        value="${escapeHtml(m.credencial)}" placeholder="Especialidad / credencial">
      <input id="med-reg" class="w-full text-xs px-2 py-1 rounded mb-1 outline-none" style="${stl}"
        value="${escapeHtml(m.registro)}" placeholder="JVPM / Registro">
      <button id="med-save" class="w-full text-[11px] font-bold px-2 py-1 rounded mt-1" style="background:${C.gold}; color:${C.navy};">Guardar en lista</button>
    </div>
    <div class="text-[10px] text-white/60 mt-2 leading-tight">
      <div><strong style="color:${C.gold};">${escapeHtml(m.credencial || '')}</strong></div>
      ${m.registro ? `<div>JVPM: ${escapeHtml(m.registro)}</div>` : ''}
    </div>
  `;

  const sel = document.getElementById('med-lista');
  sel.addEventListener('change', () => {
    const encontrado = lista.find(x => x.nombre === sel.value);
    if (encontrado) {
      setMedico(encontrado);
      medicoEditorEditing = false;
      renderMedicoEditor();
    }
  });

  document.getElementById('med-edit-toggle').addEventListener('click', () => {
    medicoEditorEditing = !medicoEditorEditing;
    renderMedicoEditor();
  });

  const delBtn = document.getElementById('med-del');
  if (delBtn) delBtn.addEventListener('click', () => {
    if (lista.length <= 1) return;
    if (!confirm('¿Eliminar este médico de la lista?')) return;
    const nueva = lista.filter(x => x.nombre !== m.nombre);
    setMedicosLista(nueva);
    setMedico(nueva[0]);
    renderMedicoEditor();
  });

  if (medicoEditorEditing) {
    const save = document.getElementById('med-save');
    save.addEventListener('click', () => {
      const nuevo = {
        nombre:    document.getElementById('med-nombre').value.trim(),
        credencial:document.getElementById('med-cred').value.trim(),
        registro:  document.getElementById('med-reg').value.trim()
      };
      if (!nuevo.nombre) { alert('Ingrese el nombre del médico'); return; }
      const nueva = getMedicosLista().filter(x => x.nombre !== nuevo.nombre);
      nueva.push(nuevo);
      setMedicosLista(nueva);
      setMedico(nuevo);
      medicoEditorEditing = false;
      renderMedicoEditor();
    });
  }

  refrescarIconos();
}

function renderApp() {
  renderSidebar();
  renderMedicoEditor();
  const main = document.getElementById('main-content');
  const mod = MODULOS.find(m => m.id === moduloActivo).obj();
  mod.render(main);
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-menu');
  if (btn) {
    btn.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }
  renderApp();
});
