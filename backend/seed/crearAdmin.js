require("dotenv").config();
const bcrypt = require("bcryptjs");
const { conectarDB } = require("../config/db");
const Usuario = require("../models/Usuario");

(async () => {
  try {
    await conectarDB();
    const correo = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const clave = process.env.ADMIN_PASSWORD || "";
    if (!correo || clave.length < 8) throw new Error("Revisá ADMIN_EMAIL y ADMIN_PASSWORD en .env");

    await Usuario.findOneAndUpdate(
      { correo },
      { correo, nombre: "Admin", contrasenia: await bcrypt.hash(clave, 12), esAdministrador: true },
      { upsert: true, setDefaultsOnInsert: true }
    );
    console.log("Administrador listo:", correo);
  } catch (e) {
    console.error(e.message);
  }
  process.exit();
})();