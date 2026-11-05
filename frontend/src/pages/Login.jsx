import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { useIdioma } from '../hooks/useIdioma'
import TextoRico from '../components/TextoRico'

function Login() {
  const { t } = useIdioma()
  const [parametros] = useSearchParams()
  const { login } = useSesion()
  const navegar = useNavigate()
  const [correo, setCorreo] = useState(parametros.get('correo') || '')
  const [contrasenia, setContrasenia] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function alEnviar(e) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      const usuario = await login(correo.trim(), contrasenia)
      navegar(usuario.esAdministrador ? '/admin' : '/')
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <main id="contenido" className="auth-main">
      <section className="auth-card" aria-labelledby="loginTitulo">
        <div className="auth-lado">
          <i className="fa-solid fa-right-to-bracket" aria-hidden="true"></i>
          <h1 id="loginTitulo">{t('login.h1')}</h1>
          <p>
            {t('login.lado')}
          </p>
        </div>
        <div className="auth-form-wrap">
          <h2>{t('login.h2')}</h2>
          {parametros.get('registrado') === '1' && (
            <p id="avisoRegistro" className="auth-mensaje" role="status">
              {t('auth.registrado')}
            </p>
          )}
          <form id="form-login" className="auth-form" onSubmit={alEnviar}>
            <div className="auth-campo">
              <label htmlFor="correo">{t('auth.correo')}</label>
              {' '}
              <input type="email" id="correo" maxLength="60" placeholder={t('auth.correoPlaceholder')} required value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </div>
            <div className="auth-campo">
              <label htmlFor="contrasenia">{t('auth.contrasenia')}</label>
              {' '}
              <input type="password" id="contrasenia" placeholder={t('auth.contraseniaPlaceholder')} required value={contrasenia} onChange={(e) => setContrasenia(e.target.value)} />
            </div>
            <Link to="/olvide-contrasenia" className="auth-olvide">{t('login.olvidaste')}</Link>
            {error && <p className="auth-mensaje auth-mensaje--error" role="alert">{error}</p>}
            <button type="submit" className="nc-btn" disabled={enviando}>
              <i className="fa-solid fa-right-to-bracket"></i>
              {' '}
              <span>{t('login.btn')}</span>
            </button>
            <div className="auth-separador">{t('auth.o')}</div>
            <Link to="/registro" className="nc-btn nc-btn--outline">{t('login.sinCuenta')}</Link>
          </form>
          <p className="auth-ayuda">
            <TextoRico clave="auth.ayuda" />
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login
