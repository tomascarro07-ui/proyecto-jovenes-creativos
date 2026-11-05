document.addEventListener("DOMContentLoaded", async function () {
    const titulo = document.getElementById("estadoTitulo");
    const mensaje = document.getElementById("mensaje");
    const acciones = document.getElementById("acciones");
    if (!titulo) return;

    // El token viaja en la URL del correo; lo sacamos de la barra de direcciones enseguida.
    const token = new URLSearchParams(window.location.search).get("token") || "";
    window.history.replaceState(null, "", window.location.pathname);

    function mostrar(textoTitulo, texto, esError) {
        titulo.textContent = textoTitulo;
        mensaje.textContent = texto;
        mensaje.className = "auth-mensaje" + (esError ? " auth-mensaje--error" : "");
    }

    function botones(html) { acciones.innerHTML = html; }

    mostrar(t("ver.verificando"), t("ver.confirmando"), false);

    if (!token) {
        mostrar(t("ver.incompleto"), t("ver.incompletoMsg"), true);
        botones(validarSesion() ? '<a class="nc-btn" href="index.html">' + t("common.irInicio") + '</a>' : '<a class="nc-btn" href="login.html">' + t("hd.iniciarSesion") + '</a>');
        return;
    }

    try {
        const r = await pedirApi("/auth/verificar-correo", { method: "POST", body: { token } });
        mostrar(t("ver.ok"), r.mensaje + t("ver.okExtra"), false);
        botones('<a class="nc-btn" href="calendario.html">' + t("ver.verActividades") + '</a><a class="auth-ayuda" href="index.html">' + t("common.irInicio") + '</a>');

        // Si hay sesión abierta, se actualiza para que desaparezca el aviso del header
        if (validarSesion()) {
            await sincronizarSesion();
            actualizarHeaderSesion();
        }
    } catch (error) {
        mostrar(t("ver.fallo"), error.message, true);
        if (validarSesion()) {
            botones('<button type="button" class="nc-btn" id="btnReenviar">' + t("ver.pedirNuevo") + '</button>');
            document.getElementById("btnReenviar").addEventListener("click", async function (e) {
                e.target.disabled = true;
                try {
                    const r = await pedirApi("/auth/reenviar-verificacion", { method: "POST" });
                    mostrar(t("ver.revisa"), r.mensaje, false);
                } catch (err) {
                    mostrar(t("ver.fallo"), err.message, true);
                    e.target.disabled = false;
                }
            });
        } else {
            botones('<a class="nc-btn" href="login.html">' + t("ver.loginParaPedir") + '</a>');
        }
    }
});
