const mongoose = require("mongoose");
const opcionesJSON = require("./opcionesJSON");

const recorridoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    tipo: { type: String, required: true },
    duracionHoras: { type: Number, required: true, min: 0 },
    duracionMinutos: { type: Number, required: true, min: 0, max: 59 },
    imagen: { type: String, default: "" },
    puntoSalida: { type: String, required: true },
    cupos: { type: Number, required: true, min: 0 },
    descripcionCorta: { type: String, required: true },
    finalizada: { type: Boolean, default: false },
  },
  { timestamps: true }
);

recorridoSchema.set("toJSON", opcionesJSON);

module.exports = mongoose.model("Recorrido", recorridoSchema);