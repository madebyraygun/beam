import '../dist/css/default.css';
import './second-theme.css';
import { html, render } from 'lit';
import '../src/index.js';
import { dispatchToast } from '../src/index.js';
import { applyMode, initColorMode, writeMode } from '../src/theme/index.js';

const items = [
  { id: 'board', label: 'Board', icon: 'beam-icon-dashboard' },
  { id: 'list', label: 'List', icon: 'beam-icon-flag' },
];

render(
  html`
    <beam-app-shell
      workspace-name="Example board"
      workspace-key="example"
      screen-title="Board"
      .trail=${[{ label: 'Board' }]}
      .statusSegments=${[{ id: 'count', label: '12 records' }]}
    >
      <beam-nav-sidebar slot="sidebar" product-name="example" .items=${items} active="board"></beam-nav-sidebar>
      <div>
        <beam-monogram name="Example board" seed="example" size="l"></beam-monogram>
        <beam-icon-search id="icon"></beam-icon-search>
      </div>
    </beam-app-shell>
  `,
  document.body,
);

await customElements.whenDefined('beam-app-shell');
await (document.querySelector('beam-app-shell') as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
dispatchToast(window, { message: 'Saved.', duration: 0 });
await new Promise((resolve) => requestAnimationFrame(resolve));
Object.assign(window, { colorMode: { applyMode, initColorMode, writeMode } });
(window as unknown as { ready: boolean }).ready = true;
