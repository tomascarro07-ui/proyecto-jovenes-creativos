require("dotenv").config();
const mongoose = require("mongoose");
const Museo = require("../models/Museo");
const Taller = require("../models/Taller");
const Charla = require("../models/Charla");
const Recorrido = require("../models/Recorrido");
const { asignarSedes } = require("./asignarSedes");
const TRADUCCIONES = require("./traducciones");

const MUSEOS = [
  {
    nombre: "Espacio Dr. Bautista Rebuffo",
    tipo: "Histórico",
    direccion: "Calle del Comercio 77",
    horario: "Martes a domingo · 11:30 a 16:30",
    descripcionCorta: "Espacio central del Museo de Colonia y el primero en abrir sus puertas, en 1951. Lleva el nombre de su fundador. Funciona en una construcción portuguesa de la primera mitad del siglo XVIII, modificada en el período español. Su exhibición recorre el entorno desde tiempos prehistóricos hasta hoy, con objetos heredados, hallados o usados por antepasados de la propia comunidad.",
    lat: -34.47224,
    lng: -57.85247,
    imagen: "img/museo-rebuffo.webp",
    gancho: "El primero en abrir sus puertas, en 1951",
    datoCurioso: "Fue el primer espacio del Museo de Colonia en abrir sus puertas, en 1951, y lleva el nombre de su fundador.",
    destacados: [
      { titulo: "Desde la prehistoria hasta hoy", texto: "La exhibición recorre el entorno a lo largo del tiempo." },
      { titulo: "Objetos de la comunidad", texto: "Piezas heredadas, halladas o usadas por antepasados de la propia comunidad." },
      { titulo: "Un edificio con historia", texto: "Construcción portuguesa de la primera mitad del siglo XVIII, modificada en el período español." },
    ],
  },
  {
    nombre: "Vivienda Portuguesa",
    tipo: "Vivienda colonial",
    direccion: "Calle del Comercio 67",
    horario: "Miércoles a lunes · 11:30 a 16:30",
    descripcionCorta: "Casa que aparece por primera vez en planos de 1732, con techo de tejas a dos aguas y paredes de piedra y parte del piso originales. Sus ambientes muestran la vida cotidiana de una familia portuguesa del siglo XVIII y los usos folclóricos de Trás-os-Montes, Minho y Alentejo. Antes se la conocía como Museo Casa de Nacarello.",
    lat: -34.47228,
    lng: -57.85268,
    imagen: "img/vivienda-portuguesa.webp",
    gancho: "Una casa que figura en planos desde 1732",
    datoCurioso: "La casa aparece por primera vez en planos de 1732 y conserva parte de las paredes de piedra y del piso originales.",
  },
  {
    nombre: "Espacio Portugués",
    tipo: "Histórico",
    direccion: "Enríquez de la Peña 180 (Plaza Mayor)",
    horario: "11:30 a 16:30 · consultá los días de apertura",
    descripcionCorta: "Instalado en una casa portuguesa del siglo XVIII junto a la Plaza Mayor, repasa los períodos en que Colonia estuvo bajo la corona de Portugal, entre 1680 y 1777. Reúne mobiliario, cartografía y objetos de la época, y cuenta las disputas entre las coronas portuguesa y española por el control de la ciudad.",
    lat: -34.47257,
    lng: -57.85133,
    imagen: "img/museo-portugues.webp",
    gancho: "Colonia bajo la corona de Portugal, 1680–1777",
  },
  {
    nombre: "Espacio Español",
    tipo: "Histórico",
    direccion: "Calle de San José 156",
    horario: "Jueves a domingo · 11:30 a 16:30",
    descripcionCorta: "Desarrolla el período español, desde el final de la ocupación portuguesa hasta los inicios de la Revolución Oriental y el joven siglo XIX, cuando la ciudad dejó atrás la colonia militar y vivió una cotidianidad de paz. El recorrido abarca dos casas portuguesas del siglo XVIII y muestra el modo de vida, los orígenes y los oficios de los primeros pobladores españoles.",
    lat: -34.46992,
    lng: -57.85155,
    imagen: "img/museo-espanol.webp",
    gancho: "De colonia militar a vida cotidiana en paz",
  },
  {
    nombre: "Archivo Histórico Regional",
    tipo: "Archivo",
    direccion: "Misiones de los Tapes 115",
    horario: "Lunes a viernes · 11:30 a 16:30",
    descripcionCorta: "Reservorio documental creado en 1972 para reunir los fondos de las distintas naciones y archivos que guardan la fragmentada historia de la ciudad. Alberga el Espacio Memoria y Sitio, sobre los procesos de cambio de Colonia hasta que el Barrio Histórico fue declarado Patrimonio Mundial por la Unesco, con la voz de la población del Barrio Sur.",
    lat: -34.47182,
    lng: -57.85219,
    imagen: "img/archivo-historico.webp",
    gancho: "La memoria documental de la ciudad, desde 1972",
    datoCurioso: "Se creó en 1972 para reunir los fondos de las distintas naciones y archivos que guardan la historia fragmentada de la ciudad.",
  },
  {
    nombre: "Espacio del Azulejo",
    tipo: "Arte y arquitectura",
    direccion: "Paseo de San Gabriel 104",
    horario: "Cerrado temporalmente",
    descripcionCorta: "Reúne elementos característicos de la arquitectura local, sus usos y sus técnicas, con el azulejo como adorno típico. El azulejo, sobre todo francés, llegó a la arquitectura rioplatense en el siglo XIX, ya después de la colonia portuguesa. El edificio, casi totalmente reconstruido, conserva rasgos portugueses como el techo a dos aguas con tejas, las paredes de piedra y el tirante central.",
    lat: -34.47082,
    lng: -57.85262,
    imagen: "img/espacio-azulejo.webp",
    gancho: "El azulejo francés llegó en el siglo XIX",
  },
  {
    nombre: "Espacio del Telégrafo",
    tipo: "Ciencia y tecnología",
    direccion: "Calle del Colegio 53",
    horario: "Lunes, martes, jueves, viernes y sábado · 11:30 a 16:30",
    descripcionCorta: "Cuenta la historia de la telegrafía en el Río de la Plata a partir de piezas reunidas por Gustavo Coll, y el papel de Colonia en ella: desde la instalación de la River Plate Company en 1866, y su compra por la Western Telegraph en 1874, hasta el cable submarino que comunicó de forma inmediata a Uruguay y Argentina.",
    lat: -34.47196,
    lng: -57.85337,
    imagen: "img/espacio-telegrafo.webp",
    gancho: "Del primer telégrafo al cable submarino",
    datoCurioso: "Gran parte de las piezas fueron reunidas por Gustavo Coll.",
  },
  {
    nombre: "Espacio Indígena",
    tipo: "Arqueológico",
    direccion: "Av. General Flores 52",
    horario: "Martes a jueves, sábado y domingo · 11:30 a 16:30",
    descripcionCorta: "Sumerge al visitante en la cultura indígena presente en todo el paisaje costero del departamento de Colonia. Los primeros vestigios de ocupación humana corresponden a sociedades cazadoras, recolectoras y pescadoras, pobladoras originarias de la región. La muestra invita a valorar esa cultura y a pensar la compleja convivencia entre las comunidades indígenas y la cultura europea.",
    lat: -34.47223,
    lng: -57.85337,
    imagen: "img/museo-indigena.webp",
    gancho: "Los primeros pobladores de la costa",
  },
  {
    nombre: "Espacio Paleontológico",
    tipo: "Paleontológico",
    direccion: "José Roger Ballet 181 (Real de San Carlos)",
    horario: "Viernes a domingo",
    descripcionCorta: "Situado fuera del sitio Patrimonio Mundial, en el Real de San Carlos y cerca de la Plaza de Toros. Su colección reúne sobre todo fósiles de la megafauna pampeana hallados en el departamento de Colonia, además de colecciones de historia natural.",
    lat: -34.43915,
    lng: -57.86029,
    imagen: "img/espacio-paleontologico.webp",
    gancho: "Fósiles de la megafauna pampeana",
  },
];

const RENOMBRADOS = {
  "Museo Portugués": "Espacio Portugués",
  "Museo Español": "Espacio Español",
  "Museo Indígena": "Espacio Indígena",
  "Espacio Dr. B. Rebuffo — Museo de Colonia": "Espacio Dr. Bautista Rebuffo",
};

async function sembrarMuseos() {
  for (const [viejo, nuevo] of Object.entries(RENOMBRADOS)) {
    if (!(await Museo.exists({ nombre: nuevo }))) {
      await Museo.updateOne({ nombre: viejo }, { $set: { nombre: nuevo } });
    }
  }

  for (const museo of MUSEOS) {
    const { imagen, ...datos } = museo;
    const cambios = { ...datos };
    if (imagen) cambios.imagen = imagen;
    if (TRADUCCIONES.museos[museo.nombre]) cambios.traducciones = TRADUCCIONES.museos[museo.nombre];
    await Museo.findOneAndUpdate(
      { nombre: museo.nombre },
      { $set: cambios },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  const nombres = MUSEOS.map((museo) => museo.nombre);
  const sobrantes = await Museo.find({ nombre: { $nin: nombres } }).select("_id nombre");
  const ids = sobrantes.map((museo) => museo._id);
  if (ids.length) {
    for (const Modelo of [Taller, Charla, Recorrido]) {
      await Modelo.updateMany({ museo: { $in: ids } }, { $set: { museo: null } });
    }
    await Museo.deleteMany({ _id: { $in: ids } });
  }

  const ubicadas = await asignarSedes({ forzar: true });

  return { museos: MUSEOS.length, eliminados: sobrantes.map((museo) => museo.nombre), ubicadas };
}

module.exports = { sembrarMuseos, MUSEOS };

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const r = await sembrarMuseos();
    console.log(`Museos listos: ${r.museos}`);
    if (r.eliminados.length) console.log(`Eliminados: ${r.eliminados.join(", ")}`);
    for (const [etiqueta, n] of Object.entries(r.ubicadas)) console.log(`${etiqueta}: ${n} con sede asignada`);
    await mongoose.disconnect();
  })().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
