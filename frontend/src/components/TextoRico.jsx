import { Link } from 'react-router-dom'
import { useIdioma } from '../hooks/useIdioma'
import { traducir } from '../i18n/motor'

const RUTAS = { 'guia_uso.html': '/contacto' }

function aRuta(href) {
  if (RUTAS[href]) return RUTAS[href]
  return '/' + href.replace(/\.html$/, '')
}

function TextoRico({ clave, vars }) {
  const { idioma } = useIdioma()
  const plantilla = traducir(idioma, clave)
  const poner = (texto) => texto.replace(/\{(\w+)\}/g, (marcador, nombreDeVariable) => (vars && vars[nombreDeVariable] !== undefined ? vars[nombreDeVariable] : marcador))
  const partes = []
  const patron = /<(b|strong)>(.*?)<\/\1>|<a href="([^"]+)">(.*?)<\/a>/g
  let cursor = 0
  let coincidencia
  while ((coincidencia = patron.exec(plantilla)) !== null) {
    if (coincidencia.index > cursor) partes.push(poner(plantilla.slice(cursor, coincidencia.index)))
    if (coincidencia[1]) partes.push(<strong key={coincidencia.index}>{poner(coincidencia[2])}</strong>)
    else partes.push(<Link key={coincidencia.index} to={aRuta(coincidencia[3])}>{poner(coincidencia[4])}</Link>)
    cursor = coincidencia.index + coincidencia[0].length
  }
  if (cursor < plantilla.length) partes.push(poner(plantilla.slice(cursor)))
  return <>{partes}</>
}

export default TextoRico
