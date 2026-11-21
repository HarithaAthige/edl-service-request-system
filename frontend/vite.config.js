import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8280',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/requestapi/1.0.0'),
          headers: { Authorization: `Bearer ${env.WSO2_TOKEN}` },
        },
      },
    },
  }
})
