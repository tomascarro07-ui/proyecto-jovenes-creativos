const jwt = require("jsonwebtoken");

// La sesión viaja de dos formas, según AUTH_COOKIE:
//  - AUTH_COOKIE=1  → cookie httpOnly (el JavaScript de la página no puede leerla: protege del robo por XSS).
//                     Requiere que el navegador hable con su propio dominio (proxy de /api).
//  - sin definir    → el token vuelve en el cuerpo de la respuesta y el frontend lo manda como Bearer (modo anterior).
const NOMBRE_COOKIE = "nc_sesion";
const DURACION_MS = 2 * 60 * 60 * 1000; // igual que el JWT: 2 horas

const usaCookie = () => process.env.AUTH_COOKIE === "1";

function crearToken(usuario) {
  return jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "2h", algorithm: "HS256" });
}

function opcionesCookie() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // en Vercel siempre es https
    sameSite: "lax",
    path: "/",
  };
}

// Abre la sesión y devuelve el cuerpo de la respuesta (con o sin token según el modo).
function iniciarSesion(res, usuario, datosPublicos) {
  const token = crearToken(usuario);
  if (usaCookie()) {
    res.cookie(NOMBRE_COOKIE, token, { ...opcionesCookie(), maxAge: DURACION_MS });
    return { usuario: datosPublicos };
  }
  return { token, usuario: datosPublicos };
}

function cerrarSesion(res) {
  res.clearCookie(NOMBRE_COOKIE, opcionesCookie());
}

function leerCookie(req, nombre) {
  const crudo = req.headers.cookie || "";
  for (const par of crudo.split(";")) {
    const i = par.indexOf("=");
    if (i > 0 && par.slice(0, i).trim() === nombre) {
      try { return decodeURIComponent(par.slice(i + 1).trim()); } catch (e) { return ""; }
    }
  }
  return "";
}

module.exports = { NOMBRE_COOKIE, usaCookie, crearToken, iniciarSesion, cerrarSesion, leerCookie };
