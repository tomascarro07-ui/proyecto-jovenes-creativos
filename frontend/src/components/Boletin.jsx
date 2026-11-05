import { useState } from 'react'
import { api } from '../api'
import { useIdioma } from '../hooks/useIdioma'

// Categorías entre las que se puede elegir al suscribirse. Al servidor se envía siempre el nombre en español (valor).
const CATEGORIAS = [
  { valor: 'Museos', clave: 'index.cat.museos' },
  { valor: 'Historia', clave: 'index.cat.historia' },
  { valor: 'Patrimonio Industrial', clave: 'index.cat.industrial' },
  { valor: 'Educación', clave: 'index.cat.educacion' },
  { valor: 'Arte y Exposiciones', clave: 'index.cat.arte' },
  { valor: 'Medio Ambiente', clave: 'index.cat.ambiente' },
  { valor: 'Arqueología', clave: 'index.cat.arqueologia' },
  { valor: 'Eventos por Departamento', clave: 'index.cat.departamento' },
  { valor: 'Actividades Familiares', clave: 'index.cat.familiares' },
]

// Suscripción al boletín cultural (antes: scripts/boletin.js)
function Boletin() {
  const { t } = useIdioma()
  const [email, setEmail] = useState('')
  const [categorias, setCategorias] = useState([]) // categorías tildadas
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null) // { texto, esError }

  function alternarCategoria(categoria) {
    setCategorias((actuales) =>
      actuales.includes(categoria) ? actuales.filter((c) => c !== categoria) : [...actuales, categoria],
    )
  }

  async function alEnviar(e) {
    e.preventDefault()
    setEnviando(true)
    setMensaje(null)
    try {
      const datos = await api.boletin(email, categorias)
      setMensaje({ texto: (datos && datos.mensaje) || t('bol.gracias'), esError: false })
      setEmail('')
      setCategorias([])
    } catch (error) {
      setMensaje({ texto: error.message || t('bol.error'), esError: true })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section id="boletin" className="boletin" aria-labelledby="boletinTitulo">
      <div className="boletin-cabecera">
        <i className="fa-regular fa-envelope" aria-hidden="true"></i>
        <div>
          <h2 id="boletinTitulo">{t('index.boletinTitulo')}</h2>
          <p>{t('index.boletinTexto')}</p>
        </div>
      </div>
      <form id="formBoletin" onSubmit={alEnviar}>
        <div className="boletin-email">
          <label htmlFor="boletinEmail" className="visually-hidden">{t('index.boletinEmail')}</label>
          {' '}
          <input
            type="email"
            id="boletinEmail"
            placeholder={t('index.boletinEmail')}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {' '}
          <button type="submit" className="nc-btn nc-btn--mini" disabled={enviando}>
            {enviando ? t('bol.enviando') : t('index.boletinBtn')}
          </button>
        </div>
        <fieldset className="boletin-cats">
          <legend>{t('index.boletinCats')}</legend>
          {CATEGORIAS.map(({ valor: categoria, clave }) => (
            <label key={categoria}>
              <input
                type="checkbox"
                name="cat"
                value={categoria}
                checked={categorias.includes(categoria)}
                onChange={() => alternarCategoria(categoria)}
              />
              {' '}
              <span>{t(clave)}</span>
            </label>
          ))}
        </fieldset>
        {mensaje && (
          <p className="boletin-msg" id="boletinMsg" role="status" style={mensaje.esError ? { color: '#a2492a' } : undefined}>
            {mensaje.texto}
          </p>
        )}
      </form>
    </section>
  )
}

export default Boletin
