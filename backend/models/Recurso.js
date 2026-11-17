const mongoose = require("mongoose");
const opcionesJSON = require("./opcionesJSON");
const { rutaSegura } = require("../config/validadores");

const recursoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    categoria: { type: String, required: true },
    descripcion: { type: String, required: true },
    fuente: { type: String, required: true },
    paginas: { type: Number, required: true, min: 1 },
    archivo: { type: String, required: true, validate: rutaSegura },
    pdf: { type: Buffer, select: false },
    pdfNombre: { type: String, trim: true },
    traducciones: { type: mongoose.Schema.Types.Mixed, default: undefined },
  },
  { timestamps: true }
);

recursoSchema.set("toJSON", {
  ...opcionesJSON,
  transform: (doc, ret) => {
    opcionesJSON.transform(doc, ret);
    delete ret.pdf;
  },
});

module.exports = mongoose.model("Recurso", recursoSchema);