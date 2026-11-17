import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { admin, api, pedirApi } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import { formatearDuracion } from '../utils/fechas'
import { tieneImagen } from '../utils/leaflet'
import DialogoConfirmar from '../components/admin/DialogoConfirmar'
import DialogoInscriptos from '../components/admin/DialogoInscriptos'
import DialogoLugar from '../components/admin/DialogoLugar'
import DialogoUbicacion from '../components/admin/DialogoUbicacion'
import FormCharla from '../components/admin/FormCharla'
import FormMuseo from '../components/admin/FormMuseo'
import FormRecorrido from '../components/admin/FormRecorrido'
import FormRecurso from '../components/admin/FormRecurso'
import FormTaller from '../components/admin/FormTaller'
import ItemAdmin from '../components/admin/ItemAdmin'

const RUTAS_UBICACION = { charla: 'charlas', taller: 'talleres', recorrido: 'recorridos', museo: 'museos' }

function Estadistica({ icono, numero, etiqueta }) {
  return (
    <div className="admin-stat">
      <div className="admin-stat__icono">
        <i className={`fa-solid ${icono}`}></i>
      </div>
      <div>
        <span className="admin-stat__numero">{numero}</span>
        <span className="admin-stat__etiqueta">{etiqueta}</span>
      </div>
    </div>
  )
}

function useEdicion(recargar, idSeccion) {
  const [editando, setEditando] = useState(null)
  const [version, setVersion] = useState(0)
  const reiniciar = () => {
    setEditando(null)
    setVersion((versionAnterior) => versionAnterior + 1)
  }
  return {
    editando,
    clave: `${editando ? editando.id : 'nuevo'}-${version}`,
    editar: (item) => {
      setEditando(item)
      const seccion = document.getElementById(idSeccion)
      if (seccion) seccion.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    cancelar: reiniciar,
    alGuardar: async () => {
      reiniciar()
      await recargar()
    },
  }
}

async function accionAdmin(accion, recargar) {
  try {
    await accion()
    await recargar()
  } catch (error) {
    alert('No se pudo completar la acción: ' + error.message)
  }
}

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

  const resumenCarga = useCarga(() => admin.resumen(), [])
  const resumen = resumenCarga.datos
  const conResumen = (carga) => async () => {
    await carga.recargar()
    resumenCarga.recargar()
  }
  const recargarCharlas = conResumen(charlasCarga)
  const recargarTalleres = conResumen(talleresCarga)
  const recargarRecorridos = conResumen(recorridosCarga)
  const recargarRecursos = conResumen(recursosCarga)
  const recargarMuseos = conResumen(museosCarga)
  const edCharla = useEdicion(recargarCharlas, 'gestion-charlas')
  const edTaller = useEdicion(recargarTalleres, 'gestion-talleres')
  const edRecorrido = useEdicion(recargarRecorridos, 'gestion-recorridos')
  const edRecurso = useEdicion(recargarRecursos, 'gestion-recursos')
  const edMuseo = useEdicion(recargarMuseos, 'gestion-museos')

  const [dialogo, setDialogo] = useState(null)
  const [traduccion, setTraduccion] = useState({ trabajando: false, mensaje: '' })

  async function traducirPendientes() {
    setTraduccion({ trabajando: true, mensaje: '' })
    try {
      let respuesta = await admin.traducirPendientes()
      let total = respuesta.traducidos
      for (let vuelta = 0; respuesta.estado === 'ok' && respuesta.pendientes > 0 && respuesta.traducidos > 0 && vuelta < 6; vuelta++) {
        respuesta = await admin.traducirPendientes()
        total += respuesta.traducidos
      }
      let mensaje
      if (respuesta.estado === 'desactivada') mensaje = 'La traducción automática no está activada: falta la clave DEEPL_API_KEY en el servidor.'
      else if (respuesta.pendientes > 0) mensaje = `Se tradujeron ${total}. Quedan ${respuesta.pendientes} pendientes: revisá la cuota de DeepL o volvé a intentar en un rato.`
      else mensaje = total > 0 ? `Listo: se tradujeron ${total} elementos.` : 'Todo el contenido ya está traducido.'
      setTraduccion({ trabajando: false, mensaje })
    } catch (error) {
      setTraduccion({ trabajando: false, mensaje: 'No se pudo traducir: ' + error.message })
    }
  }

  function confirmarEliminar(nombre, titulo, aviso, accion, recargar) {
    setDialogo({
      tipo: 'confirmar',
      titulo: `¿Eliminar ${nombre}?`,
      mensaje: `«${titulo}» se va a eliminar. ${aviso} Esta acción no se puede deshacer.`,
      alConfirmar: () => {
        setDialogo(null)
        accionAdmin(accion, recargar)
      },
    })
  }

  async function verInscriptos(tipo, id, titulo) {
    try {
      const inscriptos = await api.inscriptosDeActividad(tipo, id)
      setDialogo({ tipo: 'inscriptos', titulo, inscriptos })
    } catch (error) {
      alert('No se pudieron cargar los inscriptos: ' + error.message)
    }
  }

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
          Gestioná las charlas, talleres, recorridos, museos y recursos del sitio: agregalos, editalos, revisá su estado y eliminalos cuando corresponda. Los cambios se guardan en el servidor y se ven enseguida en el sitio.
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
        <div className="admin-traduccion">
          <button type="button" className="nc-btn nc-btn--outline nc-btn--mini" onClick={traducirPendientes} disabled={traduccion.trabajando}>
            <i className={traduccion.trabajando ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-language'} aria-hidden="true"></i>
            {' '}
            {traduccion.trabajando ? 'Traduciendo…' : 'Traducir lo pendiente'}
          </button>
          <span role="status">
            {traduccion.mensaje || 'Lo que subas se traduce solo al inglés y portugués. Usá este botón para completar lo que haya quedado sin traducir.'}
          </span>
        </div>
      </section>
      <section id="resumen" className="admin-panel" aria-labelledby="resumenTitulo">
        <div className="nc-seccion__cabecera">
          <h2 id="resumenTitulo">Estado general</h2>
        </div>
        <div className="admin-resumen-grid" id="resumenGrid">
          <Estadistica icono="fa-comments" numero={resumen ? resumen.activas.charlas : '-'} etiqueta="Charlas activas" />
          <Estadistica icono="fa-palette" numero={resumen ? resumen.activas.talleres : '-'} etiqueta="Talleres activos" />
          <Estadistica icono="fa-route" numero={resumen ? resumen.activas.recorridos : '-'} etiqueta="Recorridos activos" />
          <Estadistica icono="fa-book" numero={resumen ? resumen.recursos : '-'} etiqueta="Recursos" />
          <Estadistica icono="fa-user" numero={resumen ? resumen.usuarios : '-'} etiqueta="Personas registradas" />
          <Estadistica icono="fa-ticket" numero={resumen ? resumen.inscripciones.total : '-'} etiqueta="Inscripciones en total" />
          <Estadistica icono="fa-calendar-week" numero={resumen ? resumen.inscripciones.ultimaSemana : '-'} etiqueta="Inscripciones esta semana" />
          <Estadistica icono="fa-envelope-open-text" numero={resumen ? resumen.suscriptores : '-'} etiqueta="Suscriptores del boletín" />
        </div>
        {resumenCarga.error && <p className="admin-vacio">No se pudieron cargar las estadísticas.</p>}
        {resumen && resumen.masPedidas.length > 0 && (
          <div className="admin-top">
            <h3>Actividades con más inscriptos</h3>
            <ol>
              {resumen.masPedidas.map((actividad) => (
                <li key={actividad.tipo + actividad.id}>
                  <span className="admin-top__tipo">{actividad.tipo}</span>
                  <span className="admin-top__titulo">{actividad.titulo}</span>
                  <strong>{actividad.inscriptos}</strong>
                </li>
              ))}
            </ol>
          </div>
        )}
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
              <h3 id="nuevaCharlaTitulo">{edCharla.editando ? `Editar charla: ${edCharla.editando.titulo}` : 'Agregar nueva charla'}</h3>
            </div>
            <FormCharla key={edCharla.clave} museos={museos} inicial={edCharla.editando} alGuardar={edCharla.alGuardar} alCancelar={edCharla.cancelar} />
          </section>
          <section className="admin-panel admin-panel--lista" aria-labelledby="listaCharlasTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="listaCharlasTitulo">Charlas cargadas</h3>
            </div>
            <div className="admin-lista" id="listaCharlas">
              <ListaAdmin {...charlasCarga} vacio="Todavía no hay charlas cargadas.">
                {(charlas || []).map((charla) => (
                  <ItemAdmin
                    key={charla.id}
                    imagen={charla.imagen}
                    titulo={charla.titulo}
                    etiqueta={`${charla.fecha} · ${charla.hora} hs`}
                    texto={`${charla.lugar} — ${charla.cupos} cupos`}
                    enlace={`/charlas/${charla.id}`}
                    finalizada={charla.finalizada}
                    tituloFinalizar="Marcar como finalizada"
                    alEditar={() => edCharla.editar(charla)}
                    alEliminar={() => confirmarEliminar('la charla', charla.titulo, 'Las inscripciones de esta actividad también se eliminan.', () => admin.eliminar('charlas', charla.id), recargarCharlas)}
                    alFinalizar={() => accionAdmin(() => admin.finalizada('charlas', charla.id), recargarCharlas)}
                    destacada={charla.destacada}
                    alDestacar={() => accionAdmin(() => admin.destacada('charlas', charla.id), recargarCharlas)}
                    alVerInscriptos={() => verInscriptos('charla', charla.id, charla.titulo)}
                    alUbicar={() => ubicar('charla', charla.id)}
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
              <h3 id="nuevoTallerTitulo">{edTaller.editando ? `Editar taller: ${edTaller.editando.titulo}` : 'Agregar nuevo taller'}</h3>
            </div>
            <FormTaller key={edTaller.clave} museos={museos} inicial={edTaller.editando} alGuardar={edTaller.alGuardar} alCancelar={edTaller.cancelar} />
          </section>
          <section className="admin-panel admin-panel--lista" aria-labelledby="listaTalleresTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="listaTalleresTitulo">Talleres cargados</h3>
            </div>
            <div className="admin-lista" id="listaTalleres">
              <ListaAdmin {...talleresCarga} vacio="Todavía no hay talleres cargados.">
                {(talleres || []).map((taller) => (
                  <ItemAdmin
                    key={taller.id}
                    imagen={taller.imagen}
                    titulo={taller.titulo}
                    texto={`${taller.modalidad} — ${taller.cupos} cupos`}
                    enlace={`/cursos/${taller.id}`}
                    finalizada={taller.finalizada}
                    tituloFinalizar="Marcar como finalizado"
                    alEditar={() => edTaller.editar(taller)}
                    alEliminar={() => confirmarEliminar('el taller', taller.titulo, 'Las inscripciones de esta actividad también se eliminan.', () => admin.eliminar('talleres', taller.id), recargarTalleres)}
                    alFinalizar={() => accionAdmin(() => admin.finalizada('talleres', taller.id), recargarTalleres)}
                    destacada={taller.destacada}
                    alDestacar={() => accionAdmin(() => admin.destacada('talleres', taller.id), recargarTalleres)}
                    alVerInscriptos={() => verInscriptos('taller', taller.id, taller.titulo)}
                    alUbicar={() => ubicar('taller', taller.id)}
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
              <h3 id="nuevoRecorridoTitulo">{edRecorrido.editando ? `Editar recorrido: ${edRecorrido.editando.titulo}` : 'Agregar nuevo recorrido'}</h3>
            </div>
            <FormRecorrido key={edRecorrido.clave} museos={museos} inicial={edRecorrido.editando} alGuardar={edRecorrido.alGuardar} alCancelar={edRecorrido.cancelar} />
          </section>
          <section className="admin-panel admin-panel--lista" aria-labelledby="listaRecorridosTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="listaRecorridosTitulo">Recorridos cargados</h3>
            </div>
            <div className="admin-lista" id="listaRecorridos">
              <ListaAdmin {...recorridosCarga} vacio="Todavía no hay recorridos cargados.">
                {(recorridos || []).map((recorrido) => (
                  <ItemAdmin
                    key={recorrido.id}
                    imagen={recorrido.imagen}
                    titulo={recorrido.titulo}
                    texto={`${recorrido.tipo} — ${formatearDuracion(recorrido)}`}
                    enlace={`/recorridos/${recorrido.id}`}
                    finalizada={recorrido.finalizada}
                    tituloFinalizar="Marcar como finalizado"
                    alEditar={() => edRecorrido.editar(recorrido)}
                    alEliminar={() => confirmarEliminar('el recorrido', recorrido.titulo, 'Las inscripciones de esta actividad también se eliminan. Sus valoraciones también.', () => admin.eliminar('recorridos', recorrido.id), recargarRecorridos)}
                    alFinalizar={() => accionAdmin(() => admin.finalizada('recorridos', recorrido.id), recargarRecorridos)}
                    destacada={recorrido.destacada}
                    alDestacar={() => accionAdmin(() => admin.destacada('recorridos', recorrido.id), recargarRecorridos)}
                    alVerInscriptos={() => verInscriptos('recorrido', recorrido.id, recorrido.titulo)}
                    alUbicar={() => ubicar('recorrido', recorrido.id)}
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
              <h3 id="nuevoRecursoTitulo">{edRecurso.editando ? `Editar recurso: ${edRecurso.editando.titulo}` : 'Agregar nuevo recurso'}</h3>
            </div>
            <FormRecurso key={edRecurso.clave} inicial={edRecurso.editando} alGuardar={edRecurso.alGuardar} alCancelar={edRecurso.cancelar} />
          </section>
          <section className="admin-panel admin-panel--lista" aria-labelledby="listaRecursosTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="listaRecursosTitulo">Recursos cargados</h3>
            </div>
            <ul className="recurso-lista" id="recursosGrid">
              <ListaAdmin {...recursosCarga} vacio="Todavía no hay recursos cargados.">
                {(recursos || []).map((recurso) => (
                  <li key={recurso.id}>
                    <i className="fa-solid fa-file-pdf recurso-pdf" aria-hidden="true"></i>
                    <div>
                      <strong>{recurso.titulo}</strong>
                      <span className="recurso-desc">{recurso.descripcion}</span>
                      <span className="recurso-desc">{recurso.fuente} · PDF · {recurso.paginas} {recurso.paginas === 1 ? 'página' : 'páginas'}</span>
                    </div>
                    <a
                      href="#editar"
                      className="recurso-editar"
                      aria-label={`Editar ${recurso.titulo}`}
                      onClick={(evento) => {
                        evento.preventDefault()
                        edRecurso.editar(recurso)
                      }}
                    >
                      Editar
                    </a>
                    <a
                      href="#eliminar"
                      className="recurso-eliminar"
                      aria-label={`Eliminar ${recurso.titulo}`}
                      onClick={(evento) => {
                        evento.preventDefault()
                        confirmarEliminar('el recurso', recurso.titulo, 'El PDF dejará de estar disponible para descargar.', () => admin.eliminar('recursos', recurso.id), recargarRecursos)
                      }}
                    >
                      Eliminar
                    </a>
                    <a href={recurso.archivo} download aria-label={`Descargar ${recurso.titulo}, PDF`}>
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
              <h3 id="nuevoMuseoTitulo">{edMuseo.editando ? `Editar museo: ${edMuseo.editando.nombre}` : 'Agregar nuevo museo'}</h3>
            </div>
            <FormMuseo key={edMuseo.clave} inicial={edMuseo.editando} alGuardar={edMuseo.alGuardar} alCancelar={edMuseo.cancelar} />
          </section>
          <section className="admin-panel admin-panel--lista" aria-labelledby="listaMuseosTitulo">
            <div className="nc-seccion__cabecera">
              <h3 id="listaMuseosTitulo">Museos cargados</h3>
            </div>
            <div className="admin-lista" id="listaMuseos">
              <ListaAdmin {...museosCarga} vacio="Todavía no hay museos cargados.">
                {museos.map((museo) => (
                  <ItemAdmin
                    key={museo.id}
                    imagen={tieneImagen(museo) ? museo.imagen : ''}
                    titulo={museo.nombre}
                    etiqueta={museo.tipo}
                    texto={museo.direccion || 'Sin dirección'}
                    enlace={`/museos/${museo.id}`}
                    tituloUbicar="Cambiar ubicación"
                    alEditar={() => edMuseo.editar(museo)}
                    alEliminar={() => confirmarEliminar('el museo', museo.nombre, 'Las actividades que lo usan como lugar dejarán de mostrarse en el mapa.', () => admin.eliminar('museos', museo.id), recargarMuseos)}
                    alUbicar={() => ubicar('museo', museo.id)}
                  />
                ))}
              </ListaAdmin>
            </div>
          </section>
        </div>
      </section>
      {dialogo && dialogo.tipo === 'inscriptos' && (
        <DialogoInscriptos titulo={dialogo.titulo} inscriptos={dialogo.inscriptos} alCerrar={() => setDialogo(null)} />
      )}
      {dialogo && dialogo.tipo === 'confirmar' && (
        <DialogoConfirmar titulo={dialogo.titulo} mensaje={dialogo.mensaje} alConfirmar={dialogo.alConfirmar} alCancelar={() => setDialogo(null)} />
      )}
      {dialogo && dialogo.tipo === 'lugar' && (
        <DialogoLugar
          museos={museos}
          actual={dialogo.item}
          alCancelar={() => setDialogo(null)}
          alElegir={(resultado) => {
            if (resultado.otro) setDialogo({ ...dialogo, tipo: 'ubicacion', otro: true })
            else guardarUbicacion(dialogo.seccion, dialogo.id, resultado)
          }}
        />
      )}
      {dialogo && dialogo.tipo === 'ubicacion' && (
        <DialogoUbicacion
          inicial={dialogo.item.lat != null ? { lat: dialogo.item.lat, lng: dialogo.item.lng } : null}
          alCancelar={() => setDialogo(null)}
          alConfirmar={(ubicacion) => guardarUbicacion(dialogo.seccion, dialogo.id, dialogo.otro ? { museo: null, lat: ubicacion.lat, lng: ubicacion.lng } : ubicacion)}
        />
      )}
    </main>
  )
}

function Admin() {
  const { usuario } = useSesion()
  const { datos, cargando, error } = useCarga(() => (usuario ? api.yo() : Promise.resolve(null)), [Boolean(usuario)])

  if (!usuario || error) return <Navigate to="/" replace />
  if (cargando) return null
  if (!datos || !datos.usuario.esAdministrador) return <Navigate to="/" replace />
  return <PanelAdmin />
}

export default Admin
