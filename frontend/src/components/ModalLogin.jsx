import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useIdioma } from '../hooks/useIdioma'

function ModalLogin({ abierto, alCerrar, quien }) {
  const { t } = useIdioma()
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (evento) => {
      if (evento.key === 'Escape') alCerrar()
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierto, alCerrar])

  if (!abierto) return null

  return (
    <>
      <div className="modal fade show" tabIndex="-1" id="mensajeLogin" style={{ display: 'block' }} role="dialog" aria-modal="true" onClick={(evento) => evento.target === evento.currentTarget && alCerrar()}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-cuenta">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-lock-fill me-2"></i>
                {' '}
                <span>{t('modal.titulo')}</span>
              </h5>
              <button type="button" className="btn-close btn-close-white" aria-label={t('modal.cerrar')} onClick={alCerrar}></button>
            </div>
            <div className="modal-body">
              <p>{t(`modal.p1.${quien}`)}</p>
              <p>
                {t('modal.p2')}
              </p>
            </div>
            <div className="modal-footer">
              <Link to="/login" className="btn btn-outline-secondary">{t('hd.iniciarSesion')}</Link>
              {' '}
              <Link to="/registro" className="btn btn-cuenta">{t('hd.registrarme')}</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  )
}

export default ModalLogin
