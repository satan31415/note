import { builtinModules } from 'module';
import { defineConfig } from 'vite';
import pkg from '../../package.json';

export default defineConfig({
  root: __dirname,
  define: {
    'process.env.MAIN_APP_REQUEST_BASE_URL': JSON.stringify('https://api.uptmr.com/upupmo-java'),
    'process.env.MAIN_APP_CURRENT_VERSION_NUM': JSON.stringify('1681031645000'),
    'process.env.MAIN_APP_S1': JSON.stringify('zChHWKyPnqmujLBuRZrWTA=='),
    'process.env.MAIN_APP_NAME': JSON.stringify('UPTMRSoftware'),
  },
  build: {
    outDir: '../../dist/main',
    emptyOutDir: true,
    minify: process.env.NODE_ENV === 'production',
    sourcemap: true,
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
      fileName: () => '[name].cjs',
    },
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {}),
      ],
    },
  },
});
