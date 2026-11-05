import { useCallback, useState } from 'react'
import { useSesion } from './useSesion'

// Lógica común de "Inscribirme" en charlas, talleres y recorridos:
// si no hay sesión se abre el aviso (modal); si hay, se muestra el formulario.
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
