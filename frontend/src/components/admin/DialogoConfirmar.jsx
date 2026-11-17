import { useEffect, useRef } from 'react'

function DialogoConfirmar({ titulo, mensaje, textoConfirmar = 'Eliminar', alConfirmar, alCancelar }) {
  const dialogoRef = useRef(null)

  useEffect(() => {
    const dialogo = dialogoRef.current
    if (!dialogo.open) dialogo.showModal()
    return () => {
      if (dialogo.open) dialogo.close()
    }
  }, [])

  return (
    <dialog ref={dialogoRef} className="admin-dialogo" aria-labelledby="confirmarTitulo" onCancel={(evento) => { evento.preventDefault(); alCancelar() }}>
      <h3 id="confirmarTitulo">{titulo}</h3>
      <p>{mensaje}</p>
      <div className="admin-dialogo__acciones">
        <button type="button" className="nc-btn nc-btn--outline" onClick={alCancelar} autoFocus>Cancelar</button>
        <button type="button" className="nc-btn nc-btn--peligro" onClick={alConfirmar}>{textoConfirmar}</button>
      </div>
    </dialog>
  )
}

export default DialogoConfirmar
