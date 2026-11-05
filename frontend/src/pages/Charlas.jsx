import ListadoActividades from '../components/actividades/ListadoActividades'
import PasosParticipar from '../components/actividades/PasosParticipar'
import MaterialDescargable from '../components/actividades/MaterialDescargable'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useIdioma } from '../hooks/useIdioma'

function Charlas() {
  const { t, tDato } = useIdioma()
  const { datos: charlas, cargando, error } = useCarga(() => api.charlas(), [])

  // Cada charla se adapta al formato común de los listados de actividades
  const items = charlas && charlas.map((c) => ({
    id: c.id,
    enlace: `/charlas/${c.id}`,
    imagen: c.imagen,
    titulo: c.titulo,
    descripcion: c.descripcionCorta,
    fecha: c.fecha,
    chip: `${t('act.charla')} · ${tDato(c.tipo)}`,
    meta: [
      { icono: 'fa-regular fa-clock', texto: c.hora },
      { icono: 'fa-solid fa-location-dot', texto: c.lugar },
    ],
    cupos: c.cupos,
    finalizada: c.finalizada,
    destacada: c.destacada,
    boton: t('act.inscribirme'),
  }))

  return (
    <main id="contenido" className="arte-main">
      <section className="nc-hero nc-hero--imagen" style={{ backgroundImage: "url('/img/charlas.webp')" }} aria-labelledby="arteTitulo">
        <div className="nc-hero__texto">
          <h1 id="arteTitulo">{t('charlas.h1')}</h1>
          <p>
            {t('charlas.hero1')}
          </p>
        </div>
        <div className="nc-hero__texto">
          <p>
            {t('charlas.hero2')}
          </p>
        </div>
      </section>
      <section id="talleres" className="arte-bloque arte-bloque--panel" aria-labelledby="talleresTitulo">
        <div className="nc-seccion__cabecera">
          <h2 id="talleresTitulo">{t('charlas.h2')}</h2>
        </div>
        <ListadoActividades items={items} cargando={cargando} error={error} mensajeVacio={t('list.sinCharlas')} etiquetaDestacada={t('ac.destacadaCharla')} />
      </section>
      <PasosParticipar
        titulo={t('common.comoParticipar')}
        pasos={[
          { icono: 'fa-solid fa-magnifying-glass', titulo: t('charlas.paso1t'), texto: t('part.p1') },
          { icono: 'fa-solid fa-user-check', titulo: t('part.p2t'), texto: t('part.p2') },
          { icono: 'fa-solid fa-envelope-circle-check', titulo: t('part.p3t'), texto: t('part.p3') },
        ]}
      />
      <MaterialDescargable subtitulo={t('charlas.matSub')} />
    </main>
  )
}

export default Charlas
