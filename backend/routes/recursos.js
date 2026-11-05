const express = require("express");
const Recurso = require("../models/Recurso");
const crearRutas = require("./crearRutas");
const { verificarToken, soloAdmin } = require("../middleware/auth");

// Los PDF se guardan dentro de MongoDB. En Vercel el pedido completo no puede pasar de ~4,5 MB y el
// PDF viaja en base64 (≈ 33 % más grande), por eso el límite del PDF es de 3 MB.
const MAX_PDF_BYTES = 3 * 1024 * 1024;
const CAMPOS_TEXTO = ["titulo", "categoria", "descripcion", "fuente"];

// Cuenta las páginas de un PDF mirando su contenido (sin librerías). Si no puede, devuelve 1.
function contarPaginas(buffer) {
  const texto = buffer.toString("latin1");
  const objetos = (texto.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
  let mayorCount = 0;
  for (const m of texto.matchAll(/\/Count\s+(\d+)/g)) mayorCount = Math.max(mayorCount, Number(m[1]));
  return Math.max(objetos, mayorCount, 1);
}

const router = express.Router();

// GET /:id/archivo → descarga del PDF subido (público, igual que el resto de los recursos)
router.get("/:id/archivo", async (req, res) => {
  try {
    const recurso = await Recurso.findById(req.params.id).select("+pdf");
    if (!recurso || !recurso.pdf) return res.status(404).json({ error: "No encontrado" });
    const nombre = (recurso.pdfNombre || recurso.titulo || "recurso").replace(/[^\w.\- ]+/g, "_");
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nombre.endsWith(".pdf") ? nombre : nombre + ".pdf"}"`,
      "Content-Length": recurso.pdf.length,
      "Cross-Origin-Resource-Policy": "cross-origin",
    });
    res.send(recurso.pdf);
  } catch (error) {
    res.status(400).json({ error: "ID inválido" });
  }
});

// POST / → crear un recurso. Dos formas:
//   1) con "pdf" (el archivo en base64) y "pdfNombre": es lo que usa el panel de administración;
//   2) con "archivo" (una dirección ya existente): forma anterior, se mantiene por compatibilidad.
// El pedido grande se lee DESPUÉS de comprobar que quien lo envía es administrador (ver server.js).
router.post("/", verificarToken, soloAdmin, express.json({ limit: "4500kb" }), async (req, res) => {
  try {
    const datos = {};
    for (const campo of CAMPOS_TEXTO) datos[campo] = req.body[campo];

    const nuevo = new Recurso(datos);
    if (req.body.pdf) {
      // Puede llegar como "data:application/pdf;base64,XXXX" o solo la parte base64
      const base64 = String(req.body.pdf).replace(/^data:[^,]*,/, "");
      const buffer = Buffer.from(base64, "base64");
      if (buffer.length === 0) return res.status(400).json({ error: "El archivo está vacío" });
      if (buffer.length > MAX_PDF_BYTES) {
        return res.status(413).json({ error: "El PDF pesa más de 3 MB. Probá comprimirlo o subí uno más liviano." });
      }
      if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
        return res.status(400).json({ error: "El archivo no es un PDF válido" });
      }
      nuevo.pdf = buffer;
      nuevo.pdfNombre = String(req.body.pdfNombre || "").slice(0, 120) || undefined;
      nuevo.archivo = `/api/recursos/${nuevo.id}/archivo`;
      // Si la persona indicó las páginas se respeta; si no, se detectan solas
      const indicadas = Number(req.body.paginas);
      nuevo.paginas = Number.isInteger(indicadas) && indicadas > 0 ? indicadas : contarPaginas(buffer);
    } else {
      nuevo.archivo = req.body.archivo;
      nuevo.paginas = req.body.paginas;
    }

    await nuevo.save();
    const salida = nuevo.toJSON();
    delete salida.pdf; // el contenido del PDF no se devuelve: se descarga por /:id/archivo
    res.status(201).json(salida);
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ error: error.message });
    if (error.type === "entity.too.large") return res.status(413).json({ error: "El archivo es demasiado grande" });
    res.status(500).json({ error: "No se pudo crear en: recursos" });
  }
});

// Lo demás (listar, ver uno, eliminar) lo resuelve la fábrica de rutas de siempre
router.use(
  crearRutas(Recurso, {
    nombre: "recursos",
    campos: ["titulo", "categoria", "descripcion", "fuente", "paginas", "archivo"],
    traducibles: ["titulo", "categoria", "descripcion", "fuente"],
    finalizable: false,
  })
);

// Si el pedido supera el límite del lector de JSON, se responde con un mensaje claro (y no con un error técnico)
router.use((error, req, res, next) => {
  if (error && error.type === "entity.too.large") {
    return res.status(413).json({ error: "El archivo es demasiado grande. El PDF puede pesar hasta 3 MB." });
  }
  next(error);
});

module.exports = router;
