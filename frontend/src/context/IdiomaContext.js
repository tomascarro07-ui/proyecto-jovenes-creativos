import { createContext } from 'react'

// Guarda el idioma elegido (es / en / pt) y las funciones t(), tDato() y cambiarIdioma().
// Se usa con el hook useIdioma() (carpeta hooks). El proveedor está en IdiomaProvider.jsx.
export const IdiomaContext = createContext(null)
