const MENSAJES_KEY = 'nodo_cultural_mensajes';

// Guarda un mensaje de contacto en localStorage
function guardarMensajeContacto(mensaje) {
  const data = localStorage.getItem(MENSAJES_KEY);
  const mensajes = data ? JSON.parse(data) : [];
  mensajes.push(mensaje);
  localStorage.setItem(MENSAJES_KEY, JSON.stringify(mensajes));
}

const form = document.getElementById('formContacto');
const mensajeExito = document.getElementById('mensajeExito');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const mensaje = {
    nombre: document.getElementById('nombre').value.trim(),
    email: document.getElementById('email').value.trim(),
    mensaje: document.getElementById('mensaje').value.trim(),
    fecha: new Date().toISOString()
  };

  guardarMensajeContacto(mensaje);

  form.style.display = 'none';
  mensajeExito.style.display = 'flex';
});
