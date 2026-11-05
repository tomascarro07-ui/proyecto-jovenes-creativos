// FASE 5: aquí vive TODA la comunicación con el servidor (backend).
// Ninguna página llama a fetch directamente: usan pedirApi() o las funciones de más abajo.
// (En el sitio original esto eran base/api.js + los "gestores" de scripts/gestores/.)

// La dirección del servidor viene de la variable VITE_API_URL (archivo .env del frontend).
import { idiomaActual, tt } from './i18n/motor'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// La sesión se guarda en el navegador con la misma clave que antes: { token, usuario }
export const SESION_KEY = 'sesionActual'

export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(SESION_KEY)) || null
  } catch {
    return null
  }
}

export function guardarSesion(sesion) {
  try {
    if (sesion) localStorage.setItem(SESION_KEY, JSON.stringify(sesion))
    else localStorage.removeItem(SESION_KEY)
  } catch {
    /* sin localStorage: la sesión dura solo mientras esté la página abierta */
  }
  // Avisa a los componentes que usan la sesión (ver SesionProvider)
  window.dispatchEvent(new Event('sesion-cambiada'))
}

// Los datos guardados en la base traen rutas como "img/foto.webp" (sin barra inicial). En una página
// como /charlas/3 el navegador las buscaría en /charlas/img/foto.webp y la imagen no cargaría.
// Por eso se les agrega la "/" inicial a todos los campos "imagen" y "archivo" que llegan del servidor.
function rutaPublica(valor) {
  if (typeof valor !== 'string' || !valor) return valor
  // Los PDF subidos desde el panel se descargan del servidor: "/api/recursos/<id>/archivo"
  if (valor.startsWith('/api/') && /^https?:/i.test(API_URL)) return API_URL.replace(/\/api\/?$/, '') + valor
  if (/^([a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(valor)) return valor // ya es absoluta (http:, data:, /img/...)
  if (valor === 'IMAGEN_MUSEO') return valor // texto especial: "museo sin imagen"
  return '/' + valor.replace(/^\.?\//, '')
}

function normalizarRutas(dato) {
  if (Array.isArray(dato)) return dato.map(normalizarRutas)
  if (dato && typeof dato === 'object') {
    const copia = {}
    for (const clave of Object.keys(dato)) {
      copia[clave] = clave === 'imagen' || clave === 'archivo' ? rutaPublica(dato[clave]) : normalizarRutas(dato[clave])
    }
    return copia
  }
  return dato
}

// Función única para hablar con el backend.
// ruta: "/talleres", "/talleres/123", etc. (se le suma API_URL adelante)
export async function pedirApi(ruta, opciones = {}) {
  const config = { method: opciones.method || 'GET', headers: {} }
  const sesion = leerSesion()
  if (sesion && sesion.token) config.headers.Authorization = 'Bearer ' + sesion.token
  // Con sesión en cookie, el servidor exige este encabezado en pedidos que modifican datos (defensa CSRF)
  if (config.method !== 'GET') config.headers['X-Requested-With'] = 'nodocultural'
  if (opciones.body !== undefined) {
    config.headers['Content-Type'] = 'application/json'
    config.body = JSON.stringify(opciones.body)
  }

  // En inglés y portugués el servidor devuelve los textos (actividades y mensajes) ya traducidos (?idioma=en).
  // El panel de administración siempre trabaja con los textos originales.
  let url = API_URL + ruta
  const idioma = idiomaActual()
  if (idioma !== 'es' && !window.location.pathname.startsWith('/admin')) {
    url += (ruta.includes('?') ? '&' : '?') + 'idioma=' + idioma
  }

  let respuesta
  try {
    respuesta = await fetch(url, config)
  } catch {
    throw new Error(tt('api.sinConexion'))
  }

  const datos = normalizarRutas(await respuesta.json().catch(() => null))

  if (!respuesta.ok) {
    if (respuesta.status === 401 && !ruta.includes('/auth/login')) {
      guardarSesion(null) // sesión vencida o inválida
    }
    const error = new Error((datos && datos.error) || 'Error del servidor')
    error.status = respuesta.status
    error.codigo = datos && datos.codigo
    throw error
  }
  return datos
}

// ── Autenticación ──────────────────────────────────────────
export const api = {
  login: (correo, contrasenia) => pedirApi('/auth/login', { method: 'POST', body: { correo, contrasenia } }),
  registro: (datos) => pedirApi('/auth/registro', { method: 'POST', body: datos }),
  salir: () => pedirApi('/auth/salir', { method: 'POST' }),
  yo: () => pedirApi('/auth/yo'),
  actualizarPerfil: (datos) => pedirApi('/auth/yo', { method: 'PATCH', body: datos }),
  cambiarContrasenia: (datos) => pedirApi('/auth/contrasenia', { method: 'PATCH', body: datos }),
  olvideContrasenia: (correo) => pedirApi('/auth/olvide-contrasenia', { method: 'POST', body: { correo } }),
  restablecerContrasenia: (token, nueva) =>
    pedirApi('/auth/restablecer-contrasenia', { method: 'POST', body: { token, nueva } }),
  verificarCorreo: (token) => pedirApi('/auth/verificar-correo', { method: 'POST', body: { token } }),
  reenviarVerificacion: () => pedirApi('/auth/reenviar-verificacion', { method: 'POST' }),

  // ── Actividades y contenido (lectura) ─────────────────────
  charlas: () => pedirApi('/charlas'),
  charla: (id) => pedirApi('/charlas/' + encodeURIComponent(id)),
  talleres: () => pedirApi('/talleres'),
  taller: (id) => pedirApi('/talleres/' + encodeURIComponent(id)),
  recorridos: () => pedirApi('/recorridos'),
  recorrido: (id) => pedirApi('/recorridos/' + encodeURIComponent(id)),
  museos: () => pedirApi('/museos'),
  museo: (id) => pedirApi('/museos/' + encodeURIComponent(id)),
  recursos: () => pedirApi('/recursos'),
  mapa: () => pedirApi('/mapa'),
  buscar: (consulta) => pedirApi('/buscar' + (consulta ? '?' + consulta : '')),

  // ── Inscripciones y valoraciones ──────────────────────────
  misInscripciones: () => pedirApi('/inscripciones/mias'),
  inscribirse: (datos) => pedirApi('/inscripciones', { method: 'POST', body: datos }),
  cancelarInscripcion: (id) => pedirApi('/inscripciones/' + encodeURIComponent(id), { method: 'DELETE' }),
  inscriptosDeActividad: (tipo, id) =>
    pedirApi('/inscripciones/actividad/' + encodeURIComponent(tipo) + '/' + encodeURIComponent(id)),
  valoraciones: (idRecorrido) => pedirApi('/valoraciones/recorrido/' + encodeURIComponent(idRecorrido)),
  elegibilidad: (idRecorrido) => pedirApi('/valoraciones/elegibilidad/' + encodeURIComponent(idRecorrido)),
  valorar: (datos) => pedirApi('/valoraciones', { method: 'POST', body: datos }),

  // ── Contacto, boletín y chat ──────────────────────────────
  contacto: (datos) => pedirApi('/contacto', { method: 'POST', body: datos }),
  contactoSudamtex: (datos) => pedirApi('/contacto/sudamtex', { method: 'POST', body: datos }),
  boletin: (email, categorias) => pedirApi('/boletin', { method: 'POST', body: { email, categorias } }),
  chat: (mensajes, idioma) => pedirApi('/chat', { method: 'POST', body: { mensajes, idioma } }),
}

// Escritura de las secciones administrables (solo administradores): charlas, talleres, recorridos, museos, recursos.
export const admin = {
  crear: (seccion, datos) => pedirApi('/' + seccion, { method: 'POST', body: datos }),
  eliminar: (seccion, id) => pedirApi('/' + seccion + '/' + encodeURIComponent(id), { method: 'DELETE' }),
  finalizada: (seccion, id) => pedirApi('/' + seccion + '/' + encodeURIComponent(id) + '/finalizada', { method: 'PATCH' }),
  destacada: (seccion, id) => pedirApi('/' + seccion + '/' + encodeURIComponent(id) + '/destacada', { method: 'PATCH' }),
  ubicacion: (seccion, id, ubicacion) =>
    pedirApi('/' + seccion + '/' + encodeURIComponent(id) + '/ubicacion', { method: 'PATCH', body: ubicacion }),
}
