import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: env.BASE_PATH || '/', // Use BASE_PATH env or default to '/'
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src') // Alias '@' to 'src' directory
      }
    }
  }
})
