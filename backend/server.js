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
const imagenesRoutes = require("./routes/imagenes");
const adminRoutes = require("./routes/admin");
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

app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);

app.use(helmet());
app.disable("x-powered-by");

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    message: { error: "Demasiadas solicitudes. Esperá un momento." },
  })
);
const origenesPermitidos = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);
app.use(cors({ origin: origenesPermitidos }));
const jsonGeneral = express.json({ limit: "100kb" });
const CUERPO_GRANDE = [
  ["POST", /^\/api\/recursos\/?$/],
  ["PUT", /^\/api\/recursos\/[^/]+\/?$/],
  ["POST", /^\/api\/imagenes\/?$/],
];
app.use((req, res, next) => {
  if (CUERPO_GRANDE.some(([metodo, ruta]) => req.method === metodo && ruta.test(req.path))) return next();
  jsonGeneral(req, res, next);
});
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

app.use(middlewareIdioma);

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

app.use(["/api/auth", "/api/inscripciones", "/api/admin"], (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/talleres", talleresRoutes);
app.use("/api/charlas", charlasRoutes);
app.use("/api/recorridos", recorridosRoutes);
app.use("/api/recursos", recursosRoutes);
app.use("/api/imagenes", imagenesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inscripciones", inscripcionesRoutes);
app.use("/api/valoraciones", valoracionesRoutes);
app.use("/api/museos", museosRoutes);
app.use("/api/mapa", mapaRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/boletin", boletinRoutes);
app.use("/api/buscar", buscarRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "No encontrado" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === "entity.too.large") return res.status(413).json({ error: "El pedido es demasiado grande" });
  if (error.type === "entity.parse.failed" || error instanceof SyntaxError) {
    return res.status(400).json({ error: "El pedido no es válido" });
  }
  console.error("Error no controlado:", error.message);
  res.status(500).json({ error: "Ocurrió un error en el servidor" });
});

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
