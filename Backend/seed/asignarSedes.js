require("dotenv").config();
const mongoose = require("mongoose");
const Museo = require("../models/Museo");
const Taller = require("../models/Taller");
const Charla = require("../models/Charla");
const Recorrido = require("../models/Recorrido");
const SEDES = require("./sedes");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const museos = await Museo.find();
  const idPorNombre = new Map(museos.map((m) => [m.nombre, m._id]));

  const grupos = [
    [Taller, SEDES.talleres, "Talleres"],
    [Charla, SEDES.charlas, "Charlas"],
    [Recorrido, SEDES.recorridos, "Recorridos"],
  ];

  for (const [Modelo, sedes, etiqueta] of grupos) {
    let ubicadas = 0;
    for (const [titulo, museoNombre] of Object.entries(sedes)) {
      const id = idPorNombre.get(museoNombre);
      if (!id) {
        console.warn(`No existe el museo "${museoNombre}" (¿corriste npm run museos?)`);
        continue;
      }
      // Solo toca las que todavía no tienen ubicación
      const r = await Modelo.updateMany({ titulo, museo: null, lat: null }, { $set: { museo: id } });
      ubicadas += r.modifiedCount;
    }
    console.log(`${etiqueta}: ${ubicadas} ubicadas`);
  }

  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });