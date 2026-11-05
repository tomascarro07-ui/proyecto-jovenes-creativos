import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useSesion } from '../hooks/useSesion'
import { useIdioma } from '../hooks/useIdioma'

function VerificarCorreo() {
  const { t } = useIdioma()
  const [parametros] = useSearchParams()
  const [token] = useState(() => parametros.get('token') || '') // se guarda al entrar
  const { usuario, actualizarUsuario } = useSesion()
  const navegar = useNavigate()
  const { pathname } = useLocation()
  const lanzado = useRef(false) // evita confirmar dos veces el mismo enlace
  const [estado, setEstado] = useState(
    token
      ? { titulo: t('ver.verificando'), mensaje: t('ver.confirmando'), esError: false, listo: false }
      : { titulo: t('ver.incompleto'), mensaje: t('ver.incompletoMsg'), esError: true, listo: false },
  )
  const [reenviando, setReenviando] = useState(false)

  useEffect(() => {
    // El token viaja en la URL del correo; lo sacamos de la barra de direcciones enseguida.
    navegar(pathname, { replace: true })
    if (!token || lanzado.current) return
    lanzado.current = true
    api.verificarCorreo(token)
      .then(async (r) => {
        setEstado({ titulo: t('ver.ok'), mensaje: r.mensaje + t('ver.okExtra'), esError: false, listo: true })
        // Si hay sesión abierta, se actualiza para que desaparezca el aviso del header
        try {
          const yo = await api.yo()
          actualizarUsuario(yo.usuario)
        } catch {
          /* sin sesión: no hay nada que actualizar */
        }
      })
      .catch((error) => {
        setEstado({ titulo: t('ver.fallo'), mensaje: error.message, esError: true, listo: false })
      })
  }, [navegar, pathname, token, actualizarUsuario, t])

  async function pedirNuevo() {
    setReenviando(true)
    try {
      const r = await api.reenviarVerificacion()
      setEstado({ titulo: t('ver.revisa'), mensaje: r.mensaje, esError: false, listo: false })
    } catch (err) {
      setEstado({ titulo: t('ver.fallo'), mensaje: err.message, esError: true, listo: false })
      setReenviando(false)
    }
  }

  let acciones = null
  if (estado.listo) {
    acciones = (
      <>
        <Link className="nc-btn" to="/calendario">{t('ver.verActividades')}</Link>
        <Link className="auth-ayuda" to="/">{t('common.irInicio')}</Link>
      </>
    )
  } else if (estado.esError && !token) {
    acciones = usuario
      ? <Link className="nc-btn" to="/">{t('common.irInicio')}</Link>
      : <Link className="nc-btn" to="/login">{t('hd.iniciarSesion')}</Link>
  } else if (estado.esError) {
    acciones = usuario
      ? <button type="button" className="nc-btn" onClick={pedirNuevo} disabled={reenviando}>{t('ver.pedirNuevo')}</button>
      : <Link className="nc-btn" to="/login">{t('ver.loginParaPedir')}</Link>
  }

  return (
    <main id="contenido" className="auth-main">
      <section className="auth-card" aria-labelledby="authTitulo">
        <div className="auth-lado">
          <i className="fa-solid fa-envelope-circle-check" aria-hidden="true"></i>
          <h1 id="authTitulo">{t('ver.h1')}</h1>
          <p>
            {t('ver.lado')}
          </p>
        </div>
        <div className="auth-form-wrap">
          <h2 id="estadoTitulo">{estado.titulo}</h2>
          <p id="mensaje" className={`auth-mensaje${estado.esError ? ' auth-mensaje--error' : ''}`} role="status" aria-live="polite">{estado.mensaje}</p>
          <div className="auth-form" id="acciones">{acciones}</div>
        </div>
      </section>
    </main>
  )
}

export default VerificarCorreo
