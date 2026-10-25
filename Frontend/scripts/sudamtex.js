// Sudamtex: menú móvil, sección activa en el menú, aparición al hacer scroll y conteos.
(function () {
    "use strict";

    // ---- Conteos tomados de las listas reales (si agregás un resultado, el número se actualiza solo)
    function actualizarConteos() {
        const cuentas = {
            resultados: document.querySelectorAll("[data-resultado]").length,
            impacto: document.querySelectorAll("[data-impacto]").length
        };
        document.querySelectorAll("[data-cuenta]").forEach(function (el) {
            const n = cuentas[el.dataset.cuenta];
            if (typeof n === "number" && n > 0) el.textContent = String(n);
        });
    }

    // ---- Menú móvil
    function iniciarMenu() {
        const boton = document.querySelector(".sx-toggle");
        const nav = document.getElementById("sxNav");
        if (!boton || !nav) return;

        function cerrar() {
            nav.classList.remove("sx-nav--abierto");
            boton.setAttribute("aria-expanded", "false");
            boton.setAttribute("aria-label", "Abrir menú");
            boton.querySelector("i").className = "fa-solid fa-bars";
        }

        boton.addEventListener("click", function () {
            const abierto = nav.classList.toggle("sx-nav--abierto");
            boton.setAttribute("aria-expanded", abierto ? "true" : "false");
            boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
            boton.querySelector("i").className = abierto ? "fa-solid fa-xmark" : "fa-solid fa-bars";
        });

        nav.addEventListener("click", function (e) {
            if (e.target.closest("a")) cerrar();
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && nav.classList.contains("sx-nav--abierto")) { cerrar(); boton.focus(); }
        });
        window.matchMedia("(min-width: 861px)").addEventListener("change", cerrar);
    }

    // ---- Resalta en el menú la sección que se está viendo
    function iniciarSeccionActiva() {
        if (!("IntersectionObserver" in window)) return;
        const enlaces = Array.from(document.querySelectorAll('.sx-nav li a[href^="#"]'));
        const secciones = enlaces
            .map(function (a) { return document.querySelector(a.getAttribute("href")); })
            .filter(Boolean);

        const observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (!entrada.isIntersecting) return;
                enlaces.forEach(function (a) {
                    if (a.getAttribute("href") === "#" + entrada.target.id) a.setAttribute("aria-current", "true");
                    else a.removeAttribute("aria-current");
                });
            });
        }, { rootMargin: "-35% 0px -55% 0px" });

        secciones.forEach(function (s) { observador.observe(s); });
    }

    // ---- Aparición suave al hacer scroll
    function iniciarAparicion() {
        const elementos = document.querySelectorAll(".sx-reveal");
        const mostrarTodo = function () { elementos.forEach(function (el) { el.classList.add("sx-visto"); }); };

        const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (sinMovimiento || !("IntersectionObserver" in window)) { mostrarTodo(); return; }

        const observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("sx-visto");
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.12 });

        elementos.forEach(function (el) { observador.observe(el); });
        // Red de seguridad: si por algún motivo el observador no dispara, no dejamos contenido oculto
        setTimeout(mostrarTodo, 4000);
    }

    actualizarConteos();
    iniciarMenu();
    iniciarSeccionActiva();
    iniciarAparicion();
})();
