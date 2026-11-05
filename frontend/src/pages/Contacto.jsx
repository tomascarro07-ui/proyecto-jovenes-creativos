import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useIdioma } from '../hooks/useIdioma'
import TextoRico from '../components/TextoRico'

function Contacto() {
  const { t } = useIdioma()
  // Si llegás desde una charla o un taller (/contacto?idCharla=... o ?idTaller=...), el formulario se completa solo
  const [parametros] = useSearchParams()
  const idTaller = parametros.get('idTaller')
  const idCharla = parametros.get('idCharla')
  const { datos: actividad } = useCarga(() => {
    if (idTaller) return api.taller(idTaller).then((t) => ({ tipo: 'taller', titulo: t.titulo }))
    if (idCharla) return api.charla(idCharla).then((c) => ({ tipo: 'charla', titulo: c.titulo }))
    return Promise.resolve(null)
  }, [idTaller, idCharla])

  const [datos, setDatos] = useState({ nombre: '', email: '' })
  const [mensajeEscrito, setMensajeEscrito] = useState(null) // null = todavía no escribió nada: se usa el sugerido
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null) // { texto, esError }

  const esTaller = actividad && actividad.tipo === 'taller'
  const mensajeSugerido = actividad
    ? t(esTaller ? 'contacto.msgTaller' : 'contacto.msgCharla', { titulo: actividad.titulo })
    : ''
  const mensaje = mensajeEscrito === null ? mensajeSugerido : mensajeEscrito

  function alCambiar(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  async function alEnviar(e) {
    e.preventDefault()
    setEnviando(true)
    setAviso(null)
    try {
      const r = await api.contacto({
        nombre: datos.nombre,
        email: datos.email,
        actividad: actividad ? actividad.titulo : '',
        mensaje,
      })
      setAviso({ texto: (r && r.mensaje) || t('contacto.gracias'), esError: false })
      setDatos({ nombre: '', email: '' })
      setMensajeEscrito(null) // vuelve a completarse el mensaje si venías de una charla o taller
    } catch (err) {
      setAviso({ texto: err.message || t('contacto.error'), esError: true })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main id="contenido" className="admin-cabecera">
      <section className="nc-hero" aria-labelledby="contactoTitulo">
        <div className="nc-hero__texto">
          <h1 id="contactoTitulo">{t('contacto.h1')}</h1>
          <p id="contactoIntro">
            {actividad ? (
              <TextoRico clave={esTaller ? 'contacto.introTaller' : 'contacto.introCharla'} vars={{ titulo: actividad.titulo }} />
            ) : (
              t('contacto.intro')
            )}
          </p>
        </div>
      </section>
      <section className="admin-panel" aria-labelledby="contactoAsuntoTitulo">
        <div className="nc-seccion__cabecera">
          <h2 id="contactoAsuntoTitulo">
            {actividad ? (esTaller ? t('contacto.reservaTaller') : t('contacto.reservaCharla')) : t('contacto.h2')}
          </h2>
        </div>
        <form id="form-contacto" className="auth-form" onSubmit={alEnviar}>
          <div className="auth-fila">
            <div className="auth-campo">
              <label htmlFor="nombre">{t('contacto.nombre')}</label>
              {' '}
              <input type="text" id="nombre" name="nombre" maxLength="60" placeholder={t('contacto.nombrePh')} required value={datos.nombre} onChange={alCambiar} />
            </div>
            <div className="auth-campo">
              <label htmlFor="email">{t('det.email')}</label>
              {' '}
              <input type="email" id="email" name="email" placeholder={t('auth.correoPlaceholder')} required value={datos.email} onChange={alCambiar} />
            </div>
          </div>
          <div className="auth-campo" id="grupoActividad" hidden={!actividad}>
            <label htmlFor="actividad">{t('contacto.consultaSobre')}</label>
            {' '}
            <input type="text" id="actividad" name="actividad" readOnly value={actividad ? actividad.titulo : ''} />
          </div>
          <div className="auth-campo">
            <label htmlFor="mensaje">{t('contacto.mensaje')}</label>
            {' '}
            <textarea id="mensaje" name="mensaje" rows="5" required value={mensaje} onChange={(e) => setMensajeEscrito(e.target.value)}></textarea>
          </div>
          <button type="submit" className="nc-btn" disabled={enviando}>
            <i className="fa-solid fa-paper-plane"></i>
            {' '}
            <span>{enviando ? 'Enviando…' : 'Enviar'}</span>
          </button>
          {aviso && (
            <p role="status" style={{ marginTop: '1rem', color: aviso.esError ? '#a2492a' : '#2f6b3a' }}>{aviso.texto}</p>
          )}
        </form>
      </section>
    </main>
  )
}

export default Contacto
