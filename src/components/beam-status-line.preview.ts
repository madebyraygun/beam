import { html, type TemplateResult } from 'lit';
import './beam-status-line.js';
import { demoSegments } from './__mocks__/status.js';
import type { Preview } from '../../preview/types.js';

const wide = (inner: TemplateResult) =>
  html`<div style="width:min(1100px, calc(100vw - 32px));">${inner}</div>`;

const preview: Preview = {
  id: 'beam-status-line',
  title: 'Status Line',
  group: 'Layout',
  description:
    'The floating bar under the content: the name, then the segments the app passes. Shown here with an example app\'s: folder, lock state, waiting count, palette hint and version. Hidden below the mobile breakpoint.',
  layout: 'stack',
  states: [
    {
      name: 'encrypted',
      render: () =>
        wide(
          html`<beam-status-line
            workspace-name="Acme Consulting LLC"
            workspace-key="acme"
            .segments=${demoSegments({ path: '~/work/acme-consulting', waitingCount: 84, version: '1.0', encrypted: true })}
          ></beam-status-line>`,
        ),
    },
    {
      name: 'not encrypted',
      render: () =>
        wide(
          html`<beam-status-line
            workspace-name="Juniper Labs"
            workspace-key="juniper"
            .segments=${demoSegments({ path: '~/work/juniper-labs', waitingCount: 12, version: '1.0' })}
          ></beam-status-line>`,
        ),
    },
    {
      name: 'nothing waiting',
      render: () =>
        wide(
          html`<beam-status-line
            workspace-name="Acme Consulting LLC"
            workspace-key="acme"
            .segments=${demoSegments({ path: '~/work/acme-consulting', waitingCount: 0, version: '1.0', encrypted: true })}
          ></beam-status-line>`,
        ),
    },
    {
      name: 'long path',
      render: () =>
        html`<div style="width:640px;">
          <beam-status-line
            workspace-name="Harbor & Vale Architecture and Interiors Partnership"
            workspace-key="harbor"
            .segments=${demoSegments({ path: '~/work/projects/harbor-and-vale/architecture-and-interiors/archive/current-year', waitingCount: 3, version: '1.0', encrypted: true })}
          ></beam-status-line>
        </div>`,
    },
    {
      name: 'narrow container',
      render: () =>
        html`<div style="width:520px;">
          <beam-status-line
            workspace-name="Acme Consulting LLC"
            workspace-key="acme"
            .segments=${demoSegments({ fullPath: '/home/you/work/acme-consulting', path: '~/work/acme-consulting', waitingCount: 84, version: '1.0', encrypted: true })}
          ></beam-status-line>
        </div>`,
    },
    {
      name: 'workspace not loaded',
      render: () =>
        wide(
          html`<beam-status-line
            .segments=${demoSegments({ path: '~/work/acme-consulting', waitingCount: 84, version: '1.0', encrypted: true })}
          ></beam-status-line>`,
        ),
    },
    {
      name: 'store build',
      render: () =>
        wide(
          html`<beam-status-line
            workspace-name="Globex"
            workspace-key="globex"
            .segments=${demoSegments({ path: '~/work/globex', waitingCount: 5, version: '1.0', distribution: 'store', keyShortcuts: 'Control+K', shortcut: 'Ctrl K', encrypted: true })}
          ></beam-status-line>`,
        ),
    },
    {
      name: 'another app: a task board',
      render: () =>
        wide(
          html`<beam-status-line
            workspace-name="Example board"
            workspace-key="example"
            .segments=${[
              { id: 'count', label: '9 records' },
              { id: 'problems', tone: 'danger', label: '2 problems', navigate: 'problems' },
              { id: 'sync-state', side: 'end', tone: 'ok', label: 'Synced' },
              { id: 'sync-now', side: 'end', label: 'Sync now', action: true },
            ]}
          ></beam-status-line>`,
        ),
    },
    {
      name: 'no segments',
      render: () => wide(html`<beam-status-line workspace-name="Example board" workspace-key="example"></beam-status-line>`),
    },
  ],
};

export default preview;
