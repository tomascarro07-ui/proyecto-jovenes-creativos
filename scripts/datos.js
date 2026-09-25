
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

function mostrarErrorCarga(contenedor) {
  const abiertoComoArchivo = window.location.protocol === 'file:';

  contenedor.innerHTML = `
    <p class="carga-error">
      ${abiertoComoArchivo
        ? 'Para ver este contenido abrí el sitio con Live Server (o un servidor local), no con doble clic sobre el archivo.'
        : 'No pudimos cargar esta información. Probá recargar la página.'}
    </p>
  `;
}

function escaparHTML(texto) {
  return String(texto).replace(/[&<>"']/g, caracter => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[caracter]));
}
