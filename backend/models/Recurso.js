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
    // Dirección para descargar el PDF. Los PDF subidos desde el panel se guardan dentro de la base de datos
    // (campo "pdf") y esta dirección apunta a /api/recursos/:id/archivo. Los recursos viejos apuntan a /recursos/xxx.pdf.
    archivo: { type: String, required: true, validate: rutaSegura },
    // Contenido del PDF subido. select:false → no viaja en las listas, solo se lee al descargar.
    pdf: { type: Buffer, select: false },
    pdfNombre: { type: String, trim: true },
    // Textos en otros idiomas: { en: { titulo: "...", ... }, pt: { ... } }. Se cargan con `npm run traducir`.
    traducciones: { type: mongoose.Schema.Types.Mixed, default: undefined },
  },
  { timestamps: true }
);

recursoSchema.set("toJSON", {
  ...opcionesJSON,
  transform: (doc, ret) => {
    opcionesJSON.transform(doc, ret);
    delete ret.pdf; // nunca se envía el contenido del PDF en el JSON
  },
});

module.exports = mongoose.model("Recurso", recursoSchema);