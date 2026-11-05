import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatearFechaLarga } from '../utils/fechas'
import { useIdioma } from '../hooks/useIdioma'

// Carrusel de eventos destacados de la portada (Bootstrap). Recibe la lista de charlas.
function Carrusel({ charlas }) {
  const { t } = useIdioma()
  const carruselRef = useRef(null)

  // Bootstrap solo arranca solo los carruseles que ya existen al cargar la página.
  // Como React dibuja este carrusel después, lo iniciamos acá para que avance automáticamente.
  useEffect(() => {
    const bootstrap = window.bootstrap
    if (!bootstrap || !carruselRef.current) return
    const instancia = bootstrap.Carousel.getOrCreateInstance(carruselRef.current, { interval: 6000, ride: 'carousel' })
    return () => instancia.dispose()
  }, [charlas])

  return (
    <div ref={carruselRef} id="carouselDestacados" className="carousel slide nc-carousel" data-bs-ride="carousel" data-bs-interval="6000" aria-label={t('index.carruselAria')}>
      <div className="carousel-indicators">
        {charlas.map((charla, i) => (
          <button
            key={charla.id}
            type="button"
            data-bs-target="#carouselDestacados"
            data-bs-slide-to={i}
            className={i === 0 ? 'active' : ''}
            aria-current={i === 0 ? 'true' : undefined}
            aria-label={`Evento ${i + 1}`}
          ></button>
        ))}
      </div>
      <div className="carousel-inner">
        {charlas.length === 0 && (
          <div className="carousel-item active">
            <div className="nc-slide__caption">
              <span className="nc-slide__etiqueta">{t('evt.destacado')}</span>
              <h2>{t('evt.sinCharlas')}</h2>
            </div>
          </div>
        )}
        {charlas.map((charla, i) => (
          <div key={charla.id} className={`carousel-item ${i === 0 ? 'active' : ''}`}>
            <img src={charla.imagen} alt={charla.titulo} />
            <div className="nc-slide__caption">
              <span className="nc-slide__etiqueta">{t('evt.destacado')}</span>
              <h2>{charla.titulo}</h2>
              <p>{formatearFechaLarga(charla.fecha)}, {charla.lugar}</p>
              <Link to={`/charlas/${charla.id}`} className="insc-btn insc-btn--primario">{t('act.verMas')}</Link>
            </div>
          </div>
        ))}
      </div>
      <button className="carousel-control-prev" type="button" data-bs-target="#carouselDestacados" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">{t('common.anterior')}</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#carouselDestacados" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">{t('common.siguiente')}</span>
      </button>
    </div>
  )
}

export default Carrusel
