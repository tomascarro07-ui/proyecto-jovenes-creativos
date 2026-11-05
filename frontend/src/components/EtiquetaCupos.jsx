import { useIdioma } from '../hooks/useIdioma'
// Etiqueta con los cupos de una actividad: "Finalizada", "Sin cupos" o "N cupos disponibles"
function EtiquetaCupos({ actividad }) {
  const { t } = useIdioma()
  if (actividad.finalizada) return <span className="mc-cupos mc-cupos--fin">{t('cupo.fin')}</span>
  if (actividad.cupos === 0) return <span className="mc-cupos mc-cupos--agotado">{t('cupo.agotado')}</span>
  if (typeof actividad.cupos === 'number') {
    return <span className="mc-cupos">{t(actividad.cupos === 1 ? 'cupo.uno' : 'det.cupos', { n: actividad.cupos })}</span>
  }
  return null
}

export default EtiquetaCupos
