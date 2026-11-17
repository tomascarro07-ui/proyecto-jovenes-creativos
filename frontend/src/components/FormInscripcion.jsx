import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useSesion } from '../hooks/useSesion'
import { useIdioma } from '../hooks/useIdioma'
import { avisar } from '../utils/avisos'

function FormInscripcion({ tipo, idActividad, visible, alTerminar }) {
  const { t } = useIdioma()
  const { usuario } = useSesion()
  const navegar = useNavigate()
  const [nombre, setNombre] = useState(usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : '')
  const [telefono, setTelefono] = useState(usuario ? usuario.telefono || '' : '')
  const [enviando, setEnviando] = useState(false)

  async function alEnviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    try {
      await api.inscribirse({ tipo, actividad: idActividad, nombre: nombre.trim(), telefono: telefono.trim() })
      avisar(t('insc.ok'), {
        tipo: 'exito',
        titulo: t('insc.exitoTitulo'),
        enlace: { texto: t('insc.verMis'), ruta: '/mis-inscripciones' },
      })
      alTerminar()
    } catch (error) {
      if (error.status === 401) {
        await avisar(t('insc.vencio'), { tipo: 'advertencia', titulo: t('insc.vencioTitulo') })
        navegar('/login')
        return
      }
      if (error.status === 409 && error.codigo === 'ya_inscripto') {
        avisar(t('insc.yaTexto'), {
          tipo: 'info',
          titulo: t('insc.yaTitulo'),
          enlace: { texto: t('insc.verMis'), ruta: '/mis-inscripciones' },
        })
        alTerminar()
        return
      }
      avisar(error.message, { tipo: 'error' })
    }
    setEnviando(false)
  }

  return (
    <section className="admin-panel">
      <form id="formConfirmacion" className="form-contacto" style={{ display: visible ? 'flex' : 'none' }} onSubmit={alEnviar}>
        <h3>{t('det.confirmaTitulo')}</h3>
        <div className="auth-campo">
          <label htmlFor="nombre">{t('det.nombre')}</label>
          <input type="text" id="nombre" required placeholder={t('det.nombrePh')} value={nombre} onChange={(evento) => setNombre(evento.target.value)} />
        </div>
        <div className="auth-campo">
          <label htmlFor="email">{t('det.email')}</label>
          <input type="email" id="email" required placeholder={t('det.emailPh')} readOnly value={usuario ? usuario.correo : ''} />
        </div>
        <div className="auth-campo">
          <label htmlFor="telefono">{t('det.telefono')}</label>
          <input type="tel" id="telefono" required placeholder={t('form.telefonoPh')} value={telefono} onChange={(evento) => setTelefono(evento.target.value)} />
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
