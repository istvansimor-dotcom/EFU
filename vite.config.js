import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/EFU/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
