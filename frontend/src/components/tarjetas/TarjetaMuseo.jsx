import { Link } from 'react-router-dom'

// Ficha de museo del listado. Si el museo no tiene imagen se muestra un icono.
function TarjetaMuseo({ museo }) {
  const tieneImagen = museo.imagen && museo.imagen !== 'IMAGEN_MUSEO'
  return (
    <Link className="mf-card" to={`/museos/${museo.id}`}>
      <div className="mf-card__media">
        {tieneImagen
          ? <img src={museo.imagen} alt="" loading="lazy" />
          : <span className="mf-card__ico"><i className="fa-solid fa-landmark" aria-hidden="true"></i></span>}
      </div>
      <div className="mf-card__texto">
        <small>{museo.tipo}</small>
        <strong>{museo.nombre}</strong>
        {museo.direccion && <span><i className="fa-solid fa-location-dot" aria-hidden="true"></i> {museo.direccion}</span>}
        {museo.horario && <span><i className="fa-regular fa-clock" aria-hidden="true"></i> {museo.horario}</span>}
      </div>
    </Link>
  )
}

export default TarjetaMuseo
