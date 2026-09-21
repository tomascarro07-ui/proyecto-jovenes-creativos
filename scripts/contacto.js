// ============================================================
// contacto.js — formulario de contacto.
// Si la URL trae ?recorrido=..., ?curso=... o ?asunto=..., el formulario
// se arma con esa consulta ya elegida (ej: contacto.html?curso=Taller&duracion=4%20clases)
// ============================================================

const parametros = new URLSearchParams(window.location.search);
const duracion = parametros.get("duracion");

// Tipos de consulta que entendemos, con los textos que cambian en cada caso
const tiposDeConsulta = [
  { parametro: "recorrido", titulo: "Reservá tu recorrido", accion: "reservar el recorrido" },
  { parametro: "curso", titulo: "Inscribite al curso", accion: "inscribirme al curso" },
  { parametro: "asunto", titulo: "Envianos tu consulta", accion: "consultar por" }
];

// find devuelve el primer tipo cuyo parámetro venga en la URL (o undefined si no viene ninguno)
const tipo = tiposDeConsulta.find(t => parametros.get(t.parametro));

if (tipo) {
  const nombre = parametros.get(tipo.parametro);
  const detalleDuracion = duracion ? ` (${duracion})` : "";

  const grupoActividad = document.getElementById("grupoActividad");
  const campoActividad = document.getElementById("actividad");
  const mensaje = document.getElementById("mensaje");
  const titulo = document.getElementById("contactoAsuntoTitulo");
  const intro = document.getElementById("contactoIntro");

  grupoActividad.hidden = false;
  campoActividad.value = `${nombre}${detalleDuracion}`;

  mensaje.value = `Hola, quiero ${tipo.accion} "${nombre}"${detalleDuracion}. Quedo atento/a a los próximos pasos.`;

  titulo.textContent = tipo.titulo;
  intro.textContent = `Estás por consultar sobre: ${nombre}. Completá tus datos y te contactamos para coordinar.`;
}

document.getElementById("form-contacto").addEventListener("submit", function (evento) {
  evento.preventDefault();
  alert("¡Gracias! Tu consulta fue enviada, te vamos a contactar a la brevedad.");
  window.location.href = "index.html";
});
