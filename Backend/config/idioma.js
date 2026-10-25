// Idioma de cada pedido y traducción de contenido y mensajes.
//
// El sitio manda el idioma elegido en el parámetro ?idioma=en|pt (el español es el idioma por defecto).
// Si no viene, o el panel de administración no lo manda, todo sale en español como siempre.
const MENSAJES = require("./mensajes");

const IDIOMAS = ["es", "en", "pt"];
const POSICION = { en: 0, pt: 1 };

function idiomaDe(req) {
  const pedido = (req.query && req.query.idioma) || (req.body && req.body.idioma) || "";
  const codigo = String(pedido).toLowerCase().slice(0, 2);
  return IDIOMAS.includes(codigo) ? codigo : "es";
}

// ===== Mensajes =====
const COLECCIONES = {
  talleres: ["workshops", "oficinas"],
  charlas: ["talks", "palestras"],
  recorridos: ["tours", "roteiros"],
  recursos: ["resources", "recursos"],
  museos: ["museums", "museus"],
};

function traducirMensaje(texto, idioma) {
  if (idioma === "es" || typeof texto !== "string") return texto;
  const i = POSICION[idioma];
  if (Object.prototype.hasOwnProperty.call(MENSAJES, texto)) return MENSAJES[texto][i];

  // Mensajes que llevan un dato adentro
  let m = /^No se pudieron obtener: (.+)$/.exec(texto);
  if (m) {
    const nombre = (COLECCIONES[m[1]] || [])[i] || m[1];
    return i === 0 ? `Could not load: ${nombre}` : `Não foi possível carregar: ${nombre}`;
  }
  m = /^No se pudo crear en: (.+)$/.exec(texto);
  if (m) {
    const nombre = (COLECCIONES[m[1]] || [])[i] || m[1];
    return i === 0 ? `Could not create in: ${nombre}` : `Não foi possível criar em: ${nombre}`;
  }
  return texto;
}

// ===== Valores fijos que vienen de la base de datos (Presencial, Virtual, niveles, tipos de recorrido) =====
const DATOS = {
  "Presencial": ["In person", "Presencial"],
  "Virtual": ["Online", "Virtual"],
  "Híbrido": ["Hybrid", "Híbrido"],
  "Híbrida": ["Hybrid", "Híbrida"],
  "Todo público": ["All audiences", "Todos os públicos"],
  "Iniciación": ["Beginner", "Iniciação"],
  "Intermedio": ["Intermediate", "Intermediário"],
  "Avanzado": ["Advanced", "Avançado"],
  "Clásico": ["Classic", "Clássico"],
  "Activo": ["Active", "Ativo"],
  "Romántico": ["Romantic", "Romântico"],
  "Sabores": ["Flavors", "Sabores"],
  "Tradicional": ["Traditional", "Tradicional"],
  "Nocturno": ["Night", "Noturno"],
};

function traducirDato(valor, idioma) {
  if (idioma === "es" || typeof valor !== "string") return valor;
  return Object.prototype.hasOwnProperty.call(DATOS, valor) ? DATOS[valor][POSICION[idioma]] : valor;
}

// ===== Contenido con traducciones guardadas en el documento =====
// Un documento puede traer: traducciones: { en: { titulo: "...", ... }, pt: { ... } }
// Si falta el idioma o el campo, se usa el texto original en español.
function campoTraducido(doc, campo, idioma) {
  if (idioma !== "es" && doc && doc.traducciones) {
    const delIdioma = doc.traducciones[idioma];
    const valor = delIdioma && delIdioma[campo];
    if (typeof valor === "string" && valor.trim()) return valor;
  }
  return doc ? doc[campo] : undefined;
}

// Devuelve el documento como JSON con los campos indicados en el idioma pedido
function localizar(doc, idioma, campos) {
  const json = typeof doc.toJSON === "function" ? doc.toJSON() : { ...doc };
  if (idioma === "es") return json;
  for (const campo of campos) {
    if (campo in json) json[campo] = campoTraducido(doc, campo, idioma);
  }
  return json;
}

// ===== Textos armados por el servidor =====
const SALIDA = { es: "Salida: ", en: "Departure: ", pt: "Saída: " };

function salidaDe(idioma) {
  return SALIDA[idioma] || SALIDA.es;
}

function lugarTaller(modalidad, idioma) {
  if (idioma === "en") return `${traducirDato(modalidad, idioma)} workshop`;
  if (idioma === "pt") return `Oficina ${traducirDato(modalidad, idioma)}`;
  return "Taller " + modalidad;
}

module.exports = { IDIOMAS, idiomaDe, traducirMensaje, traducirDato, campoTraducido, localizar, salidaDe, lugarTaller };
