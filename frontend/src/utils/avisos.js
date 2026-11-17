let mostrarEnPantalla = null

export function registrarPantallaDeAvisos(funcion) {
  mostrarEnPantalla = funcion
  return () => {
    if (mostrarEnPantalla === funcion) mostrarEnPantalla = null
  }
}

function pedirAviso(aviso) {
  return new Promise((resolver) => {
    if (!mostrarEnPantalla) {
      if (aviso.esConfirmacion) resolver(window.confirm(aviso.mensaje))
      else {
        window.alert(aviso.mensaje)
        resolver(true)
      }
      return
    }
    mostrarEnPantalla({ ...aviso, resolver })
  })
}

export function avisar(mensaje, opciones = {}) {
  return pedirAviso({ tipo: 'info', ...opciones, mensaje, esConfirmacion: false })
}

export function confirmar(mensaje, opciones = {}) {
  return pedirAviso({ tipo: 'peligro', ...opciones, mensaje, esConfirmacion: true })
}

export function avisarAdmin(mensaje, tipo = 'error') {
  return avisar(mensaje, { tipo, idioma: 'es' })
}
