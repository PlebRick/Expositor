/* vite.config.ts  – project root */
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  /** Your real source root (= where index.html lives) */
  root: 'src',

  /** Static files (icons, manifest.json, etc.) still live in /public */
  publicDir: resolve(__dirname, 'public'),

  build: {
    /** Bundle goes to project-root/dist (one level up from src) */
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')   // so `import '@/utils/foo'` still works
    }
  }
});
