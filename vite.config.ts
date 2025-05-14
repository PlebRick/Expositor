/* vite.config.ts – drop this in project root */
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',               // project root (default)
  publicDir: 'public',      // static assets
  build: {
    outDir: 'dist',         // make sure everything bundles to /dist
    emptyOutDir: true,      // wipe dist on each build
    sourcemap: true         // helpful for debugging prod bundle
  },
  resolve: {
    alias: {
      '@': '/src'           // so you can import '@/utils/xxx'
    }
  }
});
