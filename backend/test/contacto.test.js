process.env.NODE_ENV = "test";
process.env.EMAIL_DESTINO = "equipo@ejemplo.com";
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");

const enviados = [];
const rutaCorreo = require.resolve("../config/correo");
const correoReal = require("../config/correo");
require.cache[rutaCorreo].exports = { ...correoReal, enviarCorreo: async (datos) => { enviados.push(datos); } };

const { limpiar, EMAIL_VALIDO } = require("../config/texto");
const rutas = require("../routes/contacto");

async function conServidor(fn) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => { if (req.body === undefined) req.body = {}; next(); });
  app.use("/api/contacto", rutas);
  const servidor = app.listen(0);
  const base = `http://localhost:${servidor.address().port}/api/contacto`;
  try { await fn(base); } finally { servidor.close(); }
}
const enviar = (url, cuerpo) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) });

test("texto: limpiar saca < y >, espacios y respeta el largo máximo", () => {
  assert.equal(limpiar("  <b>Hola</b>  "), "bHola/b");
  assert.equal(limpiar("abcdef", 3), "abc");
  assert.equal(limpiar(undefined), "");
  assert.ok(EMAIL_VALIDO.test("a@b.co"));
  assert.ok(!EMAIL_VALIDO.test("a b@c.co"));
});

test("contacto: un pedido sin cuerpo responde 400 (no 500)", async () => {
  await conServidor(async (base) => {
    const r = await enviar(base, undefined);
    assert.equal(r.status, 400);
  });
});

test("contacto: envía el correo con los datos escapados y respuesta a la persona", async () => {
  enviados.length = 0;
  await conServidor(async (base) => {
    const r = await enviar(base, { nombre: "Ana <script>", email: "ANA@ejemplo.com", mensaje: "Hola <b>equipo</b>", actividad: "Taller" });
    assert.equal(r.status, 200);
  });
  assert.equal(enviados.length, 1);
  assert.equal(enviados[0].para, "equipo@ejemplo.com");
  assert.equal(enviados[0].responderA, "ana@ejemplo.com");
  assert.match(enviados[0].asunto, /Taller/);
  assert.ok(!enviados[0].html.includes("<script>"));
  assert.ok(enviados[0].html.includes("&lt;b&gt;equipo&lt;/b&gt;"));
});

test("contacto de Sudamtex: exige un motivo de la lista", async () => {
  enviados.length = 0;
  await conServidor(async (base) => {
    const sin = await enviar(base + "/sudamtex", { nombre: "Ana", email: "ana@ejemplo.com", mensaje: "Hola", motivo: "inventado" });
    assert.equal(sin.status, 400);
    const ok = await enviar(base + "/sudamtex", { nombre: "Ana", email: "ana@ejemplo.com", mensaje: "Hola", motivo: "aporte" });
    assert.equal(ok.status, 200);
  });
  assert.equal(enviados.length, 1);
  assert.match(enviados[0].asunto, /Sudamtex/);
  assert.match(enviados[0].texto, /Motivo: Quiere aportar/);
});
