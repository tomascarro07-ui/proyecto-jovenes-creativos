// Funciones de apoyo para mostrar fechas y duraciones (antes estaban en commonFunctions.js y recorridoData.js).
// Los nombres de los meses salen del diccionario del idioma elegido (es / en / pt).
import { tt } from '../i18n/motor'

// "2026-11-04" -> { dia: 4, mes: "NOV" }
export function separarFecha(fecha) {
  if (!fecha) return { dia: '', mes: '' }
  const partes = fecha.split('-')
  const dia = Number(partes[2])
  const numeroMes = Number(partes[1])
  if (!dia || numeroMes < 1 || numeroMes > 12) return { dia: '', mes: '' }
  return { dia, mes: tt('fecha.mesesCortos')[numeroMes - 1] }
}

// "2026-11-04" -> "4 de noviembre" (en inglés: "November 4")
export function formatearFechaLarga(fecha) {
  const partes = fecha.split('-')
  return tt('fecha.larga', { dia: Number(partes[2]), mes: tt('fecha.meses')[Number(partes[1]) - 1] })
}

// "2026-11-06" -> "Mañana · 6 de noviembre" (si es hoy o mañana); en otro caso, solo "6 de noviembre"
export function etiquetaFechaCercana(fecha) {
  if (!fecha) return ''
  const [anio, mes, dia] = fecha.split('-').map(Number)
  if (!anio || !mes || !dia) return ''
  const hoy = new Date()
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const dias = Math.round((new Date(anio, mes - 1, dia) - base) / 86400000)
  const larga = formatearFechaLarga(fecha)
  if (dias === 0) return `${tt('fecha.hoy')} · ${larga}`
  if (dias === 1) return `${tt('fecha.manana')} · ${larga}`
  return larga
}

// Recorrido con duracionHoras y duracionMinutos -> "1h 30min"
export function formatearDuracion(recorrido) {
  const horas = Number(recorrido.duracionHoras)
  const minutos = Number(recorrido.duracionMinutos)
  if (!isNaN(horas) && !isNaN(minutos)) {
    if (horas === 0) return `${minutos}min`
    if (minutos === 0) return `${horas}h`
    return `${horas}h ${minutos}min`
  }
  if (recorrido.duracion) return recorrido.duracion
  return tt('dur.noDisp')
}
