import { useEffect, useRef, useState } from 'react'

// Ventana para asignar un lugar a algo ya cargado: un museo u "otro lugar" (antes: elegirLugar en selectorLugar.js).
// alElegir recibe { museo: id } o { otro: true }; alCancelar no recibe nada.
function DialogoLugar({ museos, actual, alElegir, alCancelar }) {
  const dialogoRef = useRef(null)
  const inicial = actual && actual.museo ? actual.museo : (actual && actual.lat != null ? 'otro' : '')
  const [seleccion, setSeleccion] = useState(inicial)

  useEffect(() => {
    const dialogo = dialogoRef.current
    if (!dialogo.open) dialogo.showModal()
    return () => {
      if (dialogo.open) dialogo.close()
    }
  }, [])

  function continuar() {
    if (!seleccion) return
    if (seleccion === 'otro') alElegir({ otro: true })
    else alElegir({ museo: seleccion })
  }

  return (
    <dialog ref={dialogoRef} className="ubic-dialogo ubic-dialogo--lugar" onCancel={(e) => { e.preventDefault(); alCancelar() }}>
      <h3>¿Dónde se realiza?</h3>
      <p>Elegí un museo o marcá otra ubicación en el mapa.</p>
      <select className="ubic-select" value={seleccion} onChange={(e) => setSeleccion(e.target.value)}>
        <option value="">Elegí un lugar...</option>
        <optgroup label="Museos de Colonia">
          {museos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </optgroup>
        <option value="otro">Otro lugar (marcar en el mapa)</option>
      </select>
      <div className="ubic-acciones">
        <span className="ubic-coord"></span>
        <button type="button" className="nc-btn nc-btn--outline" onClick={alCancelar}>Cancelar</button>
        <button type="button" className="nc-btn" onClick={continuar}>Continuar</button>
      </div>
    </dialog>
  )
}

export default DialogoLugar
