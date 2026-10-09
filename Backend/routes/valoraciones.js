const express = require("express");
const mongoose = require("mongoose");
const Valoracion = require("../models/Valoracion");
const Recorrido = require("../models/Recorrido");
const Inscripcion = require("../models/Inscripcion");
const { verificarToken, exigirCorreoVerificado } = require("../middleware/auth");

const router = express.Router();
const limpiar = (t) => String(t || "").replace(/[<>]/g, "").trim();

async function puedeValorar(usuarioId, recorridoId) {
  const recorrido = await Recorrido.findById(recorridoId).select("finalizada");
  if (!recorrido) return { puede: false, motivo: "El recorrido no existe" };
  if (!recorrido.finalizada) {
    return { puede: false, motivo: "Vas a poder valorarlo cuando el recorrido haya finalizado." };
  }
  const participo = await Inscripcion.exists({ usuario: usuarioId, tipo: "recorrido", actividad: recorridoId });
  if (!participo) {
    return { puede: false, motivo: "Solo pueden valorar quienes se inscribieron y participaron del recorrido." };
  }
  return { puede: true };
}

// GET /api/valoraciones/recorrido/:id  (público)
router.get("/recorrido/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "ID inválido" });

    const lista = await Valoracion.find({ recorrido: req.params.id })
      .sort({ createdAt: -1 })
      .populate("usuario", "nombre apellido foto");

    const total = lista.length;
    const suma = lista.reduce((t, v) => t + v.estrellas, 0);

    res.json({
      promedio: total ? Math.round((suma / total) * 10) / 10 : 0,
      total,
      distribucion: [5, 4, 3, 2, 1].map((n) => ({ estrellas: n, cantidad: lista.filter((v) => v.estrellas === n).length })),
      valoraciones: lista.map((v) => ({
        id: v.id,
        estrellas: v.estrellas,
        comentario: v.comentario,
        creadaEn: v.createdAt,
        autor: {
          nombre: v.usuario ? v.usuario.nombre + (v.usuario.apellido ? " " + v.usuario.apellido.charAt(0) + "." : "") : "Usuario",
          foto: v.usuario ? v.usuario.foto : "",
        },
      })),
    });
  } catch (e) {
    res.status(500).json({ error: "No se pudieron obtener las valoraciones" });
  }
});

// GET /api/valoraciones/elegibilidad/:id  (¿puedo valorar? ¿ya valoré?)
router.get("/elegibilidad/:id", verificarToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "ID inválido" });
    const estado = await puedeValorar(req.usuario._id, req.params.id);
    const mia = await Valoracion.findOne({ usuario: req.usuario._id, recorrido: req.params.id });
    res.json({ ...estado, mia: mia ? { estrellas: mia.estrellas, comentario: mia.comentario } : null });
  } catch (e) {
    res.status(500).json({ error: "No se pudo comprobar tu participación" });
  }
});

// POST /api/valoraciones  (crea o actualiza mi valoración)
router.post("/", verificarToken, exigirCorreoVerificado, async (req, res) => {
  try {
    const recorrido = String(req.body.recorrido || "");
    const estrellas = Number(req.body.estrellas);
    const comentario = limpiar(req.body.comentario).slice(0, 300);

    if (!mongoose.isValidObjectId(recorrido)) return res.status(400).json({ error: "Recorrido inválido" });
    if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) {
      return res.status(400).json({ error: "La puntuación debe ser de 1 a 5 estrellas" });
    }

    const estado = await puedeValorar(req.usuario._id, recorrido);
    if (!estado.puede) return res.status(403).json({ error: estado.motivo });

    const v = await Valoracion.findOneAndUpdate(
      { usuario: req.usuario._id, recorrido },
      { estrellas, comentario },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
    res.status(201).json(v);
  } catch (e) {
    res.status(500).json({ error: "No se pudo guardar tu valoración" });
  }
});

module.exports = router;