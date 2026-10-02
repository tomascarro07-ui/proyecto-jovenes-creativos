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

// Ejecuta una acción contra la API y, si sale bien, vuelve a dibujar la lista.
// Si falla, avisa con un mensaje en vez de romper el panel.
async function accionAdmin(accion, redibujar) {
  try {
    await accion();
    await redibujar();
  } catch (error) {
    alert("No se pudo completar la acción: " + error.message);
  }
}


async function renderizarCharla() {
  let charlas = await gestorCharlas.obtenerCharlas();
  charlasProximas.textContent = charlas.length;

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
          <button type="button" class="admin-btn-ver" data-inscriptos data-tipo="charla" data-id="${charla.id}" title="Ver inscriptos">
            <i class="fa-solid fa-users"></i>
          </button>
        </div>
      </article>
    `;
  }

  adminCharla.innerHTML = htmlCharla;
}

if (formCharla) {
  formCharla.addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
    await gestorCharlas.agregarCharla(
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
    await renderizarCharla();
    } catch (error) {
      alert("No se pudo guardar la charla: " + error.message);
    }
  });
}

if (adminCharla) {
  adminCharla.addEventListener('click', async function (e) {
    const btnEliminar = e.target.closest('.admin-btn-eliminar');
    const btnCheck = e.target.closest('.admin-btn-check');

    if (btnEliminar) {
      await accionAdmin(() => gestorCharlas.eliminarCharla(btnEliminar.dataset.id), renderizarCharla);
    }

    if (btnCheck) {
      await accionAdmin(() => gestorCharlas.marcarFinalizada(btnCheck.dataset.id), renderizarCharla);
    }
  });
}



async function renderizarTaller() {
  let talleres = await gestorTalleres.obtenerTalleres();
  talleresProximas.textContent = talleres.length;

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
          <button type="button" class="admin-btn-ver" data-inscriptos data-tipo="taller" data-id="${taller.id}" title="Ver inscriptos">
            <i class="fa-solid fa-users"></i>
          </button>
        </div>
      </article>
    `;
  }

  adminTaller.innerHTML = htmlTaller;
}

if (formTaller) {
  formTaller.addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
    await gestorTalleres.agregarTaller(
      document.getElementById("taller-titulo").value.trim(),
      document.getElementById('taller-nivel').value,
      document.getElementById('taller-modalidad').value,
      parseInt(document.getElementById('taller-duracion').value),
      parseInt(document.getElementById('taller-cupos').value),
      document.getElementById('taller-imagen').value,
      document.getElementById('taller-descripcion').value.trim()
    );

    formTaller.reset();
    await renderizarTaller();
    } catch (error) {
      alert("No se pudo guardar el taller: " + error.message);
    }
  });
}

if (adminTaller) {
  adminTaller.addEventListener('click', async function (e) {
    const btnEliminar = e.target.closest('.admin-btn-eliminar');
    const btnCheck = e.target.closest('.admin-btn-check');

    if (btnEliminar) {
      await accionAdmin(() => gestorTalleres.eliminarTaller(btnEliminar.dataset.id), renderizarTaller);
    }

    if (btnCheck) {
      await accionAdmin(() => gestorTalleres.marcarFinalizada(btnCheck.dataset.id), renderizarTaller);
    }
  });
}



async function renderizarRecorrido() {
  let recorridos = await gestorRecorridos.obtenerRecorridos();
  recorridosActivos.textContent = recorridos.length;

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
          <p>${recorrido.tipo} — ${formatearDuracion(recorrido)}</p>
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
          <button type="button" class="admin-btn-ver" data-inscriptos data-tipo="recorrido" data-id="${recorrido.id}" title="Ver inscriptos">
            <i class="fa-solid fa-users"></i>
          </button>
        </div>
      </article>
    `;
  }

  adminRecorrido.innerHTML = htmlRecorrido;
}

if (formRecorrido) {
  formRecorrido.addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
    await gestorRecorridos.agregarRecorrido(
      document.getElementById("recorrido-titulo").value.trim(),
      document.getElementById("recorrido-tipo").value.trim(),
      parseInt(document.getElementById("recorrido-horas").value.trim()),
      parseInt(document.getElementById("recorrido-minutos").value.trim()),
      document.getElementById("recorrido-imagen").value,
      document.getElementById("recorrido-puntoSalida").value.trim(),
      parseInt(document.getElementById("recorrido-cupos").value.trim()),
      document.getElementById("recorrido-descripcionCorta").value.trim()
    );

    formRecorrido.reset();
    await renderizarRecorrido();
    } catch (error) {
      alert("No se pudo guardar el recorrido: " + error.message);
    }
  });
}

if (adminRecorrido) {
  adminRecorrido.addEventListener('click', async function (e) {
    const btnEliminar = e.target.closest('.admin-btn-eliminar');
    const btnCheck = e.target.closest('.admin-btn-check');

    if (btnEliminar) {
      await accionAdmin(() => gestorRecorridos.eliminarRecorrido(btnEliminar.dataset.id), renderizarRecorrido);
    }

    if (btnCheck) {
      await accionAdmin(() => gestorRecorridos.marcarFinalizada(btnCheck.dataset.id), renderizarRecorrido);
    }
  });
}



async function renderizarRecursos() {
  let recursos = await gestorRecursos.obtenerRecursos();
  recursosActivos.textContent = recursos.length;

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
  formRecurso.addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
    await gestorRecursos.agregarRecurso(
      document.getElementById("recurso-titulo").value.trim(),
      document.getElementById("recurso-tipo").value.trim(),
      document.getElementById("recurso-descripcionCorta").value.trim(),
      document.getElementById("recurso-autor").value.trim(),
      1,
      document.getElementById("recurso-archivo").value.trim()
    );

    formRecurso.reset();
    await renderizarRecursos();
    } catch (error) {
      alert("No se pudo guardar el recurso: " + error.message);
    }
  });
}

if (recursosGrid) {
  recursosGrid.addEventListener('click', async function (e) {
    const btnEliminar = e.target.closest('.recurso-eliminar');

    if (btnEliminar) {
      e.preventDefault();
      await accionAdmin(() => gestorRecursos.eliminarRecurso(btnEliminar.dataset.id), renderizarRecursos);
    }
  });
}



document.addEventListener('DOMContentLoaded', async function () {
  if (!(await protegerPagina())) return;
  try {
    await Promise.all([
      renderizarCharla(),
      renderizarTaller(),
      renderizarRecorrido(),
      renderizarRecursos()
    ]);
  } catch (error) {
    alert("No se pudo conectar con el servidor. Revisá que el backend esté encendido.");
  }
});

document.addEventListener("click", async function (e) {
  const boton = e.target.closest("[data-inscriptos]");
  if (!boton) return;

  try {
    const inscriptos = await gestorInscripciones.deActividad(boton.dataset.tipo, boton.dataset.id);
    const personas = inscriptos.reduce((t, i) => t + i.cantidadPersonas, 0);

    let filas = inscriptos.map(function (i) {
      return `<tr><td>${escaparHtml(i.nombre)}</td><td>${escaparHtml(i.correo)}</td><td>${escaparHtml(i.telefono)}</td><td>${i.cantidadPersonas}</td></tr>`;
    }).join("");

    const dialogo = document.createElement("dialog");
    dialogo.style.cssText = "max-width:90vw;border-radius:12px;padding:1.5rem;";
    dialogo.innerHTML = `
      <h3>Inscriptos (${inscriptos.length} · ${personas} personas)</h3>
      ${inscriptos.length === 0 ? "<p>Todavía no hay inscriptos.</p>" : `
      <div style="overflow-x:auto"><table class="table">
        <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Personas</th></tr></thead>
        <tbody>${filas}</tbody>
      </table></div>`}
      <button type="button" class="nc-btn" id="cerrarInscriptos">Cerrar</button>`;
    document.body.appendChild(dialogo);
    dialogo.querySelector("#cerrarInscriptos").onclick = function () { dialogo.close(); dialogo.remove(); };
    dialogo.showModal();
  } catch (error) {
    alert("No se pudieron cargar los inscriptos: " + error.message);
  }
});