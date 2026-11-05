import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useInscripcion } from '../hooks/useInscripcion'
import { formatearDuracion } from '../utils/fechas'
import FormInscripcion from '../components/FormInscripcion'
import ModalLogin from '../components/ModalLogin'
import DetalleEstado from '../components/DetalleEstado'
import Valoraciones from '../components/Valoraciones'
import { useIdioma } from '../hooks/useIdioma'

function RecorridoDetalle() {
  const { t, tDato } = useIdioma()
  const { idRecorrido } = useParams()
  const { datos: recorrido, cargando, error, recargar } = useCarga(() => api.recorrido(idRecorrido), [idRecorrido])
  const { formAbierto, modalAbierto, pedirInscripcion, cerrarModal, cerrarForm } = useInscripcion()

  function inscripcionHecha() {
    cerrarForm()
    recargar()
  }

  return (
    <>
      <main id="contenido" className="detalle-main">
        <div className="volver">
          <Link to="/recorridos" className="nc-btn nc-btn--pill">
            <i className="fa-solid fa-left-long"></i>
            {' '}
            <span>{t('recorrido.volver')}</span>
          </Link>
        </div>
        <div id="detalleContenido" className="detalle-wrapper">
          <DetalleEstado cargando={cargando} error={error} noEncontrado={t('det.noRecorrido')}>
            {recorrido && (
              <div className="charla-detalle">
                <div className="charla-detalle__media">
                  <img src={recorrido.imagen} alt={recorrido.titulo} />
                  <span className="charla-detalle__tag">{tDato(recorrido.tipo)}</span>
                </div>
                <div className="charla-detalle__body">
                  <h1>{recorrido.titulo}</h1>
                  <p className="charla-detalle__desc">{recorrido.descripcionCorta}</p>
                  <dl className="charla-detalle__datos">
                    <div>
                      <dt><i className="fa-solid fa-location-dot"></i> {t('det.puntoSalida')}</dt>
                      <dd>{recorrido.puntoSalida}</dd>
                    </div>
                    <div>
                      <dt><i className="fa-regular fa-clock"></i> {t('det.duracion')}</dt>
                      <dd>{formatearDuracion(recorrido)}</dd>
                    </div>
                  </dl>
                  <div className="charla-detalle__footer">
                    <span className="charla-detalle__cupos">
                      <i className="fa-solid fa-users"></i>
                      {' '}
                      {t('det.cupos', { n: recorrido.cupos })}
                    </span>
                    {!formAbierto && (
                      <button type="button" id="btnMostrarForm" className="nc-btn" onClick={pedirInscripcion}>{t('act.inscribirme')}</button>
                    )}
                  </div>
                </div>
                <div>
                  <FormInscripcion tipo="recorrido" idActividad={recorrido.id} visible={formAbierto} alTerminar={inscripcionHecha} />
                </div>
              </div>
            )}
          </DetalleEstado>
        </div>
        {recorrido && <Valoraciones idRecorrido={recorrido.id} />}
      </main>
      <ModalLogin abierto={modalAbierto} alCerrar={cerrarModal} quien="recorrido" />
    </>
  )
}

export default RecorridoDetalle
