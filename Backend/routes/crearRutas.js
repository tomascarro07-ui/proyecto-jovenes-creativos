const { verificarToken, soloAdmin } = require("../middleware/auth");
const express = require("express");
const Valoracion = require("../models/Valoracion");
const mongoose = require("mongoose");
const Museo = require("../models/Museo");
const Inscripcion = require("../models/Inscripcion");
const { localizar } = require("../config/idioma");
const TIPO_INSCRIPCION = { talleres: "taller", charlas: "charla", recorridos: "recorrido" };

// traducibles: campos de texto que pueden venir traducidos (en / pt) desde la propiedad "traducciones" del documento
function crearRutas(Modelo, { nombre, campos, traducibles = [], finalizable = false }) {
  const router = express.Router();

  // GET / → lista completa
  router.get("/", async (req, res) => {
    try {
      const items = await Modelo.find().sort({ _id: 1 });
      res.json(items.map((i) => localizar(i, req.idioma, traducibles)));
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
      res.json(localizar(item, req.idioma, traducibles));
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

    // PATCH /:id/ubicacion → fijar coordenadas (solo admin)
    router.patch("/:id/ubicacion", verificarToken, soloAdmin, async (req, res) => {
    try {
      const { lat, lng, museo } = req.body;
      let cambios;

      if (museo) {
        if (!mongoose.isValidObjectId(museo) || !(await Museo.exists({ _id: museo }))) {
          return res.status(400).json({ error: "Museo inválido" });
        }
        cambios = { museo, lat: null, lng: null };
      } else {
        if (typeof lat !== "number" || typeof lng !== "number" || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
          return res.status(400).json({ error: "Coordenadas inválidas" });
        }
        cambios = { museo: null, lat, lng };
      }

      const item = await Modelo.findByIdAndUpdate(req.params.id, cambios, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ error: "No encontrado" });
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "No se pudo guardar la ubicación" });
    }
  });
  
  return router;
}

module.exports = crearRutas;