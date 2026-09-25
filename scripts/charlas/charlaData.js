const gestorCharlas = new GestorCharlas();

function renderizarCharlas() {
  const grid = document.getElementById('actividadesGrid');
  if (grid === null) {
    return; 
  }

  const charlas = gestorCharlas.obtenerCharlas();

  if (charlas.length === 0) {
    grid.innerHTML = '<p>Todavía no hay charlas cargadas.</p>';
    return;
  }

  let html = "";

  for (let i = 0; i < charlas.length; i++) {
    const charla = charlas[i];

    html += `
    <article class="curso-mini">
          <div class="curso-mini__media">
            <img src="${charla.imagen} alt="${charla.titulo}"}"></img>
          </div>
          <div class="curso-mini__info">
            <span class="act-tipo">${charla.tipo}</span>
            <h3>${charla.titulo}</h3>
            <p class="curso-desc">${charla.descripcionCorta}</p>
            <p class="curso-mini__meta">
              <span><i class="fa-regular fa-clock"></i>${charla.lugar}</span>
              <span><i class="fa-solid fa-laptop"></i>${charla.tipo}</span>
            </p>
            <a href="contacto.html?idCharla=${charla.id}" class="nc-btn nc-btn--outline nc-btn--mini">Inscribirme</a>
          </div>
        </article>
  `;
  }

  grid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderizarCharlas);