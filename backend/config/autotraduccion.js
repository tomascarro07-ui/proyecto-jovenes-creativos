const IDIOMAS = { en: "EN-US", pt: "PT-BR" };
const ESPERA_MAXIMA_MS = 6000;

function claveDeepL() {
  return (process.env.DEEPL_API_KEY || "").trim();
}

function activa() {
  return claveDeepL() !== "";
}

function direccionDeepL() {
  if (claveDeepL().endsWith(":fx")) return "https://api-free.deepl.com/v2/translate";
  return "https://api.deepl.com/v2/translate";
}

async function traducirLote(textos, idioma) {
  if (textos.length === 0) return [];
  const respuesta = await fetch(direccionDeepL(), {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${claveDeepL()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: textos, source_lang: "ES", target_lang: IDIOMAS[idioma], preserve_formatting: true }),
    signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
  });
  if (!respuesta.ok) {
    let motivo = `error ${respuesta.status}`;
    if (respuesta.status === 456) motivo = "cuota mensual agotada";
    if (respuesta.status === 403) motivo = "clave inválida";
    throw new Error(`DeepL: ${motivo}`);
  }
  const datos = await respuesta.json();
  const traducciones = (datos.translations || []).map((traduccion) => traduccion.text);
  if (traducciones.length !== textos.length) throw new Error("DeepL: respuesta incompleta");
  return traducciones;
}

function aObjetoSimple(elemento) {
  if (typeof elemento.toObject === "function") return elemento.toObject();
  return elemento;
}

const hayTexto = (valor) => typeof valor === "string" && valor.trim() !== "";

function pendientes(doc, campos, idioma) {
  const hechas = (doc.traducciones && doc.traducciones[idioma]) || {};
  const faltan = [];
  for (const campo of campos) {
    const original = doc[campo];
    if (Array.isArray(original)) {
      const elementos = original.map((elemento) => aObjetoSimple(elemento));
      const algunElementoTieneTitulo = elementos.some((elemento) => hayTexto(elemento.titulo));
      const yaEstaTraducido = Array.isArray(hechas[campo]) && hechas[campo].length > 0;
      if (algunElementoTieneTitulo && !yaEstaTraducido) faltan.push(campo);
    } else if (hayTexto(original) && !hayTexto(hechas[campo])) {
      faltan.push(campo);
    }
  }
  return faltan;
}

async function traducirDocumento(Modelo, id, campos) {
  if (!activa()) return { estado: "desactivada", campos: 0 };
  try {
    const doc = await Modelo.findById(id);
    if (!doc) return { estado: "nada", campos: 0 };
    const cambios = {};
    let total = 0;

    await Promise.all(
      Object.keys(IDIOMAS).map(async (idioma) => {
        const faltan = pendientes(doc, campos, idioma);
        if (faltan.length === 0) return;
        const textos = [];
        const ubicacion = [];
        for (const campo of faltan) {
          if (Array.isArray(doc[campo])) {
            doc[campo].forEach((elemento, posicion) => {
              const item = aObjetoSimple(elemento);
              for (const parte of ["titulo", "texto"]) {
                if (hayTexto(item[parte])) {
                  textos.push(item[parte]);
                  ubicacion.push({ campo, posicion, parte });
                }
              }
            });
          } else {
            textos.push(doc[campo]);
            ubicacion.push({ campo });
          }
        }
        const traducidos = await traducirLote(textos, idioma);
        const listas = {};
        ubicacion.forEach((lugarDelTexto, indice) => {
          const textoTraducido = traducidos[indice];
          if (lugarDelTexto.parte) {
            if (!listas[lugarDelTexto.campo]) {
              listas[lugarDelTexto.campo] = doc[lugarDelTexto.campo].map(() => ({ titulo: "", texto: "" }));
            }
            listas[lugarDelTexto.campo][lugarDelTexto.posicion][lugarDelTexto.parte] = textoTraducido;
          } else {
            cambios[`traducciones.${idioma}.${lugarDelTexto.campo}`] = textoTraducido;
          }
        });
        for (const [campo, lista] of Object.entries(listas)) {
          cambios[`traducciones.${idioma}.${campo}`] = lista.filter((elemento) => elemento.titulo);
        }
        total += faltan.length;
      })
    );

    if (Object.keys(cambios).length > 0) await Modelo.updateOne({ _id: id }, { $set: cambios });
    return { estado: total > 0 ? "ok" : "nada", campos: total };
  } catch (error) {
    console.error("Traducción automática:", error.message);
    return { estado: "fallo", campos: 0 };
  }
}

const CAMPOS_AUTO = {
  charlas: ["titulo", "lugar", "descripcionCorta", "descripcionCompleta"],
  talleres: ["titulo", "lugar", "descripcionCorta"],
  recorridos: ["titulo", "puntoSalida", "descripcionCorta"],
  recursos: ["titulo", "categoria", "descripcion"],
  museos: ["tipo", "horario", "descripcionCorta", "gancho", "historia", "datoCurioso", "destacados", "entrada", "accesibilidad"],
};

async function traducirPendientes(limite = 6) {
  if (!activa()) return { estado: "desactivada", traducidos: 0, pendientes: 0, fallos: 0 };
  const MODELOS = {
    charlas: require("../models/Charla"),
    talleres: require("../models/Taller"),
    recorridos: require("../models/Recorrido"),
    recursos: require("../models/Recurso"),
    museos: require("../models/Museo"),
  };
  const lista = [];
  for (const [seccion, Modelo] of Object.entries(MODELOS)) {
    const docs = await Modelo.find();
    for (const doc of docs) {
      if (Object.keys(IDIOMAS).some((idioma) => pendientes(doc, CAMPOS_AUTO[seccion], idioma).length > 0)) lista.push({ Modelo, seccion, id: doc._id });
    }
  }
  let traducidos = 0;
  let fallos = 0;
  for (const { Modelo, seccion, id } of lista.slice(0, limite)) {
    const r = await traducirDocumento(Modelo, id, CAMPOS_AUTO[seccion]);
    if (r.estado === "ok") traducidos++;
    if (r.estado === "fallo") fallos++;
  }
  return { estado: "ok", traducidos, pendientes: Math.max(lista.length - limite, 0) + fallos, fallos };
}

module.exports = { traducirPendientes, activa, traducirLote, traducirDocumento, pendientes, CAMPOS_AUTO };
