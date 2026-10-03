require("dotenv").config();
const mongoose = require("mongoose");
const Taller = require("../models/Taller");
const Charla = require("../models/Charla");
const Recorrido = require("../models/Recorrido");
const Recurso = require("../models/Recurso");
const Inscripcion = require("../models/Inscripcion");
const { talleres, charlas, recorridos, recursos } = require("./datos");

async function cargar(Modelo, datos, nombre) {
  await Modelo.deleteMany({});
  await Modelo.insertMany(datos);
  console.log(`${nombre}: ${datos.length} cargados`);
}

async function sembrar() {
  await mongoose.connect(process.env.MONGODB_URI);
  await cargar(Taller, talleres, "Talleres");
  await cargar(Charla, charlas, "Charlas");
  await cargar(Recorrido, recorridos, "Recorridos");
  await cargar(Recurso, recursos, "Recursos");
  await Inscripcion.deleteMany({});
  await mongoose.disconnect();
}

sembrar().catch((error) => {
  console.error(error);
  process.exit(1);
});