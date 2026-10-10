// Función única para hablar con el backend.
// ruta:     "/talleres", "/talleres/123", etc. (se le suma API_URL adelante)
async function pedirApi(ruta, opciones) {
  const op = opciones || {};
  const config = { method: op.method || "GET", headers: {} };

  // Le avisa al servidor en qué idioma está el sitio (para que pueda responder traducido)
  if (typeof idiomaActual === "function") config.headers["Accept-Language"] = idiomaActual();

  const sesion = leerDeStorage(SESION_KEY, null);
  if (sesion && sesion.token) {
    config.headers["Authorization"] = "Bearer " + sesion.token;
  }

  // Con sesión en cookie, el servidor exige este encabezado en pedidos que modifican datos (defensa CSRF)
  if (config.method !== "GET") {
    config.headers["X-Requested-With"] = "nodocultural";
  }

  if (op.body !== undefined) {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(op.body);
  }

  let respuesta;
  try {
    respuesta = await fetch(API_URL + ruta, config);
  } catch (e) {
    throw new Error(t("api.sinConexion"));
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch (e) {
    datos = null;
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && ruta.indexOf("/auth/login") === -1) {
      guardarEnStorage(SESION_KEY, null); // sesión vencida o inválida
    }
    const error = new Error((datos && datos.error) || "Error del servidor");
    error.status = respuesta.status;
    error.codigo = datos && datos.codigo;
    throw error;
  }

  return datos;
}

// Muestra un mensaje de error dentro de un contenedor de la página.
function mostrarErrorServidor(elemento) {
  if (!elemento) {
    return;
  }
  elemento.innerHTML = '<p class="admin-vacio">' + t("api.errorServidor") + '</p>';
}
