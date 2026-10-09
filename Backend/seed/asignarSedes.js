require("dotenv").config();
const mongoose = require("mongoose");
const Museo = require("../models/Museo");
const Taller = require("../models/Taller");
const Charla = require("../models/Charla");
const Recorrido = require("../models/Recorrido");
const SEDES = require("./sedes");

// Asigna museo a las actividades según seed/sedes.js.
// Sin `forzar`, solo toca las que todavía no tienen ubicación.
// Con `forzar`, pisa el museo de las actividades de ejemplo (siempre que no tengan coordenadas propias).
async function asignarSedes({ forzar = false } = {}) {
  const museos = await Museo.find();
  const idPorNombre = new Map(museos.map((m) => [m.nombre, m._id]));

  const grupos = [
    [Taller, SEDES.talleres, "Talleres"],
    [Charla, SEDES.charlas, "Charlas"],
    [Recorrido, SEDES.recorridos, "Recorridos"],
  ];

  const resumen = {};
  for (const [Modelo, sedes, etiqueta] of grupos) {
    let ubicadas = 0;
    for (const [titulo, museoNombre] of Object.entries(sedes)) {
      const id = idPorNombre.get(museoNombre);
      if (!id) {
        console.warn(`No existe el museo "${museoNombre}" (¿corriste npm run museos?)`);
        continue;
      }
      const filtro = forzar ? { titulo, lat: null } : { titulo, museo: null, lat: null };
      const r = await Modelo.updateMany(filtro, { $set: { museo: id } });
      ubicadas += r.modifiedCount;
    }
    resumen[etiqueta] = ubicadas;
  }
  return resumen;
}

module.exports = { asignarSedes };

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const resumen = await asignarSedes();
    for (const [etiqueta, n] of Object.entries(resumen)) console.log(`${etiqueta}: ${n} ubicadas`);
    await mongoose.disconnect();
  })().catch((e) => { console.error(e); process.exit(1); });
}
