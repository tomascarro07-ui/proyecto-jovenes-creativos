const mongoose = require("mongoose");
const opcionesJSON = require("./opcionesJSON");

const recursoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    categoria: { type: String, required: true },
    descripcion: { type: String, required: true },
    fuente: { type: String, required: true },
    paginas: { type: Number, required: true, min: 1 },
    archivo: { type: String, required: true },
  },
  { timestamps: true }
);

recursoSchema.set("toJSON", opcionesJSON);

module.exports = mongoose.model("Recurso", recursoSchema);