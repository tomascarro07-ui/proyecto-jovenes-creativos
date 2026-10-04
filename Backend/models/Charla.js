const mongoose = require("mongoose");
const opcionesJSON = require("./opcionesJSON");
const camposUbicacion = require("./Ubicacion");

const charlaSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
    lugar: { type: String, required: true },
    tipo: { type: String, required: true },
    imagen: { type: String, default: "" },
    expositor: { type: String, required: true },
    descripcionCorta: { type: String, required: true },
    descripcionCompleta: { type: String, required: true },
    cupos: { type: Number, required: true, min: 0 },
    ...camposUbicacion,
    finalizada: { type: Boolean, default: false },
  },
  { timestamps: true }
);

charlaSchema.set("toJSON", opcionesJSON);

module.exports = mongoose.model("Charla", charlaSchema);