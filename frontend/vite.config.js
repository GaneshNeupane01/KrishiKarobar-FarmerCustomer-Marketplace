import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Optional dev proxy to local backend; update if needed
      '/api': 'https://krishikarobar-farmercustomer-marketplace-lc3i.onrender.com',
    },
  },
})
