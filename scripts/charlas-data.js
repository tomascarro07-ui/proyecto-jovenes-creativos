const CHARLAS_KEY = leerDeStorage('nodo_cultural_charlas',[]);

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

function obtenerCharlas() {
  let charlas = leerDeStorage(CHARLAS_KEY, null);

  if (charlas === null) {
    charlas = charlasIniciales;
    guardarEnStorage(CHARLAS_KEY, charlas);
  }

  return charlas;
}

// Guarda el array completo de charlas
function guardarCharlas(charlas) {
  guardarEnStorage(CHARLAS_KEY, charlas);
}

// Devuelve una charla por id (o null si no existe)
function obtenerCharlaPorId(id) {
  const charlas = obtenerCharlas();

  for (let i = 0; i < charlas.length; i++) {
    if (charlas[i].id === Number(id)) {
      return charlas[i];
    }
  }

  return null;
}

// Agrega una charla nueva
function agregarCharla(charla) {
  const charlas = obtenerCharlas();

  charla.id = Date.now();
  charlas.push(charla);

  guardarCharlas(charlas);
}

// Elimina una charla por id
function eliminarCharla(id) {
  const charlas = obtenerCharlas();
  const restantes = [];

  for (let i = 0; i < charlas.length; i++) {
    if (charlas[i].id !== Number(id)) {
      restantes.push(charlas[i]);
    }
  }

  guardarCharlas(restantes);
}