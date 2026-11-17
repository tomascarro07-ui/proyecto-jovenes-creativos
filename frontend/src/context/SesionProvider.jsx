import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, guardarSesion, leerSesion } from '../api'
import { SesionContext } from './SesionContext'

function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerSesion())

  useEffect(() => {
    const alCambiar = () => setSesion(leerSesion())
    window.addEventListener('sesion-cambiada', alCambiar)
    window.addEventListener('storage', alCambiar)
    return () => {
      window.removeEventListener('sesion-cambiada', alCambiar)
      window.removeEventListener('storage', alCambiar)
    }
  }, [])

  const usuario = sesion && sesion.usuario ? sesion.usuario : null

  useEffect(() => {
    if (!usuario) return
    try {
      const ultimo = Number(sessionStorage.getItem('nc_sync') || 0)
      if (Date.now() - ultimo < 60000) return
      sessionStorage.setItem('nc_sync', String(Date.now()))
    } catch {
    }
    api.yo()
      .then((respuesta) => {
        const actual = leerSesion()
        if (actual) guardarSesion({ ...actual, usuario: respuesta.usuario })
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(usuario)])

  const login = useCallback(async (correo, contrasenia) => {
    const respuesta = await api.login(correo, contrasenia)
    guardarSesion({ token: respuesta.token || null, usuario: respuesta.usuario })
    return respuesta.usuario
  }, [])

  const salir = useCallback(async () => {
    const espera = new Promise((resolver) => setTimeout(resolver, 1500))
    await Promise.race([api.salir().catch(() => {}), espera])
    guardarSesion(null)
  }, [])

  const actualizarUsuario = useCallback((nuevo) => {
    const actual = leerSesion()
    if (actual) guardarSesion({ ...actual, usuario: nuevo })
  }, [])

  const valor = useMemo(
    () => ({ usuario, esAdmin: Boolean(usuario && usuario.esAdministrador === true), login, salir, actualizarUsuario }),
    [usuario, login, salir, actualizarUsuario],
  )

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

export default SesionProvider
