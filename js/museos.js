// ============================================================
// museos.js — dibuja las tarjetas de museos (museos_colonia.html)
// a partir de data/museos.json
// ============================================================

async function renderizarMuseos() {
  const contenedor = document.getElementById('museosGrid');
  const museos = await cargarJSON('data/museos.json');

  if (!museos) {
    mostrarErrorCarga(contenedor);
    return;
  }

  contenedor.innerHTML = museos.map(museo => `
    <article class="curso-card">
      <span class="curso-nivel">${escaparHTML(museo.categoria)}</span>
      <h3>${escaparHTML(museo.nombre)}</h3>
      <p>${escaparHTML(museo.descripcion)}</p>
      <div class="curso-detalle">
        <span><i class="fa-solid fa-location-dot"></i> ${escaparHTML(museo.ubicacion)}</span>
      </div>
      <iframe src="${escaparHTML(museo.mapa)}"
              title="Mapa: ${escaparHTML(museo.nombre)}"
              width="300" height="200" style="border:0;"
              allowfullscreen loading="lazy"
              referrerpolicy="strict-origin-when-cross-origin"></iframe>
    </article>
  `).join('');

  // El número del texto de arriba sale de la cantidad real de museos cargados
  const cantidad = document.getElementById('museosCantidad');
  if (cantidad) {
    cantidad.textContent = museos.length;
  }
}

document.addEventListener('DOMContentLoaded', renderizarMuseos);
