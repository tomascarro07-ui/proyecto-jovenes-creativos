// Lista de museos (desde la base de datos) con enlace a la ficha de cada uno.
(function () {
    const cont = document.getElementById("museosFichas");
    if (!cont) return;

    async function cargarMuseos() {
        try {
            const museos = await gestorMuseos.obtenerMuseos();
            if (!museos.length) {
                cont.innerHTML = '<p class="museo-det__vacio">' + t("museos.sin") + '</p>';
                return;
            }
            cont.innerHTML = museos.map(function (m) {
                const media = m.imagen && m.imagen !== "IMAGEN_MUSEO"
                    ? `<img src="${escaparHtml(m.imagen)}" alt="" loading="lazy">`
                    : '<span class="mf-card__ico"><i class="fa-solid fa-landmark" aria-hidden="true"></i></span>';
                return `<a class="mf-card" href="museo-detalle.html?idMuseo=${encodeURIComponent(m.id)}">
                    <div class="mf-card__media">${media}</div>
                    <div class="mf-card__texto">
                        <small>${escaparHtml(m.tipo)}</small>
                        <strong>${escaparHtml(m.nombre)}</strong>
                        ${m.direccion ? `<span><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escaparHtml(m.direccion)}</span>` : ""}
                        ${m.horario ? `<span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escaparHtml(m.horario)}</span>` : ""}
                    </div>
                </a>`;
            }).join("");
        } catch (e) {
            mostrarErrorServidor(cont);
        }
    }

    document.addEventListener("DOMContentLoaded", cargarMuseos);
    document.addEventListener("idiomacambiado", cargarMuseos);
})();
