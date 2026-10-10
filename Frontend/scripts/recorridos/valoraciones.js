const gestorValoraciones = {
    obtener: (id) => pedirApi("/valoraciones/recorrido/" + encodeURIComponent(id)),
    elegibilidad: (id) => pedirApi("/valoraciones/elegibilidad/" + encodeURIComponent(id)),
    enviar: (recorrido, estrellas, comentario) =>
        pedirApi("/valoraciones", { method: "POST", body: { recorrido, estrellas, comentario } })
};

function estrellasHtml(valor) {
    let h = "";
    for (let i = 1; i <= 5; i++) {
        if (valor >= i - 0.25) h += '<i class="fa-solid fa-star"></i>';
        else if (valor >= i - 0.75) h += '<i class="fa-solid fa-star-half-stroke"></i>';
        else h += '<i class="fa-regular fa-star"></i>';
    }
    return h;
}

function avatarValoracion(autor) {
    return autor.foto
        ? `<img class="val-avatar" src="${escaparHtml(autor.foto)}" alt="">`
        : `<span class="val-avatar">${escaparHtml(autor.nombre.charAt(0).toUpperCase())}</span>`;
}

function bloqueFormulario(elegib, esLogueado, esAdmin) {
    if (esAdmin) return "";
    if (!esLogueado) {
        return `<div class="val-aviso"><i class="fa-solid fa-lock"></i> ${t("val.login")}</div>`;
    }
    if (!elegib.puede) {
        return `<div class="val-aviso"><i class="fa-solid fa-circle-info"></i> ${escaparHtml(elegib.motivo)}</div>`;
    }
    const mia = elegib.mia;
    return `
    <form class="val-form" id="formValoracion">
        <h3>${mia ? t("val.tuValoracion") : t("val.comoEstuvo")}</h3>
        <div class="val-input" role="radiogroup" aria-label="${t("val.puntuacion")}">
            ${[1, 2, 3, 4, 5].map((n) =>
                `<button type="button" class="val-estrella" data-valor="${n}" aria-label="${t(n === 1 ? "val.estrella" : "val.estrellas", { n: n })}"><i class="fa-regular fa-star"></i></button>`
            ).join("")}
        </div>
        <textarea id="valComentario" rows="3" maxlength="300" placeholder="${t("val.placeholder")}">${escaparHtml(mia ? mia.comentario : "")}</textarea>
        <button type="submit" class="insc-btn insc-btn--primario">${mia ? t("val.actualizar") : t("val.publicar")}</button>
    </form>`;
}

function pintarValoraciones(seccion, idRecorrido, datos, elegib, usuario) {
    const maximo = Math.max(1, ...datos.distribucion.map((d) => d.cantidad));

    seccion.innerHTML = `
    <h2>${t("val.titulo")}</h2>
    <div class="val-card">
        <div class="val-resumen">
            <div class="val-promedio">
                <strong>${datos.total ? datos.promedio.toFixed(1) : "–"}</strong>
                <div class="val-estrellas">${estrellasHtml(datos.promedio)}</div>
                <span>${t(datos.total === 1 ? "val.una" : "val.varias", { n: datos.total })}</span>
            </div>
            <div class="val-barras">
                ${datos.distribucion.map((d) => `
                    <div class="val-barra">
                        <span>${d.estrellas} <i class="fa-solid fa-star"></i></span>
                        <div class="val-barra__fondo"><div style="width:${(d.cantidad / maximo) * 100}%"></div></div>
                        <span>${d.cantidad}</span>
                    </div>`).join("")}
            </div>
        </div>
        ${bloqueFormulario(elegib || {}, !!usuario, usuario && usuario.esAdministrador)}
    </div>
    <div class="val-lista">
        ${datos.valoraciones.length === 0 ? '<p class="val-vacio">${t("val.vacio")}</p>' : datos.valoraciones.map((v) => `
            <article class="val-item">
                ${avatarValoracion(v.autor)}
                <div>
                    <div class="val-item__top"><strong>${escaparHtml(v.autor.nombre)}</strong>
                        <span class="val-estrellas">${estrellasHtml(v.estrellas)}</span></div>
                    ${v.comentario ? `<p>${escaparHtml(v.comentario)}</p>` : ""}
                    <small>${new Date(v.creadaEn).toLocaleDateString(t("fecha.locale"), { day: "numeric", month: "long", year: "numeric" })}</small>
                </div>
            </article>`).join("")}
    </div>`;

    const form = document.getElementById("formValoracion");
    if (!form) return;

    const botones = form.querySelectorAll(".val-estrella");
    let seleccion = elegib.mia ? elegib.mia.estrellas : 0;

    function pintar(n) {
        botones.forEach(function (b, i) {
            b.firstElementChild.className = i < n ? "fa-solid fa-star" : "fa-regular fa-star";
            b.classList.toggle("activa", i < n);
        });
    }
    pintar(seleccion);

    botones.forEach(function (b) {
        b.addEventListener("mouseenter", function () { pintar(Number(b.dataset.valor)); });
        b.addEventListener("mouseleave", function () { pintar(seleccion); });
        b.addEventListener("click", function () { seleccion = Number(b.dataset.valor); pintar(seleccion); });
    });

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        if (!seleccion) return alert(t("val.elegi"));
        try {
            await gestorValoraciones.enviar(idRecorrido, seleccion, document.getElementById("valComentario").value);
            await cargarValoraciones(idRecorrido);
        } catch (error) {
            alert(error.message);
        }
    });
}

async function cargarValoraciones(idRecorrido) {
    let seccion = document.getElementById("valoraciones");
    if (!seccion) {
        seccion = document.createElement("section");
        seccion.id = "valoraciones";
        seccion.className = "val-seccion";
        const ref = document.getElementById("detalleContenido") || document.querySelector("main");
        ref.insertAdjacentElement("afterend", seccion);
    }

    try {
        const usuario = validarSesion();
        const [datos, elegib] = await Promise.all([
            gestorValoraciones.obtener(idRecorrido),
            usuario && !usuario.esAdministrador ? gestorValoraciones.elegibilidad(idRecorrido) : Promise.resolve(null)
        ]);
        pintarValoraciones(seccion, idRecorrido, datos, elegib, usuario);
    } catch (e) {
        seccion.innerHTML = "";
    }
}