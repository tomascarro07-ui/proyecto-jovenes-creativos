require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
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

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("Falta JWT_SECRET (mínimo 32 caracteres) en .env");
}

const app = express();
const PUERTO = process.env.PORT || 3000;

// Detrás de Vercel: necesario para que el límite de intentos use la IP real de cada visitante
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: (process.env.FRONTEND_ORIGIN || "").split(",") }));
app.use(express.json({ limit: "100kb" }));

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