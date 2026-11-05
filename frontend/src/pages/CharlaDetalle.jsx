import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useInscripcion } from '../hooks/useInscripcion'
import FormInscripcion from '../components/FormInscripcion'
import ModalLogin from '../components/ModalLogin'
import DetalleEstado from '../components/DetalleEstado'
import { useIdioma } from '../hooks/useIdioma'

function CharlaDetalle() {
  const { t, tDato } = useIdioma()
  const { idCharla } = useParams()
  const { datos: charla, cargando, error, recargar } = useCarga(() => api.charla(idCharla), [idCharla])
  const { formAbierto, modalAbierto, pedirInscripcion, cerrarModal, cerrarForm } = useInscripcion()

  function inscripcionHecha() {
    cerrarForm()
    recargar()
  }

  return (
    <>
      <main id="contenido" className="detalle-main">
        <div className="volver">
          <Link to="/charlas" className="nc-btn nc-btn--pill">
            <i className="fa-solid fa-left-long"></i>
            {' '}
            <span>{t('charla.volver')}</span>
          </Link>
        </div>
        <div id="detalleContenido" className="detalle-wrapper">
          <DetalleEstado cargando={cargando} error={error} noEncontrado={t('det.noCharla')}>
            {charla && (
              <div className="charla-detalle">
                <div className="charla-detalle__media">
                  <img src={charla.imagen} alt={charla.titulo} />
                  <span className="charla-detalle__tag">{tDato(charla.tipo)}</span>
                </div>
                <div className="charla-detalle__body">
                  <h1>{charla.titulo}</h1>
                  <p className="charla-detalle__desc">{charla.descripcionCompleta}</p>
                  <dl className="charla-detalle__datos">
                    <div>
                      <dt><i className="fa-regular fa-calendar"></i> {t('det.fecha')}</dt>
                      <dd>{charla.fecha}</dd>
                    </div>
                    <div>
                      <dt><i className="fa-regular fa-clock"></i> {t('det.hora')}</dt>
                      <dd>{charla.hora}</dd>
                    </div>
                    <div>
                      <dt><i className="fa-solid fa-location-dot"></i> {t('det.lugar')}</dt>
                      <dd>{tDato(charla.lugar)}</dd>
                    </div>
                    <div>
                      <dt><i className="fa-solid fa-user"></i> {t('det.expositor')}</dt>
                      <dd>{charla.expositor}</dd>
                    </div>
                  </dl>
                  <div className="charla-detalle__footer">
                    <span className="charla-detalle__cupos">
                      <i className="fa-solid fa-users"></i>
                      {' '}
                      {t('det.cupos', { n: charla.cupos })}
                    </span>
                    {!formAbierto && (
                      <button type="button" id="btnMostrarForm" className="nc-btn" onClick={pedirInscripcion}>{t('act.inscribirme')}</button>
                    )}
                  </div>
                  <div>
                    <FormInscripcion tipo="charla" idActividad={charla.id} visible={formAbierto} alTerminar={inscripcionHecha} />
                  </div>
                </div>
              </div>
            )}
          </DetalleEstado>
        </div>
      </main>
      <ModalLogin abierto={modalAbierto} alCerrar={cerrarModal} quien="charla" />
    </>
  )
}

export default CharlaDetalle
