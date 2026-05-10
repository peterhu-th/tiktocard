import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/chat': {
        target: 'https://api.onelinkai.cloud/v1/chat/completions',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/v1/chat/completions'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const API_KEY = process.env.VITE_API_KEY || 'sk-ola-v1-Et1otSsL9KpkC55fNm0XGn6aSIaJ9qoFXnssLvtvckiN1bY8qw3m0NHtYBGltrwj'
            proxyReq.setHeader('Authorization', `Bearer ${API_KEY}`)
          })
        }
      }
    }
  }
})
