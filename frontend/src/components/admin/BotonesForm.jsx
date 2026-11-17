function BotonesForm({ editando, textoAgregar, enviando = false, alCancelar }) {
  let iconoDelBoton = 'fa-solid fa-plus'
  let textoDelBoton = textoAgregar
  if (editando) {
    iconoDelBoton = 'fa-solid fa-floppy-disk'
    textoDelBoton = 'Guardar cambios'
  }
  if (enviando) {
    iconoDelBoton = 'fa-solid fa-spinner fa-spin'
    textoDelBoton = 'Guardando…'
  }
  return (
    <div className="admin-form-botones">
      <button type="submit" className="nc-btn" disabled={enviando}>
        <i className={iconoDelBoton} aria-hidden="true"></i>
        {' '}
        {textoDelBoton}
      </button>
      {editando && (
        <button type="button" className="nc-btn nc-btn--outline" onClick={alCancelar} disabled={enviando}>Cancelar</button>
      )}
    </div>
  )
}

export default BotonesForm
