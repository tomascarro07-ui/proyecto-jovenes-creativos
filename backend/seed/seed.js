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
const FECHAS = require("./fechas");

async function cargar(Modelo, datos, nombre) {
  await Modelo.deleteMany({});
  await Modelo.insertMany(datos);
  console.log(`${nombre}: ${datos.length} cargados`);
}

function conFechas(lista, fechasPorTitulo) {
  return lista.map((item) => ({ ...item, ...fechasPorTitulo[item.titulo] }));
}

function conTraducciones(lista, traducciones) {
  return lista.map((item) => {
    const traduccionesDelItem = traducciones[item.titulo];
    if (!traduccionesDelItem) return item;
    return { ...item, traducciones: traduccionesDelItem };
  });
}

async function conSede(lista, sedes) {
  const museos = await Museo.find();
  const idPorNombre = new Map(museos.map((museo) => [museo.nombre, museo._id]));
  return lista.map((item) => {
    const nombre = sedes[item.titulo];
    if (nombre && idPorNombre.has(nombre)) return { ...item, museo: idPorNombre.get(nombre) };
    return item;
  });
}

async function sembrar() {
  await mongoose.connect(process.env.MONGODB_URI);
  const m = await sembrarMuseos();
  console.log(`Museos: ${m.museos} cargados`);
  await cargar(Taller, conTraducciones(conFechas(await conSede(talleres, SEDES.talleres), FECHAS.talleres), TRADUCCIONES.talleres), "Talleres");
  await cargar(Charla, conTraducciones(conFechas(await conSede(charlas, SEDES.charlas), FECHAS.charlas), TRADUCCIONES.charlas), "Charlas");
  await cargar(Recorrido, conTraducciones(conFechas(await conSede(recorridos, SEDES.recorridos), FECHAS.recorridos), TRADUCCIONES.recorridos), "Recorridos");
  await cargar(Recurso, conTraducciones(recursos, TRADUCCIONES.recursos), "Recursos");
  await Inscripcion.deleteMany({});
  await mongoose.disconnect();
}

sembrar().catch((error) => {
  console.error(error);
  process.exit(1);
});