const rateLimit = require("express-rate-limit");

function limitar({ max, mensaje, minutos = 15, ...resto }) {
  return rateLimit({ windowMs: minutos * 60 * 1000, max, message: { error: mensaje }, ...resto });
}

module.exports = { limitar };
