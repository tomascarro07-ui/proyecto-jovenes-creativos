import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api, guardarSesion, leerSesion } from '../api'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../hooks/useSesion'
import { useIdioma } from '../hooks/useIdioma'
import { tt } from '../i18n/motor'

// Recorta la imagen en un cuadrado centrado y la reduce a "lado" píxeles (devuelve un texto data:image/jpeg)
function redimensionarFoto(archivo, lado) {
  return new Promise((ok, fallo) => {
    if (!archivo.type.startsWith('image/')) return fallo(new Error(tt('cuenta.errImagen')))
    const img = new Image()
    const url = URL.createObjectURL(archivo)
    img.onload = () => {
      const min = Math.min(img.width, img.height) // recorte cuadrado centrado
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = lado
      canvas.getContext('2d').drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, lado, lado)
      URL.revokeObjectURL(url)
      ok(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => fallo(new Error(tt('cuenta.errLeer')))
    img.src = url
  })
}

function iniciales(u) {
  return ((u.nombre || '?').charAt(0) + (u.apellido || '').charAt(0)).toUpperCase()
}

// Contenido de la página, una vez que ya sabemos quién es la persona
function ContenidoCuenta({ usuario, inscripciones }) {
  const { t } = useIdioma()
  const { actualizarUsuario } = useSesion()
  // Datos del formulario "Mis datos" y del formulario "Seguridad"
  const [datos, setDatos] = useState({
    nombre: usuario.nombre || '',
    apellido: usuario.apellido || '',
    correo: usuario.correo || '',
    telefono: usuario.telefono || '',
    nacimiento: usuario.fechaNacimiento || '',
    bio: usuario.bio || '',
  })
  const [pass, setPass] = useState({ actual: '', nueva: '', repetir: '' })
  const [aviso, setAviso] = useState(null) // { texto, ok } y se oculta solo a los 3,5 segundos
  const temporizador = useRef(null)

  useEffect(() => () => clearTimeout(temporizador.current), [])

  function mostrarAviso(texto, ok = true) {
    clearTimeout(temporizador.current)
    setAviso({ texto, ok })
    temporizador.current = setTimeout(() => setAviso(null), 3500)
  }

  function cambiarDatos(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  function cambiarPass(e) {
    setPass({ ...pass, [e.target.name]: e.target.value })
  }

  // Guarda cambios en el perfil y actualiza la sesión (así el encabezado también se actualiza)
  async function guardarPerfil(cambios) {
    const r = await api.actualizarPerfil(cambios)
    actualizarUsuario(r.usuario)
    return r.usuario
  }

  async function guardarDatos(e) {
    e.preventDefault()
    try {
      const nuevo = await guardarPerfil({
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
        fechaNacimiento: datos.nacimiento,
        bio: datos.bio,
      })
      setDatos({ nombre: nuevo.nombre || '', apellido: nuevo.apellido || '', correo: nuevo.correo || '', telefono: nuevo.telefono || '', nacimiento: nuevo.fechaNacimiento || '', bio: nuevo.bio || '' })
      mostrarAviso(t('cuenta.okDatos'))
    } catch (error) {
      mostrarAviso(error.message, false)
    }
  }

  async function cambiarFoto(e) {
    const archivo = e.target.files[0]
    const input = e.target
    if (!archivo) return
    try {
      await guardarPerfil({ foto: await redimensionarFoto(archivo, 240) })
      mostrarAviso(t('cuenta.okFoto'))
    } catch (error) {
      mostrarAviso(error.message, false)
    }
    input.value = ''
  }

  async function quitarFoto() {
    try {
      await guardarPerfil({ foto: '' })
      mostrarAviso(t('cuenta.okFotoQuitada'))
    } catch (error) {
      mostrarAviso(error.message, false)
    }
  }

  async function guardarPass(e) {
    e.preventDefault()
    if (pass.nueva !== pass.repetir) return mostrarAviso(t('cuenta.noCoinciden'), false)
    try {
      const r = await api.cambiarContrasenia({ actual: pass.actual, nueva: pass.nueva })
      // El servidor cierra las demás sesiones al cambiar la contraseña y entrega un token nuevo para esta
      const sesionActual = leerSesion()
      if (r.token && sesionActual) guardarSesion({ ...sesionActual, token: r.token })
      setPass({ actual: '', nueva: '', repetir: '' })
      mostrarAviso(t('cuenta.okPass'))
    } catch (error) {
      mostrarAviso(error.message, false)
    }
  }

  return (
    <main id="contenido" className="insc-main">
      <header className="insc-hero cuenta-hero">
        <div className="cuenta-avatar" id="cuentaAvatar">
          {usuario.foto
            ? <img src={usuario.foto} alt={t('cuenta.fotoAlt')} />
            : <span>{iniciales(usuario)}</span>}
        </div>
        <div className="cuenta-hero__info">
          <p className="insc-hero__eyebrow">{t('hd.miCuenta')}</p>
          <h1 id="cuentaNombre">{`${usuario.nombre} ${usuario.apellido || ''}`.trim()}</h1>
          <p className="insc-hero__sub" id="cuentaCorreo">{usuario.correo}</p>
          <div className="cuenta-hero__acciones">
            <label className="insc-btn insc-btn--primario" htmlFor="inputFoto">
              <i className="fa-solid fa-camera"></i>
              {' '}
              <span>{t('cuenta.cambiarFoto')}</span>
            </label>
            {' '}
            <input type="file" id="inputFoto" accept="image/*" hidden onChange={cambiarFoto} />
            {' '}
            <button type="button" className="insc-btn insc-btn--peligro" id="btnQuitarFoto" hidden={!usuario.foto} onClick={quitarFoto}>{t('cuenta.quitarFoto')}</button>
          </div>
        </div>
        <div className="insc-resumen" id="cuentaStats">
          {inscripciones && (
            <>
              <div className="insc-stat"><strong>{inscripciones.length}</strong><span>{t('cuenta.statInsc')}</span></div>
              <div className="insc-stat"><strong>{inscripciones.filter((i) => i.tipo === 'recorrido' && i.finalizada).length}</strong><span>{t('cuenta.statRecorridos')}</span></div>
            </>
          )}
        </div>
      </header>
      <div className="cuenta-grid">
        <section className="cuenta-card">
          <h2>{t('cuenta.datos')}</h2>
          <form id="formDatos" className="cuenta-form" onSubmit={guardarDatos}>
            <div className="cuenta-form__fila">
              <div className="cuenta-campo">
                <label htmlFor="cuenta-nombre">{t('contacto.nombre')}</label>
                <input id="cuenta-nombre" maxLength="40" required name="nombre" value={datos.nombre} onChange={cambiarDatos} />
              </div>
              <div className="cuenta-campo">
                <label htmlFor="cuenta-apellido">{t('registro.apellido')}</label>
                <input id="cuenta-apellido" maxLength="40" name="apellido" value={datos.apellido} onChange={cambiarDatos} />
              </div>
            </div>
            <div className="cuenta-campo">
              <label htmlFor="cuenta-correo">{t('det.email')}</label>
              <input id="cuenta-correo" name="correo" readOnly value={datos.correo} />
            </div>
            <div className="cuenta-form__fila">
              <div className="cuenta-campo">
                <label htmlFor="cuenta-telefono">{t('det.telefono')}</label>
                <input id="cuenta-telefono" type="tel" maxLength="20" placeholder="09X XXX XXX" name="telefono" value={datos.telefono} onChange={cambiarDatos} />
              </div>
              <div className="cuenta-campo">
                <label htmlFor="cuenta-nacimiento">{t('registro.nacimiento')}</label>
                <input id="cuenta-nacimiento" type="date" name="nacimiento" value={datos.nacimiento} onChange={cambiarDatos} />
              </div>
            </div>
            <div className="cuenta-campo">
              <label htmlFor="cuenta-bio">{t('cuenta.bio')}</label>
              <textarea id="cuenta-bio" rows="3" maxLength="200" placeholder={t('cuenta.bioPh')} name="bio" value={datos.bio} onChange={cambiarDatos}></textarea>
            </div>
            <button type="submit" className="insc-btn insc-btn--primario">
              <i className="fa-solid fa-floppy-disk"></i>
              {' '}
              <span>{t('cuenta.guardar')}</span>
            </button>
          </form>
        </section>
        <section className="cuenta-card">
          <h2>{t('cuenta.seguridad')}</h2>
          <form id="formPass" className="cuenta-form" onSubmit={guardarPass}>
            <div className="cuenta-campo">
              <label htmlFor="pass-actual">{t('cuenta.passActual')}</label>
              <input id="pass-actual" type="password" required name="actual" value={pass.actual} onChange={cambiarPass} />
            </div>
            <div className="cuenta-campo">
              <label htmlFor="pass-nueva">{t('rest.h2')}</label>
              <input id="pass-nueva" type="password" minLength="8" required name="nueva" value={pass.nueva} onChange={cambiarPass} />
            </div>
            <div className="cuenta-campo">
              <label htmlFor="pass-repetir">{t('cuenta.passRepetir')}</label>
              <input id="pass-repetir" type="password" minLength="8" required name="repetir" value={pass.repetir} onChange={cambiarPass} />
            </div>
            <button type="submit" className="insc-btn insc-btn--primario">
              <i className="fa-solid fa-lock"></i>
              {' '}
              <span>{t('cuenta.cambiarPass')}</span>
            </button>
          </form>
          <Link to="/mis-inscripciones" className="insc-btn insc-btn--peligro cuenta-link">
            <i className="fa-regular fa-calendar-check"></i>
            {' '}
            <span>{t('cuenta.verInsc')}</span>
          </Link>
        </section>
      </div>
      <div className={`cuenta-aviso${aviso ? ' cuenta-aviso--visible' : ''}${aviso && !aviso.ok ? ' cuenta-aviso--error' : ''}`} id="cuentaAviso" role="status">{aviso && aviso.texto}</div>
    </main>
  )
}

function Cuenta() {
  const { t } = useIdioma()
  const { usuario, actualizarUsuario } = useSesion()
  // Se confirma con el servidor quién es la persona (y se actualiza la sesión guardada)
  const { cargando, error } = useCarga(
    () => (usuario ? api.yo().then((r) => actualizarUsuario(r.usuario)) : Promise.resolve(null)),
    [!!usuario],
  )
  // Las estadísticas son opcionales: si fallan, simplemente no se muestran
  const { datos: inscripciones } = useCarga(() => (usuario ? api.misInscripciones().catch(() => null) : Promise.resolve(null)), [!!usuario])

  if (!usuario || (error && error.status === 401)) return <Navigate to="/login" replace />
  if (error) {
    return <main id="contenido" className="insc-main"><p className="admin-vacio" role="alert">{t('api.errorServidor')}</p></main>
  }
  if (cargando) return <main id="contenido" className="insc-main"><p className="admin-vacio" role="status">{t('comun.cargando')}</p></main>
  return <ContenidoCuenta usuario={usuario} inscripciones={inscripciones} />
}

export default Cuenta
