const $ = (id) => document.getElementById(id);
let avisoTimer;

function aviso(texto, ok) {
    const el = $("cuentaAviso");
    el.textContent = texto;
    el.className = "cuenta-aviso cuenta-aviso--visible" + (ok === false ? " cuenta-aviso--error" : "");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function () { el.className = "cuenta-aviso"; }, 3500);
}

function pintarCuenta(u) {
    $("cuentaNombre").textContent = (u.nombre + " " + (u.apellido || "")).trim();
    $("cuentaCorreo").textContent = u.correo;
    $("cuentaAvatar").innerHTML = u.foto
        ? `<img src="${escaparHtml(u.foto)}" alt="Foto de perfil">`
        : `<span>${escaparHtml(iniciales(u))}</span>`;
    $("btnQuitarFoto").hidden = !u.foto;

    $("cuenta-nombre").value = u.nombre || "";
    $("cuenta-apellido").value = u.apellido || "";
    $("cuenta-correo").value = u.correo;
    $("cuenta-telefono").value = u.telefono || "";
    $("cuenta-nacimiento").value = u.fechaNacimiento || "";
    $("cuenta-bio").value = u.bio || "";
}

async function guardarPerfil(cambios) {
    const r = await pedirApi("/auth/yo", { method: "PATCH", body: cambios });
    actualizarSesionUsuario(r.usuario);
    pintarCuenta(r.usuario);
    actualizarHeaderSesion();
}

function redimensionarFoto(archivo, lado) {
    return new Promise(function (ok, fallo) {
        if (!archivo.type.startsWith("image/")) return fallo(new Error("Elegí un archivo de imagen"));
        const img = new Image();
        const url = URL.createObjectURL(archivo);
        img.onload = function () {
            const min = Math.min(img.width, img.height); // recorte cuadrado centrado
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = lado;
            canvas.getContext("2d").drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, lado, lado);
            URL.revokeObjectURL(url);
            ok(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = function () { fallo(new Error("No se pudo leer la imagen")); };
        img.src = url;
    });
}

async function cargarEstadisticas() {
    try {
        const lista = await gestorInscripcionesCuenta();
        const realizados = lista.filter(function (i) { return i.tipo === "recorrido" && i.finalizada; }).length;
        $("cuentaStats").innerHTML = `
            <div class="insc-stat"><strong>${lista.length}</strong><span>inscripciones</span></div>
            <div class="insc-stat"><strong>${realizados}</strong><span>recorridos realizados</span></div>`;
    } catch (e) { /* las estadísticas son opcionales */ }
}

function gestorInscripcionesCuenta() {
    return pedirApi("/inscripciones/mias");
}

document.addEventListener("DOMContentLoaded", async function () {
    if (!validarSesion()) {
        window.location.href = "login.html";
        return;
    }

    try {
        const r = await pedirApi("/auth/yo");
        actualizarSesionUsuario(r.usuario);
        pintarCuenta(r.usuario);
        actualizarHeaderSesion();
    } catch (e) {
        window.location.href = "login.html";
        return;
    }
    cargarEstadisticas();

    $("formDatos").addEventListener("submit", async function (e) {
        e.preventDefault();
        try {
            await guardarPerfil({
                nombre: $("cuenta-nombre").value,
                apellido: $("cuenta-apellido").value,
                telefono: $("cuenta-telefono").value,
                fechaNacimiento: $("cuenta-nacimiento").value,
                bio: $("cuenta-bio").value
            });
            aviso("Datos guardados");
        } catch (error) { aviso(error.message, false); }
    });

    $("inputFoto").addEventListener("change", async function (e) {
        const archivo = e.target.files[0];
        if (!archivo) return;
        try {
            await guardarPerfil({ foto: await redimensionarFoto(archivo, 240) });
            aviso("Foto actualizada");
        } catch (error) { aviso(error.message, false); }
        e.target.value = "";
    });

    $("btnQuitarFoto").addEventListener("click", async function () {
        try { await guardarPerfil({ foto: "" }); aviso("Foto eliminada"); }
        catch (error) { aviso(error.message, false); }
    });

    $("formPass").addEventListener("submit", async function (e) {
        e.preventDefault();
        if ($("pass-nueva").value !== $("pass-repetir").value) {
            return aviso("Las contraseñas nuevas no coinciden", false);
        }
        try {
            await pedirApi("/auth/contrasenia", {
                method: "PATCH",
                body: { actual: $("pass-actual").value, nueva: $("pass-nueva").value }
            });
            $("formPass").reset();
            aviso("Contraseña actualizada");
        } catch (error) { aviso(error.message, false); }
    });
});