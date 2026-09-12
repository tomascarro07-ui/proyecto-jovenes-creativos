const track = document.getElementById('carruselTrack');
const slides = document.querySelectorAll('.carrusel-slide');
const prevBtn = document.getElementById('carruselPrev');
const nextBtn = document.getElementById('carruselNext');
const dotsContainer = document.getElementById('carruselDots');

let indiceActual = 0;

// Crear los puntos (dots) dinámicamente
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.classList.add('carrusel-dot');
  if (i === 0) dot.classList.add('activo');
  dot.addEventListener('click', () => irASlide(i));
  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.carrusel-dot');

function actualizarCarrusel() {
  track.style.transform = `translateX(-${indiceActual * 100}%)`;
  dots.forEach(dot => dot.classList.remove('activo'));
  dots[indiceActual].classList.add('activo');
}

function irASlide(i) {
  indiceActual = i;
  actualizarCarrusel();
}

nextBtn.addEventListener('click', () => {
  indiceActual = (indiceActual + 1) % slides.length;
  actualizarCarrusel();
});

prevBtn.addEventListener('click', () => {
  indiceActual = (indiceActual - 1 + slides.length) % slides.length;
  actualizarCarrusel();
});

// Autoplay cada 6 segundos
setInterval(() => {
  indiceActual = (indiceActual + 1) % slides.length;
  actualizarCarrusel();
}, 6000);
