import { useState } from 'react'
import { admin, rutaOriginal } from '../../api'
import { leer, lugarInicial, lugarValido } from '../../utils/lugar'
import { conActual } from '../../utils/formularios'
import SelectorLugar from './SelectorLugar'
import CampoImagen from './CampoImagen'
import BotonesForm from './BotonesForm'
import { avisarAdmin } from '../../utils/avisos'

const NIVELES = [['iniciacion', 'Iniciación'], ['todo-publico', 'Todo público'], ['avanzado', 'Avanzado']]
const MODALIDADES = [['presencial', 'Presencial'], ['online', 'Online']]

function FormTaller({ museos, inicial = null, alGuardar, alCancelar }) {
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
      titulo: leer(form, 'taller-titulo').trim(),
      nivel: leer(form, 'taller-nivel'),
      modalidad: leer(form, 'taller-modalidad'),
      cantClases: parseInt(leer(form, 'taller-duracion')),
      cupos: parseInt(leer(form, 'taller-cupos')),
      imagen: leer(form, 'taller-imagen').trim(),
      descripcionCorta: leer(form, 'taller-descripcion').trim(),
      fecha: leer(form, 'taller-fecha'),
      hora: leer(form, 'taller-hora'),
      lat: lg.lat,
      lng: lg.lng,
      lugar: lg.lugar,
      museo: lg.museo,
    }
    setEnviando(true)
    try {
      if (editando) await admin.editar('talleres', inicial.id, datos)
      else await admin.crear('talleres', datos)
      await alGuardar()
    } catch (error) {
      avisarAdmin('No se pudo guardar el taller: ' + error.message)
      setEnviando(false)
    }
  }

  return (
    <form id="formTaller" className="auth-form" onSubmit={alEnviar}>
      <div className="auth-campo">
        <label htmlFor="taller-titulo">Título</label>
        <input type="text" id="taller-titulo" required defaultValue={datosIniciales.titulo} placeholder="Ej: Taller de fotografía patrimonial" />
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="taller-nivel">Nivel</label>
          <select id="taller-nivel" className="nc-select" required defaultValue={datosIniciales.nivel}>
            {conActual(NIVELES, datosIniciales.nivel).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
          </select>
        </div>
        <div className="auth-campo">
          <label htmlFor="taller-modalidad">Modalidad</label>
          <select id="taller-modalidad" className="nc-select" required defaultValue={datosIniciales.modalidad}>
            {conActual(MODALIDADES, datosIniciales.modalidad).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
          </select>
        </div>
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="taller-duracion">Duración (Digitar unicamente el número de clases)</label>
          <input type="text" id="taller-duracion" required defaultValue={datosIniciales.cantClases} placeholder="Ej: 4 clases" />
        </div>
        <div className="auth-campo">
          <label htmlFor="taller-cupos">{editando ? 'Cupos disponibles ahora' : 'Cupos'}</label>
          <input type="number" id="taller-cupos" required min={editando ? '0' : '1'} defaultValue={inicial ? inicial.cupos : '1'} />
          {editando && <small className="auth-ayuda-campo">Son los lugares que quedan libres: ya se descontaron las personas inscriptas.</small>}
        </div>
      </div>
      <CampoImagen prefijo="taller" requerido inicial={rutaOriginal(datosIniciales.imagen) || ''} />
      <SelectorLugar prefijo="taller" etiqueta="Lugar" museos={museos} lugar={lugar} alCambiar={setLugar} />
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="taller-fecha">Fecha (para el calendario)</label>
          <input type="date" id="taller-fecha" defaultValue={datosIniciales.fecha} />
        </div>
        <div className="auth-campo">
          <label htmlFor="taller-hora">Hora</label>
          <input type="time" id="taller-hora" defaultValue={datosIniciales.hora} />
        </div>
      </div>
      <div className="auth-campo">
        <label htmlFor="taller-descripcion">Descripción</label>
        <textarea id="taller-descripcion" required rows="3" defaultValue={datosIniciales.descripcionCorta} placeholder="Breve descripción del taller"></textarea>
      </div>
      <BotonesForm editando={editando} textoAgregar="Agregar taller" enviando={enviando} alCancelar={alCancelar} />
    </form>
  )
}

export default FormTaller
