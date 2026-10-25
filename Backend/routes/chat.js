const express = require("express");
const rateLimit = require("express-rate-limit");
const Charla = require("../models/Charla");
const Taller = require("../models/Taller");
const Recorrido = require("../models/Recorrido");
const PROMPT_BASE = require("../config/promptAsistente");
const { campoTraducido, traducirDato } = require("../config/idioma");

const router = express.Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELO = process.env.GROQ_MODELO || "openai/gpt-oss-20b";

const limitador = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { error: "Hiciste muchas consultas seguidas. Probá de nuevo en unos minutos." },
});

// Lo que se le agrega al final de las instrucciones cuando el sitio no está en español.
// Va al final para que pese más que el "Respondé SIEMPRE en español" del texto base.
const INSTRUCCION_IDIOMA = {
  en: "\n\nIMPORTANT: the person is using the website in English. Ignore the instruction to answer in Spanish: answer ALWAYS in English, in 2-3 lines at most. If they ask something completely unrelated to these topics, answer only: I can only help you with information about Nodo Cultural, its activities and cultural topics of Colonia del Sacramento. Write the page links (charlas.html, cursos.html, museos.html, recorridos.html, nosotros.html, contacto.html) exactly as they are.",
  pt: "\n\nIMPORTANTE: a pessoa está usando o site em português. Ignore a instrução de responder em espanhol: responda SEMPRE em português do Brasil, em no máximo 2-3 linhas. Se perguntarem algo totalmente alheio a esses temas, responda apenas: Só posso ajudar com informações sobre o Nodo Cultural, suas atividades e temas culturais de Colônia do Sacramento. Escreva os links das páginas (charlas.html, cursos.html, museos.html, recorridos.html, nosotros.html, contacto.html) exatamente como estão.",
};

const CONTINUAR = {
  es: "Continuá exactamente desde donde te quedaste, sin repetir nada de lo que ya dijiste y sin saludar de nuevo.",
  en: "Continue exactly where you left off, without repeating anything you already said and without greeting again.",
  pt: "Continue exatamente de onde parou, sem repetir nada do que já disse e sem cumprimentar de novo.",
};

// Contexto con las actividades actuales, uno por idioma (se guarda 60 segundos para no consultar la base en cada mensaje)
const contextoCache = {};

async function construirContexto(idioma) {
  const guardado = contextoCache[idioma];
  if (guardado && Date.now() < guardado.hasta) return guardado.texto;

  const tr = (doc, campo) => campoTraducido(doc, campo, idioma);

  const [charlas, talleres, recorridos] = await Promise.all([
    Charla.find().lean(),
    Taller.find().lean(),
    Recorrido.find().lean(),
  ]);

  let texto = PROMPT_BASE + "\n\nCharlas disponibles actualmente:\n";
  for (const c of charlas) {
    texto += `- ${tr(c, "titulo")} (${traducirDato(c.tipo, idioma)}), el ${c.fecha} a las ${c.hora} en ${traducirDato(tr(c, "lugar"), idioma)}. Cupos: ${c.cupos}. ${tr(c, "descripcionCorta")}\n`;
  }

  texto += "\nTalleres disponibles actualmente:\n";
  for (const t of talleres) {
    texto += `- ${tr(t, "titulo")}, modalidad ${traducirDato(t.modalidad, idioma)}, ${t.cantClases} clases. Cupos: ${t.cupos}. ${tr(t, "descripcionCorta")}\n`;
  }

  texto += "\nRecorridos disponibles actualmente:\n";
  for (const r of recorridos) {
    texto += `- ${tr(r, "titulo")}, duración ${r.duracionHoras}h ${r.duracionMinutos}min, punto de salida: ${tr(r, "puntoSalida")}. ${tr(r, "descripcionCorta")}\n`;
  }

  texto += INSTRUCCION_IDIOMA[idioma] || "";

  contextoCache[idioma] = { texto, hasta: Date.now() + 60 * 1000 };
  return texto;
}

// Solo aceptamos mensajes de usuario/asistente: el cliente nunca puede mandar el "system".
function limpiarHistorial(mensajes) {
  if (!Array.isArray(mensajes)) return [];
  return mensajes
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 500) }))
    .filter((m) => m.content)
    .slice(-8);
}

async function pedirCompletado(mensajes) {
  const controlador = new AbortController();
  const corte = setTimeout(() => controlador.abort(), 20000);

  try {
    const respuesta = await fetch(GROQ_URL, {
      method: "POST",
      signal: controlador.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODELO,
        messages: mensajes,
        max_tokens: 350,
        temperature: 0.4,
      }),
    });

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok || !datos || datos.error) {
      throw new Error((datos && datos.error && datos.error.message) || `Groq respondió ${respuesta.status}`);
    }

    return {
      texto: datos.choices?.[0]?.message?.content || "",
      cortada: datos.choices?.[0]?.finish_reason === "length",
    };
  } finally {
    clearTimeout(corte);
  }
}

router.post("/", limitador, async (req, res) => {
  if (!process.env.GROQ_API_KEY) {
    console.error("Falta GROQ_API_KEY en las variables de entorno");
    return res.status(500).json({ error: "El asistente no está disponible por ahora." });
  }

  const historial = limpiarHistorial(req.body.mensajes);
  if (historial.length === 0 || historial[historial.length - 1].role !== "user") {
    return res.status(400).json({ error: "Escribí un mensaje para el asistente." });
  }

  try {
    const mensajes = [{ role: "system", content: await construirContexto(req.idioma) }, ...historial];

    let textoCompleto = "";
    const MAX_CONTINUACIONES = 2;

    for (let intento = 0; intento <= MAX_CONTINUACIONES; intento++) {
      const resultado = await pedirCompletado(mensajes);
      textoCompleto += resultado.texto;

      if (!resultado.cortada) break;

      mensajes.push({ role: "assistant", content: resultado.texto });
      mensajes.push({
        role: "user",
        content: CONTINUAR[req.idioma] || CONTINUAR.es,
      });
    }

    res.json({
      respuesta: textoCompleto.trim() || req.t("Perdón, no pude generar una respuesta. Probá de nuevo."),
    });
  } catch (error) {
    console.error("Error del asistente:", error.message);
    res.status(502).json({ error: "No pude conectarme con el asistente. Probá de nuevo en un momento." });
  }
});

module.exports = router;
