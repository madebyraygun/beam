import { html } from 'lit';
import './beam-input.js';
import type { Preview } from '../../preview/types.js';

const preview: Preview = {
  id: 'beam-input',
  title: 'Input',
  group: 'Controls',
  description:
    'A 36px field on --beam-color-field. Focus: an accent edge and --beam-color-ring. Error: the danger edge and ring, the message under it, and the refused value kept as typed.',
  layout: 'grid-wide',
  states: [
    { name: 'default', render: () => html`<beam-input label="Title" placeholder="Name the item"></beam-input>` },
    { name: 'filled', render: () => html`<beam-input label="Title" value="Add CSV export" hint="Shown on the card."></beam-input>` },
    { name: 'disabled', render: () => html`<beam-input label="Title" value="Add CSV export" disabled></beam-input>` },
    {
      name: 'error',
      render: () => html`<beam-input label="Estimate (hours)" value="one and a half" error="Must be a number, 0 or more."></beam-input>`,
    },
    { name: 'required', render: () => html`<beam-input label="Name" required></beam-input>` },
  ],
};

export default preview;
