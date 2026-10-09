// Poné true cuando el sitio se publique con el proxy de /api (ver vercel.json en esta carpeta)
// y en el backend esté AUTH_COOKIE=1. Así la sesión viaja en una cookie httpOnly que el JavaScript
// de la página no puede leer. Con false todo funciona como antes (token guardado en el navegador).
const API_MISMO_ORIGEN = false;

const API_URL = (function () {
  const host = window.location.hostname;
  const esLocal = host === "" || host === "localhost" || host === "127.0.0.1";

  if (esLocal) {
    return "http://localhost:3000/api";
  }

  if (API_MISMO_ORIGEN) {
    return "/api";
  }

  // "https://jovenes-creativos-api.vercel.app/api"
  return "https://proyecto-jovenes-creativos.vercel.app/api";
})();
