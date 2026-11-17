const mongoose = require("mongoose");

const reinicioSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expira: { type: Date, required: true, index: { expires: 0 } },
});

module.exports = mongoose.model("ReinicioContrasenia", reinicioSchema);
