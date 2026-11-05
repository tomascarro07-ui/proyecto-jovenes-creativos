const mongoose = require("mongoose");
const opcionesJSON = require("./opcionesJSON");

const inscripcionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    tipo: { type: String, enum: ["taller", "charla", "recorrido"], required: true },
    actividad: { type: mongoose.Schema.Types.ObjectId, required: true },
    tituloActividad: { type: String, required: true },
    nombre: { type: String, required: true, trim: true, maxlength: 80 },
    correo: { type: String, required: true },
    telefono: { type: String, required: true, trim: true, maxlength: 20 },
    cantidadPersonas: { type: Number, required: true, min: 1, max: 20 },
  },
  { timestamps: true }
);

// Una persona no puede anotarse dos veces a la misma actividad
inscripcionSchema.index({ usuario: 1, tipo: 1, actividad: 1 }, { unique: true });

inscripcionSchema.set("toJSON", opcionesJSON);

module.exports = mongoose.model("Inscripcion", inscripcionSchema);