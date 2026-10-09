const express = require("express");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const Suscriptor = require("../models/Suscriptor");
const { enviarCorreo, escaparHTML } = require("../config/correo");

const router = express.Router();

const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Demasiados intentos. Probá de nuevo en 15 minutos." },
});

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mismas categorías que el formulario del index.html
const CATEGORIAS_VALIDAS = [
  "Museos",
  "Historia",
  "Patrimonio Industrial",
  "Educación",
  "Arte y Exposiciones",
  "Medio Ambiente",
  "Arqueología",
  "Eventos por Departamento",
  "Actividades Familiares",
];

const SITIO_URL = () => process.env.SITIO_URL || "https://nodo-cultural.vercel.app";

function armarCorreoBienvenida(suscriptor, urlBaja) {
  const sitio = SITIO_URL();
  const categorias = suscriptor.categorias.length
    ? `<p>Tus intereses: <b>${suscriptor.categorias.map(escaparHTML).join(", ")}</b>.</p>`
    : "";

  const html =
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#333">` +
    `<h2>¡Muchas gracias por suscribirte a Nodo Cultural!</h2>` +
    `<p>Ya sos parte de nuestro Boletín Cultural. Desde ahora vas a poder ver las novedades y las nuevas charlas, talleres y recorridos que vayamos subiendo sobre el patrimonio y la cultura de Colonia del Sacramento.</p>` +
    categorias +
    `<p><a href="${sitio}" style="background:#a2492a;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Ver las novedades</a></p>` +
    `<hr><p style="color:#777;font-size:12px">Si no fuiste vos, o ya no querés recibir estos correos, podés <a href="${urlBaja}">darte de baja acá</a>.</p>` +
    `</div>`;

  const texto =
    `¡Muchas gracias por suscribirte a Nodo Cultural!\n\n` +
    `Desde ahora vas a poder ver las novedades y las nuevas charlas, talleres y recorridos que vayamos subiendo.\n` +
    `Mirá las novedades en: ${sitio}\n\n` +
    `Para darte de baja: ${urlBaja}\n`;

  return { html, texto };
}

router.post("/", limitador, async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase().slice(0, 120);
  const categorias = (Array.isArray(req.body.categorias) ? req.body.categorias : [])
    .filter((c) => CATEGORIAS_VALIDAS.includes(c));

  if (!EMAIL_VALIDO.test(email)) {
    return res.status(400).json({ error: "Ingresá un correo válido." });
  }

  try {
    let suscriptor = await Suscriptor.findOne({ email });

    if (suscriptor && suscriptor.activo) {
      return res.json({ mensaje: "Este correo ya está suscripto. ¡Gracias!" });
    }

    if (suscriptor) {
      // Se había dado de baja y vuelve a suscribirse
      suscriptor.activo = true;
      suscriptor.categorias = categorias;
      await suscriptor.save();
    } else {
      try {
        suscriptor = await Suscriptor.create({
          email,
          categorias,
          tokenBaja: crypto.randomBytes(24).toString("hex"),
        });
      } catch (error) {
        if (error.code === 11000) {
          return res.json({ mensaje: "Este correo ya está suscripto. ¡Gracias!" });
        }
        throw error;
      }
    }

    const base = `${req.protocol}://${req.get("host")}`;
    const urlBaja = `${base}/api/boletin/baja?token=${suscriptor.tokenBaja}`;
    const { html, texto } = armarCorreoBienvenida(suscriptor, urlBaja);

    try {
      await enviarCorreo({
        para: email,
        asunto: "¡Gracias por suscribirte a Nodo Cultural!",
        texto,
        html,
      });
    } catch (error) {
      // La suscripción queda guardada aunque el correo falle.
      console.error("No se pudo enviar el correo de bienvenida:", error.message);
    }

    res.status(201).json({ mensaje: "¡Gracias por suscribirte! Te enviamos un correo de bienvenida." });
  } catch (error) {
    console.error("Error en boletín:", error.message);
    res.status(500).json({ error: "No pudimos completar tu suscripción. Probá de nuevo." });
  }
});

// Link de baja que va en el correo
router.get("/baja", async (req, res) => {
  const token = String(req.query.token || "");
  let titulo = "El enlace no es válido";
  let detalle = "Si querés darte de baja, escribinos desde la sección Contacto.";

  if (/^[a-f0-9]{48}$/.test(token)) {
    const suscriptor = await Suscriptor.findOneAndUpdate({ tokenBaja: token }, { activo: false });
    if (suscriptor) {
      titulo = "Te diste de baja del boletín";
      detalle = "No vas a recibir más correos de Nodo Cultural. ¡Gracias por haber estado!";
    }
  }

  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(
    `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<title>Nodo Cultural</title><body style="font-family:Arial,sans-serif;max-width:480px;margin:4rem auto;padding:0 1rem;text-align:center;color:#333">` +
      `<h2>${titulo}</h2><p>${detalle}</p><p><a href="${SITIO_URL()}">Volver a Nodo Cultural</a></p></body></html>`
  );
});

module.exports = router;
