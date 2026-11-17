import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import EtiquetaCupos from '../components/EtiquetaCupos'
import {
  ACTIVIDADES, CENTRO_COLONIA, LIMITES_COLONIA, capaBase, capaCalles, fechaLocal, porFecha, tieneImagen,
} from '../utils/leaflet'
import { useIdioma } from '../hooks/useIdioma'
import { tt } from '../i18n/motor'

const TIPOS = Object.keys(ACTIVIDADES)

function textoFecha(punto) {
  const fecha = fechaLocal(punto.fecha)
  if (!fecha) return ''
  return fecha.toLocaleDateString(tt('fecha.locale'), { day: 'numeric', month: 'long' }) + (punto.hora ? ' · ' + punto.hora : '')
}

function agrupar(puntos) {
  const grupos = new Map()
  puntos.forEach((punto) => {
    const clave = punto.museoId ? 'm:' + punto.museoId : punto.lat.toFixed(4) + ',' + punto.lng.toFixed(4)
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(punto)
  })
  return Array.from(grupos.entries()).map(([clave, items]) => ({ clave, items }))
}

function ItemPunto({ punto }) {
  const { t } = useIdioma()
  const tp = ACTIVIDADES[punto.tipo]
  return (
    <article className={`mc-item tipo-${punto.tipo}`}>
      {punto.imagen
        ? <img className="mc-item__img" src={punto.imagen} alt="" loading="lazy" />
        : <div className="mc-item__img mc-item__img--vacia"><i className={`fa-solid ${tp.icono}`}></i></div>}
      <div className="mc-item__cuerpo">
        <span className="mc-badge"><i className={`fa-solid ${tp.icono}`}></i> {tp.nombre}{punto.virtual ? ' · ' + tt('dato.Virtual') : ''}{punto.subtitulo ? ' · ' + punto.subtitulo : ''}</span>
        <h3>{punto.titulo}</h3>
        <p><i className="fa-solid fa-location-dot"></i> {punto.lugar || ''}</p>
        {punto.fecha && <p><i className="fa-regular fa-calendar"></i> {textoFecha(punto)}</p>}
        {punto.horario && <p><i className="fa-regular fa-clock"></i> {punto.horario}</p>}
        <EtiquetaCupos actividad={punto} />
        <Link className="insc-btn insc-btn--primario" to={tp.url(punto.id)}>{t('mapa.verDetalle')} <i className="fa-solid fa-arrow-right"></i></Link>
      </div>
    </article>
  )
}

function TarjetaMuseo({ museo, actividades }) {
  const { t } = useIdioma()
  return (
    <article className="mc-museo tipo-museo">
      <div className="mc-museo__media">
        {tieneImagen(museo)
          ? <img className="mc-museo__img" src={museo.imagen} alt={museo.titulo} />
          : <div className="mc-museo__img mc-museo__img--vacia"><i className="fa-solid fa-landmark"></i></div>}
        <span className="mc-badge mc-badge--sobre"><i className="fa-solid fa-landmark"></i> Museo{museo.subtitulo ? ' · ' + museo.subtitulo : ''}</span>
      </div>
      <div className="mc-item__cuerpo">
        <h3>{museo.titulo}</h3>
        <p><i className="fa-solid fa-location-dot"></i> {museo.lugar || ''}</p>
        {museo.horario && <p><i className="fa-regular fa-clock"></i> {museo.horario}</p>}
        {museo.descripcion && <p className="mc-museo__desc">{museo.descripcion}</p>}
        <Link className="insc-btn insc-btn--primario" to={ACTIVIDADES.museo.url(museo.id)}>{t('mapa.verMuseo')} <i className="fa-solid fa-arrow-right"></i></Link>
      </div>
      <section className="mc-actividades">
        <h4>{t('md.actTitulo')} <span>{actividades.length}</span></h4>
        {actividades.length
          ? actividades.map((punto) => {
            const tp = ACTIVIDADES[punto.tipo]
            return (
              <Link className={`mc-act tipo-${punto.tipo}`} to={tp.url(punto.id)} key={punto.tipo + punto.id}>
                <span className="mc-act__icono"><i className={`fa-solid ${tp.icono}`}></i></span>
                <span className="mc-act__info">
                  <strong>{punto.titulo}</strong>
                  <small>{tp.nombre}{punto.virtual ? ' · ' + tt('dato.Virtual') : ''}{punto.fecha ? ' · ' + textoFecha(punto) : ''}</small>
                  <EtiquetaCupos actividad={punto} />
                </span>
                <i className="fa-solid fa-chevron-right"></i>
              </Link>
            )
          })
          : <p className="mc-act__vacio">{t('mapa.sinActs')}</p>}
      </section>
    </article>
  )
}

function Mapa() {
  const { t } = useIdioma()
  const { datos: puntos, cargando, error } = useCarga(() => api.mapa(), [])
  const [parametros] = useSearchParams()
  const foco = parametros.get('foco')

  const [tiposActivos, setTiposActivos] = useState(() => new Set(TIPOS))
  const [finalizadasManual, setFinalizadasManual] = useState(null)
  const [nombresDeCalles, setNombresDeCalles] = useState(false)
  const [claveManual, setClaveManual] = useState(undefined)

  const contenedorRef = useRef(null)
  const mapaRef = useRef(null)
  const capasRef = useRef({ marcadores: null, calles: null })
  const marcadoresRef = useRef(new Map())
  const encuadrado = useRef(false)

  const lista = useMemo(() => puntos || [], [puntos])
  const puntoFoco = useMemo(() => {
    if (!foco) return null
    const [tipo, id] = foco.split(':')
    return lista.find((punto) => punto.tipo === tipo && punto.id === id) || null
  }, [foco, lista])

  let finalizadas = Boolean(puntoFoco && puntoFoco.finalizada)
  if (finalizadasManual !== null && finalizadasManual !== undefined) finalizadas = finalizadasManual

  const visibles = useMemo(
    () => lista.filter((punto) => tiposActivos.has(punto.tipo) && (finalizadas || !punto.finalizada)),
    [lista, tiposActivos, finalizadas],
  )
  const grupos = useMemo(() => agrupar(visibles), [visibles])

  const claveFoco = useMemo(() => {
    if (!puntoFoco) return null
    const grupoDelFoco = grupos.find((grupo) => grupo.items.includes(puntoFoco))
    return grupoDelFoco ? grupoDelFoco.clave : null
  }, [puntoFoco, grupos])
  const claveAbierta = claveManual === undefined ? claveFoco : claveManual
  const grupoAbierto = grupos.find((grupo) => grupo.clave === claveAbierta) || null

  function actividadesDelMuseo(idMuseo) {
    return lista
      .filter((punto) => punto.museoId === idMuseo && punto.tipo !== 'museo' && (finalizadas || !punto.finalizada))
      .sort(porFecha)
  }

  useEffect(() => {
    const L = window.L
    const mapa = L.map(contenedorRef.current, {
      center: CENTRO_COLONIA, zoom: 15, minZoom: 12, maxZoom: 18, maxBounds: LIMITES_COLONIA, maxBoundsViscosity: 0.9,
    })
    capaBase().addTo(mapa)
    capasRef.current = { marcadores: L.layerGroup().addTo(mapa), calles: capaCalles() }
    mapa.on('click', () => setClaveManual(null))
    mapaRef.current = mapa
    return () => {
      mapa.remove()
      mapaRef.current = null
      encuadrado.current = false
    }
  }, [])

  useEffect(() => {
    const mapa = mapaRef.current
    const { calles } = capasRef.current
    if (!mapa || !calles) return
    if (nombresDeCalles) calles.addTo(mapa)
    else mapa.removeLayer(calles)
  }, [nombresDeCalles])

  useEffect(() => {
    const L = window.L
    const { marcadores } = capasRef.current
    if (!marcadores) return
    marcadores.clearLayers()
    marcadoresRef.current = new Map()
    grupos.forEach(({ clave, items }) => {
      const museo = items.find((punto) => punto.tipo === 'museo')
      const rep = museo || items[0]
      let insignia = 0
      if (museo) {
        const actividadesDelMuseo = lista.filter((punto) => punto.museoId === museo.id && punto.tipo !== 'museo' && (finalizadas || !punto.finalizada))
        insignia = actividadesDelMuseo.length
      } else if (items.length > 1) {
        insignia = items.length
      }
      let tituloDelPin = rep.titulo
      if (museo) tituloDelPin = museo.titulo
      else if (items.length > 1) tituloDelPin = t('mapa.propsLugar', { n: items.length })
      const marcador = L.marker([rep.lat, rep.lng], {
        icon: L.divIcon({
          className: 'nc-pin-wrap',
          html: `<div class="nc-pin tipo-${rep.tipo}"><i class="fa-solid ${ACTIVIDADES[rep.tipo].icono}"></i>${insignia > 0 ? `<span class="nc-pin__n">${insignia}</span>` : ''}</div>`,
          iconSize: [36, 44],
          iconAnchor: [18, 44],
        }),
        title: tituloDelPin,
        riseOnHover: true,
      })
      marcador.on('click', (evento) => {
        L.DomEvent.stopPropagation(evento)
        setClaveManual(clave)
        mapaRef.current.panTo(marcador.getLatLng(), { animate: true, duration: 0.5 })
      })
      marcador.addTo(marcadores)
      marcadoresRef.current.set(clave, marcador)
    })
  }, [grupos, lista, finalizadas, t])

  useEffect(() => {
    document.querySelectorAll('.nc-pin--sel').forEach((el) => el.classList.remove('nc-pin--sel'))
    const marcador = marcadoresRef.current.get(claveAbierta)
    const el = marcador && marcador.getElement()
    if (el) el.querySelector('.nc-pin').classList.add('nc-pin--sel')
  }, [claveAbierta, grupos])

  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa || encuadrado.current || !lista.length) return
    encuadrado.current = true
    if (puntoFoco) {
      mapa.setView([puntoFoco.lat, puntoFoco.lng], 17)
    } else {
      const coords = visibles.map((punto) => [punto.lat, punto.lng])
      if (coords.length) mapa.fitBounds(coords, { padding: [70, 70], maxZoom: 16 })
    }
  }, [lista, puntoFoco, visibles])

  useEffect(() => {
    const alTeclear = (evento) => {
      if (evento.key === 'Escape') setClaveManual(null)
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [])

  function alternarTipo(tipo) {
    setClaveManual(null)
    setTiposActivos((actuales) => {
      const nuevos = new Set(actuales)
      if (nuevos.has(tipo)) nuevos.delete(tipo)
      else nuevos.add(tipo)
      return nuevos
    })
  }

  let tarjeta = null
  if (grupoAbierto) {
    const museo = grupoAbierto.items.find((punto) => punto.tipo === 'museo')
    tarjeta = museo
      ? <TarjetaMuseo museo={museo} actividades={actividadesDelMuseo(museo.id)} />
      : (
        <>
          {grupoAbierto.items.length > 1 && (
            <p className="mc-grupo"><strong>{t('mapa.nProps', { n: grupoAbierto.items.length })}</strong> {t('mapa.enEsteLugar')}</p>
          )}
          {grupoAbierto.items.map((punto) => <ItemPunto key={punto.tipo + punto.id} punto={punto} />)}
        </>
      )
  }

  return (
    <main id="contenido" className="mapa-main">
      <header className="mapa-cabecera">
        <p className="insc-hero__eyebrow">{t('mapa.eyebrow')}</p>
        <h1>{t('nav.mapa')}</h1>
        <p>
          {t('mapa.hero')}
        </p>
      </header>
      <div className="mapa-barra">
        <div className="mapa-chips" id="mapaFiltros">
          {TIPOS.map((tipo) => {
            const total = lista.filter((punto) => punto.tipo === tipo && (finalizadas || !punto.finalizada)).length
            const activo = tiposActivos.has(tipo)
            return (
              <button type="button" key={tipo} className={`mapa-chip tipo-${tipo}${activo ? ' is-on' : ''}`} aria-pressed={activo} onClick={() => alternarTipo(tipo)}>
                <i className={`fa-solid ${ACTIVIDADES[tipo].icono}`}></i> {ACTIVIDADES[tipo].plural} <span>{total}</span>
              </button>
            )
          })}
        </div>
        <div className="mapa-opciones">
          <label className="mapa-switch">
            <input type="checkbox" id="optFinalizadas" checked={finalizadas} onChange={(evento) => { setClaveManual(null); setFinalizadasManual(evento.target.checked) }} />
            <span>{t('mapa.finalizadas')}</span>
          </label>
          {' '}
          <label className="mapa-switch">
            <input type="checkbox" id="optCalles" checked={nombresDeCalles} onChange={(evento) => setNombresDeCalles(evento.target.checked)} />
            <span>{t('mapa.calles')}</span>
          </label>
        </div>
      </div>
      <div className="mapa-contenedor">
        <div id="mapaCultural" ref={contenedorRef} role="application" aria-label={t('mapa.aria')}></div>
        {error && <p className="admin-vacio" role="alert">{t('api.errorServidor')}</p>}
        <aside className="mapa-tarjeta" id="mapaTarjeta" hidden={!tarjeta} aria-live="polite">
          {tarjeta && (
            <>
              <button type="button" className="mc-cerrar" aria-label={t('modal.cerrar')} onClick={() => setClaveManual(null)}><i className="fa-solid fa-xmark"></i></button>
              {tarjeta}
            </>
          )}
        </aside>
        <div className="mapa-vacio" id="mapaVacio" hidden={cargando || Boolean(error) || visibles.length > 0}>
          <i className="fa-regular fa-map"></i>
          <p>{t('mapa.vacio')}</p>
        </div>
      </div>
    </main>
  )
}

export default Mapa
