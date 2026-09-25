
async function renderizarMuseos() {
  const contenedor = document.querySelector('.museos-grid');
  const museos = await cargarJSON('data/museos.json');

  if (!museos) {
    mostrarErrorCarga(contenedor);
    return;
  }

  contenedor.innerHTML = museos.map(museo => `
    <article class="curso-mini">
      <div class="curso-mini__media">
        <iframe title="Mapa: ${escaparHTML(museo.nombre)}"
                src="${escaparHTML(museo.mapa)}"
                allowfullscreen loading="lazy"
                referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </div>
      <div class="curso-mini__info">
        <span class="act-tipo">${escaparHTML(museo.categoria)}</span>
        <h3>${escaparHTML(museo.nombre)}</h3>
        <p class="museo-desc">${escaparHTML(museo.descripcion)}</p>
        <p class="curso-mini__meta"><span><i class="fa-solid fa-location-dot"></i> ${escaparHTML(museo.ubicacion)}</span></p>
      </div>
    </article>
  `).join('');
}

document.addEventListener('DOMContentLoaded', renderizarMuseos);
