import { Link } from 'react-router-dom'
import Boletin from '../components/Boletin'
import Carrusel from '../components/Carrusel'
import ChatAsistente from '../components/ChatAsistente'
import TarjetaCharla from '../components/tarjetas/TarjetaCharla'
import TarjetaTaller from '../components/tarjetas/TarjetaTaller'
import EstadoCarga from '../components/EstadoCarga'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useIdioma } from '../hooks/useIdioma'

function Inicio() {
  const { t } = useIdioma()
  const { datos: charlas, cargando: cargandoCharlas, error: errorCharlas } = useCarga(() => api.charlas(), [])
  const { datos: talleres, cargando: cargandoTalleres, error: errorTalleres } = useCarga(() => api.talleres(), [])

  return (
    <main id="contenido" className="nc-layout">
      <div className="nc-main">
        <section className="nc-hero" aria-labelledby="heroTitulo">
          <div className="nc-hero__texto">
            <h1 id="heroTitulo">{t('index.heroTitulo')}</h1>
            <p>
              {t('index.heroTexto')}
            </p>
            <div className="nc-hero__acciones">
              <a href="#actividades" className="nc-btn">{t('index.btnExplorar')}</a>
              {' '}
              <a href="#boletin" className="nc-btn nc-btn--outline">{t('index.btnBoletin')}</a>
            </div>
          </div>
          <EstadoCarga cargando={cargandoCharlas} error={errorCharlas}>
            <Carrusel charlas={charlas || []} />
          </EstadoCarga>
        </section>
        <div className="nc-row">
          <section id="propuesta" aria-label={t('index.propuestaAria')}>
            <img src="/img/nodo-cultural.png" alt={t('index.propuestaAlt')} className="propuesta-img" data-bs-toggle="modal" data-bs-target="#modalImagen" />
          </section>
          <div className="modal fade" id="modalImagen" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body p-0">
                  <img src="/img/nodo-cultural.png" alt={t('index.propuestaAlt')} style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              </div>
            </div>
          </div>
          <section id="actividades" className="nc-actividades" aria-labelledby="actTitulo">
            <div className="nc-seccion__cabecera">
              <h2 id="actTitulo">{t('index.actTitulo')}</h2>
              <Link to="/charlas" className="nc-vertodas">{t('common.verTodas')}</Link>
            </div>
            <div className="act-grid" id="charlasGrid">
              <EstadoCarga cargando={cargandoCharlas} error={errorCharlas} vacio={charlas && charlas.length === 0} mensajeVacio={t('list.sinCharlas')}>
                {(charlas || []).map((charla) => (
                  <TarjetaCharla key={charla.id} charla={charla} />
                ))}
              </EstadoCarga>
            </div>
          </section>
        </div>
        <div className="nc-panel">
          <section id="cursos" aria-labelledby="cursosTitulo">
            <div className="nc-seccion__cabecera">
              <h2 id="cursosTitulo">{t('ft.cursos')}</h2>
              <Link to="/cursos" className="nc-vertodas">{t('common.verTodos')}</Link>
            </div>
            <div className="curso-grid">
              <div className="act-grid" id="talleresGrid">
                <EstadoCarga cargando={cargandoTalleres} error={errorTalleres} vacio={talleres && talleres.length === 0} mensajeVacio={t('list.sinTalleres')}>
                  {(talleres || []).map((taller) => (
                    <TarjetaTaller key={taller.id} taller={taller} />
                  ))}
                </EstadoCarga>
              </div>
            </div>
          </section>
          <section id="recursos" aria-labelledby="recursosTitulo">
            <div className="nc-seccion__cabecera">
              <h2 id="recursosTitulo">{t('index.recursosTitulo')}</h2>
              <Link to="/recursos" className="nc-vertodas">{t('common.verTodos')}</Link>
            </div>
            <ul className="recurso-lista">
              <li>
                <i className="fa-solid fa-file-pdf recurso-pdf" aria-hidden="true"></i>
                <div>
                  <strong>Desarrollo urbano de Colonia del Sacramento</strong>
                  {' '}
                  <span>Sebastián Rivero, 2009 · PDF</span>
                </div>
                <a href="/recursos/Desarrollo_urbano_de_Colonia_del_Sacramento.pdf" download>
                  <span>{t('common.descargar')}</span>
                  {' '}
                  <i className="fa-solid fa-download"></i>
                </a>
              </li>
              <li>
                <i className="fa-solid fa-file-pdf recurso-pdf" aria-hidden="true"></i>
                <div>
                  <strong>Cultura de Colonia</strong>
                  {' '}
                  <span>Sebastián Rivero, abril 2005 · PDF</span>
                </div>
                <a href="/recursos/Cultura_de_Colonia.pdf" download>
                  <span>{t('common.descargar')}</span>
                  {' '}
                  <i className="fa-solid fa-download"></i>
                </a>
              </li>
              <li>
                <i className="fa-solid fa-file-pdf recurso-pdf" aria-hidden="true"></i>
                <div>
                  <strong>Fundación de Colonia del Sacramento (1680)</strong>
                  {' '}
                  <span>Estampas Colonienses, enero 2006 · PDF</span>
                </div>
                <a href="/recursos/Fundacion_de_Colonia_del_Sacramento_1680.pdf" download>
                  <span>{t('common.descargar')}</span>
                  {' '}
                  <i className="fa-solid fa-download"></i>
                </a>
              </li>
            </ul>
            <div className="recurso-todos">
              <Link to="/recursos" className="nc-btn nc-btn--outline nc-btn--mini">{t('index.recTodos')}</Link>
            </div>
          </section>
        </div>
      </div>
      <aside className="nc-side">
        <ChatAsistente />
        <Boletin />
      </aside>
    </main>
  )
}

export default Inicio
