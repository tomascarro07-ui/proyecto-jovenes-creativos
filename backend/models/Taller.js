const mongoose = require("mongoose");
const opcionesJSON = require("./opcionesJSON");
const { rutaSegura } = require("../config/validadores");
const camposUbicacion = require("./Ubicacion");

const tallerSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    nivel: { type: String, required: true },
    modalidad: { type: String, required: true },
    cantClases: { type: Number, required: true, min: 1 },
    cupos: { type: Number, required: true, min: 0 },
    imagen: { type: String, default: "", validate: rutaSegura },
    descripcionCorta: { type: String, required: true },
    ...camposUbicacion,
    finalizada: { type: Boolean, default: false },
    destacada: { type: Boolean, default: false },
    fecha: { type: String, default: "", match: /^(\d{4}-\d{2}-\d{2})?$/ },
    hora: { type: String, default: "" },
    lugar: { type: String, trim: true, default: "" },
    traducciones: { type: mongoose.Schema.Types.Mixed, default: undefined },
  },
  { timestamps: true }
);

tallerSchema.set("toJSON", opcionesJSON);

module.exports = mongoose.model("Taller", tallerSchema);
