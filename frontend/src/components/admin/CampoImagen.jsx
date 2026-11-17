import { useState } from 'react'
import { admin, rutaPublica } from '../../api'
import { reducirImagen } from '../../utils/imagen'

function CampoImagen({ prefijo, requerido = false, inicial = '' }) {
  const [valor, setValor] = useState(inicial === 'IMAGEN_MUSEO' ? '' : inicial)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  async function alElegir(evento) {
    const archivo = evento.target.files[0]
    evento.target.value = ''
    if (!archivo) return
    setError('')
    setSubiendo(true)
    try {
      const datos = await reducirImagen(archivo)
      const respuesta = await admin.subirImagen(datos, archivo.name)
      setValor(respuesta.url)
    } catch (err) {
      setError(err.message)
    }
    setSubiendo(false)
  }

  return (
    <div className="auth-campo campo-imagen">
      <label htmlFor={`${prefijo}-imagen`}>{requerido ? 'Imagen' : 'Imagen (opcional)'}</label>
      <input
        type="text"
        inputMode="url"
        id={`${prefijo}-imagen`}
        required={requerido}
        maxLength="500"
        placeholder="Pegá una dirección (https://...) o subí una foto"
        value={valor}
        onChange={(evento) => setValor(evento.target.value)}
      />
      <div className="campo-imagen__acciones">
        <label className="nc-btn nc-btn--outline nc-btn--mini campo-imagen__subir">
          <i className={subiendo ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-upload'} aria-hidden="true"></i>
          {' '}
          {subiendo ? 'Subiendo…' : 'Subir una foto'}
          <input type="file" className="visually-hidden" accept="image/*" onChange={alElegir} disabled={subiendo} />
        </label>
        {valor && (
          <button type="button" className="nc-btn nc-btn--outline nc-btn--mini" onClick={() => setValor('')}>
            Quitar
          </button>
        )}
      </div>
      {error && <p className="campo-imagen__error" role="alert">{error}</p>}
      {valor && <img className="campo-imagen__vista" src={rutaPublica(valor)} alt="Vista previa de la imagen" />}
    </div>
  )
}

export default CampoImagen
