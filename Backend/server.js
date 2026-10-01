const express = require("express");
const cors = require("cors");

const app = express();
const PUERTO = process.env.PORT || 3000;

app.use(cors());          
app.use(express.json());  

app.get("/api/salud", (req, res) => {
  res.json({ estado: "ok", mensaje: "El servidor funciona" });
});

app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});