import { tt } from '../i18n/motor'
// Ayudas para los mapas de Leaflet (la librería se carga por CDN en index.html y queda en window.L).
// Antes estaban en scripts/mapa/selectorUbicacion.js.
export const CENTRO_COLONIA = [-34.4715, -57.852]
export const LIMITES_COLONIA = [[-34.6, -58.05], [-34.3, -57.6]]
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/'
const ESRI_ATRIBUCION = 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, OpenStreetMap contributors'

// Mapa base gris, sin comercios ni puntos de interés
export function capaBase() {
  return window.L.tileLayer(ESRI + 'World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxNativeZoom: 16, maxZoom: 18, attribution: ESRI_ATRIBUCION,
  })
}

// Nombres de calles (se superpone al mapa base)
export function capaCalles() {
  return window.L.tileLayer(ESRI + 'World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    maxNativeZoom: 16, maxZoom: 18, pane: 'shadowPane',
  })
}

// Un museo sin foto guarda este texto en lugar de una imagen
export const SIN_IMAGEN = 'IMAGEN_MUSEO'
export const tieneImagen = (museo) => !!museo.imagen && museo.imagen !== SIN_IMAGEN

// "2026-12-05" -> Date local (o null si no tiene ese formato)
export function fechaLocal(f) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f || '')
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null
}

export function porFecha(a, b) {
  return (a.fecha || '9999').localeCompare(b.fecha || '9999') || (a.hora || '').localeCompare(b.hora || '')
}

// Datos de cada tipo de actividad: nombre, icono y dirección de su página de detalle
export const ACTIVIDADES = {
  museo: { get nombre() { return tt('tipo.museo') }, get plural() { return tt('tipo.museo.p') }, icono: 'fa-landmark', url: (id) => `/museos/${encodeURIComponent(id)}` },
  charla: { get nombre() { return tt('tipo.charla') }, get plural() { return tt('tipo.charla.p') }, icono: 'fa-microphone-lines', url: (id) => `/charlas/${encodeURIComponent(id)}` },
  taller: { get nombre() { return tt('tipo.taller') }, get plural() { return tt('tipo.taller.p') }, icono: 'fa-palette', url: (id) => `/cursos/${encodeURIComponent(id)}` },
  recorrido: { get nombre() { return tt('tipo.recorrido') }, get plural() { return tt('tipo.recorrido.p') }, icono: 'fa-person-walking', url: (id) => `/recorridos/${encodeURIComponent(id)}` },
}
