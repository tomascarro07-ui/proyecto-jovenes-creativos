import { Link } from 'react-router-dom'
import { useIdioma } from '../hooks/useIdioma'

function Nosotros() {
  const { t } = useIdioma()
  return (
    <main id="contenido" className="arte-main">
      <section className="nc-hero" aria-labelledby="nosotrosTitulo">
        <div className="nc-hero__texto">
          <h1 id="nosotrosTitulo">{t('nosotros.h1')}</h1>
          <p>{t('nosotros.hero1')}</p>
        </div>
        <div className="nc-hero__texto">
          <p>
            {t('nosotros.hero2')}
          </p>
        </div>
      </section>
      <section className="arte-bloque" aria-labelledby="proyectoTitulo">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.2rem" }}>
          <img src="/img/grupal1.webp" alt={t('nosotros.altPractica')} style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "8px", display: "block" }} />
          {' '}
          <img src="/img/grupo2.webp" alt={t('nosotros.altPractica')} style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "8px", display: "block" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "40px", padding: "15px 20px" }}>
          <img src="/img/logoROFE.webp" alt={t('nosotros.altRofe')} style={{ width: "180px", height: "80px", objectFit: "contain" }} />
          {' '}
          <img src="/img/logo-JC.webp" alt="Jóvenes CreaTIvos" style={{ width: "180px", height: "80px", objectFit: "contain" }} />
        </div>
        <h2 id="proyectoTitulo">{t('nosotros.proyectoH')}</h2>
        <p>
          {t('nosotros.proyectoP')}
        </p>
      </section>
      <section className="arte-bloque arte-bloque--panel" aria-labelledby="buscamosTitulo">
        <div className="nc-seccion__cabecera">
          <h2 id="buscamosTitulo">{t('nosotros.buscamosH')}</h2>
        </div>
        <div className="pasos-grid">
          <article className="paso">
            <div className="paso__numero">
              <i className="fa-solid fa-link" aria-hidden="true"></i>
            </div>
            <h3>{t('nosotros.conectar')}</h3>
            <p>
              {t('nosotros.conectarP')}
            </p>
          </article>
          <article className="paso">
            <div className="paso__numero">
              <i className="fa-solid fa-bullhorn" aria-hidden="true"></i>
            </div>
            <h3>{t('nosotros.difundir')}</h3>
            <p>
              {t('nosotros.difundirP')}
            </p>
          </article>
          <article className="paso">
            <div className="paso__numero">
              <i className="fa-solid fa-door-open" aria-hidden="true"></i>
            </div>
            <h3>{t('nosotros.facilitar')}</h3>
            <p>
              {t('nosotros.facilitarP')}
            </p>
          </article>
        </div>
      </section>
      <section className="arte-bloque" aria-labelledby="creadoresTitulo">
        <div className="nc-seccion__cabecera">
          <h2 id="creadoresTitulo">{t('nosotros.creadores')}</h2>
        </div>
        <div className="creadores-grid">
          <article className="curso-mini">
            <div className="curso-mini">
              <img src="/img/tomas.webp" alt="Tomás Carro" />
            </div>
            <div className="curso-mini__info">
              <h3>Tomás Carro</h3>
              <center>
                <a href="https://claude.ai/artifact/YJH22fw9yxvoGvPuJYwfP7" className="nc-btn nc-btn--mini" target="_blank" rel="noopener">{t('nosotros.portfolio')}</a>
              </center>
            </div>
          </article>
          <article className="curso-mini">
            <div className="curso-mini">
              <img src="/img/veronica.webp" alt="Verónica Techera" />
            </div>
            <div className="curso-mini__info">
              <h3>Veronica Techera</h3>
              <center>
                <a href="https://claude.ai/artifact/Ru3jdHZQSm4zfgSyqq5rjg" className="nc-btn nc-btn--mini" target="_blank" rel="noopener">{t('nosotros.portfolio')}</a>
              </center>
            </div>
          </article>
        </div>
      </section>
      <section className="arte-cta" aria-labelledby="sumateTitulo">
        <div>
          <h2 id="sumateTitulo">{t('common.sumate')}</h2>
          <p>
            {t('nosotros.sumateP')}
          </p>
        </div>
        <Link to="/contacto?asunto=Sumar%20mi%20museo%20o%20espacio%20cultural" className="nc-btn nc-btn--claro">{t('common.escribinos')}</Link>
      </section>
    </main>
  )
}

export default Nosotros
