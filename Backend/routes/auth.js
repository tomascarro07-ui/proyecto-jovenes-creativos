const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const Usuario = require("../models/Usuario");
const ReinicioContrasenia = require("../models/ReinicioContrasenia");
const VerificacionCorreo = require("../models/VerificacionCorreo");
const { iniciarSesion, cerrarSesion } = require("../config/sesion");
const { verificarToken } = require("../middleware/auth");
const { enviarCorreo, escaparHTML } = require("../config/correo");
const { correoVerificacion, correoRestablecer } = require("../config/correosTextos");

const router = express.Router();

const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Demasiados intentos. Probá de nuevo en 15 minutos." },
});

const HASH_FALSO = bcrypt.hashSync("no-existe", 12); // evita revelar si el correo existe por tiempo de respuesta
const limpiar = (t) => String(t || "").replace(/[<>]/g, "").trim();

function datosPublicos(u) {
  return {
    id: u._id, correo: u.correo, nombre: u.nombre, apellido: u.apellido,
    telefono: u.telefono || "", fechaNacimiento: u.fechaNacimiento || "",
    bio: u.bio || "", foto: u.foto || "",
    esAdministrador: u.esAdministrador, creadoEn: u.createdAt,
    correoVerificado: u.pendienteVerificacion !== true,
  };
}
// POST /api/auth/registro  (SIEMPRE crea usuarios normales)
router.post("/registro", limitador, async (req, res) => {
  try {
    const correo = String(req.body.correo || "").toLowerCase().trim();
    const contrasenia = String(req.body.contrasenia || "");
    const nombre = limpiar(req.body.nombre);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ error: "Correo inválido" });
    }
    if (contrasenia.length < 8) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    }
    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    if (await Usuario.findOne({ correo })) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese correo" });
    }

    const usuario = await Usuario.create({
      correo,
      nombre,
      apellido: limpiar(req.body.apellido),
      fechaNacimiento: limpiar(req.body.fechaNacimiento),
      contrasenia: await bcrypt.hash(contrasenia, 12),
      esAdministrador: false, // nunca se toma del body
      pendienteVerificacion: true,
    });

    // El registro no abre sesión: se pide iniciar sesión. Si el correo falla, la cuenta igual queda creada
    // y se puede pedir otro enlace desde el aviso del sitio.
    await enviarVerificacion(usuario, req.idioma).catch((e) => console.error("No se pudo enviar la verificación:", e.message));

    res.status(201).json({
      usuario: datosPublicos(usuario),
      mensaje: "Cuenta creada. Te enviamos un correo para confirmarla.",
    });
  } catch (e) {
    res.status(500).json({ error: "No se pudo registrar el usuario" });
  }
});

// POST /api/auth/login
router.post("/login", limitador, async (req, res) => {
  try {
    const correo = String(req.body.correo || "").toLowerCase().trim();
    const contrasenia = String(req.body.contrasenia || "");
    const usuario = await Usuario.findOne({ correo }).select("+contrasenia");

    const ok = await bcrypt.compare(contrasenia, usuario ? usuario.contrasenia : HASH_FALSO);
    if (!usuario || !ok) {
      return res.status(401).json({ error: "Los datos ingresados son incorrectos" });
    }
    res.json(iniciarSesion(res, usuario, datosPublicos(usuario)));
  } catch (e) {
    res.status(500).json({ error: "No se pudo iniciar sesión" });
  }
});

// GET /api/auth/yo  → el frontend lo usa para validar la sesión de verdad
router.get("/yo", verificarToken, (req, res) => {
  res.json({ usuario: datosPublicos(req.usuario) });
});

const TEL_OK = /^[0-9+\s()-]{0,20}$/;
const FOTO_OK = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

// PATCH /api/auth/yo → editar mi perfil
router.patch("/yo", verificarToken, async (req, res) => {
  try {
    const u = req.usuario;
    const b = req.body;

    if (b.nombre !== undefined) {
      const nombre = limpiar(b.nombre);
      if (!nombre) return res.status(400).json({ error: "El nombre no puede estar vacío" });
      u.nombre = nombre;
    }
    if (b.apellido !== undefined) u.apellido = limpiar(b.apellido);
    if (b.bio !== undefined) u.bio = limpiar(b.bio);
    if (b.fechaNacimiento !== undefined) u.fechaNacimiento = limpiar(b.fechaNacimiento);
    if (b.telefono !== undefined) {
      const tel = limpiar(b.telefono);
      if (!TEL_OK.test(tel)) return res.status(400).json({ error: "Teléfono inválido" });
      u.telefono = tel;
    }
    if (b.foto !== undefined) {
      const foto = String(b.foto);
      if (foto !== "" && (foto.length > 70000 || !FOTO_OK.test(foto))) {
        return res.status(400).json({ error: "La foto no es válida o pesa demasiado" });
      }
      u.foto = foto;
    }

    await u.save();
    res.json({ usuario: datosPublicos(u) });
  } catch (e) {
    res.status(400).json({ error: "No se pudo actualizar el perfil" });
  }
});

// PATCH /api/auth/contrasenia
router.patch("/contrasenia", limitador, verificarToken, async (req, res) => {
  try {
    const actual = String(req.body.actual || "");
    const nueva = String(req.body.nueva || "");
    if (nueva.length < 8) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
    }
    const u = await Usuario.findById(req.usuario._id).select("+contrasenia");
    if (!(await bcrypt.compare(actual, u.contrasenia))) {
      // 400 y no 401: un 401 haría que el frontend cierre la sesión
      return res.status(400).json({ error: "La contraseña actual es incorrecta" });
    }
    u.contrasenia = await bcrypt.hash(nueva, 12);
    await u.save();
    res.json({ mensaje: "Contraseña actualizada" });
  } catch (e) {
    res.status(500).json({ error: "No se pudo cambiar la contraseña" });
  }
});

// ───────────── Recuperación de contraseña ─────────────
const MINUTOS_VALIDEZ = 30;

const limitadorRecuperacion = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Demasiados intentos. Probá de nuevo en 15 minutos." },
});

const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

function urlFrontend() {
  const base = process.env.FRONTEND_URL || (process.env.FRONTEND_ORIGIN || "").split(",")[0];
  return String(base || "").trim().replace(/\/+$/, "");
}

// POST /api/auth/olvide-contrasenia  { correo }
// Responde SIEMPRE lo mismo, exista o no el correo (no revela qué cuentas existen).
router.post("/olvide-contrasenia", limitadorRecuperacion, async (req, res) => {
  const respuesta = {
    mensaje: "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisá también la carpeta de spam.",
  };
  try {
    const correo = String(req.body.correo || "").toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ error: "Correo inválido" });
    }

    const usuario = await Usuario.findOne({ correo });
    if (usuario) {
      // Un solo enlace vigente por usuario: los pedidos anteriores quedan invalidados.
      await ReinicioContrasenia.deleteMany({ usuario: usuario._id });

      const token = crypto.randomBytes(32).toString("hex"); // 256 bits aleatorios
      await ReinicioContrasenia.create({
        usuario: usuario._id,
        tokenHash: hashToken(token),
        expira: new Date(Date.now() + MINUTOS_VALIDEZ * 60 * 1000),
      });

      const enlace = `${urlFrontend()}/restablecer-contrasenia.html?token=${token}`;
      const correo = correoRestablecer({ nombre: usuario.nombre, enlace, minutos: MINUTOS_VALIDEZ, idioma: req.idioma });

      // En Vercel hay que esperar el envío antes de responder.
      await enviarCorreo({ para: usuario.correo, ...correo });
    }
    res.json(respuesta);
  } catch (e) {
    // El error real queda en el log; al visitante se le responde igual para no filtrar información.
    console.error("Error en olvide-contrasenia:", e.message);
    res.json(respuesta);
  }
});

// POST /api/auth/restablecer-contrasenia  { token, nueva }
router.post("/restablecer-contrasenia", limitadorRecuperacion, async (req, res) => {
  try {
    const token = String(req.body.token || "");
    const nueva = String(req.body.nueva || "");
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return res.status(400).json({ error: "El enlace no es válido o ya venció. Pedí uno nuevo." });
    }
    if (nueva.length < 8) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
    }

    // findOneAndDelete es atómico: si dos pedidos llegan a la vez, solo uno obtiene el documento.
    const reinicio = await ReinicioContrasenia.findOneAndDelete({
      tokenHash: hashToken(token),
      expira: { $gt: new Date() },
    });
    if (!reinicio) {
      return res.status(400).json({ error: "El enlace no es válido o ya venció. Pedí uno nuevo." });
    }

    const usuario = await Usuario.findById(reinicio.usuario).select("+contrasenia");
    if (!usuario) {
      return res.status(400).json({ error: "El enlace no es válido o ya venció. Pedí uno nuevo." });
    }
    usuario.contrasenia = await bcrypt.hash(nueva, 12);
    usuario.contraseniaCambiadaEn = new Date(); // cierra las sesiones abiertas (JWT anteriores)
    await usuario.save();
    await ReinicioContrasenia.deleteMany({ usuario: usuario._id });

    res.json({ mensaje: "Contraseña actualizada. Ya podés iniciar sesión." });
  } catch (e) {
    res.status(500).json({ error: "No se pudo restablecer la contraseña" });
  }
});

// ───────────── Cerrar sesión ─────────────
// POST /api/auth/salir → borra la cookie de sesión (en modo anterior no hace falta, pero no molesta)
router.post("/salir", (req, res) => {
  cerrarSesion(res);
  res.json({ mensaje: "Sesión cerrada" });
});

// ───────────── Verificación de correo ─────────────
const HORAS_VERIFICACION = 24;

const limitadorVerificacion = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos. Probá de nuevo en 15 minutos." },
});

// Genera un enlace nuevo (invalida los anteriores) y lo manda por correo.
async function enviarVerificacion(usuario, idioma) {
  await VerificacionCorreo.deleteMany({ usuario: usuario._id });

  const token = crypto.randomBytes(32).toString("hex");
  await VerificacionCorreo.create({
    usuario: usuario._id,
    tokenHash: hashToken(token),
    expira: new Date(Date.now() + HORAS_VERIFICACION * 60 * 60 * 1000),
  });

  const enlace = `${urlFrontend()}/verificar-correo.html?token=${token}`;
  const correo = correoVerificacion({ nombre: usuario.nombre, enlace, horas: HORAS_VERIFICACION, idioma });
  await enviarCorreo({ para: usuario.correo, ...correo });
}

// POST /api/auth/verificar-correo  { token }
router.post("/verificar-correo", limitadorVerificacion, async (req, res) => {
  try {
    const token = String(req.body.token || "");
    const error = { error: "El enlace no es válido o ya venció. Pedí uno nuevo desde tu cuenta." };
    if (!/^[a-f0-9]{64}$/.test(token)) return res.status(400).json(error);

    // Atómico y de un solo uso, igual que el restablecimiento de contraseña
    const pedido = await VerificacionCorreo.findOneAndDelete({
      tokenHash: hashToken(token),
      expira: { $gt: new Date() },
    });
    if (!pedido) return res.status(400).json(error);

    await Usuario.updateOne({ _id: pedido.usuario }, { $set: { pendienteVerificacion: false } });
    await VerificacionCorreo.deleteMany({ usuario: pedido.usuario });
    res.json({ mensaje: "¡Listo! Tu correo quedó confirmado.", correoVerificado: true });
  } catch (e) {
    res.status(500).json({ error: "No se pudo verificar el correo" });
  }
});

// POST /api/auth/reenviar-verificacion  (con sesión iniciada)
router.post("/reenviar-verificacion", limitadorVerificacion, verificarToken, async (req, res) => {
  try {
    if (req.usuario.pendienteVerificacion !== true) {
      return res.json({ mensaje: "Tu correo ya está confirmado.", correoVerificado: true });
    }
    await enviarVerificacion(req.usuario, req.idioma);
    res.json({ mensaje: "Te enviamos un correo nuevo. Revisá también la carpeta de spam." });
  } catch (e) {
    console.error("Error al reenviar verificación:", e.message);
    res.status(500).json({ error: "No se pudo enviar el correo. Probá de nuevo en unos minutos." });
  }
});

module.exports = router;
