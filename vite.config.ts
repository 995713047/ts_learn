import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // GitHub Pages 项目站点部署在 /ts_learn/ 子路径下
  base: '/ts_learn/',
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: { host: true, port: 5173 },
  build: { chunkSizeWarningLimit: 2500 }
})
