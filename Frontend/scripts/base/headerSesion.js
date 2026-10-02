function actualizarHeaderSesion() {
    const acciones = document.getElementById("accionesSesion");

    if (!acciones) {
        return;
    }

    const usuario = validarSesion();
    const pagina = window.location.pathname.split("/").pop();
    const estoyEnInicio = pagina === "" || pagina === "index.html";

    if (!usuario) {
        acciones.innerHTML = `
            <a href="login.html" class="site-login">Iniciar sesión</a>
            <a href="registro.html" class="nc-btn nc-btn--pill">Registrarme</a>`;
    } else if (usuario.esAdministrador === true) {
        acciones.innerHTML = `<a href="admin.html" class="nc-btn nc-btn--pill">Panel de administrador</a>`;
        } else if (estoyEnInicio) {
        acciones.innerHTML = `
            <a href="mis-inscripciones.html" class="site-login">Mis inscripciones</a>
            <span>¡Hola, <b>${escaparHtml(usuario.nombre)}</b>!</span>
            <a href="#" class="site-login" onclick="cerrarSesion(); return false;">Salir</a>`;
    } else {
        acciones.innerHTML = `
            <a href="mis-inscripciones.html" class="site-login">Mis inscripciones</a>
            <a href="index.html" class="nc-btn nc-btn--pill">Volver al inicio</a>
            <a href="#" class="site-login" onclick="cerrarSesion(); return false;">Salir</a>`;
    }
}

actualizarHeaderSesion();