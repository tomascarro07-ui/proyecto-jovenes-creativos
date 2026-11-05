import { Link } from 'react-router-dom'

// Una fila de las listas del panel (charlas, talleres, recorridos y museos) con sus botones de acción.
// Props: fila (los datos para mostrar), enlace (página de detalle), finalizada,
// alEliminar, alFinalizar (opcional: los museos no se finalizan), alVerInscriptos y alUbicar (opcionales)
// y alDestacar (opcional: charlas, talleres y recorridos; destacada indica si ya lo está)
function ItemAdmin({ imagen, titulo, etiqueta, texto, enlace, finalizada, tituloFinalizar, destacada, alDestacar, alEliminar, alFinalizar, alVerInscriptos, alUbicar, tituloUbicar = 'Ubicar en el mapa' }) {
  return (
    <article className={finalizada ? 'admin-item admin-item--finalizada' : 'admin-item'}>
      {imagen && <img src={imagen} alt={titulo} className="admin-item-img" />}
      <div className="admin-item-info">
        {etiqueta && <span className="admin-item-fecha">{etiqueta}</span>}
        <h4>{titulo}</h4>
        <p>{texto}</p>
      </div>
      <div className="admin-item-acciones">
        <Link to={enlace} className="admin-btn-ver" title="Ver detalle">
          <i className="fa-solid fa-eye"></i>
        </Link>
        {alUbicar && !alFinalizar && (
          <button type="button" className="admin-btn-ver" onClick={alUbicar} title={tituloUbicar}>
            <i className="fa-solid fa-location-crosshairs"></i>
          </button>
        )}
        <button type="button" className="admin-btn-eliminar" onClick={alEliminar} title="Eliminar">
          <i className="fa-solid fa-trash"></i>
        </button>
        {alFinalizar && (
          <button type="button" className={finalizada ? 'admin-btn-check activo' : 'admin-btn-check'} onClick={alFinalizar} title={tituloFinalizar}>
            <i className="fa-solid fa-check"></i>
          </button>
        )}
        {alDestacar && (
          <button
            type="button"
            className={destacada ? 'admin-btn-destacar activo' : 'admin-btn-destacar'}
            onClick={alDestacar}
            aria-pressed={!!destacada}
            title={destacada ? 'Quitar de destacada' : 'Marcar como destacada (se muestra en grande al principio)'}
          >
            <i className="fa-solid fa-star"></i>
          </button>
        )}
        {alVerInscriptos && (
          <button type="button" className="admin-btn-ver" onClick={alVerInscriptos} title="Ver inscriptos">
            <i className="fa-solid fa-users"></i>
          </button>
        )}
        {alUbicar && alFinalizar && (
          <button type="button" className="admin-btn-ver" onClick={alUbicar} title={tituloUbicar}>
            <i className="fa-solid fa-location-crosshairs"></i>
          </button>
        )}
      </div>
    </article>
  )
}

export default ItemAdmin
