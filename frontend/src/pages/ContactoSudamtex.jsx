import '../css/sudamtex.css'
import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEfectosSudamtex } from '../hooks/useEfectosSudamtex'
import { api } from '../api'

function ContactoSudamtex() {
  const raizRef = useRef(null)
  const [menuAbierto, setMenuAbierto] = useState(false) // menú del encabezado en celulares
  const cerrarMenu = useCallback(() => setMenuAbierto(false), [])
  useEfectosSudamtex(raizRef, cerrarMenu)

  // Formulario de contacto
  const [datos, setDatos] = useState({ nombre: '', email: '', motivo: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [estado, setEstado] = useState(null) // { texto, esError }

  function alCambiar(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  async function alEnviar(e) {
    e.preventDefault()
    setEnviando(true)
    setEstado(null)
    try {
      const r = await api.contactoSudamtex(datos)
      setEstado({ texto: (r && r.mensaje) || '¡Mensaje enviado! Te respondemos por correo.', esError: false })
      setDatos({ nombre: '', email: '', motivo: '', mensaje: '' })
    } catch (err) {
      setEstado({ texto: err.message || 'No se pudo enviar. Probá de nuevo.', esError: true })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="sx" ref={raizRef}>
      <a href="#contenido" className="sx-saltar">Saltar al contenido</a>
      {/* ============ Header propio de Sudamtex ============ */}
      <header className="sx-header">
        <div className="sx-header__interno">
          <Link to="/sudamtex" className="sx-marca" aria-label="Sudamtex, ir al inicio">
            <svg className="sx-marca__carretel" viewBox="0 0 32 32" aria-hidden="true">
              <rect x="5" y="3" width="22" height="4" rx="1.5" fill="currentColor" />
              {' '}
              <rect x="5" y="25" width="22" height="4" rx="1.5" fill="currentColor" />
              {' '}
              <rect x="9" y="7" width="14" height="18" fill="#f2b705" />
              {' '}
              <path d="M9 11h14M9 15h14M9 19h14" stroke="#0d1b3e" strokeWidth="1.4" />
            </svg>
            {' '}
            <span className="sx-marca__texto">SUDAMTEX</span>
          </Link>
          {' '}
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
            onClick={(e) => { if (e.target.closest('a')) cerrarMenu() }}
          >
            <ul>
              <li>
                <Link to="/sudamtex#resultados">Resultados esperados</Link>
              </li>
              <li>
                <Link to="/sudamtex#impacto">Impacto esperado</Link>
              </li>
              <li>
                <Link to="/contacto-sudamtex" aria-current="page">Contacto</Link>
              </li>
            </ul>
            <Link to="/" className="sx-volver">
              <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
              {' '}
              Nodo Cultural
            </Link>
          </nav>
        </div>
      </header>
      <main id="contenido">
        {/* ============ Portada compacta ============ */}
        <section className="sx-hero sx-hero--compacto" aria-labelledby="sxTitulo">
          <div className="sx-hero__interno">
            <div className="sx-hero__texto">
              <nav className="sx-migas sx-mono" aria-label="Ubicación en el sitio">
                <Link to="/sudamtex">Sudamtex</Link>
                {' '}
                <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                {' '}
                <span aria-current="page">Contacto</span>
              </nav>
              <h1 id="sxTitulo">Contacto</h1>
              <p className="sx-hero__lead">
                Escribinos si querés aportar material, compartir un testimonio o consultar por el material educativo del proyecto.
              </p>
            </div>
          </div>
        </section>
        <div className="sx-cinta" aria-hidden="true"></div>
        {/* ============ Formulario ============ */}
        <section className="sx-seccion sx-contacto">
          <div className="sx-contenedor sx-contacto__grid">
            <div className="sx-form-caja sx-reveal" id="formulario">
              <p className="sx-mono sx-form-caja__eyebrow">Formulario de contacto</p>
              <h2 id="formTitulo">Envianos tu mensaje</h2>
              <form id="form-sudamtex-contacto" className="sx-form" aria-labelledby="formTitulo" onSubmit={alEnviar}>
                <div className="sx-fila">
                  <div className="sx-campo">
                    <label htmlFor="nombre">Nombre</label>
                    {' '}
                    <input type="text" id="nombre" name="nombre" maxLength="60" autoComplete="name" placeholder="Tu nombre" required value={datos.nombre} onChange={alCambiar} />
                  </div>
                  <div className="sx-campo">
                    <label htmlFor="email">Correo electrónico</label>
                    {' '}
                    <input type="email" id="email" name="email" maxLength="120" autoComplete="email" placeholder="tucorreo@ejemplo.com" required value={datos.email} onChange={alCambiar} />
                  </div>
                </div>
                <div className="sx-campo">
                  <label htmlFor="motivo">Motivo</label>
                  {' '}
                  <select id="motivo" name="motivo" required value={datos.motivo} onChange={alCambiar}>
                    <option value="" disabled>Elegí una opción</option>
                    <option value="aporte">Quiero aportar documentos, fotos u objetos</option>
                    <option value="testimonio">Tengo un testimonio para compartir</option>
                    <option value="educacion">Consulta sobre material educativo</option>
                    <option value="otro">Otra consulta</option>
                  </select>
                </div>
                <div className="sx-campo">
                  <label htmlFor="mensaje">Mensaje</label>
                  {' '}
                  <textarea id="mensaje" name="mensaje" rows="6" maxLength="2000" placeholder="Contanos en qué podemos ayudarte." required value={datos.mensaje} onChange={alCambiar}></textarea>
                  <p className="sx-contador sx-mono" id="contador" aria-hidden="true">{datos.mensaje.length} / 2000</p>
                </div>
                {estado && (
                  <p id="sxEstado" className="sx-estado" role="status" aria-live="polite" style={{ color: estado.esError ? '#a2492a' : '#2f6b3a' }}>
                    {estado.texto}
                  </p>
                )}
                <button type="submit" className="sx-btn sx-btn--tinta" id="sxEnviar" disabled={enviando}>
                  <i className="fa-solid fa-paper-plane" aria-hidden="true"></i>
                  {' '}
                  <span>{enviando ? 'Enviando...' : 'Enviar mensaje'}</span>
                </button>
              </form>
              <div className="sx-exito" id="sxExito" tabIndex="-1" hidden>
                <span className="sx-exito__sello" aria-hidden="true">
                  <i className="fa-solid fa-check"></i>
                </span>
                <h3>¡Mensaje enviado!</h3>
                <p id="sxExitoTexto">Recibimos tu consulta y te vamos a responder pronto.</p>
                <div className="sx-exito__botones">
                  <button type="button" className="sx-btn sx-btn--tinta" id="sxOtro">Enviar otro mensaje</button>
                  {' '}
                  <Link to="/sudamtex" className="sx-btn sx-btn--contorno">Volver a Sudamtex</Link>
                </div>
              </div>
            </div>
            <aside className="sx-vias sx-reveal" aria-labelledby="viasTitulo" style={{ "--i": "1" }}>
              <h2 id="viasTitulo">Formas de participar</h2>
              <ul>
                <li>
                  <a href="#formulario" className="sx-via" data-motivo="aporte">
                    <span className="sx-via__ico">
                      <i className="fa-solid fa-box-archive" aria-hidden="true"></i>
                    </span>
                    {' '}
                    <span>
                      <strong>Aportá material</strong>
                      Documentos, fotos u objetos relacionados con la fábrica.
                    </span>
                  </a>
                </li>
                <li>
                  <a href="#formulario" className="sx-via" data-motivo="testimonio">
                    <span className="sx-via__ico">
                      <i className="fa-solid fa-microphone-lines" aria-hidden="true"></i>
                    </span>
                    {' '}
                    <span>
                      <strong>Compartí tu testimonio</strong>
                      Tu relato puede integrar el banco audiovisual de testimonios.
                    </span>
                  </a>
                </li>
                <li>
                  <a href="#formulario" className="sx-via" data-motivo="educacion">
                    <span className="sx-via__ico">
                      <i className="fa-solid fa-graduation-cap" aria-hidden="true"></i>
                    </span>
                    {' '}
                    <span>
                      <strong>Sumá a tu centro de enseñanza</strong>
                      Consultá por el material educativo del proyecto.
                    </span>
                  </a>
                </li>
              </ul>
              <p className="sx-vias__nota">
                <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                {' '}
                Tu mensaje llega al equipo de Nodo Cultural y te respondemos por correo.
              </p>
            </aside>
          </div>
        </section>
      </main>
      {/* ============ Footer propio ============ */}
      <footer className="sx-footer">
        <div className="sx-footer__interno">
          <div>
            <p className="sx-footer__marca">SUDAMTEX</p>
            <p className="sx-footer__sub">Un apartado de Nodo Cultural</p>
          </div>
          <ul className="sx-footer__links">
            <li>
              <Link to="/sudamtex">Sudamtex</Link>
            </li>
            <li>
              <Link to="/">Nodo Cultural</Link>
            </li>
            <li>
              <Link to="/museos">Museos</Link>
            </li>
            <li>
              <Link to="/contacto-sudamtex">Contacto</Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  )
}

export default ContactoSudamtex
