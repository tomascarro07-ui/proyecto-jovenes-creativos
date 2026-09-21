// ============================================================
// recorridos.js — dibuja los recorridos guiados (recorridos.html)
// a partir de data/recorridos.json
// ============================================================

async function renderizarRecorridos() {
  const contenedor = document.getElementById('recorridosGrid');
  const recorridos = await cargarJSON('data/recorridos.json');

  if (!recorridos) {
    mostrarErrorCarga(contenedor);
    return;
  }

  contenedor.innerHTML = recorridos.map(recorrido => {
    // El botón lleva al formulario de contacto con el recorrido ya elegido
    const enlace = `contacto.html?recorrido=${encodeURIComponent(recorrido.titulo)}&duracion=${encodeURIComponent(recorrido.duracion)}`;

    return `
      <article class="curso-card">
        <span class="curso-nivel">${escaparHTML(recorrido.tipo)}</span>
        <h3>${escaparHTML(recorrido.titulo)}</h3>
        <p>${escaparHTML(recorrido.descripcion)}</p>
        <div class="curso-detalle">
          <span><i class="fa-regular fa-clock"></i> ${escaparHTML(recorrido.duracion)}</span>
          <span><i class="${escaparHTML(recorrido.detalle.icono)}"></i> ${escaparHTML(recorrido.detalle.texto)}</span>
        </div>
        <a href="${enlace}" class="btn btn-outline">Reservar</a>
      </article>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', renderizarRecorridos);
