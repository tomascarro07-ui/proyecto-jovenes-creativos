import { useParams } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useIdioma } from '../hooks/useIdioma'
import { formatearFechaLarga } from '../utils/fechas'
import DetalleActividad from '../components/DetalleActividad'

function CharlaDetalle() {
  const { t, tDato } = useIdioma()
  const { idCharla } = useParams()
  const { datos: charla, cargando, error, recargar } = useCarga(() => api.charla(idCharla), [idCharla])

  return (
    <DetalleActividad
      tipo="charla"
      volverA="/charlas"
      volverTexto={t('charla.volver')}
      noEncontrado={t('det.noCharla')}
      cargando={cargando}
      error={error}
      actividad={charla}
      recargar={recargar}
      etiqueta={charla && tDato(charla.tipo)}
      descripcion={charla && charla.descripcionCompleta}
      datos={charla && [
        { icono: 'fa-regular fa-calendar', titulo: t('det.fecha'), valor: charla.fecha && formatearFechaLarga(charla.fecha) },
        { icono: 'fa-regular fa-clock', titulo: t('det.hora'), valor: charla.hora },
        { icono: 'fa-solid fa-location-dot', titulo: t('det.lugar'), valor: tDato(charla.lugar) },
        { icono: 'fa-solid fa-user', titulo: t('det.expositor'), valor: charla.expositor },
      ]}
    />
  )
}

export default CharlaDetalle
