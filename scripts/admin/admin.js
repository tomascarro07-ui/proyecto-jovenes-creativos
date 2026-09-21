const form = document.getElementById('formCharla');
const adminLista = document.getElementById('adminLista');

function renderizarLista() {
  const charlas = obtenerCharlas();
  const talleres = obtenerTalleres();

  if (charlas.length === 0) {
    adminLista.innerHTML = '<p class="admin-vacio">Todavía no hay charlas cargadas.</p>';
    return;
  }

  let html = '';

  for (let i = 0; i < charlas.length; i++) {
    const charla = charlas[i];

    html += `
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
        </div>
      </article>
    `
  }

  adminLista.innerHTML = html;

  // Enganchar los botones de eliminar recién creados
  document.querySelectorAll('.admin-btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('¿Seguro que querés eliminar esta charla?')) {
        eliminarCharla(id);
        renderizarLista();
      }
    });
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nuevaCharla = {
    titulo: document.getElementById('titulo').value.trim(),
    fecha: document.getElementById('fecha').value,
    hora: document.getElementById('hora').value,
    lugar: document.getElementById('museo').value,
    tipo: document.getElementById('tipo').value,
    cupos: parseInt(document.getElementById('cupos').value),
    expositor: document.getElementById('expositor').value.trim(),
    imagen: document.getElementById('imagen').value.trim(),
    descripcionCorta: document.getElementById('descripcionCorta').value.trim(),
    descripcionCompleta: document.getElementById('descripcionCompleta').value.trim()
  };

  agregarCharla(nuevaCharla);
  form.reset();
  renderizarLista();

  const btn = form.querySelector('button[type="submit"]');
  const textoOriginal = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Charla agregada!';
  btn.style.backgroundColor = '#2E7D32';
  btn.style.borderColor = '#2E7D32';
  setTimeout(() => {
    btn.innerHTML = textoOriginal;
    btn.style.backgroundColor = '';
    btn.style.borderColor = '';
  }, 1800);
});

document.addEventListener('DOMContentLoaded', renderizarLista);
