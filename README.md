# Nodo Cultural

Sitio web que funciona como intermediario entre museos de Uruguay y las instituciones, docentes y personas interesadas en cultura. Proyecto del curso Jóvenes creaTIvos.

## Cómo abrirlo

Usá **Live Server** (extensión de VS Code) o cualquier servidor local. **No abras los HTML con doble clic**: los museos se cargan con `fetch` desde un archivo JSON y el navegador lo bloquea cuando la página se abre como archivo (`file://`).

## Estructura de `scripts/`

```
scripts/
├── admin/        admin.js
├── auth/         autenticacion.js, login.js, registro.js
├── charlas/      actividades.js, charla-detalle.js, charlas-data.js, charlas-render.js
├── talleres/     talleres.js, talleres-data.js, talleres-detalle.js
├── usuarios/     usuario.js
├── contacto.js, index.js, storage.js
```

## Cómo se carga el contenido

| Contenido | Dónde vive | Cómo se muestra |
|---|---|---|
| Museos | `data/museos.json` | `fetch` + `scripts/museos.js` |
| Cursos y talleres | `localStorage` (`talleres-data.js`) | `scripts/talleres/talleres.js` y el admin |
| Charlas | `localStorage` (`charlas-data.js`) | `charlas-render.js`, `actividades.js` y el admin |

`scripts/datos.js` tiene las funciones para cargar JSON (`cargarJSON`, `mostrarErrorCarga`, `escaparHTML`). Para agregar un museo alcanza con sumar un objeto a `data/museos.json`.

## Arreglado en esta vuelta

Al reorganizar `scripts/` en subcarpetas quedaron varias rutas rotas y un par de bugs más:
- Rutas de `<script>` que apuntaban a archivos que ya se habían movido: `login.html`, `recorridos.html`, `actividades.html`, `contacto.html` y `charla-detalle.html`.
- `login.html` no cargaba `autenticacion.js` (de donde sale `login()`), y `charla-detalle.html` no cargaba `storage.js`.
- `admin.html` no llamaba a `protegerPagina()` y no cargaba `talleres-data.js`, que `admin.js` necesita.
- `registro.js` no existía; ahora está en `scripts/auth/registro.js`.
- Dos scripts distintos dibujaban los talleres (`talleres.js` y `talleres-render.js`); nos quedamos con `talleres.js`, que sí muestra el tipo y la descripción.
- `contacto.js` solo completaba el formulario para recorridos; ahora también lo hace para talleres (`contacto.html?id=...`).
- `charla-detalle.js` usaba `formatearFechaCorta` y `formatearFechaLarga`, que no estaban definidas en ningún lado; se agregaron en `charlas-data.js`.
- Faltaban variables de color en el CSS (`--color-primario`, `--color-texto`, `--fuente-texto`, etc.), lo que dejaba invisibles varios textos y botones.
- Las fechas de las charlas de ejemplo estaban vencidas (agosto); ahora son de octubre.
- El menú de sesión (`index.js`) generaba dos elementos con el mismo `id="sesionNav"`.

## Arreglado esta vuelta más

- `nosotros.html` estaba vacía; se completó con el mismo diseño que ya usan `arte_talleres.html` y `servicios.html` (`nc-hero`, `pasos-grid`, `arte-cta`).
- De paso: `scripts/index.js` solo debe cargarse en `index.html` y `contacto.html` (son las únicas páginas cuyo header viene vacío y depende de ese script para mostrar "Iniciar sesión"/"Registrarme"/"¡Hola!"). El resto de las páginas (`arte_talleres.html`, `museos_colonia.html`, `recorridos.html`, y ahora `nosotros.html`) ya traen esos botones escritos en el HTML y no deben cargar `index.js`, o el botón "Registrarme" queda duplicado.

## Contenido de nosotros.html

Se armó con: quiénes somos, cómo nació el proyecto, "Qué buscamos" y una sección "Creadores" con una tarjeta por cada integrante.

- `img/tomas.jpg` y `img/veronica.jpg` son las fotos que ya tenían en sus propios portfolios (`sobre_mi.jpg` y `veronica-hero.jpg`).
- Falta `img/equipo.jpg` (una foto de los dos juntos, si tienen).
- Los botones "Ver portfolio" hoy apuntan a una vista previa temporal (un link de Claude, privado hasta que se comparta). Lo correcto para la entrega final es publicar cada portfolio con GitHub Pages, como ya hicieron con el proyecto principal, y reemplazar esos dos links por los de `usuario.github.io/portfolio`.

## Menú hamburguesa y contacto.html (esta vuelta)

- `contacto.html` estaba con el diseño viejo entero (`.header`, `.nav`, `.admin-form`...), clases que ya no existen en el CSS: la página no tenía ningún estilo. Se migró al mismo header/footer/menú que el resto, y el formulario ahora usa el estilo `auth-card` de login/registro (que ya soporta el textarea del mensaje).
- El botón de hamburguesa estaba "mudo" (sin el script que lo activa) en `login.html`, `museos_colonia.html`, `registro.html` y `actividades.html`. Se agregó en las cuatro.
- Dos bugs de CSS que afectaban a varias páginas a la vez:
  - El logo del pie de página se veía gigante en `registro.html` (y ahora también hubiera pasado en `contacto.html`, recién armada): al `<img>` le faltaba el atributo `width="190"` que sí tienen las demás páginas, así que el navegador lo mostraba a su tamaño real (2167×726 px). Se agregó en ambas.
  - El texto de los paneles oscuros (el costado de login/registro/contacto, y los bloques "Sumate") era invisible: usaban `var(--color-burbuja)`, que vale lo mismo que el fondo. Se cambió a blanco donde correspondía. De paso, `--color-burbuja` estaba puesta como `max-width` del pie de página por error (una variable de color usada como si fuera un ancho); se corrigió a `var(--nc-ancho)`.

Todavía quedan con el diseño viejo y sin ningún estilo: `recorridos.html`, `charla-detalle.html` y `servicios.html` (esta última directamente vacía). Van a necesitar el mismo tipo de migración que se le hizo a `contacto.html`.

## Pendiente

- Revisar si "Museo Municipal — Casa del Virrey" y "Espacio Dr. B. Rebuffo" son el mismo museo (ambos aparecen como el primer museo de la ciudad, de 1951).
- Los talleres y las charlas viven solo en el navegador de cada persona (`localStorage`): no se comparten entre visitantes. Es el trabajo para cuando haya backend.
- Faltan tres PDFs enlazados en Recursos: `catalogo-museos-2026.pdf`, `cronograma-talleres-2026.pdf` y `programa-cursos.pdf`.
