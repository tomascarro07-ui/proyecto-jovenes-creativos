import { Link } from 'react-router-dom'
import { useIdioma } from '../hooks/useIdioma'

function Footer() {
  const { t } = useIdioma()
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="footer-marca">
          <Link to="/" className="brand brand--footer" aria-label={t('hd.irInicio')}>
            <img src="/img/logo-blanco.png" alt="" width="190" />
          </Link>
          <p>{t('ft.lema')}</p>
          <div className="footer-redes">
            <a href="#" aria-label={t('ft.facebook')}>
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            {' '}
            <a href="#" aria-label={t('ft.instagram')}>
              <i className="fa-brands fa-instagram"></i>
            </a>
            {' '}
            <a href="#" aria-label={t('ft.youtube')}>
              <i className="fa-brands fa-youtube"></i>
            </a>
          </div>
        </div>
        <nav className="footer-col" aria-label={t('ft.enlaces')}>
          <h3>{t('ft.enlaces')}</h3>
          <ul>
            <li>
              <Link to="/">{t('ft.inicio')}</Link>
            </li>
            <li>
              <a href="/#actividades">{t('ft.actividades')}</a>
            </li>
            <li>
              <Link to="/museos">{t('ft.museos')}</Link>
            </li>
            <li>
              <Link to="/cursos">{t('ft.cursos')}</Link>
            </li>
          </ul>
        </nav>
        <nav className="footer-col" aria-label={t('ft.recursos')}>
          <h3>{t('ft.recursos')}</h3>
          <ul>
            <li>
              <Link to="/recursos">{t('ft.recursosEdu')}</Link>
            </li>
            <li>
              <Link to="/recorridos">{t('ft.recorridos')}</Link>
            </li>
            <li>
              <a href="/recursos#descargas">{t('common.material')}</a>
            </li>
            <li>
              <a href="/#boletin">{t('ft.boletin')}</a>
            </li>
          </ul>
        </nav>
        <nav className="footer-col" aria-label={t('ft.sobre')}>
          <h3>{t('ft.sobre')}</h3>
          <ul>
            <li>
              <Link to="/nosotros">{t('ft.quienes')}</Link>
            </li>
            <li>
              <Link to="/contacto">{t('ft.contacto')}</Link>
            </li>
            <li>
              <Link to="/admin">{t('ft.admin')}</Link>
            </li>
          </ul>
        </nav>
        <div className="footer-col">
          <h3>{t('ft.contacto')}</h3>
          <ul className="footer-contacto">
            <li>
              <i className="fa-regular fa-envelope"></i>
              {' '}
              contacto@nodocultural.uy
            </li>
            <li>
              <i className="fa-solid fa-phone"></i>
              {' '}
              +598 99 123 456
            </li>
            <li>
              <i className="fa-solid fa-location-dot"></i>
              {' '}
              <span>{t('ft.ubicacion')}</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer
