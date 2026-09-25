usuarioActual = validarSesion();
 
const sesionNav = document.getElementById("sesionNav");
 
if (!usuarioActual) {
  sesionNav.innerHTML = `<div class="site-actions">
          <button class="site-buscar" type="button" aria-label="Buscar"><i class="fa-solid fa-magnifying-glass"></i></button>
          <div>
            <a href="login.html" class="site-login">Iniciar sesión</a>
            <a href="registro.html" class="nc-btn nc-btn--pill">Registrarme</a>
          </div>
        </div>`;
 
} else if (usuarioActual.esAdministrador === true) {
  sesionNav.innerHTML = `<a href="admin.html" class="btn btn-outline">Panel de administrador</a>`;
 
} else {
  sesionNav.innerHTML = `<span>¡Hola, <b>${usuarioActual.nombre}</b>!</span>`;
}
 
