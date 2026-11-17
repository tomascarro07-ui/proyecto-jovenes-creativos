import { useIdioma } from '../hooks/useIdioma'

function CargandoPagina() {
  const { t } = useIdioma()
  return <p className="admin-vacio" role="status" style={{ padding: '4rem 1rem', textAlign: 'center' }}>{t('comun.cargando')}</p>
}

export default CargandoPagina
