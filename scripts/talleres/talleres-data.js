const TALLERES_KEY = 'nodo_cultural_arte_y_taller';

const talleresIniciales = [
  {
    id: 1,
    titulo: "Taller de teatro comunitario",
    tipo: "Todo público",
    modalidad: "Presencial",
    cantClases: "8",
    imagen: "img/teatro.jpg",
    descripcionCorta: "Ejercicios de expresión, improvisación y armado de una muestra final abierta al público."
  },
  {
    id: 2,
    titulo: "Taller de fotografía patrimonial",
    tipo: "Iniciación",
    modalidad: "Presencial",
    cantClases: "4",
    imagen: "img/camara.jpg",
    descripcionCorta: "Aprendé a fotografiar el Barrio Histórico con técnicas básicas de composición."
  },
  {
    id: 3,
    titulo: "Curso de guía turístico local",
    tipo: "Todo público",
    modalidad: "Presencial",
    cantClases: "6",
    imagen: "img/tour.jpg",
    descripcionCorta: "Formación básica para quienes quieran guiar recorridos por Colonia."
  },
  {
    id: 4,
    titulo: "Historia del Barrio Histórico",
    tipo: "Online",
    modalidad: "Online",
    cantClases: "3",
    imagen: "img/barrio_historico.jpg",
    descripcionCorta: "Un recorrido audiovisual por los orígenes coloniales de la ciudad."
  },
  {
    id: 5,
    titulo: "Dibujo y acuarela al aire libre",
    tipo: "Iniciación",
    modalidad: "Presencial",
    cantClases: "5",
    imagen: "img/dibujo.jpg",
    descripcionCorta: "Salidas por la rambla y las calles empedradas para dibujar el paisaje de la ciudad."
  },
  {
    id: 6,
    titulo: "Introducción a la fotografía con celular",
    tipo: "Online",
    modalidad: "Online",
    cantClases: "3",
    imagen: "img/celular.jpg",
    descripcionCorta: "Encuadre, luz y edición básica para sacar mejores fotos con lo que ya tenés en el bolsillo."
  }
];

function obtenerTalleres() {
  let talleres = leerDeStorage(TALLERES_KEY, null);

  if (talleres === null) {
    talleres = talleresIniciales;
    guardarEnStorage(TALLERES_KEY, talleres);
  }

  return talleres;
}

// Guarda el array completo de talleres
function guardarTalleres(talleres) {
  guardarEnStorage(TALLERES_KEY, talleres);
}

// Devuelve un taller por id
function obtenerTallerPorId(id) {
  const talleres = obtenerTalleres();

  for (let i = 0; i < talleres.length; i++) {
    if (talleres[i].id === Number(id)) {
      return talleres[i];
    }
  }

  return null;
}

// Agrega un taller nuevo
function agregarTaller(taller) {
  const talleres = obtenerTalleres();

  taller.id = Date.now();

  talleres.push(taller);

  guardarTalleres(talleres);
}

// Elimina un taller por id
function eliminarTaller(id) {
  const talleres = obtenerTalleres();
  const restantes = [];

  for (let i = 0; i < talleres.length; i++) {
    if (talleres[i].id !== Number(id)) {
      restantes.push(talleres[i]);
    }
  }

  guardarTalleres(restantes);
}