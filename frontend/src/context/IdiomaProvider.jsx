import { useCallback, useMemo, useState } from 'react'
import { IdiomaContext } from './IdiomaContext'
import { fijarIdioma, idiomaActual, traducir, traducirDato } from '../i18n/motor'

function IdiomaProvider({ children }) {
  const [idioma, setIdioma] = useState(idiomaActual)

  const cambiarIdioma = useCallback((codigo) => {
    fijarIdioma(codigo)
    setIdioma(idiomaActual())
  }, [])

  const valor = useMemo(
    () => ({
      idioma,
      cambiarIdioma,
      t: (clave, vars) => traducir(idioma, clave, vars),
      tDato: (dato) => traducirDato(idioma, dato),
    }),
    [idioma, cambiarIdioma],
  )

  return <IdiomaContext.Provider value={valor}>{children}</IdiomaContext.Provider>
}

export default IdiomaProvider
