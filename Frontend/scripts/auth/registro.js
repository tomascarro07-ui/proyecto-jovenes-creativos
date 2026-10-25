document.addEventListener("DOMContentLoaded", function () {
  const formRegistro = document.getElementById("form-registro");
  if (!formRegistro) return;

  formRegistro.addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
      const correo = document.getElementById("correo").value.trim();
      await pedirApi("/auth/registro", {
        method: "POST",
        body: {
          correo: correo,
          nombre: document.getElementById("nombre").value.trim(),
          apellido: document.getElementById("apellido").value.trim(),
          contrasenia: document.getElementById("contrasenia").value,
          fechaNacimiento: document.getElementById("nacimiento").value,
        },
      });
      // Se registra y se pide iniciar sesión (el aviso de "revisá tu correo" se muestra en el login)
      guardarEnStorage(SESION_KEY, null);
      window.location.href = "login.html?registrado=1&correo=" + encodeURIComponent(correo);
    } catch (error) {
      alert(error.message);
    }
  });
});
