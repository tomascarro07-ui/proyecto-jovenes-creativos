// Motor de traducciones (sin React): lo usan el proveedor de idioma, api.js y las funciones de fechas.
// Los diccionarios (es.js, en.js, pt.js) vienen del sitio original: una clave por texto.
import es from './es'
import en from './en'
import pt from './pt'

export const IDIOMAS = { es: 'Español', en: 'English', pt: 'Português' }
export const CLAVE_IDIOMA = 'nc_idioma' // misma clave que usaba el sitio original
const DICCIONARIOS = { es, en, pt }

function leerGuardado() {
  try {
    const guardado = localStorage.getItem(CLAVE_IDIOMA)
    if (guardado && IDIOMAS[guardado]) return guardado
  } catch {
    /* sin localStorage: queda en español */
  }
  return 'es'
}

// Idioma en uso. Se guarda aquí (además de en React) para que api.js pueda leerlo sin ser un componente.
let actual = leerGuardado()
if (typeof document !== 'undefined') document.documentElement.lang = actual

export const idiomaActual = () => actual

export function fijarIdioma(codigo) {
  if (!IDIOMAS[codigo]) return
  actual = codigo
  try {
    localStorage.setItem(CLAVE_IDIOMA, codigo)
  } catch {
    /* sin localStorage */
  }
  document.documentElement.lang = codigo
}

// Traduce una clave. Si falta en el idioma pedido cae al español; si tampoco está, devuelve la clave.
// Con variables: traducir('en', 'det.cupos', { n: 5 }) reemplaza {n} dentro del texto.
export function traducir(idioma, clave, vars) {
  let valor = DICCIONARIOS[idioma][clave]
  if (valor === undefined) valor = DICCIONARIOS.es[clave]
  if (valor === undefined) return clave
  if (typeof valor === 'string' && vars) {
    valor = valor.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m))
  }
  return valor
}

// Traduce valores de la base de datos que son categorías fijas (Presencial, Virtual, Iniciación...).
export function traducirDato(idioma, valor) {
  if (valor === undefined || valor === null) return valor
  const v = DICCIONARIOS[idioma]['dato.' + valor]
  return v !== undefined ? v : valor
}

// Versión corta para código que no es un componente (usa el idioma actual)
export const tt = (clave, vars) => traducir(actual, clave, vars)
