import { useState } from 'react'
import DialogoUbicacion from './DialogoUbicacion'

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
          alConfirmar={(ubicacion) => { alCambiar(ubicacion); setAbierto(false) }}
          alCancelar={() => setAbierto(false)}
        />
      )}
    </>
  )
}

export default BotonUbicacion
