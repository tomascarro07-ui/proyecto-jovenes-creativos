function iniciales(u) {
    return ((u.nombre || "?").charAt(0) + (u.apellido || "").charAt(0)).toUpperCase();
}

function avatarHeader(u) {
    return u.foto
        ? `<img class="hdr-avatar" src="${escaparHtml(u.foto)}" alt="">`
        : `<span class="hdr-avatar">${escaparHtml(iniciales(u))}</span>`;
}

function agregarLinkMenu(href, texto) {
    const ul = document.querySelector(".site-nav ul");
    if (!ul || ul.querySelector('a[href="' + href + '"]')) return;
    const actual = window.location.pathname.split("/").pop() === href;
    const li = document.createElement("li");
    li.innerHTML = `<a href="${href}"${actual ? ' aria-current="page"' : ""}>${texto}</a>`;
    const contacto = ul.querySelector('a[href="contacto.html"]');
    ul.insertBefore(li, contacto ? contacto.parentElement : null);
}

function agregarLinkCalendario() {
    agregarLinkMenu("mapa.html", "Mapa cultural");
    agregarLinkMenu("calendario.html", "Calendario");
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

// Menú hamburguesa (celulares y tabletas)
function iniciarMenuMovil() {
    const boton = document.querySelector(".nav-toggle");
    const menu = document.getElementById("menuPrincipal");
    if (!boton || !menu) return;

    function cerrarMenu() {
        menu.classList.remove("abierto");
        boton.setAttribute("aria-expanded", "false");
        boton.setAttribute("aria-label", "Abrir menú");
        const icono = boton.querySelector("i");
        if (icono) icono.className = "fa-solid fa-bars";
    }

    boton.addEventListener("click", function () {
        const abierto = menu.classList.toggle("abierto");
        boton.setAttribute("aria-expanded", abierto ? "true" : "false");
        boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
        const icono = boton.querySelector("i");
        if (icono) icono.className = abierto ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    });

    menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) cerrarMenu();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") cerrarMenu();
    });

    window.matchMedia("(min-width: 1280px)").addEventListener("change", function (e) {
        if (e.matches) cerrarMenu();
    });
}

iniciarMenuMovil();