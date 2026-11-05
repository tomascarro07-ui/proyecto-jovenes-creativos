import ListadoActividades from '../components/actividades/ListadoActividades'
import PasosParticipar from '../components/actividades/PasosParticipar'
import MaterialDescargable from '../components/actividades/MaterialDescargable'
import { formatearDuracion } from '../utils/fechas'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useIdioma } from '../hooks/useIdioma'

function Recorridos() {
  const { t, tDato } = useIdioma()
  const { datos: recorridos, cargando, error } = useCarga(() => api.recorridos(), [])

  // Cada recorrido se adapta al formato común de los listados de actividades
  const items = recorridos && recorridos.map((r) => ({
    id: r.id,
    enlace: `/recorridos/${r.id}`,
    imagen: r.imagen,
    titulo: r.titulo,
    descripcion: r.descripcionCorta,
    fecha: r.fecha,
    chip: `${t('act.recorrido')} · ${tDato(r.tipo)}`,
    meta: [
      { icono: 'fa-regular fa-clock', texto: formatearDuracion(r) },
      { icono: 'fa-solid fa-location-dot', texto: r.puntoSalida },
    ],
    cupos: r.cupos,
    finalizada: r.finalizada,
    destacada: r.destacada,
    boton: t('act.reservar'),
  }))

  return (
    <main id="contenido" className="arte-main">
      <section className="nc-hero nc-hero--imagen" style={{ backgroundImage: "url('/img/recorridos.webp')" }} aria-labelledby="arteTitulo">
        <div className="nc-hero__texto">
          <h1 id="arteTitulo">{t('recorridos.h1')}</h1>
          <p>{t('recorridos.hero1')}</p>
          <div className="nc-hero__acciones">
            <a href="#recorridos" className="nc-btn">{t('recorridos.btn')}</a>
          </div>
        </div>
        <div className="nc-hero__texto">
          <p>
            {t('recorridos.hero2')}
          </p>
        </div>
      </section>
      <section id="recorridos" className="arte-bloque arte-bloque--panel" aria-labelledby="recorridosTitulo">
        <div className="nc-seccion__cabecera">
          <h2 id="recorridosTitulo">{t('recorridos.h1')}</h2>
        </div>
        <ListadoActividades items={items} cargando={cargando} error={error} mensajeVacio={t('list.sinRecorridos')} etiquetaDestacada={t('ac.destacadaRecorrido')} />
      </section>
      <PasosParticipar
        titulo={t('recorridos.comoReservo')}
        pasos={[
          { icono: 'fa-solid fa-route', titulo: t('part.elegirRecorrido'), texto: t('part.p1r') },
          { icono: 'fa-solid fa-user-check', titulo: t('part.p2t'), texto: t('part.p2') },
          { icono: 'fa-solid fa-envelope-circle-check', titulo: t('part.p3t'), texto: t('part.p3') },
        ]}
        notas={[t('part.nota.grupales'), t('part.nota.clima')]}
      />
      <MaterialDescargable subtitulo={t('recorridos.matSub')} />
    </main>
  )
}

export default Recorridos
