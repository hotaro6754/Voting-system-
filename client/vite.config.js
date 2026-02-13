import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', 'axios'],
          'firebase': ['firebase/app', 'firebase/firestore'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'ui': ['framer-motion', 'lucide-react']
        }
      }
    }
  }
})
