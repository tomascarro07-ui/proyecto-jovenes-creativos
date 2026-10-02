const lista = document.getElementById("listaInscripciones");
const PAGINAS = { taller: "taller-detalle.html?idTaller=", charla: "charla-detalle.html?idCharla=", recorrido: "recorrido-detalle.html?idRecorrido=" };

async function renderizarInscripciones() {
    if (!validarSesion()) {
        window.location.href = "login.html";
        return;
    }

    const inscripciones = await gestorInscripciones.misInscripciones();

    if (inscripciones.length === 0) {
        lista.innerHTML = '<p class="admin-vacio">Todavía no te inscribiste a ninguna actividad.</p>';
        return;
    }

    let html = "";
    for (const ins of inscripciones) {
        html += `
        <article class="admin-item">
            <div class="admin-item-info">
                <span class="admin-item-fecha">${escaparHtml(ins.tipo)}</span>
                <h4>${escaparHtml(ins.tituloActividad)}</h4>
                <p>${ins.cantidadPersonas} persona(s) · ${escaparHtml(ins.telefono)}</p>
            </div>
            <div class="admin-item-acciones">
                <a href="${PAGINAS[ins.tipo]}${ins.actividad}" class="admin-btn-ver" title="Ver actividad">
                    <i class="fa-solid fa-eye"></i>
                </a>
                <button type="button" class="admin-btn-eliminar" data-id="${ins.id}" title="Cancelar inscripción">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </article>`;
    }
    lista.innerHTML = html;
}

lista.addEventListener("click", async function (e) {
    const boton = e.target.closest("[data-id]");
    if (!boton || !confirm("¿Cancelar esta inscripción?")) return;
    try {
        await gestorInscripciones.cancelar(boton.dataset.id);
        await renderizarInscripciones();
    } catch (error) {
        alert(error.message);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    renderizarInscripciones().catch(function () { mostrarErrorServidor(lista); });
});