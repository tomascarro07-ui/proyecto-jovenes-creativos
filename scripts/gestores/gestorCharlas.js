class GestorCharlas {

    obtenerCharlas() {
        let charlas = leerDeStorage(CHARLAS_KEY, null);

        if (charlas === null) {
            charlas = charlasIniciales;
            guardarEnStorage(CHARLAS_KEY, charlas);
        }

        return charlas;
    }

    obtenerNumeroCharlas() {
        let charlas = leerDeStorage(CHARLAS_KEY,null);

        return charlas.length;
    }

    guardarCharlas(charlas) {
        guardarEnStorage(CHARLAS_KEY, charlas);
    }

    obtenerCharlaPorId(id) {
        const charlas = this.obtenerCharlas();

        for (let i = 0; i < charlas.length; i++) {
            if (charlas[i].id === Number(id)) {
            return charlas[i];
            }
        }

        return null;
    }

    agregarCharla(id,titulo,fecha,hora,lugar,tipo,imagen,expositor,descripcionCorta,descripcionCompleta,cupos) {
        const charlas = this.obtenerCharlas();
        let charla = new Charla(id,titulo,fecha,hora,lugar,tipo,imagen,expositor,descripcionCorta,descripcionCompleta,cupos)

        charla.id = Date.now();
        charlas.push(charla);

        this.guardarCharlas(charlas);
    }

    eliminarCharla(id) {
        const charlas = this.obtenerCharlas();
        const restantes = [];

        for (let i = 0; i < charlas.length; i++) {
            if (charlas[i].id !== Number(id)) {
            restantes.push(charlas[i]);
            }
        }

        this.guardarCharlas(restantes);
    }

    obtenerIdDesdeUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }
}