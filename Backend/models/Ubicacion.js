const mongoose = require("mongoose");

module.exports = {
  lat: { type: Number, min: -90, max: 90, default: null },
  lng: { type: Number, min: -180, max: 180, default: null },
  // Si la actividad se hace en un museo, se guarda su id y se usan las coordenadas del museo
  museo: { type: mongoose.Schema.Types.ObjectId, ref: "Museo", default: null },
};