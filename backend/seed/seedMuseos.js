require("dotenv").config();
const mongoose = require("mongoose");
const Museo = require("../models/Museo");
const Taller = require("../models/Taller");
const Charla = require("../models/Charla");
const Recorrido = require("../models/Recorrido");
const { asignarSedes } = require("./asignarSedes");
const TRADUCCIONES = require("./traducciones");

// Los 9 espacios del Museo de Colonia. Datos tomados de museoscolonia.com.uy.
// Si cambia un horario o una dirección, se corrige acá y se vuelve a correr `npm run museos`.
//
// OJO con lat/lng: están contrastadas con varias fuentes, pero las marcadas "aprox."
// conviene afinarlas desde el panel de administración (el selector de ubicación del mapa).
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
  },
  {
    nombre: "Vivienda Portuguesa",
    tipo: "Vivienda colonial",
    direccion: "Calle del Comercio 67",
    horario: "Miércoles a lunes · 11:30 a 16:30",
    descripcionCorta: "Casa que aparece por primera vez en planos de 1732, con techo de tejas a dos aguas y paredes de piedra y parte del piso originales. Sus ambientes muestran la vida cotidiana de una familia portuguesa del siglo XVIII y los usos folclóricos de Trás-os-Montes, Minho y Alentejo. Antes se la conocía como Museo Casa de Nacarello.",
    lat: -34.47228, // aprox.: pegada al Rebuffo, sobre la misma calle
    lng: -57.85268,
    imagen: "img/vivienda-portuguesa.webp",
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
  },
  {
    nombre: "Espacio del Telégrafo",
    tipo: "Ciencia y tecnología",
    direccion: "Calle del Colegio 53",
    horario: "Lunes, martes, jueves, viernes y sábado · 11:30 a 16:30",
    descripcionCorta: "Cuenta la historia de la telegrafía en el Río de la Plata a partir de piezas reunidas por Gustavo Coll, y el papel de Colonia en ella: desde la instalación de la River Plate Company en 1866, y su compra por la Western Telegraph en 1874, hasta el cable submarino que comunicó de forma inmediata a Uruguay y Argentina.",
    lat: -34.47196, // aprox.: sobre Del Colegio, cerca del Espacio Indígena
    lng: -57.85337,
    imagen: "img/espacio-telegrafo.webp",
  },
  {
    nombre: "Espacio Indígena",
    tipo: "Arqueológico",
    direccion: "Av. General Flores 52",
    horario: "Martes a jueves, sábado y domingo · 11:30 a 16:30",
    descripcionCorta: "Sumerge al visitante en la cultura indígena presente en todo el paisaje costero del departamento de Colonia. Los primeros vestigios de ocupación humana corresponden a sociedades cazadoras, recolectoras y pescadoras, pobladoras originarias de la región. La muestra invita a valorar esa cultura y a pensar la compleja convivencia entre las comunidades indígenas y la cultura europea.",
    lat: -34.47223, // aprox.: esquina de Del Colegio y Av. General Flores
    lng: -57.85337,
    imagen: "img/museo-indigena.webp",
  },
  {
    nombre: "Espacio Paleontológico",
    tipo: "Paleontológico",
    direccion: "José Roger Ballet 181 (Real de San Carlos)",
    horario: "Viernes a domingo",
    descripcionCorta: "Situado fuera del sitio Patrimonio Mundial, en el Real de San Carlos y cerca de la Plaza de Toros. Su colección reúne sobre todo fósiles de la megafauna pampeana hallados en el departamento de Colonia, además de colecciones de historia natural.",
    lat: -34.43915, // aprox.
    lng: -57.86029,
    imagen: "img/espacio-paleontologico.webp",
  },
];

const RENOMBRADOS = {
  "Museo Portugués": "Espacio Portugués",
  "Museo Español": "Espacio Español",
  "Museo Indígena": "Espacio Indígena",
  "Espacio Dr. B. Rebuffo — Museo de Colonia": "Espacio Dr. Bautista Rebuffo",
};

async function sembrarMuseos() {
  // 1) Renombrar los que ya existían con el nombre viejo
  for (const [viejo, nuevo] of Object.entries(RENOMBRADOS)) {
    if (!(await Museo.exists({ nombre: nuevo }))) {
      await Museo.updateOne({ nombre: viejo }, { $set: { nombre: nuevo } });
    }
  }

  // 2) Crear o actualizar los 9. La imagen solo se pisa si la seed trae una:
  //    si cargaste una foto desde el admin, no se borra.
  for (const m of MUSEOS) {
    const { imagen, ...datos } = m;
    const cambios = imagen ? { ...datos, imagen } : { ...datos };
    if (TRADUCCIONES.museos[m.nombre]) cambios.traducciones = TRADUCCIONES.museos[m.nombre];
    await Museo.findOneAndUpdate(
      { nombre: m.nombre },
      { $set: cambios },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  // 3) Sacar los que ya no son parte de la lista (por ejemplo, la Casa del Virrey)
  const nombres = MUSEOS.map((m) => m.nombre);
  const sobrantes = await Museo.find({ nombre: { $nin: nombres } }).select("_id nombre");
  const ids = sobrantes.map((s) => s._id);
  if (ids.length) {
    // Las actividades que estaban en esos museos quedan sin sede y se reasignan en el paso 4
    for (const Modelo of [Taller, Charla, Recorrido]) {
      await Modelo.updateMany({ museo: { $in: ids } }, { $set: { museo: null } });
    }
    await Museo.deleteMany({ _id: { $in: ids } });
  }

  // 4) Asignar sede a las actividades de ejemplo (según seed/sedes.js)
  const ubicadas = await asignarSedes({ forzar: true });

  return { museos: MUSEOS.length, eliminados: sobrantes.map((s) => s.nombre), ubicadas };
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
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
