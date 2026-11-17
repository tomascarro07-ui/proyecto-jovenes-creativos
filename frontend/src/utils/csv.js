function celda(valor) {
  let texto = ''
  if (valor !== null && valor !== undefined) texto = String(valor)
  if (/^[=+\-@\t\r]/.test(texto)) texto = "'" + texto
  return '"' + texto.replace(/"/g, '""') + '"'
}

export function descargarCSV(nombreArchivo, filas) {
  const contenido = '﻿' + filas.map((fila) => fila.map(celda).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }))
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

export function aNombreDeArchivo(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'actividad'
}
