const contenedorMensajes = document.getElementById("asistenteMensajes");
const formAsistente = document.getElementById("formAsistente");
const inputAsistente = document.getElementById("asistenteInput");
const sugerencias = document.getElementById("asistenteSugerencias");

let historialConversacion = [];

// Páginas reales del sitio a las que la IA puede linkear, con el texto que va a mostrar el link
const PAGINAS_VALIDAS = {
  "charlas.html": "chat.pag.charlas",
  "cursos.html": "chat.pag.cursos",
  "museos.html": "chat.pag.museos",
  "recorridos.html": "chat.pag.recorridos",
  "contacto.html": "chat.pag.contacto",
  "nosotros.html" : "chat.pag.nosotros"
};

function escaparHTML(texto) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatearRespuestaIA(texto) {
  // 1) Escapamos todo primero: lo que venga de la IA nunca se interpreta como HTML/JS
  let seguro = escaparHTML(texto);

  // 2) Recién ahí reemplazamos SOLO los nombres de archivo conocidos por un link real
  seguro = seguro.replace(/\b(charlas|cursos|museos|recorridos|contacto|nosotros)\.html\b/g, function (coincidencia) {
    const etiqueta = PAGINAS_VALIDAS[coincidencia] ? t(PAGINAS_VALIDAS[coincidencia]) : t("chat.clic");
    return `<a href="${coincidencia}" class="asistente-link">${etiqueta}</a>`;
  });

  return seguro;
}

function agregarBurbuja(texto, quien) {
  const p = document.createElement("p");
  p.className = quien === "ia" ? "asistente-burbuja asistente-burbuja--ia" : "asistente-burbuja";

  if (quien === "ia") {
    p.innerHTML = formatearRespuestaIA(texto);
  } else {
    p.textContent = texto;
  }

  contenedorMensajes.appendChild(p);
  contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
}

function mostrarEscribiendo() {
  const aviso = document.createElement("p");
  aviso.id = "asistenteEscribiendo";
  aviso.className = "asistente-aviso";
  aviso.textContent = t("chat.escribiendo");
  contenedorMensajes.appendChild(aviso);
  contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
}

function quitarEscribiendo() {
  const aviso = document.getElementById("asistenteEscribiendo");
  if (aviso) {
    aviso.remove();
  }
}

async function enviarMensaje(mensajeUsuario) {
  if (sugerencias) {
    sugerencias.style.display = "none";
  }

  agregarBurbuja(mensajeUsuario, "usuario");
  historialConversacion.push({ role: "user", content: mensajeUsuario });

  const LIMITE_HISTORIAL = 8;
  if (historialConversacion.length > LIMITE_HISTORIAL) {
    historialConversacion = historialConversacion.slice(-LIMITE_HISTORIAL);
  }

  mostrarEscribiendo();

  try {
    // La IA ahora vive en el backend: acá solo mandamos la conversación.
    const datos = await pedirApi("/chat", {
      method: "POST",
      body: { mensajes: historialConversacion, idioma: idiomaActual() }
    });

    quitarEscribiendo();

    const textoFinal = (datos && datos.respuesta ? datos.respuesta : "").trim() || t("chat.sinRespuesta");

    agregarBurbuja(textoFinal, "ia");
    historialConversacion.push({ role: "assistant", content: textoFinal });

  } catch (error) {
    quitarEscribiendo();
    agregarBurbuja(error.message || t("chat.sinConexion"), "ia");
    console.error(error);
  }
}

if (formAsistente) {
  formAsistente.addEventListener("submit", function (e) {
    e.preventDefault();

    const mensaje = inputAsistente.value.trim();

    if (mensaje === "") {
      return;
    }

    inputAsistente.value = "";
    enviarMensaje(mensaje);
  });
}

document.querySelectorAll(".sug-pregunta").forEach(function (boton) {
  boton.addEventListener("click", function (e) {
    e.preventDefault();
    const pregunta = boton.dataset.pregunta;
    enviarMensaje(pregunta);
  });
});