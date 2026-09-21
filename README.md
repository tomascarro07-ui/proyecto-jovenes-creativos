<<<<<<< Updated upstream
# proyecto-jovenes-creativos
=======
# Nodo Cultural

Sitio web que funciona como intermediario entre museos de Uruguay y las instituciones, docentes y personas interesadas en cultura. Proyecto del curso Jóvenes creaTIvos.

## Cómo abrirlo

Usá **Live Server** (extensión de VS Code) o cualquier servidor local. **No abras los HTML con doble clic**: los museos, cursos y recorridos se cargan con `fetch` desde archivos JSON y el navegador lo bloquea cuando la página se abre como archivo (`file://`).

## Estructura

```
index.html · nosotros.html · servicios.html · contacto.html
museos_colonia.html · recorridos.html · arte_talleres.html
charla-detalle.html · login.html · registro.html · admin.html
css/styles.css
data/         contenido en JSON (museos, cursos, recorridos)
scripts/      JavaScript de cada página
```

## Cómo se carga el contenido

| Contenido | Dónde vive | Cómo se muestra |
|---|---|---|
| Museos | `data/museos.json` | `fetch` + `scripts/museos.js` |
| Cursos y talleres | `data/cursos.json` | `fetch` + `scripts/cursos.js` |
| Recorridos | `data/recorridos.json` | `fetch` + `scripts/recorridos.js` |
| Charlas | `localStorage` (`charlas-data.js`) | `charlas-render.js` y `admin.js` |

`scripts/datos.js` tiene las funciones compartidas (`cargarJSON`, `mostrarErrorCarga`, `escaparHTML`).

Para agregar un museo, curso o recorrido alcanza con sumar un objeto al JSON correspondiente: no hace falta tocar el HTML.

## Pendiente (cuando lleguemos a el backend)

- Charlas, panel de administración, confirmaciones de asistencia y mensajes de contacto: hoy se guardan solo en el navegador de cada persona (`localStorage`), por lo que no se comparten entre visitantes.
- Registro e inicio de sesión de usuarios (`registro.js` no existe todavía) y protección real del panel admin (`protegerPagina()` no se usa en `admin.html`). Las credenciales del admin están escritas en `login.js`: es solo para desarrollo.
- Imágenes del carrusel y de las charlas: hoy son links externos; conviene guardarlas en una carpeta `img/`.
- PDFs de la sección de recursos (marcados como "Próximamente").
- Página con todas las charlas y páginas de detalle de noticias.
>>>>>>> Stashed changes
