const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function limpiar(texto, max) {
  let comoTexto = "";
  if (texto !== null && texto !== undefined) comoTexto = String(texto);
  const limpio = comoTexto.replace(/[<>]/g, "").trim();
  if (max) return limpio.slice(0, max);
  return limpio;
}

module.exports = { EMAIL_VALIDO, limpiar };
