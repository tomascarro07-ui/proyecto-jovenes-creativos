import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollArriba() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    let intentos = 0
    let espera
    const buscar = () => {
      let id = hash.slice(1)
      try { id = decodeURIComponent(id) } catch { }
      const elemento = document.getElementById(id)
      if (elemento) elemento.scrollIntoView()
      else if (intentos++ < 20) espera = setTimeout(buscar, 100)
    }
    buscar()
    return () => clearTimeout(espera)
  }, [pathname, hash])

  return null
}

export default ScrollArriba
