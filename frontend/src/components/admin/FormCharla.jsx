import { useState } from 'react'
import { admin } from '../../api'
import { LUGAR_VACIO, leer, lugarValido } from '../../utils/lugar'
import SelectorLugar from './SelectorLugar'

// Formulario "Agregar nueva charla". Los campos de texto son "no controlados": se leen al enviar.
function FormCharla({ museos, alGuardar }) {
  const [lugar, setLugar] = useState(LUGAR_VACIO)

  async function alEnviar(e) {
    e.preventDefault()
    const form = e.currentTarget
    const lg = lugarValido(lugar, museos)
    if (!lg) return
    try {
      await admin.crear('charlas', {
        titulo: leer(form, 'charla-titulo').trim(),
        fecha: leer(form, 'charla-fecha'),
        hora: leer(form, 'charla-hora'),
        lugar: lg.lugar,
        tipo: leer(form, 'charla-tipo'),
        imagen: leer(form, 'charla-imagen'),
        expositor: leer(form, 'charla-expositor'),
        descripcionCorta: leer(form, 'charla-descripcionCorta').trim(),
        descripcionCompleta: leer(form, 'charla-descripcionCompleta').trim(),
        cupos: parseInt(leer(form, 'charla-cupos')),
        lat: lg.lat,
        lng: lg.lng,
        museo: lg.museo,
      })
      form.reset()
      setLugar(LUGAR_VACIO)
      await alGuardar()
    } catch (error) {
      alert('No se pudo guardar la charla: ' + error.message)
    }
  }

  return (
    <form id="formCharla" className="auth-form" onSubmit={alEnviar}>
      <div className="auth-campo">
        <label htmlFor="charla-titulo">Título</label>
        <input type="text" id="charla-titulo" required placeholder="Ej: Historia del Barrio Histórico" />
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="charla-cupos">Cupos</label>
          <input type="number" id="charla-cupos" required min="1" defaultValue="1" />
        </div>
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="charla-fecha">Fecha</label>
          <input type="date" id="charla-fecha" required />
        </div>
        <div className="auth-campo">
          <label htmlFor="charla-hora">Hora</label>
          <input type="time" id="charla-hora" required />
        </div>
      </div>
      <SelectorLugar prefijo="charla" etiqueta="Lugar" museos={museos} lugar={lugar} alCambiar={setLugar} />
      <div className="auth-campo">
        <label htmlFor="charla-expositor">Expositor/a</label>
        <input type="text" id="charla-expositor" required placeholder="Ej: Lic. María Fernández" />
      </div>
      <div className="auth-campo">
        <label htmlFor="charla-tipo">Tipo de charla</label>
        <select id="charla-tipo" className="nc-select" required>
          <option value="Virtual">Virtual</option>
          <option value="Presencial">Presencial</option>
        </select>
      </div>
      <div className="auth-campo">
        <label htmlFor="charla-imagen">URL de la imagen</label>
        <input type="url" id="charla-imagen" required placeholder="https://..." />
      </div>
      <div className="auth-campo">
        <label htmlFor="charla-descripcionCorta">Descripción corta</label>
        <textarea id="charla-descripcionCorta" required rows="2" placeholder="Aparece en la tarjeta de la home (1-2 líneas)"></textarea>
      </div>
      <div className="auth-campo">
        <label htmlFor="charla-descripcionCompleta">Descripción completa</label>
        <textarea id="charla-descripcionCompleta" required rows="4" placeholder="Aparece en el detalle de la charla"></textarea>
      </div>
      <button type="submit" className="nc-btn">
        <i className="fa-solid fa-plus"></i>
        {' '}
        Agregar charla
      </button>
    </form>
  )
}

export default FormCharla
