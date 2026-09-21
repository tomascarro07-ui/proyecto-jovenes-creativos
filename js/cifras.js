// ============================================================
// cifras.js — completa la cifra "museos aliados" de la home
// con la cantidad real de museos de data/museos.json
// ============================================================

async function actualizarCifraMuseos() {
  const elemento = document.getElementById('cifraMuseos');
  const museos = await cargarJSON('data/museos.json');

  // Si no se pudo cargar, se queda el número que ya está escrito en el HTML
  if (museos && elemento) {
    elemento.textContent = museos.length;
  }
}

document.addEventListener('DOMContentLoaded', actualizarCifraMuseos);
