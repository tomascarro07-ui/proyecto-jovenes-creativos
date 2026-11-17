process.env.NODE_ENV = "test";
const test = require("node:test");
const assert = require("node:assert/strict");

const Museo = require("../models/Museo");
const { localizar } = require("../config/idioma");
const { traduccionesObsoletas } = require("../config/edicion");

const base = { nombre: "Espacio X", tipo: "Histórico", descripcionCorta: "Texto", lat: -34.47, lng: -57.85 };
const errores = (datos) => {
  const resultado = new Museo({ ...base, ...datos }).validateSync();
  if (!resultado) return [];
  return Object.keys(resultado.errors);
};

test("museos: los campos nuevos son opcionales", () => {
  assert.deepEqual(errores({}), []);
});

test("museos: la galería solo acepta rutas seguras y hasta 8 fotos", () => {
  assert.deepEqual(errores({ galeria: ["img/a.webp", "/api/imagenes/abc", "https://sitio.com/a.jpg"] }), []);
  assert.deepEqual(errores({ galeria: ["javascript:alert(1)"] }), ["galeria"]);
  assert.deepEqual(errores({ galeria: ["data:text/html;base64,AAAA"] }), ["galeria"]);
  assert.deepEqual(errores({ galeria: [""] }), ["galeria"]);
  assert.deepEqual(errores({ galeria: Array(9).fill("img/a.webp") }), ["galeria"]);
});

test("museos: 'qué vas a ver' pide título y admite hasta 4 elementos", () => {
  assert.deepEqual(errores({ destacados: [{ titulo: "Sala", texto: "Algo" }] }), []);
  assert.ok(errores({ destacados: [{ texto: "sin título" }] }).length > 0);
  assert.ok(errores({ destacados: Array(5).fill({ titulo: "x" }) }).includes("destacados"));
});

test("museos: los textos largos tienen tope", () => {
  assert.deepEqual(errores({ gancho: "x".repeat(91) }), ["gancho"]);
  assert.deepEqual(errores({ datoCurioso: "x".repeat(301) }), ["datoCurioso"]);
  assert.deepEqual(errores({ historia: "x".repeat(3001) }), ["historia"]);
});

test("museos: la traducción de 'destacados' (lista) se usa en el idioma pedido y si falta sale en español", () => {
  const doc = {
    gancho: "Hola", destacados: [{ titulo: "Sala", texto: "Texto" }],
    traducciones: { en: { gancho: "Hello", destacados: [{ titulo: "Room", texto: "Text" }] } },
  };
  const campos = ["gancho", "destacados"];
  const en = localizar(doc, "en", campos);
  assert.equal(en.gancho, "Hello");
  assert.equal(en.destacados[0].titulo, "Room");
  const pt = localizar(doc, "pt", campos);
  assert.equal(pt.gancho, "Hola");
  assert.equal(pt.destacados[0].titulo, "Sala");
});

test("museos: al cambiar la lista de destacados se quitan sus traducciones; si no cambia, se conservan", () => {
  const original = new Museo({ ...base, destacados: [{ titulo: "Sala", texto: "Texto" }] });
  const igual = traduccionesObsoletas(original, { destacados: [{ titulo: "Sala", texto: "Texto" }] }, ["destacados"]);
  assert.deepEqual(igual, {});
  const distinta = traduccionesObsoletas(original, { destacados: [{ titulo: "Otra", texto: "Texto" }] }, ["destacados"]);
  assert.deepEqual(Object.keys(distinta).sort(), ["traducciones.en.destacados", "traducciones.pt.destacados"]);
});
