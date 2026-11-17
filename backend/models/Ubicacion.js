const mongoose = require("mongoose");

module.exports = {
  lat: { type: Number, min: -90, max: 90, default: null },
  lng: { type: Number, min: -180, max: 180, default: null },
  museo: { type: mongoose.Schema.Types.ObjectId, ref: "Museo", default: null },
};