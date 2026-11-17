import { useEffect } from 'react'

export function useEfectosSudamtex(raizRef, cerrarMenu) {
  useEffect(() => {
    const raiz = raizRef.current
    if (!raiz) return

    const limpiezas = []

    const clasesBody = ['nc-home']
    document.body.classList.remove(...clasesBody)
    document.body.classList.add('sx')
    document.documentElement.classList.add('sx-js')
    limpiezas.push(() => {
      document.body.classList.remove('sx')
      document.body.classList.add(...clasesBody)
      document.documentElement.classList.remove('sx-js')
    })

    const alTeclear = (evento) => { if (evento.key === 'Escape') cerrarMenu() }
    const pantalla = window.matchMedia('(min-width: 861px)')
    document.addEventListener('keydown', alTeclear)
    pantalla.addEventListener('change', cerrarMenu)
    limpiezas.push(() => {
      document.removeEventListener('keydown', alTeclear)
      pantalla.removeEventListener('change', cerrarMenu)
    })

    const hayObservador = 'IntersectionObserver' in window

    if (hayObservador) {
      const enlaces = Array.from(raiz.querySelectorAll('.sx-nav li a[href^="#"]'))
      const secciones = enlaces.map((enlace) => raiz.querySelector(enlace.getAttribute('href'))).filter(Boolean)
      const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return
          enlaces.forEach((enlace) => {
            if (enlace.getAttribute('href') === '#' + entrada.target.id) enlace.setAttribute('aria-current', 'true')
            else enlace.removeAttribute('aria-current')
          })
        })
      }, { rootMargin: '-35% 0px -55% 0px' })
      secciones.forEach((seccion) => observador.observe(seccion))
      limpiezas.push(() => observador.disconnect())
    }

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
      const seguridad = setTimeout(mostrarTodo, 4000)
      limpiezas.push(() => { observador.disconnect(); clearTimeout(seguridad) })
    }

    const capitulos = Array.from(raiz.querySelectorAll('.sx-cap'))
    const lista = raiz.querySelector('.sx-hist__lista')
    const anio = raiz.querySelector('#histAnio')
    const progreso = raiz.querySelector('#histProgreso')
    if (hayObservador && capitulos.length && lista && anio) {
      const ver = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) { entrada.target.classList.add('sx-cap--visto'); ver.unobserve(entrada.target) }
        })
      }, { threshold: 0.12 })
      const activo = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return
          capitulos.forEach((capitulo) => capitulo.classList.toggle('sx-cap--activo', capitulo === entrada.target))
          anio.textContent = entrada.target.dataset.anio
        })
      }, { rootMargin: '-45% 0px -45% 0px' })
      capitulos.forEach((capitulo) => { ver.observe(capitulo); activo.observe(capitulo) })

      const actualizar = () => {
        const medidas = lista.getBoundingClientRect()
        const avance = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - medidas.top) / medidas.height))
        lista.style.setProperty('--prog', avance)
        if (progreso) progreso.style.width = (avance * 100) + '%'
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
