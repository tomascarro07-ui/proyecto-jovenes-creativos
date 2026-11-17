import { useCallback, useState } from 'react'
import { useSesion } from './useSesion'

export function useInscripcion() {
  const { usuario } = useSesion()
  const [formAbierto, setFormAbierto] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)

  const pedirInscripcion = useCallback(() => {
    if (!usuario) setModalAbierto(true)
    else setFormAbierto(true)
  }, [usuario])
  const cerrarModal = useCallback(() => setModalAbierto(false), [])
  const cerrarForm = useCallback(() => setFormAbierto(false), [])

  return { formAbierto, modalAbierto, pedirInscripcion, cerrarModal, cerrarForm }
}
