class GestorRecorridos {

    async obtenerRecorridos() {
        return await pedirApi("/recorridos");
    }

    async obtenerNumeroRecorridos() {
        const recorridos = await this.obtenerRecorridos();
        return recorridos.length;
    }

    async obtenerRecorridoPorId(id) {
        try {
            return await pedirApi("/recorridos/" + encodeURIComponent(id));
        } catch (error) {
            if (error.status === 404 || error.status === 400) {
                return null;
            }
            throw error;
        }
    }

    async agregarRecorrido(titulo, tipo, duracionHoras, duracionMinutos, imagen, puntoSalida, cupos, descripcionCorta, fecha = "", hora = "", lat = null, lng = null, museo = null) {
        return await pedirApi("/recorridos", {
            method: "POST",
            body: { titulo, tipo, duracionHoras, duracionMinutos, imagen, puntoSalida, cupos, descripcionCorta, fecha, hora, lat, lng, museo }
        });
    }

    async marcarFinalizada(id) {
        return await pedirApi("/recorridos/" + encodeURIComponent(id) + "/finalizada", { method: "PATCH" });
    }

    async eliminarRecorrido(id) {
        return await pedirApi("/recorridos/" + encodeURIComponent(id), { method: "DELETE" });
    }

    obtenerIdDesdeUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("idRecorrido");
    }
}