import { api } from '../api'
import { useCarga } from './useCarga'
import { useSesion } from './useSesion'

export function useYaInscripto(tipo, idActividad) {
  const { usuario } = useSesion()
  const haySesion = Boolean(usuario)
  const { datos, recargar } = useCarga(
    () => (haySesion ? api.misInscripciones().catch(() => []) : Promise.resolve([])),
    [haySesion],
  )
  const inscripciones = datos || []
  const yaInscripto = inscripciones.some((inscripcion) => inscripcion.tipo === tipo && String(inscripcion.actividad) === String(idActividad))
  return { yaInscripto, recargarInscripciones: recargar }
}
