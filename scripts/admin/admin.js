const formCharla = document.getElementById('formCharla');
const formTaller = document.getElementById('formTaller');
const formRecorrido = document.getElementById('formRecorrido');
const formRecurso = document.getElementById('formRecurso');
const adminCharla = document.getElementById('adminCharla');
const adminTaller = document.getElementById('adminTaller');
const adminRecorrido = document.getElementById('adminRecorrido');
const recursosGrid = document.getElementById('recursosGrid');

let charlasProximas = document.getElementById("resumenCharlasProximas");
let talleresProximas = document.getElementById("resumenTalleresActivos");
let recorridosActivos = document.getElementById("resumenRecorridosActivos");
let recursosActivos = document.getElementById("resumenRecursosActivos");


function renderizarCharla() {
  let charlas = gestorCharlas.obtenerCharlas();

  if (charlas.length === 0) {
    adminCharla.innerHTML = '<p class="admin-vacio">Todavía no hay charlas cargadas.</p>';
    return;
  }

  let htmlCharla = "";

  for (let i = 0; i < charlas.length; i++) {
    const charla = charlas[i];
    const clase = charla.finalizada ? "admin-item admin-item--finalizada" : "admin-item";
    const claseCheck = charla.finalizada ? "admin-btn-check activo" : "admin-btn-check";

    htmlCharla += `
      <article class="${clase}">
        <img src="${charla.imagen}" alt="${charla.titulo}" class="admin-item-img">
        <div class="admin-item-info">
          <span class="admin-item-fecha">${charla.fecha} · ${charla.hora} hs</span>
          <h4>${charla.titulo}</h4>
          <p>${charla.lugar} — ${charla.cupos} cupos</p>
        </div>
        <div class="admin-item-acciones">
          <a href="charla-detalle.html?idCharla=${charla.id}" class="admin-btn-ver" title="Ver detalle">
            <i class="fa-solid fa-eye"></i>
          </a>
          <button type="button" class="admin-btn-eliminar" data-id="${charla.id}" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
          <button type="button" class="${claseCheck}" data-id="${charla.id}" title="Marcar como finalizada">
            <i class="fa-solid fa-check"></i>
          </button>
        </div>
      </article>
    `;
  }

  adminCharla.innerHTML = htmlCharla;
}

if (formCharla) {
  formCharla.addEventListener('submit', function (e) {
    e.preventDefault();

    gestorCharlas.agregarCharla(
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
    renderizarCharla();
    charlasProximas.textContent = gestorCharlas.obtenerNumeroCharlas();
  });
}

if (adminCharla) {
  adminCharla.addEventListener('click', function (e) {
    const btnEliminar = e.target.closest('.admin-btn-eliminar');
    const btnCheck = e.target.closest('.admin-btn-check');

    if (btnEliminar) {
      gestorCharlas.eliminarCharla(btnEliminar.dataset.id);
      renderizarCharla();
      charlasProximas.textContent = gestorCharlas.obtenerNumeroCharlas();
    }

    if (btnCheck) {
      gestorCharlas.marcarFinalizada(btnCheck.dataset.id);
      renderizarCharla();
    }
  });
}



function renderizarTaller() {
  let talleres = gestorTalleres.obtenerTalleres();

  if (talleres.length === 0) {
    adminTaller.innerHTML = '<p class="admin-vacio">Todavía no hay talleres cargados.</p>';
    return;
  }

  let htmlTaller = "";

  for (let i = 0; i < talleres.length; i++) {
    const taller = talleres[i];
    const clase = taller.finalizada ? "admin-item admin-item--finalizada" : "admin-item";
    const claseCheck = taller.finalizada ? "admin-btn-check activo" : "admin-btn-check";

    htmlTaller += `
      <article class="${clase}">
        <img src="${taller.imagen}" alt="${taller.titulo}" class="admin-item-img">
        <div class="admin-item-info">
          <h4>${taller.titulo}</h4>
          <p>${taller.modalidad} — ${taller.cupos} cupos</p>
        </div>
        <div class="admin-item-acciones">
          <a href="taller-detalle.html?idTaller=${taller.id}" class="admin-btn-ver" title="Ver detalle">
            <i class="fa-solid fa-eye"></i>
          </a>
          <button type="button" class="admin-btn-eliminar" data-id="${taller.id}" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
          <button type="button" class="${claseCheck}" data-id="${taller.id}" title="Marcar como finalizado">
            <i class="fa-solid fa-check"></i>
          </button>
        </div>
      </article>
    `;
  }

  adminTaller.innerHTML = htmlTaller;
}

if (formTaller) {
  formTaller.addEventListener('submit', function (e) {
    e.preventDefault();

    gestorTalleres.agregarTaller(
      document.getElementById("taller-titulo").value.trim(),
      document.getElementById('taller-modalidad').value,
      document.getElementById('taller-duracion').value,
      parseInt(document.getElementById('taller-cupos').value),
      document.getElementById('taller-imagen').value,
      document.getElementById('taller-descripcion').value
    );

    formTaller.reset();
    renderizarTaller();
    talleresProximas.textContent = gestorTalleres.obtenerNumeroTalleres();
  });
}

if (adminTaller) {
  adminTaller.addEventListener('click', function (e) {
    const btnEliminar = e.target.closest('.admin-btn-eliminar');
    const btnCheck = e.target.closest('.admin-btn-check');

    if (btnEliminar) {
      gestorTalleres.eliminarTaller(btnEliminar.dataset.id);
      renderizarTaller();
      talleresProximas.textContent = gestorTalleres.obtenerNumeroTalleres();
    }

    if (btnCheck) {
      gestorTalleres.marcarFinalizada(btnCheck.dataset.id);
      renderizarTaller();
    }
  });
}



function renderizarRecorrido() {
  let recorridos = gestorRecorridos.obtenerRecorridos();

  if (recorridos.length === 0) {
    adminRecorrido.innerHTML = '<p class="admin-vacio">Todavía no hay recorridos cargados.</p>';
    return;
  }

  let htmlRecorrido = "";

  for (let i = 0; i < recorridos.length; i++) {
    const recorrido = recorridos[i];
    const clase = recorrido.finalizada ? "admin-item admin-item--finalizada" : "admin-item";
    const claseCheck = recorrido.finalizada ? "admin-btn-check activo" : "admin-btn-check";

    htmlRecorrido += `
      <article class="${clase}">
        <img src="${recorrido.imagen}" alt="${recorrido.titulo}" class="admin-item-img">
        <div class="admin-item-info">
          <h4>${recorrido.titulo}</h4>
          <p>${recorrido.tipo} — ${recorrido.duracion}</p>
        </div>
        <div class="admin-item-acciones">
          <a href="recorrido-detalle.html?idRecorrido=${recorrido.id}" class="admin-btn-ver" title="Ver detalle">
            <i class="fa-solid fa-eye"></i>
          </a>
          <button type="button" class="admin-btn-eliminar" data-id="${recorrido.id}" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
          <button type="button" class="${claseCheck}" data-id="${recorrido.id}" title="Marcar como finalizado">
            <i class="fa-solid fa-check"></i>
          </button>
        </div>
      </article>
    `;
  }

  adminRecorrido.innerHTML = htmlRecorrido;
}

if (formRecorrido) {
  formRecorrido.addEventListener('submit', function (e) {
    e.preventDefault();

    gestorRecorridos.agregarRecorrido(
      document.getElementById("recorrido-titulo").value.trim(),
      document.getElementById("recorrido-tipo").value.trim(),
      parseInt(document.getElementById("recorrido-duracion").value.trim()),
      document.getElementById("recorrido-puntoSalida").value.trim(),
      document.getElementById("recorrido-imagen").value,
      document.getElementById("recorrido-descripcionCorta").value.trim()
    );

    formRecorrido.reset();
    renderizarRecorrido();
    recorridosActivos.textContent = gestorRecorridos.obtenerNumeroRecorridos();
  });
}

if (adminRecorrido) {
  adminRecorrido.addEventListener('click', function (e) {
    const btnEliminar = e.target.closest('.admin-btn-eliminar');
    const btnCheck = e.target.closest('.admin-btn-check');

    if (btnEliminar) {
      gestorRecorridos.eliminarRecorrido(btnEliminar.dataset.id);
      renderizarRecorrido();
      recorridosActivos.textContent = gestorRecorridos.obtenerNumeroRecorridos();
    }

    if (btnCheck) {
      gestorRecorridos.marcarFinalizada(btnCheck.dataset.id);
      renderizarRecorrido();
    }
  });
}



function renderizarRecursos() {
  let recursos = gestorRecursos.obtenerRecursos();

  if (recursos.length === 0) {
    recursosGrid.innerHTML = '<p class="admin-vacio">Todavía no hay recursos cargados.</p>';
    return;
  }

  let htmlRecurso = "";

  for (let i = 0; i < recursos.length; i++) {
    const recurso = recursos[i];
    const textoPaginas = recurso.paginas === 1 ? "página" : "páginas";

    htmlRecurso += `
      <li>
        <i class="fa-solid fa-file-pdf recurso-pdf" aria-hidden="true"></i>
        <div>
          <strong>${recurso.titulo}</strong>
          <span class="recurso-desc">${recurso.descripcion}</span>
          <span class="recurso-desc">${recurso.fuente} · PDF · ${recurso.paginas} ${textoPaginas}</span>
        </div>
        <a href="#" class="recurso-eliminar" data-id="${recurso.id}" aria-label="Eliminar ${recurso.titulo}">
          Eliminar
        </a>
        <a href="${recurso.archivo}" download aria-label="Descargar ${recurso.titulo}, PDF">
          Descargar <i class="fa-solid fa-download"></i>
        </a>
      </li>
    `;
  }

  recursosGrid.innerHTML = htmlRecurso;
}

if (formRecurso) {
  formRecurso.addEventListener('submit', function (e) {
    e.preventDefault();

    gestorRecursos.agregarRecurso(
      document.getElementById("recurso-titulo").value.trim(),
      document.getElementById("recurso-tipo").value.trim(),
      document.getElementById("recurso-descripcionCorta").value.trim(),
      document.getElementById("recurso-autor").value.trim(),
      1,
      document.getElementById("recurso-archivo").value.trim()
    );

    formRecurso.reset();
    renderizarRecursos();
    recursosActivos.textContent = gestorRecursos.obtenerNumeroRecursos();
  });
}

if (recursosGrid) {
  recursosGrid.addEventListener('click', function (e) {
    const btnEliminar = e.target.closest('.recurso-eliminar');

    if (btnEliminar) {
      e.preventDefault();
      gestorRecursos.eliminarRecurso(btnEliminar.dataset.id);
      renderizarRecursos();
      recursosActivos.textContent = gestorRecursos.obtenerNumeroRecursos();
    }
  });
}



document.addEventListener('DOMContentLoaded', function () {
  renderizarCharla();
  renderizarTaller();
  renderizarRecorrido();
  renderizarRecursos();

  charlasProximas.textContent = gestorCharlas.obtenerNumeroCharlas();
  talleresProximas.textContent = gestorTalleres.obtenerNumeroTalleres();
  recorridosActivos.textContent = gestorRecorridos.obtenerNumeroRecorridos();
  recursosActivos.textContent = gestorRecursos.obtenerNumeroRecursos();
});