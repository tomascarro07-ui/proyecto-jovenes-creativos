class GestorTalleres {

    obtenerTalleres() {
        let talleres = leerDeStorage(TALLERES_KEY, null);

        if (talleres === null) {
            talleres = talleresIniciales;
            guardarEnStorage(TALLERES_KEY, talleres);
        }

        return talleres;
    }

    obtenerNumeroTalleres() {
        return this.obtenerTalleres().length;
    }

    guardarTalleres(talleres) {
        guardarEnStorage(TALLERES_KEY, talleres);
    }

    obtenerTallerPorId(id) {
        const talleres = this.obtenerTalleres();

        for (let i = 0; i < talleres.length; i++) {
            if (talleres[i].id === Number(id)) {
            return talleres[i];
            }
        }

        return null;
    }

    agregarTaller(titulo,tipo,modalidad,cantClases,cupos,imagen,descripcionCorta) {
        const talleres = this.obtenerTalleres();
        let taller = new Taller(titulo,tipo,modalidad,cantClases,cupos,imagen,descripcionCorta)

        taller.id = Date.now();

        talleres.push(taller);

        this.guardarTalleres(talleres);
    }

    marcarFinalizada(id) {
        const talleres = this.obtenerTalleres();

        for (let i = 0; i < talleres.length; i++) {
            if (talleres[i].id === Number(id)) {
                talleres[i].finalizada = !talleres[i].finalizada;
            }
        }

        this.guardarTalleres(talleres);
    }

    eliminarTaller(id) {
        const talleres = this.obtenerTalleres();
        const restantes = [];

        for (let i = 0; i < talleres.length; i++) {
            if (talleres[i].id !== Number(id)) {
            restantes.push(talleres[i]);
            }
        }

        this.guardarTalleres(restantes);
    }

    obtenerIdDesdeUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("idTaller");
    }
}