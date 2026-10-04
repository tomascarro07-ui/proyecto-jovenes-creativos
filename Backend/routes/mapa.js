const express = require("express");
const Museo = require("../models/Museo");
const Charla = require("../models/Charla");
const Taller = require("../models/Taller");
const Recorrido = require("../models/Recorrido");

const router = express.Router();

// Entra a la lista todo lo que tenga museo asignado o coordenadas propias
const filtro = { $or: [{ museo: { $ne: null } }, { lat: { $ne: null }, lng: { $ne: null } }] };

// GET /api/mapa → todo lo cultural que tiene ubicación
router.get("/", async (req, res) => {
  try {
    const [museos, charlas, talleres, recorridos] = await Promise.all([
      Museo.find(),
      Charla.find(filtro),
      Taller.find(filtro),
      Recorrido.find(filtro),
    ]);

    const museoPorId = new Map(museos.map((m) => [String(m._id), m]));

    // Si la actividad está en un museo, manda la ubicación del museo
    function ubicar(doc) {
      const m = doc.museo ? museoPorId.get(String(doc.museo)) : null;
      if (m) return { lat: m.lat, lng: m.lng, museoId: m.id };
      if (doc.lat != null && doc.lng != null) return { lat: doc.lat, lng: doc.lng, museoId: null };
      return null;
    }
    const conUbicacion = (doc, datos) => {
      const u = ubicar(doc);
      return u ? [{ ...datos, ...u }] : [];
    };

    const puntos = [
      ...museos.map((m) => ({
        tipo: "museo", id: m.id, museoId: m.id, titulo: m.nombre, subtitulo: m.tipo,
        lugar: m.direccion || "Colonia del Sacramento", descripcion: m.descripcionCorta,
        horario: m.horario, imagen: m.imagen, lat: m.lat, lng: m.lng,
      })),
      ...charlas.flatMap((c) => conUbicacion(c, {
        tipo: "charla", id: c.id, titulo: c.titulo, lugar: c.lugar, fecha: c.fecha, hora: c.hora,
        cupos: c.cupos, finalizada: c.finalizada, imagen: c.imagen, virtual: c.tipo === "Virtual",
      })),
      ...talleres.flatMap((t) => conUbicacion(t, {
        tipo: "taller", id: t.id, titulo: t.titulo, lugar: t.lugar || "Taller " + t.modalidad,
        fecha: t.fecha, hora: t.hora, cupos: t.cupos, finalizada: t.finalizada, imagen: t.imagen, virtual: t.modalidad === "Virtual",
      })),
      ...recorridos.flatMap((r) => conUbicacion(r, {
        tipo: "recorrido", id: r.id, titulo: r.titulo, lugar: "Salida: " + r.puntoSalida,
        fecha: r.fecha, hora: r.hora, cupos: r.cupos, finalizada: r.finalizada, imagen: r.imagen,
      })),
    ];

    res.json(puntos);
  } catch (e) {
    res.status(500).json({ error: "No se pudo cargar el mapa cultural" });
  }
});

module.exports = router;