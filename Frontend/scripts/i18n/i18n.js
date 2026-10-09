// Sistema de traducciones del sitio (es / en / pt).
//
// Textos fijos del HTML (se traducen solos al cargar y al cambiar de idioma):
//   data-i18n="clave"            -> reemplaza el texto del elemento
//   data-i18n-html="clave"       -> igual, pero permite HTML (<br>, <strong>)
//   data-i18n-attr="attr:clave;attr2:clave2"  -> traduce atributos (placeholder, aria-label, alt, title...)
//   El texto en español que ya está escrito en el HTML es el "original": se usa para español
//   y también como respaldo si a una clave le falta la traducción.
//
// Textos que arma JavaScript:
//   t("clave")  /  t("clave", { nombre: "Ana" })   -> usa {nombre} dentro del texto
//   Para contenido dibujado desde JS, escuchar el evento "idiomacambiado" y volver a dibujar.
//
// Los diccionarios están en es.js, en.js y pt.js (una sección por página o componente).

const I18N_IDIOMAS = { es: "Español", en: "English", pt: "Português" };
const I18N_CLAVE = "nc_idioma";
const I18N_DICT = { es: {}, en: {}, pt: {} };
let I18N_ACTUAL = "es";

try {
    const guardado = localStorage.getItem(I18N_CLAVE);
    if (guardado && I18N_IDIOMAS[guardado]) I18N_ACTUAL = guardado;
} catch (e) { /* sin localStorage: queda en español */ }

document.documentElement.lang = I18N_ACTUAL;

function idiomaActual() {
    return I18N_ACTUAL;
}

// Traduce una clave. Si falta en el idioma actual cae al español; si tampoco está, devuelve la clave.
function t(clave, vars) {
    let valor = I18N_DICT[I18N_ACTUAL][clave];
    if (valor === undefined) valor = I18N_DICT.es[clave];
    if (valor === undefined) return clave;
    if (typeof valor === "string" && vars) {
        valor = valor.replace(/\{(\w+)\}/g, function (m, k) {
            return vars[k] !== undefined ? vars[k] : m;
        });
    }
    return valor;
}

// Guarda el contenido original (español) de cada elemento antes de tocarlo
const I18N_ORIGINAL = new WeakMap();

function i18nOriginal(el) {
    let o = I18N_ORIGINAL.get(el);
    if (!o) {
        o = { attrs: {} };
        I18N_ORIGINAL.set(el, o);
    }
    return o;
}

function i18nValor(clave, original) {
    const v = I18N_DICT[I18N_ACTUAL][clave];
    return v !== undefined ? v : original;
}

function aplicarTraducciones(raiz) {
    const base = raiz || document;

    base.querySelectorAll("[data-i18n]").forEach(function (el) {
        const o = i18nOriginal(el);
        if (o.texto === undefined) o.texto = el.textContent;
        el.textContent = i18nValor(el.getAttribute("data-i18n"), o.texto);
    });

    base.querySelectorAll("[data-i18n-html]").forEach(function (el) {
        const o = i18nOriginal(el);
        if (o.html === undefined) o.html = el.innerHTML;
        el.innerHTML = i18nValor(el.getAttribute("data-i18n-html"), o.html);
    });

    base.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
        const o = i18nOriginal(el);
        el.getAttribute("data-i18n-attr").split(";").forEach(function (par) {
            const corte = par.indexOf(":");
            if (corte < 1) return;
            const attr = par.slice(0, corte).trim();
            const clave = par.slice(corte + 1).trim();
            if (o.attrs[attr] === undefined) o.attrs[attr] = el.getAttribute(attr) || "";
            el.setAttribute(attr, i18nValor(clave, o.attrs[attr]));
        });
    });
}

function cambiarIdioma(codigo) {
    if (!I18N_IDIOMAS[codigo] || codigo === I18N_ACTUAL) return;
    I18N_ACTUAL = codigo;
    try { localStorage.setItem(I18N_CLAVE, codigo); } catch (e) { /* sin localStorage */ }
    document.documentElement.lang = codigo;
    aplicarTraducciones();
    document.dispatchEvent(new CustomEvent("idiomacambiado", { detail: { idioma: codigo } }));
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { aplicarTraducciones(); });
} else {
    aplicarTraducciones();
}
