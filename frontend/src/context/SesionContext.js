import { createContext } from 'react'

// Guarda la sesión de la persona (quién es, si es administradora) y las acciones login / salir.
// Se usa con el hook useSesion() (carpeta hooks). El proveedor está en SesionProvider.jsx.
export const SesionContext = createContext(null)
