import { tt } from '../i18n/motor'
export const CENTRO_COLONIA = [-34.4715, -57.852]
export const LIMITES_COLONIA = [[-34.6, -58.05], [-34.3, -57.6]]
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/'
const ESRI_ATRIBUCION = 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, OpenStreetMap contributors'

export function capaBase() {
  return window.L.tileLayer(ESRI + 'World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxNativeZoom: 16, maxZoom: 18, attribution: ESRI_ATRIBUCION,
  })
}

export function capaCalles() {
  return window.L.tileLayer(ESRI + 'World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    maxNativeZoom: 16, maxZoom: 18, pane: 'shadowPane',
  })
}

const SIN_IMAGEN = 'IMAGEN_MUSEO'
export const tieneImagen = (museo) => Boolean(museo.imagen) && museo.imagen !== SIN_IMAGEN

export function fechaLocal(fecha) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha || '')
  return partes ? new Date(+partes[1], +partes[2] - 1, +partes[3]) : null
}

export function porFecha(primero, segundo) {
  return (primero.fecha || '9999').localeCompare(segundo.fecha || '9999') || (primero.hora || '').localeCompare(segundo.hora || '')
}

export const ACTIVIDADES = {
  museo: { get nombre() { return tt('tipo.museo') }, get plural() { return tt('tipo.museo.p') }, icono: 'fa-landmark', url: (id) => `/museos/${encodeURIComponent(id)}` },
  charla: { get nombre() { return tt('tipo.charla') }, get plural() { return tt('tipo.charla.p') }, icono: 'fa-microphone-lines', url: (id) => `/charlas/${encodeURIComponent(id)}` },
  taller: { get nombre() { return tt('tipo.taller') }, get plural() { return tt('tipo.taller.p') }, icono: 'fa-palette', url: (id) => `/cursos/${encodeURIComponent(id)}` },
  recorrido: { get nombre() { return tt('tipo.recorrido') }, get plural() { return tt('tipo.recorrido.p') }, icono: 'fa-person-walking', url: (id) => `/recorridos/${encodeURIComponent(id)}` },
}
