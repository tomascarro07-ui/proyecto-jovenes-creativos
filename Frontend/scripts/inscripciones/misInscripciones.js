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
    return new Date(iso).toLocaleDateString("es-UY", { day: "numeric", month: "long", year: "numeric" });
}

function renderizarResumen(inscripciones) {
    if (!resumen) return;
    resumen.innerHTML = inscripciones.length === 0 ? "" :
        `<div class="insc-stat"><strong>${inscripciones.length}</strong><span>actividades</span></div>`;
}

function crearTarjeta(ins) {
    const tipo = TIPOS[ins.tipo] || { nombre: ins.tipo, icono: "fa-star" };
    const disponible = ins.disponible !== false;

    const botonVer = disponible
        ? `<a href="${PAGINAS[ins.tipo]}${ins.actividad}" class="insc-btn insc-btn--primario">
               <i class="fa-solid fa-eye"></i> Ver actividad
           </a>`
        : "";

    const botonValorar = (ins.tipo === "recorrido" && ins.finalizada)
    ? `<a href="${PAGINAS.recorrido}${ins.actividad}#valoraciones" class="insc-btn insc-btn--estrella">
            <i class="fa-solid fa-star"></i> Valorar
        </a>`
    : "";

    const botonCancelar = ins.finalizada ? "" : `
            <button type="button" class="insc-btn insc-btn--peligro" data-cancelar="${ins.id}">
                <i class="fa-regular fa-trash-can"></i> Cancelar
            </button>`;
    return `
    <article class="insc-card insc-card--${escaparHtml(ins.tipo)}${disponible ? "" : " insc-card--inactiva"}">
        <div class="insc-card__icono" aria-hidden="true">
            <i class="fa-solid ${tipo.icono}"></i>
        </div>

        <div class="insc-card__cuerpo">
            <span class="insc-badge insc-badge--${escaparHtml(ins.tipo)}">${tipo.nombre}</span>
            <h2 class="insc-card__titulo">${escaparHtml(ins.tituloActividad)}</h2>

            <ul class="insc-card__datos">
                <li><i class="fa-solid fa-phone"></i> ${escaparHtml(ins.telefono)}</li>
                <li><i class="fa-regular fa-calendar-check"></i> Inscripto el ${formatearFecha(ins.createdAt)}</li>
                ${ins.finalizada ? '<li class="insc-ok"><i class="fa-solid fa-circle-check"></i> Actividad realizada</li>' : ""}
            </ul>

            ${disponible ? "" : '<p class="insc-card__aviso"><i class="fa-solid fa-circle-info"></i> Esta actividad ya no está disponible.</p>'}
        </div>

        <div class="insc-card__acciones">
            ${botonVer}
            <button type="button" class="insc-btn insc-btn--peligro" data-cancelar="${ins.id}">
                <i class="fa-regular fa-trash-can"></i> Cancelar
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
                <h2>Todavía no te inscribiste a nada</h2>
                <p>Explorá los talleres, charlas y recorridos y reservá tu lugar.</p>
                <a href="index.html" class="insc-btn insc-btn--primario">Explorar actividades</a>
            </div>`;
        return;
    }

    lista.innerHTML = inscripciones.map(crearTarjeta).join("");
}

lista.addEventListener("click", async function (e) {
    const boton = e.target.closest("[data-cancelar]");
    if (!boton || !confirm("¿Cancelar esta inscripción? Los lugares se devolverán a la actividad.")) return;

    boton.disabled = true;
    try {
        await gestorInscripciones.cancelar(boton.dataset.cancelar);
        await renderizarInscripciones();
    } catch (error) {
        alert(error.message);
        boton.disabled = false;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    renderizarInscripciones().catch(function () { mostrarErrorServidor(lista); });
});