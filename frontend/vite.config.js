import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  optimizeDeps: {
    include: [
      'vue',
      'pinia',
      'leaflet',
      'vue-router',
    ],
    entries: ['src/main.ts'],
  },
  server: {
    hmr: false,
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**']
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true, // Отключаем предупреждения SCSS у сторонних библиотек
      },
    },
  },
  html: {
    cspNonce: 'NGINX_CSP_NONCE',
  },
  plugins: [
    vue({ include: [/\.vue$/, /\.md$/] }),
  ],
  build: {
    sourcemap: false,
    minify: true,
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.json', '.vue'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
