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

function escaparHtml(texto) {
	return String(texto == null ? "" : texto)
		.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}