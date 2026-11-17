import es from './es'
import en from './en'
import pt from './pt'

export const IDIOMAS = { es: 'Español', en: 'English', pt: 'Português' }
const CLAVE_IDIOMA = 'nc_idioma'
const DICCIONARIOS = { es, en, pt }

function leerGuardado() {
  try {
    const guardado = localStorage.getItem(CLAVE_IDIOMA)
    if (guardado && IDIOMAS[guardado]) return guardado
  } catch {
  }
  return 'es'
}

let actual = leerGuardado()
if (typeof document !== 'undefined') document.documentElement.lang = actual

export const idiomaActual = () => actual

export function fijarIdioma(codigo) {
  if (!IDIOMAS[codigo]) return
  actual = codigo
  try {
    localStorage.setItem(CLAVE_IDIOMA, codigo)
  } catch {
  }
  document.documentElement.lang = codigo
}

export function traducir(idioma, clave, vars) {
  let valor = DICCIONARIOS[idioma][clave]
  if (valor === undefined) valor = DICCIONARIOS.es[clave]
  if (valor === undefined) return clave
  if (typeof valor === 'string' && vars) {
    valor = valor.replace(/\{(\w+)\}/g, (marcador, nombreDeVariable) => (vars[nombreDeVariable] !== undefined ? vars[nombreDeVariable] : marcador))
  }
  return valor
}

export function traducirDato(idioma, valor) {
  if (valor === undefined || valor === null) return valor
  const traduccion = DICCIONARIOS[idioma]['dato.' + valor]
  return traduccion !== undefined ? traduccion : valor
}

export const tt = (clave, vars) => traducir(actual, clave, vars)
