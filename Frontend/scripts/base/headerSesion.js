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
        acciones.innerHTML = `<span>¡Hola, <b>${usuario.nombre}</b>!</span>`;
    } else {
        acciones.innerHTML = `<a href="index.html" class="nc-btn nc-btn--pill">Volver al inicio</a>`;
    }
}

actualizarHeaderSesion();