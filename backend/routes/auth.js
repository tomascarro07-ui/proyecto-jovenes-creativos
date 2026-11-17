const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { limitar } = require("../config/limitador");
const { EMAIL_VALIDO, limpiar } = require("../config/texto");
const Usuario = require("../models/Usuario");
const ReinicioContrasenia = require("../models/ReinicioContrasenia");
const VerificacionCorreo = require("../models/VerificacionCorreo");
const { iniciarSesion, cerrarSesion } = require("../config/sesion");
const { validarContrasenia } = require("../config/contrasenia");
const { verificarToken } = require("../middleware/auth");
const { enviarCorreo } = require("../config/correo");
const { correoVerificacion, correoRestablecer } = require("../config/correosTextos");

const router = express.Router();

const limitador = limitar({ max: 20, mensaje: "Demasiados intentos. Probá de nuevo en 15 minutos." });

const limitadorPorCuenta = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => "cuenta:" + String((req.body && req.body.correo) || "").toLowerCase().trim().slice(0, 120),
  validate: { keyGeneratorIpFallback: false },
  message: { error: "Demasiados intentos con esta cuenta. Probá de nuevo en 15 minutos." },
});

const HASH_FALSO = bcrypt.hashSync("no-existe", 12);

function datosPublicos(usuario) {
  return {
    id: usuario._id, correo: usuario.correo, nombre: usuario.nombre, apellido: usuario.apellido,
    telefono: usuario.telefono || "", fechaNacimiento: usuario.fechaNacimiento || "",
    bio: usuario.bio || "", foto: usuario.foto || "",
    esAdministrador: usuario.esAdministrador, creadoEn: usuario.createdAt,
    correoVerificado: usuario.pendienteVerificacion !== true,
  };
}
router.post("/registro", limitador, async (req, res) => {
  try {
    const correo = String(req.body.correo || "").toLowerCase().trim();
    const contrasenia = String(req.body.contrasenia || "");
    const nombre = limpiar(req.body.nombre, 40);

    if (!EMAIL_VALIDO.test(correo)) {
      return res.status(400).json({ error: "Correo inválido" });
    }
    if (correo.length > 60) return res.status(400).json({ error: "El correo es demasiado largo" });
    const errorContrasenia = validarContrasenia(contrasenia);
    if (errorContrasenia) return res.status(400).json({ error: errorContrasenia });
    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    if (await Usuario.findOne({ correo })) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese correo" });
    }

    const usuario = await Usuario.create({
      correo,
      nombre,
      apellido: limpiar(req.body.apellido, 40),
      fechaNacimiento: limpiar(req.body.fechaNacimiento, 10),
      contrasenia: await bcrypt.hash(contrasenia, 12),
      esAdministrador: false,
      pendienteVerificacion: true,
    });

    await enviarVerificacion(usuario, req.idioma).catch((error) => console.error("No se pudo enviar la verificación:", error.message));

    res.status(201).json({
      usuario: datosPublicos(usuario),
      mensaje: "Cuenta creada. Te enviamos un correo para confirmarla.",
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "Ya existe una cuenta con ese correo" });
    if (error.name === "ValidationError") return res.status(400).json({ error: "Revisá los datos ingresados" });
    res.status(500).json({ error: "No se pudo registrar el usuario" });
  }
});

router.post("/login", limitador, limitadorPorCuenta, async (req, res) => {
  try {
    const correo = String(req.body.correo || "").toLowerCase().trim();
    const contrasenia = String(req.body.contrasenia || "");
    const usuario = await Usuario.findOne({ correo }).select("+contrasenia");

    let hashAComparar = HASH_FALSO;
    if (usuario) hashAComparar = usuario.contrasenia;
    const contraseniaCorrecta = await bcrypt.compare(contrasenia, hashAComparar);
    if (!usuario || !contraseniaCorrecta) {
      return res.status(401).json({ error: "Los datos ingresados son incorrectos" });
    }
    res.json(iniciarSesion(res, usuario, datosPublicos(usuario)));
  } catch (error) {
    res.status(500).json({ error: "No se pudo iniciar sesión" });
  }
});

router.get("/yo", verificarToken, (req, res) => {
  res.json({ usuario: datosPublicos(req.usuario) });
});

const TEL_OK = /^[0-9+\s()-]{0,20}$/;
const FOTO_OK = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

router.patch("/yo", verificarToken, async (req, res) => {
  try {
    const usuario = req.usuario;
    const datos = req.body;

    if (datos.nombre !== undefined) {
      const nombre = limpiar(datos.nombre, 40);
      if (!nombre) return res.status(400).json({ error: "El nombre no puede estar vacío" });
      usuario.nombre = nombre;
    }
    if (datos.apellido !== undefined) usuario.apellido = limpiar(datos.apellido, 40);
    if (datos.bio !== undefined) usuario.bio = limpiar(datos.bio, 200);
    if (datos.fechaNacimiento !== undefined) usuario.fechaNacimiento = limpiar(datos.fechaNacimiento, 10);
    if (datos.telefono !== undefined) {
      const telefono = limpiar(datos.telefono, 21);
      if (!TEL_OK.test(telefono)) return res.status(400).json({ error: "Teléfono inválido" });
      usuario.telefono = telefono;
    }
    if (datos.foto !== undefined) {
      const foto = String(datos.foto);
      if (foto !== "" && (foto.length > 70000 || !FOTO_OK.test(foto))) {
        return res.status(400).json({ error: "La foto no es válida o pesa demasiado" });
      }
      usuario.foto = foto;
    }

    await usuario.save();
    res.json({ usuario: datosPublicos(usuario) });
  } catch (error) {
    res.status(400).json({ error: "No se pudo actualizar el perfil" });
  }
});

router.patch("/contrasenia", limitador, verificarToken, async (req, res) => {
  try {
    const actual = String(req.body.actual || "");
    const nueva = String(req.body.nueva || "");
    const errorNueva = validarContrasenia(nueva, true);
    if (errorNueva) return res.status(400).json({ error: errorNueva });
    const usuario = await Usuario.findById(req.usuario._id).select("+contrasenia");
    if (!(await bcrypt.compare(actual, usuario.contrasenia))) {
      return res.status(400).json({ error: "La contraseña actual es incorrecta" });
    }
    usuario.contrasenia = await bcrypt.hash(nueva, 12);
    usuario.contraseniaCambiadaEn = new Date(Math.floor(Date.now() / 1000) * 1000);
    await usuario.save();
    res.json({ mensaje: "Contraseña actualizada", ...iniciarSesion(res, usuario, datosPublicos(usuario)) });
  } catch (error) {
    res.status(500).json({ error: "No se pudo cambiar la contraseña" });
  }
});

const MINUTOS_VALIDEZ = 30;

const limitadorRecuperacion = limitar({ max: 5, mensaje: "Demasiados intentos. Probá de nuevo en 15 minutos." });

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

function urlFrontend() {
  const base = process.env.FRONTEND_URL || (process.env.FRONTEND_ORIGIN || "").split(",")[0];
  return String(base || "").trim().replace(/\/+$/, "");
}

router.post("/olvide-contrasenia", limitadorRecuperacion, async (req, res) => {
  const respuesta = {
    mensaje: "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisá también la carpeta de spam.",
  };
  try {
    const correo = String(req.body.correo || "").toLowerCase().trim();
    if (!EMAIL_VALIDO.test(correo)) {
      return res.status(400).json({ error: "Correo inválido" });
    }

    const usuario = await Usuario.findOne({ correo });
    if (usuario) {
      await ReinicioContrasenia.deleteMany({ usuario: usuario._id });

      const token = crypto.randomBytes(32).toString("hex");
      await ReinicioContrasenia.create({
        usuario: usuario._id,
        tokenHash: hashToken(token),
        expira: new Date(Date.now() + MINUTOS_VALIDEZ * 60 * 1000),
      });

      const enlace = `${urlFrontend()}/restablecer-contrasenia?token=${token}`;
      const correo = correoRestablecer({ nombre: usuario.nombre, enlace, minutos: MINUTOS_VALIDEZ, idioma: req.idioma });

      await enviarCorreo({ para: usuario.correo, ...correo });
    }
    res.json(respuesta);
  } catch (error) {
    console.error("Error en olvide-contrasenia:", error.message);
    res.json(respuesta);
  }
});

router.post("/restablecer-contrasenia", limitadorRecuperacion, async (req, res) => {
  try {
    const token = String(req.body.token || "");
    const nueva = String(req.body.nueva || "");
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return res.status(400).json({ error: "El enlace no es válido o ya venció. Pedí uno nuevo." });
    }
    const errorNueva = validarContrasenia(nueva, true);
    if (errorNueva) return res.status(400).json({ error: errorNueva });

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
    usuario.contraseniaCambiadaEn = new Date(Math.floor(Date.now() / 1000) * 1000);
    await usuario.save();
    await ReinicioContrasenia.deleteMany({ usuario: usuario._id });

    res.json({ mensaje: "Contraseña actualizada. Ya podés iniciar sesión." });
  } catch (error) {
    res.status(500).json({ error: "No se pudo restablecer la contraseña" });
  }
});

router.post("/salir", (req, res) => {
  cerrarSesion(res);
  res.json({ mensaje: "Sesión cerrada" });
});

const HORAS_VERIFICACION = 24;

const limitadorVerificacion = limitar({ max: 10, mensaje: "Demasiados intentos. Probá de nuevo en 15 minutos." });

async function enviarVerificacion(usuario, idioma) {
  await VerificacionCorreo.deleteMany({ usuario: usuario._id });

  const token = crypto.randomBytes(32).toString("hex");
  await VerificacionCorreo.create({
    usuario: usuario._id,
    tokenHash: hashToken(token),
    expira: new Date(Date.now() + HORAS_VERIFICACION * 60 * 60 * 1000),
  });

  const enlace = `${urlFrontend()}/verificar-correo?token=${token}`;
  const correo = correoVerificacion({ nombre: usuario.nombre, enlace, horas: HORAS_VERIFICACION, idioma });
  await enviarCorreo({ para: usuario.correo, ...correo });
}

router.post("/verificar-correo", limitadorVerificacion, async (req, res) => {
  try {
    const token = String(req.body.token || "");
    const error = { error: "El enlace no es válido o ya venció. Pedí uno nuevo desde tu cuenta." };
    if (!/^[a-f0-9]{64}$/.test(token)) return res.status(400).json(error);

    const pedido = await VerificacionCorreo.findOneAndDelete({
      tokenHash: hashToken(token),
      expira: { $gt: new Date() },
    });
    if (!pedido) return res.status(400).json(error);

    await Usuario.updateOne({ _id: pedido.usuario }, { $set: { pendienteVerificacion: false } });
    await VerificacionCorreo.deleteMany({ usuario: pedido.usuario });
    res.json({ mensaje: "¡Listo! Tu correo quedó confirmado.", correoVerificado: true });
  } catch (error) {
    res.status(500).json({ error: "No se pudo verificar el correo" });
  }
});

router.post("/reenviar-verificacion", limitadorVerificacion, verificarToken, async (req, res) => {
  try {
    if (req.usuario.pendienteVerificacion !== true) {
      return res.json({ mensaje: "Tu correo ya está confirmado.", correoVerificado: true });
    }
    await enviarVerificacion(req.usuario, req.idioma);
    res.json({ mensaje: "Te enviamos un correo nuevo. Revisá también la carpeta de spam." });
  } catch (error) {
    console.error("Error al reenviar verificación:", error.message);
    res.status(500).json({ error: "No se pudo enviar el correo. Probá de nuevo en unos minutos." });
  }
});

module.exports = router;
