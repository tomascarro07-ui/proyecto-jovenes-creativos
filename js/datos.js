// ============================================================
// datos.js — funciones compartidas para cargar contenido desde
// archivos JSON (carpeta data/) usando fetch.
// ============================================================

// Pide un archivo JSON y devuelve su contenido ya convertido a objeto/array.
// Si algo falla (archivo inexistente, sin conexión, JSON mal escrito) devuelve null.
async function cargarJSON(ruta) {
  try {
    const respuesta = await fetch(ruta);

    // fetch NO tira error si el servidor responde 404: hay que revisarlo a mano
    if (!respuesta.ok) {
      throw new Error(`El servidor respondió ${respuesta.status}`);
    }

    return await respuesta.json();
  } catch (error) {
    console.error(`No se pudo cargar ${ruta}:`, error);
    return null;
  }
}

// Muestra un mensaje de error dentro del contenedor indicado
function mostrarErrorCarga(contenedor) {
  // Si el HTML se abrió con doble clic (file://), fetch no funciona: avisamos por qué
  const abiertoComoArchivo = window.location.protocol === 'file:';

  contenedor.innerHTML = `
    <p class="carga-error">
      ${abiertoComoArchivo
        ? 'Para ver este contenido abrí el sitio con Live Server (o un servidor local), no con doble clic sobre el archivo.'
        : 'No pudimos cargar esta información. Probá recargar la página.'}
    </p>
  `;
}

// Convierte caracteres especiales (<, >, ", &, ') para que un texto
// nunca se interprete como HTML cuando lo metemos con innerHTML.
function escaparHTML(texto) {
  return String(texto).replace(/[&<>"']/g, caracter => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[caracter]));
}
