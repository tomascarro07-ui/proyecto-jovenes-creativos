import { useCallback, useEffect, useRef, useState } from 'react'
import { useIdioma } from './useIdioma'

// Carga datos del servidor al abrir la página y entrega { datos, cargando, error, recargar }.
//   const { datos: charlas, cargando, error } = useCarga(() => api.charlas(), [])
// Las dependencias (segundo parámetro) funcionan como en useEffect: si cambian, se vuelve a pedir.
// También se vuelve a pedir al cambiar el idioma, porque el servidor devuelve los textos traducidos.
export function useCarga(funcion, dependencias = []) {
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: null })
  const [version, setVersion] = useState(0)
  const { idioma } = useIdioma()
  const funcionRef = useRef(funcion)

  useEffect(() => {
    funcionRef.current = funcion
  })

  // "clave" identifica el pedido en curso; mientras el resultado guardado no sea el de esa clave, estamos cargando
  const clave = JSON.stringify([dependencias, version, idioma])

  useEffect(() => {
    let vigente = true
    funcionRef.current()
      .then((datos) => vigente && setResultado({ clave, datos, error: null }))
      .catch((error) => vigente && setResultado({ clave, datos: null, error }))
    return () => {
      vigente = false
    }
  }, [clave])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])
  const cargando = resultado.clave !== clave
  return {
    datos: cargando ? null : resultado.datos,
    error: cargando ? null : resultado.error,
    cargando,
    recargar,
  }
}
