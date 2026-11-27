import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from https://anshraj6200.github.io/resumefit/
export default defineConfig({
  base: '/resumefit/',
  plugins: [react()],
})
