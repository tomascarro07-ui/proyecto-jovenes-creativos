import { Link } from 'react-router-dom'
import PildoraCupos from './PildoraCupos'
import { separarFecha } from '../../utils/fechas'
import { useIdioma } from '../../hooks/useIdioma'

// Tarjeta de una actividad (charla, taller o recorrido) del listado.
function TarjetaActividad({ item }) {
  const { t } = useIdioma()
  const fecha = separarFecha(item.fecha)
  return (
    <article className="ac-tarjeta">
      <div className="ac-tarjeta__media">
        {item.imagen && <img src={item.imagen} alt="" />}
        {fecha.dia !== '' && (
          <span className="ac-fecha">
            <strong>{fecha.dia}</strong>
            {fecha.mes}
          </span>
        )}
        <span className="ac-chip">{item.chip}</span>
      </div>
      <div className="ac-tarjeta__cuerpo">
        <h3>{item.titulo}</h3>
        <p>{item.descripcion}</p>
        <ul className="ac-meta">
          {item.meta.map((m) => (
            <li key={m.icono}><i className={m.icono} aria-hidden="true"></i> {m.texto}</li>
          ))}
        </ul>
        <div className="ac-tarjeta__pie">
          <PildoraCupos actividad={item} />
          <Link to={item.enlace} className="nc-btn nc-btn--outline nc-btn--mini">
            {t('act.verMas')} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </Link>
        </div>
      </div>
    </article>
  )
}

export default TarjetaActividad
