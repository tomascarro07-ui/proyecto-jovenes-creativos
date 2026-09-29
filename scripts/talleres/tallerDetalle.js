let contenedor = document.getElementById("detalleContenido");

function renderizarTaller() {

    let id = gestorTalleres.obtenerIdDesdeUrl();

    if (!id) {
        contenedor.innerHTML = '<p class="admin-vacio">No se encontró la charla.</p>';
        return;
    }

    const talleres = gestorTalleres.obtenerTalleres();

    if (talleres.length === 0) {
        contenedor.innerHTML = '<p class="admin-vacio">Todavía no hay talleres cargados.</p>';
        return;
    }

    let html = "";

    for (let i = 0; i < talleres.length; i++) {

        let taller = talleres[i];

        if (taller.id == id) {

            html += `
            <div class="charla-detalle">

                <div class="charla-detalle__media">
                    <img src="${taller.imagen}" alt="${taller.titulo}">
                    <span class="charla-detalle__tag">${taller.modalidad}</span>
                </div>

                <div class="charla-detalle__body">

                    <h1>${taller.titulo}</h1>
                    <p class="charla-detalle__desc">${taller.descripcionCorta}</p>

                    <dl class="charla-detalle__datos">
                    <div>
                        <dt><i class="fa-solid fa-layer-group"></i> Nivel</dt>
                        <dd>${taller.nivel}</dd>
                    </div>
                    <div>
                        <dt><i class="fa-solid fa-laptop"></i> Modalidad</dt>
                        <dd>${taller.modalidad}</dd>
                    </div>
                    <div>
                        <dt><i class="fa-regular fa-calendar"></i> Clases</dt>
                        <dd>${taller.cantClases}</dd>
                    </div>
                    </dl>

                    <div class="charla-detalle__footer">
                    <span class="charla-detalle__cupos">
                        <i class="fa-solid fa-users"></i> ${taller.cupos} cupos disponibles
                    </span>
                    <button type="button" id="btnMostrarForm" class="nc-btn">
                        Inscribirme
                    </button>
                </div>
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

                        <div class="auth-campo">
                            <label for="cantidadPersonas">Cantidad de personas</label>
                            <input type="number" id="cantidadPersonas" required min="1" max="${taller.cupos}" value="1">
                        </div>

                        <button type="submit" class="nc-btn nc-btn--pill">
                            <i class="fa-solid fa-paper-plane"></i> Enviar confirmación
                        </button>

                    </form>

                </section>
            </div>

            </div>

            </div>
            `;
        }
    }

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

            document.getElementById('formConfirmacion').style.display = 'flex';
            btnMostrar.style.display = 'none';
        });
    }
}



document.addEventListener('DOMContentLoaded', renderizarTaller);

