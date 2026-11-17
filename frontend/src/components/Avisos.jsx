import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registrarPantallaDeAvisos } from '../utils/avisos'
import { idiomaActual, traducir } from '../i18n/motor'

const ICONOS = {
  exito: 'fa-solid fa-circle-check',
  info: 'fa-solid fa-circle-info',
  advertencia: 'fa-solid fa-triangle-exclamation',
  error: 'fa-solid fa-circle-xmark',
  peligro: 'fa-solid fa-trash-can',
}

const TITULOS = {
  exito: 'aviso.exitoTitulo',
  info: 'aviso.infoTitulo',
  advertencia: 'aviso.atencionTitulo',
  error: 'aviso.errorTitulo',
  peligro: 'aviso.atencionTitulo',
}

function Avisos() {
  const navegar = useNavigate()
  const dialogoRef = useRef(null)
  const [cola, setCola] = useState([])
  const aviso = cola.length > 0 ? cola[0] : null

  useEffect(() => {
    return registrarPantallaDeAvisos((nuevoAviso) => {
      setCola((colaActual) => [...colaActual, nuevoAviso])
    })
  }, [])

  useEffect(() => {
    const dialogo = dialogoRef.current
    if (aviso && dialogo && !dialogo.open) dialogo.showModal()
  }, [aviso])

  const cerrar = useCallback((respuesta, irA) => {
    const dialogo = dialogoRef.current
    if (dialogo && dialogo.open) dialogo.close()
    setCola((colaActual) => colaActual.slice(1))
    if (aviso) aviso.resolver(respuesta)
    if (irA) navegar(irA)
  }, [aviso, navegar])

  if (!aviso) return <dialog ref={dialogoRef} className="aviso-modal" />

  const idioma = aviso.idioma || idiomaActual()
  const texto = (clave) => traducir(idioma, clave)
  const titulo = aviso.titulo || texto(TITULOS[aviso.tipo] || 'aviso.infoTitulo')
  const textoPrincipal = texto('aviso.entendido')
  const tieneEnlace = Boolean(aviso.enlace)

  return (
    <dialog
      ref={dialogoRef}
      className={`aviso-modal aviso-modal--${aviso.tipo}`}
      aria-labelledby="avisoTitulo"
      aria-describedby="avisoMensaje"
      onCancel={(evento) => {
        evento.preventDefault()
        cerrar(false)
      }}
    >
      <div className="aviso-modal__icono" aria-hidden="true">
        <i className={ICONOS[aviso.tipo] || ICONOS.info}></i>
      </div>
      <h3 id="avisoTitulo">{titulo}</h3>
      <p id="avisoMensaje">{aviso.mensaje}</p>
      <div className="aviso-modal__acciones">
        {aviso.esConfirmacion && (
          <>
            <button type="button" className="nc-btn nc-btn--peligro" onClick={() => cerrar(true)}>{aviso.textoConfirmar}</button>
            <button type="button" className="nc-btn nc-btn--outline" onClick={() => cerrar(false)} autoFocus>{aviso.textoCancelar}</button>
          </>
        )}
        {!aviso.esConfirmacion && tieneEnlace && (
          <>
            <button type="button" className="nc-btn" onClick={() => cerrar(true, aviso.enlace.ruta)} autoFocus>{aviso.enlace.texto}</button>
            <button type="button" className="aviso-modal__secundario" onClick={() => cerrar(true)}>{texto('aviso.cerrar')}</button>
          </>
        )}
        {!aviso.esConfirmacion && !tieneEnlace && (
          <button type="button" className="nc-btn" onClick={() => cerrar(true)} autoFocus>{textoPrincipal}</button>
        )}
      </div>
    </dialog>
  )
}

export default Avisos
