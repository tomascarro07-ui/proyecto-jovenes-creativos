const RUTA_SEGURA = /^(?:$|https:\/\/[^\s"'<>]+$|\/?(?:img|recursos|api)\/[\w./%\- ]+$)/i;

const rutaSegura = {
  validator: (valor) => typeof valor === "string" && valor.length <= 500 && RUTA_SEGURA.test(valor) && !valor.includes(".."),
  message: "La dirección debe empezar con https:// o ser una ruta del sitio (por ejemplo img/foto.webp).",
};

module.exports = { rutaSegura, RUTA_SEGURA };
