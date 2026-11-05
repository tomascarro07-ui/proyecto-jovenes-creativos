import { useEffect, useRef } from 'react'

// Lista de personas inscriptas a una actividad
function DialogoInscriptos({ inscriptos, alCerrar }) {
  const dialogoRef = useRef(null)

  useEffect(() => {
    const dialogo = dialogoRef.current
    if (!dialogo.open) dialogo.showModal()
    return () => {
      if (dialogo.open) dialogo.close()
    }
  }, [])

  return (
    <dialog ref={dialogoRef} style={{ maxWidth: '90vw', borderRadius: '12px', padding: '1.5rem' }} onCancel={(e) => { e.preventDefault(); alCerrar() }}>
      <h3>Inscriptos ({inscriptos.length})</h3>
      {inscriptos.length === 0
        ? <p>Todavía no hay inscriptos.</p>
        : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th></tr></thead>
              <tbody>
                {inscriptos.map((i, n) => (
                  <tr key={n}><td>{i.nombre}</td><td>{i.correo}</td><td>{i.telefono}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      <button type="button" className="nc-btn" onClick={alCerrar}>Cerrar</button>
    </dialog>
  )
}

export default DialogoInscriptos
