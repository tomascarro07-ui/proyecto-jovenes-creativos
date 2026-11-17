import { useState } from 'react'
import { admin, rutaOriginal } from '../../api'
import { leer } from '../../utils/lugar'
import BotonUbicacion from './BotonUbicacion'
import CampoImagen from './CampoImagen'
import CampoGaleria from './CampoGaleria'
import BotonesForm from './BotonesForm'

function FormMuseo({ inicial = null, alGuardar, alCancelar }) {
  const datosIniciales = inicial || {}
  const latitudInicial = datosIniciales.lat === undefined ? null : datosIniciales.lat
  const longitudInicial = datosIniciales.lng === undefined ? null : datosIniciales.lng
  const [ubicacion, setUbicacion] = useState({ lat: latitudInicial, lng: longitudInicial })
  const [enviando, setEnviando] = useState(false)
  const [galeria, setGaleria] = useState((datosIniciales.galeria || []).map(rutaOriginal))
  const editando = Boolean(inicial)
  const destacados = [0, 1, 2, 3].map((posicion) => (datosIniciales.destacados || [])[posicion] || { titulo: '', texto: '' })

  async function alEnviar(evento) {
    evento.preventDefault()
    const form = evento.currentTarget
    if (ubicacion.lat === null) {
      alert('Marcá la ubicación del museo en el mapa.')
      return
    }
    const datos = {
      nombre: leer(form, 'museo-nombre').trim(),
      tipo: leer(form, 'museo-tipo').trim(),
      descripcionCorta: leer(form, 'museo-descripcion').trim(),
      direccion: leer(form, 'museo-direccion').trim(),
      horario: leer(form, 'museo-horario').trim(),
      imagen: leer(form, 'museo-imagen').trim(),
      lat: ubicacion.lat,
      lng: ubicacion.lng,
      gancho: leer(form, 'museo-gancho').trim(),
      historia: leer(form, 'museo-historia').trim(),
      datoCurioso: leer(form, 'museo-dato').trim(),
      destacados: [0, 1, 2, 3]
        .map((posicion) => ({ titulo: leer(form, `museo-dest-${posicion}-titulo`).trim(), texto: leer(form, `museo-dest-${posicion}-texto`).trim() }))
        .filter((destacado) => destacado.titulo),
      galeria,
      entrada: leer(form, 'museo-entrada').trim(),
      accesibilidad: leer(form, 'museo-accesibilidad').trim(),
    }
    setEnviando(true)
    try {
      if (editando) await admin.editar('museos', inicial.id, datos)
      else await admin.crear('museos', { ...datos, museo: null })
      await alGuardar()
    } catch (error) {
      alert('No se pudo guardar el museo: ' + error.message)
      setEnviando(false)
    }
  }

  return (
    <form id="formMuseo" className="auth-form" onSubmit={alEnviar}>
      <div className="auth-campo">
        <label htmlFor="museo-nombre">Nombre</label>
        <input type="text" id="museo-nombre" required maxLength="120" defaultValue={datosIniciales.nombre} placeholder="Ej: Espacio Portugués" />
      </div>
      <div className="auth-fila">
        <div className="auth-campo">
          <label htmlFor="museo-tipo">Tipo</label>
          <input type="text" id="museo-tipo" required maxLength="40" defaultValue={datosIniciales.tipo} placeholder="Ej: Histórico" />
        </div>
        <div className="auth-campo">
          <label htmlFor="museo-horario">Horario</label>
          <input type="text" id="museo-horario" maxLength="120" defaultValue={datosIniciales.horario} placeholder="Ej: Mar a Dom, 11 a 17 hs" />
        </div>
      </div>
      <div className="auth-campo">
        <label htmlFor="museo-direccion">Dirección</label>
        <input type="text" id="museo-direccion" maxLength="120" defaultValue={datosIniciales.direccion} placeholder="Ej: Calle de los Suspiros 123" />
      </div>
      <CampoImagen prefijo="museo" inicial={rutaOriginal(datosIniciales.imagen) || ''} />
      <div className="auth-campo">
        <label htmlFor="museo-descripcion">Descripción</label>
        <textarea id="museo-descripcion" required rows="3" maxLength="600" defaultValue={datosIniciales.descripcionCorta} placeholder="Breve descripción del museo"></textarea>
      </div>
      <fieldset className="admin-extra">
        <legend>Contenido ampliado de la ficha (todo opcional)</legend>
        <div className="auth-campo">
          <label htmlFor="museo-gancho">Frase corta (se ve en la tarjeta y en la portada)</label>
          <input type="text" id="museo-gancho" maxLength="90" defaultValue={datosIniciales.gancho} placeholder="Ej: El primero en abrir sus puertas, en 1951" />
        </div>
        <div className="auth-campo">
          <label htmlFor="museo-historia">La historia (separá los párrafos con una línea en blanco)</label>
          <textarea id="museo-historia" rows="7" maxLength="3000" defaultValue={datosIniciales.historia} placeholder="Contá la historia del lugar, qué se exhibe, quiénes lo fundaron…"></textarea>
        </div>
        <div className="auth-campo">
          <label htmlFor="museo-dato">Dato curioso</label>
          <input type="text" id="museo-dato" maxLength="300" defaultValue={datosIniciales.datoCurioso} placeholder="Una frase que llame la atención" />
        </div>
        <p className="admin-extra__titulo">Qué vas a ver (hasta 4 elementos)</p>
        {destacados.map((destacado, posicion) => (
          <div className="auth-fila" key={posicion}>
            <div className="auth-campo">
              <label htmlFor={`museo-dest-${posicion}-titulo`}>Título {posicion + 1}</label>
              <input type="text" id={`museo-dest-${posicion}-titulo`} maxLength="60" defaultValue={destacado.titulo} />
            </div>
            <div className="auth-campo">
              <label htmlFor={`museo-dest-${posicion}-texto`}>Detalle {posicion + 1}</label>
              <input type="text" id={`museo-dest-${posicion}-texto`} maxLength="200" defaultValue={destacado.texto} />
            </div>
          </div>
        ))}
        <CampoGaleria fotos={galeria} alCambiar={setGaleria} />
        <div className="auth-fila">
          <div className="auth-campo">
            <label htmlFor="museo-entrada">Entrada</label>
            <input type="text" id="museo-entrada" maxLength="120" defaultValue={datosIniciales.entrada} placeholder="Ej: Entrada general $150" />
          </div>
          <div className="auth-campo">
            <label htmlFor="museo-accesibilidad">Accesibilidad</label>
            <input type="text" id="museo-accesibilidad" maxLength="200" defaultValue={datosIniciales.accesibilidad} placeholder="Ej: Planta baja accesible" />
          </div>
        </div>
      </fieldset>
      <div className="auth-campo" data-ubicacion="">
        <label>Ubicación en el mapa cultural</label>
        {' '}
        <BotonUbicacion lat={ubicacion.lat} lng={ubicacion.lng} alCambiar={setUbicacion} texto="Marcar en el mapa" />
      </div>
      <BotonesForm editando={editando} textoAgregar="Agregar museo" enviando={enviando} alCancelar={alCancelar} />
    </form>
  )
}

export default FormMuseo
