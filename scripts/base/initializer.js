const talleresIniciales = [
  {
    id: 1,
    titulo: "Taller de teatro comunitario",
    tipo: "Todo público",
    modalidad: "Presencial",
    cantClases: "8",
    cupos: 25,
    imagen: "img/teatro.webp",
    descripcionCorta: "Ejercicios de expresión, improvisación y armado de una muestra final abierta al público."
  },
  {
    id: 2,
    titulo: "Taller de fotografía patrimonial",
    tipo: "Iniciación",
    modalidad: "Presencial",
    cantClases: "4",
    cupos: 10,
    imagen: "img/camara.webp",
    descripcionCorta: "Aprendé a fotografiar el Barrio Histórico con técnicas básicas de composición."
  },
  {
    id: 3,
    titulo: "Curso de guía turístico local",
    nivel: "Todo público",
    modalidad: "Presencial",
    cantClases: "6",
    cupos: 15,
    imagen: "img/tour.webp",
    descripcionCorta: "Formación básica para quienes quieran guiar recorridos por Colonia."
  },
  {
    id: 4,
    titulo: "Historia del Barrio Histórico",
    nivel: "Avanzado",
    modalidad: "Online",
    cantClases: "3",
    cupos: 5,
    imagen: "img/barrio_historico.webp",
    descripcionCorta: "Un recorrido audiovisual por los orígenes coloniales de la ciudad."
  },
  {
    id: 5,
    titulo: "Dibujo y acuarela al aire libre",
    nivel: "Iniciación",
    modalidad: "Presencial",
    cantClases: "5",
    cupos: 10,
    imagen: "img/dibujo.webp",
    descripcionCorta: "Salidas por la rambla y las calles empedradas para dibujar el paisaje de la ciudad."
  },
  {
    id: 6,
    titulo: "Introducción a la fotografía con celular",
    nivel: "Iniciación",
    modalidad: "Online",
    cantClases: "3",
    cupos: 20,
    imagen: "img/celular.webp",
    descripcionCorta: "Encuadre, luz y edición básica para sacar mejores fotos con lo que ya tenés en el bolsillo."
  }
];

const charlasIniciales = [
  {
    id: 1,
    titulo: "Historia del Barrio Histórico",
    fecha: "2026-08-15",
    hora: "18:00",
    lugar: "Museo Portugués",
    tipo: "Virtual",
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
    tipo: "Online",
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
    tipo: "Virtual",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn26_zE0arnwA9Dp4VefYwmI4_pulD9hjk9AyUVRcSMB76-veg-nk5OA8R&s=10",
    expositor: "Panel de referentes locales",
    descripcionCompleta: "Conversamos con referentes de distintos museos y espacios culturales de la zona sobre los desafíos y proyectos futuros para la difusión del patrimonio local.",
    descripcionCorta: "Conversamos con referentes de museos y espacios culturales de la zona.",
    cupos: 50
  }
];

const recorridosIniciales = [
  {
    id: 1,
    titulo: "Barrio Histórico a pie",
    tipo: "Clásico",
    duracion: "1h 30min",
    imagen: "img/recorrido-barrio-historico.webp",
    puntoSalida: "Plaza 25 de Mayo",
    descripcionCorta: "Recorrido por las calles empedradas, el Faro, la Calle de los Suspiros y las murallas, con historias de la fundación portuguesa y la toma española."
  },
  {
    id: 2,
    titulo: "Colonia en bicicleta",
    tipo: "Activo",
    duracion: "2h 30min",
    imagen: "img/colonia-bicicleta.webp",
    puntoSalida: "Bici incluida",
    descripcionCorta: "Recorrido por el Barrio Histórico, la Rambla y el Real de San Carlos, con paradas para sacar fotos y conocer historias locales."
  },
  {
    id: 3,
    titulo: "Colonia al atardecer",
    tipo: "Romántico",
    duracion: "1h",
    imagen: "img/colonia-atardecer.webp",
    puntoSalida: "Ideal para fotos",
    descripcionCorta: "Recorrido fotográfico por el Barrio Histórico durante la puesta de sol, pensado para disfrutar del paisaje y sacar fotografías."
  },
  {
    id: 4,
    titulo: "Recorrido gastronómico",
    tipo: "Sabores",
    duracion: "2h",
    imagen: "img/recorrido-gastronomico.webp",
    puntoSalida: "Degustación incluida",
    descripcionCorta: "Recorrido por bares, panaderías y almacenes tradicionales del Barrio Histórico, con degustaciones e historias de familias locales."
  },
  {
    id: 5,
    titulo: "Paseo en carruaje",
    tipo: "Tradicional",
    duracion: "40 min",
    imagen: "img/paseo-carruaje.webp",
    puntoSalida: "Portón de Campo",
    descripcionCorta: "Paseo en carruaje por el Barrio Histórico mientras el guía cuenta la historia de sus calles y rincones."
  },
  {
    id: 6,
    titulo: "Leyendas de noche",
    tipo: "Nocturno",
    duracion: "1h 15min",
    imagen: "img/leyendas-noche.webp",
    puntoSalida: "Sale al atardecer",
    descripcionCorta: "Recorrido nocturno por el Barrio Histórico con historias, leyendas y personajes transmitidos de generación en generación."
  }
];

const recursosIniciales = [
  {
    id: 1,
    titulo: "Fundación de Colonia del Sacramento (1680)",
    categoria: "Fundación, murallas y ciudad",
    descripcion: "La fundación de la ciudad y los vínculos atlánticos y regionales que la rodearon.",
    fuente: "Estampas Colonienses, enero 2006",
    paginas: 5,
    archivo: "recursos/Fundacion_de_Colonia_del_Sacramento_1680.pdf"
  },
  {
    id: 2,
    titulo: "Las murallas de Colonia",
    categoria: "Fundación, murallas y ciudad",
    descripcion: "Las murallas leídas a través del informe histórico de 1854, que inaugura la producción histórica local.",
    fuente: "Sebastián Rivero Scirgalea, 2008",
    paginas: 5,
    archivo: "recursos/Las_murallas_de_Colonia.pdf"
  },
  {
    id: 3,
    titulo: "Desarrollo urbano de Colonia del Sacramento",
    categoria: "Fundación, murallas y ciudad",
    descripcion: "Las murallas y la ciudad: historias del adentro y del afuera.",
    fuente: "Sebastián Rivero Scirgalea, 2009",
    paginas: 7,
    archivo: "recursos/Desarrollo_urbano_de_Colonia_del_Sacramento.pdf"
  },
  {
    id: 4,
    titulo: "Estación de trenes - Colonia",
    categoria: "Patrimonio y cultura local",
    descripcion: "Síntesis histórica de la estación, punto de unión de la ciudad con el afuera.",
    fuente: "Sebastián Rivero Scirgalea",
    paginas: 16,
    archivo: "recursos/Estacion_de_trenes_Colonia.pdf"
  },
  {
    id: 5,
    titulo: "Imagen del Real de San Carlos y el complejo Mihanovich",
    categoria: "Patrimonio y cultura local",
    descripcion: "Un repaso por la bibliografía y la imagen del Real de San Carlos y su complejo turístico.",
    fuente: "Sebastián Rivero Scirgalea",
    paginas: 15,
    archivo: "recursos/Imagen_del_Real_de_San_Carlos.pdf"
  },
  {
    id: 6,
    titulo: "Cultura de Colonia",
    categoria: "Patrimonio y cultura local",
    descripcion: "Una visión de la cultura coloniense desde los «márgenes».",
    fuente: "Sebastián Rivero, abril 2005",
    paginas: 2,
    archivo: "recursos/Cultura_de_Colonia.pdf"
  }
];