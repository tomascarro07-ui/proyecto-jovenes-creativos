const mongoose = require("mongoose");
const opcionesJSON = require("./opcionesJSON");

const valoracionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    recorrido: { type: mongoose.Schema.Types.ObjectId, ref: "Recorrido", required: true },
    estrellas: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { timestamps: true }
);

valoracionSchema.index({ usuario: 1, recorrido: 1 }, { unique: true });
valoracionSchema.set("toJSON", opcionesJSON);

module.exports = mongoose.model("Valoracion", valoracionSchema);