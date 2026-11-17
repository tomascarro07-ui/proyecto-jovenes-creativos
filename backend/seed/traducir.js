require("dotenv").config();
const mongoose = require("mongoose");
const Taller = require("../models/Taller");
const Charla = require("../models/Charla");
const Recorrido = require("../models/Recorrido");
const Recurso = require("../models/Recurso");
const Museo = require("../models/Museo");
const TRADUCCIONES = require("./traducciones");

const COLECCIONES = [
  { etiqueta: "Talleres", Modelo: Taller, clave: "titulo", datos: TRADUCCIONES.talleres },
  { etiqueta: "Charlas", Modelo: Charla, clave: "titulo", datos: TRADUCCIONES.charlas },
  { etiqueta: "Recorridos", Modelo: Recorrido, clave: "titulo", datos: TRADUCCIONES.recorridos },
  { etiqueta: "Recursos", Modelo: Recurso, clave: "titulo", datos: TRADUCCIONES.recursos },
  { etiqueta: "Museos", Modelo: Museo, clave: "nombre", datos: TRADUCCIONES.museos },
];

async function traducir() {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const { etiqueta, Modelo, clave, datos } of COLECCIONES) {
    let hechos = 0;
    const sinTraducir = [];
    for (const [titulo, traducciones] of Object.entries(datos)) {
      const resultado = await Modelo.updateMany({ [clave]: titulo }, { $set: { traducciones } });
      if (resultado.matchedCount > 0) hechos += resultado.matchedCount;
      else sinTraducir.push(titulo);
    }
    let aviso = "";
    if (sinTraducir.length > 0) aviso = ` (no están en la base: ${sinTraducir.join(", ")})`;
    console.log(`${etiqueta}: ${hechos} con traducciones${aviso}`);
  }
  await mongoose.disconnect();
}

traducir().catch((error) => {
  console.error(error);
  process.exit(1);
});
