require("dotenv").config();
const mongoose = require("mongoose");
const { traducirPendientes, activa } = require("../config/autotraduccion");

(async () => {
  if (!activa()) {
    console.log("Falta DEEPL_API_KEY en el archivo .env: no se tradujo nada.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  let vuelta = 0;
  let r;
  do {
    r = await traducirPendientes(20);
    vuelta++;
    console.log(`Vuelta ${vuelta}: ${r.traducidos} traducidos, quedan ${r.pendientes}`);
  } while (r.pendientes > 0 && r.traducidos > 0 && vuelta < 20);
  if (r.pendientes > 0) console.log("Quedaron pendientes (revisá la clave o la cuota de DeepL y volvé a correrlo).");
  await mongoose.disconnect();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
