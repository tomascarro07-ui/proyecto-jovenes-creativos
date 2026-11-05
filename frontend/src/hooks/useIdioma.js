import { useContext } from 'react'
import { IdiomaContext } from '../context/IdiomaContext'

// Uso: const { t, tDato, idioma, cambiarIdioma } = useIdioma()
//   t('hd.buscar')                    -> "Buscar" / "Search" / "Buscar"
//   t('det.cupos', { n: 5 })          -> reemplaza {n} dentro del texto
//   tDato('Presencial')               -> traduce categorías que vienen de la base de datos
export function useIdioma() {
  const contexto = useContext(IdiomaContext)
  if (!contexto) throw new Error('useIdioma debe usarse dentro de <IdiomaProvider>')
  return contexto
}
