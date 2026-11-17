import { useContext } from 'react'
import { IdiomaContext } from '../context/IdiomaContext'

export function useIdioma() {
  const contexto = useContext(IdiomaContext)
  if (!contexto) throw new Error('useIdioma debe usarse dentro de <IdiomaProvider>')
  return contexto
}
