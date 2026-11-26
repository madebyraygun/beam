import { html } from 'lit';
import './beam-monogram.js';
import type { Preview } from '../../preview/types.js';

const CAST = [
  'Acme Consulting LLC',
  'Cedar Systems',
  'Juniper Labs',
  'Harbor & Vale',
  'Globex',
  'Initech, Inc.',
];

const row = (size: 's' | 'l') => html`
  <div style="display:flex;flex-wrap:wrap;gap:16px;">
    ${CAST.map(
      (name) =>
        html`<span style="display:inline-flex;align-items:center;gap:8px;">
          <beam-monogram name=${name} seed=${name} size=${size}></beam-monogram>
          <span>${name}</span>
        </span>`,
    )}
  </div>
`;

const preview: Preview = {
  id: 'beam-monogram',
  title: 'Monogram',
  group: 'Layout',
  description:
    'A name’s initials on a tinted tile. The tone is picked by hashing a stable key, so a name keeps it.',
  states: [
    { name: 'breadcrumb size', render: () => row('s') },
    { name: 'card size', render: () => row('l') },
  ],
};

export default preview;
