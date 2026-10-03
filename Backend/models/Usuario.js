const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
  {
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 60 },
    nombre: { type: String, required: true, trim: true, maxlength: 40 },
    apellido: { type: String, trim: true, maxlength: 40, default: "" },
    contrasenia: { type: String, required: true, select: false },
    esAdministrador: { type: Boolean, default: false },
    fechaNacimiento: { type: String, default: "" },
    telefono: { type: String, trim: true, maxlength: 20, default: "" },
    bio: { type: String, trim: true, maxlength: 200, default: "" },
    foto: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Usuario", usuarioSchema);