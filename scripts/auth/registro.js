document.addEventListener("DOMContentLoaded", function () {
  const formRegistro = document.getElementById("form-registro");
  if (!formRegistro) return;

  formRegistro.addEventListener("submit", function (e) {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const usuarios = leerDeStorage("usuariosRegistrados", []);

    const yaExiste = usuarios.some(usuario => usuario.correo === correo);
    if (yaExiste) {
      alert("Ya existe una cuenta con ese correo.");
      return;
    }

    const nuevoUsuario = new Usuario(
      usuarios.length + 1,
      correo,
      document.getElementById("nombre").value.trim(),
      document.getElementById("apellido").value.trim(),
      document.getElementById("contrasenia").value,
      false,
      document.getElementById("nacimiento").value
    );

    usuarios.push(nuevoUsuario);
    guardarEnStorage("usuariosRegistrados", usuarios);

    guardarEnStorage("sesionActual", nuevoUsuario);
    window.location.href = "index.html";
  });
});
