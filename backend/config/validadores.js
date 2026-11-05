// Validadores reutilizables para los modelos.

// Direcciones de imagen o archivo: solo se aceptan rutas del propio sitio ("/img/foto.webp", "img/foto.webp",
// "recursos/archivo.pdf") o direcciones https://. Así nadie puede guardar "javascript:..." ni "data:..." como enlace.
const RUTA_SEGURA = /^(?:$|https:\/\/[^\s"'<>]+$|\/?(?:img|recursos|api)\/[\w./%\- ]+$)/i;

const rutaSegura = {
  validator: (valor) => typeof valor === "string" && valor.length <= 500 && RUTA_SEGURA.test(valor) && !valor.includes(".."),
  message: "La dirección debe empezar con https:// o ser una ruta del sitio (por ejemplo img/foto.webp).",
};

module.exports = { rutaSegura, RUTA_SEGURA };
