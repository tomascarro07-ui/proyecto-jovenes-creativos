const mongoose = require("mongoose");
const opcionesJSON = require("./opcionesJSON");

const suscriptorSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    categorias: { type: [String], default: [] },
    activo: { type: Boolean, default: true },
    // Código secreto para el link de "darme de baja" del correo.
    tokenBaja: { type: String, required: true },
  },
  { timestamps: true }
);

suscriptorSchema.set("toJSON", opcionesJSON);

module.exports = mongoose.model("Suscriptor", suscriptorSchema);
