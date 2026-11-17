import { useParams } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useIdioma } from '../hooks/useIdioma'
import { formatearFechaLarga } from '../utils/fechas'
import DetalleActividad from '../components/DetalleActividad'

function TallerDetalle() {
  const { t, tDato } = useIdioma()
  const { idTaller } = useParams()
  const { datos: taller, cargando, error, recargar } = useCarga(() => api.taller(idTaller), [idTaller])

  return (
    <DetalleActividad
      tipo="taller"
      volverA="/cursos"
      volverTexto={t('cursos.volver')}
      noEncontrado={t('det.noTaller')}
      cargando={cargando}
      error={error}
      actividad={taller}
      recargar={recargar}
      etiqueta={taller && tDato(taller.modalidad)}
      descripcion={taller && taller.descripcionCorta}
      datos={taller && [
        { icono: 'fa-solid fa-layer-group', titulo: t('det.nivel'), valor: tDato(taller.nivel) },
        { icono: 'fa-solid fa-laptop', titulo: t('det.modalidad'), valor: tDato(taller.modalidad) },
        { icono: 'fa-regular fa-calendar', titulo: t('det.clases'), valor: taller.cantClases },
        { icono: 'fa-regular fa-calendar-check', titulo: t('det.fecha'), valor: taller.fecha && formatearFechaLarga(taller.fecha) },
        { icono: 'fa-regular fa-clock', titulo: t('det.hora'), valor: taller.hora },
        { icono: 'fa-solid fa-location-dot', titulo: t('det.lugar'), valor: taller.lugar && tDato(taller.lugar) },
      ]}
    />
  )
}

export default TallerDetalle
