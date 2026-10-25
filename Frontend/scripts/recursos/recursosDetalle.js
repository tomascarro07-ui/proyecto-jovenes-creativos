const contenedorRecurso = document.getElementById("detalleContenido");

async function renderizarRecurso() {
  if (contenedorRecurso === null) {
    return;
  }

  const id = gestorRecursos.obtenerIdDesdeUrl();

  if (!id) {
    contenedorRecurso.innerHTML = '<p class="admin-vacio">' + t("rec.noEnc") + '</p>';
    return;
  }

  const recurso = await gestorRecursos.obtenerRecursoPorId(id);

  if (recurso === null) {
    contenedorRecurso.innerHTML = '<p class="admin-vacio">' + t("rec.noEnc") + '</p>';
    return;
  }

  const textoPaginas = t(recurso.paginas === 1 ? "rec.pagina" : "rec.paginas");

  contenedorRecurso.innerHTML = `
    <div class="charla-detalle">
      <div class="charla-detalle__body">

        <h1>${recurso.titulo}</h1>
        <p class="charla-detalle__desc">${recurso.descripcion}</p>

        <dl class="charla-detalle__datos">
          <div>
            <dt><i class="fa-solid fa-tag"></i> ${t("rec.categoria")}</dt>
            <dd>${recurso.categoria}</dd>
          </div>
          <div>
            <dt><i class="fa-solid fa-book-open"></i> ${t("rec.fuente")}</dt>
            <dd>${recurso.fuente}</dd>
          </div>
          <div>
            <dt><i class="fa-regular fa-file-lines"></i> ${t("rec.paginasLabel")}</dt>
            <dd>${recurso.paginas} ${textoPaginas}</dd>
          </div>
        </dl>

        <div class="charla-detalle__footer">
          <span class="charla-detalle__cupos">
            <i class="fa-solid fa-file-pdf"></i> ${t("rec.formato")}
          </span>
          <a href="${recurso.archivo}" download class="nc-btn" aria-label="${t("rec.descargarAria", { titulo: recurso.titulo })}">
            <i class="fa-solid fa-download"></i> ${t("rec.descargar")}
          </a>
        </div>

      </div>
    </div>
  `;
}

function iniciarRecurso() {
  renderizarRecurso().catch(function () {
    mostrarErrorServidor(contenedorRecurso);
  });
}

document.addEventListener('DOMContentLoaded', iniciarRecurso);
document.addEventListener('idiomacambiado', iniciarRecurso);