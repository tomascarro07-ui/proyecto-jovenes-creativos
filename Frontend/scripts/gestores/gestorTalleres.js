class GestorTalleres {

    async obtenerTalleres() {
        return await pedirApi("/talleres");
    }

    async obtenerNumeroTalleres() {
        const talleres = await this.obtenerTalleres();
        return talleres.length;
    }

    async obtenerTallerPorId(id) {
        try {
            return await pedirApi("/talleres/" + encodeURIComponent(id));
        } catch (error) {
            if (error.status === 404 || error.status === 400) {
                return null;
            }
            throw error;
        }
    }

    async agregarTaller(titulo, nivel, modalidad, cantClases, cupos, imagen, descripcionCorta) {
        return await pedirApi("/talleres", {
            method: "POST",
            body: { titulo, nivel, modalidad, cantClases, cupos, imagen, descripcionCorta }
        });
    }

    async marcarFinalizada(id) {
        return await pedirApi("/talleres/" + encodeURIComponent(id) + "/finalizada", { method: "PATCH" });
    }

    async eliminarTaller(id) {
        return await pedirApi("/talleres/" + encodeURIComponent(id), { method: "DELETE" });
    }

    obtenerIdDesdeUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("idTaller");
    }
}
