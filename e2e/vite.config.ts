import { defineConfig } from 'vite';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  server: { port: 9191, strictPort: true },
});
