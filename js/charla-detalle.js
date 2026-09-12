const CONFIRMACIONES_KEY = 'nodo_cultural_confirmaciones';

// Obtiene el ID desde la URL (?id=1)
function obtenerIdDesdeUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Guarda una confirmación de asistencia
function guardarConfirmacion(confirmacion) {
  const data = localStorage.getItem(CONFIRMACIONES_KEY);
  const confirmaciones = data ? JSON.parse(data) : [];
  confirmaciones.push(confirmacion);
  localStorage.setItem(CONFIRMACIONES_KEY, JSON.stringify(confirmaciones));
}

// Cuenta cuántas confirmaciones tiene una charla
function contarConfirmaciones(idCharla) {
  const data = localStorage.getItem(CONFIRMACIONES_KEY);
  const confirmaciones = data ? JSON.parse(data) : [];
  return confirmaciones
    .filter(c => c.idCharla === parseInt(idCharla))
    .reduce((total, c) => total + c.cantidadPersonas, 0);
}

function renderizarDetalle() {
  const id = obtenerIdDesdeUrl();
  const contenedor = document.getElementById('detalleContenido');

  if (!id) {
    contenedor.innerHTML = '<p class="detalle-error">No se especificó ninguna charla.</p>';
    return;
  }

  const charla = obtenerCharlaPorId(id);

  if (!charla) {
    contenedor.innerHTML = '<p class="detalle-error">No se encontró la charla solicitada.</p>';
    return;
  }

  const confirmados = contarConfirmaciones(charla.id);
  const cuposDisponibles = charla.cupos - confirmados;
  const sinCupo = cuposDisponibles <= 0;

  contenedor.innerHTML = `
    <article class="detalle-charla">

      <div class="detalle-hero">
        <img src="${charla.imagen}" alt="${charla.titulo}" class="detalle-img">
        <div class="detalle-hero-overlay">
          <span class="detalle-fecha-badge">${formatearFechaCorta(charla.fecha)}</span>
        </div>
      </div>

      <div class="detalle-body">
        <h2 class="detalle-titulo">${charla.titulo}</h2>

        <div class="detalle-meta">
          <span><i class="fa-regular fa-calendar"></i> ${formatearFechaLarga(charla.fecha)}</span>
          <span><i class="fa-regular fa-clock"></i> ${charla.hora} hs</span>
          <span><i class="fa-solid fa-location-dot"></i> ${charla.lugar}</span>
          <span><i class="fa-solid fa-user"></i> ${charla.expositor}</span>
        </div>

        <p class="detalle-descripcion">${charla.descripcionCompleta}</p>

        <div class="detalle-cupos ${sinCupo ? 'detalle-cupos-lleno' : ''}">
          <i class="fa-solid fa-chair"></i>
          ${sinCupo
            ? 'No quedan cupos disponibles'
            : `${cuposDisponibles} de ${charla.cupos} cupos disponibles`}
        </div>

        ${sinCupo ? `
          <button class="btn" disabled style="opacity: 0.5; cursor: not-allowed;">
            Cupos agotados
          </button>
        ` : `
          <button class="btn" id="btnMostrarForm">
            <i class="fa-solid fa-check"></i> Confirmar asistencia
          </button>
        `}

        <!-- FORM DE CONFIRMACIÓN (oculto hasta que se hace click) -->
        <form id="formConfirmacion" class="form-confirmacion" style="display: none;">
          <h3>Confirmá tu asistencia</h3>

          <div class="form-grupo">
            <label for="nombre">Nombre y apellido</label>
            <input type="text" id="nombre" required placeholder="Tu nombre completo">
          </div>

          <div class="form-grupo">
            <label for="email">Email</label>
            <input type="email" id="email" required placeholder="tuemail@ejemplo.com">
          </div>

          <div class="form-grupo">
            <label for="telefono">Teléfono</label>
            <input type="tel" id="telefono" required placeholder="09X XXX XXX">
          </div>

          <div class="form-grupo">
            <label for="cantidadPersonas">Cantidad de personas</label>
            <input type="number" id="cantidadPersonas" required min="1" max="${cuposDisponibles}" value="1">
          </div>

          <button type="submit" class="btn">
            <i class="fa-solid fa-paper-plane"></i> Enviar confirmación
          </button>
        </form>

        <!-- MENSAJE DE ÉXITO -->
        <div id="mensajeExito" class="mensaje-exito" style="display: none;">
          <i class="fa-solid fa-circle-check"></i>
          <p>¡Listo! Tu asistencia a <strong>${charla.titulo}</strong> fue confirmada.</p>
        </div>

      </div>
    </article>
  `;

  // Mostrar el form al hacer click en "Confirmar asistencia"
  const btnMostrar = document.getElementById('btnMostrarForm');
  if (btnMostrar) {
    btnMostrar.addEventListener('click', () => {
      document.getElementById('formConfirmacion').style.display = 'flex';
      btnMostrar.style.display = 'none';
    });
  }

  // Manejar el envío del form
  const form = document.getElementById('formConfirmacion');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const confirmacion = {
        idCharla: charla.id,
        tituloCharla: charla.titulo,
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        cantidadPersonas: parseInt(document.getElementById('cantidadPersonas').value),
        fechaConfirmacion: new Date().toISOString()
      };

      guardarConfirmacion(confirmacion);

      form.style.display = 'none';
      document.getElementById('mensajeExito').style.display = 'flex';
    });
  }
}

document.addEventListener('DOMContentLoaded', renderizarDetalle);
