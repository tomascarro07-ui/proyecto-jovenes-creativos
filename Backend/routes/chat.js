const express = require("express");
const rateLimit = require("express-rate-limit");
const Charla = require("../models/Charla");
const Taller = require("../models/Taller");
const Recorrido = require("../models/Recorrido");
const PROMPT_BASE = require("../config/promptAsistente");

const router = express.Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELO = process.env.GROQ_MODELO || "openai/gpt-oss-20b";

const limitador = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { error: "Hiciste muchas consultas seguidas. Probá de nuevo en unos minutos." },
});

// Contexto con las actividades actuales (se guarda 60 segundos para no consultar la base en cada mensaje)
let contextoCache = { texto: "", hasta: 0 };

async function construirContexto() {
  if (Date.now() < contextoCache.hasta) return contextoCache.texto;

  const [charlas, talleres, recorridos] = await Promise.all([
    Charla.find().lean(),
    Taller.find().lean(),
    Recorrido.find().lean(),
  ]);

  let texto = PROMPT_BASE + "\n\nCharlas disponibles actualmente:\n";
  for (const c of charlas) {
    texto += `- ${c.titulo} (${c.tipo}), el ${c.fecha} a las ${c.hora} en ${c.lugar}. Cupos: ${c.cupos}. ${c.descripcionCorta}\n`;
  }

  texto += "\nTalleres disponibles actualmente:\n";
  for (const t of talleres) {
    texto += `- ${t.titulo}, modalidad ${t.modalidad}, ${t.cantClases} clases. Cupos: ${t.cupos}. ${t.descripcionCorta}\n`;
  }

  texto += "\nRecorridos disponibles actualmente:\n";
  for (const r of recorridos) {
    texto += `- ${r.titulo}, duración ${r.duracionHoras}h ${r.duracionMinutos}min, punto de salida: ${r.puntoSalida}. ${r.descripcionCorta}\n`;
  }

  contextoCache = { texto, hasta: Date.now() + 60 * 1000 };
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
    const mensajes = [{ role: "system", content: await construirContexto() }, ...historial];

    let textoCompleto = "";
    const MAX_CONTINUACIONES = 2;

    for (let intento = 0; intento <= MAX_CONTINUACIONES; intento++) {
      const resultado = await pedirCompletado(mensajes);
      textoCompleto += resultado.texto;

      if (!resultado.cortada) break;

      mensajes.push({ role: "assistant", content: resultado.texto });
      mensajes.push({
        role: "user",
        content: "Continuá exactamente desde donde te quedaste, sin repetir nada de lo que ya dijiste y sin saludar de nuevo.",
      });
    }

    res.json({
      respuesta: textoCompleto.trim() || "Perdón, no pude generar una respuesta. Probá de nuevo.",
    });
  } catch (error) {
    console.error("Error del asistente:", error.message);
    res.status(502).json({ error: "No pude conectarme con el asistente. Probá de nuevo en un momento." });
  }
});

module.exports = router;
