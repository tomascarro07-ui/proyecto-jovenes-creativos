const express = require("express");
const mongoose = require("mongoose");
const Inscripcion = require("../models/Inscripcion");
const Taller = require("../models/Taller");
const Charla = require("../models/Charla");
const Recorrido = require("../models/Recorrido");
const { verificarToken, soloAdmin } = require("../middleware/auth");

const router = express.Router();
const MODELOS = { taller: Taller, charla: Charla, recorrido: Recorrido };
const limpiar = (t) => String(t || "").replace(/[<>]/g, "").trim();

// POST /api/inscripciones → anotarse (descuenta cupos)
router.post("/", verificarToken, async (req, res) => {
  try {
    const tipo = String(req.body.tipo || "");
    const Modelo = MODELOS[tipo];
    const idActividad = String(req.body.actividad || "");
    const cantidad = Number(req.body.cantidadPersonas);
    const nombre = limpiar(req.body.nombre);
    const telefono = limpiar(req.body.telefono);

    if (!Modelo || !mongoose.isValidObjectId(idActividad)) {
      return res.status(400).json({ error: "Actividad inválida" });
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) {
      return res.status(400).json({ error: "Cantidad de personas inválida" });
    }
    if (!nombre || !telefono) {
      return res.status(400).json({ error: "Completá nombre y teléfono" });
    }

    const yaAnotado = await Inscripcion.findOne({ usuario: req.usuario._id, tipo, actividad: idActividad });
    if (yaAnotado) {
      return res.status(409).json({ error: "Ya estás inscripto en esta actividad" });
    }

    // Descuento atómico: solo se aplica si hay cupos suficientes y la actividad no terminó
    const actividad = await Modelo.findOneAndUpdate(
      { _id: idActividad, finalizada: false, cupos: { $gte: cantidad } },
      { $inc: { cupos: -cantidad } },
      { new: true }
    );
    if (!actividad) {
      return res.status(409).json({ error: "No hay cupos suficientes o la actividad ya finalizó" });
    }

    try {
      const inscripcion = await Inscripcion.create({
        usuario: req.usuario._id,
        tipo,
        actividad: idActividad,
        tituloActividad: actividad.titulo,
        nombre,
        correo: req.usuario.correo,
        telefono,
        cantidadPersonas: cantidad,
      });
      res.status(201).json(inscripcion);
    } catch (e) {
      await Modelo.findByIdAndUpdate(idActividad, { $inc: { cupos: cantidad } }); // devolver cupos
      if (e.code === 11000) {
        return res.status(409).json({ error: "Ya estás inscripto en esta actividad" });
      }
      throw e;
    }
  } catch (e) {
    res.status(500).json({ error: "No se pudo completar la inscripción" });
  }
});

// GET /api/inscripciones/mias → inscripciones del usuario logueado
router.get("/mias", verificarToken, async (req, res) => {
  try {
    const lista = await Inscripcion.find({ usuario: req.usuario._id }).sort({ createdAt: -1 });
    res.json(lista);
  } catch (e) {
    res.status(500).json({ error: "No se pudieron obtener tus inscripciones" });
  }
});

// GET /api/inscripciones/actividad/:tipo/:id → inscriptos (solo admin)
router.get("/actividad/:tipo/:id", verificarToken, soloAdmin, async (req, res) => {
  try {
    const { tipo, id } = req.params;
    if (!MODELOS[tipo] || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Actividad inválida" });
    }
    const lista = await Inscripcion.find({ tipo, actividad: id }).sort({ createdAt: 1 });
    res.json(lista);
  } catch (e) {
    res.status(500).json({ error: "No se pudieron obtener los inscriptos" });
  }
});

// DELETE /api/inscripciones/:id → cancelar (dueño o admin) y devolver cupos
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const ins = await Inscripcion.findById(req.params.id);
    if (!ins) return res.status(404).json({ error: "No encontrada" });

    const esDueno = String(ins.usuario) === String(req.usuario._id);
    if (!esDueno && !req.usuario.esAdministrador) {
      return res.status(403).json({ error: "No podés cancelar esta inscripción" });
    }

    await ins.deleteOne();
    await MODELOS[ins.tipo].findByIdAndUpdate(ins.actividad, { $inc: { cupos: ins.cantidadPersonas } });
    res.json({ mensaje: "Inscripción cancelada" });
  } catch (e) {
    res.status(500).json({ error: "No se pudo cancelar la inscripción" });
  }
});

module.exports = router;