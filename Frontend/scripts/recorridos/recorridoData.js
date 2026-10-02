const gestorRecorridos = new GestorRecorridos();

function formatearDuracion(recorrido) {

  const horas = Number(recorrido.duracionHoras);
  const minutos = Number(recorrido.duracionMinutos);

  if (!isNaN(horas) && !isNaN(minutos)) {

    if (horas === 0) {
      return `${minutos}min`;
    }

    if (minutos === 0) {
      return `${horas}h`;
    }

    return `${horas}h ${minutos}min`;
  }

  if (recorrido.duracion) {
    return recorrido.duracion;
  }

  return "Duración no disponible";
}


async function renderizarRecorridos() {

  const grid = document.getElementById("recorridosGrid");

  if (grid === null) {
    return;
  }

  const recorridos = await gestorRecorridos.obtenerRecorridos();

  if (recorridos.length === 0) {
    grid.innerHTML = '<p>Todavía no hay recorridos cargados.</p>';
    return;
  }

  let html = "";

  for (let i = 0; i < recorridos.length; i++) {

    const recorrido = recorridos[i];

    // Obtenemos la duración con el formato correcto
    const duracionTexto = formatearDuracion(recorrido);

    html += `
      <article class="curso-mini">

        <div class="curso-mini__media">
          <img src="${recorrido.imagen}" alt="${recorrido.titulo}">
        </div>

        <div class="curso-mini__info">

          <h3>${recorrido.titulo}</h3>

          <p class="curso-mini__meta">

            <span>
              <i class="fa-regular fa-clock"></i>
              ${duracionTexto}
            </span>

            <span>
              <i class="fa-solid fa-location-dot"></i>
              ${recorrido.puntoSalida}
            </span>

          </p>

          <p>${recorrido.descripcionCorta}</p>

          <a
            href="recorrido-detalle.html?idRecorrido=${recorrido.id}"
            class="nc-btn nc-btn--outline nc-btn--mini">
            Reservar
          </a>

        </div>

      </article>
    `;
  }

  grid.innerHTML = html;
}


document.addEventListener("DOMContentLoaded", function () {
  renderizarRecorridos().catch(function () {
    mostrarErrorServidor(document.getElementById("recorridosGrid"));
  });
});
