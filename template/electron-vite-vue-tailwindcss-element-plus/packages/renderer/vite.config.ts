import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import resolve from 'vite-plugin-resolve';
import electron from 'vite-plugin-electron/renderer';
import pkg from '../../package.json';
import vueI18n from '@intlify/vite-plugin-vue-i18n';
import path from 'path';

export default defineConfig({
  mode: process.env.NODE_ENV,
  root: __dirname,
  plugins: [
    vue(),
    electron(),
    vueI18n({
      include: path.resolve(__dirname, './src/locales/**'),
    }),
  ],
  base: './',
  build: {
    emptyOutDir: true,
    sourcemap: true,
    outDir: '../../dist/renderer',
  },
  server: {
    host: pkg.env.VITE_DEV_SERVER_HOST,
    port: pkg.env.VITE_DEV_SERVER_PORT,
  },


});
