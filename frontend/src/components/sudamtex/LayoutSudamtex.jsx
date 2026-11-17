import '../../css/sudamtex.css'
import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEfectosSudamtex } from '../../hooks/useEfectosSudamtex'

function LayoutSudamtex({ activa, children }) {
  const raizRef = useRef(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const cerrarMenu = useCallback(() => setMenuAbierto(false), [])
  useEfectosSudamtex(raizRef, cerrarMenu)
  const enInicio = activa === 'inicio'

  return (
    <div className="sx" ref={raizRef}>
      <a href="#contenido" className="sx-saltar">Saltar al contenido</a>
      <header className="sx-header">
        <div className="sx-header__interno">
          <Link to="/sudamtex" className="sx-marca" aria-label="Sudamtex, ir al inicio">
            <svg className="sx-marca__carretel" viewBox="0 0 32 32" aria-hidden="true">
              <rect x="5" y="3" width="22" height="4" rx="1.5" fill="currentColor" />
              <rect x="5" y="25" width="22" height="4" rx="1.5" fill="currentColor" />
              <rect x="9" y="7" width="14" height="18" fill="#f2b705" />
              <path d="M9 11h14M9 15h14M9 19h14" stroke="#0d1b3e" strokeWidth="1.4" />
            </svg>
            <span className="sx-marca__texto">SUDAMTEX</span>
          </Link>
          <button
            className="sx-toggle"
            type="button"
            aria-expanded={menuAbierto}
            aria-controls="sxNav"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <i className={menuAbierto ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} aria-hidden="true"></i>
          </button>
          <nav
            className={`sx-nav${menuAbierto ? ' sx-nav--abierto' : ''}`}
            id="sxNav"
            aria-label="Secciones de Sudamtex"
            onClick={(evento) => { if (evento.target.closest('a')) cerrarMenu() }}
          >
            <ul>
              {enInicio ? (
                <>
                  <li><a href="#resultados">Resultados esperados</a></li>
                  <li><a href="#impacto">Impacto esperado</a></li>
                  <li><a href="#participa">Participá</a></li>
                  <li><a href="#historia">Historia</a></li>
                </>
              ) : (
                <>
                  <li><Link to="/sudamtex#resultados">Resultados esperados</Link></li>
                  <li><Link to="/sudamtex#impacto">Impacto esperado</Link></li>
                  <li><Link to="/contacto-sudamtex" aria-current="page">Contacto</Link></li>
                </>
              )}
            </ul>
            <Link to="/" className="sx-volver">
              <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
              {' '}
              Nodo Cultural
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="sx-footer">
        <div className="sx-footer__interno">
          <div>
            <p className="sx-footer__marca">SUDAMTEX</p>
            <p className="sx-footer__sub">Un apartado de Nodo Cultural</p>
          </div>
          <ul className="sx-footer__links">
            {!enInicio && <li><Link to="/sudamtex">Sudamtex</Link></li>}
            <li><Link to="/">Nodo Cultural</Link></li>
            <li><Link to="/museos">Museos</Link></li>
            <li>{enInicio ? <Link to="/contacto">Contacto</Link> : <Link to="/contacto-sudamtex">Contacto</Link>}</li>
          </ul>
        </div>
      </footer>
    </div>
  )
}

export default LayoutSudamtex
