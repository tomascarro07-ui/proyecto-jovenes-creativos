const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

async function verificarToken(req, res, next) {
  try {
    const cabecera = req.headers.authorization || "";
    const [tipo, token] = cabecera.split(" ");
    if (tipo !== "Bearer" || !token) {
      return res.status(401).json({ error: "Necesitás iniciar sesión" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Se consulta la BD en cada pedido: si le quitan el rol admin, deja de funcionar al instante.
    const usuario = await Usuario.findById(payload.id);
    if (!usuario) {
      return res.status(401).json({ error: "Sesión inválida" });
    }
    req.usuario = usuario;
    next();
  } catch (e) {
    res.status(401).json({ error: "Sesión inválida o vencida" });
  }
}

function soloAdmin(req, res, next) {
  if (!req.usuario || req.usuario.esAdministrador !== true) {
    return res.status(403).json({ error: "No tenés permisos de administrador" });
  }
  next();
}

module.exports = { verificarToken, soloAdmin };