import { useState } from 'react'
import { admin } from '../../api'
import { leer } from '../../utils/lugar'
import BotonUbicacion from './BotonUbicacion'

// Formulario "Agregar nuevo museo"
function FormMuseo({ alGuardar }) {
  const [ubicacion, setUbicacion] = useState({ lat: null, lng: null })

  async function alEnviar(e) {
    e.preventDefault()
    const form = e.currentTarget
    if (ubicacion.lat === null) {
      alert('Marcá la ubicación del museo en el mapa.')
      return
    }
    try {
      await admin.crear('museos', {
        nombre: leer(form, 'museo-nombre').trim(),
        tipo: leer(form, 'museo-tipo').trim(),
        descripcionCorta: leer(form, 'museo-descripcion').trim(),
        direccion: leer(form, 'museo-direccion').trim(),
        horario: leer(form, 'museo-horario').trim(),
        imagen: leer(form, 'museo-imagen').trim(),
        lat: ubicacion.lat,
        lng: ubicacion.lng,
        museo: null,
      })
      form.reset()
      setUbicacion({ lat: null, lng: null })
      await alGuardar()
    } catch (error) {
      alert('No se pudo guardar el museo: ' + error.message)
    }
  }

  return (
    <form id="formMuseo" className="auth-form" onSubmit={alEnviar}>
      <div className="auth-campo">
        <label htmlFor="museo-nombre">Nombre</label>
        <input type="text" id="museo-nombre" required maxLength="120" placeholder="Ej: Espacio Portugués" />
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="museo-tipo">Tipo</label>
          <input type="text" id="museo-tipo" required maxLength="40" placeholder="Ej: Histórico" />
        </div>
        <div className="auth-campo">
          <label htmlFor="museo-horario">Horario</label>
          <input type="text" id="museo-horario" maxLength="120" placeholder="Ej: Mar a Dom, 11 a 17 hs" />
        </div>
      </div>
      <div className="auth-campo">
        <label htmlFor="museo-direccion">Dirección</label>
        <input type="text" id="museo-direccion" maxLength="120" placeholder="Ej: Calle de los Suspiros 123" />
      </div>
      <div className="auth-campo">
        <label htmlFor="museo-imagen">Imagen (opcional)</label>
        <input type="text" inputMode="url" id="museo-imagen" maxLength="300" placeholder="img/mi-museo.webp o https://..." />
      </div>
      <div className="auth-campo">
        <label htmlFor="museo-descripcion">Descripción</label>
        <textarea id="museo-descripcion" required rows="3" maxLength="600" placeholder="Breve descripción del museo"></textarea>
      </div>
      <div className="auth-campo" data-ubicacion="">
        <label>Ubicación en el mapa cultural</label>
        {' '}
        <BotonUbicacion lat={ubicacion.lat} lng={ubicacion.lng} alCambiar={setUbicacion} texto="Marcar en el mapa" />
      </div>
      <button type="submit" className="nc-btn">
        <i className="fa-solid fa-plus"></i>
        {' '}
        Agregar museo
      </button>
    </form>
  )
}

export default FormMuseo
