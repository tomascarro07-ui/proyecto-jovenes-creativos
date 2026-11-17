const mongoose = require("mongoose");
const opcionesJSON = require("./opcionesJSON");
const { rutaSegura } = require("../config/validadores");

const museoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 120 },
    tipo: { type: String, required: true, trim: true, maxlength: 40 },
    descripcionCorta: { type: String, required: true, trim: true, maxlength: 600 },
    direccion: { type: String, trim: true, maxlength: 120, default: "" },
    horario: { type: String, trim: true, maxlength: 120, default: "" },
    imagen: { type: String, default: "", validate: rutaSegura },
    gancho: { type: String, trim: true, maxlength: 90, default: "" },
    historia: { type: String, trim: true, maxlength: 3000, default: "" },
    datoCurioso: { type: String, trim: true, maxlength: 300, default: "" },
    destacados: {
      type: [new mongoose.Schema({ titulo: { type: String, trim: true, required: true, maxlength: 60 }, texto: { type: String, trim: true, maxlength: 200, default: "" } }, { _id: false })],
      default: [],
      validate: { validator: (lista) => lista.length <= 4, message: "Se pueden cargar hasta 4 elementos en \"Qué vas a ver\"." },
    },
    galeria: {
      type: [String],
      default: [],
      validate: [
        { validator: (lista) => lista.length <= 8, message: "La galería admite hasta 8 fotos." },
        { validator: (lista) => lista.every((foto) => rutaSegura.validator(foto) && foto !== ""), message: rutaSegura.message },
      ],
    },
    entrada: { type: String, trim: true, maxlength: 120, default: "" },
    accesibilidad: { type: String, trim: true, maxlength: 200, default: "" },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    traducciones: { type: mongoose.Schema.Types.Mixed, default: undefined },
  },
  { timestamps: true }
);

museoSchema.set("toJSON", opcionesJSON);

module.exports = mongoose.model("Museo", museoSchema);