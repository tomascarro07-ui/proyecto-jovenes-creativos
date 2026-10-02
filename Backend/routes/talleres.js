const Taller = require("../models/Taller");
const crearRutas = require("./crearRutas");

module.exports = crearRutas(Taller, {
  nombre: "talleres",
  campos: ["titulo", "nivel", "modalidad", "cantClases", "cupos", "imagen", "descripcionCorta"],
  finalizable: true,
});