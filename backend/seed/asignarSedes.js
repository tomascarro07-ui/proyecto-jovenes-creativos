require("dotenv").config();
const mongoose = require("mongoose");
const Museo = require("../models/Museo");
const Taller = require("../models/Taller");
const Charla = require("../models/Charla");
const Recorrido = require("../models/Recorrido");
const SEDES = require("./sedes");

async function asignarSedes({ forzar = false } = {}) {
  const museos = await Museo.find();
  const idPorNombre = new Map(museos.map((museo) => [museo.nombre, museo._id]));

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
      let filtro = { titulo, museo: null, lat: null };
      if (forzar) filtro = { titulo, lat: null };
      const resultado = await Modelo.updateMany(filtro, { $set: { museo: id } });
      ubicadas += resultado.modifiedCount;
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
    for (const [etiqueta, cantidad] of Object.entries(resumen)) console.log(`${etiqueta}: ${cantidad} ubicadas`);
    await mongoose.disconnect();
  })().catch((error) => { console.error(error); process.exit(1); });
}
