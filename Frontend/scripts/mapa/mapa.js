const TIPOS = {
    museo: { nombre: "Museo", plural: "Museos", icono: "fa-landmark", url: (id) => "museo-detalle.html?idMuseo=" + id },
    charla: { nombre: "Charla", plural: "Charlas", icono: "fa-microphone-lines", url: (id) => "charla-detalle.html?idCharla=" + id },
    taller: { nombre: "Taller", plural: "Talleres", icono: "fa-palette", url: (id) => "taller-detalle.html?idTaller=" + id },
    recorrido: { nombre: "Recorrido", plural: "Recorridos", icono: "fa-person-walking", url: (id) => "recorrido-detalle.html?idRecorrido=" + id }
};

const estado = { puntos: [], tipos: new Set(Object.keys(TIPOS)), finalizadas: false, grupos: [], abierto: null };
let mapa, capaMarcadores, capaNombres;

const tarjeta = document.getElementById("mapaTarjeta");

/* ---------- Mapa base ---------- */
function crearMapa() {
    mapa = L.map("mapaCultural", {
        center: CENTRO_COLONIA,
        zoom: 15,
        minZoom: 12,
        maxZoom: 18,
        maxBounds: LIMITES_COLONIA,
        maxBoundsViscosity: 0.9
    });
    capaBase().addTo(mapa);
    capaNombres = capaCalles(); // el interruptor "Nombres de calles" la agrega o la quita
    capaMarcadores = L.layerGroup().addTo(mapa);
    mapa.on("click", cerrarTarjeta);
}

function visibles() {
    return estado.puntos.filter(function (p) {
        return estado.tipos.has(p.tipo) && (estado.finalizadas || !p.finalizada);
    });
}

function textoFecha(p) {
    if (!p.fecha) return "";
    const partes = p.fecha.split("-").map(Number);
    const f = new Date(partes[0], partes[1] - 1, partes[2]).toLocaleDateString("es-UY", { day: "numeric", month: "long" });
    return f + (p.hora ? " · " + p.hora : "");
}

function textoCupos(p) {
    if (p.finalizada) return '<span class="mc-cupos mc-cupos--fin">Finalizada</span>';
    if (p.cupos === 0) return '<span class="mc-cupos mc-cupos--agotado">Sin cupos</span>';
    return `<span class="mc-cupos">${p.cupos} ${p.cupos === 1 ? "cupo disponible" : "cupos disponibles"}</span>`;
}

function itemHtml(p) {
    const t = TIPOS[p.tipo];
    return `
    <article class="mc-item tipo-${p.tipo}">
        ${p.imagen
            ? `<img class="mc-item__img" src="${escaparHtml(p.imagen)}" alt="" loading="lazy">`
            : `<div class="mc-item__img mc-item__img--vacia"><i class="fa-solid ${t.icono}"></i></div>`}
        <div class="mc-item__cuerpo">
            <span class="mc-badge"><i class="fa-solid ${t.icono}"></i> ${t.nombre}${p.virtual ? " · Virtual" : ""}${p.subtitulo ? " · " + escaparHtml(p.subtitulo) : ""}</span>
            <h3>${escaparHtml(p.titulo)}</h3>
            <p><i class="fa-solid fa-location-dot"></i> ${escaparHtml(p.lugar || "")}</p>
            ${p.fecha ? `<p><i class="fa-regular fa-calendar"></i> ${escaparHtml(textoFecha(p))}</p>` : ""}
            ${p.horario ? `<p><i class="fa-regular fa-clock"></i> ${escaparHtml(p.horario)}</p>` : ""}
            ${textoCupos(p)}
            <a class="insc-btn insc-btn--primario" href="${t.url(p.id)}">Ver detalle <i class="fa-solid fa-arrow-right"></i></a>
        </div>
    </article>`;
}

/* ---------- Marcadores ---------- */
const SIN_IMAGEN = "IMAGEN_MUSEO";

function crearIcono(tipo, badge) {
    return L.divIcon({
        className: "nc-pin-wrap",
        html: `<div class="nc-pin tipo-${tipo}"><i class="fa-solid ${TIPOS[tipo].icono}"></i>` +
              (badge > 0 ? `<span class="nc-pin__n">${badge}</span>` : "") + `</div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 44]
    });
}

// Las propuestas de un mismo museo (o del mismo punto) comparten un único pin
function agrupar(puntos) {
    const mapaGrupos = new Map();
    puntos.forEach(function (p) {
        const k = p.museoId ? "m:" + p.museoId : p.lat.toFixed(4) + "," + p.lng.toFixed(4);
        if (!mapaGrupos.has(k)) mapaGrupos.set(k, []);
        mapaGrupos.get(k).push(p);
    });
    return Array.from(mapaGrupos.values());
}

function actividadesDelMuseo(idMuseo) {
    return estado.puntos
        .filter(function (p) {
            return p.museoId === idMuseo && p.tipo !== "museo" && (estado.finalizadas || !p.finalizada);
        })
        .sort(function (a, b) {
            return (a.fecha || "9999").localeCompare(b.fecha || "9999") || (a.hora || "").localeCompare(b.hora || "");
        });
}

function pintarMarcadores() {
    capaMarcadores.clearLayers();
    cerrarTarjeta();
    estado.grupos = [];

    const lista = visibles();
    agrupar(lista).forEach(function (items) {
        const museo = items.find(function (i) { return i.tipo === "museo"; });
        const rep = museo || items[0];
        const badge = museo ? actividadesDelMuseo(museo.id).length : (items.length > 1 ? items.length : 0);

        const marcador = L.marker([rep.lat, rep.lng], {
            icon: crearIcono(rep.tipo, badge),
            title: museo ? museo.titulo : (items.length > 1 ? items.length + " propuestas en este lugar" : rep.titulo),
            riseOnHover: true
        });
        marcador.on("click", function (e) { L.DomEvent.stopPropagation(e); abrirGrupo(items, marcador); });
        marcador.addTo(capaMarcadores);
        estado.grupos.push({ items: items, marcador: marcador });
    });

    document.getElementById("mapaVacio").hidden = lista.length > 0;
    pintarFiltros();
}

function imagenMuseoHtml(m) {
    return m.imagen && m.imagen !== SIN_IMAGEN
        ? `<img class="mc-museo__img" src="${escaparHtml(m.imagen)}" alt="${escaparHtml(m.titulo)}">`
        : `<div class="mc-museo__img mc-museo__img--vacia"><i class="fa-solid fa-landmark"></i></div>`;
}

function filaActividad(p) {
    const t = TIPOS[p.tipo];
    return `
    <a class="mc-act tipo-${p.tipo}" href="${t.url(p.id)}">
        <span class="mc-act__icono"><i class="fa-solid ${t.icono}"></i></span>
        <span class="mc-act__info">
            <strong>${escaparHtml(p.titulo)}</strong>
            <small>${t.nombre}${p.virtual ? " · Virtual" : ""}${p.fecha ? " · " + escaparHtml(textoFecha(p)) : ""}</small>
            ${textoCupos(p)}
        </span>
        <i class="fa-solid fa-chevron-right"></i>
    </a>`;
}

function tarjetaMuseoHtml(m) {
    const actividades = actividadesDelMuseo(m.id);
    return `
    <article class="mc-museo tipo-museo">
        <div class="mc-museo__media">
            ${imagenMuseoHtml(m)}
            <span class="mc-badge mc-badge--sobre"><i class="fa-solid fa-landmark"></i> Museo${m.subtitulo ? " · " + escaparHtml(m.subtitulo) : ""}</span>
        </div>
        <div class="mc-item__cuerpo">
            <h3>${escaparHtml(m.titulo)}</h3>
            <p><i class="fa-solid fa-location-dot"></i> ${escaparHtml(m.lugar || "")}</p>
            ${m.horario ? `<p><i class="fa-regular fa-clock"></i> ${escaparHtml(m.horario)}</p>` : ""}
            ${m.descripcion ? `<p class="mc-museo__desc">${escaparHtml(m.descripcion)}</p>` : ""}
            <a class="insc-btn insc-btn--primario" href="${TIPOS.museo.url(m.id)}">Ver detalle del museo <i class="fa-solid fa-arrow-right"></i></a>
        </div>
        <section class="mc-actividades">
            <h4>Actividades en este museo <span>${actividades.length}</span></h4>
            ${actividades.length
                ? actividades.map(filaActividad).join("")
                : '<p class="mc-act__vacio">Por ahora no hay actividades programadas en este museo.</p>'}
        </section>
    </article>`;
}

function marcarSeleccion(marcador) {
    document.querySelectorAll(".nc-pin--sel").forEach(function (el) { el.classList.remove("nc-pin--sel"); });
    const el = marcador && marcador.getElement();
    if (el) el.querySelector(".nc-pin").classList.add("nc-pin--sel");
}

function abrirGrupo(items, marcador) {
    estado.abierto = marcador;
    marcarSeleccion(marcador);

    const museo = items.find(function (i) { return i.tipo === "museo"; });
    const cuerpo = museo
        ? tarjetaMuseoHtml(museo)
        : (items.length > 1 ? `<p class="mc-grupo"><strong>${items.length} propuestas</strong> en este lugar</p>` : "") +
          items.map(itemHtml).join("");

    tarjeta.innerHTML = `
        <button type="button" class="mc-cerrar" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
        ${cuerpo}`;
    tarjeta.hidden = false;
    tarjeta.scrollTop = 0;
    tarjeta.querySelector(".mc-cerrar").addEventListener("click", cerrarTarjeta);

    mapa.panTo(marcador.getLatLng(), { animate: true, duration: 0.5 });
}

function cerrarTarjeta() {
    tarjeta.hidden = true;
    estado.abierto = null;
    marcarSeleccion(null);
}

/* ---------- Filtros ---------- */
function pintarFiltros() {
    const cont = document.getElementById("mapaFiltros");
    cont.innerHTML = Object.keys(TIPOS).map(function (tipo) {
        const total = estado.puntos.filter(function (p) {
            return p.tipo === tipo && (estado.finalizadas || !p.finalizada);
        }).length;
        const activo = estado.tipos.has(tipo);
        return `<button type="button" class="mapa-chip tipo-${tipo}${activo ? " is-on" : ""}" data-tipo="${tipo}" aria-pressed="${activo}">
                    <i class="fa-solid ${TIPOS[tipo].icono}"></i> ${TIPOS[tipo].plural} <span>${total}</span>
                </button>`;
    }).join("");
}

/* ---------- Arranque ---------- */
function abrirDesdeUrl() {
    const foco = new URLSearchParams(window.location.search).get("foco");
    if (!foco) return false;
    const partes = foco.split(":");
    const punto = estado.puntos.find(function (p) { return p.tipo === partes[0] && p.id === partes[1]; });
    if (!punto) return false;

    if (punto.finalizada && !estado.finalizadas) {
        estado.finalizadas = true;
        document.getElementById("optFinalizadas").checked = true;
        pintarMarcadores();
    }
    const g = estado.grupos.find(function (x) { return x.items.indexOf(punto) !== -1; });
    if (!g) return false;
    mapa.setView([punto.lat, punto.lng], 17);
    abrirGrupo(g.items, g.marcador);
    return true;
}

document.addEventListener("DOMContentLoaded", async function () {
    crearMapa();

    try {
        estado.puntos = await pedirApi("/mapa");
    } catch (e) {
        mostrarErrorServidor(document.getElementById("mapaCultural"));
        return;
    }

    pintarMarcadores();

    if (!abrirDesdeUrl()) {
        const coords = visibles().map(function (p) { return [p.lat, p.lng]; });
        if (coords.length) mapa.fitBounds(coords, { padding: [70, 70], maxZoom: 16 });
    }

    document.getElementById("mapaFiltros").addEventListener("click", function (e) {
        const chip = e.target.closest("[data-tipo]");
        if (!chip) return;
        const tipo = chip.dataset.tipo;
        if (estado.tipos.has(tipo)) estado.tipos.delete(tipo); else estado.tipos.add(tipo);
        pintarMarcadores();
    });

    document.getElementById("optFinalizadas").addEventListener("change", function (e) {
        estado.finalizadas = e.target.checked;
        pintarMarcadores();
    });

    document.getElementById("optCalles").addEventListener("change", function (e) {
        if (e.target.checked) capaNombres.addTo(mapa); else mapa.removeLayer(capaNombres);
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") cerrarTarjeta();
    });
});