import { html } from 'lit';
import './beam-switch.js';
import type { Preview } from '../../preview/types.js';

const preview: Preview = {
  id: 'beam-switch',
  title: 'Switch',
  group: 'Controls',
  description: '38 × 22. The track is --beam-color-border off and --beam-color-accent on. The label is part of the target.',
  states: [
    { name: 'off', render: () => html`<beam-switch>Blocked</beam-switch>` },
    { name: 'on', render: () => html`<beam-switch checked>Blocked</beam-switch>` },
    { name: 'disabled', render: () => html`<beam-switch checked disabled>Blocked</beam-switch>` },
    { name: 'loading', render: () => html`<beam-switch checked loading>Blocked</beam-switch>` },
  ],
};

export default preview;
