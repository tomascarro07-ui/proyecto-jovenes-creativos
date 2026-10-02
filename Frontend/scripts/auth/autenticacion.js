// La sesión guardada es { token, usuario }. Sirve para mostrar el header,
// pero la autoridad real es el servidor (ver protegerPagina y el middleware).
let usuarioActual = validarSesion();

function validarSesion() {
    const sesion = leerDeStorage(SESION_KEY, null);
    return sesion && sesion.token ? sesion.usuario : null;
}

async function login(correo, contrasenia, destinoUsuario, destinoAdmin) {
    try {
        const r = await pedirApi("/auth/login", { method: "POST", body: { correo, contrasenia } });
        guardarEnStorage(SESION_KEY, { token: r.token, usuario: r.usuario });
        window.location.href = r.usuario.esAdministrador ? destinoAdmin : destinoUsuario;
    } catch (error) {
        alert(error.message);
    }
}

function cerrarSesion() {
    guardarEnStorage(SESION_KEY, null);
    window.location.href = "index.html";
}

function esAdmin() {
    return !!(usuarioActual && usuarioActual.esAdministrador === true);
}

// Pregunta al servidor quién es el usuario. Si no es admin, lo saca de la página.
async function protegerPagina() {
    try {
        const r = await pedirApi("/auth/yo");
        if (!r.usuario.esAdministrador) throw new Error("no admin");
        document.documentElement.style.visibility = "visible";
        return true;
    } catch (e) {
        window.location.replace("index.html");
        return false;
    }
}