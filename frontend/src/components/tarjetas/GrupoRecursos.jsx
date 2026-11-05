import { useIdioma } from '../../hooks/useIdioma'
// Una categoría de recursos con su lista de PDF descargables.
function GrupoRecursos({ categoria, recursos }) {
  const { t, tDato } = useIdioma()
  return (
    <div className="col-lg-6">
      <h3 className="h6 fw-semibold mb-2">{tDato(categoria)}</h3>
      <ul className="recurso-lista">
        {recursos.map((recurso) => (
          <li key={recurso.id}>
            <i className="fa-solid fa-file-pdf recurso-pdf" aria-hidden="true"></i>
            <div>
              <strong>{recurso.titulo}</strong>
              <span className="recurso-desc">{recurso.descripcion}</span>
              <span className="recurso-desc">{recurso.fuente} · PDF · {recurso.paginas} {t(recurso.paginas === 1 ? 'rec.pagina' : 'rec.paginas')}</span>
            </div>
            <a href={recurso.archivo} download aria-label={t('rec.descargarAria', { titulo: recurso.titulo })}>
              {t('common.descargar')} <i className="fa-solid fa-download"></i>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default GrupoRecursos
