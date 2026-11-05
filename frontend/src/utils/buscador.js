// Ayudas del buscador (antes estaban en scripts/buscar.js)

// Quita tildes y pasa a minúsculas para comparar sin importar acentos ni mayúsculas
export function normalizar(texto) {
  return String(texto == null ? '' : texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

// Parte un texto en trozos { texto, marcado } para resaltar las palabras buscadas (ignora tildes y mayúsculas).
// Se devuelve una lista de trozos y no HTML, así React escapa el contenido solo.
export function trozosResaltados(texto, tokens) {
  texto = String(texto == null ? '' : texto)
  if (!tokens.length) return [{ texto, marcado: false }]
  let norm = ''
  const mapa = [] // posición en el texto normalizado -> posición en el original
  for (let i = 0; i < texto.length; i++) {
    const pieza = normalizar(texto[i])
    for (let k = 0; k < pieza.length; k++) {
      norm += pieza[k]
      mapa.push(i)
    }
  }
  const rangos = []
  for (const token of tokens) {
    let desde = 0
    let pos
    while (token && (pos = norm.indexOf(token, desde)) !== -1) {
      rangos.push([mapa[pos], mapa[pos + token.length - 1] + 1])
      desde = pos + token.length
    }
  }
  if (!rangos.length) return [{ texto, marcado: false }]
  rangos.sort((a, b) => a[0] - b[0])
  const unidos = [rangos[0].slice()]
  for (const r of rangos.slice(1)) {
    const ultimo = unidos[unidos.length - 1]
    if (r[0] <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], r[1])
    else unidos.push(r.slice())
  }
  const trozos = []
  let cursor = 0
  for (const [a, b] of unidos) {
    if (a > cursor) trozos.push({ texto: texto.slice(cursor, a), marcado: false })
    trozos.push({ texto: texto.slice(a, b), marcado: true })
    cursor = b
  }
  if (cursor < texto.length) trozos.push({ texto: texto.slice(cursor), marcado: false })
  return trozos
}

// "2026-12-05" -> "05/12/2026"
export function fechaCorta(f) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f || '')
  return m ? m[3] + '/' + m[2] + '/' + m[1] : ''
}

export function recortar(texto, max) {
  texto = String(texto || '')
  return texto.length > max ? texto.slice(0, max).trim() + '…' : texto
}

// Solo se aceptan rutas locales o https para imagen y enlaces (evita javascript: y similares).
export function urlSegura(u) {
  u = String(u || '')
  return /^(https:\/\/[^\s"'<>]+|[\w\-./?=&%]+)$/.test(u) && !u.startsWith('//') ? u : ''
}
