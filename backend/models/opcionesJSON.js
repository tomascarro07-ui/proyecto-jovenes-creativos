module.exports = {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    // Las traducciones no viajan en el JSON: el servidor devuelve ya el texto en el idioma pedido
    delete ret.traducciones;
  },
};