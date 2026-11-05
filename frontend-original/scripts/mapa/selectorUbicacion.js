const CENTRO_COLONIA = [-34.4715, -57.8520];
const LIMITES_COLONIA = [[-34.60, -58.05], [-34.30, -57.60]];
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/";
const ESRI_ATRIBUCION = "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, OpenStreetMap contributors";

// Mapa base gris, sin comercios ni puntos de interés
function capaBase() {
    return L.tileLayer(ESRI + "World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        maxNativeZoom: 16, maxZoom: 18, attribution: ESRI_ATRIBUCION
    });
}

// Nombres de calles (se superpone al mapa base)
function capaCalles() {
    return L.tileLayer(ESRI + "World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
        maxNativeZoom: 16, maxZoom: 18, pane: "shadowPane"
    });
}

// Abre un mapa para marcar una ubicación. Devuelve {lat, lng} o null si cancela.
function elegirUbicacion(inicial) {
    return new Promise(function (resolve) {
        const dlg = document.createElement("dialog");
        dlg.className = "ubic-dialogo";
        dlg.innerHTML = `
            <h3>Marcá la ubicación</h3>
            <p>Pegá las coordenadas o hacé clic en el mapa.</p>
            <div class="ubic-campo">
                <input type="text" class="ubic-input" inputmode="decimal" autocomplete="off"
                       placeholder="Ej: -34.472171, -57.855030" aria-label="Coordenadas (latitud, longitud)">
            </div>
            <small class="ubic-error" role="alert"></small>
            <div class="ubic-mapa"></div>
            <div class="ubic-acciones">
                <span class="ubic-coord">Sin marcar</span>
                <button type="button" class="nc-btn nc-btn--outline" data-cancelar>Cancelar</button>
                <button type="button" class="nc-btn" data-ok disabled>Confirmar</button>
            </div>`;
        document.body.appendChild(dlg);
        dlg.showModal();

        const mapa = L.map(dlg.querySelector(".ubic-mapa"), {
            center: inicial ? [inicial.lat, inicial.lng] : CENTRO_COLONIA,
            zoom: inicial ? 17 : 15,
            minZoom: 12,
            maxZoom: 18,
            maxBounds: LIMITES_COLONIA
        });
        capaBase().addTo(mapa);
        capaCalles().addTo(mapa);
        setTimeout(function () { mapa.invalidateSize(); }, 60);

        const input = dlg.querySelector(".ubic-input");
        const error = dlg.querySelector(".ubic-error");
        const coord = dlg.querySelector(".ubic-coord");
        const botonOk = dlg.querySelector("[data-ok]");
        const limites = L.latLngBounds(LIMITES_COLONIA);
        let marcador = null;

        // Acepta "-34.47, -57.85", "-34.47 -57.85", "-34.47;-57.85"
        function leerCoordenadas(texto) {
            const numeros = texto.replace(/\u2212/g, "-").match(/-?\d+(?:\.\d+)?/g);
            if (!numeros || numeros.length < 2) return null;
            return { lat: Number(numeros[0]), lng: Number(numeros[1]) };
        }

        function mostrar(ll) {
            coord.textContent = ll.lat.toFixed(6) + ", " + ll.lng.toFixed(6);
            botonOk.disabled = false;
            error.textContent = "";
        }

        function poner(ll, centrar) {
            if (marcador) marcador.setLatLng(ll);
            else {
                marcador = L.marker(ll, { draggable: true }).addTo(mapa);
                marcador.on("dragend", function () {
                    const p = marcador.getLatLng();
                    input.value = p.lat.toFixed(6) + ", " + p.lng.toFixed(6);
                    mostrar(p);
                });
            }
            if (centrar) mapa.setView(ll, 18);
            mostrar(ll);
        }

        input.addEventListener("input", function () {
            const texto = input.value.trim();
            if (!texto) { error.textContent = ""; return; }

            const c = leerCoordenadas(texto);
            if (!c) { error.textContent = "Escribí latitud y longitud, por ejemplo: -34.472171, -57.855030"; return; }
            if (Math.abs(c.lat) > 90 || Math.abs(c.lng) > 180) {
                error.textContent = "Coordenadas fuera de rango. ¿Invertiste latitud y longitud?";
                return;
            }
            const ll = L.latLng(c.lat, c.lng);
            if (!limites.contains(ll)) {
                error.textContent = "Esa ubicación queda fuera de la zona de Colonia del Sacramento.";
                return;
            }
            poner(ll, true);
        });

        if (inicial) {
            input.value = inicial.lat.toFixed(6) + ", " + inicial.lng.toFixed(6);
            poner(L.latLng(inicial.lat, inicial.lng), false);
        }

        mapa.on("click", function (e) {
            input.value = e.latlng.lat.toFixed(6) + ", " + e.latlng.lng.toFixed(6);
            poner(e.latlng, false);
        });

        function cerrar(valor) {
            mapa.remove();
            dlg.close();
            dlg.remove();
            resolve(valor);
        }
        dlg.querySelector("[data-cancelar]").onclick = function () { cerrar(null); };
        botonOk.onclick = function () {
            const ll = marcador.getLatLng();
            cerrar({ lat: Number(ll.lat.toFixed(6)), lng: Number(ll.lng.toFixed(6)) });
        };
        dlg.addEventListener("cancel", function (e) { e.preventDefault(); cerrar(null); });
    });
}

function leerUbicacion(form) {
    const lat = form.querySelector("[data-lat]").value;
    const lng = form.querySelector("[data-lng]").value;
    return lat === "" ? { lat: null, lng: null } : { lat: Number(lat), lng: Number(lng) };
}

function enlazarUbicaciones() {
    document.querySelectorAll("[data-ubicacion]").forEach(function (bloque) {
        const lat = bloque.querySelector("[data-lat]");
        const lng = bloque.querySelector("[data-lng]");
        const estado = bloque.querySelector("[data-ubicacion-estado]");

        function pintar() {
            estado.textContent = lat.value
                ? "Ubicación marcada (" + Number(lat.value).toFixed(5) + ", " + Number(lng.value).toFixed(5) + ")"
                : "Sin ubicación";
            estado.classList.toggle("ubic-ok", !!lat.value);
        }

        bloque.querySelector("[data-ubicacion-btn]").addEventListener("click", async function () {
            const r = await elegirUbicacion(lat.value ? { lat: Number(lat.value), lng: Number(lng.value) } : null);
            if (r) { lat.value = r.lat; lng.value = r.lng; pintar(); }
        });

        const form = bloque.closest("form");
        if (form) {
            form.addEventListener("reset", function () {
                setTimeout(function () { lat.value = ""; lng.value = ""; pintar(); });
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", enlazarUbicaciones);