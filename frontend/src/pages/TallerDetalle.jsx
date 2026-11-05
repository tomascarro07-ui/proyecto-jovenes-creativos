import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useInscripcion } from '../hooks/useInscripcion'
import FormInscripcion from '../components/FormInscripcion'
import ModalLogin from '../components/ModalLogin'
import DetalleEstado from '../components/DetalleEstado'
import { useIdioma } from '../hooks/useIdioma'

function TallerDetalle() {
  const { t, tDato } = useIdioma()
  const { idTaller } = useParams()
  const { datos: taller, cargando, error, recargar } = useCarga(() => api.taller(idTaller), [idTaller])
  const { formAbierto, modalAbierto, pedirInscripcion, cerrarModal, cerrarForm } = useInscripcion()

  function inscripcionHecha() {
    cerrarForm()
    recargar()
  }

  return (
    <>
      <main id="contenido" className="detalle-main">
        <div className="volver">
          <Link to="/cursos" className="nc-btn nc-btn--pill">
            <i className="fa-solid fa-left-long"></i>
            {' '}
            <span>{t('cursos.volver')}</span>
          </Link>
        </div>
        <div id="detalleContenido" className="detalle-wrapper">
          <DetalleEstado cargando={cargando} error={error} noEncontrado={t('det.noTaller')}>
            {taller && (
              <div className="charla-detalle">
                <div className="charla-detalle__media">
                  <img src={taller.imagen} alt={taller.titulo} />
                  <span className="charla-detalle__tag">{tDato(taller.modalidad)}</span>
                </div>
                <div className="charla-detalle__body">
                  <h1>{taller.titulo}</h1>
                  <p className="charla-detalle__desc">{taller.descripcionCorta}</p>
                  <dl className="charla-detalle__datos">
                    <div>
                      <dt><i className="fa-solid fa-layer-group"></i> {t('det.nivel')}</dt>
                      <dd>{tDato(taller.nivel)}</dd>
                    </div>
                    <div>
                      <dt><i className="fa-solid fa-laptop"></i> {t('det.modalidad')}</dt>
                      <dd>{tDato(taller.modalidad)}</dd>
                    </div>
                    <div>
                      <dt><i className="fa-regular fa-calendar"></i> {t('det.clases')}</dt>
                      <dd>{taller.cantClases}</dd>
                    </div>
                  </dl>
                  <div className="charla-detalle__footer">
                    {!formAbierto && (
                      <button type="button" id="btnMostrarForm" className="nc-btn" onClick={pedirInscripcion}>{t('act.inscribirme')}</button>
                    )}
                  </div>
                </div>
                <div>
                  <FormInscripcion tipo="taller" idActividad={taller.id} visible={formAbierto} alTerminar={inscripcionHecha} />
                </div>
              </div>
            )}
          </DetalleEstado>
        </div>
      </main>
      <ModalLogin abierto={modalAbierto} alCerrar={cerrarModal} quien="taller" />
    </>
  )
}

export default TallerDetalle
