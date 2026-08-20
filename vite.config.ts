import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Enable relative asset paths for easy local viewing
  server: {
    port: 3000,
    host: true
  }
})
