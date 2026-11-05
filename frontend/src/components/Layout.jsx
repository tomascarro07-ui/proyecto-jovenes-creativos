import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { useIdioma } from '../hooks/useIdioma'

// Título de la pestaña del navegador según la página (clave del diccionario de idiomas).
// Para las páginas de detalle se usa la primera parte de la dirección (/charlas/5 -> "charlas").
const TITULOS = {
  '': 'index.titulo',
  museos: 'museos.titulo',
  charlas: 'charlas.titulo',
  cursos: 'cursos.titulo',
  recorridos: 'recorridos.titulo',
  calendario: 'cal.titulo',
  mapa: 'mapa.titulo',
  recursos: 'recursos.titulo',
  buscar: 'buscar.titulo',
  nosotros: 'nosotros.titulo',
  contacto: 'contacto.titulo',
  login: 'login.titulo',
  registro: 'registro.titulo',
  cuenta: 'cuenta.titulo',
  'olvide-contrasenia': 'olvide.titulo',
  'restablecer-contrasenia': 'rest.titulo',
  'verificar-correo': 'ver.titulo',
}
const TITULOS_DETALLE = { charlas: 'charla.titulo', cursos: 'taller.titulo', recorridos: 'recorrido.titulo' }

// Estructura común de casi todas las páginas: encabezado, contenido de la página y pie.
function Layout() {
  const { t, idioma } = useIdioma()
  const { pathname } = useLocation()

  useEffect(() => {
    const partes = pathname.split('/').filter(Boolean)
    const base = (partes[0] || '').replace(/\.html$/, '')
    let titulo = 'Nodo Cultural' // admin y mis-inscripciones no tienen título propio
    if (partes.length > 1 && TITULOS_DETALLE[base]) titulo = t(TITULOS_DETALLE[base])
    else if (TITULOS[base]) titulo = t(TITULOS[base])
    else if (base !== 'admin' && base !== 'mis-inscripciones') titulo = t('nf.tituloPagina')
    document.title = titulo
  }, [pathname, idioma, t])

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

export default Layout
