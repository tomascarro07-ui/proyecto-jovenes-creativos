import { useState } from 'react'
import { admin, rutaOriginal } from '../../api'
import { leer, lugarInicial, lugarValido } from '../../utils/lugar'
import { conActual } from '../../utils/formularios'
import SelectorLugar from './SelectorLugar'
import CampoImagen from './CampoImagen'
import BotonesForm from './BotonesForm'
import { avisarAdmin } from '../../utils/avisos'

const TIPOS = [['Virtual', 'Virtual'], ['Presencial', 'Presencial']]

function FormCharla({ museos, inicial = null, alGuardar, alCancelar }) {
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
      titulo: leer(form, 'charla-titulo').trim(),
      fecha: leer(form, 'charla-fecha'),
      hora: leer(form, 'charla-hora'),
      lugar: lg.lugar,
      tipo: leer(form, 'charla-tipo'),
      imagen: leer(form, 'charla-imagen').trim(),
      expositor: leer(form, 'charla-expositor').trim(),
      descripcionCorta: leer(form, 'charla-descripcionCorta').trim(),
      descripcionCompleta: leer(form, 'charla-descripcionCompleta').trim(),
      cupos: parseInt(leer(form, 'charla-cupos')),
      lat: lg.lat,
      lng: lg.lng,
      museo: lg.museo,
    }
    setEnviando(true)
    try {
      if (editando) await admin.editar('charlas', inicial.id, datos)
      else await admin.crear('charlas', datos)
      await alGuardar()
    } catch (error) {
      avisarAdmin('No se pudo guardar la charla: ' + error.message)
      setEnviando(false)
    }
  }

  return (
    <form id="formCharla" className="auth-form" onSubmit={alEnviar}>
      <div className="auth-campo">
        <label htmlFor="charla-titulo">Título</label>
        <input type="text" id="charla-titulo" required defaultValue={datosIniciales.titulo} placeholder="Ej: Historia del Barrio Histórico" />
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="charla-cupos">{editando ? 'Cupos disponibles ahora' : 'Cupos'}</label>
          <input type="number" id="charla-cupos" required min={editando ? '0' : '1'} defaultValue={inicial ? inicial.cupos : '1'} />
          {editando && <small className="auth-ayuda-campo">Son los lugares que quedan libres: ya se descontaron las personas inscriptas.</small>}
        </div>
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="charla-fecha">Fecha</label>
          <input type="date" id="charla-fecha" required defaultValue={datosIniciales.fecha} />
        </div>
        <div className="auth-campo">
          <label htmlFor="charla-hora">Hora</label>
          <input type="time" id="charla-hora" required defaultValue={datosIniciales.hora} />
        </div>
      </div>
      <SelectorLugar prefijo="charla" etiqueta="Lugar" museos={museos} lugar={lugar} alCambiar={setLugar} />
      <div className="auth-campo">
        <label htmlFor="charla-expositor">Expositor/a</label>
        <input type="text" id="charla-expositor" required defaultValue={datosIniciales.expositor} placeholder="Ej: Lic. María Fernández" />
      </div>
      <div className="auth-campo">
        <label htmlFor="charla-tipo">Tipo de charla</label>
        <select id="charla-tipo" className="nc-select" required defaultValue={datosIniciales.tipo}>
          {conActual(TIPOS, datosIniciales.tipo).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
        </select>
      </div>
      <CampoImagen prefijo="charla" requerido inicial={rutaOriginal(datosIniciales.imagen) || ''} />
      <div className="auth-campo">
        <label htmlFor="charla-descripcionCorta">Descripción corta</label>
        <textarea id="charla-descripcionCorta" required rows="2" defaultValue={datosIniciales.descripcionCorta} placeholder="Aparece en la tarjeta de la home (1-2 líneas)"></textarea>
      </div>
      <div className="auth-campo">
        <label htmlFor="charla-descripcionCompleta">Descripción completa</label>
        <textarea id="charla-descripcionCompleta" required rows="4" defaultValue={datosIniciales.descripcionCompleta} placeholder="Aparece en el detalle de la charla"></textarea>
      </div>
      <BotonesForm editando={editando} textoAgregar="Agregar charla" enviando={enviando} alCancelar={alCancelar} />
    </form>
  )
}

export default FormCharla
