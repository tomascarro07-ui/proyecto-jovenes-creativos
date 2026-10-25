function opcionesMuseos(museos, seleccionado) {
    return museos.map(function (m) {
        return `<option value="${escaparHtml(m.id)}" data-nombre="${escaparHtml(m.nombre)}"${m.id === seleccionado ? " selected" : ""}>${escaparHtml(m.nombre)}</option>`;
    }).join("");
}

// Llena los selectores de los formularios con los museos cargados
async function cargarMuseosEnSelectores() {
    const selects = document.querySelectorAll("[data-lugar-select]");
    if (!selects.length) return;

    let museos = [];
    try { museos = await gestorMuseos.obtenerMuseos(); } catch (e) { /* queda solo "Otro lugar" */ }

    selects.forEach(function (sel) {
        const previo = sel.value;
        sel.innerHTML =
            '<option value="">Elegí un lugar...</option>' +
            (museos.length ? '<optgroup label="Museos de Colonia">' + opcionesMuseos(museos, previo) + "</optgroup>" : "") +
            '<option value="otro">Otro lugar (marcar en el mapa)</option>';
        sel.value = previo;
    });
}

function enlazarLugares() {
    document.querySelectorAll("[data-lugar]").forEach(function (bloque) {
        const sel = bloque.querySelector("[data-lugar-select]");
        const otro = bloque.querySelector("[data-lugar-otro]");
        const alternar = function () { otro.hidden = sel.value !== "otro"; };

        sel.addEventListener("change", alternar);
        const form = bloque.closest("form");
        if (form) form.addEventListener("reset", function () { setTimeout(alternar); });
        alternar();
    });
    cargarMuseosEnSelectores();
}

// Devuelve { museo, lugar, lat, lng } o null si no eligió nada
function leerLugar(form) {
    const bloque = form.querySelector("[data-lugar]");
    const sel = bloque.querySelector("[data-lugar-select]");
    if (!sel.value) return null;

    if (sel.value === "otro") {
        const u = leerUbicacion(form);
        return { museo: null, lugar: bloque.querySelector("[data-lugar-texto]").value.trim(), lat: u.lat, lng: u.lng };
    }
    return { museo: sel.value, lugar: sel.selectedOptions[0].dataset.nombre, lat: null, lng: null };
}

// Igual que leerLugar, pero avisa si falta algo
function lugarValido(form) {
    const lg = leerLugar(form);
    if (!lg) { alert("Elegí el lugar de la actividad."); return null; }
    if (!lg.museo) {
        if (!lg.lugar) { alert("Escribí el nombre del lugar."); return null; }
        if (lg.lat === null) { alert("Marcá la ubicación del lugar en el mapa."); return null; }
    }
    return lg;
}

// Diálogo para asignar lugar a algo ya cargado: museo o coordenadas
function elegirLugar(actual) {
    return new Promise(async function (resolve) {
        let museos = [];
        try { museos = await gestorMuseos.obtenerMuseos(); } catch (e) { /* solo "otro lugar" */ }

        const inicial = actual && actual.museo ? actual.museo : (actual && actual.lat != null ? "otro" : "");
        const dlg = document.createElement("dialog");
        dlg.className = "ubic-dialogo ubic-dialogo--lugar";
        dlg.innerHTML = `
            <h3>¿Dónde se realiza?</h3>
            <p>Elegí un museo o marcá otra ubicación en el mapa.</p>
            <select class="ubic-select">
                <option value="">Elegí un lugar...</option>
                <optgroup label="Museos de Colonia">${opcionesMuseos(museos, inicial)}</optgroup>
                <option value="otro"${inicial === "otro" ? " selected" : ""}>Otro lugar (marcar en el mapa)</option>
            </select>
            <div class="ubic-acciones">
                <span class="ubic-coord"></span>
                <button type="button" class="nc-btn nc-btn--outline" data-cancelar>Cancelar</button>
                <button type="button" class="nc-btn" data-ok>Continuar</button>
            </div>`;
        document.body.appendChild(dlg);
        dlg.showModal();

        const select = dlg.querySelector(".ubic-select");
        function cerrar(v) { dlg.close(); dlg.remove(); resolve(v); }

        dlg.querySelector("[data-cancelar]").onclick = function () { cerrar(null); };
        dlg.addEventListener("cancel", function (e) { e.preventDefault(); cerrar(null); });
        dlg.querySelector("[data-ok]").onclick = async function () {
            if (!select.value) return;
            if (select.value !== "otro") return cerrar({ museo: select.value });

            dlg.close();
            dlg.remove();
            const r = await elegirUbicacion(actual && actual.lat != null ? { lat: actual.lat, lng: actual.lng } : null);
            resolve(r ? { museo: null, lat: r.lat, lng: r.lng } : null);
        };
    });
}

document.addEventListener("DOMContentLoaded", enlazarLugares);