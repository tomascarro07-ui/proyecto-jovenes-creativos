const mongoose = require("mongoose");

async function conectarDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Falta MONGODB_URI en el archivo .env");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Conectado a MongoDB");
}

module.exports = { conectarDB };