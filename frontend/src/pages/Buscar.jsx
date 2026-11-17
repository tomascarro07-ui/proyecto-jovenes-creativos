import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { fechaCorta, normalizar, recortar, trozosResaltados, urlSegura } from '../utils/buscador'
import { useIdioma } from '../hooks/useIdioma'
import { tt } from '../i18n/motor'

const TIPOS = {
  museo: { get plural() { return tt('tipo.museo.p') }, get nombre() { return tt('tipo.museo') }, icono: 'fa-landmark', url: (resultado) => '/museos/' + encodeURIComponent(resultado.id) },
  charla: { get plural() { return tt('tipo.charla.p') }, get nombre() { return tt('tipo.charla') }, icono: 'fa-microphone-lines', url: (resultado) => '/charlas/' + encodeURIComponent(resultado.id) },
  taller: { get plural() { return tt('tipo.taller.p') }, get nombre() { return tt('tipo.taller') }, icono: 'fa-palette', url: (resultado) => '/cursos/' + encodeURIComponent(resultado.id) },
  recorrido: { get plural() { return tt('tipo.recorrido.p') }, get nombre() { return tt('tipo.recorrido') }, icono: 'fa-person-walking', url: (resultado) => '/recorridos/' + encodeURIComponent(resultado.id) },
  recurso: { get plural() { return tt('tipo.recurso.p') }, get nombre() { return tt('tipo.recurso') }, icono: 'fa-file-pdf', url: (resultado) => resultado.archivo || '/recursos' },
}

function Resaltado({ texto, tokens }) {
  return trozosResaltados(texto, tokens).map((trozo, posicion) => (trozo.marcado ? <mark key={posicion}>{trozo.texto}</mark> : trozo.texto))
}

function TarjetaResultado({ resultado, tokens }) {
  const { t } = useIdioma()
  const tp = TIPOS[resultado.tipo]
  const imagen = urlSegura(resultado.imagen)
  const href = urlSegura(tp.url(resultado)) || '/recursos'
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
          {resultado.categoria && <span className="bus-card__cat"><Resaltado texto={resultado.categoria} tokens={tokens} /></span>}
          {resultado.finalizada && <span className="mc-cupos mc-cupos--fin">{t('cupo.fin')}</span>}
        </div>
        <h3><Resaltado texto={resultado.titulo} tokens={tokens} /></h3>
        <p><Resaltado texto={recortar(resultado.descripcion, 150)} tokens={tokens} /></p>
        {(resultado.fecha || resultado.lugar) && (
          <ul className="bus-card__meta">
            {resultado.fecha && <li><i className="fa-regular fa-calendar" aria-hidden="true"></i> {fechaCorta(resultado.fecha)}{resultado.hora ? ' · ' + resultado.hora : ''}</li>}
            {resultado.lugar && <li><i className="fa-solid fa-location-dot" aria-hidden="true"></i> <Resaltado texto={recortar(resultado.lugar, 60)} tokens={tokens} /></li>}
          </ul>
        )}
      </div>
    </>
  )
  const clase = `bus-card tipo-${resultado.tipo}${resultado.finalizada ? ' bus-card--fin' : ''}`
  return resultado.tipo === 'recurso'
    ? <a className={clase} href={href} target="_blank" rel="noopener noreferrer">{contenido}</a>
    : <Link className={clase} to={href}>{contenido}</Link>
}

function Buscar() {
  const { t } = useIdioma()
  const [parametros, setParametros] = useSearchParams()
  const [consulta, setConsulta] = useState((parametros.get('q') || '').slice(0, 80))
  const [consultaPedida, setConsultaPedida] = useState(consulta)
  const [tipo, setTipo] = useState(TIPOS[parametros.get('tipo')] ? parametros.get('tipo') : '')
  const [categoria, setCategoria] = useState((parametros.get('categoria') || '').slice(0, 60))
  const [ocultarFinalizadas, setOcultarFinalizadas] = useState(parametros.get('ocultar') === '1')
  const entradaRef = useRef(null)

  useEffect(() => {
    const espera = setTimeout(() => setConsultaPedida(consulta), 250)
    return () => clearTimeout(espera)
  }, [consulta])

  const { datos, error, cargando } = useCarga(() => {
    const parametrosDeBusqueda = new URLSearchParams()
    if (consultaPedida) parametrosDeBusqueda.set('q', consultaPedida)
    if (tipo) parametrosDeBusqueda.set('tipo', tipo)
    if (categoria) parametrosDeBusqueda.set('categoria', categoria)
    if (ocultarFinalizadas) parametrosDeBusqueda.set('ocultarFinalizadas', '1')
    return api.buscar(parametrosDeBusqueda.toString())
  }, [consultaPedida, tipo, categoria, ocultarFinalizadas])

  const [anteriores, setAnteriores] = useState(null)
  if (datos && datos !== anteriores) setAnteriores(datos)
  const mostrar = datos || anteriores

  useEffect(() => {
    const parametrosDeBusqueda = new URLSearchParams()
    if (consultaPedida) parametrosDeBusqueda.set('q', consultaPedida)
    if (tipo) parametrosDeBusqueda.set('tipo', tipo)
    if (categoria) parametrosDeBusqueda.set('categoria', categoria)
    if (ocultarFinalizadas) parametrosDeBusqueda.set('ocultar', '1')
    setParametros(parametrosDeBusqueda, { replace: true })
  }, [consultaPedida, tipo, categoria, ocultarFinalizadas, setParametros])

  useEffect(() => {
    const alTeclear = (evento) => {
      const entrada = entradaRef.current
      if (evento.key === 'Escape' && document.activeElement === entrada && entrada.value) {
        setConsulta('')
        setConsultaPedida('')
      }
      if (evento.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        evento.preventDefault()
        entrada.focus()
      }
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [])

  const tokens = useMemo(() => normalizar(consultaPedida).split(/\s+/).filter(Boolean), [consultaPedida])
  const conteos = mostrar ? mostrar.conteos : {}
  let totalConteos = 0
  for (const cantidad of Object.values(conteos)) totalConteos += cantidad
  const categorias = mostrar ? mostrar.categorias : []
  const puedeFiltrar = Boolean(tipo) && categorias.length > 0

  function elegirTipo(nuevo) {
    setTipo(nuevo)
    setCategoria('')
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
      const esUnico = mostrar.total === 1
      let base
      if (consultaPedida) {
        base = t(esUnico ? 'bus.resQ1' : 'bus.resQn', { n: mostrar.total, q: consultaPedida })
      } else {
        base = t(esUnico ? 'bus.elem1' : 'bus.elemN', { n: mostrar.total })
      }
      let aclaracion = ''
      if (mostrar.resultados.length < mostrar.total) aclaracion = t('bus.mostrando', { n: mostrar.resultados.length })
      estado = base + aclaracion
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
        <form className="bus-form" role="search" id="busForm" autoComplete="off" onSubmit={(evento) => evento.preventDefault()}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          {' '}
          <label htmlFor="busInput" className="visually-hidden">{t('hd.buscarPlaceholder')}</label>
          {' '}
          <input type="search" id="busInput" maxLength="80" placeholder={t('buscar.ph')} autoFocus value={consulta} onChange={(evento) => setConsulta(evento.target.value.replace(/\s+/g, ' ').trimStart())} ref={entradaRef} />
          {' '}
          <button type="button" id="busLimpiar" className="bus-limpiar" aria-label={t('buscar.borrar')} hidden={consulta === ''} onClick={limpiar}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </form>
        <div className="bus-filtros">
          <div className="bus-chips" id="busChips" role="group" aria-label={t('buscar.filtrarTipo')}>
            {[['', t('bus.todo'), 'fa-border-all', totalConteos], ...Object.entries(TIPOS).map(([clave, tp]) => [clave, tp.plural, tp.icono, conteos[clave] || 0])].map(([clave, texto, icono, cantidad]) => (
              <button type="button" key={clave} className={`mapa-chip${clave ? ' tipo-' + clave : ''}${tipo === clave ? ' is-on' : ''}`} aria-pressed={tipo === clave} onClick={() => elegirTipo(clave)}>
                <i className={`fa-solid ${icono}`} aria-hidden="true"></i> {texto} <span>{cantidad}</span>
              </button>
            ))}
          </div>
          <div className="bus-opciones">
            <label className="bus-select">
              <span className="visually-hidden">{t('buscar.categoria')}</span>
              {' '}
              <select id="busCategoria" disabled={!puedeFiltrar} title={tipo ? '' : t('bus.elegiTipo')} value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
                <option value="">{t('bus.todasCat')}</option>
                {categorias.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>{opcion.valor} ({opcion.cantidad})</option>
                ))}
              </select>
            </label>
            {' '}
            <label className="mapa-switch">
              <input type="checkbox" id="busOcultar" checked={ocultarFinalizadas} onChange={(evento) => setOcultarFinalizadas(evento.target.checked)} />
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
          {!error && mostrar && mostrar.resultados.map((resultado) => <TarjetaResultado key={resultado.tipo + resultado.id} resultado={resultado} tokens={tokens} />)}
        </div>
      </section>
    </main>
  )
}

export default Buscar
