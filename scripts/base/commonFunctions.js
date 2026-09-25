function separarFecha(fecha) {
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const partes = fecha.split('-');

  return {
    dia: Number(partes[2]),
    mes: meses[Number(partes[1]) - 1]
  };
}

function obtenerIdDesdeUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}