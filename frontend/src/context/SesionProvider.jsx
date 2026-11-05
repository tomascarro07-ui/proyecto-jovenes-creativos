import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, guardarSesion, leerSesion } from '../api'
import { SesionContext } from './SesionContext'

// Mantiene la sesión sincronizada con el navegador (localStorage) y con el servidor.
// La sesión guardada es { token, usuario }. La autoridad real siempre es el servidor.
function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerSesion())

  // Cualquier cambio de sesión (login, cierre, un 401 en pedirApi) se refleja acá
  useEffect(() => {
    const alCambiar = () => setSesion(leerSesion())
    window.addEventListener('sesion-cambiada', alCambiar)
    window.addEventListener('storage', alCambiar) // otra pestaña
    return () => {
      window.removeEventListener('sesion-cambiada', alCambiar)
      window.removeEventListener('storage', alCambiar)
    }
  }, [])

  const usuario = sesion && sesion.usuario ? sesion.usuario : null

  // Una vez por minuto como máximo, contrasta la sesión con el servidor
  // (si venció la cierra; si cambió algo, por ejemplo confirmó el correo en otra pestaña, lo actualiza)
  useEffect(() => {
    if (!usuario) return
    try {
      const ultimo = Number(sessionStorage.getItem('nc_sync') || 0)
      if (Date.now() - ultimo < 60000) return
      sessionStorage.setItem('nc_sync', String(Date.now()))
    } catch {
      /* sin sessionStorage: se sincroniza en cada carga */
    }
    api.yo()
      .then((r) => {
        const actual = leerSesion()
        if (actual) guardarSesion({ ...actual, usuario: r.usuario })
      })
      .catch(() => {}) // un 401 ya cerró la sesión local en pedirApi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!usuario])

  const login = useCallback(async (correo, contrasenia) => {
    const r = await api.login(correo, contrasenia)
    guardarSesion({ token: r.token || null, usuario: r.usuario })
    return r.usuario
  }, [])

  const salir = useCallback(async () => {
    // Le pedimos al servidor que borre la cookie; si no responde, cerramos igual en este navegador
    const espera = new Promise((resolver) => setTimeout(resolver, 1500))
    await Promise.race([api.salir().catch(() => {}), espera])
    guardarSesion(null)
  }, [])

  const actualizarUsuario = useCallback((nuevo) => {
    const actual = leerSesion()
    if (actual) guardarSesion({ ...actual, usuario: nuevo })
  }, [])

  const valor = useMemo(
    () => ({ usuario, esAdmin: !!(usuario && usuario.esAdministrador === true), login, salir, actualizarUsuario }),
    [usuario, login, salir, actualizarUsuario],
  )

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

export default SesionProvider
