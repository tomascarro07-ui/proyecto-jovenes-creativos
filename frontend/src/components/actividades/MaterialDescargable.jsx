import { Link } from 'react-router-dom'
import EstadoCarga from '../EstadoCarga'
import { api } from '../../api'
import { useCarga } from '../../hooks/useCarga'
import { useIdioma } from '../../hooks/useIdioma'

const MAXIMO = 4

function MaterialDescargable({ subtitulo }) {
  const { t } = useIdioma()
  const { datos, cargando, error } = useCarga(() => api.recursos(), [])
  const recientes = (datos || []).slice().reverse().slice(0, MAXIMO)
  return (
    <section id="recursos" className="arte-bloque arte-bloque--panel" aria-labelledby="materialTitulo">
      <div className="nc-seccion__cabecera">
        <h2 id="materialTitulo">{t('common.material')}</h2>
        <Link to="/recursos" className="nc-vertodas">{t('mat.verTodo')}</Link>
      </div>
      <p className="arte-sub">{subtitulo}</p>
      <div className="ac-material">
        <EstadoCarga cargando={cargando} error={error} vacio={datos && datos.length === 0} mensajeVacio={t('mat.sinMaterial')}>
          {recientes.map((recurso) => (
            <article className="ac-pdf" key={recurso.id}>
              <div className="ac-pdf__icono" aria-hidden="true">
                <i className="fa-solid fa-file-pdf"></i>
                <span>PDF</span>
              </div>
              <div className="ac-pdf__cuerpo">
                <h3>{recurso.titulo}</h3>
                <p>{recurso.descripcion}</p>
                <div className="ac-pdf__pie">
                  <span>{recurso.paginas} {t(recurso.paginas === 1 ? 'rec.pagina' : 'rec.paginas')}</span>
                  <a href={recurso.archivo} download className="nc-btn nc-btn--mini" aria-label={t('rec.descargarAria', { titulo: recurso.titulo })}>
                    <i className="fa-solid fa-download" aria-hidden="true"></i> {t('common.descargar')}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </EstadoCarga>
      </div>
    </section>
  )
}

export default MaterialDescargable
