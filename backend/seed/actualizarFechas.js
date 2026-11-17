require("dotenv").config();
const mongoose = require("mongoose");
const Taller = require("../models/Taller");
const Charla = require("../models/Charla");
const Recorrido = require("../models/Recorrido");
const FECHAS = require("./fechas");

async function actualizarGrupo(Modelo, nombre, fechasPorTitulo) {
  for (const [titulo, datos] of Object.entries(fechasPorTitulo)) {
    const resultado = await Modelo.updateMany({ titulo }, { $set: datos });
    const estado = datos.finalizada ? "realizada" : "próxima";
    console.log(`${nombre} | ${titulo} -> ${datos.fecha} ${datos.hora} (${estado}) | encontrados: ${resultado.matchedCount}`);
  }
  const titulosConocidos = Object.keys(fechasPorTitulo);
  const sinFecha = await Modelo.find({ titulo: { $nin: titulosConocidos } }).select("titulo fecha");
  for (const item of sinFecha) {
    console.log(`${nombre} | SIN CAMBIOS (título no está en fechas.js): ${item.titulo} (fecha actual: ${item.fecha || "ninguna"})`);
  }
}

async function actualizar() {
  await mongoose.connect(process.env.MONGODB_URI);
  await actualizarGrupo(Charla, "Charla", FECHAS.charlas);
  await actualizarGrupo(Taller, "Taller", FECHAS.talleres);
  await actualizarGrupo(Recorrido, "Recorrido", FECHAS.recorridos);
  await mongoose.disconnect();
}

actualizar().catch((error) => {
  console.error(error);
  process.exit(1);
});
