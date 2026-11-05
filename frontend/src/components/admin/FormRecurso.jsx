import { useState } from 'react'
import { admin } from '../../api'
import { leer } from '../../utils/lugar'

// Tamaño máximo del PDF (el servidor lo vuelve a comprobar). Viaja dentro de un pedido JSON y en Vercel
// el pedido no puede pasar de ~4,5 MB, por eso el límite es de 3 MB.
const MAX_MB = 3

// Lee el archivo elegido y lo devuelve como texto "data:application/pdf;base64,...."
function leerComoBase64(archivo) {
  return new Promise((ok, fallo) => {
    const lector = new FileReader()
    lector.onload = () => ok(lector.result)
    lector.onerror = () => fallo(new Error('No se pudo leer el archivo'))
    lector.readAsDataURL(archivo)
  })
}

// Formulario "Agregar nuevo recurso": el PDF se sube de verdad y queda disponible para descargar en el sitio.
function FormRecurso({ alGuardar }) {
  const [enviando, setEnviando] = useState(false)

  async function alEnviar(e) {
    e.preventDefault()
    const form = e.currentTarget
    const archivo = form.elements['recurso-archivo'].files[0]
    if (!archivo) {
      alert('Elegí un archivo PDF.')
      return
    }
    if (archivo.type !== 'application/pdf' && !archivo.name.toLowerCase().endsWith('.pdf')) {
      alert('El archivo tiene que ser un PDF.')
      return
    }
    if (archivo.size > MAX_MB * 1024 * 1024) {
      alert(`El PDF pesa más de ${MAX_MB} MB. Probá comprimirlo o subí uno más liviano.`)
      return
    }
    setEnviando(true)
    try {
      const paginas = Number(leer(form, 'recurso-paginas'))
      await admin.crear('recursos', {
        titulo: leer(form, 'recurso-titulo').trim(),
        categoria: leer(form, 'recurso-tipo').trim(),
        descripcion: leer(form, 'recurso-descripcionCorta').trim(),
        fuente: leer(form, 'recurso-autor').trim(),
        pdf: await leerComoBase64(archivo),
        pdfNombre: archivo.name,
        ...(paginas > 0 ? { paginas } : {}), // si queda vacío, el servidor cuenta las páginas solo
      })
      form.reset()
      await alGuardar()
    } catch (error) {
      alert('No se pudo guardar el recurso: ' + error.message)
    }
    setEnviando(false)
  }

  return (
    <form id="formRecurso" className="auth-form" onSubmit={alEnviar}>
      <div className="auth-campo">
        <label htmlFor="recurso-titulo">Título</label>
        <input type="text" id="recurso-titulo" required placeholder="Ej: Historia de Colonia" />
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="recurso-tipo">Categoría</label>
          <input type="text" id="recurso-tipo" required placeholder="Ej: Patrimonio y cultura local" />
        </div>
        <div className="auth-campo">
          <label htmlFor="recurso-autor">Autor / fuente</label>
          <input type="text" id="recurso-autor" required placeholder="Ej: Sebastián Rivero" />
        </div>
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="recurso-archivo">Archivo PDF (hasta {MAX_MB} MB)</label>
          <input type="file" id="recurso-archivo" required accept="application/pdf,.pdf" />
        </div>
        <div className="auth-campo">
          <label htmlFor="recurso-paginas">Páginas (opcional)</label>
          <input type="number" id="recurso-paginas" min="1" placeholder="Se detectan solas" />
        </div>
      </div>
      <div className="auth-campo">
        <label htmlFor="recurso-descripcionCorta">Descripción corta</label>
        <textarea id="recurso-descripcionCorta" required rows="3" placeholder="Breve descripción del recurso"></textarea>
      </div>
      <button type="submit" className="nc-btn" disabled={enviando}>
        <i className={enviando ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-plus'}></i>
        {' '}
        {enviando ? 'Subiendo…' : 'Agregar recurso'}
      </button>
    </form>
  )
}

export default FormRecurso
