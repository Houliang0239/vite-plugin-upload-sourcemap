import { defineConfig } from 'vite';
const config = {
  build: {
    target: 'es2015',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: 'src/index.ts',
    },
  },
};
export default defineConfig({
  ...config,
});
