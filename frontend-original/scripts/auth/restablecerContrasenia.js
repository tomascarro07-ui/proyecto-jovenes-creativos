document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-restablecer");
    if (!form) return;

    const mensaje = document.getElementById("mensaje");
    const boton = document.getElementById("btnGuardar");

    // El token viaja en la URL del correo; lo sacamos de la barra de direcciones enseguida.
    const token = new URLSearchParams(window.location.search).get("token") || "";
    window.history.replaceState(null, "", window.location.pathname);

    function mostrar(texto, esError) {
        mensaje.hidden = false;
        mensaje.textContent = texto;
        mensaje.className = "auth-mensaje" + (esError ? " auth-mensaje--error" : "");
    }

    if (!token) {
        mostrar(t("rest.invalido"), true);
        boton.disabled = true;
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const nueva = document.getElementById("nueva").value;
        const repetir = document.getElementById("repetir").value;

        if (nueva.length < 8) return mostrar(t("rest.corta"), true);
        if (nueva !== repetir) return mostrar(t("rest.noCoinciden"), true);

        boton.disabled = true;
        try {
            const r = await pedirApi("/auth/restablecer-contrasenia", { method: "POST", body: { token, nueva } });
            guardarEnStorage(SESION_KEY, null); // por si quedaba una sesión vieja en este navegador
            form.hidden = true;
            mostrar(r.mensaje + t("rest.login"), false);
            setTimeout(function () { window.location.href = "login.html"; }, 2500);
        } catch (error) {
            mostrar(error.message, true);
            boton.disabled = false;
        }
    });
});
