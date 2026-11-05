import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, guardarSesion } from '../api'
import { useIdioma } from '../hooks/useIdioma'
import TextoRico from '../components/TextoRico'

function Registro() {
  const { t } = useIdioma()
  const navegar = useNavigate()
  const [datos, setDatos] = useState({ nombre: '', apellido: '', correo: '', contrasenia: '', nacimiento: '' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  // Un solo manejador para todos los campos: usa el "name" del campo para saber cuál actualizar
  function alCambiar(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  async function alEnviar(e) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      const correo = datos.correo.trim()
      await api.registro({
        correo,
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        contrasenia: datos.contrasenia,
        fechaNacimiento: datos.nacimiento,
      })
      // Se registra y se pide iniciar sesión (el aviso de "revisá tu correo" se muestra en el login)
      guardarSesion(null)
      navegar('/login?registrado=1&correo=' + encodeURIComponent(correo))
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <main id="contenido" className="auth-main">
      <section className="auth-card" aria-labelledby="registroTitulo">
        <div className="auth-lado">
          <i className="fa-solid fa-user-plus" aria-hidden="true"></i>
          <h1 id="registroTitulo">{t('registro.h1')}</h1>
          <p>
            {t('registro.lado')}
          </p>
        </div>
        <div className="auth-form-wrap">
          <h2>{t('registro.h2')}</h2>
          <form id="form-registro" className="auth-form" onSubmit={alEnviar}>
            <div className="auth-fila">
              <div className="auth-campo">
                <label htmlFor="nombre">{t('registro.nombre')}</label>
                {' '}
                <input type="text" id="nombre" name="nombre" maxLength="60" placeholder={t('registro.nombrePh')} required value={datos.nombre} onChange={alCambiar} />
              </div>
              <div className="auth-campo">
                <label htmlFor="apellido">{t('registro.apellido')}</label>
                {' '}
                <input type="text" id="apellido" name="apellido" maxLength="60" placeholder={t('registro.apellidoPh')} required value={datos.apellido} onChange={alCambiar} />
              </div>
            </div>
            <div className="auth-campo">
              <label htmlFor="correo">{t('auth.correo')}</label>
              {' '}
              <input type="email" id="correo" name="correo" maxLength="60" placeholder={t('auth.correoPlaceholder')} required value={datos.correo} onChange={alCambiar} />
            </div>
            <div className="auth-campo">
              <label htmlFor="contrasenia">{t('auth.contrasenia')}</label>
              {' '}
              <input type="password" id="contrasenia" name="contrasenia" minLength="8" placeholder={t('auth.contraseniaPlaceholder')} required value={datos.contrasenia} onChange={alCambiar} />
            </div>
            <div className="auth-campo">
              <label htmlFor="nacimiento">{t('registro.nacimiento')}</label>
              {' '}
              <input type="date" id="nacimiento" name="nacimiento" required value={datos.nacimiento} onChange={alCambiar} />
            </div>
            {error && <p className="auth-mensaje auth-mensaje--error" role="alert">{error}</p>}
            <button type="submit" className="nc-btn" disabled={enviando}>
              <i className="fa-solid fa-user-plus"></i>
              {' '}
              <span>{t('registro.btn')}</span>
            </button>
            <div className="auth-separador">{t('auth.o')}</div>
            <Link to="/login" className="nc-btn nc-btn--outline">{t('registro.yaTengo')}</Link>
          </form>
          <p className="auth-ayuda">
            <TextoRico clave="auth.ayuda" />
          </p>
        </div>
      </section>
    </main>
  )
}

export default Registro
