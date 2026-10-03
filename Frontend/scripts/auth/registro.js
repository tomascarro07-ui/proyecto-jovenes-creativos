document.addEventListener("DOMContentLoaded", function () {
  const formRegistro = document.getElementById("form-registro");
  if (!formRegistro) return;

  formRegistro.addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
      await pedirApi("/auth/registro", {
        method: "POST",
        body: {
          correo: document.getElementById("correo").value.trim(),
          nombre: document.getElementById("nombre").value.trim(),
          apellido: document.getElementById("apellido").value.trim(),
          contrasenia: document.getElementById("contrasenia").value,
          fechaNacimiento: document.getElementById("nacimiento").value,
        },
      });
      // Se registra y se pide iniciar sesión
      guardarEnStorage(SESION_KEY, null);
      window.location.href = "login.html";
    } catch (error) {
      alert(error.message);
    }
  });
});
