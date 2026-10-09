class GestorInscripciones {

    async inscribirse(datos) {
        return await pedirApi("/inscripciones", { method: "POST", body: datos });
    }

    async misInscripciones() {
        return await pedirApi("/inscripciones/mias");
    }

    async cancelar(id) {
        return await pedirApi("/inscripciones/" + encodeURIComponent(id), { method: "DELETE" });
    }

    async deActividad(tipo, id) {
        return await pedirApi("/inscripciones/actividad/" + tipo + "/" + encodeURIComponent(id));
    }
}

const gestorInscripciones = new GestorInscripciones();

// Conecta el formulario #formConfirmacion de las páginas de detalle con el servidor.
function enlazarInscripcion(tipo, idActividad) {
    const form = document.getElementById("formConfirmacion");
    if (!form) return;

    const usuario = validarSesion();
    if (usuario) {
        document.getElementById("nombre").value = (usuario.nombre + " " + (usuario.apellido || "")).trim();
        document.getElementById("telefono").value = usuario.telefono || "";
        const email = document.getElementById("email");
        email.value = usuario.correo;
        email.readOnly = true;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const boton = form.querySelector("button[type=submit]");
        boton.disabled = true;
        try {
            await gestorInscripciones.inscribirse({
                tipo: tipo,
                actividad: idActividad,
                nombre: document.getElementById("nombre").value.trim(),
                telefono: document.getElementById("telefono").value.trim()
            });
            alert("¡Inscripción confirmada! Podés verla en \"Mis inscripciones\".");
            window.location.reload();
        } catch (error) {
            if (error.status === 401) {
                alert("Tu sesión venció. Iniciá sesión de nuevo.");
                window.location.href = "login.html";
                return;
            }
            alert(error.message);
            boton.disabled = false;
        }
    });
}
