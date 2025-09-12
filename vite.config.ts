import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/crisis-watcher-weather-jp/',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
})

