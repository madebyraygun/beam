import { html } from 'lit';
import './beam-radio-group.js';
import type { Preview } from '../../preview/types.js';

const choices = html`<option value="blocking">Blocking</option><option value="soon">Soon</option><option value="whenever">Whenever</option>`;

const preview: Preview = {
  id: 'beam-radio-group',
  title: 'Radio group',
  group: 'Controls',
  description: 'A fieldset with a legend; the arrow keys move the choice. Segmented: the same control, side by side.',
  layout: 'grid-wide',
  states: [
    { name: 'default', render: () => html`<beam-radio-group label="Priority" value="soon">${choices}</beam-radio-group>` },
    { name: 'touch', render: () => html`<beam-radio-group label="Priority" value="soon" size="touch">${choices}</beam-radio-group>` },
    { name: 'disabled', render: () => html`<beam-radio-group label="Priority" value="soon" disabled>${choices}</beam-radio-group>` },
    { name: 'error', render: () => html`<beam-radio-group label="Priority" error="Choose one.">${choices}</beam-radio-group>` },
    { name: 'segmented', render: () => html`<beam-radio-group label="Priority" value="blocking" variant="segmented">${choices}</beam-radio-group>` },
  ],
};

export default preview;
