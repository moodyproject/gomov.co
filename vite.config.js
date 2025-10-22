import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for GitHub Pages deployment
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  publicDir: 'public',
})
