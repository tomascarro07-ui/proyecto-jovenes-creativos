import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useSesion } from '../hooks/useSesion'
import { useIdioma } from '../hooks/useIdioma'
import { IDIOMAS } from '../i18n/motor'
import TextoRico from '../components/TextoRico'

// Menú principal. Para agregar o cambiar un enlace se edita solo esta lista.
// (En el sitio original esta lista se llamaba HD_MENU, en scripts/base/headerSesion.js)
const MENU = [
  { href: '/', texto: 'ft.inicio' },
  { href: '/museos', texto: 'ft.museos' },
  {
    grupo: 'ft.actividades', id: 'actividades', items: [
      { href: '/charlas', texto: 'charlas.h1', desc: 'nav.charlas.desc', icono: 'fa-microphone-lines' },
      { href: '/cursos', texto: 'cursos.h1', desc: 'nav.cursos.desc', icono: 'fa-palette' },
      { href: '/recorridos', texto: 'ft.recorridos', desc: 'nav.recorridos.desc', icono: 'fa-person-walking' },
      { href: '/calendario', texto: 'nav.calendario', desc: 'nav.calendario.desc', icono: 'fa-calendar-days' },
    ],
  },
  {
    grupo: 'nav.g.explorar', id: 'explorar', items: [
      { href: '/mapa', texto: 'nav.mapa', desc: 'nav.mapa.desc', icono: 'fa-map-location-dot' },
      { href: '/recursos', texto: 'ft.recursos', desc: 'nav.recursos.desc', icono: 'fa-book-open' },
      { href: '/sudamtex', texto: 'ft.sudamtex', desc: 'nav.sudamtex.desc', icono: 'fa-industry' },
    ],
  },
  {
    grupo: 'nav.g.nosotros', id: 'nosotros', items: [
      { href: '/nosotros', texto: 'nav.nosotros', desc: 'nav.nosotros.desc', icono: 'fa-people-group' },
      { href: '/contacto', texto: 'ft.contacto', desc: 'nav.contacto.desc', icono: 'fa-envelope' },
    ],
  },
]

const ESCRITORIO = '(min-width: 1025px)'

function Chevron() {
  return <i className="fa-solid fa-chevron-down hd-chev" aria-hidden="true"></i>
}

// Una página "pertenece" a un grupo si su dirección es la de uno de sus enlaces (o una página de detalle suya).
function grupoActivo(grupo, ruta) {
  return grupo.items.some((item) => ruta === item.href || ruta.startsWith(item.href + '/'))
}

// Iniciales de la persona para el avatar cuando no tiene foto
function iniciales(u) {
  return ((u.nombre || '?').charAt(0) + (u.apellido || '').charAt(0)).toUpperCase()
}

function Avatar({ usuario }) {
  return usuario.foto
    ? <img className="hdr-avatar" src={usuario.foto} alt="" />
    : <span className="hdr-avatar">{iniciales(usuario)}</span>
}

// Franja debajo del encabezado para quienes todavía no confirmaron su correo
function AvisoVerificacion({ usuario }) {
  const { t } = useIdioma()
  const [cerrado, setCerrado] = useState(() => {
    try {
      return sessionStorage.getItem('nc_aviso_cerrado') === '1'
    } catch {
      return false
    }
  })
  const [mensaje, setMensaje] = useState('')
  const [bloqueado, setBloqueado] = useState(false)
  const { actualizarUsuario } = useSesion()

  if (cerrado) return null

  function cerrar() {
    try {
      sessionStorage.setItem('nc_aviso_cerrado', '1')
    } catch {
      /* sin sessionStorage */
    }
    setCerrado(true)
  }

  async function reenviar() {
    setBloqueado(true)
    setMensaje(t('hd.enviando'))
    try {
      const r = await api.reenviarVerificacion()
      if (r.correoVerificado) {
        actualizarUsuario({ ...usuario, correoVerificado: true })
        return
      }
      setMensaje(r.mensaje)
    } catch (error) {
      setMensaje(error.message)
    }
    setTimeout(() => setBloqueado(false), 30000) // evita reenvíos seguidos
  }

  return (
    <div id="avisoVerificacion" className="hd-aviso" role="status">
      <p>
        <i className="fa-solid fa-envelope-circle-check" aria-hidden="true"></i>
        <span>
          <TextoRico clave="hd.confirmaCorreo" vars={{ correo: usuario.correo }} />
          {' '}
          <span id="avisoMensaje">{mensaje}</span>
        </span>
      </p>
      <div className="hd-aviso__acciones">
        <button type="button" className="hd-aviso__btn" onClick={reenviar} disabled={bloqueado}>{t('hd.reenviar')}</button>
        <button type="button" className="hd-aviso__cerrar" onClick={cerrar} aria-label={t('hd.cerrarAviso')}>
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  )
}

function Header() {
  const { t, idioma, cambiarIdioma } = useIdioma()
  // Estado del encabezado:
  const [panelAbierto, setPanelAbierto] = useState(false) // menú hamburguesa (celular)
  const [submenuAbierto, setSubmenuAbierto] = useState(null) // id del desplegable abierto: 'actividades', 'idioma'... o null
  const [conSombra, setConSombra] = useState(false) // sombra suave cuando la página baja
  const headerRef = useRef(null)
  const { pathname } = useLocation()
  const { usuario, esAdmin, salir } = useSesion()
  const navegar = useNavigate()

  // Cambia el idioma de todo el sitio y cierra el desplegable
  function elegirIdioma(codigo) {
    cambiarIdioma(codigo)
    setSubmenuAbierto(null)
  }

  useEffect(() => {
    const alScroll = () => setConSombra(window.scrollY > 4)
    const alClickAfuera = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setSubmenuAbierto(null)
    }
    const alTeclear = (e) => {
      if (e.key === 'Escape') {
        setSubmenuAbierto(null)
        setPanelAbierto(false)
      }
    }
    const pantalla = window.matchMedia(ESCRITORIO)
    const alCambiarPantalla = () => {
      setPanelAbierto(false)
      setSubmenuAbierto(null)
    }

    alScroll()
    window.addEventListener('scroll', alScroll, { passive: true })
    document.addEventListener('click', alClickAfuera)
    document.addEventListener('keydown', alTeclear)
    pantalla.addEventListener('change', alCambiarPantalla)
    return () => {
      window.removeEventListener('scroll', alScroll)
      document.removeEventListener('click', alClickAfuera)
      document.removeEventListener('keydown', alTeclear)
      pantalla.removeEventListener('change', alCambiarPantalla)
    }
  }, [])

  function alternarSubmenu(id) {
    setSubmenuAbierto((actual) => (actual === id ? null : id))
  }

  // Con el teclado, al salir de un submenú de escritorio se cierra solo
  function alSalirDelGrupo(e, id) {
    if (!window.matchMedia(ESCRITORIO).matches) return
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setSubmenuAbierto((actual) => (actual === id ? null : actual))
    }
  }

  // Al hacer clic en cualquier enlace del encabezado se cierran los menús (el cambio de página lo hace el Link)
  function alHacerClic(e) {
    if (e.target.closest('a')) {
      setPanelAbierto(false)
      setSubmenuAbierto(null)
    }
  }

  async function cerrarSesion() {
    await salir()
    navegar('/')
  }

  const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : ''

  return (
    <>
    <header className={`site-header${conSombra ? ' hd-sombra' : ''}`} id="siteHeader" ref={headerRef} onClick={alHacerClic}>
      <a className="hd-saltar" href="#contenido">{t('hd.saltar')}</a>
      <div className="hd-inner">
        <Link className="brand" to="/" aria-label={t('hd.irInicio')}>
          <img src="/img/logo.png" alt={t('hd.logoAlt')} width="138" height="46" />
        </Link>
        <button
          className="hd-toggle"
          type="button"
          aria-expanded={panelAbierto}
          aria-controls="menuPrincipal"
          aria-label={panelAbierto ? t('hd.cerrarMenu') : t('hd.abrirMenu')}
          onClick={() => setPanelAbierto(!panelAbierto)}
        >
          <i className={panelAbierto ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} aria-hidden="true"></i>
        </button>
        <div className={`hd-panel${panelAbierto ? ' abierto' : ''}`} id="menuPrincipal">
          <form className="hd-busqueda-movil" action="/buscar" role="search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <label className="visually-hidden" htmlFor="hdBuscarMovil">{t('hd.buscarSitio')}</label>
            <input type="search" id="hdBuscarMovil" name="q" maxLength={80} placeholder={t('hd.buscarPlaceholder')} />
          </form>
          <nav className="hd-nav" aria-label={t('hd.principal')}>
            <ul>
              {MENU.map((entrada) => {
                if (!entrada.grupo) {
                  return (
                    <li key={entrada.href}>
                      <NavLink className="hd-link" to={entrada.href} end>{t(entrada.texto)}</NavLink>
                    </li>
                  )
                }
                const abierto = submenuAbierto === entrada.id
                return (
                  <li
                    key={entrada.id}
                    className={`hd-grupo${grupoActivo(entrada, pathname) ? ' hd-activo' : ''}`}
                    onBlur={(e) => alSalirDelGrupo(e, entrada.id)}
                  >
                    <button
                      type="button"
                      className="hd-trigger"
                      aria-expanded={abierto}
                      aria-controls={`hd-menu-${entrada.id}`}
                      onClick={() => alternarSubmenu(entrada.id)}
                    >
                      {t(entrada.grupo)} <Chevron />
                    </button>
                    <ul className="hd-sub" id={`hd-menu-${entrada.id}`} hidden={!abierto}>
                      {entrada.items.map((item) => (
                        <li key={item.href}>
                          <NavLink className="hd-sub__link" to={item.href}>
                            <span className="hd-sub__ico"><i className={`fa-solid ${item.icono}`} aria-hidden="true"></i></span>
                            <span className="hd-sub__txt"><strong>{t(item.texto)}</strong><small>{t(item.desc)}</small></span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="hd-derecha">
            <Link className="hd-buscar" to="/buscar" aria-label={t('hd.buscarSitio')} title={t('hd.buscar')}>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            </Link>
            <div className="hd-idioma-zona" id="zonaIdioma">
              <div className="hd-grupo hd-idioma" onBlur={(e) => alSalirDelGrupo(e, 'idioma')}>
                <button
                  type="button"
                  className="hd-trigger"
                  aria-expanded={submenuAbierto === 'idioma'}
                  aria-controls="hd-menu-idioma"
                  aria-label={t('hd.idioma')}
                  onClick={() => alternarSubmenu('idioma')}
                >
                  <i className="fa-solid fa-globe" aria-hidden="true"></i><span className="hd-idioma-cod">{idioma.toUpperCase()}</span><Chevron />
                </button>
                <ul className="hd-sub hd-sub--der" id="hd-menu-idioma" hidden={submenuAbierto !== 'idioma'}>
                  {Object.entries(IDIOMAS).map(([cod, nombre]) => (
                    <li key={cod}>
                      <button
                        type="button"
                        className="hd-sub__link hd-sub__link--simple"
                        aria-current={cod === idioma ? 'true' : undefined}
                        onClick={() => elegirIdioma(cod)}
                      >
                        <span className="hd-sub__ico hd-idioma-cod">{cod.toUpperCase()}</span>
                        <span className="hd-sub__txt"><strong>{nombre}</strong></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="hd-sesion" id="accionesSesion">
              {!usuario ? (
                <>
                  <Link to="/login" className="hd-ingresar">{t('hd.iniciarSesion')}</Link>
                  {' '}
                  <Link to="/registro" className="nc-btn hd-registro">{t('hd.registrarme')}</Link>
                </>
              ) : (
                <div className="hd-grupo hd-usuario" onBlur={(e) => alSalirDelGrupo(e, 'usuario')}>
                  <button
                    type="button"
                    className="hd-trigger hd-cuenta-btn"
                    aria-expanded={submenuAbierto === 'usuario'}
                    aria-controls="hd-menu-usuario"
                    aria-label={t('hd.menuDe', { nombre: nombreCompleto })}
                    onClick={() => alternarSubmenu('usuario')}
                  >
                    <Avatar usuario={usuario} /><span className="hd-nombre">{usuario.nombre}</span><Chevron />
                  </button>
                  <ul className="hd-sub hd-sub--der" id="hd-menu-usuario" hidden={submenuAbierto !== 'usuario'}>
                    <li className="hd-sub__cab"><strong>{nombreCompleto}</strong><small>{usuario.correo || ''}</small></li>
                    {esAdmin && (
                      <li>
                        <NavLink className="hd-sub__link hd-sub__link--simple" to="/admin">
                          <span className="hd-sub__ico"><i className="fa-solid fa-gauge-high" aria-hidden="true"></i></span>
                          <span className="hd-sub__txt"><strong>{t('hd.panelAdmin')}</strong></span>
                        </NavLink>
                      </li>
                    )}
                    <li>
                      <NavLink className="hd-sub__link hd-sub__link--simple" to="/cuenta">
                        <span className="hd-sub__ico"><i className="fa-solid fa-user" aria-hidden="true"></i></span>
                        <span className="hd-sub__txt"><strong>{t('hd.miCuenta')}</strong></span>
                      </NavLink>
                    </li>
                    {!esAdmin && (
                      <li>
                        <NavLink className="hd-sub__link hd-sub__link--simple" to="/mis-inscripciones">
                          <span className="hd-sub__ico"><i className="fa-solid fa-ticket" aria-hidden="true"></i></span>
                          <span className="hd-sub__txt"><strong>{t('hd.misInscripciones')}</strong></span>
                        </NavLink>
                      </li>
                    )}
                    <li>
                      <button type="button" className="hd-sub__link hd-sub__link--simple hd-salir" onClick={cerrarSesion}>
                        <span className="hd-sub__ico"><i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i></span>
                        <span className="hd-sub__txt"><strong>{t('hd.cerrarSesion')}</strong></span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
    {usuario && usuario.correoVerificado === false && pathname !== '/verificar-correo' && (
      <AvisoVerificacion usuario={usuario} />
    )}
    </>
  )
}

export default Header
