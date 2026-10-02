require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { conectarDB } = require("./config/db");
const talleresRoutes = require("./routes/talleres");

const charlasRoutes = require("./routes/charlas");
const recorridosRoutes = require("./routes/recorridos");
const recursosRoutes = require("./routes/recursos");

const app = express();
const PUERTO = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/salud", (req, res) => {
  res.json({ estado: "ok", mensaje: "El servidor funciona" });
});

app.use("/api/talleres", talleresRoutes);

app.use("/api/charlas", charlasRoutes);
app.use("/api/recorridos", recorridosRoutes);
app.use("/api/recursos", recursosRoutes);

conectarDB()
  .then(() => {
    app.listen(PUERTO, () => {
      console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
    });
  })
  .catch((error) => {
    console.error("No se pudo conectar a MongoDB:", error.message);
  });