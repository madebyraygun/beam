import { html } from 'lit';
import './beam-button.js';
import type { Preview } from '../../preview/types.js';

const row = (variant: string, label: string, busy: string) => html`<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
  <beam-button variant=${variant}>${label}</beam-button>
  <beam-button variant=${variant} disabled>${label}</beam-button>
  <beam-button variant=${variant} loading>${busy}</beam-button>
  <beam-button variant=${variant} size="touch">${label}</beam-button>
  <beam-button variant=${variant} size="s">${label}</beam-button>
</div>`;

const preview: Preview = {
  id: 'beam-button',
  title: 'Button',
  group: 'Controls',
  description:
    'A pill --beam-control-height tall. Primary, secondary, danger, ghost and icon; default, disabled, loading (keeps its width, spinner for the icon, not pressable), touch (44px) and small.',
  layout: 'stack',
  states: [
    { name: 'primary', render: () => row('primary', 'Save answer', 'Saving') },
    { name: 'secondary', render: () => row('secondary', 'Cancel', 'Syncing') },
    { name: 'danger', render: () => row('danger', 'Delete item', 'Deleting') },
    { name: 'ghost', render: () => row('ghost', 'Show more', 'Loading') },
    {
      name: 'icon',
      render: () => html`<div style="display:flex;gap:12px">
        <beam-button variant="icon" label="Refresh"><svg slot="icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg></beam-button>
        <beam-button variant="icon" label="Refresh" disabled><svg slot="icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg></beam-button>
      </div>`,
    },
  ],
};

export default preview;
