import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Backend URL
const backendUrl = process.env.VITE_BACKEND_URL || 'https://oro-kmuj.onrender.com';

// Rewrite /terms, /privacy, /cookies to the standalone HTML files in dev
const legalPagePlugin = {
  name: 'legal-page-rewrites',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const map = {
        '/terms':   '/Oro_Terms_of_Service.html',
        '/privacy': '/Oro_Privacy_Policy.html',
        '/cookies': '/Oro_Cookie_Policy.html',
      }
      if (map[req.url]) req.url = map[req.url]
      next()
    })
  },
}

export default defineConfig({
  plugins: [react(), legalPagePlugin],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': backendUrl,
      '/static': backendUrl,
    }
  }
})
