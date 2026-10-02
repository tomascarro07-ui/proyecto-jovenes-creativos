const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const Usuario = require("../models/Usuario");
const { verificarToken } = require("../middleware/auth");

const router = express.Router();

const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Demasiados intentos. Probá de nuevo en 15 minutos." },
});

const HASH_FALSO = bcrypt.hashSync("no-existe", 12); // evita revelar si el correo existe por tiempo de respuesta
const limpiar = (t) => String(t || "").replace(/[<>]/g, "").trim();

function crearToken(usuario) {
  return jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
}

function datosPublicos(u) {
  return { id: u._id, correo: u.correo, nombre: u.nombre, apellido: u.apellido, esAdministrador: u.esAdministrador };
}

// POST /api/auth/registro  (SIEMPRE crea usuarios normales)
router.post("/registro", limitador, async (req, res) => {
  try {
    const correo = String(req.body.correo || "").toLowerCase().trim();
    const contrasenia = String(req.body.contrasenia || "");
    const nombre = limpiar(req.body.nombre);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ error: "Correo inválido" });
    }
    if (contrasenia.length < 8) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    }
    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    if (await Usuario.findOne({ correo })) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese correo" });
    }

    const usuario = await Usuario.create({
      correo,
      nombre,
      apellido: limpiar(req.body.apellido),
      fechaNacimiento: limpiar(req.body.fechaNacimiento),
      contrasenia: await bcrypt.hash(contrasenia, 12),
      esAdministrador: false, // nunca se toma del body
    });

    res.status(201).json({ token: crearToken(usuario), usuario: datosPublicos(usuario) });
  } catch (e) {
    res.status(500).json({ error: "No se pudo registrar el usuario" });
  }
});

// POST /api/auth/login
router.post("/login", limitador, async (req, res) => {
  try {
    const correo = String(req.body.correo || "").toLowerCase().trim();
    const contrasenia = String(req.body.contrasenia || "");
    const usuario = await Usuario.findOne({ correo }).select("+contrasenia");

    const ok = await bcrypt.compare(contrasenia, usuario ? usuario.contrasenia : HASH_FALSO);
    if (!usuario || !ok) {
      return res.status(401).json({ error: "Los datos ingresados son incorrectos" });
    }
    res.json({ token: crearToken(usuario), usuario: datosPublicos(usuario) });
  } catch (e) {
    res.status(500).json({ error: "No se pudo iniciar sesión" });
  }
});

// GET /api/auth/yo  → el frontend lo usa para validar la sesión de verdad
router.get("/yo", verificarToken, (req, res) => {
  res.json({ usuario: datosPublicos(req.usuario) });
});

module.exports = router;