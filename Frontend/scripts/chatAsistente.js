const GROQ_API_KEY = "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELO = "openai/gpt-oss-20b";

const gestorCharlasAsistente = new GestorCharlas();
const gestorTalleresAsistente = new GestorTalleres();
const gestorRecorridosAsistente = new GestorRecorridos();

const contenedorMensajes = document.getElementById("asistenteMensajes");
const formAsistente = document.getElementById("formAsistente");
const inputAsistente = document.getElementById("asistenteInput");
const sugerencias = document.getElementById("asistenteSugerencias");

let historialConversacion = [];

async function construirContexto() {
  const charlas = await gestorCharlasAsistente.obtenerCharlas();
  const talleres = await gestorTalleresAsistente.obtenerTalleres();
  const recorridos = await gestorRecorridosAsistente.obtenerRecorridos();

  let texto = "Sos el Asistente Cultural del sitio web Nodo Cultural, un proyecto que conecta patrimonio, educación y comunidad en Colonia del Sacramento, Uruguay. Respondé SIEMPRE en español, en 2-3 líneas como máximo, de forma directa, clara, natural y sin rodeos. No uses asteriscos, negritas, Markdown ni símbolos para resaltar palabras. Solo respondé sobre charlas, cursos, talleres, recorridos, museos, cultura, patrimonio y actividades de Colonia del Sacramento relacionadas con este sitio. Nodo Cultural cuenta con estas secciones: Inicio, Charlas, Museos, Cursos y Talleres, Contacto y Recorridos. Cuando alguien pregunte por una charla, primero indicá que puede encontrar la información y opciones de inscripción en la sección Charlas. Cuando alguien pregunte quiénes son los dueños, creadores, responsables, integrantes o equipo detrás de Nodo Cultural, orientalo a la sección Sobre nosotros y mencioná que puede conocer más sobre ellos allí. Cuando alguien pregunte por un curso o taller, orientalo a Cursos y Talleres. Cuando pregunte por recorridos, orientalo a Recorridos. Cuando pregunte por museos, orientalo a Museos. Si alguien necesita realizar una consulta específica, solicitar ayuda, hacer una reserva o comunicarse con el equipo y no existe una opción específica para hacerlo desde la sección correspondiente, indicále que puede utilizar la sección Contacto, donde puede dejar su consulta y será atendido por una persona del equipo. No inventes información como fechas, horarios, precios, cupos, lugares o personas; si no tenés un dato, indicá brevemente que no contás con esa información. No respondas sobre programación, código, bases de datos ni aspectos técnicos internos del sitio. Si te preguntan algo totalmente ajeno a estos temas, respondé únicamente: Solo puedo ayudarte con información sobre Nodo Cultural, sus actividades y temas culturales de Colonia del Sacramento.Cuando el usuario pregunte o quiera conocer más información sobre un tema que tenga una sección específica dentro del sitio, podés incluir el enlace correspondiente para que pueda ampliar la información. Usá estos enlaces según el tema: Charlas: charlas.html, Sobre nosotros: nosotros.html, Cursos y Talleres: cursos.html, Museos: museos.html, Recorridos: recorridos.html y Contacto: contacto.html. Los archivos están todos en la misma carpeta, por lo que los enlaces deben escribirse directamente como charlas.html, cursos.html, museos.html, recorridos.html o contacto.html. Presentá el enlace de forma natural dentro de la respuesta, por ejemplo: Si querés conocer más sobre las charlas disponibles, podés consultar charlas.html. No agregues enlaces si no aportan información útil a la respuesta.\n\n";

  texto += "Charlas disponibles actualmente:\n";
  for (let i = 0; i < charlas.length; i++) {
    const c = charlas[i];
    texto += `- ${c.titulo} (${c.tipo}), el ${c.fecha} a las ${c.hora} en ${c.lugar}. Cupos: ${c.cupos}. ${c.descripcionCorta}\n`;
  }

  texto += "\nTalleres disponibles actualmente:\n";
  for (let i = 0; i < talleres.length; i++) {
    const t = talleres[i];
    texto += `- ${t.titulo}, modalidad ${t.modalidad}, ${t.cantClases} clases. Cupos: ${t.cupos}. ${t.descripcionCorta}\n`;
  }

  texto += "\nRecorridos disponibles actualmente:\n";
  for (let i = 0; i < recorridos.length; i++) {
    const r = recorridos[i];
    texto += `- ${r.titulo}, duración ${r.duracionHoras}h ${r.duracionMinutos}min, punto de salida: ${r.puntoSalida}. ${r.descripcionCorta}\n`;
  }

  return texto;

}

// Páginas reales del sitio a las que la IA puede linkear, con el texto que va a mostrar el link
const PAGINAS_VALIDAS = {
  "charlas.html": "charlas",
  "cursos.html": "cursos y talleres",
  "museos.html": "museos",
  "recorridos.html": "recorridos",
  "contacto.html": "contacto",
  "nosotros.html" : "nosotros"
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
    const etiqueta = PAGINAS_VALIDAS[coincidencia] || "Haz clic aquí";
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
  aviso.textContent = "El asistente está escribiendo...";
  contenedorMensajes.appendChild(aviso);
  contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
}

function quitarEscribiendo() {
  const aviso = document.getElementById("asistenteEscribiendo");
  if (aviso) {
    aviso.remove();
  }
}

async function pedirCompletado(mensajes) {
  const respuesta = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODELO,
      messages: mensajes,
      max_tokens: 350,
      temperature: 0.4
    })
  });

  const data = await respuesta.json();

  if (data.error) {
    throw new Error(data.error.message || "Error de la API");
  }

  return {
    texto: data?.choices?.[0]?.message?.content || "",
    cortada: data?.choices?.[0]?.finish_reason === "length"
  };
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
    const mensajesBase = [
      { role: "system", content: await construirContexto() },
      ...historialConversacion
    ];

    let textoCompleto = "";
    let intentos = 0;
    const MAX_CONTINUACIONES = 2;

    while (intentos <= MAX_CONTINUACIONES) {
      const resultado = await pedirCompletado(mensajesBase);
      textoCompleto += resultado.texto;

      if (!resultado.cortada) {
        break;
      }

      mensajesBase.push({ role: "assistant", content: resultado.texto });
      mensajesBase.push({ role: "user", content: "Continuá exactamente desde donde te quedaste, sin repetir nada de lo que ya dijiste y sin saludar de nuevo." });
      intentos++;
    }

    quitarEscribiendo();

    const textoFinal = textoCompleto.trim() || "Perdón, no pude generar una respuesta. Probá de nuevo.";

    agregarBurbuja(textoFinal, "ia");
    historialConversacion.push({ role: "assistant", content: textoFinal });

  } catch (error) {
    quitarEscribiendo();
    agregarBurbuja("No pude conectarme con la IA. Revisá que la API key esté bien configurada.", "ia");
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