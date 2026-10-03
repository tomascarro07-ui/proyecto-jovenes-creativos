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

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("Falta JWT_SECRET (mínimo 32 caracteres) en .env");
}

const app = express();
const PUERTO = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: (process.env.FRONTEND_ORIGIN || "").split(",") }));
app.use(express.json({ limit: "100kb" }));

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

conectarDB()
  .then(() => {
    app.listen(PUERTO, () => {
      console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
    });
  })
  .catch((error) => {
    console.error("No se pudo conectar a MongoDB:", error.message);
  });