class GestorRecorridos {

    obtenerRecorridos() {
        let recorridos = leerDeStorage(RECORRIDOS_KEY, null);

        if (recorridos === null) {
            recorridos = recorridosIniciales;
            guardarEnStorage(RECORRIDOS_KEY, recorridos);
        }

        return recorridos;
    }

    obtenerNumeroRecorridos() {
        let recorridos = this.obtenerRecorridos();

        return recorridos.length;
    }

    guardarRecorridos(recorridos) {
        guardarEnStorage(RECORRIDOS_KEY, recorridos);
    }

    obtenerRecorridoPorId(id) {
        const recorridos = this.obtenerRecorridos();

        for (let i = 0; i < recorridos.length; i++) {
            if (recorridos[i].id === Number(id)) {
            return recorridos[i];
            }
        }

        return null;
    }

    agregarRecorrido(titulo,tipo,duracion,puntoSalida,imagen,descripcionCorta) {
        const recorridos = this.obtenerRecorridos();
        let recorrido = new Recorrido(Date.now(),titulo,tipo,duracion,puntoSalida,imagen,descripcionCorta)

        recorridos.push(recorrido);

        this.guardarRecorridos(recorridos);
    }

    marcarFinalizada(id) {
        const recorridos = this.obtenerRecorridos();

        for (let i = 0; i < recorridos.length; i++) {
            if (recorridos[i].id === Number(id)) {
                recorridos[i].finalizada = !recorridos[i].finalizada;
            }
        }

        this.guardarRecorridos(recorridos);
    }

    eliminarRecorrido(id) {
        const recorridos = this.obtenerRecorridos();
        const restantes = [];

        for (let i = 0; i < recorridos.length; i++) {
            if (recorridos[i].id !== Number(id)) {
            restantes.push(recorridos[i]);
            }
        }

        this.guardarRecorridos(restantes);
    }

    obtenerIdDesdeUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("idRecorrido");
    }
}