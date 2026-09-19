const parametros = new URLSearchParams(window.location.search);
const recorrido = parametros.get("recorrido");
const duracion = parametros.get("duracion");

if (recorrido) {
  const grupoActividad = document.getElementById("grupoActividad");
  const campoActividad = document.getElementById("actividad");
  const mensaje = document.getElementById("mensaje");
  const titulo = document.getElementById("contactoAsuntoTitulo");
  const intro = document.getElementById("contactoIntro");

  grupoActividad.hidden = false;
  campoActividad.value = duracion ? `${recorrido} (${duracion})` : recorrido;

  mensaje.value = `Hola, quiero reservar el recorrido "${recorrido}"${duracion ? ` (${duracion})` : ""}. Quedo atento/a a los próximos pasos.`;

  titulo.textContent = "Reservá tu recorrido";
  intro.textContent = `Estás por consultar sobre: ${recorrido}. Completá tus datos y te contactamos para coordinar.`;
}

document.getElementById("form-contacto").addEventListener("submit", function (evento) {
  evento.preventDefault();
  alert("¡Gracias! Tu consulta fue enviada, te vamos a contactar a la brevedad.");
  window.location.href = "index.html"
});