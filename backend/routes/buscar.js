const express = require("express");
const rateLimit = require("express-rate-limit");
const Museo = require("../models/Museo");
const Charla = require("../models/Charla");
const Taller = require("../models/Taller");
const Recorrido = require("../models/Recorrido");
const Recurso = require("../models/Recurso");
const { campoTraducido, traducirDato } = require("../config/idioma");

const router = express.Router();

// La página busca mientras se escribe, así que el límite es más generoso que en el resto.
const limitador = rateLimit({
  windowMs: 60 * 1000,
  max: 90,
  message: { error: "Demasiadas búsquedas seguidas. Esperá un momento." },
});

// Minúsculas y sin tildes: "tecnica" encuentra "Técnica".
const normalizar = (t) =>
  String(t == null ? "" : t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Cómo se lee cada colección para armar un resultado común.
// "buscar" = campos donde se busca el texto; "titulo" y "categoria" pesan más en el orden.
const FUENTES = {
  museo: {
    Modelo: Museo, titulo: "nombre", categoria: "tipo", descripcion: "descripcionCorta", lugar: "direccion",
    buscar: ["nombre", "tipo", "descripcionCorta", "direccion", "horario"],
  },
  charla: {
    Modelo: Charla, titulo: "titulo", categoria: "tipo", descripcion: "descripcionCorta", lugar: "lugar",
    buscar: ["titulo", "tipo", "expositor", "descripcionCorta", "descripcionCompleta", "lugar"],
  },
  taller: {
    Modelo: Taller, titulo: "titulo", categoria: "nivel", descripcion: "descripcionCorta", lugar: "lugar",
    buscar: ["titulo", "nivel", "modalidad", "descripcionCorta", "lugar"],
  },
  recorrido: {
    Modelo: Recorrido, titulo: "titulo", categoria: "tipo", descripcion: "descripcionCorta", lugar: "puntoSalida",
    buscar: ["titulo", "tipo", "puntoSalida", "descripcionCorta"],
  },
  recurso: {
    Modelo: Recurso, titulo: "titulo", categoria: "categoria", descripcion: "descripcion", lugar: "fuente",
    buscar: ["titulo", "categoria", "descripcion", "fuente"],
  },
};
const TIPOS = Object.keys(FUENTES);
const LIMITE = 60;

async function cargar(tipo, idioma) {
  const f = FUENTES[tipo];
  const campos = new Set([...f.buscar, f.titulo, f.categoria, f.descripcion, f.lugar, "imagen", "fecha", "hora", "finalizada", "archivo", "traducciones"]);
  const docs = await f.Modelo.find().select([...campos].join(" ")).lean();
  return docs.map((d) => {
    const v = (campo) => campoTraducido(d, campo, idioma);
    // Se busca en el texto original y en el traducido: sirve escribir en cualquiera de los dos idiomas
    const texto = f.buscar.map((c) => [d[c], v(c), traducirDato(d[c], idioma)].filter(Boolean).join(" ")).join(" ");
    const categoria = traducirDato(v(f.categoria) || "", idioma);
    return {
      tipo,
      id: String(d._id),
      titulo: v(f.titulo) || "",
      categoria,
      descripcion: v(f.descripcion) || "",
      lugar: v(f.lugar) || "",
      imagen: d.imagen || "",
      fecha: d.fecha || "",
      hora: d.hora || "",
      archivo: tipo === "recurso" ? d.archivo || "" : undefined,
      finalizada: d.finalizada === true,
      _texto: normalizar(texto),
      _titulo: normalizar(v(f.titulo)),
      _categoria: normalizar(categoria),
    };
  });
}

function puntuar(item, tokens, frase) {
  if (!tokens.length) return 0;
  let p = item._titulo.includes(frase) ? 6 : 0;
  for (const t of tokens) {
    if (item._titulo.startsWith(t) || item._titulo.includes(" " + t)) p += 5;
    else if (item._titulo.includes(t)) p += 3;
    if (item._categoria.includes(t)) p += 2;
    p += 1;
  }
  return p;
}

// GET /api/buscar?q=texto&tipo=charla&categoria=Taller&ocultarFinalizadas=1
router.get("/", limitador, async (req, res) => {
  try {
    const frase = normalizar(String(req.query.q || "").slice(0, 80)).replace(/\s+/g, " ").trim();
    const tokens = frase ? frase.split(" ") : [];
    const tiposPedidos = String(req.query.tipo || "").split(",").filter((t) => TIPOS.includes(t));
    const tipos = tiposPedidos.length ? tiposPedidos : TIPOS;
    const categoria = normalizar(String(req.query.categoria || "").slice(0, 60));
    const ocultarFinalizadas = req.query.ocultarFinalizadas === "1";

    const idioma = req.idioma;
    const todos = (await Promise.all(TIPOS.map((t) => cargar(t, idioma)))).flat();

    // 1) texto (todas las palabras tienen que aparecer) y estado
    const coinciden = [];
    for (const item of todos) {
      if (ocultarFinalizadas && item.finalizada) continue;
      if (!tokens.every((t) => item._texto.includes(t))) continue;
      item.puntaje = puntuar(item, tokens, frase);
      coinciden.push(item);
    }

    // 2) conteos por tipo (antes de filtrar por tipo, para que los botones muestren cuántos hay)
    const conteos = Object.fromEntries(TIPOS.map((t) => [t, 0]));
    for (const i of coinciden) conteos[i.tipo]++;

    // 3) filtro por tipo y categorías disponibles dentro de ese tipo
    const porTipo = coinciden.filter((i) => tipos.includes(i.tipo));
    const cats = new Map();
    for (const i of porTipo) {
      if (!i._categoria) continue;
      const c = cats.get(i._categoria) || { valor: i.categoria, cantidad: 0 };
      c.cantidad++;
      cats.set(i._categoria, c);
    }

    // 4) filtro por categoría y orden
    const finales = porTipo
      .filter((i) => !categoria || i._categoria === categoria)
      .sort((a, b) =>
        (a.finalizada - b.finalizada) || (b.puntaje - a.puntaje) || a.titulo.localeCompare(b.titulo, idioma));

    const resultados = finales.slice(0, LIMITE).map(({ _texto, _titulo, _categoria, puntaje, ...limpio }) => limpio);
    res.json({
      total: finales.length,
      resultados,
      conteos,
      categorias: [...cats.values()].sort((a, b) => a.valor.localeCompare(b.valor, idioma)),
    });
  } catch (e) {
    console.error("Error en buscar:", e.message);
    res.status(500).json({ error: "No se pudo realizar la búsqueda" });
  }
});

module.exports = router;
