import BotonUbicacion from './BotonUbicacion'

// Campo "Lugar" de los formularios: un museo de la lista u "otro lugar" (con nombre y ubicación en el mapa).
// "lugar" es { sel, texto, lat, lng } (ver utils/lugar.js) y "alCambiar" recibe el lugar nuevo.
function SelectorLugar({ prefijo, etiqueta, museos, lugar, alCambiar }) {
  return (
    <div className="auth-campo" data-lugar="">
      <label htmlFor={`${prefijo}-lugar-select`}>{etiqueta}</label>
      {' '}
      <select id={`${prefijo}-lugar-select`} required value={lugar.sel} onChange={(e) => alCambiar({ ...lugar, sel: e.target.value })}>
        <option value="">Elegí un lugar...</option>
        {museos.length > 0 && (
          <optgroup label="Museos de Colonia">
            {museos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </optgroup>
        )}
        <option value="otro">Otro lugar (marcar en el mapa)</option>
      </select>
      <div className="lugar-otro" hidden={lugar.sel !== 'otro'}>
        <input
          type="text"
          maxLength="120"
          placeholder="Nombre del lugar (ej: Plaza Mayor)"
          value={lugar.texto}
          onChange={(e) => alCambiar({ ...lugar, texto: e.target.value })}
        />
        {' '}
        <BotonUbicacion lat={lugar.lat} lng={lugar.lng} alCambiar={(u) => alCambiar({ ...lugar, lat: u.lat, lng: u.lng })} texto="Marcar ubicación" />
      </div>
    </div>
  )
}

export default SelectorLugar
