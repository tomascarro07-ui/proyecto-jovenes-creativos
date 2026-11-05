import { useIdioma } from '../hooks/useIdioma'

// Estados comunes de las páginas de detalle: cargando, "no se encontró" (404/400) o error del servidor.
function DetalleEstado({ cargando, error, noEncontrado, children }) {
  const { t } = useIdioma()
  if (cargando) return <p className="admin-vacio" role="status">{t('comun.cargando')}</p>
  if (error) {
    const noExiste = error.status === 404 || error.status === 400
    return <p className="admin-vacio" role="alert">{noExiste ? noEncontrado : t('api.errorServidor')}</p>
  }
  return children
}

export default DetalleEstado
