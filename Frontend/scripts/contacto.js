const parametros = new URLSearchParams(window.location.search);
const idTaller = parametros.get("idTaller");
const idCharla = parametros.get("idCharla");

async function prepararContacto() {
  // Si no se llegó desde un taller o una charla, el formulario queda como está.
  if (!idTaller && !idCharla) {
    return;
  }

  const grupoActividad = document.getElementById("grupoActividad");
  const campoActividad = document.getElementById("actividad");
  const mensaje = document.getElementById("mensaje");
  const titulo = document.getElementById("contactoAsuntoTitulo");
  const intro = document.getElementById("contactoIntro");

  if (idTaller) {
    const taller = await new GestorTalleres().obtenerTallerPorId(idTaller);

    if (!taller) {
      return;
    }

    titulo.textContent = "Reservá tu recorrido";
    intro.innerHTML = `Estás por consultar sobre nuestro <b>${taller.titulo}.</b> Completá tus datos y te contactaremos para coordinar.`;
    grupoActividad.hidden = false;
    campoActividad.value = taller.titulo;
    mensaje.value = `Hola, quiero reservar el recorrido "${taller.titulo}". Quedo atento/a a los próximos pasos.`;

  } else if (idCharla) {
    const charla = await new GestorCharlas().obtenerCharlaPorId(idCharla);

    if (!charla) {
      return;
    }

    titulo.textContent = "Reservá tu lugar en la charla";
    intro.innerHTML = `Estás por consultar sobre la charla <b>${charla.titulo}.</b> Completá tus datos y te contactaremos para continuar con la inscripción.`;
    grupoActividad.hidden = false;
    campoActividad.value = charla.titulo;
    mensaje.value = `Hola, quiero reservar mi lugar en la charla "${charla.titulo}". Quedo atento/a a los próximos pasos.`;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Si el servidor no responde, el formulario de contacto sigue funcionando igual.
  prepararContacto().catch(function () {});
});


// ---- Envío del formulario: el backend lo manda al correo de Nodo Cultural ----
const formContacto = document.getElementById("form-contacto");

if (formContacto) {
  const aviso = document.createElement("p");
  aviso.setAttribute("role", "status");
  aviso.hidden = true;
  aviso.style.marginTop = "1rem";
  formContacto.appendChild(aviso);

  formContacto.addEventListener("submit", async function (e) {
    e.preventDefault();

    const boton = formContacto.querySelector('button[type="submit"]');
    const textoOriginal = boton.innerHTML;
    boton.disabled = true;
    boton.textContent = "Enviando...";
    aviso.hidden = true;

    try {
      const datos = await pedirApi("/contacto", {
        method: "POST",
        body: {
          nombre: document.getElementById("nombre").value,
          email: document.getElementById("email").value,
          actividad: document.getElementById("actividad").value,
          mensaje: document.getElementById("mensaje").value
        }
      });

      aviso.textContent = (datos && datos.mensaje) || "¡Gracias! Recibimos tu consulta.";
      aviso.style.color = "#2f6b3a";
      aviso.hidden = false;
      formContacto.reset();
      prepararContacto().catch(function () {}); // vuelve a completar el mensaje si venías de una charla o taller
    } catch (error) {
      aviso.textContent = error.message || "No pudimos enviar tu mensaje. Probá de nuevo.";
      aviso.style.color = "#a2492a";
      aviso.hidden = false;
    } finally {
      boton.disabled = false;
      boton.innerHTML = textoOriginal;
    }
  });
}
