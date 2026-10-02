const Charla = require("../models/Charla");
const crearRutas = require("./crearRutas");

module.exports = crearRutas(Charla, {
  nombre: "charlas",
  campos: ["titulo", "fecha", "hora", "lugar", "tipo", "imagen", "expositor", "descripcionCorta", "descripcionCompleta", "cupos"],
  finalizable: true,
});