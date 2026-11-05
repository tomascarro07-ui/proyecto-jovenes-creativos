let contenedor = document.getElementById("detalleContenido");

async function renderizarTaller() {

    let id = gestorTalleres.obtenerIdDesdeUrl();

    if (!id) {
        contenedor.innerHTML = '<p class="admin-vacio">' + t("det.noTaller") + '</p>';
        return;
    }

    const taller = await gestorTalleres.obtenerTallerPorId(id);

    if (!taller) {
        contenedor.innerHTML = '<p class="admin-vacio">' + t("det.noTaller") + '</p>';
        return;
    }

    let html = `

        <div class="charla-detalle">

            <div class="charla-detalle__media">
                <img src="${taller.imagen}" alt="${taller.titulo}">
                <span class="charla-detalle__tag">${tDato(taller.modalidad)}</span>
            </div>

            <div class="charla-detalle__body">

                <h1>${taller.titulo}</h1>
                <p class="charla-detalle__desc">${taller.descripcionCorta}</p>

                <dl class="charla-detalle__datos">

                    <div>
                        <dt><i class="fa-solid fa-layer-group"></i> ${t("det.nivel")}</dt>
                        <dd>${tDato(taller.nivel)}</dd>
                    </div>

                    <div>
                        <dt><i class="fa-solid fa-laptop"></i> ${t("det.modalidad")}</dt>
                        <dd>${tDato(taller.modalidad)}</dd>
                    </div>

                    <div>
                        <dt><i class="fa-regular fa-calendar"></i> ${t("det.clases")}</dt>
                        <dd>${taller.cantClases}</dd>
                    </div>

                </dl>

                <div class="charla-detalle__footer">
                    <button type="button" id="btnMostrarForm" class="nc-btn">${t("act.inscribirme")}</button>
                </div>

            </div>

            <div>

                <section class="admin-panel">

                    <form id="formConfirmacion" class="form-contacto" style="display: none;">

                        <h3>${t("det.confirmaTitulo")}</h3>

                        <div class="auth-campo">
                            <label for="nombre">${t("det.nombre")}</label>
                            <input type="text" id="nombre" required placeholder="${t('det.nombrePh')}">
                        </div>

                        <div class="auth-campo">
                            <label for="email">${t("det.email")}</label>
                            <input type="email" id="email" required placeholder="${t('det.emailPh')}">
                        </div>

                        <div class="auth-campo">
                            <label for="telefono">${t("det.telefono")}</label>
                            <input type="tel" id="telefono" required placeholder="09X XXX XXX">
                        </div>

                        <div class="auth-campo">
                            <label for="cantidadPersonas">${t("det.cantPersonas")}</label>
                            <input type="number" id="cantidadPersonas" required min="1" max="${taller.cupos}" value="1">
                        </div>

                        <button type="submit" class="nc-btn nc-btn--pill">
                            <i class="fa-solid fa-paper-plane"></i> ${t("det.enviar")}
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

    enlazarInscripcion("taller", taller.id);
}

function iniciar_renderizarTaller() {
  renderizarTaller().catch(function () {
    mostrarErrorServidor(contenedor);
  });
}

document.addEventListener("DOMContentLoaded", iniciar_renderizarTaller);
document.addEventListener("idiomacambiado", iniciar_renderizarTaller);