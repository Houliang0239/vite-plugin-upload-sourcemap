import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import viteUploadSourceMap from 'vite-plugin-upload-sourcemap';
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
    viteUploadSourceMap({
      appCode: '262477e0-b734-11ed-8201-353d4ba229b3',
      appVersion: 'v0.0.2',
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
