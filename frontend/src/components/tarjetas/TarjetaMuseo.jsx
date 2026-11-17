import { Link } from 'react-router-dom'
import { useIdioma } from '../../hooks/useIdioma'
import { tieneImagen } from '../../utils/leaflet'
import { museoCerrado } from '../../utils/museos'

function TarjetaMuseo({ museo }) {
  const { t } = useIdioma()
  const cerrado = museoCerrado(museo)
  return (
    <Link className="mu-card" to={`/museos/${museo.id}`}>
      <div className="mu-card__media">
        {tieneImagen(museo)
          ? <img src={museo.imagen} alt="" loading="lazy" />
          : <i className="fa-solid fa-landmark" aria-hidden="true"></i>}
      </div>
      <div className="mu-card__cuerpo">
        <span className="mu-card__tipo">{museo.tipo}</span>
        <strong className="mu-card__nombre">{museo.nombre}</strong>
        {museo.gancho && <p className="mu-card__gancho">{museo.gancho}</p>}
        {museo.direccion && <span className="mu-card__dato"><i className="fa-solid fa-location-dot" aria-hidden="true"></i>{museo.direccion}</span>}
        {museo.horario && <span className="mu-card__dato"><i className="fa-regular fa-clock" aria-hidden="true"></i>{museo.horario}</span>}
        {cerrado && <span className="mu-aviso">{t('museos.cerrado')}</span>}
      </div>
    </Link>
  )
}

export default TarjetaMuseo
