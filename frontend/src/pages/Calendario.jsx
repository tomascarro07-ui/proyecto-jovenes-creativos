import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import { useIdioma } from '../hooks/useIdioma'
import { tt } from '../i18n/motor'

const TIPOS = {
  charla: { get nombre() { return tt('tipo.charla') }, ruta: '/charlas/' },
  taller: { get nombre() { return tt('tipo.taller') }, ruta: '/cursos/' },
  recorrido: { get nombre() { return tt('tipo.recorrido') }, ruta: '/recorridos/' },
}
const FILTROS = [
  { tipo: 'charla', texto: 'Charlas' },
  { tipo: 'taller', texto: 'Talleres' },
  { tipo: 'recorrido', texto: 'Recorridos' },
]

const pad = (numero) => String(numero).padStart(2, '0')
const clave = (fecha) => `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`
const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1)

async function cargarEventos(esPersona) {
  const [charlas, talleres, recorridos] = await Promise.all([api.charlas(), api.talleres(), api.recorridos()])
  let mias = new Set()
  if (esPersona) {
    try {
      const lista = await api.misInscripciones()
      mias = new Set(lista.map((inscripcion) => inscripcion.tipo + ':' + inscripcion.actividad))
    } catch {
    }
  }
  const armar = (lista, tipo) =>
    lista
      .filter((actividad) => /^\d{4}-\d{2}-\d{2}$/.test(actividad.fecha || ''))
      .map((actividad) => ({
        id: actividad.id, tipo, titulo: actividad.titulo, fecha: actividad.fecha, hora: actividad.hora || '',
        finalizada: Boolean(actividad.finalizada), inscripto: mias.has(tipo + ':' + actividad.id),
      }))
  return [...armar(charlas, 'charla'), ...armar(talleres, 'taller'), ...armar(recorridos, 'recorrido')]
}

function Calendario() {
  const { t } = useIdioma()
  const { usuario, esAdmin } = useSesion()
  const esPersona = Boolean(usuario) && !esAdmin
  const { datos, error } = useCarga(() => cargarEventos(esPersona), [esPersona])
  const EVENTOS = datos || []

  const [mes, setMes] = useState(() => {
    const hoy = new Date()
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  })
  const [seleccion, setSeleccion] = useState(() => clave(new Date()))
  const [filtros, setFiltros] = useState(['charla', 'taller', 'recorrido'])

  const eventosDelDia = (claveDelDia) =>
    EVENTOS.filter((evento) => evento.fecha === claveDelDia && filtros.includes(evento.tipo)).sort((primero, segundo) => primero.hora.localeCompare(segundo.hora))

  function cambiarMes(delta) {
    setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1))
  }

  function seleccionarDia(claveDelDia) {
    setSeleccion(claveDelDia)
    const [anio, numMes] = claveDelDia.split('-').map(Number)
    if (numMes - 1 !== mes.getMonth() || anio !== mes.getFullYear()) setMes(new Date(anio, numMes - 1, 1))
  }

  function alternarFiltro(tipo) {
    setFiltros((actuales) => (actuales.includes(tipo) ? actuales.filter((otroTipo) => otroTipo !== tipo) : [...actuales, tipo]))
  }

  const anio = mes.getFullYear()
  const numMes = mes.getMonth()
  const desfase = (mes.getDay() + 6) % 7
  const diasDelMes = new Date(anio, numMes + 1, 0).getDate()
  const semanas = Math.ceil((desfase + diasDelMes) / 7)
  const hoy = clave(new Date())
  const celdas = Array.from({ length: semanas * 7 }, (_, posicion) => new Date(anio, numMes, 1 - desfase + posicion))

  const [anioElegido, mesElegido, diaElegido] = seleccion.split('-').map(Number)
  const fechaElegida = new Date(anioElegido, mesElegido - 1, diaElegido)
  const eventosElegidos = eventosDelDia(seleccion)

  let mensajeDelPanel = t('cal.sinDia')
  if (EVENTOS.length === 0) mensajeDelPanel = t('cal.sinFecha')
  if (error) mensajeDelPanel = t('api.errorServidor')

  return (
    <main id="contenido" className="cal-main">
      <section className="cal-card">
        <div className="cal-toolbar">
          <div className="cal-nav">
            <button type="button" className="cal-hoy" id="calHoy" onClick={() => seleccionarDia(clave(new Date()))}>{t('cal.hoy')}</button>
            {' '}
            <button type="button" className="cal-icono" id="calPrev" aria-label={t('cal.prev')} onClick={() => cambiarMes(-1)}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {' '}
            <button type="button" className="cal-icono" id="calNext" aria-label={t('cal.next')} onClick={() => cambiarMes(1)}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            <h1 id="calTitulo">{mayuscula(mes.toLocaleDateString(tt('fecha.locale'), { month: 'long', year: 'numeric' }))}</h1>
          </div>
          <div className="cal-filtros" id="calFiltros">
            {FILTROS.map((filtro) => (
              <label key={filtro.tipo} className={`cal-filtro cal-filtro--${filtro.tipo}`}>
                <input type="checkbox" value={filtro.tipo} checked={filtros.includes(filtro.tipo)} onChange={() => alternarFiltro(filtro.tipo)} />
                <span>{filtro.texto}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="cal-semana">
          <span>{t('cal.d1')}</span>
          <span>{t('cal.d2')}</span>
          <span>{t('cal.d3')}</span>
          <span>{t('cal.d4')}</span>
          <span>{t('cal.d5')}</span>
          <span>{t('cal.d6')}</span>
          <span>{t('cal.d7')}</span>
        </div>
        <div className="cal-grid" id="calGrid">
          {celdas.map((fecha) => {
            const claveDelDia = clave(fecha)
            const evs = eventosDelDia(claveDelDia)
            let clases = 'cal-celda'
            if (fecha.getMonth() !== numMes) clases += ' cal-celda--fuera'
            if (claveDelDia === hoy) clases += ' cal-celda--hoy'
            if (claveDelDia === seleccion) clases += ' cal-celda--sel'
            return (
              <div
                key={claveDelDia}
                className={clases}
                role="button"
                tabIndex={0}
                aria-label={t('cal.celdaAria', { dia: fecha.getDate(), mes: fecha.toLocaleDateString(tt('fecha.locale'), { month: 'long' }), n: evs.length })}
                onClick={() => seleccionarDia(claveDelDia)}
                onKeyDown={(evento) => {
                  if (evento.key === 'Enter' || evento.key === ' ') {
                    evento.preventDefault()
                    seleccionarDia(claveDelDia)
                  }
                }}
              >
                <span className="cal-num">{fecha.getDate()}</span>
                <div className="cal-chips">
                  {evs.slice(0, 3).map((evento) => (
                    <span key={`${evento.tipo}-${evento.id}`} className={`cal-chip cal-chip--${evento.tipo}${evento.finalizada ? ' cal-chip--fin' : ''}${evento.inscripto ? ' cal-chip--mio' : ''}`}>
                      {evento.hora && <b>{evento.hora} </b>}{evento.titulo}
                    </span>
                  ))}
                  {evs.length > 3 && <span className="cal-mas">+{evs.length - 3} más</span>}
                </div>
                <span className="cal-puntos">
                  {evs.slice(0, 4).map((evento) => <i key={`${evento.tipo}-${evento.id}`} className={`cal-punto cal-punto--${evento.tipo}`}></i>)}
                </span>
              </div>
            )
          })}
        </div>
      </section>
      <aside className="cal-panel" id="calPanel" aria-live="polite">
        <h2>{mayuscula(fechaElegida.toLocaleDateString(tt('fecha.locale'), { weekday: 'long' }))}</h2>
        <p className="cal-panel__fecha">{fechaElegida.toLocaleDateString(tt('fecha.locale'), { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        {eventosElegidos.map((evento) => (
          <Link key={`${evento.tipo}-${evento.id}`} className={`cal-evento cal-evento--${evento.tipo}`} to={TIPOS[evento.tipo].ruta + evento.id}>
            <span className="cal-evento__hora">{evento.hora || t('cal.todoDia')}</span>
            <div className="cal-evento__cuerpo">
              <span className="cal-evento__tipo">{TIPOS[evento.tipo].nombre}</span>
              <strong>{evento.titulo}</strong>
              {evento.inscripto && <em className="cal-evento__ok"><i className="fa-solid fa-circle-check"></i> {t('cal.inscripto')}</em>}
              {evento.finalizada && <em className="cal-evento__fin">{t('cupo.fin')}</em>}
            </div>
            <i className="fa-solid fa-chevron-right"></i>
          </Link>
        ))}
        {eventosElegidos.length === 0 && (
          <div className="cal-panel__vacio">
            <i className="fa-regular fa-calendar"></i>
            <p>
              {mensajeDelPanel}
            </p>
          </div>
        )}
      </aside>
    </main>
  )
}

export default Calendario
