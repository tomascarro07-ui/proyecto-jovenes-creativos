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
        let talleres = leerDeStorage(TALLERES_KEY,null);

        return talleres.length;
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

    agregarTaller(id,titulo,tipo,modalidad,cantClases,cupos,imagen,descripcionCorta) {
        const talleres = this.obtenerTalleres();
        let taller = new Taller(id,titulo,tipo,modalidad,cantClases,cupos,imagen,descripcionCorta)

        taller.id = Date.now();

        talleres.push(taller);

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
}