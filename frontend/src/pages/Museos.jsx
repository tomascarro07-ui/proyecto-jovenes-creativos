import { useState } from 'react'
import TarjetaMuseo from '../components/tarjetas/TarjetaMuseo'
import EstadoCarga from '../components/EstadoCarga'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useIdioma } from '../hooks/useIdioma'

function Museos() {
  const { t } = useIdioma()
  const { datos: museos, cargando, error } = useCarga(() => api.museos(), [])
  const [tipo, setTipo] = useState('')

  const lista = museos || []
  const tipos = [...new Set(lista.map((museo) => museo.tipo).filter(Boolean))]
  const visibles = tipo ? lista.filter((museo) => museo.tipo === tipo) : lista

  return (
    <main id="contenido" className="museos-main">
      <section className="nc-hero nc-hero--imagen" style={{ backgroundImage: "url('/img/museos.webp')" }} aria-labelledby="museosTitulo">
        <div className="nc-hero__texto">
          <h1 id="museosTitulo">{t('museos.h1')}</h1>
          <p>
            {t('museos.hero1')}
          </p>
        </div>
        <div className="nc-hero__texto">
          <p>
            {t('museos.hero2')}
          </p>
        </div>
      </section>
      <section className="museos-panel" aria-labelledby="fichasTitulo">
        <div className="nc-seccion__cabecera">
          <h2 id="fichasTitulo">{t('museos.h2')}</h2>
        </div>
        <p className="arte-sub">
          {t('museos.sub')}
        </p>
        {tipos.length > 1 && (
          <div className="mu-filtros" role="group" aria-label={t('museos.filtroAria')}>
            <button type="button" className="mu-filtro" aria-pressed={tipo === ''} onClick={() => setTipo('')}>{t('museos.todos')}</button>
            {tipos.map((tipoDeMuseo) => (
              <button type="button" className="mu-filtro" key={tipoDeMuseo} aria-pressed={tipo === tipoDeMuseo} onClick={() => setTipo(tipoDeMuseo)}>{tipoDeMuseo}</button>
            ))}
          </div>
        )}
        <div className="mu-grid" id="museosFichas">
          <EstadoCarga cargando={cargando} error={error} vacio={museos && museos.length === 0} mensajeVacio={t('museos.sin')}>
            {visibles.map((museo) => (
              <TarjetaMuseo key={museo.id} museo={museo} />
            ))}
          </EstadoCarga>
        </div>
      </section>
    </main>
  )
}

export default Museos
