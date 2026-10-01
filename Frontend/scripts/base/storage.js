function guardarEnStorage(clave,valor) {
	localStorage.setItem(clave,JSON.stringify(valor));
}

function leerDeStorage(clave,valorDefecto) {
	let contenido = localStorage.getItem(clave);
	
	if(!contenido) {
		return valorDefecto;
	}
	
	try {
		return JSON.parse(contenido);
	}
	catch(e) {
		console.error(e);
		return valorDefecto;
	}
}