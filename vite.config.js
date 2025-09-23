import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',
  publicDir: 'src/assets/static',
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        games: resolve(rootDir, 'games.html'),
        memory: resolve(rootDir, 'memory.html'),
        coloring: resolve(rootDir, 'coloring.html'),
        downloads: resolve(rootDir, 'downloads.html'),
      },
    },
  },
});
