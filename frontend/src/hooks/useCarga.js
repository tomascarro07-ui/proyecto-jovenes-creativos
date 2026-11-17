import { useCallback, useEffect, useRef, useState } from 'react'
import { useIdioma } from './useIdioma'

export function useCarga(funcion, dependencias = []) {
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: null })
  const [version, setVersion] = useState(0)
  const { idioma } = useIdioma()
  const funcionRef = useRef(funcion)

  useEffect(() => {
    funcionRef.current = funcion
  })

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

  const recargar = useCallback(() => setVersion((versionAnterior) => versionAnterior + 1), [])
  const cargando = resultado.clave !== clave
  return {
    datos: cargando ? null : resultado.datos,
    error: cargando ? null : resultado.error,
    cargando,
    recargar,
  }
}
