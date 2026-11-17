const express = require("express");
const mongoose = require("mongoose");
const Inscripcion = require("../models/Inscripcion");
const Taller = require("../models/Taller");
const Charla = require("../models/Charla");
const Recorrido = require("../models/Recorrido");
const { verificarToken, soloAdmin, exigirCorreoVerificado } = require("../middleware/auth");
const { campoTraducido } = require("../config/idioma");
const { limpiar } = require("../config/texto");

const router = express.Router();
const MODELOS = { taller: Taller, charla: Charla, recorrido: Recorrido };

router.post("/", verificarToken, exigirCorreoVerificado, async (req, res) => {
  try {
    const tipo = String(req.body.tipo || "");
    const Modelo = MODELOS[tipo];
    const idActividad = String(req.body.actividad || "");
    const cantidad = 1;
    const nombre = limpiar(req.body.nombre, 80);
    const telefono = limpiar(req.body.telefono, 20);

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
      return res.status(409).json({ error: "Ya estás inscripto en esta actividad", codigo: "ya_inscripto" });
    }

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
    } catch (error) {
      await Modelo.findByIdAndUpdate(idActividad, { $inc: { cupos: cantidad } });
      if (error.code === 11000) {
        return res.status(409).json({ error: "Ya estás inscripto en esta actividad", codigo: "ya_inscripto" });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: "No se pudo completar la inscripción" });
  }
});

router.get("/mias", verificarToken, async (req, res) => {
  try {
    const lista = await Inscripcion.find({ usuario: req.usuario._id }).sort({ createdAt: -1 });

    const estado = {};
    for (const tipo of Object.keys(MODELOS)) {
      const ids = lista.filter((inscripcion) => inscripcion.tipo === tipo).map((inscripcion) => inscripcion.actividad);
      let actividades = [];
      if (ids.length > 0) {
        actividades = await MODELOS[tipo].find({ _id: { $in: ids } }).select("_id finalizada titulo traducciones");
      }
      estado[tipo] = new Map(
        actividades.map((actividad) => [
          String(actividad._id),
          { finalizada: actividad.finalizada, titulo: campoTraducido(actividad, "titulo", req.idioma) },
        ])
      );
    }

    res.json(lista.map((inscripcion) => {
      const actividad = estado[inscripcion.tipo].get(String(inscripcion.actividad));
      let tituloActividad = inscripcion.tituloActividad;
      if (actividad) tituloActividad = actividad.titulo;
      return {
        ...inscripcion.toJSON(),
        tituloActividad,
        disponible: actividad !== undefined,
        finalizada: actividad !== undefined && actividad.finalizada === true,
      };
    }));
  } catch (error) {
    res.status(500).json({ error: "No se pudieron obtener tus inscripciones" });
  }
});

router.get("/actividad/:tipo/:id", verificarToken, soloAdmin, async (req, res) => {
  try {
    const { tipo, id } = req.params;
    if (!MODELOS[tipo] || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Actividad inválida" });
    }
    const lista = await Inscripcion.find({ tipo, actividad: id }).sort({ createdAt: 1 });
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: "No se pudieron obtener los inscriptos" });
  }
});

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
  } catch (error) {
    res.status(500).json({ error: "No se pudo cancelar la inscripción" });
  }
});

module.exports = router;