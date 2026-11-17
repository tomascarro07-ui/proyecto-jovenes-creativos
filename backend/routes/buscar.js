const express = require("express");
const rateLimit = require("express-rate-limit");
const Museo = require("../models/Museo");
const Charla = require("../models/Charla");
const Taller = require("../models/Taller");
const Recorrido = require("../models/Recorrido");
const Recurso = require("../models/Recurso");
const { campoTraducido, traducirDato } = require("../config/idioma");

const router = express.Router();

const limitador = rateLimit({
  windowMs: 60 * 1000,
  max: 90,
  message: { error: "Demasiadas búsquedas seguidas. Esperá un momento." },
});

const normalizar = (texto) => {
  const comoTexto = texto === null || texto === undefined ? "" : String(texto);
  return comoTexto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const FUENTES = {
  museo: {
    Modelo: Museo, titulo: "nombre", categoria: "tipo", descripcion: "descripcionCorta", lugar: "direccion",
    buscar: ["nombre", "tipo", "gancho", "descripcionCorta", "historia", "direccion", "horario"],
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
  const fuente = FUENTES[tipo];
  const campos = new Set([...fuente.buscar, fuente.titulo, fuente.categoria, fuente.descripcion, fuente.lugar, "imagen", "fecha", "hora", "finalizada", "archivo", "traducciones"]);
  const documentos = await fuente.Modelo.find().select([...campos].join(" ")).lean();
  return documentos.map((documento) => {
    const valorTraducido = (campo) => campoTraducido(documento, campo, idioma);
    const texto = fuente.buscar
      .map((campo) => [documento[campo], valorTraducido(campo), traducirDato(documento[campo], idioma)].filter(Boolean).join(" "))
      .join(" ");
    const categoria = traducirDato(valorTraducido(fuente.categoria) || "", idioma);
    let archivo = undefined;
    if (tipo === "recurso") archivo = documento.archivo || "";
    return {
      tipo,
      id: String(documento._id),
      titulo: valorTraducido(fuente.titulo) || "",
      categoria,
      descripcion: valorTraducido(fuente.descripcion) || "",
      lugar: valorTraducido(fuente.lugar) || "",
      imagen: documento.imagen || "",
      fecha: documento.fecha || "",
      hora: documento.hora || "",
      archivo,
      finalizada: documento.finalizada === true,
      _texto: normalizar(texto),
      _titulo: normalizar(valorTraducido(fuente.titulo)),
      _categoria: normalizar(categoria),
    };
  });
}

function puntuar(item, tokens, frase) {
  if (!tokens.length) return 0;
  let puntaje = 0;
  if (item._titulo.includes(frase)) puntaje = 6;
  for (const palabra of tokens) {
    if (item._titulo.startsWith(palabra) || item._titulo.includes(" " + palabra)) puntaje += 5;
    else if (item._titulo.includes(palabra)) puntaje += 3;
    if (item._categoria.includes(palabra)) puntaje += 2;
    puntaje += 1;
  }
  return puntaje;
}

router.get("/", limitador, async (req, res) => {
  try {
    const frase = normalizar(String(req.query.q || "").slice(0, 80)).replace(/\s+/g, " ").trim();
    let tokens = [];
    if (frase) tokens = frase.split(" ");
    const tiposPedidos = String(req.query.tipo || "").split(",").filter((tipo) => TIPOS.includes(tipo));
    let tipos = TIPOS;
    if (tiposPedidos.length > 0) tipos = tiposPedidos;
    const categoria = normalizar(String(req.query.categoria || "").slice(0, 60));
    const ocultarFinalizadas = req.query.ocultarFinalizadas === "1";

    const idioma = req.idioma;
    const todos = (await Promise.all(TIPOS.map((tipo) => cargar(tipo, idioma)))).flat();

    const coinciden = [];
    for (const item of todos) {
      if (ocultarFinalizadas && item.finalizada) continue;
      if (!tokens.every((palabra) => item._texto.includes(palabra))) continue;
      item.puntaje = puntuar(item, tokens, frase);
      coinciden.push(item);
    }

    const conteos = {};
    for (const tipo of TIPOS) conteos[tipo] = 0;
    for (const item of coinciden) conteos[item.tipo]++;

    const porTipo = coinciden.filter((item) => tipos.includes(item.tipo));
    const categoriasDisponibles = new Map();
    for (const item of porTipo) {
      if (!item._categoria) continue;
      const entrada = categoriasDisponibles.get(item._categoria) || { valor: item.categoria, cantidad: 0 };
      entrada.cantidad++;
      categoriasDisponibles.set(item._categoria, entrada);
    }

    const finales = porTipo.filter((item) => !categoria || item._categoria === categoria);
    finales.sort((primero, segundo) => {
      if (primero.finalizada !== segundo.finalizada) return primero.finalizada ? 1 : -1;
      if (primero.puntaje !== segundo.puntaje) return segundo.puntaje - primero.puntaje;
      return primero.titulo.localeCompare(segundo.titulo, idioma);
    });

    const resultados = finales.slice(0, LIMITE).map(({ _texto, _titulo, _categoria, puntaje, ...limpio }) => limpio);
    res.json({
      total: finales.length,
      resultados,
      conteos,
      categorias: [...categoriasDisponibles.values()].sort((primera, segunda) => primera.valor.localeCompare(segunda.valor, idioma)),
    });
  } catch (error) {
    console.error("Error en buscar:", error.message);
    res.status(500).json({ error: "No se pudo realizar la búsqueda" });
  }
});

module.exports = router;
