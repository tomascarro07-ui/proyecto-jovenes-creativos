const express = require("express");
const mongoose = require("mongoose");
const Recurso = require("../models/Recurso");
const crearRutas = require("./crearRutas");
const { verificarToken, soloAdmin } = require("../middleware/auth");
const { traduccionesObsoletas } = require("../config/edicion");
const { traducirDocumento, CAMPOS_AUTO } = require("../config/autotraduccion");

const MAX_PDF_BYTES = 3 * 1024 * 1024;
const CAMPOS_TEXTO = ["titulo", "categoria", "descripcion", "fuente"];

function contarPaginas(buffer) {
  const texto = buffer.toString("latin1");
  const objetos = (texto.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
  let mayorCount = 0;
  for (const m of texto.matchAll(/\/Count\s+(\d+)/g)) mayorCount = Math.max(mayorCount, Number(m[1]));
  return Math.max(objetos, mayorCount, 1);
}

const router = express.Router();

router.get("/:id/archivo", async (req, res) => {
  try {
    const recurso = await Recurso.findById(req.params.id).select("+pdf");
    if (!recurso || !recurso.pdf) return res.status(404).json({ error: "No encontrado" });
    const original = recurso.pdfNombre || recurso.titulo || "recurso";
    const nombre = original.replace(/[^\w.\- ]+/g, "_");
    const conExtension = (nombreArchivo) => {
      if (nombreArchivo.toLowerCase().endsWith(".pdf")) return nombreArchivo;
      return nombreArchivo + ".pdf";
    };
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${conExtension(nombre)}"; filename*=UTF-8''${encodeURIComponent(conExtension(original))}`,
      "Content-Length": recurso.pdf.length,
      "Cross-Origin-Resource-Policy": "cross-origin",
    });
    res.send(recurso.pdf);
  } catch (error) {
    res.status(400).json({ error: "ID inválido" });
  }
});

function procesarPdf(body) {
  const base64 = String(body.pdf).replace(/^data:[^,]*,/, "");
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) return { codigo: 400, error: "El archivo está vacío" };
  if (buffer.length > MAX_PDF_BYTES) {
    return { codigo: 413, error: "El PDF pesa más de 3 MB. Probá comprimirlo o subí uno más liviano." };
  }
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return { codigo: 400, error: "El archivo no es un PDF válido" };
  }
  return { buffer, nombre: String(body.pdfNombre || "").slice(0, 120) || undefined };
}

router.post("/", verificarToken, soloAdmin, express.json({ limit: "4500kb" }), async (req, res) => {
  try {
    const datos = {};
    for (const campo of CAMPOS_TEXTO) datos[campo] = req.body[campo];

    const nuevo = new Recurso(datos);
    if (req.body.pdf) {
      const pdf = procesarPdf(req.body);
      if (pdf.error) return res.status(pdf.codigo).json({ error: pdf.error });
      nuevo.pdf = pdf.buffer;
      nuevo.pdfNombre = pdf.nombre;
      nuevo.archivo = `/api/recursos/${nuevo.id}/archivo`;
      const indicadas = Number(req.body.paginas);
      if (Number.isInteger(indicadas) && indicadas > 0) nuevo.paginas = indicadas;
      else nuevo.paginas = contarPaginas(pdf.buffer);
    } else {
      nuevo.archivo = req.body.archivo;
      nuevo.paginas = req.body.paginas;
    }

    await nuevo.save();
    await traducirDocumento(Recurso, nuevo._id, CAMPOS_AUTO.recursos);
    const salida = nuevo.toJSON();
    delete salida.pdf;
    res.status(201).json(salida);
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ error: error.message });
    if (error.type === "entity.too.large") return res.status(413).json({ error: "El archivo es demasiado grande" });
    res.status(500).json({ error: "No se pudo crear en: recursos" });
  }
});

router.put("/:id", verificarToken, soloAdmin, express.json({ limit: "4500kb" }), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "ID inválido" });
    const recurso = await Recurso.findById(req.params.id);
    if (!recurso) return res.status(404).json({ error: "No encontrado" });

    const cuerpo = req.body || {};
    const cambios = {};
    for (const campo of CAMPOS_TEXTO) if (campo in cuerpo) cambios[campo] = cuerpo[campo];
    if (cuerpo.paginas !== undefined && cuerpo.paginas !== "") cambios.paginas = Number(cuerpo.paginas);
    if (cuerpo.pdf) {
      const pdf = procesarPdf(cuerpo);
      if (pdf.error) return res.status(pdf.codigo).json({ error: pdf.error });
      cambios.pdf = pdf.buffer;
      cambios.pdfNombre = pdf.nombre;
      cambios.archivo = `/api/recursos/${recurso.id}/archivo`;
      if (cambios.paginas === undefined) cambios.paginas = contarPaginas(pdf.buffer);
    }

    const operacion = { $set: cambios };
    const quitar = traduccionesObsoletas(recurso, cambios, ["titulo", "categoria", "descripcion", "fuente"]);
    if (Object.keys(quitar).length > 0) operacion.$unset = quitar;
    const actualizado = await Recurso.findByIdAndUpdate(recurso._id, operacion, { new: true, runValidators: true });
    await traducirDocumento(Recurso, recurso._id, CAMPOS_AUTO.recursos);
    const salida = actualizado.toJSON();
    delete salida.pdf;
    res.json(salida);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") return res.status(400).json({ error: error.message });
    if (error.type === "entity.too.large") return res.status(413).json({ error: "El archivo es demasiado grande" });
    res.status(500).json({ error: "No se pudo guardar en: recursos" });
  }
});

router.use(
  crearRutas(Recurso, {
    nombre: "recursos",
    campos: ["titulo", "categoria", "descripcion", "fuente", "paginas", "archivo"],
    camposEditables: ["titulo", "categoria", "descripcion", "fuente", "paginas"],
    traducibles: ["titulo", "categoria", "descripcion", "fuente"],
    finalizable: false,
  })
);

router.use((error, req, res, next) => {
  if (error && error.type === "entity.too.large") {
    return res.status(413).json({ error: "El archivo es demasiado grande. El PDF puede pesar hasta 3 MB." });
  }
  next(error);
});

module.exports = router;
