const lista = document.getElementById("listaInscripciones");
const resumen = document.getElementById("resumenInscripciones");

const PAGINAS = {
    taller: "taller-detalle.html?idTaller=",
    charla: "charla-detalle.html?idCharla=",
    recorrido: "recorrido-detalle.html?idRecorrido="
};
const TIPOS = {
    taller: { nombre: "Taller", icono: "fa-palette" },
    charla: { nombre: "Charla", icono: "fa-microphone-lines" },
    recorrido: { nombre: "Recorrido", icono: "fa-route" }
};

function formatearFecha(iso) {
    return new Date(iso).toLocaleDateString(t("fecha.locale"), { day: "numeric", month: "long", year: "numeric" });
}

function renderizarResumen(inscripciones) {
    if (!resumen) return;
    resumen.innerHTML = inscripciones.length === 0 ? "" :
        `<div class="insc-stat"><strong>${inscripciones.length}</strong><span>${t("misinsc.actividades")}</span></div>`;
}

function crearTarjeta(ins) {
    const tipo = TIPOS[ins.tipo] || { nombre: ins.tipo, icono: "fa-star" };
    const nombreTipo = TIPOS[ins.tipo] ? t("tipo." + ins.tipo) : ins.tipo;
    const disponible = ins.disponible !== false;

    const botonVer = disponible
        ? `<a href="${PAGINAS[ins.tipo]}${ins.actividad}" class="insc-btn insc-btn--primario">
               <i class="fa-solid fa-eye"></i> ${t("misinsc.ver")}
           </a>`
        : "";

    const botonValorar = (ins.tipo === "recorrido" && ins.finalizada)
    ? `<a href="${PAGINAS.recorrido}${ins.actividad}#valoraciones" class="insc-btn insc-btn--estrella">
            <i class="fa-solid fa-star"></i> ${t("misinsc.valorar")}
        </a>`
    : "";

    const botonCancelar = ins.finalizada ? "" : `
            <button type="button" class="insc-btn insc-btn--peligro" data-cancelar="${ins.id}">
                <i class="fa-regular fa-trash-can"></i> ${t("misinsc.cancelar")}
            </button>`;
    return `
    <article class="insc-card insc-card--${escaparHtml(ins.tipo)}${disponible ? "" : " insc-card--inactiva"}">
        <div class="insc-card__icono" aria-hidden="true">
            <i class="fa-solid ${tipo.icono}"></i>
        </div>

        <div class="insc-card__cuerpo">
            <span class="insc-badge insc-badge--${escaparHtml(ins.tipo)}">${nombreTipo}</span>
            <h2 class="insc-card__titulo">${escaparHtml(ins.tituloActividad)}</h2>

            <ul class="insc-card__datos">
                <li><i class="fa-solid fa-phone"></i> ${escaparHtml(ins.telefono)}</li>
                <li><i class="fa-regular fa-calendar-check"></i> ${t("misinsc.inscriptoEl", { fecha: formatearFecha(ins.createdAt) })}</li>
                ${ins.finalizada ? '<li class="insc-ok"><i class="fa-solid fa-circle-check"></i> ' + t("misinsc.realizada") + '</li>' : ""}
            </ul>

            ${disponible ? "" : '<p class="insc-card__aviso"><i class="fa-solid fa-circle-info"></i> ' + t("misinsc.noDisp") + '</p>'}
        </div>

        <div class="insc-card__acciones">
            ${botonVer}
            <button type="button" class="insc-btn insc-btn--peligro" data-cancelar="${ins.id}">
                <i class="fa-regular fa-trash-can"></i> ${t("misinsc.cancelar")}
            </button>
        </div>
    </article>`;
}

async function renderizarInscripciones() {
    if (!validarSesion()) {
        window.location.href = "login.html";
        return;
    }

    const inscripciones = await gestorInscripciones.misInscripciones();
    renderizarResumen(inscripciones);

    if (inscripciones.length === 0) {
        lista.innerHTML = `
            <div class="insc-vacio">
                <i class="fa-regular fa-calendar-plus"></i>
                <h2>${t("misinsc.vacioH")}</h2>
                <p>${t("misinsc.vacioP")}</p>
                <a href="index.html" class="insc-btn insc-btn--primario">${t("misinsc.explorar")}</a>
            </div>`;
        return;
    }

    lista.innerHTML = inscripciones.map(crearTarjeta).join("");
}

lista.addEventListener("click", async function (e) {
    const boton = e.target.closest("[data-cancelar]");
    if (!boton || !confirm(t("misinsc.confirmarCancelar"))) return;

    boton.disabled = true;
    try {
        await gestorInscripciones.cancelar(boton.dataset.cancelar);
        await renderizarInscripciones();
    } catch (error) {
        alert(error.message);
        boton.disabled = false;
    }
});

function iniciarInscripciones() {
    renderizarInscripciones().catch(function () { mostrarErrorServidor(lista); });
}

document.addEventListener("DOMContentLoaded", iniciarInscripciones);
document.addEventListener("idiomacambiado", iniciarInscripciones);