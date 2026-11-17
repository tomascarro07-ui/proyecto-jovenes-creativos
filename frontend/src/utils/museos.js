export function museoCerrado(museo) {
  return /cerrad|closed|fechad/i.test((museo && museo.horario) || '')
}

export function parrafos(texto) {
  return String(texto || '').split(/\n\s*\n/).map((parrafo) => parrafo.trim()).filter(Boolean)
}
