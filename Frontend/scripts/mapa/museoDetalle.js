// Ficha completa de un museo: datos, mapa, cómo llegar, actividades y otros museos.
(function () {
    const SIN_IMAGEN = "IMAGEN_MUSEO";
    const cont = document.getElementById("museoDetalle");

    const ACTIVIDADES = {
        charla:    { nombre: "Charla",    icono: "fa-microphone-lines", url: (id) => "charla-detalle.html?idCharla=" + encodeURIComponent(id) },
        taller:    { nombre: "Taller",    icono: "fa-palette",          url: (id) => "taller-detalle.html?idTaller=" + encodeURIComponent(id) },
        recorrido: { nombre: "Recorrido", icono: "fa-person-walking",   url: (id) => "recorrido-detalle.html?idRecorrido=" + encodeURIComponent(id) }
    };

    const tieneImagen = (m) => !!m.imagen && m.imagen !== SIN_IMAGEN;

    function partesFecha(f) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f || "");
        return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
    }

    function textoFecha(a) {
        const d = partesFecha(a.fecha);
        if (!d) return t("md.fechaConfirmar");
        return d.toLocaleDateString(t("fecha.locale"), { weekday: "short", day: "numeric", month: "long" }) + (a.hora ? " · " + a.hora : "");
    }

    function textoCupos(a) {
        if (a.finalizada) return '<span class="mc-cupos mc-cupos--fin">' + t("cupo.fin") + '</span>';
        if (a.cupos === 0) return '<span class="mc-cupos mc-cupos--agotado">' + t("cupo.agotado") + '</span>';
        if (typeof a.cupos === "number") return `<span class="mc-cupos">${a.cupos === 1 ? t("cupo.uno", { n: a.cupos }) : t("det.cupos", { n: a.cupos })}</span>`;
        return "";
    }

    function porFecha(a, b) {
        return (a.fecha || "9999").localeCompare(b.fecha || "9999") || (a.hora || "").localeCompare(b.hora || "");
    }

    function avisar(texto) {
        let el = document.getElementById("mdAviso");
        if (!el) {
            el = document.createElement("div");
            el.id = "mdAviso";
            el.className = "cuenta-aviso";
            el.setAttribute("role", "status");
            document.body.appendChild(el);
        }
        el.textContent = texto;
        el.classList.add("cuenta-aviso--visible");
        clearTimeout(avisar.temporizador);
        avisar.temporizador = setTimeout(function () { el.classList.remove("cuenta-aviso--visible"); }, 2500);
    }

    // ── Piezas de la página ─────────────────────────────────
    function htmlActividad(a) {
        const tp = ACTIVIDADES[a.tipo];
        return `
        <a class="md-act tipo-${a.tipo}${a.finalizada ? " md-act--fin" : ""}" href="${tp.url(a.id)}">
            <span class="md-act__icono"><i class="fa-solid ${tp.icono}" aria-hidden="true"></i></span>
            <span class="md-act__info">
                <small>${t("tipo." + a.tipo)}${a.virtual ? " · " + t("dato.Virtual") : ""}</small>
                <strong>${escaparHtml(a.titulo)}</strong>
                <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escaparHtml(textoFecha(a))}</span>
            </span>
            ${textoCupos(a)}
            <i class="fa-solid fa-chevron-right md-act__flecha" aria-hidden="true"></i>
        </a>`;
    }

    function htmlActividades(proximas, pasadas) {
        let html = `<section class="md-bloque" aria-labelledby="mdActTitulo">
            <h2 id="mdActTitulo"><i class="fa-regular fa-calendar-check" aria-hidden="true"></i> ${t("md.actTitulo")}</h2>`;
        if (proximas.length) {
            html += `<div class="md-acts">${proximas.map(htmlActividad).join("")}</div>`;
        } else {
            html += `<p class="md-vacio">${t("md.sinActs")}</p>`;
        }
        if (pasadas.length) {
            html += `<details class="md-pasadas"><summary>${t("md.finalizadas", { n: pasadas.length })}</summary>
                <div class="md-acts">${pasadas.map(htmlActividad).join("")}</div></details>`;
        }
        return html + "</section>";
    }

    function htmlOtros(otros) {
        if (!otros.length) return "";
        const tarjetas = otros.map(function (o) {
            const media = tieneImagen(o)
                ? `<img src="${escaparHtml(o.imagen)}" alt="" loading="lazy">`
                : `<span class="md-otro__ico"><i class="fa-solid fa-landmark" aria-hidden="true"></i></span>`;
            return `<a class="md-otro" href="museo-detalle.html?idMuseo=${encodeURIComponent(o.id)}">
                <div class="md-otro__media">${media}</div>
                <div class="md-otro__texto"><small>${escaparHtml(o.tipo)}</small><strong>${escaparHtml(o.nombre)}</strong></div>
            </a>`;
        }).join("");
        return `<section class="md-bloque" aria-labelledby="mdOtrosTitulo">
            <div class="md-bloque__cab"><h2 id="mdOtrosTitulo"><i class="fa-solid fa-landmark" aria-hidden="true"></i> ${t("md.otros")}</h2>
            <a href="museos.html">${t("md.verTodos")}</a></div>
            <div class="md-otros">${tarjetas}</div></section>`;
    }

    function htmlMuseo(m, proximas, pasadas, otros) {
        const cuantas = proximas.length;
        const destino = encodeURIComponent(m.lat + "," + m.lng);
        const hero = tieneImagen(m)
            ? `<img class="md-hero__img" src="${escaparHtml(m.imagen)}" alt="${escaparHtml(t("md.fachada", { nombre: m.nombre }))}">`
            : `<div class="md-hero__img md-hero__img--vacia"><i class="fa-solid fa-landmark" aria-hidden="true"></i></div>`;

        return `
        <nav class="md-migas" aria-label="${t("md.ubicacionAria")}">
            <a href="index.html">${t("nav.inicio")}</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
            <a href="museos.html">${t("nav.museos")}</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
            <span aria-current="page">${escaparHtml(m.nombre)}</span>
        </nav>

        <article class="md-hero tipo-museo">
            ${hero}
            <div class="md-hero__cuerpo">
                <span class="mc-badge"><i class="fa-solid fa-landmark" aria-hidden="true"></i> ${t("tipo.museo")} · ${escaparHtml(m.tipo)}</span>
                <h1>${escaparHtml(m.nombre)}</h1>
                <ul class="md-datos-rapidos">
                    ${m.direccion ? `<li><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escaparHtml(m.direccion)}</li>` : ""}
                    ${m.horario ? `<li><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escaparHtml(m.horario)}</li>` : ""}
                    <li><i class="fa-regular fa-calendar-check" aria-hidden="true"></i> ${cuantas ? t(cuantas === 1 ? "md.proxUna" : "md.proxVarias", { n: cuantas }) : t("md.sinProx")}</li>
                </ul>
                <div class="md-acciones">
                    <a class="insc-btn insc-btn--primario" href="https://www.google.com/maps/dir/?api=1&destination=${destino}" target="_blank" rel="noopener"><i class="fa-solid fa-route" aria-hidden="true"></i> ${t("md.comoLlegar")}</a>
                    <a class="insc-btn" href="mapa.html?foco=museo:${encodeURIComponent(m.id)}"><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i> ${t("md.verMapa")}</a>
                    <button type="button" class="insc-btn" id="mdCompartir"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i> ${t("md.compartir")}</button>
                </div>
            </div>
        </article>

        <div class="md-columnas">
            <div class="md-col-principal">
                <section class="md-bloque" aria-labelledby="mdSobreTitulo">
                    <h2 id="mdSobreTitulo"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> ${t("md.sobre")}</h2>
                    <p class="md-texto">${escaparHtml(m.descripcionCorta)}</p>
                </section>
                ${htmlActividades(proximas, pasadas)}
            </div>

            <aside class="md-col-lateral" aria-label="${t("md.info")}">
                <section class="md-bloque md-bloque--mapa">
                    <div id="museoMini" class="museo-det__mapa md-mapa" role="img" aria-label="${escaparHtml(t("md.mapaAria", { nombre: m.nombre }))}"></div>
                    <dl class="md-info">
                        <div><dt><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${t("md.direccion")}</dt><dd>${escaparHtml(m.direccion || t("md.dirDefault"))}</dd></div>
                        <div><dt><i class="fa-regular fa-clock" aria-hidden="true"></i> ${t("md.horario")}</dt><dd>${escaparHtml(m.horario || t("md.horarioDefault"))}</dd></div>
                        <div><dt><i class="fa-solid fa-tag" aria-hidden="true"></i> ${t("md.tipo")}</dt><dd>${escaparHtml(m.tipo)}</dd></div>
                    </dl>
                    <a class="nc-btn nc-btn--outline md-btn-bloque" href="https://www.google.com/maps/dir/?api=1&destination=${destino}" target="_blank" rel="noopener"><i class="fa-solid fa-route" aria-hidden="true"></i> ${t("md.indicaciones")}</a>
                </section>
            </aside>
        </div>

        ${htmlOtros(otros)}

        <p class="md-volver"><a class="insc-btn" href="museos.html"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> ${t("md.volver")}</a></p>`;
    }

    // El mapa es un extra: si falla (por ejemplo, Leaflet bloqueado), el resto de la página sigue.
    function dibujarMapa(m) {
        const el = document.getElementById("museoMini");
        try {
            const mini = L.map(el, { center: [m.lat, m.lng], zoom: 17, scrollWheelZoom: false });
            capaBase().addTo(mini);
            capaCalles().addTo(mini);
            L.marker([m.lat, m.lng], {
                keyboard: false,
                icon: L.divIcon({
                    className: "nc-pin-wrap",
                    html: '<div class="nc-pin tipo-museo"><i class="fa-solid fa-landmark"></i></div>',
                    iconSize: [36, 44], iconAnchor: [18, 44]
                })
            }).addTo(mini);
        } catch (e) {
            console.error("No se pudo dibujar el mapa:", e);
            el.outerHTML = '<p class="md-vacio">' + t("md.mapaFalla") + '</p>';
        }
    }

    function activarCompartir(m) {
        const b = document.getElementById("mdCompartir");
        if (!b) return;
        b.addEventListener("click", async function () {
            const datos = { title: m.nombre, text: m.nombre + " · Nodo Cultural", url: location.href };
            try {
                if (navigator.share) { await navigator.share(datos); return; }
                await navigator.clipboard.writeText(location.href);
                avisar(t("md.copiado"));
            } catch (e) {
                if (e && e.name === "AbortError") return; // el usuario cerró el menú de compartir
                avisar(t("md.noCopio"));
            }
        });
    }

    async function renderizarMuseo() {
        const id = gestorMuseos.obtenerIdDesdeUrl();
        const m = id ? await gestorMuseos.obtenerMuseoPorId(id) : null;

        if (!m) {
            document.title = t("md.noEncTitulo");
            cont.innerHTML = `<div class="insc-vacio"><i class="fa-solid fa-landmark" aria-hidden="true"></i>
                <h2>${t("md.noEncH")}</h2>
                <p>${t("md.noEncP")}</p>
                <a class="insc-btn insc-btn--primario" href="museos.html">${t("md.verTodosMuseos")}</a></div>`;
            return;
        }

        document.title = "Nodo Cultural - " + m.nombre;

        // Actividades y otros museos son complementos: si fallan, se muestra igual la ficha.
        const [puntos, museos] = await Promise.all([
            pedirApi("/mapa").catch(function () { return []; }),
            gestorMuseos.obtenerMuseos().catch(function () { return []; })
        ]);

        const delMuseo = puntos.filter(function (p) { return p.tipo !== "museo" && p.museoId === m.id; });
        const proximas = delMuseo.filter(function (a) { return !a.finalizada; }).sort(porFecha);
        const pasadas = delMuseo.filter(function (a) { return a.finalizada; }).sort(porFecha).reverse();
        const otros = museos.filter(function (o) { return o.id !== m.id; }).slice(0, 3);

        cont.innerHTML = htmlMuseo(m, proximas, pasadas, otros);
        dibujarMapa(m);
        activarCompartir(m);
    }

    function iniciarMuseo() {
        renderizarMuseo().catch(function () {
            mostrarErrorServidor(cont);
        });
    }

    document.addEventListener("DOMContentLoaded", iniciarMuseo);
    document.addEventListener("idiomacambiado", iniciarMuseo);
})();
