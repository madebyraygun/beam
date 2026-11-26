import { html } from 'lit';
import './beam-combobox.js';
import type { Preview } from '../../preview/types.js';
import type { ComboOption } from './beam-combobox.js';

const people: ComboOption[] = [
  { value: 'ana', label: 'Ana', badge: 'AN', color: 'var(--beam-tone-1)' },
  { value: 'sam', label: 'Sam', badge: 'SA', color: 'var(--beam-tone-3)' },
];

const preview: Preview = {
  id: 'beam-combobox',
  title: 'Combobox',
  group: 'Controls',
  description:
    'A text field with a list under it, for long or searchable lists. Typing filters; ↑↓ move the highlight, ↵ picks, Esc closes. Eight rows, then it scrolls.',
  layout: 'grid-wide',
  states: [
    { name: 'default', render: () => html`<beam-combobox label="Assignee" value="sam" .options=${people}></beam-combobox>` },
    { name: 'empty', render: () => html`<beam-combobox label="Assignee" placeholder="No assignee" .options=${people}></beam-combobox>` },
    { name: 'disabled', render: () => html`<beam-combobox label="Assignee" value="sam" disabled .options=${people}></beam-combobox>` },
    {
      name: 'error',
      render: () => html`<beam-combobox label="Assignee" value="[[sammy]]" error="No person sammy." .options=${people}></beam-combobox>`,
    },
  ],
};

export default preview;
