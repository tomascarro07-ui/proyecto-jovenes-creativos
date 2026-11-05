import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Inicio from './pages/Inicio'
import Museos from './pages/Museos'
import MuseoDetalle from './pages/MuseoDetalle'
import Charlas from './pages/Charlas'
import CharlaDetalle from './pages/CharlaDetalle'
import Cursos from './pages/Cursos'
import TallerDetalle from './pages/TallerDetalle'
import Recorridos from './pages/Recorridos'
import RecorridoDetalle from './pages/RecorridoDetalle'
import Calendario from './pages/Calendario'
import Mapa from './pages/Mapa'
import Recursos from './pages/Recursos'
import Buscar from './pages/Buscar'
import Nosotros from './pages/Nosotros'
import Contacto from './pages/Contacto'
import Login from './pages/Login'
import Registro from './pages/Registro'
import VerificarCorreo from './pages/VerificarCorreo'
import OlvideContrasenia from './pages/OlvideContrasenia'
import RestablecerContrasenia from './pages/RestablecerContrasenia'
import Cuenta from './pages/Cuenta'
import MisInscripciones from './pages/MisInscripciones'
import Admin from './pages/Admin'
import Sudamtex from './pages/Sudamtex'
import ContactoSudamtex from './pages/ContactoSudamtex'
import NoEncontrada from './pages/NoEncontrada'

// Mapa de rutas del sitio. Las páginas de detalle reciben el id en la URL (por ejemplo /charlas/123);
// antes iba como parámetro (charla-detalle.html?idCharla=123).
function App() {
  return (
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
        {/* Los correos que envía el servidor todavía traen la dirección con ".html": estas rutas la aceptan */}
        <Route path="/verificar-correo.html" element={<VerificarCorreo />} />
        <Route path="/restablecer-contrasenia.html" element={<RestablecerContrasenia />} />
        <Route path="/cuenta" element={<Cuenta />} />
        <Route path="/mis-inscripciones" element={<MisInscripciones />} />
        <Route path="/admin" element={<Admin />} />
        {/* Cualquier otra dirección: página 404 */}
        <Route path="*" element={<NoEncontrada />} />
      </Route>
      {/* Proyecto Sudamtex: tiene su propio encabezado, pie y diseño */}
      <Route path="/sudamtex" element={<Sudamtex />} />
      <Route path="/contacto-sudamtex" element={<ContactoSudamtex />} />
    </Routes>
  )
}

export default App
