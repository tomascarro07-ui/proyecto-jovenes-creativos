class GestorRecursos {

    obtenerRecursos() {
        let recursos = leerDeStorage(RECURSOS_KEY, null);

        if (recursos === null) {
            recursos = recursosIniciales;
            guardarEnStorage(RECURSOS_KEY, recursos);
        }

        return recursos;
    }

    obtenerNumeroRecursos() {
        return this.obtenerRecursos().length;
    }

    guardarRecursos(recursos) {
        guardarEnStorage(RECURSOS_KEY, recursos);
    }

    obtenerRecursoPorId(id) {
        const recursos = this.obtenerRecursos();

        for (let i = 0; i < recursos.length; i++) {
            if (recursos[i].id === Number(id)) {
                return recursos[i];
            }
        }

        return null;
    }

    // Devuelve las categorías sin repetir, en el orden en que aparecen
    obtenerCategorias() {
        const recursos = this.obtenerRecursos();
        const categorias = [];

        for (let i = 0; i < recursos.length; i++) {
            if (!categorias.includes(recursos[i].categoria)) {
                categorias.push(recursos[i].categoria);
            }
        }

        return categorias;
    }

    obtenerRecursosPorCategoria(categoria) {
        const recursos = this.obtenerRecursos();
        const filtrados = [];

        for (let i = 0; i < recursos.length; i++) {
            if (recursos[i].categoria === categoria) {
                filtrados.push(recursos[i]);
            }
        }

        return filtrados;
    }

    agregarRecurso(titulo,categoria,descripcion,fuente,paginas,archivo) {
        const recursos = this.obtenerRecursos();

        const recurso = {
            id: Date.now(),
            titulo: titulo,
            categoria: categoria,
            descripcion: descripcion,
            fuente: fuente,
            paginas: Number(paginas),
            archivo: archivo
        };

        recursos.push(recurso);

        this.guardarRecursos(recursos);
    }

    eliminarRecurso(id) {
        const recursos = this.obtenerRecursos();
        const restantes = [];

        for (let i = 0; i < recursos.length; i++) {
            if (recursos[i].id !== Number(id)) {
                restantes.push(recursos[i]);
            }
        }

        this.guardarRecursos(restantes);
    }

    obtenerIdDesdeUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("idRecurso");
    }
}