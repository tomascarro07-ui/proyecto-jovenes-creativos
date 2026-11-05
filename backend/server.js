require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { conectarDB } = require("./config/db");
const talleresRoutes = require("./routes/talleres");
const charlasRoutes = require("./routes/charlas");
const recorridosRoutes = require("./routes/recorridos");
const recursosRoutes = require("./routes/recursos");
const authRoutes = require("./routes/auth");
const inscripcionesRoutes = require("./routes/inscripciones");
const valoracionesRoutes = require("./routes/valoraciones");
const museosRoutes = require("./routes/museos");
const mapaRoutes = require("./routes/mapa");
const chatRoutes = require("./routes/chat");
const contactoRoutes = require("./routes/contacto");
const boletinRoutes = require("./routes/boletin");
const buscarRoutes = require("./routes/buscar");
const middlewareIdioma = require("./middleware/idioma");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("Falta JWT_SECRET (mínimo 32 caracteres) en .env");
}

const app = express();
const PUERTO = process.env.PORT || 3000;

// Detrás de Vercel: necesario para que el límite de intentos use la IP real de cada visitante
// TRUST_PROXY = cuántos servidores intermedios hay delante (1 = solo Vercel; 2 = el frontend de Vercel reenvía /api a este backend)
app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);

app.use(helmet());
app.disable("x-powered-by");

// Límite general por visitante: frena el abuso masivo. Cada ruta delicada (login, contacto, chat…) tiene además el suyo.
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    message: { error: "Demasiadas solicitudes. Esperá un momento." },
  })
);
// Orígenes permitidos (separados por coma en FRONTEND_ORIGIN). Con React + Vite en desarrollo
// hay que incluir http://localhost:5173. Se quitan espacios y entradas vacías.
const origenesPermitidos = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: origenesPermitidos }));
// Lectura del cuerpo JSON. La subida de PDF (POST /api/recursos) trae un archivo en base64 y necesita un
// límite mayor: esa ruta lo lee por su cuenta, después de verificar que quien envía es administrador.
const jsonGeneral = express.json({ limit: "100kb" });
app.use((req, res, next) => {
  if (req.method === "POST" && /^\/api\/recursos\/?$/.test(req.path)) return next();
  jsonGeneral(req, res, next);
});

// Idioma del pedido (?idioma=en|pt): deja req.idioma y traduce los mensajes de las respuestas
app.use(middlewareIdioma);

// Conexión a MongoDB reutilizada entre peticiones (necesario en Vercel)
let conexion = null;
function asegurarDB() {
  if (!conexion) conexion = conectarDB();
  return conexion;
}

app.use(async (req, res, next) => {
  try {
    await asegurarDB();
    next();
  } catch (error) {
    conexion = null;
    console.error("Error de MongoDB:", error.message);
    res.status(500).json({ error: "No se pudo conectar a la base de datos" });
  }
});

app.get("/api/salud", (req, res) => {
  res.json({ estado: "ok", mensaje: "El servidor funciona" });
});

// Las respuestas de cuenta e inscripciones son personales: que ningún navegador ni intermediario las guarde
app.use(["/api/auth", "/api/inscripciones"], (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/talleres", talleresRoutes);
app.use("/api/charlas", charlasRoutes);
app.use("/api/recorridos", recorridosRoutes);
app.use("/api/recursos", recursosRoutes);
app.use("/api/inscripciones", inscripcionesRoutes);
app.use("/api/valoraciones", valoracionesRoutes);
app.use("/api/museos", museosRoutes);
app.use("/api/mapa", mapaRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/boletin", boletinRoutes);
app.use("/api/buscar", buscarRoutes);

// Cualquier dirección de /api que no exista
app.use("/api", (req, res) => {
  res.status(404).json({ error: "No encontrado" });
});

// Errores no previstos: se responde siempre en JSON y sin mostrar detalles internos (la causa queda en el log)
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === "entity.too.large") return res.status(413).json({ error: "El pedido es demasiado grande" });
  if (error.type === "entity.parse.failed" || error instanceof SyntaxError) {
    return res.status(400).json({ error: "El pedido no es válido" });
  }
  console.error("Error no controlado:", error.message);
  res.status(500).json({ error: "Ocurrió un error en el servidor" });
});

// Solo escucha en un puerto cuando lo corrés en tu PC (npm run dev)
if (require.main === module) {
  asegurarDB()
    .then(() => {
      app.listen(PUERTO, () => {
        console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
      });
    })
    .catch((error) => {
      console.error("No se pudo conectar a MongoDB:", error.message);
    });
}

module.exports = app;