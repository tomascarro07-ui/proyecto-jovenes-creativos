import { useState } from 'react'
import { admin } from '../../api'
import { LUGAR_VACIO, leer, lugarValido } from '../../utils/lugar'
import SelectorLugar from './SelectorLugar'

// Formulario "Agregar nuevo taller"
function FormTaller({ museos, alGuardar }) {
  const [lugar, setLugar] = useState(LUGAR_VACIO)

  async function alEnviar(e) {
    e.preventDefault()
    const form = e.currentTarget
    const lg = lugarValido(lugar, museos)
    if (!lg) return
    try {
      await admin.crear('talleres', {
        titulo: leer(form, 'taller-titulo').trim(),
        nivel: leer(form, 'taller-nivel'),
        modalidad: leer(form, 'taller-modalidad'),
        cantClases: parseInt(leer(form, 'taller-duracion')),
        cupos: parseInt(leer(form, 'taller-cupos')),
        imagen: leer(form, 'taller-imagen'),
        descripcionCorta: leer(form, 'taller-descripcion').trim(),
        fecha: leer(form, 'taller-fecha'),
        hora: leer(form, 'taller-hora'),
        lat: lg.lat,
        lng: lg.lng,
        lugar: lg.lugar,
        museo: lg.museo,
      })
      form.reset()
      setLugar(LUGAR_VACIO)
      await alGuardar()
    } catch (error) {
      alert('No se pudo guardar el taller: ' + error.message)
    }
  }

  return (
    <form id="formTaller" className="auth-form" onSubmit={alEnviar}>
      <div className="auth-campo">
        <label htmlFor="taller-titulo">Título</label>
        <input type="text" id="taller-titulo" required placeholder="Ej: Taller de fotografía patrimonial" />
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="taller-nivel">Nivel</label>
          <select id="taller-nivel" className="nc-select" required>
            <option value="iniciacion">Iniciación</option>
            <option value="todo-publico">Todo público</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>
        <div className="auth-campo">
          <label htmlFor="taller-modalidad">Modalidad</label>
          <select id="taller-modalidad" className="nc-select" required>
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="taller-duracion">Duración (Digitar unicamente el número de clases)</label>
          <input type="text" id="taller-duracion" required placeholder="Ej: 4 clases" />
        </div>
        <div className="auth-campo">
          <label htmlFor="taller-cupos">Cupos</label>
          <input type="number" id="taller-cupos" required min="1" defaultValue="1" />
        </div>
      </div>
      <div className="auth-campo">
        <label htmlFor="taller-imagen">URL de la imagen</label>
        <input type="url" id="taller-imagen" required placeholder="https://..." />
      </div>
      <SelectorLugar prefijo="taller" etiqueta="Lugar" museos={museos} lugar={lugar} alCambiar={setLugar} />
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="taller-fecha">Fecha (para el calendario)</label>
          <input type="date" id="taller-fecha" />
        </div>
        <div className="auth-campo">
          <label htmlFor="taller-hora">Hora</label>
          <input type="time" id="taller-hora" />
        </div>
      </div>
      <div className="auth-campo">
        <label htmlFor="taller-descripcion">Descripción</label>
        <textarea id="taller-descripcion" required rows="3" placeholder="Breve descripción del taller"></textarea>
      </div>
      <button type="submit" className="nc-btn">
        <i className="fa-solid fa-plus"></i>
        {' '}
        Agregar taller
      </button>
    </form>
  )
}

export default FormTaller
