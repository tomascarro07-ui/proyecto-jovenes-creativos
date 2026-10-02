const Recorrido = require("../models/Recorrido");
const crearRutas = require("./crearRutas");

module.exports = crearRutas(Recorrido, {
  nombre: "recorridos",
  campos: ["titulo", "tipo", "duracionHoras", "duracionMinutos", "imagen", "puntoSalida", "cupos", "descripcionCorta"],
  finalizable: true,
});