require("dotenv").config();
const mongoose = require("mongoose");
const Taller = require("../models/Taller");
const Charla = require("../models/Charla");
const Recorrido = require("../models/Recorrido");
const Recurso = require("../models/Recurso");
const Inscripcion = require("../models/Inscripcion");
const { talleres, charlas, recorridos, recursos } = require("./datos");
const Museo = require("../models/Museo");
const SEDES = require("./sedes");
const { sembrarMuseos } = require("./seedMuseos");

async function cargar(Modelo, datos, nombre) {
  await Modelo.deleteMany({});
  await Modelo.insertMany(datos);
  console.log(`${nombre}: ${datos.length} cargados`);
}

async function conSede(lista, sedes) {
  const museos = await Museo.find();
  const idPorNombre = new Map(museos.map((m) => [m.nombre, m._id]));
  return lista.map((item) => {
    const nombre = sedes[item.titulo];
    return nombre && idPorNombre.has(nombre) ? { ...item, museo: idPorNombre.get(nombre) } : item;
  });
}

async function sembrar() {
  await mongoose.connect(process.env.MONGODB_URI);
  const m = await sembrarMuseos(); // primero los museos, para poder asignarles sede a las actividades
  console.log(`Museos: ${m.museos} cargados`);
  await cargar(Taller, await conSede(talleres, SEDES.talleres), "Talleres");
  await cargar(Charla, await conSede(charlas, SEDES.charlas), "Charlas");
  await cargar(Recorrido, await conSede(recorridos, SEDES.recorridos), "Recorridos");
  await cargar(Recurso, recursos, "Recursos");
  await Inscripcion.deleteMany({});
  await mongoose.disconnect();
}

sembrar().catch((error) => {
  console.error(error);
  process.exit(1);
});