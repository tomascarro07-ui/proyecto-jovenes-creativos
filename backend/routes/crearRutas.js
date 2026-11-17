const { verificarToken, soloAdmin } = require("../middleware/auth");
const express = require("express");
const Valoracion = require("../models/Valoracion");
const mongoose = require("mongoose");
const Museo = require("../models/Museo");
const Inscripcion = require("../models/Inscripcion");
const { localizar } = require("../config/idioma");
const { traduccionesObsoletas } = require("../config/edicion");
const { traducirDocumento, CAMPOS_AUTO } = require("../config/autotraduccion");
const TIPO_INSCRIPCION = { talleres: "taller", charlas: "charla", recorridos: "recorrido" };

function crearRutas(Modelo, { nombre, campos, camposEditables = campos, traducibles = [], finalizable = false, destacable = false }) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const items = await Modelo.find().sort({ _id: 1 });
      res.json(items.map((item) => localizar(item, req.idioma, traducibles)));
    } catch (error) {
      res.status(500).json({ error: `No se pudieron obtener: ${nombre}` });
    }
  });

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

  router.post("/", verificarToken, soloAdmin, async (req, res) => {
    try {
      const datos = {};
      for (const campo of campos) {
        datos[campo] = req.body[campo];
      }
      const nuevo = await Modelo.create(datos);
      await traducirDocumento(Modelo, nuevo._id, CAMPOS_AUTO[nombre] || []);
      res.status(201).json(nuevo);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: `No se pudo crear en: ${nombre}` });
    }
  });

  router.put("/:id", verificarToken, soloAdmin, async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      const item = await Modelo.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "No encontrado" });
      }
      const cuerpo = req.body || {};
      const cambios = {};
      for (const campo of camposEditables) {
        if (campo in cuerpo) cambios[campo] = cuerpo[campo];
      }
      if (cambios.museo && (!mongoose.isValidObjectId(cambios.museo) || !(await Museo.exists({ _id: cambios.museo })))) {
        return res.status(400).json({ error: "Museo inválido" });
      }
      const operacion = { $set: cambios };
      const quitar = traduccionesObsoletas(item, cambios, traducibles);
      if (Object.keys(quitar).length > 0) operacion.$unset = quitar;

      const actualizado = await Modelo.findByIdAndUpdate(item._id, operacion, { new: true, runValidators: true });
      await traducirDocumento(Modelo, item._id, CAMPOS_AUTO[nombre] || []);
      if (TIPO_INSCRIPCION[nombre] && cambios.titulo && cambios.titulo !== item.titulo) {
        await Inscripcion.updateMany({ tipo: TIPO_INSCRIPCION[nombre], actividad: item._id }, { tituloActividad: cambios.titulo });
      }
      res.json(actualizado);
    } catch (error) {
      if (error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: `No se pudo guardar en: ${nombre}` });
    }
  });

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

  if (destacable) {
    router.patch("/:id/destacada", verificarToken, soloAdmin, async (req, res) => {
      try {
        const item = await Modelo.findById(req.params.id);
        if (!item) {
          return res.status(404).json({ error: "No encontrado" });
        }
        item.destacada = !item.destacada;
        if (item.destacada) {
          await Modelo.updateMany({ _id: { $ne: item._id }, destacada: true }, { destacada: false });
        }
        await item.save();
        res.json(item);
      } catch (error) {
        res.status(400).json({ error: "ID inválido" });
      }
    });
  }

  router.delete("/:id", verificarToken, soloAdmin, async (req, res) => {
    try {
      const item = await Modelo.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "No encontrado" });
      }
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