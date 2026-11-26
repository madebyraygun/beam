import '../dist/css/default.css';
import './second-theme.css';
import { html, render } from 'lit';
import '../src/index.js';
import { dispatchToast } from '../src/index.js';

const items = [
  { id: 'board', label: 'Board', icon: 'wc-icon-dashboard' },
  { id: 'list', label: 'List', icon: 'wc-icon-register' },
];

render(
  html`
    <wc-app-shell
      workspace-name="Example board"
      workspace-key="example"
      screen-title="Board"
      .trail=${[{ label: 'Board' }]}
      .statusSegments=${[{ id: 'count', label: '12 records' }]}
    >
      <wc-nav-sidebar slot="sidebar" product-name="example" .items=${items} active="board"></wc-nav-sidebar>
      <div>
        <wc-monogram name="Example board" seed="example" size="l"></wc-monogram>
        <wc-icon-search id="icon"></wc-icon-search>
      </div>
    </wc-app-shell>
  `,
  document.body,
);

await customElements.whenDefined('wc-app-shell');
await (document.querySelector('wc-app-shell') as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
dispatchToast(window, { message: 'Saved.', duration: 0 });
await new Promise((resolve) => requestAnimationFrame(resolve));
(window as unknown as { ready: boolean }).ready = true;
