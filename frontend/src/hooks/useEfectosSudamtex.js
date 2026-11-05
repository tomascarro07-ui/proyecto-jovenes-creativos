import { useEffect } from 'react'

// Efectos de las páginas de Sudamtex (antes: scripts/sudamtex.js y el script en línea de sudamtex.html).
//  - Marca <body> con la clase "sx" y <html> con "sx-js" mientras la página está abierta.
//  - Resalta en el menú la sección que se está viendo.
//  - Hace aparecer los bloques ".sx-reveal" al hacer scroll.
//  - En la historia: capítulo activo, año grande y barra de progreso.
//  - Cierra el menú móvil con Escape o al pasar a pantalla grande (cerrarMenu viene de la página).
// raizRef apunta al <div className="sx"> de la página; así los efectos solo buscan dentro de ella.
export function useEfectosSudamtex(raizRef, cerrarMenu) {
  useEffect(() => {
    const raiz = raizRef.current
    if (!raiz) return

    const limpiezas = []

    // ---- Clases en <body> y <html>
    const clasesBody = ['nc-home']
    document.body.classList.remove(...clasesBody)
    document.body.classList.add('sx')
    document.documentElement.classList.add('sx-js')
    limpiezas.push(() => {
      document.body.classList.remove('sx')
      document.body.classList.add(...clasesBody)
      document.documentElement.classList.remove('sx-js')
    })

    // ---- Menú móvil: Escape y cambio de tamaño de pantalla
    const alTeclear = (e) => { if (e.key === 'Escape') cerrarMenu() }
    const pantalla = window.matchMedia('(min-width: 861px)')
    document.addEventListener('keydown', alTeclear)
    pantalla.addEventListener('change', cerrarMenu)
    limpiezas.push(() => {
      document.removeEventListener('keydown', alTeclear)
      pantalla.removeEventListener('change', cerrarMenu)
    })

    const hayObservador = 'IntersectionObserver' in window

    // ---- Sección activa en el menú
    if (hayObservador) {
      const enlaces = Array.from(raiz.querySelectorAll('.sx-nav li a[href^="#"]'))
      const secciones = enlaces.map((a) => raiz.querySelector(a.getAttribute('href'))).filter(Boolean)
      const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return
          enlaces.forEach((a) => {
            if (a.getAttribute('href') === '#' + entrada.target.id) a.setAttribute('aria-current', 'true')
            else a.removeAttribute('aria-current')
          })
        })
      }, { rootMargin: '-35% 0px -55% 0px' })
      secciones.forEach((s) => observador.observe(s))
      limpiezas.push(() => observador.disconnect())
    }

    // ---- Aparición suave al hacer scroll
    const elementos = raiz.querySelectorAll('.sx-reveal')
    const mostrarTodo = () => elementos.forEach((el) => el.classList.add('sx-visto'))
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (sinMovimiento || !hayObservador) {
      mostrarTodo()
    } else {
      const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('sx-visto')
            observador.unobserve(entrada.target)
          }
        })
      }, { threshold: 0.12 })
      elementos.forEach((el) => observador.observe(el))
      // Red de seguridad: si el observador no dispara, no se deja contenido oculto
      const seguridad = setTimeout(mostrarTodo, 4000)
      limpiezas.push(() => { observador.disconnect(); clearTimeout(seguridad) })
    }

    // ---- La historia: capítulo activo, año y progreso
    const capitulos = Array.from(raiz.querySelectorAll('.sx-cap'))
    const lista = raiz.querySelector('.sx-hist__lista')
    const anio = raiz.querySelector('#histAnio')
    const progreso = raiz.querySelector('#histProgreso')
    if (hayObservador && capitulos.length && lista && anio) {
      const ver = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('sx-cap--visto'); ver.unobserve(e.target) }
        })
      }, { threshold: 0.12 })
      const activo = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) return
          capitulos.forEach((c) => c.classList.toggle('sx-cap--activo', c === e.target))
          anio.textContent = e.target.dataset.anio
        })
      }, { rootMargin: '-45% 0px -45% 0px' })
      capitulos.forEach((c) => { ver.observe(c); activo.observe(c) })

      const actualizar = () => {
        const r = lista.getBoundingClientRect()
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / r.height))
        lista.style.setProperty('--prog', p)
        if (progreso) progreso.style.width = (p * 100) + '%'
      }
      window.addEventListener('scroll', actualizar, { passive: true })
      window.addEventListener('resize', actualizar)
      actualizar()
      limpiezas.push(() => {
        ver.disconnect()
        activo.disconnect()
        window.removeEventListener('scroll', actualizar)
        window.removeEventListener('resize', actualizar)
      })
    }

    return () => limpiezas.forEach((limpiar) => limpiar())
  }, [raizRef, cerrarMenu])
}
