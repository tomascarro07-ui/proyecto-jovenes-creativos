let usuarioActual = validarSesion();

function login(email, contrasenia, destino) {
    let usuario = sesionActiva(email);

    if (!usuario) {
        alert("Los datos ingresados son incorrectos. Intente de nuevo");
        return;
    }

    if (usuario.contrasenia.trim() === contrasenia.trim()) {
        guardarEnStorage(SESION_KEY, usuario);
        window.location.href = destino;
    } else {
        alert("Los datos ingresados son incorrectos. Intente de nuevo");
    }
}

function validarSesion() {
    let userActual = leerDeStorage(SESION_KEY, null);
    return userActual;
}

function cerrarSesion() {
    guardarEnStorage(SESION_KEY, null);
    window.location.href = "index.html";
}

function sesionActiva(correo) {
    let usuarios = leerDeStorage(USUARIOS_REGISTRADOS_KEY, []);

    return usuarios.find(function(usuario) {
        return usuario.correo === correo;
    }) || false;
}

function esAdmin() {
    return usuarioActual && usuarioActual.esAdministrador === true;
}

function protegerPagina() {
    if (!esAdmin()) {
        window.location.href = "index.html";
    }
}

