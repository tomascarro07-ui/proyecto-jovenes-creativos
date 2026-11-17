const express = require("express");
const mongoose = require("mongoose");
const Valoracion = require("../models/Valoracion");
const Recorrido = require("../models/Recorrido");
const Inscripcion = require("../models/Inscripcion");
const { verificarToken, exigirCorreoVerificado } = require("../middleware/auth");
const { limpiar } = require("../config/texto");

const router = express.Router();

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

router.get("/recorrido/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "ID inválido" });

    const lista = await Valoracion.find({ recorrido: req.params.id })
      .sort({ createdAt: -1 })
      .populate("usuario", "nombre apellido foto");

    const total = lista.length;
    let sumaDeEstrellas = 0;
    for (const valoracion of lista) sumaDeEstrellas += valoracion.estrellas;

    let promedio = 0;
    if (total > 0) promedio = Math.round((sumaDeEstrellas / total) * 10) / 10;

    const distribucion = [];
    for (const estrellas of [5, 4, 3, 2, 1]) {
      const cantidad = lista.filter((valoracion) => valoracion.estrellas === estrellas).length;
      distribucion.push({ estrellas, cantidad });
    }

    const valoraciones = lista.map((valoracion) => {
      let nombreAutor = req.t("Usuario");
      let fotoAutor = "";
      if (valoracion.usuario) {
        nombreAutor = valoracion.usuario.nombre;
        if (valoracion.usuario.apellido) nombreAutor += " " + valoracion.usuario.apellido.charAt(0) + ".";
        fotoAutor = valoracion.usuario.foto;
      }
      return {
        id: valoracion.id,
        estrellas: valoracion.estrellas,
        comentario: valoracion.comentario,
        creadaEn: valoracion.createdAt,
        autor: { nombre: nombreAutor, foto: fotoAutor },
      };
    });

    res.json({ promedio, total, distribucion, valoraciones });
  } catch (error) {
    res.status(500).json({ error: "No se pudieron obtener las valoraciones" });
  }
});

router.get("/elegibilidad/:id", verificarToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "ID inválido" });
    const estado = await puedeValorar(req.usuario._id, req.params.id);
    const mia = await Valoracion.findOne({ usuario: req.usuario._id, recorrido: req.params.id });
    let miValoracion = null;
    if (mia) miValoracion = { estrellas: mia.estrellas, comentario: mia.comentario };
    res.json({ ...estado, mia: miValoracion });
  } catch (error) {
    res.status(500).json({ error: "No se pudo comprobar tu participación" });
  }
});

router.post("/", verificarToken, exigirCorreoVerificado, async (req, res) => {
  try {
    const recorrido = String(req.body.recorrido || "");
    const estrellas = Number(req.body.estrellas);
    const comentario = limpiar(req.body.comentario, 300);

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
  } catch (error) {
    res.status(500).json({ error: "No se pudo guardar tu valoración" });
  }
});

module.exports = router;