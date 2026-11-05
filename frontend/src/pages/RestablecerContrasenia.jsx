import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api, guardarSesion } from '../api'
import { useIdioma } from '../hooks/useIdioma'

function RestablecerContrasenia() {
  const { t } = useIdioma()
  // El token viaja en la URL del correo (?token=...)
  const [parametros] = useSearchParams()
  const [token] = useState(() => parametros.get('token') || '') // se guarda al entrar
  const navegar = useNavigate()
  const { pathname } = useLocation()

  // El token viaja en la URL del correo; lo sacamos de la barra de direcciones enseguida.
  useEffect(() => {
    navegar(pathname, { replace: true })
  }, [navegar, pathname])

  const [nueva, setNueva] = useState('')
  const [repetir, setRepetir] = useState('')
  const [mensaje, setMensaje] = useState(
    token ? null : { texto: t('rest.invalido'), esError: true },
  )
  const [enviando, setEnviando] = useState(false)
  const [terminado, setTerminado] = useState(false) // el formulario se oculta al guardar

  async function alEnviar(e) {
    e.preventDefault()
    if (nueva.length < 8) return setMensaje({ texto: t('rest.corta'), esError: true })
    if (nueva !== repetir) return setMensaje({ texto: t('rest.noCoinciden'), esError: true })
    setEnviando(true)
    try {
      const r = await api.restablecerContrasenia(token, nueva)
      guardarSesion(null) // por si quedaba una sesión vieja en este navegador
      setMensaje({ texto: r.mensaje + t('rest.login'), esError: false })
      setTerminado(true)
      setTimeout(() => navegar('/login'), 2500)
    } catch (err) {
      setMensaje({ texto: err.message, esError: true })
      setEnviando(false)
    }
  }

  return (
    <main id="contenido" className="auth-main">
      <section className="auth-card" aria-labelledby="authTitulo">
        <div className="auth-lado">
          <i className="fa-solid fa-key" aria-hidden="true"></i>
          <h1 id="authTitulo">{t('rest.h1')}</h1>
          <p>
            {t('rest.lado')}
          </p>
        </div>
        <div className="auth-form-wrap">
          <h2>{t('rest.h2')}</h2>
          <form id="form-restablecer" className="auth-form" noValidate onSubmit={alEnviar} hidden={terminado}>
            <div className="auth-campo">
              <label htmlFor="nueva">{t('rest.h2')}</label>
              {' '}
              <input type="password" id="nueva" minLength="8" placeholder={t('rest.nuevaPh')} autoComplete="new-password" required value={nueva} onChange={(e) => setNueva(e.target.value)} />
            </div>
            <div className="auth-campo">
              <label htmlFor="repetir">{t('rest.repetir')}</label>
              {' '}
              <input type="password" id="repetir" minLength="8" placeholder={t('rest.repetir')} autoComplete="new-password" required value={repetir} onChange={(e) => setRepetir(e.target.value)} />
            </div>
            <button type="submit" className="nc-btn" id="btnGuardar" disabled={enviando || !token}>
              <i className="fa-solid fa-key"></i>
              {' '}
              <span>{t('rest.btn')}</span>
            </button>
          </form>
          {mensaje && (
            <p id="mensaje" role="status" aria-live="polite" className={`auth-mensaje${mensaje.esError ? ' auth-mensaje--error' : ''}`}>
              {mensaje.texto}
            </p>
          )}
          <p className="auth-ayuda">
            <Link to="/login">{t('auth.volverLogin')}</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default RestablecerContrasenia
