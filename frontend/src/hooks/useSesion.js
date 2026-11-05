import { useContext } from 'react'
import { SesionContext } from '../context/SesionContext'

// Uso: const { usuario, esAdmin, login, salir } = useSesion()
export function useSesion() {
  const contexto = useContext(SesionContext)
  if (!contexto) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return contexto
}
