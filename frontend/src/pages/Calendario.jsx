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

const pad = (n) => String(n).padStart(2, '0')
const clave = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` // "2026-11-05"
const mayuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1)

// Junta charlas, talleres y recorridos en una sola lista de eventos (solo los que tienen fecha).
// Cada evento: { id, tipo: 'charla' | 'taller' | 'recorrido', titulo, fecha: 'AAAA-MM-DD', hora, finalizada, inscripto }
async function cargarEventos(esPersona) {
  const [charlas, talleres, recorridos] = await Promise.all([api.charlas(), api.talleres(), api.recorridos()])
  let mias = new Set()
  if (esPersona) {
    try {
      const lista = await api.misInscripciones()
      mias = new Set(lista.map((i) => i.tipo + ':' + i.actividad))
    } catch {
      /* sin sesión válida: se muestra igual */
    }
  }
  const armar = (lista, tipo) =>
    lista
      .filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.fecha || ''))
      .map((x) => ({
        id: x.id, tipo, titulo: x.titulo, fecha: x.fecha, hora: x.hora || '',
        finalizada: !!x.finalizada, inscripto: mias.has(tipo + ':' + x.id),
      }))
  return [...armar(charlas, 'charla'), ...armar(talleres, 'taller'), ...armar(recorridos, 'recorrido')]
}

function Calendario() {
  const { t } = useIdioma()
  const { usuario, esAdmin } = useSesion()
  const esPersona = !!usuario && !esAdmin // las personas inscriptas ven marcadas sus actividades
  const { datos, error } = useCarga(() => cargarEventos(esPersona), [esPersona])
  const EVENTOS = datos || []

  // Estado del calendario:
  const [mes, setMes] = useState(() => {
    const hoy = new Date()
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1) // primer día del mes que se está viendo
  })
  const [seleccion, setSeleccion] = useState(() => clave(new Date())) // día elegido ("AAAA-MM-DD")
  const [filtros, setFiltros] = useState(['charla', 'taller', 'recorrido']) // tipos tildados

  const eventosDelDia = (k) =>
    EVENTOS.filter((e) => e.fecha === k && filtros.includes(e.tipo)).sort((a, b) => a.hora.localeCompare(b.hora))

  function cambiarMes(delta) {
    setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1))
  }

  function seleccionarDia(k) {
    setSeleccion(k)
    const [anio, numMes] = k.split('-').map(Number)
    // Si se hace clic en un día de otro mes, se cambia de mes
    if (numMes - 1 !== mes.getMonth() || anio !== mes.getFullYear()) setMes(new Date(anio, numMes - 1, 1))
  }

  function alternarFiltro(tipo) {
    setFiltros((actuales) => (actuales.includes(tipo) ? actuales.filter((t) => t !== tipo) : [...actuales, tipo]))
  }

  // Las 5 o 6 semanas que se muestran (la semana empieza el lunes)
  const anio = mes.getFullYear()
  const numMes = mes.getMonth()
  const desfase = (mes.getDay() + 6) % 7
  const diasDelMes = new Date(anio, numMes + 1, 0).getDate()
  const semanas = Math.ceil((desfase + diasDelMes) / 7)
  const hoy = clave(new Date())
  const celdas = Array.from({ length: semanas * 7 }, (_, i) => new Date(anio, numMes, 1 - desfase + i))

  const fechaElegida = (() => {
    const [a, m, d] = seleccion.split('-').map(Number)
    return new Date(a, m - 1, d)
  })()
  const eventosElegidos = eventosDelDia(seleccion)

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
            {FILTROS.map((f) => (
              <label key={f.tipo} className={`cal-filtro cal-filtro--${f.tipo}`}>
                <input type="checkbox" value={f.tipo} checked={filtros.includes(f.tipo)} onChange={() => alternarFiltro(f.tipo)} />
                <span>{f.texto}</span>
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
          {celdas.map((d) => {
            const k = clave(d)
            const evs = eventosDelDia(k)
            const clases = 'cal-celda' + (d.getMonth() !== numMes ? ' cal-celda--fuera' : '') + (k === hoy ? ' cal-celda--hoy' : '') + (k === seleccion ? ' cal-celda--sel' : '')
            return (
              <div
                key={k}
                className={clases}
                role="button"
                tabIndex={0}
                aria-label={t('cal.celdaAria', { dia: d.getDate(), mes: d.toLocaleDateString(tt('fecha.locale'), { month: 'long' }), n: evs.length })}
                onClick={() => seleccionarDia(k)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    seleccionarDia(k)
                  }
                }}
              >
                <span className="cal-num">{d.getDate()}</span>
                <div className="cal-chips">
                  {evs.slice(0, 3).map((e) => (
                    <span key={`${e.tipo}-${e.id}`} className={`cal-chip cal-chip--${e.tipo}${e.finalizada ? ' cal-chip--fin' : ''}${e.inscripto ? ' cal-chip--mio' : ''}`}>
                      {e.hora && <b>{e.hora} </b>}{e.titulo}
                    </span>
                  ))}
                  {evs.length > 3 && <span className="cal-mas">+{evs.length - 3} más</span>}
                </div>
                <span className="cal-puntos">
                  {evs.slice(0, 4).map((e) => <i key={`${e.tipo}-${e.id}`} className={`cal-punto cal-punto--${e.tipo}`}></i>)}
                </span>
              </div>
            )
          })}
        </div>
      </section>
      <aside className="cal-panel" id="calPanel" aria-live="polite">
        <h2>{mayuscula(fechaElegida.toLocaleDateString(tt('fecha.locale'), { weekday: 'long' }))}</h2>
        <p className="cal-panel__fecha">{fechaElegida.toLocaleDateString(tt('fecha.locale'), { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        {eventosElegidos.map((e) => (
          <Link key={`${e.tipo}-${e.id}`} className={`cal-evento cal-evento--${e.tipo}`} to={TIPOS[e.tipo].ruta + e.id}>
            <span className="cal-evento__hora">{e.hora || t('cal.todoDia')}</span>
            <div className="cal-evento__cuerpo">
              <span className="cal-evento__tipo">{TIPOS[e.tipo].nombre}</span>
              <strong>{e.titulo}</strong>
              {e.inscripto && <em className="cal-evento__ok"><i className="fa-solid fa-circle-check"></i> {t('cal.inscripto')}</em>}
              {e.finalizada && <em className="cal-evento__fin">{t('cupo.fin')}</em>}
            </div>
            <i className="fa-solid fa-chevron-right"></i>
          </Link>
        ))}
        {eventosElegidos.length === 0 && (
          <div className="cal-panel__vacio">
            <i className="fa-regular fa-calendar"></i>
            <p>
              {error
                ? t('api.errorServidor')
                : (EVENTOS.length === 0 ? t('cal.sinFecha') : t('cal.sinDia'))}
            </p>
          </div>
        )}
      </aside>
    </main>
  )
}

export default Calendario
