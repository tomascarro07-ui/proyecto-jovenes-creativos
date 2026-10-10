const parametros = new URLSearchParams(window.location.search);
const idTaller = parametros.get("idTaller");
const idCharla = parametros.get("idCharla");

let ultimoMensajeAuto = "";

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

    titulo.textContent = t("contacto.reservaTaller");
    intro.innerHTML = t("contacto.introTaller", { titulo: escaparHtml(taller.titulo) });
    grupoActividad.hidden = false;
    campoActividad.value = taller.titulo;
    ponerMensajeAuto(mensaje, t("contacto.msgTaller", { titulo: taller.titulo }));

  } else if (idCharla) {
    const charla = await new GestorCharlas().obtenerCharlaPorId(idCharla);

    if (!charla) {
      return;
    }

    titulo.textContent = t("contacto.reservaCharla");
    intro.innerHTML = t("contacto.introCharla", { titulo: escaparHtml(charla.titulo) });
    grupoActividad.hidden = false;
    campoActividad.value = charla.titulo;
    ponerMensajeAuto(mensaje, t("contacto.msgCharla", { titulo: charla.titulo }));
  }
}

// Completa el mensaje sugerido, pero no pisa lo que la persona ya escribió por su cuenta
function ponerMensajeAuto(campo, texto) {
  if (campo.value === "" || campo.value === ultimoMensajeAuto) {
    campo.value = texto;
  }
  ultimoMensajeAuto = texto;
}

document.addEventListener("idiomacambiado", function () {
  prepararContacto().catch(function () {});
});

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
    boton.textContent = t("bol.enviando");
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

      aviso.textContent = (datos && datos.mensaje) || t("contacto.gracias");
      aviso.style.color = "#2f6b3a";
      aviso.hidden = false;
      formContacto.reset();
      prepararContacto().catch(function () {}); // vuelve a completar el mensaje si venías de una charla o taller
    } catch (error) {
      aviso.textContent = error.message || t("contacto.error");
      aviso.style.color = "#a2492a";
      aviso.hidden = false;
    } finally {
      boton.disabled = false;
      boton.innerHTML = textoOriginal;
    }
  });
}
