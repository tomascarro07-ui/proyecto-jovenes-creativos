class GestorRecursos {

    async obtenerRecursos() {
        return await pedirApi("/recursos");
    }

    async obtenerNumeroRecursos() {
        const recursos = await this.obtenerRecursos();
        return recursos.length;
    }

    async obtenerRecursoPorId(id) {
        try {
            return await pedirApi("/recursos/" + encodeURIComponent(id));
        } catch (error) {
            if (error.status === 404 || error.status === 400) {
                return null;
            }
            throw error;
        }
    }

    // Estas dos NO piden nada al servidor: trabajan sobre la lista de recursos que ya se descargó.
    // Devuelve las categorías sin repetir, en el orden en que aparecen
    obtenerCategorias(recursos) {
        const categorias = [];

        for (let i = 0; i < recursos.length; i++) {
            if (!categorias.includes(recursos[i].categoria)) {
                categorias.push(recursos[i].categoria);
            }
        }

        return categorias;
    }

    obtenerRecursosPorCategoria(categoria, recursos) {
        const filtrados = [];

        for (let i = 0; i < recursos.length; i++) {
            if (recursos[i].categoria === categoria) {
                filtrados.push(recursos[i]);
            }
        }

        return filtrados;
    }

    async agregarRecurso(titulo, categoria, descripcion, fuente, paginas, archivo) {
        return await pedirApi("/recursos", {
            method: "POST",
            body: { titulo, categoria, descripcion, fuente, paginas: Number(paginas), archivo }
        });
    }

    async eliminarRecurso(id) {
        return await pedirApi("/recursos/" + encodeURIComponent(id), { method: "DELETE" });
    }

    obtenerIdDesdeUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("idRecurso");
    }
}
