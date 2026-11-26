import { html } from 'lit';
import './beam-breadcrumb.js';
import type { Preview } from '../../preview/types.js';

const preview: Preview = {
  id: 'beam-breadcrumb',
  title: 'Breadcrumb',
  group: 'Layout',
  description:
    'Where the user is: the open workspace (monogram, name, chevron — opens the palette), then the screen, then any level below it.',
  states: [
    {
      name: 'screen',
      render: () =>
        html`<beam-breadcrumb
          workspace-name="Acme Consulting LLC"
          workspace-key="acme"
          .trail=${[{ label: 'Dashboard' }]}
        ></beam-breadcrumb>`,
    },
    {
      name: 'item detail',
      render: () =>
        html`<beam-breadcrumb
          workspace-name="Acme Consulting LLC"
          workspace-key="acme"
          .trail=${[{ label: 'Orders', id: 'orders' }, { label: '#1254' }]}
        ></beam-breadcrumb>`,
    },
    {
      name: 'another workspace',
      render: () =>
        html`<beam-breadcrumb
          workspace-name="Juniper Labs"
          workspace-key="juniper"
          .trail=${[{ label: 'Items' }]}
        ></beam-breadcrumb>`,
    },
    {
      name: 'long name in a narrow box',
      render: () =>
        html`<div style="width:260px;">
          <beam-breadcrumb
            workspace-name="Harbor & Vale Architecture and Interiors Partnership"
            workspace-key="harbor"
            .trail=${[{ label: 'Checks' }]}
          ></beam-breadcrumb>
        </div>`,
    },
  ],
};

export default preview;
