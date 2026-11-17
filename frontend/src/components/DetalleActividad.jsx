import { Link } from 'react-router-dom'
import { useInscripcion } from '../hooks/useInscripcion'
import { useIdioma } from '../hooks/useIdioma'
import { useYaInscripto } from '../hooks/useYaInscripto'
import { avisar } from '../utils/avisos'
import DetalleEstado from './DetalleEstado'
import EtiquetaCupos from './EtiquetaCupos'
import FormInscripcion from './FormInscripcion'
import ModalLogin from './ModalLogin'

function DetalleActividad({ tipo, volverA, volverTexto, cargando, error, noEncontrado, actividad, recargar, etiqueta, descripcion, datos, children }) {
  const { t } = useIdioma()
  const { formAbierto, modalAbierto, pedirInscripcion, cerrarModal, cerrarForm } = useInscripcion()
  const cerrada = Boolean(actividad) && (actividad.finalizada === true || actividad.cupos === 0)
  const idActividad = actividad ? actividad.id : ''
  const { yaInscripto, recargarInscripciones } = useYaInscripto(tipo, idActividad)

  function alPedirInscripcion() {
    if (yaInscripto) {
      avisar(t('insc.yaTexto'), {
        tipo: 'info',
        titulo: t('insc.yaTitulo'),
        enlace: { texto: t('insc.verMis'), ruta: '/mis-inscripciones' },
      })
      return
    }
    pedirInscripcion()
  }

  function inscripcionHecha() {
    cerrarForm()
    recargar()
    recargarInscripciones()
  }

  return (
    <>
      <main id="contenido" className="detalle-main">
        <div className="volver">
          <Link to={volverA} className="nc-btn nc-btn--pill">
            <i className="fa-solid fa-left-long" aria-hidden="true"></i>
            {' '}
            <span>{volverTexto}</span>
          </Link>
        </div>
        <div id="detalleContenido" className="detalle-wrapper">
          <DetalleEstado cargando={cargando} error={error} noEncontrado={noEncontrado}>
            {actividad && (
              <div className="charla-detalle">
                <div className="charla-detalle__media">
                  {actividad.imagen && <img src={actividad.imagen} alt={actividad.titulo} />}
                  <span className="charla-detalle__tag">{etiqueta}</span>
                </div>
                <div className="charla-detalle__body">
                  <h1>{actividad.titulo}</h1>
                  <p className="charla-detalle__desc">{descripcion}</p>
                  <dl className="charla-detalle__datos">
                    {datos.filter((dato) => dato.valor !== undefined && dato.valor !== null && dato.valor !== '').map((dato) => (
                      <div key={dato.titulo}>
                        <dt><i className={dato.icono} aria-hidden="true"></i> {dato.titulo}</dt>
                        <dd>{dato.valor}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="charla-detalle__footer">
                    {cerrada ? (
                      <EtiquetaCupos actividad={actividad} />
                    ) : (
                      <>
                        <span className="charla-detalle__cupos">
                          <i className="fa-solid fa-users" aria-hidden="true"></i>
                          {' '}
                          {t('det.cupos', { n: actividad.cupos })}
                        </span>
                        {!formAbierto && (
                          <button type="button" id="btnMostrarForm" className="nc-btn" onClick={alPedirInscripcion}>{t('act.inscribirme')}</button>
                        )}
                      </>
                    )}
                  </div>
                  {!cerrada && <FormInscripcion tipo={tipo} idActividad={actividad.id} visible={formAbierto} alTerminar={inscripcionHecha} />}
                </div>
              </div>
            )}
          </DetalleEstado>
        </div>
        {children}
      </main>
      <ModalLogin abierto={modalAbierto} alCerrar={cerrarModal} quien={tipo} />
    </>
  )
}

export default DetalleActividad
