import { html, type TemplateResult } from 'lit';
import './wc-status-line.js';
import { demoSegments } from './__mocks__/status.js';
import type { Preview } from '../../preview/types.js';

const wide = (inner: TemplateResult) =>
  html`<div style="width:min(1100px, calc(100vw - 32px));">${inner}</div>`;

const preview: Preview = {
  id: 'wc-status-line',
  title: 'Status Line',
  group: 'Layout',
  description:
    'The floating bar under the content: the name, then the segments the app passes. Shown here with an example app\'s: folder, lock state, review count, palette hint and version. Hidden below the mobile breakpoint.',
  layout: 'stack',
  states: [
    {
      name: 'encrypted',
      render: () =>
        wide(
          html`<wc-status-line
            workspace-name="Acme Consulting LLC"
            workspace-key="acme"
            .segments=${demoSegments({ path: '~/work/acme-consulting', reviewCount: 84, version: '1.0', encrypted: true })}
          ></wc-status-line>`,
        ),
    },
    {
      name: 'not encrypted',
      render: () =>
        wide(
          html`<wc-status-line
            workspace-name="Juniper Labs"
            workspace-key="juniper"
            .segments=${demoSegments({ path: '~/work/juniper-labs', reviewCount: 12, version: '1.0' })}
          ></wc-status-line>`,
        ),
    },
    {
      name: 'nothing to review',
      render: () =>
        wide(
          html`<wc-status-line
            workspace-name="Acme Consulting LLC"
            workspace-key="acme"
            .segments=${demoSegments({ path: '~/work/acme-consulting', reviewCount: 0, version: '1.0', encrypted: true })}
          ></wc-status-line>`,
        ),
    },
    {
      name: 'long path',
      render: () =>
        html`<div style="width:640px;">
          <wc-status-line
            workspace-name="Harbor & Vale Architecture and Interiors Partnership"
            workspace-key="harbor"
            .segments=${demoSegments({ path: '~/work/clients/harbor-and-vale/architecture-and-interiors/archive/current-year', reviewCount: 3, version: '1.0', encrypted: true })}
          ></wc-status-line>
        </div>`,
    },
    {
      name: 'narrow container',
      render: () =>
        html`<div style="width:520px;">
          <wc-status-line
            workspace-name="Acme Consulting LLC"
            workspace-key="acme"
            .segments=${demoSegments({ fullPath: '/home/you/work/acme-consulting', path: '~/work/acme-consulting', reviewCount: 84, version: '1.0', encrypted: true })}
          ></wc-status-line>
        </div>`,
    },
    {
      name: 'workspace not loaded',
      render: () =>
        wide(
          html`<wc-status-line
            .segments=${demoSegments({ path: '~/work/acme-consulting', reviewCount: 84, version: '1.0', encrypted: true })}
          ></wc-status-line>`,
        ),
    },
    {
      name: 'store build',
      render: () =>
        wide(
          html`<wc-status-line
            workspace-name="Globex"
            workspace-key="globex"
            .segments=${demoSegments({ path: '~/work/globex', reviewCount: 5, version: '1.0', distribution: 'store', keyShortcuts: 'Control+K', shortcut: 'Ctrl K', encrypted: true })}
          ></wc-status-line>`,
        ),
    },
    {
      name: 'another app: a task board',
      render: () =>
        wide(
          html`<wc-status-line
            workspace-name="Example board"
            workspace-key="example"
            .segments=${[
              { id: 'count', label: '9 records' },
              { id: 'problems', tone: 'danger', label: '2 problems', navigate: 'problems' },
              { id: 'sync-state', side: 'end', tone: 'ok', label: 'Synced' },
              { id: 'sync-now', side: 'end', label: 'Sync now', action: true },
            ]}
          ></wc-status-line>`,
        ),
    },
    {
      name: 'no segments',
      render: () => wide(html`<wc-status-line workspace-name="Example board" workspace-key="example"></wc-status-line>`),
    },
  ],
};

export default preview;
