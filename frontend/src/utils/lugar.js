import { avisarAdmin } from './avisos'

const LUGAR_VACIO = { sel: '', texto: '', lat: null, lng: null }

export function lugarValido(lugar, museos) {
  if (!lugar.sel) {
    avisarAdmin('Elegí el lugar de la actividad.', 'advertencia')
    return null
  }
  if (lugar.sel === 'otro') {
    const nombre = lugar.texto.trim()
    if (!nombre) {
      avisarAdmin('Escribí el nombre del lugar.', 'advertencia')
      return null
    }
    if (lugar.lat === null) {
      avisarAdmin('Marcá la ubicación del lugar en el mapa.', 'advertencia')
      return null
    }
    return { museo: null, lugar: nombre, lat: lugar.lat, lng: lugar.lng }
  }
  const museo = museos.find((candidato) => candidato.id === lugar.sel)
  return { museo: lugar.sel, lugar: museo ? museo.nombre : '', lat: null, lng: null }
}

export function leer(form, id) {
  return form.elements[id].value
}

export function lugarInicial(item) {
  if (!item) return LUGAR_VACIO
  const nombre = item.lugar || item.puntoSalida || ''
  if (item.museo) return { sel: String(item.museo), texto: '', lat: null, lng: null }
  if (item.lat != null && item.lng != null) return { sel: 'otro', texto: nombre, lat: item.lat, lng: item.lng }
  return { ...LUGAR_VACIO, texto: nombre }
}
