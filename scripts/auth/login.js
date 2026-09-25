let parametros = new URLSearchParams(window.location.search);
let correo = parametros.get("correo");
let usuarios = leerDeStorage("usuariosRegistrados",[]);
const admin = {
    correo: "admin@admin",
    contrasenia: "admin123",
};

document.getElementById("correo").value = correo;

document.addEventListener("DOMContentLoaded",function() {
	let formLogin = document.getElementById("form-login");
	if(formLogin) {
		formLogin.addEventListener("submit",function(e) {
			e.preventDefault();
			
			let correoUsuario = document.getElementById("correo").value;
			let contraseniaUsuario = document.getElementById("contrasenia").value;
			
			if (correoUsuario === admin.correo && contraseniaUsuario === admin.contrasenia) {
				let sesionAdmin = new Usuario (
					usuarios.length + 1,
					document.getElementById("correo").value,
					"Admin",
					"Mundo Perifericos",
					document.getElementById("contrasenia").value,
					true,
					"Administrador",
				);
				guardarEnStorage("sesionActual",sesionAdmin);
				window.location.href = "admin.html";
				return;
			};
			login(correoUsuario,contraseniaUsuario,"index.html");
		});
	};
});