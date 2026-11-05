let contenedor = document.getElementById("detalleContenido");

async function renderizarCharla() {

    let id = gestorCharlas.obtenerIdDesdeUrl();

    if (!id) {
        contenedor.innerHTML = '<p class="admin-vacio">' + t("det.noCharla") + '</p>';
        return;
    }

    const charla = await gestorCharlas.obtenerCharlaPorId(id);

    if (!charla) {
        contenedor.innerHTML = '<p class="admin-vacio">' + t("det.noCharla") + '</p>';
        return;
    }

    let html = `

        <div class="charla-detalle">

            <div class="charla-detalle__media">
                <img src="${charla.imagen}" alt="${charla.titulo}">
                <span class="charla-detalle__tag">${tDato(charla.tipo)}</span>
            </div>

            <div class="charla-detalle__body">

                <h1>${charla.titulo}</h1>

                <p class="charla-detalle__desc">
                    ${charla.descripcionCompleta}
                </p>

                <dl class="charla-detalle__datos">

                    <div>
                        <dt><i class="fa-regular fa-calendar"></i> ${t("det.fecha")}</dt>
                        <dd>${charla.fecha}</dd>
                    </div>

                    <div>
                        <dt><i class="fa-regular fa-clock"></i> ${t("det.hora")}</dt>
                        <dd>${charla.hora}</dd>
                    </div>

                    <div>
                        <dt><i class="fa-solid fa-location-dot"></i> ${t("det.lugar")}</dt>
                        <dd>${tDato(charla.lugar)}</dd>
                    </div>

                    <div>
                        <dt><i class="fa-solid fa-user"></i> ${t("det.expositor")}</dt>
                        <dd>${charla.expositor}</dd>
                    </div>

                </dl>

                <div class="charla-detalle__footer">

                    <span class="charla-detalle__cupos">
                        <i class="fa-solid fa-users"></i>
                        ${t("det.cupos", { n: charla.cupos })}
                    </span>

                    <button type="button" id="btnMostrarForm" class="nc-btn">${t("act.inscribirme")}</button>

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

                            <button type="submit" class="nc-btn nc-btn--pill">
                                <i class="fa-solid fa-paper-plane"></i> ${t("det.enviar")}
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

function iniciar_renderizarCharla() {
  renderizarCharla().catch(function () {
    mostrarErrorServidor(contenedor);
  });
}

document.addEventListener("DOMContentLoaded", iniciar_renderizarCharla);
document.addEventListener("idiomacambiado", iniciar_renderizarCharla);