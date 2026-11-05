// Bloque "¿Cómo participar?": tres pasos con icono y número grande de fondo.
// pasos: [{ icono, titulo, texto }]; notas (opcional): lista de textos breves debajo de los pasos.
function PasosParticipar({ titulo, pasos, notas = [] }) {
  return (
    <section className="arte-bloque" aria-labelledby="participarTitulo">
      <div className="nc-seccion__cabecera">
        <h2 id="participarTitulo">{titulo}</h2>
      </div>
      <div className="ac-pasos">
        {pasos.map((p, i) => (
          <article className="ac-paso" key={p.titulo}>
            <div className="ac-paso__cabecera">
              <span className="ac-paso__icono"><i className={p.icono} aria-hidden="true"></i></span>
              <strong className="ac-paso__numero" aria-hidden="true">{i + 1}</strong>
            </div>
            <h3>{p.titulo}</h3>
            <p>{p.texto}</p>
          </article>
        ))}
      </div>
      {notas.length > 0 && (
        <ul className="ac-notas">
          {notas.map((n) => (
            <li key={n}><i className="fa-solid fa-circle-info" aria-hidden="true"></i> {n}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default PasosParticipar
