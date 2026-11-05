import GrupoRecursos from '../components/tarjetas/GrupoRecursos'
import EstadoCarga from '../components/EstadoCarga'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useIdioma } from '../hooks/useIdioma'

// Agrupa los recursos por categoría, en el orden en que aparecen
function agruparPorCategoria(recursos) {
  const grupos = new Map()
  recursos.forEach((recurso) => {
    if (!grupos.has(recurso.categoria)) grupos.set(recurso.categoria, [])
    grupos.get(recurso.categoria).push(recurso)
  })
  return Array.from(grupos.entries())
}

function Recursos() {
  const { t } = useIdioma()
  const { datos: recursos, cargando, error } = useCarga(() => api.recursos(), [])

  return (
    <main id="contenido" className="arte-main">
      <section className="nc-hero nc-hero--imagen" style={{ backgroundImage: "url('/img/recursos.webp')" }} aria-labelledby="arteTitulo">
        <div className="nc-hero__texto">
          <h1 id="recursosTitulo">{t('ft.recursos')}</h1>
          <p>
            {t('recursos.hero1')}
          </p>
          <div className="nc-hero__acciones">
            <a href="#descargas" className="nc-btn">{t('recursos.btn')}</a>
          </div>
        </div>
        <div className="nc-hero__texto">
          <p>
            {t('recursos.hero2')}
          </p>
        </div>
      </section>
      <section id="descargas" className="arte-bloque arte-bloque--panel" aria-labelledby="materialTitulo">
        <div className="nc-seccion__cabecera">
          <h2 id="materialTitulo">{t('common.material')}</h2>
        </div>
        <p className="arte-sub">
          {t('recursos.sub')}
        </p>
        <div className="row g-4" id="recursosGrid">
          <EstadoCarga cargando={cargando} error={error} vacio={recursos && recursos.length === 0} mensajeVacio={t('recursos.sin')}>
            {agruparPorCategoria(recursos || []).map(([categoria, delGrupo]) => (
              <GrupoRecursos key={categoria} categoria={categoria} recursos={delGrupo} />
            ))}
          </EstadoCarga>
        </div>
      </section>
    </main>
  )
}

export default Recursos
