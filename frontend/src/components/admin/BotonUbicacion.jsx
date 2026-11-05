import { useState } from 'react'
import DialogoUbicacion from './DialogoUbicacion'

// Botón "Marcar ubicación" + estado ("Sin ubicación" / "Ubicación marcada (lat, lng)").
// "valor" es { lat, lng } (o lat null si no hay) y "alCambiar" recibe { lat, lng }.
function BotonUbicacion({ lat, lng, alCambiar, texto }) {
  const [abierto, setAbierto] = useState(false)
  const marcada = lat !== null && lat !== undefined

  return (
    <>
      <button type="button" className="nc-btn nc-btn--outline" onClick={() => setAbierto(true)}>
        <i className="fa-solid fa-location-dot"></i>
        {' '}
        {texto}
      </button>
      {' '}
      <small className={`ubic-estado${marcada ? ' ubic-ok' : ''}`}>
        {marcada ? `Ubicación marcada (${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)})` : 'Sin ubicación'}
      </small>
      {abierto && (
        <DialogoUbicacion
          inicial={marcada ? { lat: Number(lat), lng: Number(lng) } : null}
          alConfirmar={(r) => { alCambiar(r); setAbierto(false) }}
          alCancelar={() => setAbierto(false)}
        />
      )}
    </>
  )
}

export default BotonUbicacion
