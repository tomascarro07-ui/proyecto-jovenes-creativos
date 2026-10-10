const { idiomaDe, traducirMensaje } = require("../config/idioma");

// Campos de la respuesta que llevan un texto para mostrarle a la persona
const CAMPOS_DE_TEXTO = ["error", "mensaje", "motivo"];

function traducirCuerpo(cuerpo, idioma) {
  // Solo se tocan los objetos simples ({ error: "..." }); los documentos de Mongoose se dejan como están
  if (!cuerpo || typeof cuerpo !== "object" || Array.isArray(cuerpo) || Object.getPrototypeOf(cuerpo) !== Object.prototype) {
    return cuerpo;
  }
  let resultado = cuerpo;
  for (const campo of CAMPOS_DE_TEXTO) {
    if (typeof cuerpo[campo] !== "string") continue;
    const traducido = traducirMensaje(cuerpo[campo], idioma);
    if (traducido !== cuerpo[campo]) resultado = { ...resultado, [campo]: traducido };
  }
  return resultado;
}

// Deja en cada pedido: req.idioma ("es", "en" o "pt") y req.t("texto en español") para traducir mensajes.
// Además traduce solo los mensajes de error y de aviso de todas las respuestas.
function middlewareIdioma(req, res, next) {
  req.idioma = idiomaDe(req);
  req.t = (texto) => traducirMensaje(texto, req.idioma);

  if (req.idioma !== "es") {
    const jsonOriginal = res.json.bind(res);
    res.json = (cuerpo) => jsonOriginal(traducirCuerpo(cuerpo, req.idioma));
  }
  next();
}

module.exports = middlewareIdioma;
