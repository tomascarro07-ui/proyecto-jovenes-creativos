let contenedor = document.getElementById("detalleContenido");

function renderizarCharla() {

    let id = gestorCharlas.obtenerIdDesdeUrl();

    if (!id) {
        contenedor.innerHTML = '<p class="detalle-error">No se especificó ninguna charla.</p>';
        return;
    }

    const charlas = gestorCharlas.obtenerCharlas();

    if (charlas.length === 0) {
        grid.innerHTML = '<p>Todavía no hay charlas cargadas.</p>';
        return;
    }

    let html = "";

    for (let i = 0; i < charlas.length; i++) {
        const charla = charlas[i];

        html += `
        <article class="curso-mini">
            <div class="curso-mini__media">
                <img src="${charla.imagen} alt="${charla.titulo}"}"></img>
            </div>
            <div class="curso-mini__info">
                <span class="act-tipo">${charla.tipo}</span>
                <h3>${charla.titulo}</h3>
                <p class="curso-desc">${charla.descripcionCorta}</p>
                <p class="curso-mini__meta">
                <span><i class="fa-regular fa-clock"></i>${charla.lugar}</span>
                <span><i class="fa-solid fa-laptop"></i>${charla.tipo}</span>
                </p>
                <a href="contacto.html?idCharla=${charla.id}" class="nc-btn nc-btn--outline nc-btn--mini">Inscribirme</a>
            </div>
            </article>
    `;
    }

    grid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderizarCharlas);

// const CONFIRMACIONES_KEY = 'nodo_cultural_confirmaciones';

//   const id = obtenerIdDesdeUrl();
//   const contenedor = document.getElementById('detalleContenido');

//   

//   const charla = obtenerCharlaPorId(id);

//   if (!charla) {
//     contenedor.innerHTML = '<p class="detalle-error">No se encontró la charla solicitada.</p>';
//     return;
//   }
// // Obtiene el ID desde la URL (?id=1)
// function obtenerIdDesdeUrl() {
//   const params = new URLSearchParams(window.location.search);
//   return params.get('id');
// }

// // Guarda una confirmación de asistencia
// function guardarConfirmacion(confirmacion) {
//   const data = localStorage.getItem(CONFIRMACIONES_KEY);
//   const confirmaciones = data ? JSON.parse(data) : [];
//   confirmaciones.push(confirmacion);
//   localStorage.setItem(CONFIRMACIONES_KEY, JSON.stringify(confirmaciones));
// }

// // Cuenta cuántas confirmaciones tiene una charla
// function contarConfirmaciones(idCharla) {
//   const data = localStorage.getItem(CONFIRMACIONES_KEY);
//   const confirmaciones = data ? JSON.parse(data) : [];
//   return confirmaciones
//     .filter(c => c.idCharla === parseInt(idCharla))
//     .reduce((total, c) => total + c.cantidadPersonas, 0);
// }