export function normalizar(texto) {
  return String(texto == null ? '' : texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function trozosResaltados(texto, tokens) {
  texto = String(texto == null ? '' : texto)
  if (!tokens.length) return [{ texto, marcado: false }]
  let norm = ''
  const mapa = []
  for (let posicionOriginal = 0; posicionOriginal < texto.length; posicionOriginal++) {
    const pieza = normalizar(texto[posicionOriginal])
    for (let posicionLetra = 0; posicionLetra < pieza.length; posicionLetra++) {
      norm += pieza[posicionLetra]
      mapa.push(posicionOriginal)
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
  rangos.sort((primero, segundo) => primero[0] - segundo[0])
  const unidos = [rangos[0].slice()]
  for (const rango of rangos.slice(1)) {
    const ultimo = unidos[unidos.length - 1]
    if (rango[0] <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], rango[1])
    else unidos.push(rango.slice())
  }
  const trozos = []
  let cursor = 0
  for (const [inicio, fin] of unidos) {
    if (inicio > cursor) trozos.push({ texto: texto.slice(cursor, inicio), marcado: false })
    trozos.push({ texto: texto.slice(inicio, fin), marcado: true })
    cursor = fin
  }
  if (cursor < texto.length) trozos.push({ texto: texto.slice(cursor), marcado: false })
  return trozos
}

export function fechaCorta(fecha) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha || '')
  return partes ? partes[3] + '/' + partes[2] + '/' + partes[1] : ''
}

export function recortar(texto, max) {
  texto = String(texto || '')
  return texto.length > max ? texto.slice(0, max).trim() + '…' : texto
}

export function urlSegura(url) {
  url = String(url || '')
  return /^(https:\/\/[^\s"'<>]+|[\w\-./?=&%]+)$/.test(url) && !url.startsWith('//') ? url : ''
}
