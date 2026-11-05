import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useSesion } from '../hooks/useSesion'
import { useIdioma } from '../hooks/useIdioma'

// Formulario "Confirmá tu asistencia". Los datos de la persona se completan con los de su cuenta.
// Cada cuenta se inscribe solo a sí misma (no hay "cantidad de personas").
// Props: tipo ('charla' | 'taller' | 'recorrido'), idActividad, visible,
// alTerminar (se llama cuando la inscripción quedó confirmada, para volver a pedir los cupos al servidor).
function FormInscripcion({ tipo, idActividad, visible, alTerminar }) {
  const { t } = useIdioma()
  const { usuario } = useSesion()
  const navegar = useNavigate()
  const [nombre, setNombre] = useState(usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : '')
  const [telefono, setTelefono] = useState(usuario ? usuario.telefono || '' : '')
  const [enviando, setEnviando] = useState(false)

  async function alEnviar(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await api.inscribirse({ tipo, actividad: idActividad, nombre: nombre.trim(), telefono: telefono.trim() })
      alert(t('insc.ok'))
      alTerminar()
    } catch (error) {
      if (error.status === 401) {
        alert(t('insc.vencio'))
        navegar('/login')
        return
      }
      alert(error.message)
    }
    setEnviando(false)
  }

  return (
    <section className="admin-panel">
      <form id="formConfirmacion" className="form-contacto" style={{ display: visible ? 'flex' : 'none' }} onSubmit={alEnviar}>
        <h3>{t('det.confirmaTitulo')}</h3>
        <div className="auth-campo">
          <label htmlFor="nombre">{t('det.nombre')}</label>
          <input type="text" id="nombre" required placeholder={t('det.nombrePh')} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="auth-campo">
          <label htmlFor="email">{t('det.email')}</label>
          <input type="email" id="email" required placeholder={t('det.emailPh')} readOnly value={usuario ? usuario.correo : ''} />
        </div>
        <div className="auth-campo">
          <label htmlFor="telefono">{t('det.telefono')}</label>
          <input type="tel" id="telefono" required placeholder={t('form.telefonoPh')} value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <button type="submit" className="nc-btn nc-btn--pill" disabled={enviando}>
          <i className="fa-solid fa-paper-plane"></i>
          {' '}
          Enviar confirmación
        </button>
      </form>
    </section>
  )
}

export default FormInscripcion
