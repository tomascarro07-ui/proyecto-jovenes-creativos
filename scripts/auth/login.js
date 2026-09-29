let parametros = new URLSearchParams(window.location.search);
let correo = parametros.get("correo");
let usuarios = leerDeStorage(USUARIOS_REGISTRADOS_KEY,[]);
const admin = {
    correo: "admin@admin",
    contrasenia: "admin123",
};

document.addEventListener("DOMContentLoaded",function() {

	document.getElementById("correo").value = correo;

	let formLogin = document.getElementById("form-login");
	if(formLogin) {
		formLogin.addEventListener("submit",function(e) {
			e.preventDefault();
			
			let correoUsuario = document.getElementById("correo").value;
			let contraseniaUsuario = document.getElementById("contrasenia").value;
			
			if (correoUsuario === admin.correo && contraseniaUsuario === admin.contrasenia) {
				let sesionAdmin = new Usuario (
					usuarios.length + 1,
					document.getElementById("correo").value.trim(),
					"Admin",
					"",
					document.getElementById("contrasenia").value.trim(),
					true,
					"Administrador",
				);
				guardarEnStorage(SESION_KEY,sesionAdmin);
				window.location.href = "admin.html";
				return;
			};
			login(correoUsuario,contraseniaUsuario,"index.html");
		});
	};
});