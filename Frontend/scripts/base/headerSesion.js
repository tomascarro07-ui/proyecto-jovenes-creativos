// Header único del sitio: se dibuja desde acá en todas las páginas.
// Para agregar o cambiar un enlace del menú, se edita solo HD_MENU.

const HD_MENU = [
    { href: "index.html", texto: "nav.inicio" },
    { href: "museos.html", texto: "nav.museos" },
    {
        grupo: "nav.g.actividades", id: "actividades", items: [
            { href: "charlas.html", texto: "nav.charlas", desc: "nav.charlas.desc", icono: "fa-microphone-lines" },
            { href: "cursos.html", texto: "nav.cursos", desc: "nav.cursos.desc", icono: "fa-palette" },
            { href: "recorridos.html", texto: "nav.recorridos", desc: "nav.recorridos.desc", icono: "fa-person-walking" },
            { href: "calendario.html", texto: "nav.calendario", desc: "nav.calendario.desc", icono: "fa-calendar-days" }
        ]
    },
    {
        grupo: "nav.g.explorar", id: "explorar", items: [
            { href: "mapa.html", texto: "nav.mapa", desc: "nav.mapa.desc", icono: "fa-map-location-dot" },
            { href: "recursos.html", texto: "nav.recursos", desc: "nav.recursos.desc", icono: "fa-book-open" }
        ]
    },
    {
        grupo: "nav.g.nosotros", id: "nosotros", items: [
            { href: "nosotros.html", texto: "nav.nosotros", desc: "nav.nosotros.desc", icono: "fa-people-group" },
            { href: "contacto.html", texto: "nav.contacto", desc: "nav.contacto.desc", icono: "fa-envelope" }
        ]
    }
];

// Las páginas de detalle resaltan la sección a la que pertenecen
const HD_PADRES = {
    "charla-detalle.html": "charlas.html",
    "taller-detalle.html": "cursos.html",
    "recorrido-detalle.html": "recorridos.html",
    "museo-detalle.html": "museos.html"
};

const HD_ESCRITORIO = "(min-width: 1025px)";

function hdPaginaActual() {
    const archivo = window.location.pathname.split("/").pop() || "index.html";
    return HD_PADRES[archivo] || archivo;
}

function iniciales(u) {
    return ((u.nombre || "?").charAt(0) + (u.apellido || "").charAt(0)).toUpperCase();
}

function avatarHeader(u) {
    return u.foto
        ? `<img class="hdr-avatar" src="${escaparHtml(u.foto)}" alt="">`
        : `<span class="hdr-avatar">${escaparHtml(iniciales(u))}</span>`;
}

const hdChevron = '<i class="fa-solid fa-chevron-down hd-chev" aria-hidden="true"></i>';

function hdItemSub(item, actual) {
    return `<li><a class="hd-sub__link" href="${item.href}"${item.href === actual ? ' aria-current="page"' : ""}>
        <span class="hd-sub__ico"><i class="fa-solid ${item.icono}" aria-hidden="true"></i></span>
        <span class="hd-sub__txt"><strong>${t(item.texto)}</strong><small>${t(item.desc)}</small></span></a></li>`;
}

function hdHtmlNav() {
    const actual = hdPaginaActual();
    return HD_MENU.map(function (e) {
        if (!e.grupo) {
            return `<li><a class="hd-link" href="${e.href}"${e.href === actual ? ' aria-current="page"' : ""}>${t(e.texto)}</a></li>`;
        }
        const activo = e.items.some(function (i) { return i.href === actual; });
        return `<li class="hd-grupo${activo ? " hd-activo" : ""}">
            <button type="button" class="hd-trigger" aria-expanded="false" aria-controls="hd-menu-${e.id}">${t(e.grupo)} ${hdChevron}</button>
            <ul class="hd-sub" id="hd-menu-${e.id}" hidden>${e.items.map(function (i) { return hdItemSub(i, actual); }).join("")}</ul>
        </li>`;
    }).join("");
}

function hdHtmlSesion() {
    const u = validarSesion();
    if (!u) {
        return `<a href="login.html" class="hd-ingresar">${t("hd.iniciarSesion")}</a>
                <a href="registro.html" class="nc-btn hd-registro">${t("hd.registrarme")}</a>`;
    }
    const actual = hdPaginaActual();
    const admin = u.esAdministrador === true;
    const nombreCompleto = (u.nombre + " " + (u.apellido || "")).trim();
    const enlace = function (href, icono, texto) {
        return `<li><a class="hd-sub__link hd-sub__link--simple" href="${href}"${href === actual ? ' aria-current="page"' : ""}>
            <span class="hd-sub__ico"><i class="fa-solid ${icono}" aria-hidden="true"></i></span><span class="hd-sub__txt"><strong>${texto}</strong></span></a></li>`;
    };
    return `<div class="hd-grupo hd-usuario">
        <button type="button" class="hd-trigger hd-cuenta-btn" aria-expanded="false" aria-controls="hd-menu-usuario" aria-label="${escaparHtml(t("hd.menuDe", { nombre: nombreCompleto }))}">
            ${avatarHeader(u)}<span class="hd-nombre">${escaparHtml(u.nombre)}</span>${hdChevron}
        </button>
        <ul class="hd-sub hd-sub--der" id="hd-menu-usuario" hidden>
            <li class="hd-sub__cab"><strong>${escaparHtml(nombreCompleto)}</strong><small>${escaparHtml(u.correo || "")}</small></li>
            ${admin ? enlace("admin.html", "fa-gauge-high", t("hd.panelAdmin")) : ""}
            ${enlace("cuenta.html", "fa-user", t("hd.miCuenta"))}
            ${admin ? "" : enlace("mis-inscripciones.html", "fa-ticket", t("hd.misInscripciones"))}
            <li><button type="button" class="hd-sub__link hd-sub__link--simple hd-salir" data-accion="salir">
                <span class="hd-sub__ico"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i></span><span class="hd-sub__txt"><strong>${t("hd.cerrarSesion")}</strong></span></button></li>
        </ul>
    </div>`;
}

// Redibuja solo la zona de sesión (la usa cuenta.js después de editar el perfil)
function actualizarHeaderSesion() {
    const zona = document.getElementById("accionesSesion");
    if (zona) zona.innerHTML = hdHtmlSesion();
    hdMostrarAviso();
}

// Franja debajo del header para quienes todavía no confirmaron su correo
function hdMostrarAviso() {
    const previo = document.getElementById("avisoVerificacion");
    if (previo) previo.remove();

    const u = validarSesion();
    const header = document.querySelector(".site-header");
    if (!u || u.correoVerificado !== false || !header) return;
    if (window.location.pathname.endsWith("verificar-correo.html")) return;
    try { if (sessionStorage.getItem("nc_aviso_cerrado") === "1") return; } catch (e) { /* sin sessionStorage */ }

    const aviso = document.createElement("div");
    aviso.id = "avisoVerificacion";
    aviso.className = "hd-aviso";
    aviso.setAttribute("role", "status");
    aviso.innerHTML = `
        <p><i class="fa-solid fa-envelope-circle-check" aria-hidden="true"></i>
        <span>${t("hd.confirmaCorreo", { correo: escaparHtml(u.correo) })} <span id="avisoMensaje"></span></span></p>
        <div class="hd-aviso__acciones">
            <button type="button" class="hd-aviso__btn" data-aviso="reenviar">${t("hd.reenviar")}</button>
            <button type="button" class="hd-aviso__cerrar" data-aviso="cerrar" aria-label="${t("hd.cerrarAviso")}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>`;
    header.insertAdjacentElement("afterend", aviso);

    aviso.addEventListener("click", async function (e) {
        const accion = e.target.closest("[data-aviso]");
        if (!accion) return;

        if (accion.dataset.aviso === "cerrar") {
            try { sessionStorage.setItem("nc_aviso_cerrado", "1"); } catch (err) { /* sin sessionStorage */ }
            aviso.remove();
            return;
        }

        const mensaje = document.getElementById("avisoMensaje");
        accion.disabled = true;
        mensaje.textContent = t("hd.enviando");
        try {
            const r = await pedirApi("/auth/reenviar-verificacion", { method: "POST" });
            if (r.correoVerificado) {
                actualizarSesionUsuario(Object.assign({}, u, { correoVerificado: true }));
                aviso.remove();
                return;
            }
            mensaje.textContent = r.mensaje;
        } catch (error) {
            mensaje.textContent = error.message;
        }
        setTimeout(function () { accion.disabled = false; }, 30000); // evita reenvíos seguidos
    });
}

function hdHtmlIdioma() {
    const actual = idiomaActual();
    const items = Object.keys(I18N_IDIOMAS).map(function (cod) {
        return `<li><button type="button" class="hd-sub__link hd-sub__link--simple" data-idioma="${cod}"${cod === actual ? ' aria-current="true"' : ""}>
            <span class="hd-sub__ico hd-idioma-cod">${cod.toUpperCase()}</span><span class="hd-sub__txt"><strong>${I18N_IDIOMAS[cod]}</strong></span></button></li>`;
    }).join("");
    return `<div class="hd-grupo hd-idioma">
        <button type="button" class="hd-trigger" aria-expanded="false" aria-controls="hd-menu-idioma" aria-label="${t("hd.idioma")}">
            <i class="fa-solid fa-globe" aria-hidden="true"></i><span class="hd-idioma-cod">${actual.toUpperCase()}</span>${hdChevron}
        </button>
        <ul class="hd-sub hd-sub--der" id="hd-menu-idioma" hidden>${items}</ul>
    </div>`;
}

// Al cambiar de idioma se vuelven a dibujar solo las partes del header que tienen texto
function hdActualizarIdioma() {
    const header = document.querySelector(".site-header");
    if (!header || !header.querySelector(".hd-nav")) return;

    const poner = function (sel, attr, valor) {
        const el = header.querySelector(sel);
        if (el) { if (attr) el.setAttribute(attr, valor); else el.textContent = valor; }
    };
    const nav = header.querySelector(".hd-nav");
    nav.setAttribute("aria-label", t("hd.principal"));
    nav.querySelector("ul").innerHTML = hdHtmlNav();
    document.getElementById("zonaIdioma").innerHTML = hdHtmlIdioma();

    const panelAbierto = header.querySelector(".hd-panel").classList.contains("abierto");
    poner(".hd-saltar", null, t("hd.saltar"));
    poner(".brand", "aria-label", t("hd.irInicio"));
    poner(".hd-toggle", "aria-label", panelAbierto ? t("hd.cerrarMenu") : t("hd.abrirMenu"));
    poner('label[for="hdBuscarMovil"]', null, t("hd.buscarSitio"));
    poner("#hdBuscarMovil", "placeholder", t("hd.buscarPlaceholder"));
    poner(".hd-buscar", "aria-label", t("hd.buscarSitio"));
    poner(".hd-buscar", "title", t("hd.buscar"));
    actualizarHeaderSesion();
}

document.addEventListener("idiomacambiado", hdActualizarIdioma);

function hdConstruir() {
    const header = document.querySelector(".site-header");
    if (!header) return null;

    header.innerHTML = `
    <a class="hd-saltar" href="#contenido">${t("hd.saltar")}</a>
    <div class="hd-inner">
        <a class="brand" href="index.html" aria-label="${t("hd.irInicio")}">
            <img src="img/logo.png" alt="Nodo Cultural" width="138" height="46">
        </a>
        <button class="hd-toggle" type="button" aria-expanded="false" aria-controls="menuPrincipal" aria-label="${t("hd.abrirMenu")}">
            <i class="fa-solid fa-bars" aria-hidden="true"></i>
        </button>
        <div class="hd-panel" id="menuPrincipal">
            <form class="hd-busqueda-movil" action="buscar.html" role="search">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <label class="visually-hidden" for="hdBuscarMovil">${t("hd.buscarSitio")}</label>
                <input type="search" id="hdBuscarMovil" name="q" maxlength="80" placeholder="${t("hd.buscarPlaceholder")}">
            </form>
            <nav class="hd-nav" aria-label="${t("hd.principal")}"><ul>${hdHtmlNav()}</ul></nav>
            <div class="hd-derecha">
                <a class="hd-buscar" href="buscar.html" aria-label="${t("hd.buscarSitio")}" title="${t("hd.buscar")}"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></a>
                <div class="hd-idioma-zona" id="zonaIdioma">${hdHtmlIdioma()}</div>
                <div class="hd-sesion" id="accionesSesion"></div>
            </div>
        </div>
    </div>`;

    // Destino del enlace "Saltar al contenido"
    const principal = document.querySelector("main");
    if (principal && !principal.id) principal.id = "contenido";

    actualizarHeaderSesion();
    return header;
}

function hdIniciarComportamiento(header) {
    const panel = header.querySelector(".hd-panel");
    const toggle = header.querySelector(".hd-toggle");
    const esEscritorio = function () { return window.matchMedia(HD_ESCRITORIO).matches; };

    function alternarSub(boton, abrir) {
        const sub = document.getElementById(boton.getAttribute("aria-controls"));
        if (!sub) return;
        boton.setAttribute("aria-expanded", abrir ? "true" : "false");
        sub.hidden = !abrir;
    }

    function cerrarSubmenus(salvo) {
        header.querySelectorAll('.hd-trigger[aria-expanded="true"]').forEach(function (b) {
            if (b !== salvo) alternarSub(b, false);
        });
    }

    function cerrarPanel() {
        panel.classList.remove("abierto");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", t("hd.abrirMenu"));
        toggle.querySelector("i").className = "fa-solid fa-bars";
    }

    toggle.addEventListener("click", function () {
        const abierto = panel.classList.toggle("abierto");
        toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
        toggle.setAttribute("aria-label", abierto ? t("hd.cerrarMenu") : t("hd.abrirMenu"));
        toggle.querySelector("i").className = abierto ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    });

    header.addEventListener("click", function (e) {
        const idioma = e.target.closest("[data-idioma]");
        if (idioma) { cambiarIdioma(idioma.dataset.idioma); return; }

        const salir = e.target.closest('[data-accion="salir"]');
        if (salir) { cerrarSesion(); return; }

        const boton = e.target.closest(".hd-trigger");
        if (boton) {
            const abrir = boton.getAttribute("aria-expanded") !== "true";
            cerrarSubmenus(boton);
            alternarSub(boton, abrir);
            return;
        }
        if (e.target.closest("a") && !esEscritorio()) cerrarPanel();
    });

    // Con el teclado, al salir de un submenú de escritorio se cierra solo
    header.addEventListener("focusout", function (e) {
        if (!esEscritorio()) return;
        const grupo = e.target.closest(".hd-grupo");
        if (grupo && !grupo.contains(e.relatedTarget)) {
            const b = grupo.querySelector(".hd-trigger");
            if (b) alternarSub(b, false);
        }
    });

    document.addEventListener("click", function (e) {
        if (!header.contains(e.target)) { cerrarSubmenus(); }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        const abierto = header.querySelector('.hd-trigger[aria-expanded="true"]');
        cerrarSubmenus();
        if (abierto && header.contains(document.activeElement)) abierto.focus();
        if (panel.classList.contains("abierto")) { cerrarPanel(); toggle.focus(); }
    });

    window.matchMedia(HD_ESCRITORIO).addEventListener("change", function () {
        cerrarPanel();
        cerrarSubmenus();
    });

    // Sombra suave cuando la página baja
    function sombra() { header.classList.toggle("hd-sombra", window.scrollY > 4); }
    window.addEventListener("scroll", sombra, { passive: true });
    sombra();
}

// Una vez por minuto como máximo, contrasta la sesión con el servidor
async function hdSincronizar() {
    if (!validarSesion()) return;
    try {
        const ultimo = Number(sessionStorage.getItem("nc_sync") || 0);
        if (Date.now() - ultimo < 60000) return;
        sessionStorage.setItem("nc_sync", String(Date.now()));
    } catch (e) { /* sin sessionStorage: se sincroniza en cada página */ }

    const antes = JSON.stringify(validarSesion());
    await sincronizarSesion();
    if (JSON.stringify(validarSesion()) !== antes) actualizarHeaderSesion();
}

function hdIniciar() {
    const header = hdConstruir();
    if (!header) return;
    hdIniciarComportamiento(header);
    hdSincronizar();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hdIniciar);
} else {
    hdIniciar();
}
