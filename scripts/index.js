usuarioActual = validarSesion();
 
const sesionNav = document.getElementById("sesionNav");
 
if (!usuarioActual) {
  // Nadie logeado: mostramos el link para iniciar sesión
  sesionNav.innerHTML = `<a href="login.html" class="btn btn-outline">Iniciar sesión</a>`;
 
} else if (usuarioActual.esAdministrador === true) {
  // Es administrador/a: en vez de "Iniciar sesión" mostramos el Panel de Administrador
  sesionNav.innerHTML = `<a href="admin.html" class="btn btn-outline">Panel de administrador</a>`;
 
} else {
  // Usuario logeado, no administrador (por ahora sólo mostramos que está logeado)
  sesionNav.innerHTML = `<span>¡Hola, <b>${usuarioActual.nombre}</b>!</span>`;
}
 
