import path from 'path';
import vitePugPlugin from 'vite-plugin-pug-transformer';
import packagejson from './package.json';

export default {
  root: 'src/renderer',
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
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
  ],
  optimizeDeps: {
    exclude: ['electron']
  }
};
