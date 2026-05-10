import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 捕获前端 /api/chat 的请求
      '/api/chat': {
        target: 'https://api.onelinkai.cloud',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/v1/chat/completions'),
        headers: {
          'Authorization': 'Bearer sk-ola-v1-Et1otSsL9KpkC55fNm0XGn6aSIaJ9qoFXnssLvtvckiN1bY8qw3m0NHtYBGltrwj' 
        }
      }
    }
  }
})