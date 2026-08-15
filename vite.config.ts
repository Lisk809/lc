import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 设计令牌（仅变量/混入，无 CSS 输出）注入所有 SCSS 块
        additionalData: `@use "@/styles/variables" as *;\n`,
        // 显式走 modern API，消除 sass 的 legacy-js-api 弃用警告（Dart Sass 2.0 将移除 legacy API）
        api: 'modern',
      },
    },
  },
  server: {
    port: 5173,
    // 若未设置 VITE_API_BASE，则走代理到本地后端
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'md-editor': ['md-editor-v3'],
          vue: ['vue', 'vue-router', 'pinia'],
          echarts: ['echarts'],
          pdfjs: ['pdfjs-dist'],
        },
      },
    },
  },
})
