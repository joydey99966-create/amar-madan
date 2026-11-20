import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On the dev server the app is served at "/". On a production build for
// GitHub Pages it lives at "/amar-madan/", so assets and routes use that base.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/amar-madan/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}))
