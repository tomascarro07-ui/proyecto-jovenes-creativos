import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import EtiquetaCupos from '../components/EtiquetaCupos'
import { ACTIVIDADES, capaBase, capaCalles, fechaLocal, porFecha, tieneImagen } from '../utils/leaflet'
import { useIdioma } from '../hooks/useIdioma'
import { tt } from '../i18n/motor'
import TextoRico from '../components/TextoRico'

function textoFecha(a) {
  const d = fechaLocal(a.fecha)
  if (!d) return tt('md.fechaConfirmar')
  return d.toLocaleDateString(tt('fecha.locale'), { weekday: 'short', day: 'numeric', month: 'long' }) + (a.hora ? ' · ' + a.hora : '')
}

function FilaActividad({ actividad: a }) {
  const tp = ACTIVIDADES[a.tipo]
  return (
    <Link className={`md-act tipo-${a.tipo}${a.finalizada ? ' md-act--fin' : ''}`} to={tp.url(a.id)}>
      <span className="md-act__icono"><i className={`fa-solid ${tp.icono}`} aria-hidden="true"></i></span>
      <span className="md-act__info">
        <small>{tp.nombre}{a.virtual ? ' · ' + tt('dato.Virtual') : ''}</small>
        <strong>{a.titulo}</strong>
        <span><i className="fa-regular fa-calendar" aria-hidden="true"></i> {textoFecha(a)}</span>
      </span>
      <EtiquetaCupos actividad={a} />
      <i className="fa-solid fa-chevron-right md-act__flecha" aria-hidden="true"></i>
    </Link>
  )
}

// Mapa pequeño con la ubicación del museo. Es un extra: si falla (por ejemplo, Leaflet bloqueado), el resto sigue.
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
    } catch (e) {
      console.error('No se pudo dibujar el mapa:', e)
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
      // Actividades y otros museos son complementos: si fallan, se muestra igual la ficha.
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
    const m = museo
    try {
      if (navigator.share) {
        await navigator.share({ title: m.nombre, text: m.nombre + ' · Nodo Cultural', url: window.location.href })
        return
      }
      await navigator.clipboard.writeText(window.location.href)
      setAviso(t('md.copiado'))
    } catch (e) {
      if (e && e.name === 'AbortError') return // la persona cerró el menú de compartir
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
    const m = datos.museo
    const delMuseo = datos.puntos.filter((p) => p.tipo !== 'museo' && p.museoId === m.id)
    const proximas = delMuseo.filter((a) => !a.finalizada).sort(porFecha)
    const pasadas = delMuseo.filter((a) => a.finalizada).sort(porFecha).reverse()
    const otros = datos.museos.filter((o) => o.id !== m.id).slice(0, 3)
    const destino = encodeURIComponent(m.lat + ',' + m.lng)
    const enlaceRuta = `https://www.google.com/maps/dir/?api=1&destination=${destino}`
    contenido = (
      <>
        <nav className="md-migas" aria-label={t('md.ubicacionAria')}>
          <Link to="/">{t('ft.inicio')}</Link><i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
          <Link to="/museos">{t('ft.museos')}</Link><i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
          <span aria-current="page">{m.nombre}</span>
        </nav>
        <article className="md-hero tipo-museo">
          {tieneImagen(m)
            ? <img className="md-hero__img" src={m.imagen} alt={t('md.fachada', { nombre: m.nombre })} />
            : <div className="md-hero__img md-hero__img--vacia"><i className="fa-solid fa-landmark" aria-hidden="true"></i></div>}
          <div className="md-hero__cuerpo">
            <span className="mc-badge"><i className="fa-solid fa-landmark" aria-hidden="true"></i> Museo · {m.tipo}</span>
            <h1>{m.nombre}</h1>
            <ul className="md-datos-rapidos">
              {m.direccion && <li><i className="fa-solid fa-location-dot" aria-hidden="true"></i> {m.direccion}</li>}
              {m.horario && <li><i className="fa-regular fa-clock" aria-hidden="true"></i> {m.horario}</li>}
              <li>
                <i className="fa-regular fa-calendar-check" aria-hidden="true"></i>
                {' '}
                {proximas.length ? t(proximas.length === 1 ? 'md.proxUna' : 'md.proxVarias', { n: proximas.length }) : t('md.sinProx')}
              </li>
            </ul>
            <div className="md-acciones">
              <a className="insc-btn insc-btn--primario" href={enlaceRuta} target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-route" aria-hidden="true"></i> {t('md.comoLlegar')}</a>
              <Link className="insc-btn" to={`/mapa?foco=museo:${encodeURIComponent(m.id)}`}><i className="fa-solid fa-map-location-dot" aria-hidden="true"></i> {t('md.verMapa')}</Link>
              <button type="button" className="insc-btn" id="mdCompartir" onClick={compartir}><i className="fa-solid fa-share-nodes" aria-hidden="true"></i> {t('md.compartir')}</button>
            </div>
          </div>
        </article>
        <div className="md-columnas">
          <div className="md-col-principal">
            <section className="md-bloque" aria-labelledby="mdSobreTitulo">
              <h2 id="mdSobreTitulo"><i className="fa-solid fa-circle-info" aria-hidden="true"></i> {t('md.sobre')}</h2>
              <p className="md-texto">{m.descripcionCorta}</p>
            </section>
            <section className="md-bloque" aria-labelledby="mdActTitulo">
              <h2 id="mdActTitulo"><i className="fa-regular fa-calendar-check" aria-hidden="true"></i> {t('md.actTitulo')}</h2>
              {proximas.length
                ? <div className="md-acts">{proximas.map((a) => <FilaActividad key={a.tipo + a.id} actividad={a} />)}</div>
                : <p className="md-vacio"><TextoRico clave="md.sinActs" /></p>}
              {pasadas.length > 0 && (
                <details className="md-pasadas">
                  <summary>Actividades finalizadas ({pasadas.length})</summary>
                  <div className="md-acts">{pasadas.map((a) => <FilaActividad key={a.tipo + a.id} actividad={a} />)}</div>
                </details>
              )}
            </section>
          </div>
          <aside className="md-col-lateral" aria-label={t('md.info')}>
            <section className="md-bloque md-bloque--mapa">
              <MapaMini museo={m} />
              <dl className="md-info">
                <div><dt><i className="fa-solid fa-location-dot" aria-hidden="true"></i> {t('md.direccion')}</dt><dd>{m.direccion || t('md.dirDefault')}</dd></div>
                <div><dt><i className="fa-regular fa-clock" aria-hidden="true"></i> {t('md.horario')}</dt><dd>{m.horario || t('md.horarioDefault')}</dd></div>
                <div><dt><i className="fa-solid fa-tag" aria-hidden="true"></i> {t('md.tipo')}</dt><dd>{m.tipo}</dd></div>
              </dl>
              <a className="nc-btn nc-btn--outline md-btn-bloque" href={enlaceRuta} target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-route" aria-hidden="true"></i> {t('md.indicaciones')}</a>
            </section>
          </aside>
        </div>
        {otros.length > 0 && (
          <section className="md-bloque" aria-labelledby="mdOtrosTitulo">
            <div className="md-bloque__cab">
              <h2 id="mdOtrosTitulo"><i className="fa-solid fa-landmark" aria-hidden="true"></i> {t('md.otros')}</h2>
              <Link to="/museos">{t('common.verTodos')}</Link>
            </div>
            <div className="md-otros">
              {otros.map((o) => (
                <Link className="md-otro" to={`/museos/${encodeURIComponent(o.id)}`} key={o.id}>
                  <div className="md-otro__media">
                    {tieneImagen(o)
                      ? <img src={o.imagen} alt="" loading="lazy" />
                      : <span className="md-otro__ico"><i className="fa-solid fa-landmark" aria-hidden="true"></i></span>}
                  </div>
                  <div className="md-otro__texto"><small>{o.tipo}</small><strong>{o.nombre}</strong></div>
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
    <main className="museo-det md-pagina" id="contenido">
      <div id="museoDetalle" aria-live="polite">{contenido}</div>
      {aviso && <div id="mdAviso" className="cuenta-aviso cuenta-aviso--visible" role="status">{aviso}</div>}
    </main>
  )
}

export default MuseoDetalle
