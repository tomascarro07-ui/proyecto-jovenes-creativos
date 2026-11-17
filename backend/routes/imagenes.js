const express = require("express");
const mongoose = require("mongoose");
const Imagen = require("../models/Imagen");
const { verificarToken, soloAdmin } = require("../middleware/auth");

const MAX_IMAGEN_BYTES = 3 * 1024 * 1024;

function detectarTipo(bytes) {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes.subarray(0, 4).toString("latin1") === "GIF8") return "image/gif";
  if (bytes.subarray(0, 4).toString("latin1") === "RIFF" && bytes.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  return null;
}

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "No encontrado" });
    const imagen = await Imagen.findById(req.params.id).select("+datos");
    if (!imagen) return res.status(404).json({ error: "No encontrado" });
    res.set({
      "Content-Type": imagen.tipo,
      "Content-Length": imagen.datos.length,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "cross-origin",
    });
    res.send(imagen.datos);
  } catch (error) {
    res.status(404).json({ error: "No encontrado" });
  }
});

router.post("/", verificarToken, soloAdmin, express.json({ limit: "4500kb" }), async (req, res) => {
  try {
    const base64 = String(req.body.datos || "").replace(/^data:[^,]*,/, "");
    const buffer = Buffer.from(base64, "base64");
    if (buffer.length === 0) return res.status(400).json({ error: "El archivo está vacío" });
    if (buffer.length > MAX_IMAGEN_BYTES) {
      return res.status(413).json({ error: "La imagen pesa más de 3 MB. Probá con una más chica." });
    }
    const tipo = detectarTipo(buffer);
    if (!tipo) return res.status(400).json({ error: "El archivo no es una imagen válida (JPG, PNG, WebP o GIF)" });

    const imagen = await Imagen.create({ datos: buffer, tipo, nombre: String(req.body.nombre || "").slice(0, 120) || undefined });
    res.status(201).json({ id: imagen.id, url: `/api/imagenes/${imagen.id}` });
  } catch (error) {
    if (error.type === "entity.too.large") return res.status(413).json({ error: "La imagen es demasiado grande" });
    res.status(500).json({ error: "No se pudo guardar la imagen" });
  }
});

router.use((error, req, res, next) => {
  if (error && error.type === "entity.too.large") {
    return res.status(413).json({ error: "La imagen es demasiado grande. Puede pesar hasta 3 MB." });
  }
  next(error);
});

module.exports = router;
module.exports.detectarTipo = detectarTipo;
