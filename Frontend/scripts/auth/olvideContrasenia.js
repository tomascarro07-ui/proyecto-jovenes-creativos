document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-olvide");
    if (!form) return;

    const mensaje = document.getElementById("mensaje");
    const boton = document.getElementById("btnEnviar");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const correo = document.getElementById("correo").value.trim();
        if (!correo) return;

        boton.disabled = true;
        mensajeAuth(mensaje, t("hd.enviando"), false);
        try {
            const r = await pedirApi("/auth/olvide-contrasenia", { method: "POST", body: { correo } });
            mensajeAuth(mensaje, r.mensaje, false);
            form.reset();
        } catch (error) {
            mensajeAuth(mensaje, error.message, true);
        } finally {
            // Pequeña pausa para no invitar a reenviar varias veces seguidas
            setTimeout(function () { boton.disabled = false; }, 3000);
        }
    });
});

function mensajeAuth(elemento, texto, esError) {
    elemento.hidden = false;
    elemento.textContent = texto;
    elemento.className = "auth-mensaje" + (esError ? " auth-mensaje--error" : "");
}
