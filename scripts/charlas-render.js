function separarFecha(fecha) {
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const partes = fecha.split('-');

  return {
    dia: Number(partes[2]),
    mes: meses[Number(partes[1]) - 1]
  };
}

function renderizarCharlas() {
  const grid = document.getElementById('charlasGrid');
  if (grid === null) {
    return; 
  }

  const charlas = obtenerCharlas();

  if (charlas.length === 0) {
    grid.innerHTML = '<p>Todavía no hay charlas cargadas.</p>';
    return;
  }

  let html = '';

  for (let i = 0; i < charlas.length; i++) {
    const charla = charlas[i];
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

  grid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderizarCharlas);