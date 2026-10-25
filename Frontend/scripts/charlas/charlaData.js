const gestorCharlas = new GestorCharlas();

async function renderizarCharlas() {
  const grid = document.getElementById('actividadesGrid');
  if (grid === null) {
    return; 
  }

  const charlas = await gestorCharlas.obtenerCharlas();

  if (charlas.length === 0) {
    grid.innerHTML = '<p>' + t('list.sinCharlas') + '</p>';
    return;
  }

  let html = "";

  for (let i = 0; i < charlas.length; i++) {
    const charla = charlas[i];

    html += `
    <article class="curso-mini">
          <div class="curso-mini__media">
            <img src="${charla.imagen}" alt="${charla.titulo}"></img>
          </div>
          <div class="curso-mini__info">
            <span class="act-tipo">${tDato(charla.tipo)}</span>
            <h3>${charla.titulo}</h3>
            <p class="curso-desc">${charla.descripcionCorta}</p>
            <p class="curso-mini__meta">
              <span><i class="fa-regular fa-clock"></i>${charla.hora}</span>
              <span><i class="fa-solid fa-laptop"></i>${tDato(charla.tipo)}</span>
            </p>
            <a href="charla-detalle.html?idCharla=${charla.id}" class="nc-btn nc-btn--outline nc-btn--mini">${t("act.verMas")}</a>
          </div>
        </article>
  `;
  }

  grid.innerHTML = html;
}

function iniciarListadoCharlas() {
  renderizarCharlas().catch(function () {
    mostrarErrorServidor(document.getElementById("actividadesGrid"));
  });
}

document.addEventListener('DOMContentLoaded', iniciarListadoCharlas);
document.addEventListener('idiomacambiado', iniciarListadoCharlas);