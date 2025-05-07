// vite.config.js
import path from 'path';
import vitePugPlugin from 'vite-plugin-pug-transformer';
import packagejson from './package.json';

export default {
  root: 'src/renderer',
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  publicDir: path.resolve(__dirname, 'public'),
  server: {
    port: 1234,
    strictPort: true,
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  plugins: [
    vitePugPlugin({ pugLocals: {
      // sections_meta,
      package: packagejson
    }})
  ]
};
