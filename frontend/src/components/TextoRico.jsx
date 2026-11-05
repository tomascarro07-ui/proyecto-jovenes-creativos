import { Link } from 'react-router-dom'
import { useIdioma } from '../hooks/useIdioma'
import { traducir } from '../i18n/motor'

// Algunos textos del diccionario traen un poco de HTML (<b>, <strong>, <a href="...">).
// Este componente los dibuja como elementos de React, sin usar innerHTML (así nada se interpreta como código).
// Uso: <TextoRico clave="val.login" vars={{ correo }} />
// Las direcciones "algo.html" del sitio original se convierten en rutas ("/algo").
const RUTAS = { 'guia_uso.html': '/contacto' }

function aRuta(href) {
  if (RUTAS[href]) return RUTAS[href]
  return '/' + href.replace(/\.html$/, '')
}

function TextoRico({ clave, vars }) {
  const { idioma } = useIdioma()
  const plantilla = traducir(idioma, clave)
  const poner = (texto) => texto.replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] !== undefined ? vars[k] : m))
  const partes = []
  const patron = /<(b|strong)>(.*?)<\/\1>|<a href="([^"]+)">(.*?)<\/a>/g
  let cursor = 0
  let m
  while ((m = patron.exec(plantilla)) !== null) {
    if (m.index > cursor) partes.push(poner(plantilla.slice(cursor, m.index)))
    if (m[1]) partes.push(<strong key={m.index}>{poner(m[2])}</strong>)
    else partes.push(<Link key={m.index} to={aRuta(m[3])}>{poner(m[4])}</Link>)
    cursor = m.index + m[0].length
  }
  if (cursor < plantilla.length) partes.push(poner(plantilla.slice(cursor)))
  return <>{partes}</>
}

export default TextoRico
