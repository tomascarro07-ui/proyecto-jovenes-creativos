import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { fechaCorta, normalizar, recortar, trozosResaltados, urlSegura } from '../utils/buscador'
import { useIdioma } from '../hooks/useIdioma'
import { tt } from '../i18n/motor'

// Tipos de contenido que se pueden buscar. "url" arma la dirección de cada resultado.
const TIPOS = {
  museo: { get plural() { return tt('tipo.museo.p') }, get nombre() { return tt('tipo.museo') }, icono: 'fa-landmark', url: (r) => '/museos/' + encodeURIComponent(r.id) },
  charla: { get plural() { return tt('tipo.charla.p') }, get nombre() { return tt('tipo.charla') }, icono: 'fa-microphone-lines', url: (r) => '/charlas/' + encodeURIComponent(r.id) },
  taller: { get plural() { return tt('tipo.taller.p') }, get nombre() { return tt('tipo.taller') }, icono: 'fa-palette', url: (r) => '/cursos/' + encodeURIComponent(r.id) },
  recorrido: { get plural() { return tt('tipo.recorrido.p') }, get nombre() { return tt('tipo.recorrido') }, icono: 'fa-person-walking', url: (r) => '/recorridos/' + encodeURIComponent(r.id) },
  recurso: { get plural() { return tt('tipo.recurso.p') }, get nombre() { return tt('tipo.recurso') }, icono: 'fa-file-pdf', url: (r) => r.archivo || '/recursos' },
}

// Texto con las palabras buscadas resaltadas
function Resaltado({ texto, tokens }) {
  return trozosResaltados(texto, tokens).map((t, i) => (t.marcado ? <mark key={i}>{t.texto}</mark> : t.texto))
}

function TarjetaResultado({ r, tokens }) {
  const { t } = useIdioma()
  const tp = TIPOS[r.tipo]
  const imagen = urlSegura(r.imagen)
  const href = urlSegura(tp.url(r)) || '/recursos'
  const contenido = (
    <>
      <div className="bus-card__media">
        {imagen
          ? <img src={imagen} alt="" loading="lazy" />
          : <span className="bus-card__ico"><i className={`fa-solid ${tp.icono}`} aria-hidden="true"></i></span>}
      </div>
      <div className="bus-card__cuerpo">
        <div className="bus-card__etiquetas">
          <span className="mc-badge"><i className={`fa-solid ${tp.icono}`} aria-hidden="true"></i> {tp.nombre}</span>
          {r.categoria && <span className="bus-card__cat"><Resaltado texto={r.categoria} tokens={tokens} /></span>}
          {r.finalizada && <span className="mc-cupos mc-cupos--fin">{t('cupo.fin')}</span>}
        </div>
        <h3><Resaltado texto={r.titulo} tokens={tokens} /></h3>
        <p><Resaltado texto={recortar(r.descripcion, 150)} tokens={tokens} /></p>
        {(r.fecha || r.lugar) && (
          <ul className="bus-card__meta">
            {r.fecha && <li><i className="fa-regular fa-calendar" aria-hidden="true"></i> {fechaCorta(r.fecha)}{r.hora ? ' · ' + r.hora : ''}</li>}
            {r.lugar && <li><i className="fa-solid fa-location-dot" aria-hidden="true"></i> <Resaltado texto={recortar(r.lugar, 60)} tokens={tokens} /></li>}
          </ul>
        )}
      </div>
    </>
  )
  const clase = `bus-card tipo-${r.tipo}${r.finalizada ? ' bus-card--fin' : ''}`
  // Los recursos son archivos PDF: se abren en otra pestaña
  return r.tipo === 'recurso'
    ? <a className={clase} href={href} target="_blank" rel="noopener noreferrer">{contenido}</a>
    : <Link className={clase} to={href}>{contenido}</Link>
}

function Buscar() {
  const { t } = useIdioma()
  // La búsqueda puede llegar desde el encabezado: /buscar?q=historia (y se guarda en la dirección para compartirla)
  const [parametros, setParametros] = useSearchParams()
  const [consulta, setConsulta] = useState((parametros.get('q') || '').slice(0, 80))
  const [consultaPedida, setConsultaPedida] = useState(consulta) // la que se manda al servidor (espera una pausa al escribir)
  const [tipo, setTipo] = useState(TIPOS[parametros.get('tipo')] ? parametros.get('tipo') : '')
  const [categoria, setCategoria] = useState((parametros.get('categoria') || '').slice(0, 60))
  const [ocultarFinalizadas, setOcultarFinalizadas] = useState(parametros.get('ocultar') === '1')
  const entradaRef = useRef(null)

  // Busca mientras se escribe, pero espera a que la persona haga una pausa
  useEffect(() => {
    const espera = setTimeout(() => setConsultaPedida(consulta), 250)
    return () => clearTimeout(espera)
  }, [consulta])

  const { datos, error, cargando } = useCarga(() => {
    const p = new URLSearchParams()
    if (consultaPedida) p.set('q', consultaPedida)
    if (tipo) p.set('tipo', tipo)
    if (categoria) p.set('categoria', categoria)
    if (ocultarFinalizadas) p.set('ocultarFinalizadas', '1')
    return api.buscar(p.toString())
  }, [consultaPedida, tipo, categoria, ocultarFinalizadas])

  // Mientras llega una respuesta nueva se siguen mostrando los resultados anteriores
  const [anteriores, setAnteriores] = useState(null)
  if (datos && datos !== anteriores) setAnteriores(datos)
  const mostrar = datos || anteriores

  // Guarda la búsqueda en la dirección para poder compartirla o volver con "atrás"
  useEffect(() => {
    const p = new URLSearchParams()
    if (consultaPedida) p.set('q', consultaPedida)
    if (tipo) p.set('tipo', tipo)
    if (categoria) p.set('categoria', categoria)
    if (ocultarFinalizadas) p.set('ocultar', '1')
    setParametros(p, { replace: true })
  }, [consultaPedida, tipo, categoria, ocultarFinalizadas, setParametros])

  // Atajos: Escape borra lo escrito y "/" lleva el cursor al buscador
  useEffect(() => {
    const alTeclear = (e) => {
      const entrada = entradaRef.current
      if (e.key === 'Escape' && document.activeElement === entrada && entrada.value) {
        setConsulta('')
        setConsultaPedida('')
      }
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault()
        entrada.focus()
      }
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [])

  const tokens = useMemo(() => normalizar(consultaPedida).split(/\s+/).filter(Boolean), [consultaPedida])
  const conteos = mostrar ? mostrar.conteos : {}
  const totalConteos = Object.values(conteos).reduce((a, b) => a + b, 0)
  const categorias = mostrar ? mostrar.categorias : []
  const puedeFiltrar = !!tipo && categorias.length > 0

  function elegirTipo(nuevo) {
    setTipo(nuevo)
    setCategoria('') // las categorías dependen del tipo
  }

  function limpiar() {
    setConsulta('')
    setConsultaPedida('')
    entradaRef.current.focus()
  }

  let estado = ''
  if (cargando && mostrar) {
    estado = t('bus.buscando')
  } else if (error) {
    estado = ''
  } else if (mostrar) {
    if (!mostrar.total) {
      estado = t('bus.sinRes')
    } else {
      const base = consultaPedida
        ? t(mostrar.total === 1 ? 'bus.resQ1' : 'bus.resQn', { n: mostrar.total, q: consultaPedida })
        : t(mostrar.total === 1 ? 'bus.elem1' : 'bus.elemN', { n: mostrar.total })
      estado = base + (mostrar.resultados.length < mostrar.total ? t('bus.mostrando', { n: mostrar.resultados.length }) : '')
    }
  }

  return (
    <main id="contenido" className="bus-main">
      <section className="bus-cabecera" aria-labelledby="busTitulo">
        <p className="insc-hero__eyebrow">{t('buscar.eyebrow')}</p>
        <h1 id="busTitulo">{t('buscar.h1')}</h1>
        <p className="bus-sub">
          {t('buscar.sub')}
        </p>
        <form className="bus-form" role="search" id="busForm" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          {' '}
          <label htmlFor="busInput" className="visually-hidden">{t('hd.buscarPlaceholder')}</label>
          {' '}
          <input type="search" id="busInput" maxLength="80" placeholder={t('buscar.ph')} autoFocus value={consulta} onChange={(e) => setConsulta(e.target.value.replace(/\s+/g, ' ').trimStart())} ref={entradaRef} />
          {' '}
          <button type="button" id="busLimpiar" className="bus-limpiar" aria-label={t('buscar.borrar')} hidden={consulta === ''} onClick={limpiar}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </form>
        <div className="bus-filtros">
          <div className="bus-chips" id="busChips" role="group" aria-label={t('buscar.filtrarTipo')}>
            {[['', t('bus.todo'), 'fa-border-all', totalConteos], ...Object.entries(TIPOS).map(([clave, tp]) => [clave, tp.plural, tp.icono, conteos[clave] || 0])].map(([clave, texto, icono, n]) => (
              <button type="button" key={clave} className={`mapa-chip${clave ? ' tipo-' + clave : ''}${tipo === clave ? ' is-on' : ''}`} aria-pressed={tipo === clave} onClick={() => elegirTipo(clave)}>
                <i className={`fa-solid ${icono}`} aria-hidden="true"></i> {texto} <span>{n}</span>
              </button>
            ))}
          </div>
          <div className="bus-opciones">
            <label className="bus-select">
              <span className="visually-hidden">{t('buscar.categoria')}</span>
              {' '}
              <select id="busCategoria" disabled={!puedeFiltrar} title={tipo ? '' : t('bus.elegiTipo')} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="">{t('bus.todasCat')}</option>
                {categorias.map((c) => (
                  <option key={c.valor} value={c.valor}>{c.valor} ({c.cantidad})</option>
                ))}
              </select>
            </label>
            {' '}
            <label className="mapa-switch">
              <input type="checkbox" id="busOcultar" checked={ocultarFinalizadas} onChange={(e) => setOcultarFinalizadas(e.target.checked)} />
              {' '}
              <span>{t('buscar.ocultar')}</span>
            </label>
          </div>
        </div>
      </section>
      <section aria-labelledby="busEstado">
        <p className="bus-estado" id="busEstado" role="status" aria-live="polite">{estado}</p>
        <div className="bus-grid" id="busResultados" aria-busy={cargando}>
          {error && (
            <div className="insc-vacio">
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
              <h2>{t('bus.noPudo')}</h2>
              <p>{error.message}</p>
            </div>
          )}
          {!error && mostrar && !mostrar.total && (
            <div className="insc-vacio">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
              <h2>{t('bus.sinResH')}</h2>
              <p>{consultaPedida ? t('bus.sinResP1') : t('bus.sinResP2')}</p>
            </div>
          )}
          {!error && mostrar && mostrar.resultados.map((r) => <TarjetaResultado key={r.tipo + r.id} r={r} tokens={tokens} />)}
        </div>
      </section>
    </main>
  )
}

export default Buscar
