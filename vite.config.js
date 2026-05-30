import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: https://taleb2030.github.io/restaurant-lendroit-parfait/
export default defineConfig({
  base: '/restaurant-lendroit-parfait/',
  plugins: [react()],
})
