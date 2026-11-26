import '../dist/css/default.css';
import { initColorMode } from '../src/theme/index.js';
import { loadPreviews } from './manifest.js';
import { DEMO_STORAGE_KEY } from './app/preview-app.js';

initColorMode({ storageKey: DEMO_STORAGE_KEY });

const previews = loadPreviews();
const app = document.createElement('preview-app');
(app as HTMLElement & { previews: typeof previews }).previews = previews;
document.body.appendChild(app);
