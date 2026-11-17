import { useEffect, useRef, useState } from 'react'
import { CENTRO_COLONIA, LIMITES_COLONIA, capaBase, capaCalles } from '../../utils/leaflet'

const formato = (ll) => ll.lat.toFixed(6) + ', ' + ll.lng.toFixed(6)

function leerCoordenadas(texto) {
  const numeros = texto.replace(/−/g, '-').match(/-?\d+(?:\.\d+)?/g)
  if (!numeros || numeros.length < 2) return null
  return { lat: Number(numeros[0]), lng: Number(numeros[1]) }
}

function DialogoUbicacion({ inicial, alConfirmar, alCancelar }) {
  const dialogoRef = useRef(null)
  const mapaDivRef = useRef(null)
  const mapaRef = useRef(null)
  const marcadorRef = useRef(null)
  const [texto, setTexto] = useState(inicial ? formato(inicial) : '')
  const [error, setError] = useState('')
  const [punto, setPunto] = useState(inicial || null)

  useEffect(() => {
    const L = window.L
    const dialogo = dialogoRef.current
    if (!dialogo.open) dialogo.showModal()
    const mapa = L.map(mapaDivRef.current, {
      center: inicial ? [inicial.lat, inicial.lng] : CENTRO_COLONIA,
      zoom: inicial ? 17 : 15,
      minZoom: 12,
      maxZoom: 18,
      maxBounds: LIMITES_COLONIA,
    })
    capaBase().addTo(mapa)
    capaCalles().addTo(mapa)
    const espera = setTimeout(() => mapa.invalidateSize(), 60)
    mapa.on('click', (evento) => {
      setTexto(formato(evento.latlng))
      setError('')
      setPunto({ lat: evento.latlng.lat, lng: evento.latlng.lng })
    })
    mapaRef.current = mapa
    return () => {
      clearTimeout(espera)
      mapa.remove()
      mapaRef.current = null
      marcadorRef.current = null
      if (dialogo.open) dialogo.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const L = window.L
    const mapa = mapaRef.current
    if (!mapa || !punto) return
    if (marcadorRef.current) {
      marcadorRef.current.setLatLng([punto.lat, punto.lng])
    } else {
      const marcador = L.marker([punto.lat, punto.lng], { draggable: true }).addTo(mapa)
      marcador.on('dragend', () => {
        const posicion = marcador.getLatLng()
        setTexto(formato(posicion))
        setError('')
        setPunto({ lat: posicion.lat, lng: posicion.lng })
      })
      marcadorRef.current = marcador
    }
  }, [punto])

  function alEscribir(evento) {
    const L = window.L
    const valor = evento.target.value
    setTexto(valor)
    if (!valor.trim()) {
      setError('')
      return
    }
    const coordenadas = leerCoordenadas(valor.trim())
    if (!coordenadas) {
      setError('Escribí latitud y longitud, por ejemplo: -34.472171, -57.855030')
      return
    }
    if (Math.abs(coordenadas.lat) > 90 || Math.abs(coordenadas.lng) > 180) {
      setError('Coordenadas fuera de rango. ¿Invertiste latitud y longitud?')
      return
    }
    const ll = L.latLng(coordenadas.lat, coordenadas.lng)
    if (!L.latLngBounds(LIMITES_COLONIA).contains(ll)) {
      setError('Esa ubicación queda fuera de la zona de Colonia del Sacramento.')
      return
    }
    setError('')
    setPunto({ lat: coordenadas.lat, lng: coordenadas.lng })
    mapaRef.current.setView(ll, 18)
  }

  return (
    <dialog ref={dialogoRef} className="ubic-dialogo" onCancel={(evento) => { evento.preventDefault(); alCancelar() }}>
      <h3>Marcá la ubicación</h3>
      <p>Pegá las coordenadas o hacé clic en el mapa.</p>
      <div className="ubic-campo">
        <input
          type="text"
          className="ubic-input"
          inputMode="decimal"
          autoComplete="off"
          placeholder="Ej: -34.472171, -57.855030"
          aria-label="Coordenadas (latitud, longitud)"
          value={texto}
          onChange={alEscribir}
        />
      </div>
      <small className="ubic-error" role="alert">{error}</small>
      <div className="ubic-mapa" ref={mapaDivRef}></div>
      <div className="ubic-acciones">
        <span className="ubic-coord">{punto ? formato(punto) : 'Sin marcar'}</span>
        <button type="button" className="nc-btn nc-btn--outline" onClick={alCancelar}>Cancelar</button>
        <button
          type="button"
          className="nc-btn"
          disabled={!punto}
          onClick={() => alConfirmar({ lat: Number(punto.lat.toFixed(6)), lng: Number(punto.lng.toFixed(6)) })}
        >
          Confirmar
        </button>
      </div>
    </dialog>
  )
}

export default DialogoUbicacion
