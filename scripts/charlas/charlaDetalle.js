let contenedor = document.getElementById("detalleContenido");

function renderizarCharla() {

    let id = gestorCharlas.obtenerIdDesdeUrl();

    if (!id) {
        contenedor.innerHTML = '<p class="admin-vacio">No se encontró la charla.</p>';
        return;
    }

    const charlas = gestorCharlas.obtenerCharlas();

    if (charlas.length === 0) {
        contenedor.innerHTML = '<p class="admin-vacio">Todavía no hay charlas cargadas.</p>';
        return;
    }

    let html = "";

    for (let i = 0; i < charlas.length; i++) {

        let charla = charlas[i];

        if (charla.id == id) {

            html += `
            <div class="charla-detalle">

            <div class="charla-detalle__media">
                <img src="${charla.imagen}" alt="${charla.titulo}">
                <span class="charla-detalle__tag">${charla.tipo}</span>
            </div>

            <div class="charla-detalle__body">

                <h1>${charla.titulo}</h1>
                <p class="charla-detalle__desc">${charla.descripcionCompleta}</p>

                <dl class="charla-detalle__datos">
                <div>
                    <dt><i class="fa-regular fa-calendar"></i> Fecha</dt>
                    <dd>${charla.fecha}</dd>
                </div>
                <div>
                    <dt><i class="fa-regular fa-clock"></i> Hora</dt>
                    <dd>${charla.hora}</dd>
                </div>
                <div>
                    <dt><i class="fa-solid fa-location-dot"></i> Lugar</dt>
                    <dd>${charla.lugar}</dd>
                </div>
                <div>
                    <dt><i class="fa-solid fa-user"></i> Expositor</dt>
                    <dd>${charla.expositor}</dd>
                </div>
                </dl>

                <div class="charla-detalle__footer">
                <span class="charla-detalle__cupos">
                    <i class="fa-solid fa-users"></i> ${charla.cupos} cupos disponibles
                </span>
                <a href="contacto.html?idCharla=${charla.id}" class="nc-btn">
                    Inscribirme
                </a>
                </div>

            </div>

            </div>
            `;
        }
    }

    contenedor.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderizarCharla);
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