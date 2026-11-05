class GestorMuseos {

    async obtenerMuseos() {
        return await pedirApi("/museos");
    }

    async obtenerMuseoPorId(id) {
        try {
            return await pedirApi("/museos/" + encodeURIComponent(id));
        } catch (error) {
            if (error.status === 404 || error.status === 400) return null;
            throw error;
        }
    }

    async agregarMuseo(nombre, tipo, descripcionCorta, direccion, horario, imagen, lat, lng, museo = null) {
        return await pedirApi("/museos", {
            method: "POST",
            body: { nombre, tipo, descripcionCorta, direccion, horario, imagen, lat, lng, museo }
        });
    }

    async eliminarMuseo(id) {
        return await pedirApi("/museos/" + encodeURIComponent(id), { method: "DELETE" });
    }

    obtenerIdDesdeUrl() {
        return new URLSearchParams(window.location.search).get("idMuseo");
    }
}

const gestorMuseos = new GestorMuseos();