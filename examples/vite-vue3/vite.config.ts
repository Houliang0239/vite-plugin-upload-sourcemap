import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import template from 'vite-plugin-template';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    vue(),
    template({
      appCode: 'c3980120-66eb-11ed-8e73-dfe2d99736d6',
      appVersion: 'v0.2',
      uploadUrl:
        'https://prism-test.ybaobx.com/api/project/uploadSourceMapFiles',
      removeSourceMap: true,
    }),
  ],
  server: {
    port: 8080,
    hmr: {
      host: 'localhost',
      port: 8080,
    },
    proxy: {
      '/api': {
        target: 'your https address',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
});
