const express = require("express");
const { limitar } = require("../config/limitador");
const { EMAIL_VALIDO, limpiar } = require("../config/texto");
const { enviarCorreo, escaparHTML } = require("../config/correo");

const router = express.Router();

const limitador = limitar({ max: 5, mensaje: "Enviaste muchos mensajes. Probá de nuevo en 15 minutos." });

const MOTIVOS = {
  aporte: "Quiere aportar documentos, fotos u objetos",
  testimonio: "Tiene un testimonio para compartir",
  educacion: "Consulta sobre material educativo",
  otro: "Otra consulta",
};

function manejarContacto({ validarExtra, armar, mensajeGracias }) {
  return async (req, res) => {
    const nombre = limpiar(req.body.nombre, 60);
    const email = limpiar(req.body.email, 120).toLowerCase();
    const mensaje = String(req.body.mensaje || "").trim().slice(0, 2000);

    if (!nombre || !mensaje) return res.status(400).json({ error: "Completá tu nombre y el mensaje." });
    if (!EMAIL_VALIDO.test(email)) return res.status(400).json({ error: "El correo no es válido." });
    const errorExtra = validarExtra && validarExtra(req.body);
    if (errorExtra) return res.status(400).json({ error: errorExtra });

    const { asunto, titulo, extra } = armar({ nombre, req: req.body });
    const texto =
      `Nombre: ${nombre}\nCorreo: ${email}\n` +
      extra.map(([etiqueta, valor]) => `${etiqueta}: ${valor}\n`).join("") +
      `\nMensaje:\n${mensaje}\n`;
    const html =
      `<h2>${escaparHTML(titulo)}</h2>` +
      `<p><b>Nombre:</b> ${escaparHTML(nombre)}<br><b>Correo:</b> ${escaparHTML(email)}<br>` +
      extra.map(([etiqueta, valor]) => `<b>${escaparHTML(etiqueta)}:</b> ${escaparHTML(valor)}<br>`).join("") +
      `</p><p style="white-space:pre-wrap">${escaparHTML(mensaje)}</p>` +
      `<hr><p style="color:#666;font-size:12px">Podés responder este correo y le llega directo a ${escaparHTML(email)}.</p>`;

    try {
      await enviarCorreo({
        para: process.env.EMAIL_DESTINO || process.env.EMAIL_USER,
        asunto,
        texto,
        html,
        responderA: email,
      });
      res.json({ mensaje: mensajeGracias });
    } catch (error) {
      console.error("Error enviando contacto:", error.message);
      res.status(500).json({ error: "No pudimos enviar tu mensaje. Probá de nuevo en unos minutos." });
    }
  };
}

router.post(
  "/",
  limitador,
  manejarContacto({
    mensajeGracias: "¡Gracias! Recibimos tu consulta y te vamos a responder pronto.",
    armar: ({ nombre, req }) => {
      const actividad = limpiar(req.actividad, 150);
      let asunto = `Consulta web de ${nombre}`;
      let extra = [];
      if (actividad) {
        asunto = `Consulta web: ${actividad} (${nombre})`;
        extra = [["Consulta sobre", actividad]];
      }
      return { asunto, titulo: "Nueva consulta desde Nodo Cultural", extra };
    },
  })
);

router.post(
  "/sudamtex",
  limitador,
  manejarContacto({
    mensajeGracias: "¡Gracias! Recibimos tu consulta y te vamos a responder pronto.",
    validarExtra: (cuerpo) => {
      if (MOTIVOS[limpiar(cuerpo.motivo, 60)]) return "";
      return "Elegí un motivo de la lista.";
    },
    armar: ({ nombre, req }) => {
      const motivo = MOTIVOS[limpiar(req.motivo, 60)];
      return { asunto: `Sudamtex: ${motivo} (${nombre})`, titulo: "Nueva consulta desde Sudamtex", extra: [["Motivo", motivo]] };
    },
  })
);

module.exports = router;
