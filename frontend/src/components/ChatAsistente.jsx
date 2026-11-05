import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useIdioma } from '../hooks/useIdioma'

// Preguntas para empezar (antes eran los enlaces .sug-pregunta del HTML). Son claves del diccionario de idiomas.
const SUGERENCIAS = [
  { n: 1, icono: 'fa-comments' },
  { n: 2, icono: 'fa-palette' },
  { n: 3, icono: 'fa-map-location-dot' },
]

// Cuántos mensajes anteriores se mandan al servidor en cada pregunta
const LIMITE_HISTORIAL = 8

// Páginas del sitio a las que la IA puede enviar. El asistente escribe la ruta (por ejemplo "/charlas")
// y aquí se convierte en un enlace con un texto en el idioma elegido.
const PAGINAS = {
  '/charlas': 'chat.ver.charlas',
  '/cursos': 'chat.ver.cursos',
  '/museos': 'chat.ver.museos',
  '/recorridos': 'chat.ver.recorridos',
  '/contacto': 'chat.ver.contacto',
  '/nosotros': 'chat.ver.nosotros',
}

// Convierte el texto de la IA en elementos de React: las rutas conocidas pasan a ser enlaces.
// Como no se usa innerHTML, lo que escriba la IA nunca se interpreta como código.
// También se aceptan las formas viejas ("charlas.html").
function respuestaConEnlaces(texto, t) {
  return texto.split(/((?<![\w/])\/?(?:charlas|cursos|museos|recorridos|contacto|nosotros)(?:\.html)?(?![\w/]))/).map((parte, i) => {
    const ruta = '/' + parte.replace(/^\//, '').replace(/\.html$/, '')
    const clave = PAGINAS[ruta]
    const esEnlace = clave && (parte.startsWith('/') || parte.endsWith('.html'))
    return esEnlace ? <Link key={i} to={ruta} className="asistente-link">{t(clave)}</Link> : parte
  })
}

function ChatAsistente() {
  const { t, idioma } = useIdioma()
  const [mensajes, setMensajes] = useState([]) // { id, quien: 'usuario' | 'ia', texto }
  const [entrada, setEntrada] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const contenedorRef = useRef(null)

  // Siempre mostrar el último mensaje
  useEffect(() => {
    const el = contenedorRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [mensajes, escribiendo])

  async function enviarMensaje(texto) {
    const nuevo = { id: crypto.randomUUID(), quien: 'usuario', texto }
    setMensajes((actuales) => [...actuales, nuevo])
    setEscribiendo(true)
    // Historial que se manda al servidor: los últimos 8 mensajes de la conversación
    const historial = [...mensajes, nuevo]
      .slice(-LIMITE_HISTORIAL)
      .map((m) => ({ role: m.quien === 'ia' ? 'assistant' : 'user', content: m.texto }))
    try {
      const datos = await api.chat(historial, idioma)
      const respuesta = ((datos && datos.respuesta) || '').trim() || t('chat.sinRespuesta')
      setMensajes((actuales) => [...actuales, { id: crypto.randomUUID(), quien: 'ia', texto: respuesta }])
    } catch (error) {
      setMensajes((actuales) => [...actuales, { id: crypto.randomUUID(), quien: 'ia', texto: error.message || t('chat.sinConexion') }])
    } finally {
      setEscribiendo(false)
    }
  }

  function alEnviar(e) {
    e.preventDefault()
    const texto = entrada.trim()
    if (texto === '') return
    setEntrada('')
    enviarMensaje(texto)
  }

  return (
    <section className="asistente" aria-labelledby="asistenteTitulo">
      <h2 id="asistenteTitulo">
        <span>{t('index.asistenteTitulo')}</span>
        {' '}
        <span className="asistente-ia">{t('index.ia')}</span>
      </h2>
      <p className="asistente-saludo">
        {t('chat.hola')}
        <br />
        {t('chat.ayudar')}
      </p>
      <div className="asistente-mensajes" id="asistenteMensajes" aria-live="polite" ref={contenedorRef}>
        {mensajes.map((m) => (
          <p key={m.id} className={m.quien === 'ia' ? 'asistente-burbuja asistente-burbuja--ia' : 'asistente-burbuja'}>
            {m.quien === 'ia' ? respuestaConEnlaces(m.texto, t) : m.texto}
          </p>
        ))}
        {escribiendo && <p className="asistente-aviso">{t('chat.escribiendoCorto')}</p>}
      </div>
      {mensajes.length === 0 && (
        <div className="asistente-sugerencias" id="asistenteSugerencias">
          <p>{t('index.preguntas')}</p>
          <ul>
            {SUGERENCIAS.map((sug) => (
              <li key={sug.n}>
                <a
                  href="#"
                  className="sug-pregunta"
                  onClick={(e) => {
                    e.preventDefault()
                    enviarMensaje(t(`chat.sug${sug.n}.pregunta`))
                  }}
                >
                  <span className="sug-thumb"><i className={`fa-solid ${sug.icono}`}></i></span>
                  {' '}
                  <span className="sug-texto">
                    <strong>{t(`chat.sug${sug.n}.titulo`)}</strong>
                    {' '}
                    <small>{t(`chat.sug${sug.n}.detalle`)}</small>
                  </span>
                  {' '}
                  <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <form className="asistente-form" id="formAsistente" onSubmit={alEnviar}>
        <label htmlFor="asistenteInput" className="visually-hidden">{t('index.asistenteLabel')}</label>
        {' '}
        <input
          type="text"
          id="asistenteInput"
          placeholder={t('index.asistentePlaceholder')}
          autoComplete="off"
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
        />
        {' '}
        <button type="submit" className="nc-btn nc-btn--pill" aria-label={t('index.asistenteEnviar')}>
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </section>
  )
}

export default ChatAsistente
