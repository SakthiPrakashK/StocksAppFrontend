import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Only proxy /stocks/:symbol requests (with a symbol parameter)
      // Don't proxy /stocks alone as that's the React Stocks listing page
      '^/stocks/[A-Z0-9&-]+$': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})


