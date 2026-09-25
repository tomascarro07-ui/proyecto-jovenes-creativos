const formCharla = document.getElementById('formCharla');
const formTaller = document.getElementById('formTaller');
const adminCharla = document.getElementById('adminCharla');
const adminTaller = document.getElementById('adminTaller');

function renderizarCharla() {
  let charlas = gestorCharlas.obtenerCharlas();

  if (charlas.length === 0) {
    adminLista.textContent = '<p class="admin-vacio">Todavía no hay charlas cargadas.</p>';
    return;
  }

  let htmlCharla = "";

  for (let i = 0; i < charlas.length; i++) {
    const charla = charlas[i];

    htmlCharla += `
      <article class="admin-item">
        <img src="${charla.imagen}" alt="${charla.titulo}" class="admin-item-img">
        <div class="admin-item-info">
          <span class="admin-item-fecha">${(charla.fecha)} · ${charla.hora} hs</span>
          <h4>${charla.titulo}</h4>
          <p>${charla.lugar} — ${charla.cupos} cupos</p>
        </div>
        <div class="admin-item-acciones">
          <a href="charla-detalle.html?id=${charla.id}" class="admin-btn-ver" title="Ver detalle">
            <i class="fa-solid fa-eye"></i>
          </a>
          <button class="admin-btn-eliminar" data-id="${charla.id}" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
          <button class="admin-btn-check" data-id="${charla.id}" title="Finalizada">
            <i class="fa-solid fa-check"></i>
          </button>
        </div>
      </article>
    `
  }

  adminCharla.innerHTML = htmlCharla;
}

formCharla.addEventListener('submit', function(e) {
  e.preventDefault();

  gestorCharlas.agregarCharla (
    document.getElementById("charla-titulo").value.trim(),
    document.getElementById("charla-fecha").value,
    document.getElementById("charla-hora").value,
    document.getElementById("charla-lugar").value,
    document.getElementById("charla-tipo").value,
    document.getElementById("charla-imagen").value,
    document.getElementById("charla-expositor").value,
    document.getElementById("charla-descripcionCorta").value.trim(),
    document.getElementById("charla-descripcionCompleta").value.trim(),
    parseInt(document.getElementById("charla-cupos").value)
  );
  formCharla.reset();
});

let charlasProximas = document.getElementById("resumenCharlasProximas")
charlasProximas.textContent = gestorCharlas.obtenerNumeroCharlas();

document.addEventListener('DOMContentLoaded', renderizarCharla);


function renderizarTaller() {
  let talleres = gestorTalleres.obtenerTalleres();

  if (talleres.length === 0) {
    adminLista.textContent = '<p class="admin-vacio">Todavía no hay talleres cargados.</p>';
    return;
  }

  let htmlTaller = "";

  for (let i = 0; i < talleres.length; i++) {
    const taller = talleres[i];

    htmlTaller += `
      <article class="admin-item">
        <img src="${taller.imagen}" alt="${taller.titulo}" class="admin-item-img">
        <div class="admin-item-info">
          <h4>${taller.titulo}</h4>
          <p>${taller.modalidad} — ${taller.cupos} cupos</p>
        </div>
        <div class="admin-item-acciones">
          <a href="taller-detalle.html?id=${taller.id}" class="admin-btn-ver" title="Ver detalle">
            <i class="fa-solid fa-eye"></i>
          </a>
          <button class="admin-btn-eliminar" data-id="${taller.id}" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
          <button class="admin-btn-check" data-id="${taller.id}" title="Finalizado">
            <i class="fa-solid fa-check"></i>
          </button>
        </div>
      </article>
    `
  }

  adminTaller.innerHTML = htmlTaller;
}

formTaller.addEventListener('submit', function(e) {
  e.preventDefault();

  gestorTalleres.agregarTaller (
    document.getElementById("taller-titulo").value.trim(),
    document.getElementById('taller-modalidad').value,
    document.getElementById('taller-duracion').value,
    parseInt(document.getElementById('taller-cupos').value),
    document.getElementById('taller-imagen').value,
    document.getElementById('taller-descripcion').value
  );

  formTaller.reset();
});

let talleresProximas = document.getElementById("resumenTalleresActivos")
talleresProximas.textContent = gestorTalleres.obtenerNumeroTalleres();

document.addEventListener('DOMContentLoaded', renderizarTaller);

