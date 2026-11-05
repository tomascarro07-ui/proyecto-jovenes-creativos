import { Link } from 'react-router-dom'
import { useIdioma } from '../../hooks/useIdioma'

// Tarjeta de taller. Con conDescripcion=true es la del listado de Cursos; sin ella, la de la portada.
function TarjetaTaller({ taller, conDescripcion = false }) {
  const { t, tDato } = useIdioma()
  return (
    <article className="curso-mini">
      <div className="curso-mini__media">
        <img src={taller.imagen} alt={taller.titulo} />
      </div>
      <div className="curso-mini__info">
        <h3>{taller.titulo}</h3>
        <p className="curso-mini__meta">
          <span><i className="fa-regular fa-clock"></i>{taller.cantClases}</span>
          <span><i className="fa-solid fa-location-dot"></i>{tDato(taller.modalidad)}</span>
        </p>
        {conDescripcion && <p>{taller.descripcionCorta}</p>}
        <Link to={`/cursos/${taller.id}`} className="nc-btn nc-btn--outline nc-btn--mini">
          {conDescripcion ? t('act.verMas') : t('act.inscribirme')}
        </Link>
      </div>
    </article>
  )
}

export default TarjetaTaller
