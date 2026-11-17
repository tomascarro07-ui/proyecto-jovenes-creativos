process.env.NODE_ENV = "test";
const test = require("node:test");
const assert = require("node:assert/strict");
const { traducirLote, traducirDocumento, pendientes } = require("../config/autotraduccion");

const fetchOriginal = global.fetch;
test.afterEach(() => {
  global.fetch = fetchOriginal;
  delete process.env.DEEPL_API_KEY;
});

function simularDeepL(llamadas, { estado = 200 } = {}) {
  global.fetch = async (url, opciones) => {
    const cuerpo = JSON.parse(opciones.body);
    llamadas.push({ url, cabeceras: opciones.headers, cuerpo });
    if (estado !== 200) return { ok: false, status: estado };
    const marca = cuerpo.target_lang === "EN-US" ? "[EN] " : "[PT] ";
    return { ok: true, status: 200, json: async () => ({ translations: cuerpo.text.map((texto) => ({ text: marca + texto })) }) };
  };
}

function modeloFalso(doc) {
  const guardados = [];
  return { guardados, findById: async () => doc, updateOne: async (filtro, cambios) => { guardados.push(cambios.$set); } };
}

test("traductor: usa la dirección del plan gratuito con claves :fx y manda la clave en el encabezado", async () => {
  const llamadas = [];
  simularDeepL(llamadas);
  process.env.DEEPL_API_KEY = "abc123:fx";
  assert.deepEqual(await traducirLote(["Hola"], "en"), ["[EN] Hola"]);
  assert.match(llamadas[0].url, /api-free\.deepl\.com/);
  assert.equal(llamadas[0].cabeceras.Authorization, "DeepL-Auth-Key abc123:fx");
  assert.equal(llamadas[0].cuerpo.source_lang, "ES");
  process.env.DEEPL_API_KEY = "clave-paga";
  await traducirLote(["Hola"], "pt");
  assert.match(llamadas[1].url, /^https:\/\/api\.deepl\.com/);
  assert.equal(llamadas[1].cuerpo.target_lang, "PT-BR");
});

test("traductor: sin clave no llama a internet ni cambia nada", async () => {
  const llamadas = [];
  simularDeepL(llamadas);
  const modelo = modeloFalso({ titulo: "Hola" });
  assert.equal((await traducirDocumento(modelo, "1", ["titulo"])).estado, "desactivada");
  assert.equal(llamadas.length, 0);
  assert.equal(modelo.guardados.length, 0);
});

test("traductor: traduce a inglés y portugués solo lo que falta y lo guarda", async () => {
  const llamadas = [];
  simularDeepL(llamadas);
  process.env.DEEPL_API_KEY = "k:fx";
  const doc = { titulo: "Taller de cerámica", descripcionCorta: "Aprendé a modelar", lugar: "", traducciones: { en: { titulo: "Ceramics workshop" } } };
  const modelo = modeloFalso(doc);
  const r = await traducirDocumento(modelo, "1", ["titulo", "descripcionCorta", "lugar"]);
  assert.equal(r.estado, "ok");
  const cambios = modelo.guardados[0];
  assert.equal(cambios["traducciones.en.titulo"], undefined, "no pisa una traducción existente");
  assert.equal(cambios["traducciones.en.descripcionCorta"], "[EN] Aprendé a modelar");
  assert.equal(cambios["traducciones.pt.titulo"], "[PT] Taller de cerámica");
  assert.equal(cambios["traducciones.pt.descripcionCorta"], "[PT] Aprendé a modelar");
  assert.equal(cambios["traducciones.pt.lugar"], undefined, "no manda textos vacíos");
});

test("traductor: traduce las listas de 'qué vas a ver' conservando el orden", async () => {
  simularDeepL([]);
  process.env.DEEPL_API_KEY = "k:fx";
  const doc = { destacados: [{ titulo: "Sala", texto: "Piezas" }, { titulo: "Patio", texto: "" }] };
  const modelo = modeloFalso(doc);
  await traducirDocumento(modelo, "1", ["destacados"]);
  assert.deepEqual(modelo.guardados[0]["traducciones.en.destacados"], [{ titulo: "[EN] Sala", texto: "[EN] Piezas" }, { titulo: "[EN] Patio", texto: "" }]);
});

test("traductor: si DeepL falla o no responde, no lanza error y no guarda nada", async () => {
  process.env.DEEPL_API_KEY = "k:fx";
  const silenciar = console.error;
  console.error = () => {};
  try {
    simularDeepL([], { estado: 456 });
    const modelo = modeloFalso({ titulo: "Hola" });
    assert.equal((await traducirDocumento(modelo, "1", ["titulo"])).estado, "fallo");
    assert.equal(modelo.guardados.length, 0);
    global.fetch = async () => { throw new Error("sin conexión"); };
    assert.equal((await traducirDocumento(modelo, "1", ["titulo"])).estado, "fallo");
  } finally {
    console.error = silenciar;
  }
});

test("traductor: 'pendientes' detecta lo que falta en cada idioma", () => {
  const doc = { titulo: "A", descripcionCorta: "B", traducciones: { en: { titulo: "A", descripcionCorta: "B" }, pt: { titulo: "A" } } };
  assert.deepEqual(pendientes(doc, ["titulo", "descripcionCorta"], "en"), []);
  assert.deepEqual(pendientes(doc, ["titulo", "descripcionCorta"], "pt"), ["descripcionCorta"]);
});
