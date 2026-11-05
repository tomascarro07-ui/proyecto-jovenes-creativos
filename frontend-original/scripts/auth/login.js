document.addEventListener("DOMContentLoaded", function () {
    const parametros = new URLSearchParams(window.location.search);
    const correoUrl = parametros.get("correo");
    if (correoUrl) document.getElementById("correo").value = correoUrl;

    const avisoRegistro = document.getElementById("avisoRegistro");
    function pintarAviso() {
        if (avisoRegistro && parametros.get("registrado") === "1") {
            avisoRegistro.hidden = false;
            avisoRegistro.textContent = t("auth.registrado");
        }
    }
    pintarAviso();
    document.addEventListener("idiomacambiado", pintarAviso);

    const formLogin = document.getElementById("form-login");
    if (!formLogin) return;

    formLogin.addEventListener("submit", function (e) {
        e.preventDefault();
        login(
            document.getElementById("correo").value.trim(),
            document.getElementById("contrasenia").value,
            "index.html",
            "admin.html"
        );
    });
});
