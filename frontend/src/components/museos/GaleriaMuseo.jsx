import { useCallback, useEffect, useRef, useState } from 'react'
import { useIdioma } from '../../hooks/useIdioma'

function GaleriaMuseo({ fotos, nombre }) {
  const { t } = useIdioma()
  const dialogo = useRef(null)
  const [actual, setActual] = useState(null)

  const cerrar = useCallback(() => setActual(null), [])
  const mover = useCallback((paso) => setActual((fotoActual) => (fotoActual === null ? fotoActual : (fotoActual + paso + fotos.length) % fotos.length)), [fotos.length])

  useEffect(() => {
    const elementoDialogo = dialogo.current
    if (!elementoDialogo) return
    if (actual !== null && !elementoDialogo.open) elementoDialogo.showModal()
    if (actual === null && elementoDialogo.open) elementoDialogo.close()
  }, [actual])

  useEffect(() => {
    if (actual === null) return
    function alTecla(evento) {
      if (evento.key === 'ArrowLeft') mover(-1)
      if (evento.key === 'ArrowRight') mover(1)
    }
    window.addEventListener('keydown', alTecla)
    return () => window.removeEventListener('keydown', alTecla)
  }, [actual, mover])

  return (
    <>
      <div className="mu-galeria">
        {fotos.map((src, posicion) => (
          <button type="button" className="mu-foto" key={src + posicion} onClick={() => setActual(posicion)} aria-label={t('md.ampliarFoto', { n: posicion + 1 })}>
            <img src={src} alt={t('md.fotoDe', { nombre, n: posicion + 1 })} loading="lazy" />
          </button>
        ))}
      </div>
      <dialog className="mu-lb" ref={dialogo} onClose={cerrar} aria-label={t('md.galeria')} onClick={(evento) => { if (evento.target === evento.currentTarget) cerrar() }}>
        {actual !== null && (
          <div className="mu-lb__marco" onClick={(evento) => { if (evento.target === evento.currentTarget) cerrar() }}>
            <img src={fotos[actual]} alt={t('md.fotoDe', { nombre, n: actual + 1 })} />
            <button type="button" className="mu-lb__btn mu-lb__cerrar" onClick={cerrar} aria-label={t('md.cerrar')}><i className="fa-solid fa-xmark" aria-hidden="true"></i></button>
            {fotos.length > 1 && (
              <>
                <button type="button" className="mu-lb__btn mu-lb__ant" onClick={() => mover(-1)} aria-label={t('md.anterior')}><i className="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
                <button type="button" className="mu-lb__btn mu-lb__sig" onClick={() => mover(1)} aria-label={t('md.siguiente')}><i className="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
              </>
            )}
            <p className="mu-lb__cuenta" aria-live="polite">{t('md.fotoCuenta', { n: actual + 1, total: fotos.length })}</p>
          </div>
        )}
      </dialog>
    </>
  )
}

export default GaleriaMuseo
