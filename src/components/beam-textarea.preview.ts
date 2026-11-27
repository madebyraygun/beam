import { html } from 'lit';
import './beam-textarea.js';
import type { Preview } from '../../preview/types.js';

const preview: Preview = {
  id: 'beam-textarea',
  title: 'Textarea',
  group: 'Controls',
  description: 'As Input; grows with its text up to 12 lines, then scrolls. The text is kept exactly as typed.',
  layout: 'grid-wide',
  states: [
    { name: 'default', render: () => html`<beam-textarea label="Until it's answered, I'm going with" placeholder="What you'll do meanwhile"></beam-textarea>` },
    {
      name: 'filled',
      render: () => html`<beam-textarea label="Until it's answered, I'm going with" value=${'Initials, with the name on hover.\nThe full name in the record.'}></beam-textarea>`,
    },
    { name: 'disabled', render: () => html`<beam-textarea label="Until it's answered, I'm going with" value="Initials, with the name on hover." disabled></beam-textarea>` },
    { name: 'error', render: () => html`<beam-textarea label="Until it's answered, I'm going with" error="A default is needed."></beam-textarea>` },
  ],
};

export default preview;
