import { Link } from 'react-router-dom'
import { separarFecha } from '../../utils/fechas'
import { useIdioma } from '../../hooks/useIdioma'

// Tarjeta de charla de la portada (clase act-card).
function TarjetaCharla({ charla }) {
  const { t } = useIdioma()
  const fecha = separarFecha(charla.fecha)
  return (
    <article className="act-card">
      <div className="act-card__media">
        <img src={charla.imagen} alt={charla.titulo} />
        <span className="act-fecha"><strong>{fecha.dia}</strong>{fecha.mes}</span>
      </div>
      <div className="act-card__info">
        <span className="act-tipo">{t('act.charla')}</span>
        <h3>{charla.titulo}</h3>
        <p>{charla.descripcionCorta}</p>
        <p><i className="fa-solid fa-location-dot"></i> {charla.lugar}</p>
        <Link to={`/charlas/${charla.id}`} className="nc-btn nc-btn--outline nc-btn--mini">{t('act.verMas')}</Link>
      </div>
    </article>
  )
}

export default TarjetaCharla
