const nodemailer = require("nodemailer");

let transporte = null;

function obtenerTransporte() {
  if (transporte) return transporte;

  const usuario = process.env.EMAIL_USER;
  const clave = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  if (!usuario || !clave) {
    throw new Error("Faltan EMAIL_USER y EMAIL_PASS en las variables de entorno");
  }

  transporte = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: usuario, pass: clave },
  });
  return transporte;
}

function escaparHTML(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function enviarCorreo({ para, asunto, texto, html, responderA }) {
  const t = obtenerTransporte();
  await t.sendMail({
    from: `"Nodo Cultural" <${process.env.EMAIL_USER}>`,
    to: para,
    subject: String(asunto).replace(/[\r\n]+/g, " "),
    text: texto,
    html,
    replyTo: responderA,
  });
}

module.exports = { enviarCorreo, escaparHTML };
