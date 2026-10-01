const parametros = new URLSearchParams(window.location.search);
const gestorTalleres = new GestorTalleres();
const gestorCharla = new GestorCharlas();
const idTaller = Number(parametros.get("idTaller"));
const idCharla = Number(parametros.get("idCharla"));
const talleres = gestorTalleres.obtenerTalleres();
const charlas = gestorCharla.obtenerCharlas();

if (idTaller) {
  for(let i = 0; i < talleres.length; i++) {
    let taller = talleres[i];
    if(taller.id === idTaller) {
      recorrido = taller.titulo;
      duracion = taller.duracion;
    }

  }
  let grupoActividad = document.getElementById("grupoActividad");
  let campoActividad = document.getElementById("actividad");
  let mensaje = document.getElementById("mensaje");
  let titulo = document.getElementById("contactoAsuntoTitulo");
  let intro = document.getElementById("contactoIntro");

  titulo.textContent = "Reservá tu recorrido";
  intro.innerHTML = `Estás por consultar sobre nuestro <b>${recorrido}.</b> Completá tus datos y te contactaremos para coordinar.`;
  grupoActividad.hidden = false;

  if(duracion) {
    campoActividad.value = `${recorrido} (${duracion})`;
    mensaje.value =  `Hola, quiero reservar el recorrido "${recorrido}"${duracion ? ` (${duracion})` : ""}. Quedo atento/a a los próximos pasos.`;
  } else {
    campoActividad.value = recorrido;
    mensaje.value = `Hola, quiero reservar el recorrido "${recorrido}". Quedo atento/a a los próximos pasos.`;
  }

} else if (idCharla){
  for(let i = 0; i < charlas.length; i++) {
    let charla = charlas[i];
    if(charla.id === idCharla) {
      nombreCharla = charla.titulo;
      duracion = charla.duracion;
    }

  }
  let grupoActividad = document.getElementById("grupoActividad");
  let campoActividad = document.getElementById("actividad");
  let mensaje = document.getElementById("mensaje");
  let titulo = document.getElementById("contactoAsuntoTitulo");
  let intro = document.getElementById("contactoIntro");

  titulo.textContent = "Reservá tu lugar en la charla";
  intro.innerHTML = `Estás por consultar sobre la charla <b>${nombreCharla}.</b> Completá tus datos y te contactaremos para continuar con la inscripción.`;
  grupoActividad.hidden = false;

  if(duracion) {
    campoActividad.value = `${charla} (${duracion})`;
    mensaje.value =  `Hola, quiero reservar mi lugar en la charla "${nombreCharla}"${duracion ? ` (${duracion})` : ""}. Quedo atento/a a los próximos pasos.`;
  } else {
    campoActividad.value = nombreCharla;
    mensaje.value = `Hola, quiero reservar mi lugar en la charla "${nombreCharla}". Quedo atento/a a los próximos pasos.`;
  }
  
}
