import Destacada from './Destacada'
import TarjetaActividad from './TarjetaActividad'
import EstadoCarga from '../EstadoCarga'

// Listado de una sección: la actividad destacada (si hay una y no terminó) en grande,
// y el resto como tarjetas.
// items: lista de actividades ya "normalizadas" por cada página:
//   { id, enlace, imagen, titulo, descripcion, fecha, chip, meta: [{ icono, texto }], cupos, finalizada, destacada, boton }
function ListadoActividades({ items, cargando, error, mensajeVacio, etiquetaDestacada }) {
  const lista = items || []
  const destacada = lista.find((i) => i.destacada && !i.finalizada)
  const resto = lista.filter((i) => i !== destacada)
  return (
    <div className="ac-listado">
      <EstadoCarga cargando={cargando} error={error} vacio={items && items.length === 0} mensajeVacio={mensajeVacio}>
        {destacada && <Destacada item={destacada} etiqueta={etiquetaDestacada} />}
        {resto.length > 0 && (
          <div className="ac-grid">
            {resto.map((i) => (
              <TarjetaActividad key={i.id} item={i} />
            ))}
          </div>
        )}
      </EstadoCarga>
    </div>
  )
}

export default ListadoActividades
