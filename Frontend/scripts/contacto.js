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
