// Ayudas para el "Lugar" de las actividades en el panel de administración (antes: scripts/mapa/selectorLugar.js)

// Estado inicial del selector: nada elegido
export const LUGAR_VACIO = { sel: '', texto: '', lat: null, lng: null }

// Devuelve { museo, lugar, lat, lng } o null si falta algo (y avisa qué falta)
export function lugarValido(lugar, museos) {
  if (!lugar.sel) {
    alert('Elegí el lugar de la actividad.')
    return null
  }
  if (lugar.sel === 'otro') {
    const nombre = lugar.texto.trim()
    if (!nombre) {
      alert('Escribí el nombre del lugar.')
      return null
    }
    if (lugar.lat === null) {
      alert('Marcá la ubicación del lugar en el mapa.')
      return null
    }
    return { museo: null, lugar: nombre, lat: lugar.lat, lng: lugar.lng }
  }
  const museo = museos.find((m) => m.id === lugar.sel)
  return { museo: lugar.sel, lugar: museo ? museo.nombre : '', lat: null, lng: null }
}

// Lee un campo de un formulario por su id (los formularios del panel son "no controlados")
export function leer(form, id) {
  return form.elements[id].value
}
