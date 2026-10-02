const gestorTalleres = new GestorTalleres();

async function renderizarTalleres() {

  const grid = document.getElementById("talleresGrid");
  const talleres = await gestorTalleres.obtenerTalleres();

  let html = "";
  for(let i = 0; i < talleres.length; i++) {
    let taller = talleres[i];

    html += `
    <article class="curso-mini">
        <div class="curso-mini__media">
          <img src="${taller.imagen}" alt="${taller.titulo}">
        </div>
        <div class="curso-mini__info">
          <h3>${taller.titulo}</h3>
          <p class="curso-mini__meta">
            <span><i class="fa-regular fa-clock"></i>${taller.cantClases}</span>
            <span><i class="fa-solid fa-location-dot"></i>${taller.modalidad}</span>
          </p>
          <a href="taller-detalle.html?idTaller=${taller.id}" class="nc-btn nc-btn--outline nc-btn--mini">Inscribirme</a>
        </div>
      </article>
  `;
  }

  grid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function () {
  renderizarTalleres().catch(function () {
    mostrarErrorServidor(document.getElementById("talleresGrid"));
  });
});