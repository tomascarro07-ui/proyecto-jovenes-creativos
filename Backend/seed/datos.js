const talleres = [
  { titulo: "Taller de teatro comunitario", nivel: "Todo público", modalidad: "Presencial", cantClases: 8, cupos: 25, imagen: "img/teatro.webp", descripcionCorta: "Ejercicios de expresión, improvisación y armado de una muestra final abierta al público." },
  { titulo: "Taller de fotografía patrimonial", nivel: "Iniciación", modalidad: "Presencial", cantClases: 4, cupos: 10, imagen: "img/camara.webp", descripcionCorta: "Aprendé a fotografiar el Barrio Histórico con técnicas básicas de composición." },
  { titulo: "Curso de guía turístico local", nivel: "Todo público", modalidad: "Presencial", cantClases: 6, cupos: 15, imagen: "img/tour.webp", descripcionCorta: "Formación básica para quienes quieran guiar recorridos por Colonia." },
  { titulo: "Historia del Barrio Histórico", nivel: "Avanzado", modalidad: "Virtual", cantClases: 3, cupos: 5, imagen: "img/barrio_historico.webp", descripcionCorta: "Un recorrido audiovisual por los orígenes coloniales de la ciudad." },
  { titulo: "Dibujo y acuarela al aire libre", nivel: "Iniciación", modalidad: "Presencial", cantClases: 5, cupos: 10, imagen: "img/dibujo.webp", descripcionCorta: "Salidas por la rambla y las calles empedradas para dibujar el paisaje de la ciudad." },
  { titulo: "Introducción a la fotografía con celular", nivel: "Iniciación", modalidad: "Virtual", cantClases: 3, cupos: 20, imagen: "img/celular.webp", descripcionCorta: "Encuadre, luz y edición básica para sacar mejores fotos con lo que ya tenés en el bolsillo." },
];

const charlas = [
  {
    titulo: "Historia del Barrio Histórico", fecha: "2026-08-15", hora: "18:00", lugar: "Virtual", tipo: "Virtual",
    imagen: "img/historia-barrio.webp", expositor: "Lic. María Fernández",
    descripcionCorta: "Un recorrido por la historia y el patrimonio cultural del departamento.",
    descripcionCompleta: "Esta charla propone un recorrido detallado por los orígenes del Barrio Histórico de Colonia del Sacramento, desde su fundación portuguesa hasta la actualidad. Se abordarán las principales edificaciones, su valor patrimonial y las historias que dieron forma a la identidad cultural de la ciudad.",
    cupos: 40,
  },
  {
    titulo: "Turismo sostenible en Colonia", fecha: "2026-08-22", hora: "19:00", lugar: "Virtual", tipo: "Virtual",
    imagen: "img/turismo-sostenible.webp", expositor: "Ing. Javier Rodríguez",
    descripcionCorta: "Charla abierta sobre turismo sostenible y organizaciones locales.",
    descripcionCompleta: "Un espacio de debate sobre cómo desarrollar un turismo responsable en Colonia del Sacramento, con foco en la sostenibilidad ambiental, el cuidado del patrimonio y el trabajo conjunto con organizaciones locales.",
    cupos: 35,
  },
  {
    titulo: "Referentes de museos y espacios culturales", fecha: "2026-08-29", hora: "18:30", lugar: "Virtual", tipo: "Virtual",
    imagen: "img/referentes-museos.webp", expositor: "Panel de referentes locales",
    descripcionCorta: "Conversamos con referentes de museos y espacios culturales de la zona.",
    descripcionCompleta: "Conversamos con referentes de distintos museos y espacios culturales de la zona sobre los desafíos y proyectos futuros para la difusión del patrimonio local.",
    cupos: 50,
  },
];

const recorridos = [
  { titulo: "Barrio Histórico a pie", tipo: "Clásico", duracionHoras: 1, duracionMinutos: 30, imagen: "img/recorrido-barrio-historico.webp", puntoSalida: "Plaza 25 de Mayo", cupos: 5, descripcionCorta: "Recorrido por las calles empedradas, el Faro, la Calle de los Suspiros y las murallas, con historias de la fundación portuguesa y la toma española." },
  { titulo: "Colonia en bicicleta", tipo: "Activo", duracionHoras: 2, duracionMinutos: 30, imagen: "img/colonia-bicicleta.webp", puntoSalida: "Portón de Campo", cupos: 5, descripcionCorta: "Recorrido por el Barrio Histórico, la Rambla y el Real de San Carlos, con paradas para sacar fotos y conocer historias locales." },
  { titulo: "Colonia al atardecer", tipo: "Romántico", duracionHoras: 1, duracionMinutos: 0, imagen: "img/colonia-atardecer.webp", puntoSalida: "Plaza Mayor", cupos: 5, descripcionCorta: "Recorrido fotográfico por el Barrio Histórico durante la puesta de sol, pensado para disfrutar del paisaje y sacar fotografías." },
  { titulo: "Recorrido gastronómico", tipo: "Sabores", duracionHoras: 2, duracionMinutos: 0, imagen: "img/recorrido-gastronomico.webp", puntoSalida: "Plaza de Armas", cupos: 5, descripcionCorta: "Recorrido por bares, panaderías y almacenes tradicionales del Barrio Histórico, con degustaciones e historias de familias locales." },
  { titulo: "Paseo en carruaje", tipo: "Tradicional", duracionHoras: 0, duracionMinutos: 40, imagen: "img/paseo-carruaje.webp", puntoSalida: "Portón de Campo", cupos: 5, descripcionCorta: "Paseo en carruaje por el Barrio Histórico mientras el guía cuenta la historia de sus calles y rincones." },
  { titulo: "Leyendas de noche", tipo: "Nocturno", duracionHoras: 1, duracionMinutos: 45, imagen: "img/leyendas-noche.webp", puntoSalida: "Plaza Mayor", cupos: 5, descripcionCorta: "Recorrido nocturno por el Barrio Histórico con historias, leyendas y personajes transmitidos de generación en generación." },
];

const recursos = [
  { titulo: "Fundación de Colonia del Sacramento (1680)", categoria: "Fundación, murallas y ciudad", descripcion: "La fundación de la ciudad y los vínculos atlánticos y regionales que la rodearon.", fuente: "Estampas Colonienses, enero 2006", paginas: 5, archivo: "recursos/Fundacion_de_Colonia_del_Sacramento_1680.pdf" },
  { titulo: "Las murallas de Colonia", categoria: "Fundación, murallas y ciudad", descripcion: "Las murallas leídas a través del informe histórico de 1854, que inaugura la producción histórica local.", fuente: "Sebastián Rivero, 2008", paginas: 5, archivo: "recursos/Las_murallas_de_Colonia.pdf" },
  { titulo: "Desarrollo urbano de Colonia del Sacramento", categoria: "Fundación, murallas y ciudad", descripcion: "Las murallas y la ciudad: historias del adentro y del afuera.", fuente: "Sebastián Rivero, 2009", paginas: 7, archivo: "recursos/Desarrollo_urbano_de_Colonia_del_Sacramento.pdf" },
  { titulo: "Estación de trenes - Colonia", categoria: "Patrimonio y cultura local", descripcion: "Síntesis histórica de la estación, punto de unión de la ciudad con el afuera.", fuente: "Sebastián Rivero", paginas: 16, archivo: "recursos/Estacion_de_trenes_Colonia.pdf" },
  { titulo: "Imagen del Real de San Carlos y el complejo Mihanovich", categoria: "Patrimonio y cultura local", descripcion: "Un repaso por la bibliografía y la imagen del Real de San Carlos y su complejo turístico.", fuente: "Sebastián Rivero", paginas: 15, archivo: "recursos/Imagen_del_Real_de_San_Carlos.pdf" },
  { titulo: "Cultura de Colonia", categoria: "Patrimonio y cultura local", descripcion: "Una visión de la cultura coloniense desde los «márgenes».", fuente: "Sebastián Rivero, abril 2005", paginas: 2, archivo: "recursos/Cultura_de_Colonia.pdf" },
];

module.exports = { talleres, charlas, recorridos, recursos };