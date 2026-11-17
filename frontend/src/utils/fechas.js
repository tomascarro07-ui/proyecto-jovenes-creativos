import { tt } from '../i18n/motor'

export function separarFecha(fecha) {
  if (!fecha) return { dia: '', mes: '' }
  const partes = fecha.split('-')
  const dia = Number(partes[2])
  const numeroMes = Number(partes[1])
  if (!dia || numeroMes < 1 || numeroMes > 12) return { dia: '', mes: '' }
  return { dia, mes: tt('fecha.mesesCortos')[numeroMes - 1] }
}

export function formatearFechaLarga(fecha) {
  const partes = fecha.split('-')
  return tt('fecha.larga', { dia: Number(partes[2]), mes: tt('fecha.meses')[Number(partes[1]) - 1] })
}

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
