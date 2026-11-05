import { Link } from 'react-router-dom'
import PildoraCupos from './PildoraCupos'
import { etiquetaFechaCercana } from '../../utils/fechas'

// Actividad destacada: ocupa todo el ancho, con la foto grande. La elige el administrador con la estrella del panel.
// Recibe una actividad ya "normalizada" (ver ListadoActividades).
function Destacada({ item, etiqueta }) {
  const fecha = etiquetaFechaCercana(item.fecha)
  return (
    <article className="ac-destacada">
      <div className="ac-destacada__media">
        {item.imagen && <img src={item.imagen} alt="" />}
        <span className="ac-destacada__sello">
          <i className="fa-solid fa-star" aria-hidden="true"></i> {etiqueta}
        </span>
      </div>
      <div className="ac-destacada__cuerpo">
        {fecha && <span className="ac-chip ac-chip--claro">{fecha}</span>}
        <h3>{item.titulo}</h3>
        <p>{item.descripcion}</p>
        <ul className="ac-meta ac-meta--claro">
          {item.meta.map((m) => (
            <li key={m.icono}><i className={m.icono} aria-hidden="true"></i> {m.texto}</li>
          ))}
        </ul>
        <div className="ac-destacada__acciones">
          <Link to={item.enlace} className="ac-boton-claro">
            {item.boton} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </Link>
          <PildoraCupos actividad={item} />
        </div>
      </div>
    </article>
  )
}

export default Destacada
