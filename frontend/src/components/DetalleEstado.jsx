import { useIdioma } from '../hooks/useIdioma'

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
