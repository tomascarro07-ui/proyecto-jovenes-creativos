const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const { NOMBRE_COOKIE, leerCookie } = require("../config/sesion");

const METODOS_SEGUROS = ["GET", "HEAD", "OPTIONS"];

// Busca el token: primero el encabezado Bearer (modo anterior), después la cookie httpOnly.
function extraerToken(req) {
  const [tipo, token] = String(req.headers.authorization || "").split(" ");
  if (tipo === "Bearer" && token) return { token, origen: "header" };
  const deCookie = leerCookie(req, NOMBRE_COOKIE);
  if (deCookie) return { token: deCookie, origen: "cookie" };
  return null;
}

async function verificarToken(req, res, next) {
  try {
    const encontrado = extraerToken(req);
    if (!encontrado) {
      return res.status(401).json({ error: "Necesitás iniciar sesión" });
    }

    // Defensa CSRF: el navegador manda las cookies solo, así que en pedidos que modifican datos
    // exigimos un encabezado propio. Desde otro sitio, el navegador no lo deja agregar sin permiso (CORS).
    if (encontrado.origen === "cookie" && !METODOS_SEGUROS.includes(req.method)
        && req.headers["x-requested-with"] !== "nodocultural") {
      return res.status(403).json({ error: "Pedido no permitido" });
    }

    const payload = jwt.verify(encontrado.token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    // Se consulta la BD en cada pedido: si le quitan el rol admin, deja de funcionar al instante.
    const usuario = await Usuario.findById(payload.id);
    if (!usuario) {
      return res.status(401).json({ error: "Sesión inválida" });
    }
    if (usuario.contraseniaCambiadaEn && payload.iat * 1000 < usuario.contraseniaCambiadaEn.getTime()) {
      return res.status(401).json({ error: "Sesión inválida o vencida" });
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

// Para acciones que necesitan una cuenta con correo confirmado (inscribirse, valorar).
// Las cuentas anteriores a esta función cuentan como verificadas.
function exigirCorreoVerificado(req, res, next) {
  if (req.usuario && req.usuario.pendienteVerificacion === true) {
    return res.status(403).json({
      error: "Confirmá tu correo para continuar. Te enviamos un enlace cuando te registraste.",
      codigo: "CORREO_SIN_VERIFICAR",
    });
  }
  next();
}

module.exports = { verificarToken, soloAdmin, exigirCorreoVerificado };
