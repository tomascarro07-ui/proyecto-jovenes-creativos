const gestorRecursos = new GestorRecursos();

async function renderizarRecursos() {
  const grid = document.getElementById('recursosGrid');
  if (grid === null) {
    return;
  }

  const todos = await gestorRecursos.obtenerRecursos();
  const categorias = gestorRecursos.obtenerCategorias(todos);

  if (categorias.length === 0) {
    grid.innerHTML = '<p>Todavía no hay recursos cargados.</p>';
    return;
  }

  let html = "";

  for (let i = 0; i < categorias.length; i++) {
    const categoria = categorias[i];
    const recursos = gestorRecursos.obtenerRecursosPorCategoria(categoria, todos);

    html += `
      <div class="col-lg-6">
        <h3 class="h6 fw-semibold mb-2">${categoria}</h3>
        <ul class="recurso-lista">
    `;

    for (let j = 0; j < recursos.length; j++) {
      const recurso = recursos[j];
      const textoPaginas = recurso.paginas === 1 ? "página" : "páginas";

      html += `
          <li>
            <i class="fa-solid fa-file-pdf recurso-pdf" aria-hidden="true"></i>
            <div>
              <strong>${recurso.titulo}</strong>
              <span class="recurso-desc">${recurso.descripcion}</span>
              <span class="recurso-desc">${recurso.fuente} · PDF · ${recurso.paginas} ${textoPaginas}</span>
            </div>
            <a href="${recurso.archivo}" download aria-label="Descargar ${recurso.titulo}, PDF">Descargar <i class="fa-solid fa-download"></i></a>
          </li>
      `;
    }

    html += `
        </ul>
      </div>
    `;
  }

  grid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function () {
  renderizarRecursos().catch(function () {
    mostrarErrorServidor(document.getElementById("recursosGrid"));
  });
});