usuarioActual = validarSesion();
 
const sesionNav = document.getElementById("sesionNav");
 
const gestorCharlasCarrusel = new GestorCharlas();

const mesesCompletos = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

function formatearFechaLarga(fecha) {
  const partes = fecha.split('-');
  const dia = Number(partes[2]);
  const mes = mesesCompletos[Number(partes[1]) - 1];

  return `${dia} de ${mes}`;
}

async function renderizarCarruselCharlas() {
  const indicadores = document.getElementById("carouselIndicadores");
  const inner = document.getElementById("carouselInner");

  if (!indicadores || !inner) {
    return;
  }

  const charlas = await gestorCharlasCarrusel.obtenerCharlas();

  if (charlas.length === 0) {
    indicadores.innerHTML = "";
    inner.innerHTML = `
      <div class="carousel-item active">
        <div class="nc-slide__caption">
          <span class="nc-slide__etiqueta">Evento destacado</span>
          <h2>Todavía no hay charlas cargadas</h2>
        </div>
      </div>
    `;
    return;
  }

  let htmlIndicadores = "";
  let htmlInner = "";

  for (let i = 0; i < charlas.length; i++) {
    const charla = charlas[i];
    const esActiva = i === 0;

    htmlIndicadores += `
      <button type="button" data-bs-target="#carouselDestacados" data-bs-slide-to="${i}" class="${esActiva ? 'active' : ''}" ${esActiva ? 'aria-current="true"' : ''} aria-label="Evento ${i + 1}"></button>
    `;

    htmlInner += `
      <div class="carousel-item ${esActiva ? 'active' : ''}">
        <img src="${charla.imagen}" alt="${charla.titulo}">
        <div class="nc-slide__caption">
          <span class="nc-slide__etiqueta">Evento destacado</span>
          <h2>${charla.titulo}</h2>
          <p>${formatearFechaLarga(charla.fecha)}, ${charla.lugar}</p>
          <a href="charla-detalle.html?idCharla=${charla.id}" class="nc-btn nc-btn--claro">Ver más</a>
        </div>
      </div>
    `;
  }

  indicadores.innerHTML = htmlIndicadores;
  inner.innerHTML = htmlInner;
}

document.addEventListener('DOMContentLoaded', function () {
  renderizarCarruselCharlas().catch(function () {
    mostrarErrorServidor(document.getElementById("carouselInner"));
  });
});