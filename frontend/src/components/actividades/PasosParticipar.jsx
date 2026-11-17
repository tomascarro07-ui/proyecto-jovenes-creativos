function PasosParticipar({ titulo, pasos, notas = [] }) {
  return (
    <section className="arte-bloque" aria-labelledby="participarTitulo">
      <div className="nc-seccion__cabecera">
        <h2 id="participarTitulo">{titulo}</h2>
      </div>
      <div className="ac-pasos">
        {pasos.map((paso, posicion) => (
          <article className="ac-paso" key={paso.titulo}>
            <div className="ac-paso__cabecera">
              <span className="ac-paso__icono"><i className={paso.icono} aria-hidden="true"></i></span>
              <strong className="ac-paso__numero" aria-hidden="true">{posicion + 1}</strong>
            </div>
            <h3>{paso.titulo}</h3>
            <p>{paso.texto}</p>
          </article>
        ))}
      </div>
      {notas.length > 0 && (
        <ul className="ac-notas">
          {notas.map((nota) => (
            <li key={nota}><i className="fa-solid fa-circle-info" aria-hidden="true"></i> {nota}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default PasosParticipar
