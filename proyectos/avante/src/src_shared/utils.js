// Utilidades compartidas: PDF, WhatsApp, email, subida de archivos, storage
import jsPDF from 'jspdf';

// --- WhatsApp / Email / PDF share ---

export function shareWhatsApp(phone, message) {
  const clean = (phone || '').replace(/[^\d]/g, '');
  const url = clean
    ? `https://wa.me/${clean}?text=${encodeURIComponent(message || '')}`
    : `https://wa.me/?text=${encodeURIComponent(message || '')}`;
  window.open(url, '_blank', 'noopener');
}

export function shareEmail(to, subject, body) {
  const url = `mailto:${to || ''}?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body || '')}`;
  window.location.href = url;
}

/**
 * Genera un PDF multi-línea a partir de un objeto { titulo, subtitulo, secciones: [{titulo, lineas}] }
 */
export function exportarPDF({ titulo, subtitulo, secciones = [], footer }) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const M = 50;
  let y = M;
  const W = doc.internal.pageSize.getWidth() - M * 2;

  doc.setFillColor(10, 31, 68);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 70, 'F');
  doc.setTextColor(201, 169, 97);
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.text(titulo || 'Avante Complejo Hospitalario', M, 40);
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.text(subtitulo || 'Creamos e innovamos para cuidar de ti', M, 58);

  y = 100;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  const checkPage = (h = 16) => {
    if (y + h > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = M;
    }
  };

  secciones.forEach(sec => {
    checkPage(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(10, 31, 68);
    doc.text(sec.titulo || '', M, y);
    y += 8;
    doc.setDrawColor(201, 169, 97);
    doc.setLineWidth(1);
    doc.line(M, y, M + W, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    (sec.lineas || []).forEach(line => {
      const split = doc.splitTextToSize(String(line || ''), W);
      split.forEach(l => {
        checkPage(14);
        doc.text(l, M, y);
        y += 14;
      });
    });
    y += 8;
  });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.text(
      footer || 'Avante · Plataforma Perioperatoria Bariátrica',
      M,
      doc.internal.pageSize.getHeight() - 30
    );
    doc.text(`Página ${i} de ${total}`, doc.internal.pageSize.getWidth() - M - 80, doc.internal.pageSize.getHeight() - 30);
  }
  return doc;
}

export function descargarPDF(docPDF, nombre) {
  docPDF.save((nombre || 'avante') + '.pdf');
}

/** Devuelve un Blob PDF para enviar por email/WhatsApp (como link generado). */
export function pdfABlob(docPDF) { return docPDF.output('blob'); }

/** Enviar PDF por WhatsApp: descarga + abre WA. WhatsApp Web no acepta archivos vía URL,
 *  así que descargamos el PDF localmente y el usuario lo adjunta manualmente. */
export function enviarPDFWhatsApp(docPDF, nombre, telefono, mensaje) {
  descargarPDF(docPDF, nombre);
  setTimeout(() => shareWhatsApp(telefono, mensaje + '\n\n(Adjunte el PDF descargado: ' + nombre + '.pdf)'), 400);
}

/** Enviar PDF por email: descarga + abre mailto con asunto/cuerpo. */
export function enviarPDFEmail(docPDF, nombre, to, subject, body) {
  descargarPDF(docPDF, nombre);
  setTimeout(() => shareEmail(to, subject, (body || '') + '\n\n(Adjunte el PDF descargado: ' + nombre + '.pdf)'), 400);
}

// --- Uploads con validación y almacenamiento ---

/** Devuelve Data URL (base64) de un archivo; rechaza si supera `maxBytes`. */
export function leerArchivoDataURL(file, maxBytes = 8 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Archivo inválido'));
    if (file.size > maxBytes) return reject(new Error(`Archivo excede ${(maxBytes / 1024 / 1024).toFixed(1)} MB`));
    const r = new FileReader();
    r.onload = () => resolve({ dataUrl: r.result, name: file.name, type: file.type, size: file.size });
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

// --- Storage helpers (Supabase + localStorage fallback) ---

import { supabase } from '../lib/supabase';

export async function storageGet(key) {
  try {
    // 1. Intentar obtener de Supabase
    const { data, error } = await supabase
      .from('avante_store')
      .select('key_value')
      .eq('key_name', key)
      .single();

    if (!error && data) {
      // Guardar también en localStorage como backup/cache
      localStorage.setItem(key, JSON.stringify(data.key_value));
      return data.key_value;
    }
  } catch (err) {
    console.warn(`Supabase get error for ${key}:`, err);
  }

  // 2. Fallback a localStorage si Supabase falla o está vacío
  try {
    const v = localStorage.getItem(key);
    return v ? (() => { try { return JSON.parse(v); } catch { return v; } })() : null;
  } catch { 
    return null; 
  }
}

export async function storageSet(key, value) {
  // Primero guardamos en localStorage para que la UI responda rápido (Optimistic UI)
  const s = typeof value === 'string' ? value : JSON.stringify(value);
  try { localStorage.setItem(key, s); } catch {}

  // Luego sincronizamos con Supabase en background
  try {
    const jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
    const { error } = await supabase
      .from('avante_store')
      .upsert({ 
        key_name: key, 
        key_value: jsonValue,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key_name' });
      
    if (error) console.error(`Supabase sync error for ${key}:`, error);
  } catch (err) {
    console.warn(`Could not sync ${key} to Supabase:`, err);
  }
}

// --- Formato ---

export function fmtFechaHora(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function fmtFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
