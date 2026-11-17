import { useState } from 'react'
import { admin, rutaPublica } from '../../api'
import { reducirImagen } from '../../utils/imagen'

const MAXIMO = 8

function CampoGaleria({ fotos, alCambiar }) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  async function alElegir(evento) {
    const archivos = Array.from(evento.target.files).slice(0, MAXIMO - fotos.length)
    evento.target.value = ''
    if (archivos.length === 0) return
    setError('')
    setSubiendo(true)
    const nuevas = []
    try {
      for (const archivo of archivos) {
        const datos = await reducirImagen(archivo)
        const respuesta = await admin.subirImagen(datos, archivo.name)
        nuevas.push(respuesta.url)
      }
    } catch (err) {
      setError(err.message)
    }
    if (nuevas.length) alCambiar([...fotos, ...nuevas])
    setSubiendo(false)
  }

  function quitar(posicion) {
    alCambiar(fotos.filter((_, otraPosicion) => otraPosicion !== posicion))
  }

  function mover(posicion, paso) {
    const posicionDestino = posicion + paso
    if (posicionDestino < 0 || posicionDestino >= fotos.length) return
    const copia = [...fotos]
    ;[copia[posicion], copia[posicionDestino]] = [copia[posicionDestino], copia[posicion]]
    alCambiar(copia)
  }

  return (
    <div className="auth-campo campo-galeria">
      <label>Galería de fotos (opcional, hasta {MAXIMO})</label>
      {fotos.length > 0 && (
        <ul className="campo-galeria__lista">
          {fotos.map((src, posicion) => (
            <li key={src + posicion}>
              <img src={rutaPublica(src)} alt={`Foto ${posicion + 1} de la galería`} />
              <span className="campo-galeria__acciones">
                <button type="button" className="nc-btn nc-btn--outline nc-btn--mini" onClick={() => mover(posicion, -1)} disabled={posicion === 0} aria-label={`Mover la foto ${posicion + 1} hacia adelante`}>
                  <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
                </button>
                <button type="button" className="nc-btn nc-btn--outline nc-btn--mini" onClick={() => mover(posicion, 1)} disabled={posicion === fotos.length - 1} aria-label={`Mover la foto ${posicion + 1} hacia atrás`}>
                  <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </button>
                <button type="button" className="nc-btn nc-btn--outline nc-btn--mini" onClick={() => quitar(posicion)} aria-label={`Quitar la foto ${posicion + 1}`}>
                  <i className="fa-solid fa-trash" aria-hidden="true"></i>
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {fotos.length < MAXIMO && (
        <label className="nc-btn nc-btn--outline nc-btn--mini campo-imagen__subir">
          <i className={subiendo ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-upload'} aria-hidden="true"></i>
          {' '}
          {subiendo ? 'Subiendo…' : 'Subir fotos'}
          <input type="file" className="visually-hidden" accept="image/*" multiple onChange={alElegir} disabled={subiendo} />
        </label>
      )}
      {error && <p className="campo-imagen__error" role="alert">{error}</p>}
    </div>
  )
}

export default CampoGaleria
