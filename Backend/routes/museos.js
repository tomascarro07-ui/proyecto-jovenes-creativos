const Museo = require("../models/Museo");
const crearRutas = require("./crearRutas");

module.exports = crearRutas(Museo, {
  nombre: "museos",
  campos: ["nombre", "tipo", "descripcionCorta", "direccion", "horario", "imagen", "lat", "lng"],
  finalizable: false,
});