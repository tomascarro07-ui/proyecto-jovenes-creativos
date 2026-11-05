// La sesión guardada es { token, usuario }. Con cookie httpOnly el token no existe acá (queda null):
// solo se guardan los datos públicos del usuario para dibujar el header.
// La autoridad real es el servidor (ver protegerPagina y el middleware del backend).
let usuarioActual = validarSesion();

function validarSesion() {
    const sesion = leerDeStorage(SESION_KEY, null);
    return sesion && sesion.usuario ? sesion.usuario : null;
}

async function login(correo, contrasenia, destinoUsuario, destinoAdmin) {
    try {
        const r = await pedirApi("/auth/login", { method: "POST", body: { correo, contrasenia } });
        guardarEnStorage(SESION_KEY, { token: r.token || null, usuario: r.usuario });
        window.location.href = r.usuario.esAdministrador ? destinoAdmin : destinoUsuario;
    } catch (error) {
        alert(error.message);
    }
}

async function cerrarSesion() {
    // Le pedimos al servidor que borre la cookie; si no responde, cerramos igual en este navegador
    const espera = new Promise(function (resolver) { setTimeout(resolver, 1500); });
    await Promise.race([pedirApi("/auth/salir", { method: "POST" }).catch(function () {}), espera]);
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

function actualizarSesionUsuario(usuario) {
    const sesion = leerDeStorage(SESION_KEY, null);
    if (!sesion) return;
    sesion.usuario = usuario;
    guardarEnStorage(SESION_KEY, sesion);
    usuarioActual = usuario;
}

// Contrasta la sesión guardada con el servidor: si venció la cierra, y si cambió algo
// (por ejemplo, confirmó el correo desde otra pestaña) actualiza los datos.
async function sincronizarSesion() {
    if (!validarSesion()) return false;
    try {
        const r = await pedirApi("/auth/yo");
        actualizarSesionUsuario(r.usuario);
        return true;
    } catch (e) {
        return false; // un 401 ya cerró la sesión local en pedirApi
    }
}
