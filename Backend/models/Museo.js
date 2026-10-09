const mongoose = require("mongoose");
const opcionesJSON = require("./opcionesJSON");

const museoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 120 },
    tipo: { type: String, required: true, trim: true, maxlength: 40 },
    descripcionCorta: { type: String, required: true, trim: true, maxlength: 600 },
    direccion: { type: String, trim: true, maxlength: 120, default: "" },
    horario: { type: String, trim: true, maxlength: 120, default: "" },
    imagen: { type: String, default: "" },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { timestamps: true }
);

museoSchema.set("toJSON", opcionesJSON);

module.exports = mongoose.model("Museo", museoSchema);