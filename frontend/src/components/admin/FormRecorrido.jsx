import { useState } from 'react'
import { admin } from '../../api'
import { LUGAR_VACIO, leer, lugarValido } from '../../utils/lugar'
import SelectorLugar from './SelectorLugar'

// Formulario "Agregar nuevo recorrido"
function FormRecorrido({ museos, alGuardar }) {
  const [lugar, setLugar] = useState(LUGAR_VACIO)

  async function alEnviar(e) {
    e.preventDefault()
    const form = e.currentTarget
    const lg = lugarValido(lugar, museos)
    if (!lg) return
    try {
      await admin.crear('recorridos', {
        titulo: leer(form, 'recorrido-titulo').trim(),
        tipo: leer(form, 'recorrido-tipo').trim(),
        duracionHoras: parseInt(leer(form, 'recorrido-horas').trim()),
        duracionMinutos: parseInt(leer(form, 'recorrido-minutos').trim()),
        imagen: leer(form, 'recorrido-imagen'),
        puntoSalida: lg.lugar,
        cupos: parseInt(leer(form, 'recorrido-cupos').trim()),
        descripcionCorta: leer(form, 'recorrido-descripcionCorta').trim(),
        fecha: leer(form, 'recorrido-fecha'),
        hora: leer(form, 'recorrido-hora'),
        lat: lg.lat,
        lng: lg.lng,
        museo: lg.museo,
      })
      form.reset()
      setLugar(LUGAR_VACIO)
      await alGuardar()
    } catch (error) {
      alert('No se pudo guardar el recorrido: ' + error.message)
    }
  }

  return (
    <form id="formRecorrido" className="auth-form" onSubmit={alEnviar}>
      <div className="auth-campo">
        <label htmlFor="recorrido-titulo">Título</label>
        <input type="text" id="recorrido-titulo" required placeholder="Ej: Barrio Histórico a pie" />
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="recorrido-cupos">Cupos</label>
          <input type="number" defaultValue="1" min="1" id="recorrido-cupos" required />
        </div>
        <div className="auth-campo">
          <label>Duración</label>
          <div>
            <input type="number" id="recorrido-horas" min="0" max="23" defaultValue="0" required />
            <span>horas</span>
            {' '}
            <input type="number" id="recorrido-minutos" min="0" max="59" defaultValue="0" required />
            <span>minutos</span>
          </div>
        </div>
      </div>
      <div className="auth-campo">
        <label htmlFor="recorrido-tipo">Tipo</label>
        <input type="text" id="recorrido-tipo" required placeholder="Ej: Clásico" />
      </div>
      <SelectorLugar prefijo="recorrido" etiqueta="Lugar / punto de salida" museos={museos} lugar={lugar} alCambiar={setLugar} />
      <div className="auth-campo">
        <label htmlFor="recorrido-imagen">URL de la imagen</label>
        <input type="url" id="recorrido-imagen" required placeholder="https://..." />
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="recorrido-fecha">Fecha (para el calendario)</label>
          <input type="date" id="recorrido-fecha" />
        </div>
        <div className="auth-campo">
          <label htmlFor="recorrido-hora">Hora</label>
          <input type="time" id="recorrido-hora" />
        </div>
      </div>
      <div className="auth-campo">
        <label htmlFor="recorrido-descripcionCorta">Descripción corta</label>
        <textarea id="recorrido-descripcionCorta" required rows="3" placeholder="Breve descripción del recorrido"></textarea>
      </div>
      <button type="submit" className="nc-btn">
        <i className="fa-solid fa-plus"></i>
        {' '}
        Agregar recorrido
      </button>
    </form>
  )
}

export default FormRecorrido
