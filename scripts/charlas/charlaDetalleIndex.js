const gestorCharla = new GestorCharlas();

function renderizarCharlas() {

  const grid = document.getElementById("charlasGrid");
  const charlas = gestorCharla.obtenerCharlas();

  let html = "";
  for(let i = 0; i < charlas.length; i++) {
    let charla = charlas[i];
    const fecha = separarFecha(charla.fecha);

    html += `
    <article class="act-card">
        <div class="act-card__media">
          <img src="${charla.imagen}" alt="${charla.titulo}">
          <span class="act-fecha"><strong>${fecha.dia}</strong>${fecha.mes}</span>
        </div>
        <div class="act-card__info">
          <span class="act-tipo">Charla</span>
          <h3>${charla.titulo}</h3>
          <p>${charla.descripcionCorta}</p>
          <p><i class="fa-solid fa-location-dot"></i> ${charla.lugar}</p>
          <a href="charla-detalle.html?id=${charla.id}" class="nc-btn nc-btn--outline nc-btn--mini">Ver más</a>
        </div>
      </article>
  `;
  }

  grid.innerHTML  = html;
}

document.addEventListener('DOMContentLoaded', renderizarCharlas);
