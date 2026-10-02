const API_URL = (function () {
  const host = window.location.hostname;
  const esLocal = host === "" || host === "localhost" || host === "127.0.0.1";

  if (esLocal) {
    return "http://localhost:3000/api";
  }

  // "https://jovenes-creativos-api.vercel.app/api"
  return "https://TU-BACKEND.vercel.app/api";
})();
