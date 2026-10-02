const express = require("express");
const Taller = require("../models/Taller");

const router = express.Router();

// GET /api/talleres  → lista completa
router.get("/", async (req, res) => {
  try {
    const talleres = await Taller.find().sort({ _id: 1 });
    res.json(talleres);
  } catch (error) {
    res.status(500).json({ error: "No se pudieron obtener los talleres" });
  }
});

// GET /api/talleres/:id  → un taller
router.get("/:id", async (req, res) => {
  try {
    const taller = await Taller.findById(req.params.id);
    if (!taller) {
      return res.status(404).json({ error: "Taller no encontrado" });
    }
    res.json(taller);
  } catch (error) {
    res.status(400).json({ error: "ID inválido" });
  }
});

// POST /api/talleres → crear un taller
router.post("/", async (req, res) => {
  try {
    const { titulo, nivel, modalidad, cantClases, cupos, imagen, descripcionCorta } = req.body;

    const taller = await Taller.create({
      titulo, nivel, modalidad, cantClases, cupos, imagen, descripcionCorta,
    });

    res.status(201).json(taller);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "No se pudo crear el taller" });
  }
});

// PATCH /api/talleres/:id/finalizada → alternar finalizada sí/no
router.patch("/:id/finalizada", async (req, res) => {
  try {
    const taller = await Taller.findById(req.params.id);
    if (!taller) {
      return res.status(404).json({ error: "Taller no encontrado" });
    }

    taller.finalizada = !taller.finalizada;
    await taller.save();

    res.json(taller);
  } catch (error) {
    res.status(400).json({ error: "ID inválido" });
  }
});

// DELETE /api/talleres/:id → eliminar un taller
router.delete("/:id", async (req, res) => {
  try {
    const taller = await Taller.findByIdAndDelete(req.params.id);
    if (!taller) {
      return res.status(404).json({ error: "Taller no encontrado" });
    }

    res.json({ mensaje: "Taller eliminado" });
  } catch (error) {
    res.status(400).json({ error: "ID inválido" });
  }
});

module.exports = router;