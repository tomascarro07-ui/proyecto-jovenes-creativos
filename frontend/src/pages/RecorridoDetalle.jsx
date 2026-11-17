import { useParams } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useIdioma } from '../hooks/useIdioma'
import { formatearDuracion, formatearFechaLarga } from '../utils/fechas'
import DetalleActividad from '../components/DetalleActividad'
import Valoraciones from '../components/Valoraciones'

function RecorridoDetalle() {
  const { t, tDato } = useIdioma()
  const { idRecorrido } = useParams()
  const { datos: recorrido, cargando, error, recargar } = useCarga(() => api.recorrido(idRecorrido), [idRecorrido])

  return (
    <DetalleActividad
      tipo="recorrido"
      volverA="/recorridos"
      volverTexto={t('recorrido.volver')}
      noEncontrado={t('det.noRecorrido')}
      cargando={cargando}
      error={error}
      actividad={recorrido}
      recargar={recargar}
      etiqueta={recorrido && tDato(recorrido.tipo)}
      descripcion={recorrido && recorrido.descripcionCorta}
      datos={recorrido && [
        { icono: 'fa-solid fa-location-dot', titulo: t('det.puntoSalida'), valor: recorrido.puntoSalida },
        { icono: 'fa-regular fa-clock', titulo: t('det.duracion'), valor: formatearDuracion(recorrido) },
        { icono: 'fa-regular fa-calendar', titulo: t('det.fecha'), valor: recorrido.fecha && formatearFechaLarga(recorrido.fecha) },
        { icono: 'fa-regular fa-clock', titulo: t('det.hora'), valor: recorrido.hora },
      ]}
    >
      {recorrido && <Valoraciones idRecorrido={recorrido.id} />}
    </DetalleActividad>
  )
}

export default RecorridoDetalle
