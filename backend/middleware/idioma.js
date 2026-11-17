const { idiomaDe, traducirMensaje } = require("../config/idioma");

const CAMPOS_DE_TEXTO = ["error", "mensaje", "motivo"];

function traducirCuerpo(cuerpo, idioma) {
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

function middlewareIdioma(req, res, next) {
  req.idioma = idiomaDe(req);
  req.t = (texto) => traducirMensaje(texto, req.idioma);

  if (req.idioma !== "es") {
    const jsonOriginal = res.json.bind(res);
    res.json = (cuerpo) => {
      const cuerpoTraducido = traducirCuerpo(cuerpo, req.idioma);
      return jsonOriginal(cuerpoTraducido);
    };
  }
  next();
}

module.exports = middlewareIdioma;
