import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useIdioma } from '../hooks/useIdioma'

function OlvideContrasenia() {
  const { t } = useIdioma()
  const [correo, setCorreo] = useState('')
  const [mensaje, setMensaje] = useState(null) // { texto, esError }
  const [enviando, setEnviando] = useState(false)

  async function alEnviar(e) {
    e.preventDefault()
    if (!correo.trim()) return
    setEnviando(true)
    setMensaje({ texto: 'Enviando…', esError: false })
    try {
      const r = await api.olvideContrasenia(correo.trim())
      setMensaje({ texto: r.mensaje, esError: false })
      setCorreo('')
    } catch (err) {
      setMensaje({ texto: err.message, esError: true })
    } finally {
      // Pequeña pausa para no invitar a reenviar varias veces seguidas
      setTimeout(() => setEnviando(false), 3000)
    }
  }

  return (
    <main id="contenido" className="auth-main">
      <section className="auth-card" aria-labelledby="authTitulo">
        <div className="auth-lado">
          <i className="fa-solid fa-envelope-open-text" aria-hidden="true"></i>
          <h1 id="authTitulo">{t('login.olvidaste')}</h1>
          <p>
            {t('olvide.lado')}
          </p>
        </div>
        <div className="auth-form-wrap">
          <h2>{t('olvide.h2')}</h2>
          <form id="form-olvide" className="auth-form" noValidate onSubmit={alEnviar}>
            <div className="auth-campo">
              <label htmlFor="correo">{t('auth.correo')}</label>
              {' '}
              <input type="email" id="correo" maxLength="60" placeholder={t('olvide.correoPh')} autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </div>
            {mensaje && (
              <p id="mensaje" role="status" aria-live="polite" className={`auth-mensaje${mensaje.esError ? ' auth-mensaje--error' : ''}`}>
                {mensaje.texto}
              </p>
            )}
            <button type="submit" className="nc-btn" id="btnEnviar" disabled={enviando}>
              <i className="fa-regular fa-paper-plane"></i>
              {' '}
              <span>{t('olvide.btn')}</span>
            </button>
          </form>
          <p className="auth-ayuda">
            <Link to="/login">{t('auth.volverLogin')}</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default OlvideContrasenia
