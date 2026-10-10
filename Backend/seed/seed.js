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
const TRADUCCIONES = require("./traducciones");

async function cargar(Modelo, datos, nombre) {
  await Modelo.deleteMany({});
  await Modelo.insertMany(datos);
  console.log(`${nombre}: ${datos.length} cargados`);
}

// Agrega los textos en inglés y portugués (seed/traducciones.js) a cada elemento, según su título
function conTraducciones(lista, traducciones) {
  return lista.map((item) => (traducciones[item.titulo] ? { ...item, traducciones: traducciones[item.titulo] } : item));
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
  await cargar(Taller, conTraducciones(await conSede(talleres, SEDES.talleres), TRADUCCIONES.talleres), "Talleres");
  await cargar(Charla, conTraducciones(await conSede(charlas, SEDES.charlas), TRADUCCIONES.charlas), "Charlas");
  await cargar(Recorrido, conTraducciones(await conSede(recorridos, SEDES.recorridos), TRADUCCIONES.recorridos), "Recorridos");
  await cargar(Recurso, conTraducciones(recursos, TRADUCCIONES.recursos), "Recursos");
  await Inscripcion.deleteMany({});
  await mongoose.disconnect();
}

sembrar().catch((error) => {
  console.error(error);
  process.exit(1);
});