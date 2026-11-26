import { html } from 'lit';
import './beam-dialog.js';
import './beam-button.js';
import './beam-input.js';
import type { Preview } from '../../preview/types.js';

const preview: Preview = {
  id: 'beam-dialog',
  title: 'Dialog',
  group: 'Controls',
  description:
    'The native dialog, modal: 440 wide for a confirm, 620 for a form. Escape and Cancel close it; the primary action is on the right; focus starts on the first field, or on Cancel for a destructive confirm.',
  layout: 'stack',
  states: [
    {
      name: 'confirm',
      render: () => html`<beam-dialog label="Delete this item?" open>
        <p>The file items/T-7K3FQ2.md is removed at the next sync. It stays in the repository's history.</p>
        <beam-button slot="footer" autofocus>Cancel</beam-button>
        <beam-button slot="footer" variant="danger">Delete item</beam-button>
      </beam-dialog>`,
    },
    {
      name: 'form',
      render: () => html`<beam-dialog label="Rename view" size="form" open>
        <beam-input label="Name" value="Due this week" hint="Saved to _views/due-this-week.yaml"></beam-input>
        <beam-button slot="footer">Cancel</beam-button>
        <beam-button slot="footer" variant="primary" loading>Saving</beam-button>
      </beam-dialog>`,
    },
  ],
};

export default preview;
