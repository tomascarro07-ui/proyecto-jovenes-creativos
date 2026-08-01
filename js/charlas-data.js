const CHARLAS_KEY = 'nodo_cultural_charlas';

// Datos iniciales (se cargan la primera vez, si no hay nada en localStorage)
const charlasIniciales = [
  {
    id: 1,
    titulo: "Historia del Barrio Histórico",
    fecha: "2026-08-15",
    hora: "18:00",
    lugar: "Museo Portugués",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfoBbK82PSc_uJJfYWg-a3przQQ32s3slujawZA48G98kGAAkeDVL01SzB&s=10",
    expositor: "Lic. María Fernández",
    descripcionCorta: "Un recorrido por la historia y el patrimonio cultural del departamento.",
    descripcionCompleta: "Esta charla propone un recorrido detallado por los orígenes del Barrio Histórico de Colonia del Sacramento, desde su fundación portuguesa hasta la actualidad. Se abordarán las principales edificaciones, su valor patrimonial y las historias que dieron forma a la identidad cultural de la ciudad.",
    cupos: 40
  },
  {
    id: 2,
    titulo: "Turismo sostenible en Colonia",
    fecha: "2026-08-22",
    hora: "19:00",
    lugar: "Centro Cultural Bastión del Carmen",
    imagen: "https://santacatalinacem.com/wp-content/uploads/2024/07/fotoweb-scaled.jpg",
    expositor: "Ing. Javier Rodríguez",
    descripcionCorta: "Charla abierta sobre turismo sostenible y organizaciones locales.",
    descripcionCompleta: "Un espacio de debate sobre cómo desarrollar un turismo responsable en Colonia del Sacramento, con foco en la sostenibilidad ambiental, el cuidado del patrimonio y el trabajo conjunto con organizaciones locales.",
    cupos: 35
  },
  {
    id: 3,
    titulo: "Referentes de museos y espacios culturales",
    fecha: "2026-08-29",
    hora: "18:30",
    lugar: "Museo Municipal",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn26_zE0arnwA9Dp4VefYwmI4_pulD9hjk9AyUVRcSMB76-veg-nk5OA8R&s=10",
    expositor: "Panel de referentes locales",
    descripcionCompleta: "Conversamos con referentes de distintos museos y espacios culturales de la zona sobre los desafíos y proyectos futuros para la difusión del patrimonio local.",
    descripcionCorta: "Conversamos con referentes de museos y espacios culturales de la zona.",
    cupos: 50
  }
];

// Inicializa el localStorage con datos de ejemplo si está vacío
function inicializarCharlas() {
  const data = localStorage.getItem(CHARLAS_KEY);
  if (!data) {
    localStorage.setItem(CHARLAS_KEY, JSON.stringify(charlasIniciales));
  }
}

// Devuelve todas las charlas
function obtenerCharlas() {
  inicializarCharlas();
  return JSON.parse(localStorage.getItem(CHARLAS_KEY));
}

// Devuelve una charla por ID
function obtenerCharlaPorId(id) {
  const charlas = obtenerCharlas();
  return charlas.find(c => c.id === parseInt(id));
}

// Guarda el array completo de charlas
function guardarCharlas(charlas) {
  localStorage.setItem(CHARLAS_KEY, JSON.stringify(charlas));
}

// Agrega una nueva charla
function agregarCharla(charla) {
  const charlas = obtenerCharlas();
  const nuevoId = charlas.length > 0 ? Math.max(...charlas.map(c => c.id)) + 1 : 1;
  charla.id = nuevoId;
  charlas.push(charla);
  guardarCharlas(charlas);
}

// Elimina una charla por ID
function eliminarCharla(id) {
  let charlas = obtenerCharlas();
  charlas = charlas.filter(c => c.id !== parseInt(id));
  guardarCharlas(charlas);
}

// Formatea fecha "2026-08-15" -> "15 Ago"
function formatearFechaCorta(fechaStr) {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const [anio, mes, dia] = fechaStr.split('-');
  return `${dia} ${meses[parseInt(mes) - 1]}`;
}

// Formatea fecha "2026-08-15" -> "15 de agosto, 2026"
function formatearFechaLarga(fechaStr) {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const [anio, mes, dia] = fechaStr.split('-');
  return `${dia} de ${meses[parseInt(mes) - 1]}, ${anio}`;
}
