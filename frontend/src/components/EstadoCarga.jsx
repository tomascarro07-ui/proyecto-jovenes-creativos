import { useIdioma } from '../hooks/useIdioma'
function EstadoCarga({ cargando, error, vacio, mensajeVacio, children }) {
  const { t } = useIdioma()
  if (cargando) {
    return <p className="admin-vacio" role="status">{t('comun.cargando')}</p>
  }
  if (error) {
    return <p className="admin-vacio" role="alert">{t('api.errorServidor')}</p>
  }
  if (vacio) {
    return <p className="admin-vacio">{mensajeVacio || t('comun.vacio')}</p>
  }
  return children
}

export default EstadoCarga
