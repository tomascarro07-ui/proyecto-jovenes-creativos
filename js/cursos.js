// ============================================================
// cursos.js — dibuja los cursos y talleres a partir de data/cursos.json
// Lo usan dos páginas:
//   - index.html:         solo los cursos "destacados" (data-solo-destacados="true")
//   - arte_talleres.html: todos los cursos
// ============================================================

async function renderizarCursos() {
  const contenedor = document.getElementById('cursosGrid');
  if (!contenedor) return;

  let cursos = await cargarJSON('data/cursos.json');

  if (!cursos) {
    mostrarErrorCarga(contenedor);
    return;
  }

  // data-solo-destacados="true" en el HTML llega acá como dataset.soloDestacados
  if (contenedor.dataset.soloDestacados === 'true') {
    cursos = cursos.filter(curso => curso.destacado);
  }

  contenedor.innerHTML = cursos.map(curso => {
    const iconoModalidad = curso.modalidad === 'Online'
      ? 'fa-solid fa-laptop'
      : 'fa-solid fa-location-dot';

    // encodeURIComponent arma el texto para poder ponerlo en una URL (espacios, tildes, etc.)
    const enlace = `contacto.html?curso=${encodeURIComponent(curso.titulo)}&duracion=${encodeURIComponent(curso.duracion)}`;

    return `
      <article class="curso-card">
        <span class="curso-nivel">${escaparHTML(curso.nivel)}</span>
        <h3>${escaparHTML(curso.titulo)}</h3>
        <p>${escaparHTML(curso.descripcion)}</p>
        <div class="curso-detalle">
          <span><i class="fa-regular fa-clock"></i> ${escaparHTML(curso.duracion)}</span>
          <span><i class="${iconoModalidad}"></i> ${escaparHTML(curso.modalidad)}</span>
        </div>
        <a href="${enlace}" class="btn btn-outline">Inscribirme</a>
      </article>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', renderizarCursos);
