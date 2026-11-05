// Reglas de contraseña. bcrypt solo usa los primeros 72 bytes: más largo no suma seguridad y se rechaza
// para que nadie crea que protege más de lo que protege.
const MINIMO = 8;
const MAXIMO_BYTES = 72;

// Devuelve el texto del error, o "" si la contraseña sirve.
function validarContrasenia(contrasenia, esNueva = false) {
  if (contrasenia.length < MINIMO) {
    return esNueva ? "La nueva contraseña debe tener al menos 8 caracteres" : "La contraseña debe tener al menos 8 caracteres";
  }
  if (Buffer.byteLength(contrasenia, "utf8") > MAXIMO_BYTES) {
    return "La contraseña es demasiado larga (máximo 72 caracteres).";
  }
  return "";
}

module.exports = { validarContrasenia, MINIMO, MAXIMO_BYTES };
