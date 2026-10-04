require("dotenv").config();
const mongoose = require("mongoose");
const Museo = require("../models/Museo");

const museos = [
  {
    nombre: "Museo Municipal — Casa del Virrey",
    tipo: "Colonial",
    direccion: "Barrio Histórico",
    descripcionCorta: "Reúne objetos y piezas que reconstruyen la vida cotidiana de Colonia durante el período colonial: mobiliario, utensilios y hallazgos que muestran cómo se vivía dentro de las murallas.",
    lat: -34.472171,
    lng: -57.85503,
    imagen: "img/museo-casa-del-virrey.webp"
  },
  {
    nombre: "Museo Español",
    tipo: "Hispánico",
    direccion: "Barrio Histórico",
    descripcionCorta: "Instalado en una antigua casa portuguesa reutilizada tras la toma española, exhibe la cultura y la vida material del período hispánico en la ciudad.",
    lat: -34.469923,
    lng: -57.856313,
    imagen: "img/museo-espanol.webp"
  },
  {
    nombre: "Museo Indígena",
    tipo: "Arqueológico",
    direccion: "Barrio Histórico",
    descripcionCorta: "Piezas arqueológicas y objetos vinculados a los pueblos originarios que habitaron la región mucho antes de la llegada de portugueses y españoles.",
    lat: -34.470894,
    lng: -57.854767,
    imagen: "img/museo-indigena.webp"
  },
  {
    nombre: "Museo Portugués",
    tipo: "Histórico",
    direccion: "Barrio Histórico",
    descripcionCorta: "Documenta específicamente la etapa de ocupación portuguesa de la ciudad, con piezas y relatos centrados en ese tramo del dominio colonial.",
    lat: -34.472793,
    lng: -57.854541,
    imagen: "img/museo-portugues.webp"
  },
  {
    nombre: "Espacio Paleontológico",
    tipo: "Paleontológico",
    direccion: "Colonia del Sacramento",
    descripcionCorta: "Exhibe fósiles de la megafauna de la región, como gliptodontes, perezosos gigantes y mastodontes, además de piezas geológicas y arqueológicas.",
    lat: -34.439038,
    lng: -57.861668,
    imagen: "img/espacio-paleontologico.webp"
  },
  {
    nombre: "Espacio Dr. B. Rebuffo — Museo de Colonia",
    tipo: "Histórico",
    direccion: "Barrio Histórico",
    descripcionCorta: "Estructura portuguesa del siglo XVIII, primer museo de la ciudad. Sus exhibiciones recorren la comunidad desde tiempos prehistóricos hasta la actualidad.",
    lat: -34.4727,
    lng: -57.8523,
    imagen: "img/museo-rebuffo.webp"
  }
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const m of museos) {
    const { imagen, ...resto } = m;

    await Museo.findOneAndUpdate(
      { nombre: m.nombre },
      { $setOnInsert: resto, $set: { imagen } },
      { upsert: true }
    );
  }

  console.log(`Museos listos: ${museos.length}`);

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});