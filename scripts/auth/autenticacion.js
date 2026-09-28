let usuarioActual = validarSesion();

function login(email, contrasenia, destino) {
    let usuario = sesionActiva(email);

    if (!usuario) {
        alert("Los datos ingresados son incorrectos. Intente de nuevo");
        return;
    }

    if (usuario.contrasenia === contrasenia) {
        guardarEnStorage("sesionActual", usuario);
        window.location.href = destino;
    } else {
        alert("Los datos ingresados son incorrectos. Intente de nuevo");
    }
}

function validarSesion() {
    let userActual = leerDeStorage("sesionActual", null);
    return userActual;
}

function cerrarSesion() {
    guardarEnStorage("sesionActual", null);
    window.location.href = "index.html";
}

function sesionActiva(correo) {
    let usuarios = leerDeStorage("usuariosRegistrados", []);

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].correo === correo) {
            return usuarios[i];
        }
    }

    return false;
}

function esAdmin() {
    return usuarioActual && usuarioActual.esAdministrador === true;
}

function protegerPagina() {
    if (!esAdmin()) {
        window.location.href = "index.html";
    }
}

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