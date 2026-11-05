import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './css/styles.css'
import './css/actividades.css'
import App from './App.jsx'
import SesionProvider from './context/SesionProvider.jsx'
import IdiomaProvider from './context/IdiomaProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <IdiomaProvider>
        <SesionProvider>
          <App />
        </SesionProvider>
      </IdiomaProvider>
    </BrowserRouter>
  </StrictMode>,
)
