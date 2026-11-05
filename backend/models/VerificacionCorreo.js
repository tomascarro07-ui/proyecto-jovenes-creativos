const mongoose = require("mongoose");

// Pedido de verificación de correo. Igual que el de contraseña: solo se guarda el hash del token.
const verificacionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expira: { type: Date, required: true, index: { expires: 0 } }, // Mongo lo borra solo al vencer
});

module.exports = mongoose.model("VerificacionCorreo", verificacionSchema);
