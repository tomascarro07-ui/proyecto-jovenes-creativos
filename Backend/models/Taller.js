const mongoose = require("mongoose");
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
    lugar: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

// Hace que el JSON tenga "id" en vez de "_id" (como espera tu frontend)
tallerSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

module.exports = mongoose.model("Taller", tallerSchema);