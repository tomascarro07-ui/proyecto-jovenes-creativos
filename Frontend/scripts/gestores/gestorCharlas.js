class GestorCharlas {

    async obtenerCharlas() {
        return await pedirApi("/charlas");
    }

    async obtenerNumeroCharlas() {
        const charlas = await this.obtenerCharlas();
        return charlas.length;
    }

    async obtenerCharlaPorId(id) {
        try {
            return await pedirApi("/charlas/" + encodeURIComponent(id));
        } catch (error) {
            if (error.status === 404 || error.status === 400) {
                return null;
            }
            throw error;
        }
    }

    async agregarCharla(titulo, fecha, hora, lugar, tipo, imagen, expositor, descripcionCorta, descripcionCompleta, cupos, lat = null, lng = null, museo = null) {
        return await pedirApi("/charlas", {
            method: "POST",
            body: { titulo, fecha, hora, lugar, tipo, imagen, expositor, descripcionCorta, descripcionCompleta, cupos, lat, lng, museo }
        });
    }

    async marcarFinalizada(id) {
        return await pedirApi("/charlas/" + encodeURIComponent(id) + "/finalizada", { method: "PATCH" });
    }

    async eliminarCharla(id) {
        return await pedirApi("/charlas/" + encodeURIComponent(id), { method: "DELETE" });
    }

    obtenerIdDesdeUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("idCharla");
    }
}