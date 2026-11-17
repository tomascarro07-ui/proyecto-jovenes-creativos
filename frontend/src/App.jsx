import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import CargandoPagina from './components/CargandoPagina'
import ScrollArriba from './components/ScrollArriba'
import Inicio from './pages/Inicio'

const Museos = lazy(() => import('./pages/Museos'))
const MuseoDetalle = lazy(() => import('./pages/MuseoDetalle'))
const Charlas = lazy(() => import('./pages/Charlas'))
const CharlaDetalle = lazy(() => import('./pages/CharlaDetalle'))
const Cursos = lazy(() => import('./pages/Cursos'))
const TallerDetalle = lazy(() => import('./pages/TallerDetalle'))
const Recorridos = lazy(() => import('./pages/Recorridos'))
const RecorridoDetalle = lazy(() => import('./pages/RecorridoDetalle'))
const Calendario = lazy(() => import('./pages/Calendario'))
const Mapa = lazy(() => import('./pages/Mapa'))
const Recursos = lazy(() => import('./pages/Recursos'))
const Buscar = lazy(() => import('./pages/Buscar'))
const Nosotros = lazy(() => import('./pages/Nosotros'))
const Contacto = lazy(() => import('./pages/Contacto'))
const Login = lazy(() => import('./pages/Login'))
const Registro = lazy(() => import('./pages/Registro'))
const VerificarCorreo = lazy(() => import('./pages/VerificarCorreo'))
const OlvideContrasenia = lazy(() => import('./pages/OlvideContrasenia'))
const RestablecerContrasenia = lazy(() => import('./pages/RestablecerContrasenia'))
const Cuenta = lazy(() => import('./pages/Cuenta'))
const MisInscripciones = lazy(() => import('./pages/MisInscripciones'))
const Admin = lazy(() => import('./pages/Admin'))
const Sudamtex = lazy(() => import('./pages/Sudamtex'))
const ContactoSudamtex = lazy(() => import('./pages/ContactoSudamtex'))
const NoEncontrada = lazy(() => import('./pages/NoEncontrada'))

function App() {
  return (
    <>
      <ScrollArriba />
      <Suspense fallback={<CargandoPagina />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/museos" element={<Museos />} />
            <Route path="/museos/:idMuseo" element={<MuseoDetalle />} />
            <Route path="/charlas" element={<Charlas />} />
            <Route path="/charlas/:idCharla" element={<CharlaDetalle />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/cursos/:idTaller" element={<TallerDetalle />} />
            <Route path="/recorridos" element={<Recorridos />} />
            <Route path="/recorridos/:idRecorrido" element={<RecorridoDetalle />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/recursos" element={<Recursos />} />
            <Route path="/buscar" element={<Buscar />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/verificar-correo" element={<VerificarCorreo />} />
            <Route path="/olvide-contrasenia" element={<OlvideContrasenia />} />
            <Route path="/restablecer-contrasenia" element={<RestablecerContrasenia />} />
            <Route path="/verificar-correo.html" element={<VerificarCorreo />} />
            <Route path="/restablecer-contrasenia.html" element={<RestablecerContrasenia />} />
            <Route path="/cuenta" element={<Cuenta />} />
            <Route path="/mis-inscripciones" element={<MisInscripciones />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NoEncontrada />} />
          </Route>
          <Route path="/sudamtex" element={<Sudamtex />} />
          <Route path="/contacto-sudamtex" element={<ContactoSudamtex />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
