const express = require("express");
const Museo = require("../models/Museo");
const Charla = require("../models/Charla");
const Taller = require("../models/Taller");
const Recorrido = require("../models/Recorrido");
const { campoTraducido, salidaDe, lugarTaller } = require("../config/idioma");

const router = express.Router();

const filtro = { $or: [{ museo: { $ne: null } }, { lat: { $ne: null }, lng: { $ne: null } }] };

router.get("/", async (req, res) => {
  try {
    const [museos, charlas, talleres, recorridos] = await Promise.all([
      Museo.find(),
      Charla.find(filtro),
      Taller.find(filtro),
      Recorrido.find(filtro),
    ]);

    const idioma = req.idioma;
    const traducido = (documento, campo) => campoTraducido(documento, campo, idioma);

    const museoPorId = new Map(museos.map((museo) => [String(museo._id), museo]));

    function ubicar(actividad) {
      let museo = null;
      if (actividad.museo) museo = museoPorId.get(String(actividad.museo));
      if (museo) return { lat: museo.lat, lng: museo.lng, museoId: museo.id };
      if (actividad.lat != null && actividad.lng != null) return { lat: actividad.lat, lng: actividad.lng, museoId: null };
      return null;
    }
    const conUbicacion = (actividad, datos) => {
      const ubicacion = ubicar(actividad);
      if (!ubicacion) return [];
      return [{ ...datos, ...ubicacion }];
    };

    const puntos = [
      ...museos.map((museo) => ({
        tipo: "museo", id: museo.id, museoId: museo.id, titulo: traducido(museo, "nombre"), subtitulo: traducido(museo, "tipo"),
        lugar: traducido(museo, "direccion") || req.t("Colonia del Sacramento"), descripcion: traducido(museo, "descripcionCorta"),
        horario: traducido(museo, "horario"), imagen: museo.imagen, lat: museo.lat, lng: museo.lng,
      })),
      ...charlas.flatMap((charla) => conUbicacion(charla, {
        tipo: "charla", id: charla.id, titulo: traducido(charla, "titulo"), lugar: traducido(charla, "lugar"), fecha: charla.fecha, hora: charla.hora,
        cupos: charla.cupos, finalizada: charla.finalizada, imagen: charla.imagen, virtual: charla.tipo === "Virtual",
      })),
      ...talleres.flatMap((taller) => conUbicacion(taller, {
        tipo: "taller", id: taller.id, titulo: traducido(taller, "titulo"), lugar: traducido(taller, "lugar") || lugarTaller(taller.modalidad, idioma),
        fecha: taller.fecha, hora: taller.hora, cupos: taller.cupos, finalizada: taller.finalizada, imagen: taller.imagen, virtual: taller.modalidad === "Virtual",
      })),
      ...recorridos.flatMap((recorrido) => conUbicacion(recorrido, {
        tipo: "recorrido", id: recorrido.id, titulo: traducido(recorrido, "titulo"), lugar: salidaDe(idioma) + traducido(recorrido, "puntoSalida"),
        fecha: recorrido.fecha, hora: recorrido.hora, cupos: recorrido.cupos, finalizada: recorrido.finalizada, imagen: recorrido.imagen,
      })),
    ];

    res.json(puntos);
  } catch (error) {
    res.status(500).json({ error: "No se pudo cargar el mapa cultural" });
  }
});

module.exports = router;