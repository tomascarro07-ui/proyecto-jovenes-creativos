function renderizarCharlas() {
  const grid = document.getElementById('charlasGrid');
  const charlas = obtenerCharlas();

  grid.innerHTML = charlas.map(charla => `
    <article class="charla-card">
      <div class="charla-media">
        <img class="charla-img" src="${charla.imagen}" alt="${charla.titulo}">
        <span class="charla-fecha">${formatearFechaCorta(charla.fecha)}</span>
      </div>
      <div class="charla-info">
        <h3>${charla.titulo}</h3>
        <p>${charla.descripcionCorta}</p>
        <a href="charla-detalle.html?id=${charla.id}" class="btn btn-outline">Ver más</a>
      </div>
    </article>
  `).join('');
}

document.addEventListener('DOMContentLoaded', renderizarCharlas);
