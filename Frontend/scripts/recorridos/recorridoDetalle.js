let contenedor = document.getElementById("detalleContenido");

function formatearDuracion(recorrido) {

    const horas = Number(recorrido.duracionHoras);
    const minutos = Number(recorrido.duracionMinutos);

    if (!isNaN(horas) && !isNaN(minutos)) {

        if (horas === 0) {
            return `${minutos}min`;
        }

        if (minutos === 0) {
            return `${horas}h`;
        }

        return `${horas}h ${minutos}min`;
    }

    if (recorrido.duracion) {
        return recorrido.duracion;
    }

    return "Duración no disponible";
}


async function renderizarRecorrido() {

    let id = gestorRecorridos.obtenerIdDesdeUrl();

    if (!id) {
        contenedor.innerHTML = '<p class="admin-vacio">No se encontró el recorrido.</p>';
        return;
    }

    const recorrido = await gestorRecorridos.obtenerRecorridoPorId(id);

    if (!recorrido) {
        contenedor.innerHTML = '<p class="admin-vacio">No se encontró el recorrido.</p>';
        return;
    }

    const duracionTexto = formatearDuracion(recorrido);

    let html = `
        <div class="charla-detalle">

            <div class="charla-detalle__media">
                <img src="${recorrido.imagen}" alt="${recorrido.titulo}">
                <span class="charla-detalle__tag">${recorrido.tipo}</span>
            </div>

            <div class="charla-detalle__body">

                <h1>${recorrido.titulo}</h1>

                <p class="charla-detalle__desc">
                    ${recorrido.descripcionCorta}
                </p>

                <dl class="charla-detalle__datos">

                    <div>
                        <dt>
                            <i class="fa-solid fa-location-dot"></i>
                            Punto de salida
                        </dt>

                        <dd>
                            ${recorrido.puntoSalida}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            <i class="fa-regular fa-clock"></i>
                            Duración
                        </dt>

                        <dd>
                            ${duracionTexto}
                        </dd>
                    </div>

                </dl>

                <div class="charla-detalle__footer">

                    <span class="charla-detalle__cupos">
                        <i class="fa-solid fa-users"></i>
                        ${recorrido.cupos} cupos disponibles
                    </span>

                    <button
                        type="button"
                        id="btnMostrarForm"
                        class="nc-btn">
                        Inscribirme
                    </button>

                </div>

            </div>

            <div>

                <section class="admin-panel">

                    <form
                        id="formConfirmacion"
                        class="form-contacto"
                        style="display: none;">

                        <h3>Confirmá tu asistencia</h3>

                        <div class="auth-campo">
                            <label for="nombre">
                                Nombre y apellido
                            </label>

                            <input
                                type="text"
                                id="nombre"
                                required
                                placeholder="Tu nombre completo">
                        </div>

                        <div class="auth-campo">
                            <label for="email">
                                Email
                            </label>

                            <input
                                type="email"
                                id="email"
                                required
                                placeholder="tuemail@ejemplo.com">
                        </div>

                        <div class="auth-campo">
                            <label for="telefono">
                                Teléfono
                            </label>

                            <input
                                type="tel"
                                id="telefono"
                                required
                                placeholder="09X XXX XXX">
                        </div>

                        <div class="auth-campo">
                            <label for="cantidadPersonas">
                                Cantidad de personas
                            </label>

                            <input
                                type="number"
                                id="cantidadPersonas"
                                required
                                min="1"
                                max="${recorrido.cupos}"
                                value="1">
                        </div>

                        <button
                            type="submit"
                            class="nc-btn nc-btn--pill">

                            <i class="fa-solid fa-paper-plane"></i>
                            Enviar confirmación

                        </button>

                    </form>

                </section>

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
    enlazarInscripcion("recorrido", recorrido.id);
}


document.addEventListener("DOMContentLoaded", function () {
  renderizarRecorrido().catch(function () {
    mostrarErrorServidor(contenedor);
  });
});