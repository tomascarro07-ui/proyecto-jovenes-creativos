const mongoose = require("mongoose");

const imagenSchema = new mongoose.Schema(
  {
    datos: { type: Buffer, required: true, select: false },
    tipo: { type: String, required: true, enum: ["image/jpeg", "image/png", "image/webp", "image/gif"] },
    nombre: { type: String, trim: true, maxlength: 120 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Imagen", imagenSchema);
