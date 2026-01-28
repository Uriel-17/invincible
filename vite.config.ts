import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-vite-plugin'
import path from 'path'

export default defineConfig({
  plugins: [tanstackRouter(), react()],
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.ts',
  },
})
