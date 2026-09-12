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