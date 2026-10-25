const Recurso = require("../models/Recurso");
const crearRutas = require("./crearRutas");

module.exports = crearRutas(Recurso, {
  nombre: "recursos",
  campos: ["titulo", "categoria", "descripcion", "fuente", "paginas", "archivo"],
  traducibles: ["titulo", "categoria", "descripcion", "fuente"],
  finalizable: false,
});