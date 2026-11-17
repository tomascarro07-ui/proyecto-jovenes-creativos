import { useState } from 'react'
import { admin } from '../../api'
import { leer } from '../../utils/lugar'
import BotonesForm from './BotonesForm'

const MAX_MB = 3

function leerComoBase64(archivo) {
  return new Promise((ok, fallo) => {
    const lector = new FileReader()
    lector.onload = () => ok(lector.result)
    lector.onerror = () => fallo(new Error('No se pudo leer el archivo'))
    lector.readAsDataURL(archivo)
  })
}

function FormRecurso({ inicial = null, alGuardar, alCancelar }) {
  const datosIniciales = inicial || {}
  const [enviando, setEnviando] = useState(false)
  const editando = Boolean(inicial)

  async function alEnviar(evento) {
    evento.preventDefault()
    const form = evento.currentTarget
    const archivo = form.elements['recurso-archivo'].files[0]
    if (!archivo && !editando) {
      alert('Elegí un archivo PDF.')
      return
    }
    if (archivo && archivo.type !== 'application/pdf' && !archivo.name.toLowerCase().endsWith('.pdf')) {
      alert('El archivo tiene que ser un PDF.')
      return
    }
    if (archivo && archivo.size > MAX_MB * 1024 * 1024) {
      alert(`El PDF pesa más de ${MAX_MB} MB. Probá comprimirlo o subí uno más liviano.`)
      return
    }
    setEnviando(true)
    try {
      const paginas = Number(leer(form, 'recurso-paginas'))
      const datos = {
        titulo: leer(form, 'recurso-titulo').trim(),
        categoria: leer(form, 'recurso-tipo').trim(),
        descripcion: leer(form, 'recurso-descripcionCorta').trim(),
        fuente: leer(form, 'recurso-autor').trim(),
      }
      const enviarPaginas = paginas > 0 && !(editando && archivo && paginas === inicial.paginas)
      if (enviarPaginas) datos.paginas = paginas
      if (archivo) {
        datos.pdf = await leerComoBase64(archivo)
        datos.pdfNombre = archivo.name
      }
      if (editando) await admin.editar('recursos', inicial.id, datos)
      else await admin.crear('recursos', datos)
      await alGuardar()
    } catch (error) {
      alert('No se pudo guardar el recurso: ' + error.message)
      setEnviando(false)
    }
  }

  return (
    <form id="formRecurso" className="auth-form" onSubmit={alEnviar}>
      <div className="auth-campo">
        <label htmlFor="recurso-titulo">Título</label>
        <input type="text" id="recurso-titulo" required defaultValue={datosIniciales.titulo} placeholder="Ej: Historia de Colonia" />
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="recurso-tipo">Categoría</label>
          <input type="text" id="recurso-tipo" required defaultValue={datosIniciales.categoria} placeholder="Ej: Patrimonio y cultura local" />
        </div>
        <div className="auth-campo">
          <label htmlFor="recurso-autor">Autor / fuente</label>
          <input type="text" id="recurso-autor" required defaultValue={datosIniciales.fuente} placeholder="Ej: Sebastián Rivero" />
        </div>
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="recurso-archivo">{editando ? `Reemplazar el PDF (opcional, hasta ${MAX_MB} MB)` : `Archivo PDF (hasta ${MAX_MB} MB)`}</label>
          <input type="file" id="recurso-archivo" required={!editando} accept="application/pdf,.pdf" />
        </div>
        <div className="auth-campo">
          <label htmlFor="recurso-paginas">{editando ? 'Páginas' : 'Páginas (opcional)'}</label>
          <input type="number" id="recurso-paginas" min="1" defaultValue={datosIniciales.paginas} placeholder="Se detectan solas" />
        </div>
      </div>
      <div className="auth-campo">
        <label htmlFor="recurso-descripcionCorta">Descripción corta</label>
        <textarea id="recurso-descripcionCorta" required rows="3" defaultValue={datosIniciales.descripcion} placeholder="Breve descripción del recurso"></textarea>
      </div>
      <BotonesForm editando={editando} textoAgregar="Agregar recurso" enviando={enviando} alCancelar={alCancelar} />
    </form>
  )
}

export default FormRecurso
