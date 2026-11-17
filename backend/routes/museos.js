const Museo = require("../models/Museo");
const crearRutas = require("./crearRutas");

module.exports = crearRutas(Museo, {
  nombre: "museos",
  campos: ["nombre", "tipo", "descripcionCorta", "direccion", "horario", "imagen", "lat", "lng", "gancho", "historia", "datoCurioso", "destacados", "galeria", "entrada", "accesibilidad"],
  traducibles: ["nombre", "tipo", "descripcionCorta", "direccion", "horario", "gancho", "historia", "datoCurioso", "destacados", "entrada", "accesibilidad"],
  finalizable: false,
});