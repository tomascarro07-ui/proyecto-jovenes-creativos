async function renderizarMuseo() {
    const cont = document.getElementById("museoDetalle");
    const id = gestorMuseos.obtenerIdDesdeUrl();
    const m = id ? await gestorMuseos.obtenerMuseoPorId(id) : null;

    if (!m) {
        cont.innerHTML = '<p class="museo-det__vacio">No encontramos este museo.</p>';
        return;
    }

    document.title = "Nodo Cultural - " + m.nombre;

    cont.innerHTML = `
    <article class="museo-det__card">
        ${m.imagen && m.imagen !== "IMAGEN_MUSEO" ? `<img class="museo-det__img" src="${escaparHtml(m.imagen)}" alt="${escaparHtml(m.nombre)}">`
            : `<div class="museo-det__img museo-det__img--vacia"><i class="fa-solid fa-landmark"></i></div>`}
        <div class="museo-det__cuerpo">
            <span class="mc-badge tipo-museo"><i class="fa-solid fa-landmark"></i> Museo · ${escaparHtml(m.tipo)}</span>
            <h1>${escaparHtml(m.nombre)}</h1>
            <p class="museo-det__desc">${escaparHtml(m.descripcionCorta)}</p>
            <ul class="museo-det__datos">
                ${m.direccion ? `<li><i class="fa-solid fa-location-dot"></i> ${escaparHtml(m.direccion)}</li>` : ""}
                ${m.horario ? `<li><i class="fa-regular fa-clock"></i> ${escaparHtml(m.horario)}</li>` : ""}
            </ul>
            <div class="museo-det__acciones">
                <a class="insc-btn insc-btn--primario" href="mapa.html?foco=museo:${m.id}"><i class="fa-solid fa-map-location-dot"></i> Ver en el mapa cultural</a>
                <a class="insc-btn insc-btn--peligro museo-det__volver" href="museos.html"><i class="fa-solid fa-arrow-left"></i> Volver a museos</a>
            </div>
        </div>
    </article>
    <div id="museoMini" class="museo-det__mapa" aria-label="Ubicación de ${escaparHtml(m.nombre)}"></div>`;

    const mini = L.map("museoMini", { center: [m.lat, m.lng], zoom: 17, scrollWheelZoom: false });
    capaBase().addTo(mini);
    capaCalles().addTo(mini);
    L.marker([m.lat, m.lng], {
        icon: L.divIcon({
            className: "nc-pin-wrap",
            html: '<div class="nc-pin tipo-museo"><i class="fa-solid fa-landmark"></i></div>',
            iconSize: [36, 44], iconAnchor: [18, 44]
        })
    }).addTo(mini);
}

document.addEventListener("DOMContentLoaded", function () {
    renderizarMuseo().catch(function () {
        mostrarErrorServidor(document.getElementById("museoDetalle"));
    });
});