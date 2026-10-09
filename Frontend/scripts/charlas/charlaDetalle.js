let contenedor = document.getElementById("detalleContenido");

async function renderizarCharla() {

    let id = gestorCharlas.obtenerIdDesdeUrl();

    if (!id) {
        contenedor.innerHTML = '<p class="admin-vacio">No se encontró la charla.</p>';
        return;
    }

    const charla = await gestorCharlas.obtenerCharlaPorId(id);

    if (!charla) {
        contenedor.innerHTML = '<p class="admin-vacio">No se encontró la charla.</p>';
        return;
    }

    let html = `

        <div class="charla-detalle">

            <div class="charla-detalle__media">
                <img src="${charla.imagen}" alt="${charla.titulo}">
                <span class="charla-detalle__tag">${charla.tipo}</span>
            </div>

            <div class="charla-detalle__body">

                <h1>${charla.titulo}</h1>

                <p class="charla-detalle__desc">
                    ${charla.descripcionCompleta}
                </p>

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
                        <i class="fa-solid fa-users"></i>
                        ${charla.cupos} cupos disponibles
                    </span>

                    <button type="button" id="btnMostrarForm" class="nc-btn">
                        Inscribirme
                    </button>

                </div>

                <div>

                    <section class="admin-panel">

                        <form id="formConfirmacion" class="form-contacto" style="display: none;">

                            <h3>Confirmá tu asistencia</h3>

                            <div class="auth-campo">
                                <label for="nombre">Nombre y apellido</label>
                                <input type="text" id="nombre" required placeholder="Tu nombre completo">
                            </div>

                            <div class="auth-campo">
                                <label for="email">Email</label>
                                <input type="email" id="email" required placeholder="tuemail@ejemplo.com">
                            </div>

                            <div class="auth-campo">
                                <label for="telefono">Teléfono</label>
                                <input type="tel" id="telefono" required placeholder="09X XXX XXX">
                            </div>

                            <button type="submit" class="nc-btn nc-btn--pill">
                                <i class="fa-solid fa-paper-plane"></i>
                                Enviar confirmación
                            </button>

                        </form>

                    </section>

                </div>

            </div>

        </div>
    `;

    contenedor.innerHTML = html;

    let btnMostrar = document.getElementById("btnMostrarForm");
    let mensajeLogin = document.getElementById("mensajeLogin");

    if (btnMostrar) {

        btnMostrar.addEventListener("click", function () {

            let sesionActiva = validarSesion();

            if (!sesionActiva) {
                let modal = new bootstrap.Modal(mensajeLogin);
                modal.show();
                return;
            }

            document.getElementById("formConfirmacion").style.display = "flex";
            btnMostrar.style.display = "none";
        });
    }

    enlazarInscripcion("charla", charla.id);
}

document.addEventListener("DOMContentLoaded", function () {
  renderizarCharla().catch(function () {
    mostrarErrorServidor(contenedor);
  });
});