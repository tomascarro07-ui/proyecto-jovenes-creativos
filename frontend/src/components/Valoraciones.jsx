import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import { useIdioma } from '../hooks/useIdioma'
import TextoRico from '../components/TextoRico'
import { tt } from '../i18n/motor'
import { avisar } from '../utils/avisos'

function Estrellas({ valor }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((numero) => {
        let clase = 'fa-regular fa-star'
        if (valor >= numero - 0.25) clase = 'fa-solid fa-star'
        else if (valor >= numero - 0.75) clase = 'fa-solid fa-star-half-stroke'
        return <i key={numero} className={clase}></i>
      })}
    </>
  )
}

function Avatar({ autor }) {
  return autor.foto
    ? <img className="val-avatar" src={autor.foto} alt="" />
    : <span className="val-avatar">{autor.nombre.charAt(0).toUpperCase()}</span>
}

function FormValoracion({ idRecorrido, elegibilidad, alPublicar }) {
  const { t } = useIdioma()
  const mia = elegibilidad.mia
  const [seleccion, setSeleccion] = useState(mia ? mia.estrellas : 0)
  const [encima, setEncima] = useState(0)
  const [comentario, setComentario] = useState(mia ? mia.comentario : '')
  const [enviando, setEnviando] = useState(false)
  const mostrar = encima || seleccion

  async function alEnviar(evento) {
    evento.preventDefault()
    if (!seleccion) {
      avisar(t('val.elegi'), { tipo: 'advertencia' })
      return
    }
    setEnviando(true)
    try {
      await api.valorar({ recorrido: idRecorrido, estrellas: seleccion, comentario })
      alPublicar()
    } catch (error) {
      avisar(error.message, { tipo: 'error' })
    }
    setEnviando(false)
  }

  return (
    <form className="val-form" id="formValoracion" onSubmit={alEnviar}>
      <h3>{mia ? t('val.tuValoracion') : t('val.comoEstuvo')}</h3>
      <div className="val-input" role="radiogroup" aria-label={t('val.puntuacion')} onMouseLeave={() => setEncima(0)}>
        {[1, 2, 3, 4, 5].map((numero) => (
          <button
            key={numero}
            type="button"
            className={`val-estrella${numero <= mostrar ? ' activa' : ''}`}
            aria-label={t(numero === 1 ? 'val.estrella' : 'val.estrellas', { n: numero })}
            onMouseEnter={() => setEncima(numero)}
            onClick={() => setSeleccion(numero)}
          >
            <i className={numero <= mostrar ? 'fa-solid fa-star' : 'fa-regular fa-star'}></i>
          </button>
        ))}
      </div>
      <textarea id="valComentario" rows="3" maxLength="300" placeholder={t('val.placeholder')} value={comentario} onChange={(evento) => setComentario(evento.target.value)}></textarea>
      <button type="submit" className="insc-btn insc-btn--primario" disabled={enviando}>{mia ? t('val.actualizar') : t('val.publicar')}</button>
    </form>
  )
}

function Valoraciones({ idRecorrido }) {
  const { t } = useIdioma()
  const { usuario, esAdmin } = useSesion()
  const { datos, error, recargar } = useCarga(
    () => Promise.all([
      api.valoraciones(idRecorrido),
      usuario && !esAdmin ? api.elegibilidad(idRecorrido) : Promise.resolve(null),
    ]),
    [idRecorrido, Boolean(usuario), esAdmin],
  )

  const { hash } = useLocation()
  const listo = Boolean(datos)
  useEffect(() => {
    if (listo && hash === '#valoraciones') {
      const seccion = document.getElementById('valoraciones')
      if (seccion) seccion.scrollIntoView()
    }
  }, [listo, hash])

  if (error || !datos) return <section id="valoraciones" className="val-seccion"></section>
  const [resumen, elegibilidad] = datos
  const maximo = Math.max(1, ...resumen.distribucion.map((grupo) => grupo.cantidad))

  let bloque = null
  if (!esAdmin) {
    if (!usuario) {
      bloque = (
        <div className="val-aviso">
          <i className="fa-solid fa-lock"></i>
          {' '}
          <TextoRico clave="val.login" />
        </div>
      )
    } else if (!elegibilidad.puede) {
      bloque = <div className="val-aviso"><i className="fa-solid fa-circle-info"></i> {elegibilidad.motivo}</div>
    } else {
      bloque = <FormValoracion key={elegibilidad.mia ? elegibilidad.mia.estrellas + elegibilidad.mia.comentario : 'nueva'} idRecorrido={idRecorrido} elegibilidad={elegibilidad} alPublicar={recargar} />
    }
  }

  return (
    <section id="valoraciones" className="val-seccion">
      <h2>{t('val.titulo')}</h2>
      <div className="val-card">
        <div className="val-resumen">
          <div className="val-promedio">
            <strong>{resumen.total ? resumen.promedio.toFixed(1) : '–'}</strong>
            <div className="val-estrellas"><Estrellas valor={resumen.promedio} /></div>
            <span>{t(resumen.total === 1 ? 'val.una' : 'val.varias', { n: resumen.total })}</span>
          </div>
          <div className="val-barras">
            {resumen.distribucion.map((grupo) => (
              <div className="val-barra" key={grupo.estrellas}>
                <span>{grupo.estrellas} <i className="fa-solid fa-star"></i></span>
                <div className="val-barra__fondo"><div style={{ width: `${(grupo.cantidad / maximo) * 100}%` }}></div></div>
                <span>{grupo.cantidad}</span>
              </div>
            ))}
          </div>
        </div>
        {bloque}
      </div>
      <div className="val-lista">
        {resumen.valoraciones.length === 0
          ? <p className="val-vacio">{t('val.vacio')}</p>
          : resumen.valoraciones.map((valoracion, posicion) => (
            <article className="val-item" key={posicion}>
              <Avatar autor={valoracion.autor} />
              <div>
                <div className="val-item__top">
                  <strong>{valoracion.autor.nombre}</strong>
                  <span className="val-estrellas"><Estrellas valor={valoracion.estrellas} /></span>
                </div>
                {valoracion.comentario && <p>{valoracion.comentario}</p>}
                <small>{new Date(valoracion.creadaEn).toLocaleDateString(tt('fecha.locale'), { day: 'numeric', month: 'long', year: 'numeric' })}</small>
              </div>
            </article>
          ))}
      </div>
    </section>
  )
}

export default Valoraciones
