import BotonUbicacion from './BotonUbicacion'

function SelectorLugar({ prefijo, etiqueta, museos, lugar, alCambiar }) {
  return (
    <div className="auth-campo" data-lugar="">
      <label htmlFor={`${prefijo}-lugar-select`}>{etiqueta}</label>
      {' '}
      <select id={`${prefijo}-lugar-select`} required value={lugar.sel} onChange={(evento) => alCambiar({ ...lugar, sel: evento.target.value })}>
        <option value="">Elegí un lugar...</option>
        {museos.length > 0 && (
          <optgroup label="Museos de Colonia">
            {museos.map((museo) => <option key={museo.id} value={museo.id}>{museo.nombre}</option>)}
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
          onChange={(evento) => alCambiar({ ...lugar, texto: evento.target.value })}
        />
        {' '}
        <BotonUbicacion lat={lugar.lat} lng={lugar.lng} alCambiar={(ubicacion) => alCambiar({ ...lugar, lat: ubicacion.lat, lng: ubicacion.lng })} texto="Marcar ubicación" />
      </div>
    </div>
  )
}

export default SelectorLugar
