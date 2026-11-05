import { Link } from 'react-router-dom'
import { useIdioma } from '../hooks/useIdioma'

// Página 404: se muestra cuando la dirección no coincide con ninguna ruta del sitio.
function NoEncontrada() {
  const { t } = useIdioma()
  return (
    <main id="contenido" className="insc-main">
      <div className="insc-vacio">
        <i className="fa-solid fa-compass" aria-hidden="true"></i>
        <h1>{t('nf.titulo')}</h1>
        <p>{t('nf.texto')}</p>
        <p>
          <Link to="/" className="insc-btn insc-btn--primario">{t('nf.inicio')}</Link>
          {' '}
          <Link to="/buscar" className="insc-btn">{t('nf.buscar')}</Link>
        </p>
      </div>
    </main>
  )
}

export default NoEncontrada
