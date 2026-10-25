const mongoose = require('mongoose');

module.exports = mongoose.model('Consulta', new mongoose.Schema({
    nombre: String,
    email: String,
    mensaje: String,
    actividad: String,
    motivo: String,
    fecha: {type: date, default: Date.now }
}));