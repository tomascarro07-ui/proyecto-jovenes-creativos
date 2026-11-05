// Pruebas de seguridad que no necesitan MongoDB: se ejecutan con  npm test
// (usan el ejecutor de pruebas que trae Node, no hay que instalar nada).
process.env.JWT_SECRET = "clave-solo-para-pruebas-0123456789-abcdef";
process.env.NODE_ENV = "test";

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

// La conexión a la base de datos se reemplaza por una que responde enseguida
const rutaDB = require.resolve("../config/db");
require.cache[rutaDB] = { id: rutaDB, filename: rutaDB, loaded: true, exports: { conectarDB: async () => {} } };

const Usuario = require("../models/Usuario");
const { rutaSegura } = require("../config/validadores");
const { validarContrasenia } = require("../config/contrasenia");
const { verificarToken, soloAdmin } = require("../middleware/auth");

const firmar = (id, extra = {}) => jwt.sign({ id, ...extra }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" });

// Respuesta falsa mínima para probar middlewares
function resFalsa() {
  const r = { codigo: 200, cuerpo: null };
  r.status = (c) => { r.codigo = c; return r; };
  r.json = (b) => { r.cuerpo = b; return r; };
  return r;
}
async function correr(middleware, req) {
  const res = resFalsa();
  let siguio = false;
  await middleware({ headers: {}, method: "GET", ...req }, res, () => { siguio = true; });
  return { res, siguio };
}

test("direcciones de imagen: solo rutas del sitio o https", () => {
  for (const ok of ["", "img/foto.webp", "/img/foto.webp", "https://sitio.com/a.png", "/api/recursos/abc123/archivo", "recursos/guia.pdf"]) {
    assert.equal(rutaSegura.validator(ok), true, "debería aceptar: " + ok);
  }
  for (const mal of ["javascript:alert(1)", "data:text/html,<script>", "http://sitio.com/a.png", "//evil.com/x.png", "img/../../etc/passwd", 'https://x.com/a"onerror="x', "vbscript:x", "otra/cosa.png"]) {
    assert.equal(rutaSegura.validator(mal), false, "debería rechazar: " + mal);
  }
});

test("contraseña: mínimo 8 y máximo 72 bytes", () => {
  assert.notEqual(validarContrasenia("corta"), "");
  assert.equal(validarContrasenia("una-contraseña-buena"), "");
  assert.notEqual(validarContrasenia("a".repeat(73)), "");
  assert.equal(validarContrasenia("a".repeat(72)), "");
});

test("sin sesión: 401", async () => {
  const { res, siguio } = await correr(verificarToken, {});
  assert.equal(res.codigo, 401);
  assert.equal(siguio, false);
});

test("token falso, con otra clave o con algoritmo none: 401", async () => {
  const falsos = [
    "abc.def.ghi",
    jwt.sign({ id: "1" }, "otra-clave-distinta-0123456789-abcdefghij"),
    jwt.sign({ id: "1" }, "", { algorithm: "none" }),
  ];
  for (const t of falsos) {
    const { res } = await correr(verificarToken, { headers: { authorization: "Bearer " + t } });
    assert.equal(res.codigo, 401);
  }
});

test("cookie sin encabezado de protección en un POST: 403 (defensa CSRF)", async () => {
  const { res, siguio } = await correr(verificarToken, { method: "POST", headers: { cookie: "nc_sesion=" + firmar("1") } });
  assert.equal(res.codigo, 403);
  assert.equal(siguio, false);
});

test("sesión válida (cookie con encabezado, o Bearer): pasa", async () => {
  const original = Usuario.findById;
  Usuario.findById = async (id) => ({ _id: id, esAdministrador: false, contraseniaCambiadaEn: null });
  try {
    const a = await correr(verificarToken, { method: "POST", headers: { cookie: "nc_sesion=" + firmar("1"), "x-requested-with": "nodocultural" } });
    assert.equal(a.siguio, true);
    const b = await correr(verificarToken, { headers: { authorization: "Bearer " + firmar("1") } });
    assert.equal(b.siguio, true);
  } finally {
    Usuario.findById = original;
  }
});

test("token emitido antes de cambiar la contraseña: 401", async () => {
  const original = Usuario.findById;
  Usuario.findById = async (id) => ({ _id: id, contraseniaCambiadaEn: new Date(Date.now() + 5000) });
  try {
    const { res } = await correr(verificarToken, { headers: { authorization: "Bearer " + firmar("1") } });
    assert.equal(res.codigo, 401);
  } finally {
    Usuario.findById = original;
  }
});

test("soloAdmin: bloquea a quien no es administrador", async () => {
  assert.equal((await correr(soloAdmin, { usuario: { esAdministrador: false } })).res.codigo, 403);
  assert.equal((await correr(soloAdmin, { usuario: { esAdministrador: "true" } })).res.codigo, 403);
  assert.equal((await correr(soloAdmin, {})).res.codigo, 403);
  assert.equal((await correr(soloAdmin, { usuario: { esAdministrador: true } })).siguio, true);
});

// ───── Pruebas sobre el servidor completo ─────
test("servidor: rutas protegidas, errores limpios y límites", async (t) => {
  const app = require("../server");
  const servidor = app.listen(0);
  t.after(() => servidor.close());
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const pedir = (ruta, opc = {}) => fetch(base + ruta, opc);
  const json = { "Content-Type": "application/json" };

  // No se anuncia con qué está hecho el servidor
  const salud = await pedir("/api/salud");
  assert.equal(salud.status, 200);
  assert.equal(salud.headers.get("x-powered-by"), null);
  assert.equal(salud.headers.get("x-content-type-options"), "nosniff");

  // Dirección inexistente: 404 en JSON
  const noExiste = await pedir("/api/no-existe");
  assert.equal(noExiste.status, 404);
  assert.ok((await noExiste.json()).error);

  // JSON roto: 400 en JSON, sin detalles internos
  const roto = await pedir("/api/auth/login", { method: "POST", headers: json, body: "{esto no es json" });
  assert.equal(roto.status, 400);
  const cuerpoRoto = await roto.text();
  assert.ok(!/at .*node_modules|SyntaxError/.test(cuerpoRoto));

  // Cuerpo gigante: se corta
  const grande = await pedir("/api/auth/login", { method: "POST", headers: json, body: JSON.stringify({ correo: "x".repeat(300000) }) });
  assert.equal(grande.status, 413);

  // Todo lo que modifica datos del sitio exige administrador
  const protegidas = [
    ["POST", "/api/charlas"], ["POST", "/api/talleres"], ["POST", "/api/recorridos"], ["POST", "/api/recursos"],
    ["DELETE", "/api/charlas/507f1f77bcf86cd799439011"], ["DELETE", "/api/recursos/507f1f77bcf86cd799439011"],
    ["PATCH", "/api/charlas/507f1f77bcf86cd799439011/finalizada"],
    ["PATCH", "/api/museos/507f1f77bcf86cd799439011/ubicacion"],
    ["GET", "/api/inscripciones/actividad/charla/507f1f77bcf86cd799439011"],
    ["GET", "/api/inscripciones/mias"], ["POST", "/api/inscripciones"], ["POST", "/api/valoraciones"],
    ["GET", "/api/auth/yo"], ["PATCH", "/api/auth/yo"], ["PATCH", "/api/auth/contrasenia"],
  ];
  for (const [metodo, ruta] of protegidas) {
    const r = await pedir(ruta, { method: metodo, headers: json, body: metodo === "GET" ? undefined : "{}" });
    assert.equal(r.status, 401, `${metodo} ${ruta} debería pedir sesión`);
  }

  // Un usuario común no puede crear contenido ni ver inscriptos
  const original = Usuario.findById;
  Usuario.findById = async (id) => ({ _id: id, esAdministrador: false, contraseniaCambiadaEn: null, pendienteVerificacion: false });
  try {
    const cabecera = { ...json, Authorization: "Bearer " + firmar("507f1f77bcf86cd799439011") };
    for (const [metodo, ruta] of [["POST", "/api/charlas"], ["POST", "/api/recursos"], ["DELETE", "/api/talleres/507f1f77bcf86cd799439011"], ["GET", "/api/inscripciones/actividad/charla/507f1f77bcf86cd799439011"]]) {
      const r = await pedir(ruta, { method: metodo, headers: cabecera, body: metodo === "GET" ? undefined : "{}" });
      assert.equal(r.status, 403, `${metodo} ${ruta} debería negarse a un usuario común`);
    }
  } finally {
    Usuario.findById = original;
  }

  // Contraseña demasiado larga al registrarse
  const larga = await pedir("/api/auth/registro", {
    method: "POST", headers: json,
    body: JSON.stringify({ correo: "a@b.com", nombre: "Ana", contrasenia: "a".repeat(100) }),
  });
  assert.equal(larga.status, 400);

  // Límite por cuenta: tras 10 intentos fallidos con el mismo correo, se bloquea
  const buscar = Usuario.findOne;
  Usuario.findOne = () => ({ select: async () => null });
  try {
    let ultimo = 0;
    for (let i = 0; i < 12; i++) {
      const r = await pedir("/api/auth/login", { method: "POST", headers: json, body: JSON.stringify({ correo: "victima@ejemplo.com", contrasenia: "incorrecta-" + i }) });
      ultimo = r.status;
      if (ultimo === 429) break;
    }
    assert.equal(ultimo, 429);
  } finally {
    Usuario.findOne = buscar;
  }
});


test("destacada: al marcar una actividad se desmarcan las demás y solo el admin puede hacerlo", async () => {
  const express = require("express");
  const crearRutas = require("../routes/crearRutas");
  const llamadas = { updateMany: null, guardado: false };
  const item = { id: "a1", _id: "a1", destacada: false, save: async () => { llamadas.guardado = true; } };
  const FalsoModelo = {
    findById: async (id) => (id === "a1" ? item : null),
    updateMany: async (filtro, cambios) => { llamadas.updateMany = { filtro, cambios }; },
  };
  const original = Usuario.findById;
  Usuario.findById = async (id) => ({ _id: id, esAdministrador: true, contraseniaCambiadaEn: null, pendienteVerificacion: false });
  const app = express();
  app.use(express.json());
  app.use("/x", crearRutas(FalsoModelo, { nombre: "charlas", campos: [], destacable: true }));
  const servidor = app.listen(0);
  const base = `http://127.0.0.1:${servidor.address().port}/x`;
  try {
    const sin = await fetch(base + "/a1/destacada", { method: "PATCH" });
    assert.equal(sin.status, 401);
    const con = await fetch(base + "/a1/destacada", { method: "PATCH", headers: { Authorization: "Bearer " + firmar("u1") } });
    assert.equal(con.status, 200);
    assert.equal(item.destacada, true);
    assert.deepEqual(llamadas.updateMany.filtro, { _id: { $ne: "a1" }, destacada: true });
    assert.equal(llamadas.updateMany.cambios.destacada, false);
    assert.equal(llamadas.guardado, true);
    const noExiste = await fetch(base + "/zz/destacada", { method: "PATCH", headers: { Authorization: "Bearer " + firmar("u1") } });
    assert.equal(noExiste.status, 404);
  } finally {
    Usuario.findById = original;
    servidor.close();
  }
});
