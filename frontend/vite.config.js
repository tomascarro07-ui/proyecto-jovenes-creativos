import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // el backend permite este origen por CORS
    strictPort: true, // si el 5173 está ocupado, avisa en vez de cambiar de puerto
    // Con VITE_API_URL=/api el navegador habla siempre con este mismo sitio y Vite reenvía /api al backend.
    // Así la sesión puede viajar en una cookie httpOnly (el JavaScript de la página no puede leerla).
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
