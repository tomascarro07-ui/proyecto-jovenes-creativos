const gestorTalleres = new GestorTalleres();

async function renderizarTalleres() {
  const grid = document.getElementById('talleresGrid');
  if (grid === null) {
    return; 
  }

  const talleres = await gestorTalleres.obtenerTalleres();

  if (talleres.length === 0) {
    grid.innerHTML = '<p>' + t('list.sinTalleres') + '</p>';
    return;
  }

  let html = "";

  for (let i = 0; i < talleres.length; i++) {
    const taller = talleres[i];

    html += `
    <article class="curso-mini">
        <div class="curso-mini__media">
          <img src="${taller.imagen}" alt="${taller.titulo}">
        </div>
        <div class="curso-mini__info">
          <h3>${taller.titulo}</h3>
          <p class="curso-mini__meta">
            <span><i class="fa-regular fa-clock"></i>${taller.cantClases}</span>
            <span><i class="fa-solid fa-location-dot"></i>${tDato(taller.modalidad)}</span>
          </p>
          <p>${taller.descripcionCorta}</p>
          <a href="taller-detalle.html?idTaller=${taller.id}" class="nc-btn nc-btn--outline nc-btn--mini">${t("act.verMas")}</a>
        </div>
      </article>
  `;
  }

  grid.innerHTML = html;
}

function iniciarListadoTalleres() {
  renderizarTalleres().catch(function () {
    mostrarErrorServidor(document.getElementById("talleresGrid"));
  });
}

document.addEventListener('DOMContentLoaded', iniciarListadoTalleres);
document.addEventListener('idiomacambiado', iniciarListadoTalleres);