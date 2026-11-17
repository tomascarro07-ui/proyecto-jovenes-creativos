import { useEffect, useRef } from 'react'
import { aNombreDeArchivo, descargarCSV } from '../../utils/csv'

function fechaCorta(iso) {
  const fecha = new Date(iso)
  return isNaN(fecha) ? '' : fecha.toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' })
}

function DialogoInscriptos({ titulo, inscriptos, alCerrar }) {
  const dialogoRef = useRef(null)

  useEffect(() => {
    const dialogo = dialogoRef.current
    if (!dialogo.open) dialogo.showModal()
    return () => {
      if (dialogo.open) dialogo.close()
    }
  }, [])

  function exportar() {
    const filas = [['Nombre', 'Correo', 'Teléfono', 'Inscripto el']]
    inscriptos.forEach((inscripto) => filas.push([inscripto.nombre, inscripto.correo, inscripto.telefono, fechaCorta(inscripto.createdAt)]))
    descargarCSV(`inscriptos-${aNombreDeArchivo(titulo)}.csv`, filas)
  }

  return (
    <dialog ref={dialogoRef} className="admin-dialogo admin-dialogo--ancho" aria-labelledby="inscriptosTitulo" onCancel={(evento) => { evento.preventDefault(); alCerrar() }}>
      <h3 id="inscriptosTitulo">Inscriptos ({inscriptos.length})</h3>
      <p className="admin-dialogo__sub">{titulo}</p>
      {inscriptos.length === 0
        ? <p>Todavía no hay inscriptos.</p>
        : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Inscripto el</th></tr></thead>
              <tbody>
                {inscriptos.map((inscripto, posicion) => (
                  <tr key={posicion}><td>{inscripto.nombre}</td><td>{inscripto.correo}</td><td>{inscripto.telefono}</td><td>{fechaCorta(inscripto.createdAt)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      <div className="admin-dialogo__acciones">
        {inscriptos.length > 0 && (
          <button type="button" className="nc-btn nc-btn--outline" onClick={exportar}>
            <i className="fa-solid fa-file-csv" aria-hidden="true"></i>
            {' '}
            Descargar planilla
          </button>
        )}
        <button type="button" className="nc-btn" onClick={alCerrar} autoFocus>Cerrar</button>
      </div>
    </dialog>
  )
}

export default DialogoInscriptos
