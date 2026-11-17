import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useIdioma } from '../hooks/useIdioma'

const SUGERENCIAS = [
  { n: 1, icono: 'fa-comments' },
  { n: 2, icono: 'fa-palette' },
  { n: 3, icono: 'fa-map-location-dot' },
]

const LIMITE_HISTORIAL = 8

const PAGINAS = {
  '/charlas': 'chat.ver.charlas',
  '/cursos': 'chat.ver.cursos',
  '/museos': 'chat.ver.museos',
  '/recorridos': 'chat.ver.recorridos',
  '/contacto': 'chat.ver.contacto',
  '/nosotros': 'chat.ver.nosotros',
}

function respuestaConEnlaces(texto, t) {
  return texto.split(/((?<![\w/])\/?(?:charlas|cursos|museos|recorridos|contacto|nosotros)(?:\.html)?(?![\w/]))/).map((parte, posicion) => {
    const ruta = '/' + parte.replace(/^\//, '').replace(/\.html$/, '')
    const clave = PAGINAS[ruta]
    const esEnlace = clave && (parte.startsWith('/') || parte.endsWith('.html'))
    return esEnlace ? <Link key={posicion} to={ruta} className="asistente-link">{t(clave)}</Link> : parte
  })
}

function ChatAsistente() {
  const { t, idioma } = useIdioma()
  const [mensajes, setMensajes] = useState([])
  const [entrada, setEntrada] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const contenedorRef = useRef(null)

  useEffect(() => {
    const el = contenedorRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [mensajes, escribiendo])

  async function enviarMensaje(texto) {
    const nuevo = { id: crypto.randomUUID(), quien: 'usuario', texto }
    setMensajes((actuales) => [...actuales, nuevo])
    setEscribiendo(true)
    const historial = [...mensajes, nuevo]
      .slice(-LIMITE_HISTORIAL)
      .map((mensaje) => ({ role: mensaje.quien === 'ia' ? 'assistant' : 'user', content: mensaje.texto }))
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

  function alEnviar(evento) {
    evento.preventDefault()
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
        {mensajes.map((mensaje) => (
          <p key={mensaje.id} className={mensaje.quien === 'ia' ? 'asistente-burbuja asistente-burbuja--ia' : 'asistente-burbuja'}>
            {mensaje.quien === 'ia' ? respuestaConEnlaces(mensaje.texto, t) : mensaje.texto}
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
                  onClick={(evento) => {
                    evento.preventDefault()
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
          onChange={(evento) => setEntrada(evento.target.value)}
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
