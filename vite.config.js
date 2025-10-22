import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for GitHub Pages deployment
export default defineConfig(() => {
  const base = process.env.VITE_BASE ?? '/';

  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'docs',
      assetsDir: 'assets',
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    publicDir: 'public',
  };
});
