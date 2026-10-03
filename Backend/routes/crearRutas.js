const { verificarToken, soloAdmin } = require("../middleware/auth");
const express = require("express");
const Valoracion = require("../models/Valoracion");

function crearRutas(Modelo, { nombre, campos, finalizable = false }) {
  const router = express.Router();

  // GET / → lista completa
  router.get("/", async (req, res) => {
    try {
      const items = await Modelo.find().sort({ _id: 1 });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: `No se pudieron obtener: ${nombre}` });
    }
  });

  // GET /:id → uno solo
  router.get("/:id", async (req, res) => {
    try {
      const item = await Modelo.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "No encontrado" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "ID inválido" });
    }
  });

  // POST / → crear (solo se guardan los campos permitidos)
  router.post("/", verificarToken, soloAdmin, async (req, res) => {
    try {
      const datos = {};
      for (const campo of campos) {
        datos[campo] = req.body[campo];
      }
      const nuevo = await Modelo.create(datos);
      res.status(201).json(nuevo);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: `No se pudo crear en: ${nombre}` });
    }
  });

  // PATCH /:id/finalizada → alternar finalizada (solo si corresponde)
  if (finalizable) {
    router.patch("/:id/finalizada", verificarToken, soloAdmin, async (req, res) => {
      try {
        const item = await Modelo.findById(req.params.id);
        if (!item) {
          return res.status(404).json({ error: "No encontrado" });
        }
        item.finalizada = !item.finalizada;
        await item.save();
        res.json(item);
      } catch (error) {
        res.status(400).json({ error: "ID inválido" });
      }
    });
  }

  // DELETE /:id → eliminar
  router.delete("/:id", verificarToken, soloAdmin, async (req, res) => {
    try {
      const item = await Modelo.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "No encontrado" });
      }
      // Borrado en cascada: se eliminan las inscripciones de esa actividad
      if (TIPO_INSCRIPCION[nombre]) {
        await Inscripcion.deleteMany({ tipo: TIPO_INSCRIPCION[nombre], actividad: item._id });
      }
      if (nombre === "recorridos") {
        await Valoracion.deleteMany({
          recorrido: item._id
        });
      }
      res.json({ mensaje: "Eliminado" });
    } catch (error) {
      res.status(400).json({ error: "ID inválido" });
    }
  });

  return router;
}

module.exports = crearRutas;