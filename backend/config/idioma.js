const MENSAJES = require("./mensajes");

const IDIOMAS = ["es", "en", "pt"];
const POSICION = { en: 0, pt: 1 };

function idiomaDe(req) {
  const pedido = (req.query && req.query.idioma) || (req.body && req.body.idioma) || "";
  const codigo = String(pedido).toLowerCase().slice(0, 2);
  if (IDIOMAS.includes(codigo)) return codigo;
  return "es";
}

const COLECCIONES = {
  talleres: ["workshops", "oficinas"],
  charlas: ["talks", "palestras"],
  recorridos: ["tours", "roteiros"],
  recursos: ["resources", "recursos"],
  museos: ["museums", "museus"],
};

function traducirMensaje(texto, idioma) {
  if (idioma === "es" || typeof texto !== "string") return texto;
  const posicion = POSICION[idioma];
  if (Object.prototype.hasOwnProperty.call(MENSAJES, texto)) return MENSAJES[texto][posicion];

  const coincideObtener = /^No se pudieron obtener: (.+)$/.exec(texto);
  if (coincideObtener) {
    const nombre = (COLECCIONES[coincideObtener[1]] || [])[posicion] || coincideObtener[1];
    if (idioma === "en") return `Could not load: ${nombre}`;
    return `Não foi possível carregar: ${nombre}`;
  }
  const coincideCrear = /^No se pudo crear en: (.+)$/.exec(texto);
  if (coincideCrear) {
    const nombre = (COLECCIONES[coincideCrear[1]] || [])[posicion] || coincideCrear[1];
    if (idioma === "en") return `Could not create in: ${nombre}`;
    return `Não foi possível criar em: ${nombre}`;
  }
  return texto;
}

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
  if (Object.prototype.hasOwnProperty.call(DATOS, valor)) return DATOS[valor][POSICION[idioma]];
  return valor;
}

function campoTraducido(doc, campo, idioma) {
  if (idioma !== "es" && doc && doc.traducciones) {
    const delIdioma = doc.traducciones[idioma];
    const valor = delIdioma && delIdioma[campo];
    if (typeof valor === "string" && valor.trim()) return valor;
    if (Array.isArray(valor) && valor.length > 0) return valor;
  }
  if (!doc) return undefined;
  return doc[campo];
}

function localizar(doc, idioma, campos) {
  let json = { ...doc };
  if (typeof doc.toJSON === "function") json = doc.toJSON();
  if (idioma === "es") return json;
  for (const campo of campos) {
    if (campo in json) json[campo] = campoTraducido(doc, campo, idioma);
  }
  return json;
}

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
