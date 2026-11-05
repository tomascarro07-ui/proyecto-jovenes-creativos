import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { admin, api, pedirApi } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import { formatearDuracion } from '../utils/fechas'
import { tieneImagen } from '../utils/leaflet'
import DialogoInscriptos from '../components/admin/DialogoInscriptos'
import DialogoLugar from '../components/admin/DialogoLugar'
import DialogoUbicacion from '../components/admin/DialogoUbicacion'
import FormCharla from '../components/admin/FormCharla'
import FormMuseo from '../components/admin/FormMuseo'
import FormRecorrido from '../components/admin/FormRecorrido'
import FormRecurso from '../components/admin/FormRecurso'
import FormTaller from '../components/admin/FormTaller'
import ItemAdmin from '../components/admin/ItemAdmin'

// Nombre de la ruta del servidor de cada tipo de actividad (para ubicar en el mapa)
const RUTAS_UBICACION = { charla: 'charlas', taller: 'talleres', recorrido: 'recorridos', museo: 'museos' }

// Cantidad para el "Estado general": mientras carga se muestra un guion
const conteo = (lista) => (lista ? lista.length : '-')

// Ejecuta una acción contra la API y, si sale bien, vuelve a pedir la lista.
// Si falla, avisa con un mensaje en vez de romper el panel.
async function accionAdmin(accion, recargar) {
  try {
    await accion()
    await recargar()
  } catch (error) {
    alert('No se pudo completar la acción: ' + error.message)
  }
}

// Lista de una sección: muestra "Cargando", el error o el mensaje de "todavía no hay"
function ListaAdmin({ cargando, error, datos, vacio, children }) {
  if (cargando) return <p className="admin-vacio">Cargando…</p>
  if (error) return <p className="admin-vacio">No se pudo conectar con el servidor. Revisá que el backend esté encendido.</p>
  if (!datos || datos.length === 0) return <p className="admin-vacio">{vacio}</p>
  return children
}

function PanelAdmin() {
  const charlasCarga = useCarga(() => api.charlas(), [])
  const talleresCarga = useCarga(() => api.talleres(), [])
  const recorridosCarga = useCarga(() => api.recorridos(), [])
  const recursosCarga = useCarga(() => api.recursos(), [])
  const museosCarga = useCarga(() => api.museos(), [])
  const { datos: charlas } = charlasCarga
  const { datos: talleres } = talleresCarga
  const { datos: recorridos } = recorridosCarga
  const { datos: recursos } = recursosCarga
  const museos = museosCarga.datos || []

  // Ventana abierta: null, o { tipo: 'inscriptos' | 'lugar' | 'ubicacion', ... }
  const [dialogo, setDialogo] = useState(null)

  async function verInscriptos(tipo, id) {
    try {
      const inscriptos = await api.inscriptosDeActividad(tipo, id)
      setDialogo({ tipo: 'inscriptos', inscriptos })
    } catch (error) {
      alert('No se pudieron cargar los inscriptos: ' + error.message)
    }
  }

  // Ubicar algo ya cargado: los museos solo tienen coordenadas; el resto puede ir a un museo o a otro lugar
  async function ubicar(tipo, id) {
    try {
      const item = await pedirApi('/' + RUTAS_UBICACION[tipo] + '/' + encodeURIComponent(id))
      setDialogo(tipo === 'museo' ? { tipo: 'ubicacion', seccion: tipo, id, item } : { tipo: 'lugar', seccion: tipo, id, item })
    } catch (error) {
      alert('No se pudo guardar la ubicación: ' + error.message)
    }
  }

  async function guardarUbicacion(seccion, id, datos) {
    setDialogo(null)
    try {
      await admin.ubicacion(RUTAS_UBICACION[seccion], id, datos)
      alert('Ubicación guardada. Ya aparece en el mapa cultural.')
    } catch (error) {
      alert('No se pudo guardar la ubicación: ' + error.message)
    }
  }

  return (
    <main id="contenido" className="admin-pagina">
      <section className="admin-cabecera" aria-labelledby="adminTitulo">
        <h1 id="adminTitulo">Panel de administración</h1>
        <p>
          Gestioná las charlas, talleres, recorridos, museos y recursos del sitio: agregalos, revisá su estado y eliminalos cuando corresponda. Los cambios se guardan en el servidor y se ven enseguida en el sitio.
        </p>
        <nav className="admin-tabs" aria-label="Secciones del panel">
          <a href="#resumen">
            <i className="fa-solid fa-chart-simple"></i>
            Resumen
          </a>
          <a href="#gestion-charlas">
            <i className="fa-solid fa-comments"></i>
            Charlas
          </a>
          <a href="#gestion-talleres">
            <i className="fa-solid fa-palette"></i>
            Talleres
          </a>
          <a href="#gestion-recorridos">
            <i className="fa-solid fa-route"></i>
            Recorridos
          </a>
          <a href="#gestion-museos">
            <i className="fa-solid fa-landmark"></i>
            Museos
          </a>
        </nav>
      </section>
      <section id="resumen" className="admin-panel" aria-labelledby="resumenTitulo">
        <div className="nc-seccion__cabecera">
          <h2 id="resumenTitulo">Estado general</h2>
        </div>
        <div className="admin-resumen-grid" id="resumenGrid">
          <div className="admin-stat">
            <div className="admin-stat__icono">
              <i className="fa-solid fa-comments"></i>
            </div>
            <div>
              <p className="admin-stat__numero" id="resumenCharlasProximas">{conteo(charlas)}</p>
              <span className="admin-stat__etiqueta">Charlas próximas</span>
            </div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat__icono">
              <i className="fa-solid fa-palette"></i>
            </div>
            <div>
              <span className="admin-stat__numero" id="resumenTalleresActivos">{conteo(talleres)}</span>
              <span className="admin-stat__etiqueta">Talleres activos</span>
            </div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat__icono">
              <i className="fa-solid fa-route"></i>
            </div>
            <div>
              <span className="admin-stat__numero" id="resumenRecorridosActivos">{conteo(recorridos)}</span>
              <span className="admin-stat__etiqueta">Recorridos activos</span>
            </div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat__icono">
              <i className="fa-solid fa-book"></i>
            </div>
            <div>
              <span className="admin-stat__numero" id="resumenRecursosActivos">{conteo(recursos)}</span>
              <span className="admin-stat__etiqueta">Recursos activos</span>
            </div>
          </div>
        </div>
      </section>
      <section id="gestion-charlas" aria-labelledby="charlasSeccionTitulo">
        <div className="admin-seccion-titulo">
          <h2 id="charlasSeccionTitulo">
            <i className="fa-solid fa-comments"></i>
            {' '}
            Charlas
          </h2>
        </div>
        <div className="admin-layout">
          <section className="admin-panel" aria-labelledby="nuevaCharlaTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="nuevaCharlaTitulo">Agregar nueva charla</h3>
            </div>
            <FormCharla museos={museos} alGuardar={charlasCarga.recargar} />
          </section>
          <section className="admin-panel admin-panel--lista" aria-labelledby="listaCharlasTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="listaCharlasTitulo">Charlas cargadas</h3>
            </div>
            <div className="admin-lista" id="listaCharlas">
              <ListaAdmin {...charlasCarga} vacio="Todavía no hay charlas cargadas.">
                {(charlas || []).map((c) => (
                  <ItemAdmin
                    key={c.id}
                    imagen={c.imagen}
                    titulo={c.titulo}
                    etiqueta={`${c.fecha} · ${c.hora} hs`}
                    texto={`${c.lugar} — ${c.cupos} cupos`}
                    enlace={`/charlas/${c.id}`}
                    finalizada={c.finalizada}
                    tituloFinalizar="Marcar como finalizada"
                    alEliminar={() => accionAdmin(() => admin.eliminar('charlas', c.id), charlasCarga.recargar)}
                    alFinalizar={() => accionAdmin(() => admin.finalizada('charlas', c.id), charlasCarga.recargar)}
                    destacada={c.destacada}
                    alDestacar={() => accionAdmin(() => admin.destacada('charlas', c.id), charlasCarga.recargar)}
                    alVerInscriptos={() => verInscriptos('charla', c.id)}
                    alUbicar={() => ubicar('charla', c.id)}
                  />
                ))}
              </ListaAdmin>
            </div>
          </section>
        </div>
      </section>
      <section id="gestion-talleres" aria-labelledby="talleresSeccionTitulo">
        <div className="admin-seccion-titulo">
          <h2 id="talleresSeccionTitulo">
            <i className="fa-solid fa-palette"></i>
            {' '}
            Talleres
          </h2>
        </div>
        <div className="admin-layout">
          <section className="admin-panel" aria-labelledby="nuevoTallerTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="nuevoTallerTitulo">Agregar nuevo taller</h3>
            </div>
            <FormTaller museos={museos} alGuardar={talleresCarga.recargar} />
          </section>
          <section className="admin-panel admin-panel--lista" aria-labelledby="listaTalleresTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="listaTalleresTitulo">Talleres cargados</h3>
            </div>
            <div className="admin-lista" id="listaTalleres">
              <ListaAdmin {...talleresCarga} vacio="Todavía no hay talleres cargados.">
                {(talleres || []).map((t) => (
                  <ItemAdmin
                    key={t.id}
                    imagen={t.imagen}
                    titulo={t.titulo}
                    texto={`${t.modalidad} — ${t.cupos} cupos`}
                    enlace={`/cursos/${t.id}`}
                    finalizada={t.finalizada}
                    tituloFinalizar="Marcar como finalizado"
                    alEliminar={() => accionAdmin(() => admin.eliminar('talleres', t.id), talleresCarga.recargar)}
                    alFinalizar={() => accionAdmin(() => admin.finalizada('talleres', t.id), talleresCarga.recargar)}
                    destacada={t.destacada}
                    alDestacar={() => accionAdmin(() => admin.destacada('talleres', t.id), talleresCarga.recargar)}
                    alVerInscriptos={() => verInscriptos('taller', t.id)}
                    alUbicar={() => ubicar('taller', t.id)}
                  />
                ))}
              </ListaAdmin>
            </div>
          </section>
        </div>
      </section>
      <section id="gestion-recorridos" aria-labelledby="recorridosSeccionTitulo">
        <div className="admin-seccion-titulo">
          <h2 id="recorridosSeccionTitulo">
            <i className="fa-solid fa-route"></i>
            {' '}
            Recorridos
          </h2>
        </div>
        <div className="admin-layout">
          <section className="admin-panel" aria-labelledby="nuevoRecorridoTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="nuevoRecorridoTitulo">Agregar nuevo recorrido</h3>
            </div>
            <FormRecorrido museos={museos} alGuardar={recorridosCarga.recargar} />
          </section>
          <section className="admin-panel admin-panel--lista" aria-labelledby="listaRecorridosTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="listaRecorridosTitulo">Recorridos cargados</h3>
            </div>
            <div className="admin-lista" id="listaRecorridos">
              <ListaAdmin {...recorridosCarga} vacio="Todavía no hay recorridos cargados.">
                {(recorridos || []).map((r) => (
                  <ItemAdmin
                    key={r.id}
                    imagen={r.imagen}
                    titulo={r.titulo}
                    texto={`${r.tipo} — ${formatearDuracion(r)}`}
                    enlace={`/recorridos/${r.id}`}
                    finalizada={r.finalizada}
                    tituloFinalizar="Marcar como finalizado"
                    alEliminar={() => accionAdmin(() => admin.eliminar('recorridos', r.id), recorridosCarga.recargar)}
                    alFinalizar={() => accionAdmin(() => admin.finalizada('recorridos', r.id), recorridosCarga.recargar)}
                    destacada={r.destacada}
                    alDestacar={() => accionAdmin(() => admin.destacada('recorridos', r.id), recorridosCarga.recargar)}
                    alVerInscriptos={() => verInscriptos('recorrido', r.id)}
                    alUbicar={() => ubicar('recorrido', r.id)}
                  />
                ))}
              </ListaAdmin>
            </div>
          </section>
        </div>
      </section>
      <section id="gestion-recursos" aria-labelledby="recursosSeccionTitulo">
        <div className="admin-seccion-titulo">
          <h2 id="recursosSeccionTitulo">
            <i className="fa-solid fa-book"></i>
            {' '}
            Recursos
          </h2>
        </div>
        <div className="admin-layout">
          <section className="admin-panel" aria-labelledby="nuevoRecursoTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="nuevoRecursoTitulo">Agregar nuevo recurso</h3>
            </div>
            <FormRecurso alGuardar={recursosCarga.recargar} />
          </section>
          <section className="admin-panel admin-panel--lista" aria-labelledby="listaRecursosTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="listaRecursosTitulo">Recursos cargados</h3>
            </div>
            <ul className="recurso-lista" id="recursosGrid">
              <ListaAdmin {...recursosCarga} vacio="Todavía no hay recursos cargados.">
                {(recursos || []).map((r) => (
                  <li key={r.id}>
                    <i className="fa-solid fa-file-pdf recurso-pdf" aria-hidden="true"></i>
                    <div>
                      <strong>{r.titulo}</strong>
                      <span className="recurso-desc">{r.descripcion}</span>
                      <span className="recurso-desc">{r.fuente} · PDF · {r.paginas} {r.paginas === 1 ? 'página' : 'páginas'}</span>
                    </div>
                    <a
                      href="#eliminar"
                      className="recurso-eliminar"
                      aria-label={`Eliminar ${r.titulo}`}
                      onClick={(e) => {
                        e.preventDefault()
                        accionAdmin(() => admin.eliminar('recursos', r.id), recursosCarga.recargar)
                      }}
                    >
                      Eliminar
                    </a>
                    <a href={r.archivo} download aria-label={`Descargar ${r.titulo}, PDF`}>
                      Descargar <i className="fa-solid fa-download"></i>
                    </a>
                  </li>
                ))}
              </ListaAdmin>
            </ul>
          </section>
        </div>
      </section>
      <section id="gestion-museos" aria-labelledby="museosSeccionTitulo">
        <div className="admin-seccion-titulo">
          <h2 id="museosSeccionTitulo">
            <i className="fa-solid fa-landmark"></i>
            {' '}
            Museos
          </h2>
        </div>
        <div className="admin-layout">
          <section className="admin-panel" aria-labelledby="nuevoMuseoTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="nuevoMuseoTitulo">Agregar nuevo museo</h3>
            </div>
            <FormMuseo alGuardar={museosCarga.recargar} />
          </section>
          <section className="admin-panel admin-panel--lista" aria-labelledby="listaMuseosTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="listaMuseosTitulo">Museos cargados</h3>
            </div>
            <div className="admin-lista" id="listaMuseos">
              <ListaAdmin {...museosCarga} vacio="Todavía no hay museos cargados.">
                {museos.map((m) => (
                  <ItemAdmin
                    key={m.id}
                    imagen={tieneImagen(m) ? m.imagen : ''}
                    titulo={m.nombre}
                    etiqueta={m.tipo}
                    texto={m.direccion || 'Sin dirección'}
                    enlace={`/museos/${m.id}`}
                    tituloUbicar="Cambiar ubicación"
                    alEliminar={() => accionAdmin(() => admin.eliminar('museos', m.id), museosCarga.recargar)}
                    alUbicar={() => ubicar('museo', m.id)}
                  />
                ))}
              </ListaAdmin>
            </div>
          </section>
        </div>
      </section>
      {dialogo && dialogo.tipo === 'inscriptos' && (
        <DialogoInscriptos inscriptos={dialogo.inscriptos} alCerrar={() => setDialogo(null)} />
      )}
      {dialogo && dialogo.tipo === 'lugar' && (
        <DialogoLugar
          museos={museos}
          actual={dialogo.item}
          alCancelar={() => setDialogo(null)}
          alElegir={(r) => {
            if (r.otro) setDialogo({ ...dialogo, tipo: 'ubicacion', otro: true })
            else guardarUbicacion(dialogo.seccion, dialogo.id, r)
          }}
        />
      )}
      {dialogo && dialogo.tipo === 'ubicacion' && (
        <DialogoUbicacion
          inicial={dialogo.item.lat != null ? { lat: dialogo.item.lat, lng: dialogo.item.lng } : null}
          alCancelar={() => setDialogo(null)}
          alConfirmar={(r) => guardarUbicacion(dialogo.seccion, dialogo.id, dialogo.otro ? { museo: null, lat: r.lat, lng: r.lng } : r)}
        />
      )}
    </main>
  )
}

// El panel solo es para administradoras: se confirma con el servidor quién es la persona.
function Admin() {
  const { usuario } = useSesion()
  const { datos, cargando, error } = useCarga(() => (usuario ? api.yo() : Promise.resolve(null)), [!!usuario])

  if (!usuario || error) return <Navigate to="/" replace />
  if (cargando) return null
  if (!datos || !datos.usuario.esAdministrador) return <Navigate to="/" replace />
  return <PanelAdmin />
}

export default Admin
