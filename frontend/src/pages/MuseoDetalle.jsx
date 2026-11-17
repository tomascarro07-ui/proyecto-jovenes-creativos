import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import EtiquetaCupos from '../components/EtiquetaCupos'
import { ACTIVIDADES, capaBase, capaCalles, fechaLocal, porFecha, tieneImagen } from '../utils/leaflet'
import { useIdioma } from '../hooks/useIdioma'
import { tt } from '../i18n/motor'
import TextoRico from '../components/TextoRico'
import GaleriaMuseo from '../components/museos/GaleriaMuseo'
import { museoCerrado, parrafos } from '../utils/museos'

function textoFecha(actividad) {
  const fecha = fechaLocal(actividad.fecha)
  if (!fecha) return tt('md.fechaConfirmar')
  return fecha.toLocaleDateString(tt('fecha.locale'), { weekday: 'short', day: 'numeric', month: 'long' }) + (actividad.hora ? ' · ' + actividad.hora : '')
}

function FilaActividad({ actividad }) {
  const tp = ACTIVIDADES[actividad.tipo]
  return (
    <Link className={`md-act tipo-${actividad.tipo}${actividad.finalizada ? ' md-act--fin' : ''}`} to={tp.url(actividad.id)}>
      <span className="md-act__icono"><i className={`fa-solid ${tp.icono}`} aria-hidden="true"></i></span>
      <span className="md-act__info">
        <small>{tp.nombre}{actividad.virtual ? ' · ' + tt('dato.Virtual') : ''}</small>
        <strong>{actividad.titulo}</strong>
        <span><i className="fa-regular fa-calendar" aria-hidden="true"></i> {textoFecha(actividad)}</span>
      </span>
      <EtiquetaCupos actividad={actividad} />
      <i className="fa-solid fa-chevron-right md-act__flecha" aria-hidden="true"></i>
    </Link>
  )
}

function MapaMini({ museo }) {
  const { t } = useIdioma()
  const elemento = useRef(null)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    let mini = null
    try {
      const L = window.L
      mini = L.map(elemento.current, { center: [museo.lat, museo.lng], zoom: 17, scrollWheelZoom: false })
      capaBase().addTo(mini)
      capaCalles().addTo(mini)
      L.marker([museo.lat, museo.lng], {
        keyboard: false,
        icon: L.divIcon({
          className: 'nc-pin-wrap',
          html: '<div class="nc-pin tipo-museo"><i class="fa-solid fa-landmark"></i></div>',
          iconSize: [36, 44],
          iconAnchor: [18, 44],
        }),
      }).addTo(mini)
    } catch (error) {
      console.error('No se pudo dibujar el mapa:', error)
      setTimeout(() => setFallo(true))
    }
    return () => {
      if (mini) mini.remove()
    }
  }, [museo.lat, museo.lng])

  if (fallo) return <p className="md-vacio">{t('md.mapaFalla')}</p>
  return <div ref={elemento} id="museoMini" className="museo-det__mapa md-mapa" role="img" aria-label={tt('md.mapaAria', { nombre: museo.nombre })}></div>
}

function MuseoDetalle() {
  const { t } = useIdioma()
  const { idMuseo } = useParams()
  const { datos, cargando, error } = useCarga(
    async () => {
      const museo = await api.museo(idMuseo)
      const [puntos, museos] = await Promise.all([
        api.mapa().catch(() => []),
        api.museos().catch(() => []),
      ])
      return { museo, puntos, museos }
    },
    [idMuseo],
  )
  const [aviso, setAviso] = useState('')

  const museo = datos && datos.museo
  useEffect(() => {
    document.title = museo ? 'Nodo Cultural - ' + museo.nombre : 'Nodo Cultural'
  }, [museo])

  useEffect(() => {
    if (!aviso) return
    const espera = setTimeout(() => setAviso(''), 2500)
    return () => clearTimeout(espera)
  }, [aviso])

  async function compartir() {
    const museoActual = museo
    try {
      if (navigator.share) {
        await navigator.share({ title: museoActual.nombre, text: museoActual.nombre + ' · Nodo Cultural', url: window.location.href })
        return
      }
      await navigator.clipboard.writeText(window.location.href)
      setAviso(t('md.copiado'))
    } catch (error) {
      if (error && error.name === 'AbortError') return
      setAviso(t('md.noCopio'))
    }
  }

  let contenido
  if (cargando) {
    contenido = <p className="museo-det__vacio">{t('md.cargando')}</p>
  } else if (error && error.status !== 404 && error.status !== 400) {
    contenido = <p className="admin-vacio">{t('api.errorServidor')}</p>
  } else if (error) {
    contenido = (
      <div className="insc-vacio">
        <i className="fa-solid fa-landmark" aria-hidden="true"></i>
        <h2>{t('md.noEncH')}</h2>
        <p>{t('md.noEncP')}</p>
        <Link className="insc-btn insc-btn--primario" to="/museos">{t('md.verTodosMuseos')}</Link>
      </div>
    )
  } else {
    const museoActual = datos.museo
    const delMuseo = datos.puntos.filter((punto) => punto.tipo !== 'museo' && punto.museoId === museoActual.id)
    const proximas = delMuseo.filter((actividad) => !actividad.finalizada).sort(porFecha)
    const pasadas = delMuseo.filter((actividad) => actividad.finalizada).sort(porFecha).reverse()
    const otros = datos.museos.filter((otroMuseo) => otroMuseo.id !== museoActual.id).slice(0, 3)
    const destino = encodeURIComponent(museoActual.lat + ',' + museoActual.lng)
    const enlaceRuta = `https://www.google.com/maps/dir/?api=1&destination=${destino}`
    const textos = parrafos(museoActual.historia)
    const cerrado = museoCerrado(museoActual)
    contenido = (
      <>
        <nav className="md-migas" aria-label={t('md.ubicacionAria')}>
          <Link to="/">{t('ft.inicio')}</Link><i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
          <Link to="/museos">{t('ft.museos')}</Link><i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
          <span aria-current="page">{museoActual.nombre}</span>
        </nav>
        <article className="mu-portada">
          {tieneImagen(museoActual) && <img className="mu-portada__img" src={museoActual.imagen} alt={t('md.fachada', { nombre: museoActual.nombre })} />}
          <div className="mu-portada__texto">
            <div className="mu-portada__chips">
              <span className="mu-chip">{t('md.coleccion')}</span>
              <span className="mu-chip">{museoActual.tipo}</span>
              {cerrado && <span className="mu-chip mu-chip--aviso">{t('museos.cerrado')}</span>}
            </div>
            <h1>{museoActual.nombre}</h1>
            {museoActual.gancho && <p className="mu-portada__gancho">{museoActual.gancho}</p>}
          </div>
          <ul className="mu-barra" aria-label={t('md.info')} style={{ listStyle: 'none' }}>
            <li className="mu-barra__dato">
              <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
              <span><small>{t('md.direccion')}</small><strong>{museoActual.direccion || t('md.dirDefault')}</strong></span>
            </li>
            <li className="mu-barra__dato">
              <i className="fa-regular fa-clock" aria-hidden="true"></i>
              <span><small>{t('md.horario')}</small><strong>{museoActual.horario || t('md.horarioDefault')}</strong></span>
            </li>
            <li className="mu-barra__dato">
              <button type="button" id="mdCompartir" onClick={compartir}>
                <i className="fa-solid fa-share-nodes" aria-hidden="true"></i>
                <span><small>{t('md.compartir')}</small><strong>{t('md.compartirAmigo')}</strong></span>
              </button>
            </li>
            <li className="mu-barra__acc">
              <a className="insc-btn insc-btn--primario" href={enlaceRuta} target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-route" aria-hidden="true"></i> {t('md.comoLlegar')}</a>
            </li>
          </ul>
        </article>
        <div className="mu-cols">
          <div className="mu-principal">
            <section className="mu-sec" aria-labelledby="muHistoria">
              <h2 id="muHistoria">{t('md.historia')}</h2>
              <p className="mu-texto">{museoActual.descripcionCorta}</p>
              {textos.map((parrafo, posicion) => <p className="mu-texto" key={posicion}>{parrafo}</p>)}
              {museoActual.datoCurioso && (
                <blockquote className="mu-dato">
                  <small>{t('md.datoCurioso')}</small>
                  <p>{museoActual.datoCurioso}</p>
                </blockquote>
              )}
            </section>
            {museoActual.destacados && museoActual.destacados.length > 0 && (
              <section className="mu-sec" aria-labelledby="muVer">
                <h2 id="muVer">{t('md.queVer')}</h2>
                <div className="mu-ver">
                  {museoActual.destacados.map((destacado, posicion) => (
                    <div className="mu-ver__item" key={posicion}>
                      <span className="mu-ver__num" aria-hidden="true">{posicion + 1}</span>
                      <strong>{destacado.titulo}</strong>
                      {destacado.texto && <span>{destacado.texto}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {museoActual.galeria && museoActual.galeria.length > 0 && (
              <section className="mu-sec" aria-labelledby="muGaleria">
                <h2 id="muGaleria">{t('md.galeria')}</h2>
                <GaleriaMuseo fotos={museoActual.galeria} nombre={museoActual.nombre} />
              </section>
            )}
            <section className="mu-sec" aria-labelledby="mdActTitulo">
              <h2 id="mdActTitulo">{t('md.actTitulo')}</h2>
              {proximas.length
                ? <div className="mu-acts">{proximas.map((actividad) => <FilaActividad key={actividad.tipo + actividad.id} actividad={actividad} />)}</div>
                : <p className="md-vacio"><TextoRico clave="md.sinActs" /></p>}
              {pasadas.length > 0 && (
                <details className="md-pasadas">
                  <summary>{t('md.finalizadas', { n: pasadas.length })}</summary>
                  <div className="mu-acts">{pasadas.map((actividad) => <FilaActividad key={actividad.tipo + actividad.id} actividad={actividad} />)}</div>
                </details>
              )}
            </section>
          </div>
          <aside className="mu-lateral" aria-label={t('md.ubicacion')}>
            <section className="mu-caja">
              <h2>{t('md.ubicacion')}</h2>
              <MapaMini museo={museoActual} />
              <dl className="mu-info">
                <div><dt><i className="fa-solid fa-tag" aria-hidden="true"></i> {t('md.tipo')}</dt><dd>{museoActual.tipo}</dd></div>
                {museoActual.entrada && <div><dt><i className="fa-solid fa-ticket" aria-hidden="true"></i> {t('md.entrada')}</dt><dd>{museoActual.entrada}</dd></div>}
                {museoActual.accesibilidad && <div><dt><i className="fa-solid fa-universal-access" aria-hidden="true"></i> {t('md.accesibilidad')}</dt><dd>{museoActual.accesibilidad}</dd></div>}
              </dl>
              <a className="nc-btn nc-btn--outline md-btn-bloque" href={enlaceRuta} target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-route" aria-hidden="true"></i> {t('md.indicaciones')}</a>
              <Link className="nc-btn nc-btn--outline md-btn-bloque" to={`/mapa?foco=museo:${encodeURIComponent(museoActual.id)}`}><i className="fa-solid fa-map-location-dot" aria-hidden="true"></i> {t('md.verMapa')}</Link>
            </section>
          </aside>
        </div>
        {otros.length > 0 && (
          <section className="mu-sec" aria-labelledby="mdOtrosTitulo">
            <div className="mu-cab">
              <h2 id="mdOtrosTitulo">{t('md.otros')}</h2>
              <Link to="/museos">{t('common.verTodos')}</Link>
            </div>
            <div className="mu-otros">
              {otros.map((otroMuseo) => (
                <Link className="mu-otro" to={`/museos/${encodeURIComponent(otroMuseo.id)}`} key={otroMuseo.id}>
                  <div className="mu-otro__media">{tieneImagen(otroMuseo) && <img src={otroMuseo.imagen} alt="" loading="lazy" />}</div>
                  <div className="mu-otro__texto"><small>{otroMuseo.tipo}</small><strong>{otroMuseo.nombre}</strong>{otroMuseo.gancho && <span>{otroMuseo.gancho}</span>}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
        <p className="md-volver"><Link className="insc-btn" to="/museos"><i className="fa-solid fa-arrow-left" aria-hidden="true"></i> {t('md.volver')}</Link></p>
      </>
    )
  }

  return (
    <main className="mu-det" id="contenido">
      <div id="museoDetalle" aria-live="polite">{contenido}</div>
      {aviso && <div id="mdAviso" className="cuenta-aviso cuenta-aviso--visible" role="status">{aviso}</div>}
    </main>
  )
}

export default MuseoDetalle
