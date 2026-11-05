const mongoose = require("mongoose");

// Un documento = un pedido de "olvidé mi contraseña".
// Nunca se guarda el token en claro: solo su hash SHA-256.
const reinicioSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  // Mongo borra el documento solo cuando llega esta fecha (índice TTL).
  expira: { type: Date, required: true, index: { expires: 0 } },
});

module.exports = mongoose.model("ReinicioContrasenia", reinicioSchema);
