import { html } from 'lit';
import './beam-search-pill.js';
import type { Preview } from '../../preview/types.js';

const preview: Preview = {
  id: 'beam-search-pill',
  title: 'Search Pill',
  group: 'Layout',
  description:
    'The top bar search control. Opens the whole palette; the keycap names the shortcut.',
  states: [
    { name: 'mac', render: () => html`<beam-search-pill></beam-search-pill>` },
    {
      name: 'windows and linux',
      render: () =>
        html`<beam-search-pill shortcut="Ctrl K" key-shortcuts="Control+K"></beam-search-pill>`,
    },
  ],
};

export default preview;
