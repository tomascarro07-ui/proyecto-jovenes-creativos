const TIPOS = {
    charla: { nombre: "Charla", url: "charla-detalle.html?idCharla=" },
    taller: { nombre: "Taller", url: "taller-detalle.html?idTaller=" },
    recorrido: { nombre: "Recorrido", url: "recorrido-detalle.html?idRecorrido=" }
};

const estado = {
    mes: null,
    eventos: [],
    filtros: new Set(["charla", "taller", "recorrido"]),
    seleccion: null
};

const grid = document.getElementById("calGrid");
const panel = document.getElementById("calPanel");
const titulo = document.getElementById("calTitulo");

const pad = (n) => String(n).padStart(2, "0");
const clave = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

function eventosDelDia(k) {
    return estado.eventos
        .filter(function (e) { return e.fecha === k && estado.filtros.has(e.tipo); })
        .sort(function (a, b) { return a.hora.localeCompare(b.hora); });
}

async function cargarEventos() {
    const [charlas, talleres, recorridos] = await Promise.all([
        pedirApi("/charlas"), pedirApi("/talleres"), pedirApi("/recorridos")
    ]);

    let mias = new Set();
    const usuario = validarSesion();
    if (usuario && !usuario.esAdministrador) {
        try {
            const lista = await pedirApi("/inscripciones/mias");
            mias = new Set(lista.map(function (i) { return i.tipo + ":" + i.actividad; }));
        } catch (e) { /* sin sesión válida: se muestra igual */ }
    }

    const armar = function (lista, tipo) {
        return lista
            .filter(function (x) { return /^\d{4}-\d{2}-\d{2}$/.test(x.fecha || ""); })
            .map(function (x) {
                return {
                    id: x.id, tipo: tipo, titulo: x.titulo, fecha: x.fecha, hora: x.hora || "",
                    finalizada: !!x.finalizada, inscripto: mias.has(tipo + ":" + x.id)
                };
            });
    };

    estado.eventos = [].concat(armar(charlas, "charla"), armar(talleres, "taller"), armar(recorridos, "recorrido"));
}

function chipHtml(e) {
    return `<span class="cal-chip cal-chip--${e.tipo}${e.finalizada ? " cal-chip--fin" : ""}${e.inscripto ? " cal-chip--mio" : ""}">` +
        `${e.hora ? "<b>" + escaparHtml(e.hora) + "</b> " : ""}${escaparHtml(e.titulo)}</span>`;
}

function pintarMes() {
    const y = estado.mes.getFullYear();
    const m = estado.mes.getMonth();
    titulo.textContent = cap(estado.mes.toLocaleDateString(t("fecha.locale"), { month: "long", year: "numeric" }));

    const desfase = (estado.mes.getDay() + 6) % 7; // la semana arranca el lunes
    const diasDelMes = new Date(y, m + 1, 0).getDate();
    const semanas = Math.ceil((desfase + diasDelMes) / 7);
    const hoy = clave(new Date());

    let html = "";
    for (let i = 0; i < semanas * 7; i++) {
        const d = new Date(y, m, 1 - desfase + i);
        const k = clave(d);
        const evs = eventosDelDia(k);
        const clases = "cal-celda" +
            (d.getMonth() !== m ? " cal-celda--fuera" : "") +
            (k === hoy ? " cal-celda--hoy" : "") +
            (k === estado.seleccion ? " cal-celda--sel" : "");

        html += `
        <div class="${clases}" data-fecha="${k}" role="button" tabindex="0"
             aria-label="${t("cal.celdaAria", { dia: d.getDate(), mes: d.toLocaleDateString(t("fecha.locale"), { month: "long" }), n: evs.length })}">
            <span class="cal-num">${d.getDate()}</span>
            <div class="cal-chips">
                ${evs.slice(0, 3).map(chipHtml).join("")}
                ${evs.length > 3 ? `<span class="cal-mas">${t("cal.mas", { n: evs.length - 3 })}</span>` : ""}
            </div>
            <span class="cal-puntos">${evs.slice(0, 4).map(function (e) { return `<i class="cal-punto cal-punto--${e.tipo}"></i>`; }).join("")}</span>
        </div>`;
    }
    grid.innerHTML = html;
    pintarPanel();
}

function tarjetaHtml(e) {
    const tipo = TIPOS[e.tipo];
    return `
    <a class="cal-evento cal-evento--${e.tipo}" href="${tipo.url}${e.id}">
        <span class="cal-evento__hora">${e.hora ? escaparHtml(e.hora) : t("cal.todoDia")}</span>
        <div class="cal-evento__cuerpo">
            <span class="cal-evento__tipo">${t("tipo." + e.tipo)}</span>
            <strong>${escaparHtml(e.titulo)}</strong>
            ${e.inscripto ? '<em class="cal-evento__ok"><i class="fa-solid fa-circle-check"></i> ${t("cal.inscripto")}</em>' : ""}
            ${e.finalizada ? '<em class="cal-evento__fin">' + t("cupo.fin") + '</em>' : ""}
        </div>
        <i class="fa-solid fa-chevron-right"></i>
    </a>`;
}

function pintarPanel() {
    const partes = estado.seleccion.split("-").map(Number);
    const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
    const evs = eventosDelDia(estado.seleccion);

    let cuerpo;
    if (evs.length) {
        cuerpo = evs.map(tarjetaHtml).join("");
    } else if (estado.eventos.length === 0) {
        cuerpo = '<div class="cal-panel__vacio"><i class="fa-regular fa-calendar"></i><p>' + t("cal.sinFecha") + '</p></div>';
    } else {
        cuerpo = '<div class="cal-panel__vacio"><i class="fa-regular fa-calendar"></i><p>' + t("cal.sinDia") + '</p></div>';
    }

    panel.innerHTML = `
        <h2>${cap(fecha.toLocaleDateString(t("fecha.locale"), { weekday: "long" }))}</h2>
        <p class="cal-panel__fecha">${fecha.toLocaleDateString(t("fecha.locale"), { day: "numeric", month: "long", year: "numeric" })}</p>
        ${cuerpo}`;
}

function seleccionarDia(k) {
    estado.seleccion = k;
    const p = k.split("-").map(Number);
    if (p[1] - 1 !== estado.mes.getMonth() || p[0] !== estado.mes.getFullYear()) {
        estado.mes = new Date(p[0], p[1] - 1, 1); // click en un día de otro mes: se cambia de mes
    }
    pintarMes();
}

function cambiarMes(delta) {
    estado.mes = new Date(estado.mes.getFullYear(), estado.mes.getMonth() + delta, 1);
    pintarMes();
}

document.addEventListener("DOMContentLoaded", async function () {
    const hoy = new Date();
    estado.mes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    estado.seleccion = clave(hoy);

    try {
        await cargarEventos();
    } catch (e) {
        mostrarErrorServidor(panel);
        return;
    }
    pintarMes();

    document.getElementById("calPrev").addEventListener("click", function () { cambiarMes(-1); });
    document.getElementById("calNext").addEventListener("click", function () { cambiarMes(1); });
    document.getElementById("calHoy").addEventListener("click", function () { seleccionarDia(clave(new Date())); });

    grid.addEventListener("click", function (e) {
        const celda = e.target.closest(".cal-celda");
        if (celda) seleccionarDia(celda.dataset.fecha);
    });
    grid.addEventListener("keydown", function (e) {
        const celda = e.target.closest(".cal-celda");
        if (celda && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            seleccionarDia(celda.dataset.fecha);
        }
    });

    document.getElementById("calFiltros").addEventListener("change", function (e) {
        if (e.target.checked) estado.filtros.add(e.target.value);
        else estado.filtros.delete(e.target.value);
        pintarMes();
    });
});

// Al cambiar de idioma se vuelve a dibujar el mes y el panel del día
document.addEventListener("idiomacambiado", function () {
    if (estado.mes && grid.innerHTML) pintarMes();
});
