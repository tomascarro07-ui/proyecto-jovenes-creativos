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

## Pendiente

- Revisar si "Museo Municipal — Casa del Virrey" y "Espacio Dr. B. Rebuffo" son el mismo museo (ambos aparecen como el primer museo de la ciudad, de 1951).
- Los talleres y las charlas viven solo en el navegador de cada persona (`localStorage`): no se comparten entre visitantes. Es el trabajo para cuando haya backend.
- Faltan tres PDFs enlazados en Recursos: `catalogo-museos-2026.pdf`, `cronograma-talleres-2026.pdf` y `programa-cursos.pdf`.
