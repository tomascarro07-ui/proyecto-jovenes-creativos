const express = require("express");
const { verificarToken, soloAdmin } = require("../middleware/auth");
const Charla = require("../models/Charla");
const Taller = require("../models/Taller");
const Recorrido = require("../models/Recorrido");
const Recurso = require("../models/Recurso");
const Museo = require("../models/Museo");
const Usuario = require("../models/Usuario");
const Inscripcion = require("../models/Inscripcion");
const Suscriptor = require("../models/Suscriptor");

const { traducirPendientes } = require("../config/autotraduccion");

const router = express.Router();
const UNA_SEMANA = 7 * 24 * 60 * 60 * 1000;

router.post("/traducir-pendientes", verificarToken, soloAdmin, async (req, res) => {
  try {
    res.json(await traducirPendientes());
  } catch (error) {
    res.status(500).json({ error: "No se pudieron traducir los pendientes" });
  }
});

router.get("/resumen", verificarToken, soloAdmin, async (req, res) => {
  try {
    const desde = new Date(Date.now() - UNA_SEMANA);
    const [charlas, talleres, recorridos, recursos, museos, usuarios, inscripciones, recientes, suscriptores, masPedidas] =
      await Promise.all([
        Charla.countDocuments({ finalizada: false }),
        Taller.countDocuments({ finalizada: false }),
        Recorrido.countDocuments({ finalizada: false }),
        Recurso.countDocuments(),
        Museo.countDocuments(),
        Usuario.countDocuments(),
        Inscripcion.countDocuments(),
        Inscripcion.countDocuments({ createdAt: { $gte: desde } }),
        Suscriptor.countDocuments({ activo: true }),
        Inscripcion.aggregate([
          { $group: { _id: { tipo: "$tipo", actividad: "$actividad" }, inscriptos: { $sum: 1 }, titulo: { $last: "$tituloActividad" } } },
          { $sort: { inscriptos: -1 } },
          { $limit: 5 },
        ]),
      ]);
    res.json({
      activas: { charlas, talleres, recorridos },
      recursos,
      museos,
      usuarios,
      inscripciones: { total: inscripciones, ultimaSemana: recientes },
      suscriptores,
      masPedidas: masPedidas.map((grupo) => ({ tipo: grupo._id.tipo, id: String(grupo._id.actividad), titulo: grupo.titulo, inscriptos: grupo.inscriptos })),
    });
  } catch (error) {
    res.status(500).json({ error: "No se pudo obtener el resumen" });
  }
});

module.exports = router;
