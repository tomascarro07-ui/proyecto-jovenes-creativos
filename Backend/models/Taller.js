const mongoose = require("mongoose");
const opcionesJSON = require("./opcionesJSON");
const camposUbicacion = require("./Ubicacion");

const tallerSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    nivel: { type: String, required: true },
    modalidad: { type: String, required: true },
    cantClases: { type: Number, required: true, min: 1 },
    cupos: { type: Number, required: true, min: 0 },
    imagen: { type: String, default: "" },
    descripcionCorta: { type: String, required: true },
    ...camposUbicacion,
    finalizada: { type: Boolean, default: false },
    fecha: { type: String, default: "", match: /^(\d{4}-\d{2}-\d{2})?$/ },
    hora: { type: String, default: "" },
    lugar: { type: String, trim: true, default: "" },
    // Textos en otros idiomas: { en: { titulo: "...", ... }, pt: { ... } }. Se cargan con `npm run traducir`.
    traducciones: { type: mongoose.Schema.Types.Mixed, default: undefined },
  },
  { timestamps: true }
);

tallerSchema.set("toJSON", opcionesJSON);

module.exports = mongoose.model("Taller", tallerSchema);