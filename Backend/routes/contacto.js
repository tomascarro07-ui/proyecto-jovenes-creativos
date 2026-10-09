const express = require("express");
const rateLimit = require("express-rate-limit");
const { enviarCorreo, escaparHTML } = require("../config/correo");

const router = express.Router();

const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Enviaste muchos mensajes. Probá de nuevo en 15 minutos." },
});

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const limpiar = (t, max) => String(t || "").trim().slice(0, max);

router.post("/", limitador, async (req, res) => {
  const nombre = limpiar(req.body.nombre, 60);
  const email = limpiar(req.body.email, 120).toLowerCase();
  const actividad = limpiar(req.body.actividad, 150);
  const mensaje = limpiar(req.body.mensaje, 2000);

  if (!nombre || !mensaje) {
    return res.status(400).json({ error: "Completá tu nombre y el mensaje." });
  }
  if (!EMAIL_VALIDO.test(email)) {
    return res.status(400).json({ error: "El correo no es válido." });
  }

  const destino = process.env.EMAIL_DESTINO || process.env.EMAIL_USER;
  const asunto = actividad
    ? `Consulta web: ${actividad} (${nombre})`
    : `Consulta web de ${nombre}`;

  const texto =
    `Nombre: ${nombre}\n` +
    `Correo: ${email}\n` +
    (actividad ? `Consulta sobre: ${actividad}\n` : "") +
    `\nMensaje:\n${mensaje}\n`;

  const html =
    `<h2>Nueva consulta desde Nodo Cultural</h2>` +
    `<p><b>Nombre:</b> ${escaparHTML(nombre)}<br>` +
    `<b>Correo:</b> ${escaparHTML(email)}<br>` +
    (actividad ? `<b>Consulta sobre:</b> ${escaparHTML(actividad)}<br>` : "") +
    `</p><p style="white-space:pre-wrap">${escaparHTML(mensaje)}</p>` +
    `<hr><p style="color:#666;font-size:12px">Podés responder este correo y le llega directo a ${escaparHTML(email)}.</p>`;

  try {
    await enviarCorreo({ para: destino, asunto, texto, html, responderA: email });
    res.json({ mensaje: "¡Gracias! Recibimos tu consulta y te vamos a responder pronto." });
  } catch (error) {
    console.error("Error enviando contacto:", error.message);
    res.status(500).json({ error: "No pudimos enviar tu mensaje. Probá de nuevo en unos minutos." });
  }
});

module.exports = router;
