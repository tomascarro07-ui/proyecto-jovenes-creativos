import { useState } from 'react'
import { admin, rutaOriginal } from '../../api'
import { leer, lugarInicial, lugarValido } from '../../utils/lugar'
import SelectorLugar from './SelectorLugar'
import CampoImagen from './CampoImagen'
import BotonesForm from './BotonesForm'
import { avisarAdmin } from '../../utils/avisos'

function FormRecorrido({ museos, inicial = null, alGuardar, alCancelar }) {
  const datosIniciales = inicial || {}
  const [lugar, setLugar] = useState(() => lugarInicial(inicial))
  const [enviando, setEnviando] = useState(false)
  const editando = Boolean(inicial)

  async function alEnviar(evento) {
    evento.preventDefault()
    const form = evento.currentTarget
    const lg = lugarValido(lugar, museos)
    if (!lg) return
    const datos = {
      titulo: leer(form, 'recorrido-titulo').trim(),
      tipo: leer(form, 'recorrido-tipo').trim(),
      duracionHoras: parseInt(leer(form, 'recorrido-horas').trim()),
      duracionMinutos: parseInt(leer(form, 'recorrido-minutos').trim()),
      imagen: leer(form, 'recorrido-imagen').trim(),
      puntoSalida: lg.lugar,
      cupos: parseInt(leer(form, 'recorrido-cupos').trim()),
      descripcionCorta: leer(form, 'recorrido-descripcionCorta').trim(),
      fecha: leer(form, 'recorrido-fecha'),
      hora: leer(form, 'recorrido-hora'),
      lat: lg.lat,
      lng: lg.lng,
      museo: lg.museo,
    }
    setEnviando(true)
    try {
      if (editando) await admin.editar('recorridos', inicial.id, datos)
      else await admin.crear('recorridos', datos)
      await alGuardar()
    } catch (error) {
      avisarAdmin('No se pudo guardar el recorrido: ' + error.message)
      setEnviando(false)
    }
  }

  return (
    <form id="formRecorrido" className="auth-form" onSubmit={alEnviar}>
      <div className="auth-campo">
        <label htmlFor="recorrido-titulo">Título</label>
        <input type="text" id="recorrido-titulo" required defaultValue={datosIniciales.titulo} placeholder="Ej: Barrio Histórico a pie" />
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="recorrido-cupos">{editando ? 'Cupos disponibles ahora' : 'Cupos'}</label>
          <input type="number" defaultValue={inicial ? inicial.cupos : '1'} min={editando ? '0' : '1'} id="recorrido-cupos" required />
          {editando && <small className="auth-ayuda-campo">Son los lugares que quedan libres: ya se descontaron las personas inscriptas.</small>}
        </div>
        <div className="auth-campo">
          <label>Duración</label>
          <div>
            <input type="number" id="recorrido-horas" min="0" max="23" defaultValue={inicial ? inicial.duracionHoras : '0'} required />
            <span>horas</span>
            {' '}
            <input type="number" id="recorrido-minutos" min="0" max="59" defaultValue={inicial ? inicial.duracionMinutos : '0'} required />
            <span>minutos</span>
          </div>
        </div>
      </div>
      <div className="auth-campo">
        <label htmlFor="recorrido-tipo">Tipo</label>
        <input type="text" id="recorrido-tipo" required defaultValue={datosIniciales.tipo} placeholder="Ej: Clásico" />
      </div>
      <SelectorLugar prefijo="recorrido" etiqueta="Lugar / punto de salida" museos={museos} lugar={lugar} alCambiar={setLugar} />
      <CampoImagen prefijo="recorrido" requerido inicial={rutaOriginal(datosIniciales.imagen) || ''} />
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="recorrido-fecha">Fecha (para el calendario)</label>
          <input type="date" id="recorrido-fecha" defaultValue={datosIniciales.fecha} />
        </div>
        <div className="auth-campo">
          <label htmlFor="recorrido-hora">Hora</label>
          <input type="time" id="recorrido-hora" defaultValue={datosIniciales.hora} />
        </div>
      </div>
      <div className="auth-campo">
        <label htmlFor="recorrido-descripcionCorta">Descripción corta</label>
        <textarea id="recorrido-descripcionCorta" required rows="3" defaultValue={datosIniciales.descripcionCorta} placeholder="Breve descripción del recorrido"></textarea>
      </div>
      <BotonesForm editando={editando} textoAgregar="Agregar recorrido" enviando={enviando} alCancelar={alCancelar} />
    </form>
  )
}

export default FormRecorrido
