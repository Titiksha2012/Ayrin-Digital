import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For GitHub Pages: base should be '/your-repo-name/'
// For custom domain or Vercel/Netlify: base should be '/'
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/Ayrin-Digital/' : '/'),
})
