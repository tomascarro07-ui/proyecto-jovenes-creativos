import { useIdioma } from '../../hooks/useIdioma'

// Etiqueta de cupos con color: verde (hay lugar), naranja (quedan pocos), gris (sin cupos o finalizada).
function PildoraCupos({ actividad }) {
  const { t } = useIdioma()
  if (actividad.finalizada) return <span className="ac-pildora ac-pildora--gris">{t('cupo.fin')}</span>
  if (actividad.cupos === 0) return <span className="ac-pildora ac-pildora--gris">{t('cupo.agotado')}</span>
  if (typeof actividad.cupos !== 'number') return null
  if (actividad.cupos === 1) return <span className="ac-pildora ac-pildora--poco">{t('cupo.uno', { n: 1 })}</span>
  if (actividad.cupos <= 3) return <span className="ac-pildora ac-pildora--poco">{t('cupo.ultimos', { n: actividad.cupos })}</span>
  return <span className="ac-pildora">{t('det.cupos', { n: actividad.cupos })}</span>
}

export default PildoraCupos
