// Función única para hablar con el backend.
// ruta:     "/talleres", "/talleres/123", etc. (se le suma API_URL adelante)
async function pedirApi(ruta, opciones) {
  const op = opciones || {};
  const config = { method: op.method || "GET", headers: {} };

  const sesion = leerDeStorage(SESION_KEY, null);
  if (sesion && sesion.token) {
    config.headers["Authorization"] = "Bearer " + sesion.token;
  }

  if (op.body !== undefined) {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(op.body);
  }

  let respuesta;
  try {
    respuesta = await fetch(API_URL + ruta, config);
  } catch (e) {
    throw new Error("No se pudo conectar con el servidor");
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch (e) {
    datos = null;
  }

  if (!respuesta.ok) {
    const error = new Error((datos && datos.error) || "Error del servidor");
    error.status = respuesta.status;
    guardarEnStorage(SESION_KEY, null);
    throw error;
  }

  return datos;
}

// Muestra un mensaje de error dentro de un contenedor de la página.
function mostrarErrorServidor(elemento) {
  if (!elemento) {
    return;
  }
  elemento.innerHTML = '<p class="admin-vacio">No se pudo conectar con el servidor. Intentá de nuevo en unos minutos.</p>';
}
