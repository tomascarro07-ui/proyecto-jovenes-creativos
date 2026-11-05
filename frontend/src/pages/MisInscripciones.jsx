import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import { useIdioma } from '../hooks/useIdioma'
import { tt } from '../i18n/motor'

// Dirección de la página de cada tipo de actividad y su icono
const PAGINAS = { taller: '/cursos/', charla: '/charlas/', recorrido: '/recorridos/' }
const TIPOS = {
  taller: { get nombre() { return tt('tipo.taller') }, icono: 'fa-palette' },
  charla: { get nombre() { return tt('tipo.charla') }, icono: 'fa-microphone-lines' },
  recorrido: { get nombre() { return tt('tipo.recorrido') }, icono: 'fa-route' },
}

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString(tt('fecha.locale'), { day: 'numeric', month: 'long', year: 'numeric' })
}

function TarjetaInscripcion({ inscripcion: ins, alCancelar }) {
  const { t } = useIdioma()
  const [cancelando, setCancelando] = useState(false)
  const tipo = TIPOS[ins.tipo] || { nombre: ins.tipo, icono: 'fa-star' }
  const disponible = ins.disponible !== false

  async function cancelar() {
    if (!window.confirm(t('misinsc.confirmarCancelar'))) return
    setCancelando(true)
    try {
      await api.cancelarInscripcion(ins.id)
      alCancelar()
    } catch (error) {
      alert(error.message)
      setCancelando(false)
    }
  }

  return (
    <article className={`insc-card insc-card--${ins.tipo}${disponible ? '' : ' insc-card--inactiva'}`}>
      <div className="insc-card__icono" aria-hidden="true">
        <i className={`fa-solid ${tipo.icono}`}></i>
      </div>
      <div className="insc-card__cuerpo">
        <span className={`insc-badge insc-badge--${ins.tipo}`}>{tipo.nombre}</span>
        <h2 className="insc-card__titulo">{ins.tituloActividad}</h2>
        <ul className="insc-card__datos">
          <li><i className="fa-solid fa-phone"></i> {ins.telefono}</li>
          <li><i className="fa-regular fa-calendar-check"></i> {t('misinsc.inscriptoEl', { fecha: formatearFecha(ins.createdAt) })}</li>
          {ins.finalizada && <li className="insc-ok"><i className="fa-solid fa-circle-check"></i> {t('misinsc.realizada')}</li>}
        </ul>
        {!disponible && <p className="insc-card__aviso"><i className="fa-solid fa-circle-info"></i> {t('misinsc.noDisp')}</p>}
      </div>
      <div className="insc-card__acciones">
        {disponible && (
          <Link to={PAGINAS[ins.tipo] + ins.actividad} className="insc-btn insc-btn--primario">
            <i className="fa-solid fa-eye"></i> {t('misinsc.ver')}
          </Link>
        )}
        {ins.tipo === 'recorrido' && ins.finalizada && (
          <Link to={`${PAGINAS.recorrido}${ins.actividad}#valoraciones`} className="insc-btn insc-btn--estrella">
            <i className="fa-solid fa-star"></i> {t('misinsc.valorar')}
          </Link>
        )}
        {!ins.finalizada && (
          <button type="button" className="insc-btn insc-btn--peligro" onClick={cancelar} disabled={cancelando}>
            <i className="fa-regular fa-trash-can"></i> {t('misinsc.cancelar')}
          </button>
        )}
      </div>
    </article>
  )
}

function MisInscripciones() {
  const { t } = useIdioma()
  const { usuario } = useSesion()
  const { datos: inscripciones, cargando, error, recargar } = useCarga(
    () => (usuario ? api.misInscripciones() : Promise.resolve([])),
    [!!usuario],
  )

  // Sin sesión se vuelve al login
  if (!usuario) return <Navigate to="/login" replace />

  return (
    <main id="contenido" className="insc-main">
      <header className="insc-hero">
        <p className="insc-hero__eyebrow">{t('misinsc.eyebrow')}</p>
        <h1>{t('hd.misInscripciones')}</h1>
        <p className="insc-hero__sub">{t('misinsc.sub')}</p>
        <div className="insc-resumen" id="resumenInscripciones">
          {inscripciones && inscripciones.length > 0 && (
            <div className="insc-stat"><strong>{inscripciones.length}</strong><span>{t('misinsc.actividades')}</span></div>
          )}
        </div>
      </header>
      <section className="insc-lista" id="listaInscripciones" aria-live="polite">
        {cargando && <p className="admin-vacio" role="status">{t('comun.cargando')}</p>}
        {error && <p className="admin-vacio" role="alert">{t('api.errorServidor')}</p>}
        {inscripciones && inscripciones.length === 0 && (
          <div className="insc-vacio">
            <i className="fa-regular fa-calendar-plus"></i>
            <h2>{t('misinsc.vacioH')}</h2>
            <p>{t('misinsc.vacioP')}</p>
            <Link to="/" className="insc-btn insc-btn--primario">{t('index.btnExplorar')}</Link>
          </div>
        )}
        {inscripciones && inscripciones.map((ins) => (
          <TarjetaInscripcion key={ins.id} inscripcion={ins} alCancelar={recargar} />
        ))}
      </section>
    </main>
  )
}

export default MisInscripciones
