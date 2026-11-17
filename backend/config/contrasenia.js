const MINIMO = 8;
const MAXIMO_BYTES = 72;

function validarContrasenia(contrasenia, esNueva = false) {
  if (contrasenia.length < MINIMO) {
    if (esNueva) return "La nueva contraseña debe tener al menos 8 caracteres";
    return "La contraseña debe tener al menos 8 caracteres";
  }
  if (Buffer.byteLength(contrasenia, "utf8") > MAXIMO_BYTES) {
    return "La contraseña es demasiado larga (máximo 72 caracteres).";
  }
  return "";
}

module.exports = { validarContrasenia, MINIMO, MAXIMO_BYTES };
