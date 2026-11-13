import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages (https://taleb2030.github.io/L-endroit-parfait/) sets VITE_BASE in CI.
// Netlify, Vercel and local builds serve from the domain root.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
