// Buscador: busca mientras se escribe (sin Enter), con filtros por tipo, categoría y estado.
const BUS_TIPOS = {
    museo:     { plural: "Museos",     nombre: "Museo",     icono: "fa-landmark",         url: (r) => "museo-detalle.html?idMuseo=" + encodeURIComponent(r.id) },
    charla:    { plural: "Charlas",    nombre: "Charla",    icono: "fa-microphone-lines", url: (r) => "charla-detalle.html?idCharla=" + encodeURIComponent(r.id) },
    taller:    { plural: "Talleres",   nombre: "Taller",    icono: "fa-palette",          url: (r) => "taller-detalle.html?idTaller=" + encodeURIComponent(r.id) },
    recorrido: { plural: "Recorridos", nombre: "Recorrido", icono: "fa-person-walking",   url: (r) => "recorrido-detalle.html?idRecorrido=" + encodeURIComponent(r.id) },
    recurso:   { plural: "Recursos",   nombre: "Recurso",   icono: "fa-file-pdf",         url: (r) => r.archivo || "recursos.html" },
};

const busInput = document.getElementById("busInput");
const busLimpiar = document.getElementById("busLimpiar");
const busChips = document.getElementById("busChips");
const busCategoria = document.getElementById("busCategoria");
const busOcultar = document.getElementById("busOcultar");
const busEstado = document.getElementById("busEstado");
const busResultados = document.getElementById("busResultados");

const busFiltro = { q: "", tipo: "", categoria: "", ocultar: false };
let busConteos = {};
let busSecuencia = 0;
let busTemporizador = null;

// ── Utilidades ──────────────────────────────────────────────
function busNormalizar(t) {
    return String(t == null ? "" : t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Resalta las palabras buscadas ignorando tildes y mayúsculas, y escapa el HTML.
function busResaltar(texto, tokens) {
    texto = String(texto == null ? "" : texto);
    if (!tokens.length) return escaparHtml(texto);

    let norm = "";
    const mapa = []; // posición en el texto normalizado → posición en el original
    for (let i = 0; i < texto.length; i++) {
        const pieza = busNormalizar(texto[i]);
        for (let k = 0; k < pieza.length; k++) { norm += pieza[k]; mapa.push(i); }
    }

    const rangos = [];
    for (const t of tokens) {
        let desde = 0, pos;
        while (t && (pos = norm.indexOf(t, desde)) !== -1) {
            rangos.push([mapa[pos], mapa[pos + t.length - 1] + 1]);
            desde = pos + t.length;
        }
    }
    if (!rangos.length) return escaparHtml(texto);

    rangos.sort((a, b) => a[0] - b[0]);
    const unidos = [rangos[0].slice()];
    for (const r of rangos.slice(1)) {
        const ult = unidos[unidos.length - 1];
        if (r[0] <= ult[1]) ult[1] = Math.max(ult[1], r[1]); else unidos.push(r.slice());
    }

    let html = "", cursor = 0;
    for (const [a, b] of unidos) {
        html += escaparHtml(texto.slice(cursor, a)) + "<mark>" + escaparHtml(texto.slice(a, b)) + "</mark>";
        cursor = b;
    }
    return html + escaparHtml(texto.slice(cursor));
}

function busFecha(f) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f || "");
    return m ? m[3] + "/" + m[2] + "/" + m[1] : "";
}

function busRecortar(t, max) {
    t = String(t || "");
    return t.length > max ? t.slice(0, max).trim() + "…" : t;
}

// Solo se aceptan rutas locales o https para imagen y enlaces (evita javascript: y similares).
function busUrlSegura(u) {
    u = String(u || "");
    return /^(https:\/\/[^\s"'<>]+|[\w\-./?=&%]+)$/.test(u) && !u.startsWith("//") ? u : "";
}

// ── Pantalla ────────────────────────────────────────────────
function busPintarChips() {
    const total = Object.values(busConteos).reduce((a, b) => a + b, 0);
    let html = chip("", t("bus.todo"), "fa-border-all", total);
    for (const [clave, tp] of Object.entries(BUS_TIPOS)) html += chip(clave, t("tipo." + clave + ".p"), tp.icono, busConteos[clave] || 0);
    busChips.innerHTML = html;

    function chip(clave, texto, icono, n) {
        const activo = busFiltro.tipo === clave;
        const cls = clave ? " tipo-" + clave : "";
        return `<button type="button" class="mapa-chip${cls}${activo ? " is-on" : ""}" data-tipo="${clave}" aria-pressed="${activo}">
            <i class="fa-solid ${icono}" aria-hidden="true"></i> ${texto} <span>${n}</span></button>`;
    }
}

function busPintarCategorias(categorias) {
    const puedeFiltrar = !!busFiltro.tipo && categorias.length > 0;
    busCategoria.disabled = !puedeFiltrar;
    busCategoria.title = busFiltro.tipo ? "" : t("bus.elegiTipo");
    let html = '<option value="">' + t("bus.todasCat") + '</option>';
    for (const c of categorias) {
        const sel = busNormalizar(c.valor) === busNormalizar(busFiltro.categoria) ? " selected" : "";
        html += `<option value="${escaparHtml(c.valor)}"${sel}>${escaparHtml(c.valor)} (${c.cantidad})</option>`;
    }
    busCategoria.innerHTML = html;
    if (busFiltro.categoria && !busCategoria.value) busFiltro.categoria = ""; // la categoría ya no existe
}

function busTarjeta(r, tokens) {
    const tp = BUS_TIPOS[r.tipo];
    const img = busUrlSegura(r.imagen);
    const media = img
        ? `<img src="${escaparHtml(img)}" alt="" loading="lazy">`
        : `<span class="bus-card__ico"><i class="fa-solid ${tp.icono}" aria-hidden="true"></i></span>`;
    const meta = [];
    if (r.fecha) meta.push(`<li><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escaparHtml(busFecha(r.fecha))}${r.hora ? " · " + escaparHtml(r.hora) : ""}</li>`);
    if (r.lugar) meta.push(`<li><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${busResaltar(busRecortar(r.lugar, 60), tokens)}</li>`);
    const href = busUrlSegura(tp.url(r)) || "#";
    const extra = r.tipo === "recurso" ? ' target="_blank" rel="noopener"' : "";

    return `<a class="bus-card tipo-${r.tipo}${r.finalizada ? " bus-card--fin" : ""}" href="${escaparHtml(href)}"${extra}>
        <div class="bus-card__media">${media}</div>
        <div class="bus-card__cuerpo">
            <div class="bus-card__etiquetas">
                <span class="mc-badge"><i class="fa-solid ${tp.icono}" aria-hidden="true"></i> ${t("tipo." + r.tipo)}</span>
                ${r.categoria ? `<span class="bus-card__cat">${busResaltar(r.categoria, tokens)}</span>` : ""}
                ${r.finalizada ? '<span class="mc-cupos mc-cupos--fin">' + t("cupo.fin") + '</span>' : ""}
            </div>
            <h3>${busResaltar(r.titulo, tokens)}</h3>
            <p>${busResaltar(busRecortar(r.descripcion, 150), tokens)}</p>
            ${meta.length ? `<ul class="bus-card__meta">${meta.join("")}</ul>` : ""}
        </div>
    </a>`;
}

function busPintar(datos) {
    const tokens = busNormalizar(busFiltro.q).split(/\s+/).filter(Boolean);
    busConteos = datos.conteos;
    busPintarChips();
    busPintarCategorias(datos.categorias);

    if (!datos.total) {
        busEstado.textContent = "";
        busResultados.innerHTML = `<div class="insc-vacio"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <h2>${t("bus.sinResH")}</h2>
            <p>${busFiltro.q ? t("bus.sinResP1") : t("bus.sinResP2")}</p></div>`;
        busEstado.textContent = t("bus.sinRes");
        return;
    }
    const mostrados = datos.resultados.length;
    busEstado.textContent = (busFiltro.q
        ? t(datos.total === 1 ? "bus.resQ1" : "bus.resQn", { n: datos.total, q: busFiltro.q })
        : t(datos.total === 1 ? "bus.elem1" : "bus.elemN", { n: datos.total }))
        + (mostrados < datos.total ? t("bus.mostrando", { n: mostrados }) : "");
    busResultados.innerHTML = datos.resultados.map((r) => busTarjeta(r, tokens)).join("");
}

// ── Búsqueda ────────────────────────────────────────────────
async function busBuscar() {
    const mia = ++busSecuencia; // si el usuario sigue escribiendo, se descarta la respuesta vieja
    const p = new URLSearchParams();
    if (busFiltro.q) p.set("q", busFiltro.q);
    if (busFiltro.tipo) p.set("tipo", busFiltro.tipo);
    if (busFiltro.categoria) p.set("categoria", busFiltro.categoria);
    if (busFiltro.ocultar) p.set("ocultarFinalizadas", "1");

    busResultados.setAttribute("aria-busy", "true");
    try {
        const datos = await pedirApi("/buscar" + (p.toString() ? "?" + p : ""));
        if (mia !== busSecuencia) return;
        busPintar(datos);
        busActualizarUrl();
    } catch (error) {
        if (mia !== busSecuencia) return;
        busEstado.textContent = "";
        busResultados.innerHTML = `<div class="insc-vacio"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
            <h2>${t("bus.noPudo")}</h2><p>${escaparHtml(error.message)}</p></div>`;
    } finally {
        if (mia === busSecuencia) busResultados.removeAttribute("aria-busy");
    }
}

function busProgramar() {
    busEstado.textContent = t("bus.buscando");
    clearTimeout(busTemporizador);
    busTemporizador = setTimeout(busBuscar, 250); // espera a que el usuario haga una pausa
}

// Guarda la búsqueda en la dirección para poder compartirla o volver con "atrás".
function busActualizarUrl() {
    const p = new URLSearchParams();
    if (busFiltro.q) p.set("q", busFiltro.q);
    if (busFiltro.tipo) p.set("tipo", busFiltro.tipo);
    if (busFiltro.categoria) p.set("categoria", busFiltro.categoria);
    if (busFiltro.ocultar) p.set("ocultar", "1");
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
}

// ── Eventos ─────────────────────────────────────────────────
busInput.addEventListener("input", function () {
    busFiltro.q = busInput.value.replace(/\s+/g, " ").trimStart();
    busLimpiar.hidden = !busInput.value;
    busProgramar();
});

document.getElementById("busForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Enter busca de inmediato, pero no es necesario
    clearTimeout(busTemporizador);
    busBuscar();
});

busLimpiar.addEventListener("click", function () {
    busInput.value = "";
    busFiltro.q = "";
    busLimpiar.hidden = true;
    busInput.focus();
    clearTimeout(busTemporizador);
    busBuscar();
});

busChips.addEventListener("click", function (e) {
    const b = e.target.closest("[data-tipo]");
    if (!b) return;
    busFiltro.tipo = b.dataset.tipo;
    busFiltro.categoria = ""; // las categorías dependen del tipo
    busBuscar();
});

busCategoria.addEventListener("change", function () {
    busFiltro.categoria = busCategoria.value;
    busBuscar();
});

busOcultar.addEventListener("change", function () {
    busFiltro.ocultar = busOcultar.checked;
    busBuscar();
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.activeElement === busInput && busInput.value) busLimpiar.click();
    if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault();
        busInput.focus();
    }
});

// Estado inicial desde la dirección (?q=...&tipo=...)
(function () {
    const p = new URLSearchParams(location.search);
    busFiltro.q = (p.get("q") || "").slice(0, 80);
    busFiltro.tipo = BUS_TIPOS[p.get("tipo")] ? p.get("tipo") : "";
    busFiltro.categoria = (p.get("categoria") || "").slice(0, 60);
    busFiltro.ocultar = p.get("ocultar") === "1";
    busInput.value = busFiltro.q;
    busLimpiar.hidden = !busInput.value;
    busOcultar.checked = busFiltro.ocultar;
    busPintarChips();
    busBuscar();
})();

// Al cambiar de idioma se repite la búsqueda para redibujar los resultados
document.addEventListener("idiomacambiado", function () {
    busBuscar();
});
