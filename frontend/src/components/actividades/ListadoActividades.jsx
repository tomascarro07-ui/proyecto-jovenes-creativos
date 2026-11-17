import Destacada from './Destacada'
import TarjetaActividad from './TarjetaActividad'
import EstadoCarga from '../EstadoCarga'

function ListadoActividades({ items, cargando, error, mensajeVacio, etiquetaDestacada }) {
  const lista = items || []
  const destacada = lista.find((actividad) => actividad.destacada && !actividad.finalizada)
  const resto = lista.filter((actividad) => actividad !== destacada)
  return (
    <div className="ac-listado">
      <EstadoCarga cargando={cargando} error={error} vacio={items && items.length === 0} mensajeVacio={mensajeVacio}>
        {destacada && <Destacada item={destacada} etiqueta={etiquetaDestacada} />}
        {resto.length > 0 && (
          <div className="ac-grid">
            {resto.map((actividad) => (
              <TarjetaActividad key={actividad.id} item={actividad} />
            ))}
          </div>
        )}
      </EstadoCarga>
    </div>
  )
}

export default ListadoActividades
