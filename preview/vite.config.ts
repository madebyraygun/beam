import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { previewsJsonPlugin } from './previews-json-plugin.js';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  server: { port: 9090 },
  plugins: [previewsJsonPlugin(resolve(here, '../src'))],
});
