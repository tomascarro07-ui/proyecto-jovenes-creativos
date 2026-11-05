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

function textoFecha(p) {
  const d = fechaLocal(p.fecha)
  if (!d) return ''
  return d.toLocaleDateString(tt('fecha.locale'), { day: 'numeric', month: 'long' }) + (p.hora ? ' · ' + p.hora : '')
}

// Las propuestas de un mismo museo (o del mismo punto) comparten un único pin
function agrupar(puntos) {
  const grupos = new Map()
  puntos.forEach((p) => {
    const clave = p.museoId ? 'm:' + p.museoId : p.lat.toFixed(4) + ',' + p.lng.toFixed(4)
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(p)
  })
  return Array.from(grupos.entries()).map(([clave, items]) => ({ clave, items }))
}

function ItemPunto({ punto: p }) {
  const { t } = useIdioma()
  const tp = ACTIVIDADES[p.tipo]
  return (
    <article className={`mc-item tipo-${p.tipo}`}>
      {p.imagen
        ? <img className="mc-item__img" src={p.imagen} alt="" loading="lazy" />
        : <div className="mc-item__img mc-item__img--vacia"><i className={`fa-solid ${tp.icono}`}></i></div>}
      <div className="mc-item__cuerpo">
        <span className="mc-badge"><i className={`fa-solid ${tp.icono}`}></i> {tp.nombre}{p.virtual ? ' · ' + tt('dato.Virtual') : ''}{p.subtitulo ? ' · ' + p.subtitulo : ''}</span>
        <h3>{p.titulo}</h3>
        <p><i className="fa-solid fa-location-dot"></i> {p.lugar || ''}</p>
        {p.fecha && <p><i className="fa-regular fa-calendar"></i> {textoFecha(p)}</p>}
        {p.horario && <p><i className="fa-regular fa-clock"></i> {p.horario}</p>}
        <EtiquetaCupos actividad={p} />
        <Link className="insc-btn insc-btn--primario" to={tp.url(p.id)}>{t('mapa.verDetalle')} <i className="fa-solid fa-arrow-right"></i></Link>
      </div>
    </article>
  )
}

function TarjetaMuseo({ museo: m, actividades }) {
  const { t } = useIdioma()
  return (
    <article className="mc-museo tipo-museo">
      <div className="mc-museo__media">
        {tieneImagen(m)
          ? <img className="mc-museo__img" src={m.imagen} alt={m.titulo} />
          : <div className="mc-museo__img mc-museo__img--vacia"><i className="fa-solid fa-landmark"></i></div>}
        <span className="mc-badge mc-badge--sobre"><i className="fa-solid fa-landmark"></i> Museo{m.subtitulo ? ' · ' + m.subtitulo : ''}</span>
      </div>
      <div className="mc-item__cuerpo">
        <h3>{m.titulo}</h3>
        <p><i className="fa-solid fa-location-dot"></i> {m.lugar || ''}</p>
        {m.horario && <p><i className="fa-regular fa-clock"></i> {m.horario}</p>}
        {m.descripcion && <p className="mc-museo__desc">{m.descripcion}</p>}
        <Link className="insc-btn insc-btn--primario" to={ACTIVIDADES.museo.url(m.id)}>{t('mapa.verMuseo')} <i className="fa-solid fa-arrow-right"></i></Link>
      </div>
      <section className="mc-actividades">
        <h4>{t('md.actTitulo')} <span>{actividades.length}</span></h4>
        {actividades.length
          ? actividades.map((p) => {
            const tp = ACTIVIDADES[p.tipo]
            return (
              <Link className={`mc-act tipo-${p.tipo}`} to={tp.url(p.id)} key={p.tipo + p.id}>
                <span className="mc-act__icono"><i className={`fa-solid ${tp.icono}`}></i></span>
                <span className="mc-act__info">
                  <strong>{p.titulo}</strong>
                  <small>{tp.nombre}{p.virtual ? ' · ' + tt('dato.Virtual') : ''}{p.fecha ? ' · ' + textoFecha(p) : ''}</small>
                  <EtiquetaCupos actividad={p} />
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
  const foco = parametros.get('foco') // por ejemplo "museo:123": abre ese punto al entrar

  const [tiposActivos, setTiposActivos] = useState(() => new Set(TIPOS))
  const [finalizadasManual, setFinalizadasManual] = useState(null) // null = automático (según el punto enfocado)
  const [nombresDeCalles, setNombresDeCalles] = useState(false)
  const [claveManual, setClaveManual] = useState(undefined) // undefined = todavía no tocó nada

  const contenedorRef = useRef(null)
  const mapaRef = useRef(null)
  const capasRef = useRef({ marcadores: null, calles: null })
  const marcadoresRef = useRef(new Map()) // clave de grupo -> marcador de Leaflet
  const encuadrado = useRef(false)

  const lista = useMemo(() => puntos || [], [puntos])
  const puntoFoco = useMemo(() => {
    if (!foco) return null
    const [tipo, id] = foco.split(':')
    return lista.find((p) => p.tipo === tipo && p.id === id) || null
  }, [foco, lista])

  // Si el punto enfocado ya terminó, se muestran las finalizadas para poder verlo
  const finalizadas = finalizadasManual ?? !!(puntoFoco && puntoFoco.finalizada)

  const visibles = useMemo(
    () => lista.filter((p) => tiposActivos.has(p.tipo) && (finalizadas || !p.finalizada)),
    [lista, tiposActivos, finalizadas],
  )
  const grupos = useMemo(() => agrupar(visibles), [visibles])

  const claveFoco = useMemo(() => {
    if (!puntoFoco) return null
    const g = grupos.find((x) => x.items.includes(puntoFoco))
    return g ? g.clave : null
  }, [puntoFoco, grupos])
  const claveAbierta = claveManual === undefined ? claveFoco : claveManual
  const grupoAbierto = grupos.find((g) => g.clave === claveAbierta) || null

  function actividadesDelMuseo(idMuseo) {
    return lista
      .filter((p) => p.museoId === idMuseo && p.tipo !== 'museo' && (finalizadas || !p.finalizada))
      .sort(porFecha)
  }

  // 1) Crear el mapa una sola vez
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

  // 2) Interruptor "Calles"
  useEffect(() => {
    const mapa = mapaRef.current
    const { calles } = capasRef.current
    if (!mapa || !calles) return
    if (nombresDeCalles) calles.addTo(mapa)
    else mapa.removeLayer(calles)
  }, [nombresDeCalles])

  // 3) Dibujar los pines cada vez que cambian los grupos visibles
  useEffect(() => {
    const L = window.L
    const { marcadores } = capasRef.current
    if (!marcadores) return
    marcadores.clearLayers()
    marcadoresRef.current = new Map()
    grupos.forEach(({ clave, items }) => {
      const museo = items.find((i) => i.tipo === 'museo')
      const rep = museo || items[0]
      const insignia = museo ? lista.filter((p) => p.museoId === museo.id && p.tipo !== 'museo' && (finalizadas || !p.finalizada)).length : (items.length > 1 ? items.length : 0)
      const marcador = L.marker([rep.lat, rep.lng], {
        icon: L.divIcon({
          className: 'nc-pin-wrap',
          html: `<div class="nc-pin tipo-${rep.tipo}"><i class="fa-solid ${ACTIVIDADES[rep.tipo].icono}"></i>${insignia > 0 ? `<span class="nc-pin__n">${insignia}</span>` : ''}</div>`,
          iconSize: [36, 44],
          iconAnchor: [18, 44],
        }),
        title: museo ? museo.titulo : (items.length > 1 ? t('mapa.propsLugar', { n: items.length }) : rep.titulo),
        riseOnHover: true,
      })
      marcador.on('click', (e) => {
        L.DomEvent.stopPropagation(e)
        setClaveManual(clave)
        mapaRef.current.panTo(marcador.getLatLng(), { animate: true, duration: 0.5 })
      })
      marcador.addTo(marcadores)
      marcadoresRef.current.set(clave, marcador)
    })
  }, [grupos, lista, finalizadas, t])

  // 4) Resaltar el pin abierto
  useEffect(() => {
    document.querySelectorAll('.nc-pin--sel').forEach((el) => el.classList.remove('nc-pin--sel'))
    const marcador = marcadoresRef.current.get(claveAbierta)
    const el = marcador && marcador.getElement()
    if (el) el.querySelector('.nc-pin').classList.add('nc-pin--sel')
  }, [claveAbierta, grupos])

  // 5) Encuadre inicial: el punto enfocado, o todos los puntos
  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa || encuadrado.current || !lista.length) return
    encuadrado.current = true
    if (puntoFoco) {
      mapa.setView([puntoFoco.lat, puntoFoco.lng], 17)
    } else {
      const coords = visibles.map((p) => [p.lat, p.lng])
      if (coords.length) mapa.fitBounds(coords, { padding: [70, 70], maxZoom: 16 })
    }
  }, [lista, puntoFoco, visibles])

  // Con Escape se cierra la tarjeta
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === 'Escape') setClaveManual(null)
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
    const museo = grupoAbierto.items.find((i) => i.tipo === 'museo')
    tarjeta = museo
      ? <TarjetaMuseo museo={museo} actividades={actividadesDelMuseo(museo.id)} />
      : (
        <>
          {grupoAbierto.items.length > 1 && (
            <p className="mc-grupo"><strong>{t('mapa.nProps', { n: grupoAbierto.items.length })}</strong> {t('mapa.enEsteLugar')}</p>
          )}
          {grupoAbierto.items.map((p) => <ItemPunto key={p.tipo + p.id} punto={p} />)}
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
            const total = lista.filter((p) => p.tipo === tipo && (finalizadas || !p.finalizada)).length
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
            <input type="checkbox" id="optFinalizadas" checked={finalizadas} onChange={(e) => { setClaveManual(null); setFinalizadasManual(e.target.checked) }} />
            <span>{t('mapa.finalizadas')}</span>
          </label>
          {' '}
          <label className="mapa-switch">
            <input type="checkbox" id="optCalles" checked={nombresDeCalles} onChange={(e) => setNombresDeCalles(e.target.checked)} />
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
        <div className="mapa-vacio" id="mapaVacio" hidden={cargando || !!error || visibles.length > 0}>
          <i className="fa-regular fa-map"></i>
          <p>{t('mapa.vacio')}</p>
        </div>
      </div>
    </main>
  )
}

export default Mapa
