const contenedorRecurso = document.getElementById("detalleContenido");

function renderizarRecurso() {
  if (contenedorRecurso === null) {
    return;
  }

  const id = gestorRecursos.obtenerIdDesdeUrl();

  if (!id) {
    contenedorRecurso.innerHTML = '<p class="admin-vacio">No se encontró el recurso.</p>';
    return;
  }

  const recurso = gestorRecursos.obtenerRecursoPorId(id);

  if (recurso === null) {
    contenedorRecurso.innerHTML = '<p class="admin-vacio">No se encontró el recurso.</p>';
    return;
  }

  const textoPaginas = recurso.paginas === 1 ? "página" : "páginas";

  contenedorRecurso.innerHTML = `
    <div class="charla-detalle">
      <div class="charla-detalle__body">

        <h1>${recurso.titulo}</h1>
        <p class="charla-detalle__desc">${recurso.descripcion}</p>

        <dl class="charla-detalle__datos">
          <div>
            <dt><i class="fa-solid fa-tag"></i> Categoría</dt>
            <dd>${recurso.categoria}</dd>
          </div>
          <div>
            <dt><i class="fa-solid fa-book-open"></i> Fuente</dt>
            <dd>${recurso.fuente}</dd>
          </div>
          <div>
            <dt><i class="fa-regular fa-file-lines"></i> Páginas</dt>
            <dd>${recurso.paginas} ${textoPaginas}</dd>
          </div>
          <div>
            <dt><i class="fa-solid fa-weight-hanging"></i> Tamaño</dt>
            <dd>${recurso.tamano}</dd>
          </div>
        </dl>

        <div class="charla-detalle__footer">
          <span class="charla-detalle__cupos">
            <i class="fa-solid fa-file-pdf"></i> Formato PDF
          </span>
          <a href="${recurso.archivo}" download class="nc-btn" aria-label="Descargar ${recurso.titulo}, PDF">
            <i class="fa-solid fa-download"></i> Descargar
          </a>
        </div>

      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', renderizarRecurso);