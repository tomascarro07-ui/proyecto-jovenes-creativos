function comoTexto(valor) {
  if (valor === undefined || valor === null) return "";
  if (typeof valor === "string") return valor;
  let plano = valor;
  if (typeof valor.toObject === "function") plano = valor.toObject();
  return JSON.stringify(plano, (clave, contenido) => {
    if (clave === "_id" || clave === "id") return undefined;
    return contenido;
  });
}

function traduccionesObsoletas(original, cambios, traducibles = []) {
  const quitar = {};
  for (const campo of traducibles) {
    if (campo in cambios && comoTexto(cambios[campo]) !== comoTexto(original[campo])) {
      for (const idioma of ["en", "pt"]) quitar[`traducciones.${idioma}.${campo}`] = "";
    }
  }
  return quitar;
}

module.exports = { traduccionesObsoletas };
