import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: https://taleb2030.github.io/L-endroit-parfait/
export default defineConfig({
  base: '/L-endroit-parfait/',
  plugins: [react()],
})
