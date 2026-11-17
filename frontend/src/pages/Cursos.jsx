import { Link } from 'react-router-dom'
import ListadoActividades from '../components/actividades/ListadoActividades'
import PasosParticipar from '../components/actividades/PasosParticipar'
import MaterialDescargable from '../components/actividades/MaterialDescargable'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useIdioma } from '../hooks/useIdioma'

function Cursos() {
  const { t, tDato } = useIdioma()
  const { datos: talleres, cargando, error } = useCarga(() => api.talleres(), [])

  const items = talleres && talleres.map((taller) => ({
    id: taller.id,
    enlace: `/cursos/${taller.id}`,
    imagen: taller.imagen,
    titulo: taller.titulo,
    descripcion: taller.descripcionCorta,
    fecha: taller.fecha,
    chip: `${t('act.taller')} · ${tDato(taller.nivel)}`,
    meta: [
      { icono: 'fa-solid fa-layer-group', texto: `${taller.cantClases} ${t('det.clases').toLowerCase()}` },
      { icono: 'fa-solid fa-laptop', texto: tDato(taller.modalidad) },
      ...(taller.lugar ? [{ icono: 'fa-solid fa-location-dot', texto: taller.lugar }] : []),
    ],
    cupos: taller.cupos,
    finalizada: taller.finalizada,
    destacada: taller.destacada,
    boton: t('act.inscribirme'),
  }))

  return (
    <main id="contenido" className="arte-main">
      <section className="nc-hero nc-hero--imagen" style={{ backgroundImage: "url('/img/talleres.webp')" }} aria-labelledby="arteTitulo">
        <div className="nc-hero__texto">
          <h1 id="arteTitulo">{t('cursos.h1')}</h1>
          <p>
            {t('cursos.hero1')}
          </p>
          <div className="nc-hero__acciones">
            <a href="#talleres" className="nc-btn">{t('cursos.btn')}</a>
          </div>
        </div>
        <div className="nc-hero__texto">
          <p>
            {t('cursos.hero2')}
          </p>
        </div>
      </section>
      <section id="talleres" className="arte-bloque arte-bloque--panel" aria-labelledby="talleresTitulo">
        <div className="nc-seccion__cabecera">
          <h2 id="talleresTitulo">{t('cursos.h1')}</h2>
        </div>
        <ListadoActividades items={items} cargando={cargando} error={error} mensajeVacio={t('list.sinTalleres')} etiquetaDestacada={t('ac.destacadaTaller')} />
      </section>
      <PasosParticipar
        titulo={t('common.comoParticipar')}
        pasos={[
          { icono: 'fa-solid fa-magnifying-glass', titulo: t('cursos.paso1t'), texto: t('part.p1') },
          { icono: 'fa-solid fa-user-check', titulo: t('part.p2t'), texto: t('part.p2') },
          { icono: 'fa-solid fa-envelope-circle-check', titulo: t('part.p3t'), texto: t('part.p3') },
        ]}
      />
      <MaterialDescargable subtitulo={t('cursos.matSub')} />
      <section className="arte-cta" aria-labelledby="darTallerTitulo">
        <div>
          <h2 id="darTallerTitulo">{t('cursos.ctaTit')}</h2>
          <p>
            {t('common.ctaTexto')}
          </p>
        </div>
        <Link to="/contacto" className="nc-btn nc-btn--claro">{t('common.irContacto')}</Link>
      </section>
    </main>
  )
}

export default Cursos
