function iniciales(u) {
    return ((u.nombre || "?").charAt(0) + (u.apellido || "").charAt(0)).toUpperCase();
}

function avatarHeader(u) {
    return u.foto
        ? `<img class="hdr-avatar" src="${escaparHtml(u.foto)}" alt="">`
        : `<span class="hdr-avatar">${escaparHtml(iniciales(u))}</span>`;
}

function agregarLinkCalendario() {
    const ul = document.querySelector(".site-nav ul");
    if (!ul || ul.querySelector('a[href="calendario.html"]')) return;
    const actual = window.location.pathname.split("/").pop() === "calendario.html";
    const li = document.createElement("li");
    li.innerHTML = `<a href="calendario.html"${actual ? ' aria-current="page"' : ""}>Calendario</a>`;
    const contacto = ul.querySelector('a[href="contacto.html"]');
    ul.insertBefore(li, contacto ? contacto.parentElement : null);
}

function actualizarHeaderSesion() {
    agregarLinkCalendario();

    const acciones = document.getElementById("accionesSesion");
    if (!acciones) return;

    const usuario = validarSesion();

    if (!usuario) {
        acciones.innerHTML = `
            <a href="login.html" class="site-login">Iniciar sesión</a>
            <a href="registro.html" class="nc-btn nc-btn--pill">Registrarme</a>`;
    } else if (usuario.esAdministrador === true) {
        acciones.innerHTML = `<a href="admin.html" class="nc-btn nc-btn--pill">Panel de administrador</a>`;
    } else {
        acciones.innerHTML = `
            <a href="cuenta.html" class="hdr-cuenta" title="Mi cuenta">
                ${avatarHeader(usuario)}<span>${escaparHtml(usuario.nombre)}</span>
            </a>
            <a href="mis-inscripciones.html" class="site-login">Mis inscripciones</a>
            <a href="#" class="site-login" onclick="cerrarSesion(); return false;">Salir</a>`;
    }
}

actualizarHeaderSesion();