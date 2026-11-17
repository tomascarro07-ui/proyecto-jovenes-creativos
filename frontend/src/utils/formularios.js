export function conActual(opciones, actual) {
  if (!actual || opciones.some(([valor]) => valor === actual)) return opciones
  return [[actual, actual], ...opciones]
}
