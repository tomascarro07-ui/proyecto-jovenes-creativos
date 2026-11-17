import { useState } from 'react'
import { Link } from 'react-router-dom'
import LayoutSudamtex from '../components/sudamtex/LayoutSudamtex'
import { api } from '../api'

function ContactoSudamtex() {
  const [datos, setDatos] = useState({ nombre: '', email: '', motivo: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [estado, setEstado] = useState(null)

  function alCambiar(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value })
  }

  async function alEnviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setEstado(null)
    try {
      const respuesta = await api.contactoSudamtex(datos)
      setEstado({ texto: (respuesta && respuesta.mensaje) || '¡Mensaje enviado! Te respondemos por correo.', esError: false })
      setDatos({ nombre: '', email: '', motivo: '', mensaje: '' })
    } catch (err) {
      setEstado({ texto: err.message || 'No se pudo enviar. Probá de nuevo.', esError: true })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <LayoutSudamtex activa="contacto">
      <main id="contenido">
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
    </LayoutSudamtex>
  )
}

export default ContactoSudamtex
