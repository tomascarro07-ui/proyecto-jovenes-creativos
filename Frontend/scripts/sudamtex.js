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

// ===== La historia: aparición, capítulo activo, año y progreso =====
(function () {
  const caps = Array.from(document.querySelectorAll(".sx-cap"));
  const lista = document.querySelector(".sx-hist__lista");
  const anio = document.getElementById("histAnio");
  const progreso = document.getElementById("histProgreso");
  if (!caps.length || !lista || !anio) return;

  // Aparece cada capítulo al entrar en pantalla
  const ioVer = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("sx-cap--visto"); ioVer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  caps.forEach(function (c) { ioVer.observe(c); });

  // Capítulo activo = el que cruza la franja central de la pantalla
  const ioActivo = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      caps.forEach(function (c) { c.classList.toggle("sx-cap--activo", c === e.target); });
      anio.textContent = e.target.dataset.anio;
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  caps.forEach(function (c) { ioActivo.observe(c); });

  // Progreso del hilo y de la regla
  function actualizar() {
    const r = lista.getBoundingClientRect();
    const mitad = window.innerHeight * 0.5;
    const p = Math.min(1, Math.max(0, (mitad - r.top) / r.height));
    lista.style.setProperty("--prog", p);
    if (progreso) progreso.style.width = (p * 100) + "%";
  }
  window.addEventListener("scroll", actualizar, { passive: true });
  window.addEventListener("resize", actualizar);
  actualizar();
})();