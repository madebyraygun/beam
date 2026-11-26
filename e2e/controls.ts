import '../dist/css/default.css';
import { html, render } from 'lit';
import '../src/index.js';

const people = [
  { value: 'ana', label: 'Ana', badge: 'AN' },
  { value: 'sam', label: 'Sam', badge: 'SA' },
  { value: 'samira', label: 'Samira', badge: 'SM' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: `p${i}`, label: `Person ${i}` })),
];

render(
  html`<main style="padding:24px;max-width:520px;display:grid;gap:16px;font-family:var(--beam-font-family)">
    <h1>Controls</h1>
    <form id="form">
      <beam-input name="title" label="Title" value="Add CSV export"></beam-input>
      <beam-input name="estimate" label="Estimate" type="number"></beam-input>
      <beam-textarea name="body" label="Body" value="Two"></beam-textarea>
      <beam-select name="priority" label="Priority"><option value="high">High</option><option value="low" selected>Low</option></beam-select>
      <beam-switch name="blocked">Blocked</beam-switch>
      <beam-radio-group name="when" label="When" value="soon"><option value="now">Now</option><option value="soon">Soon</option><option value="later">Later</option></beam-radio-group>
      <beam-radio-group name="size" label="Size" variant="segmented" value="m"><option value="s">S</option><option value="m">M</option><option value="l">L</option></beam-radio-group>
      <beam-combobox id="who" name="who" label="Assignee" .options=${people}></beam-combobox>
      <fieldset id="locked"><legend>Locked</legend><beam-input name="locked" label="Locked field"></beam-input></fieldset>
      <beam-button type="reset" id="undo">Reset</beam-button>
      <beam-button type="submit" variant="primary" id="keep">Save</beam-button>
    </form>
    <form id="needs"><beam-input name="name" label="Name" required></beam-input><beam-button type="submit" id="needs-save">Save</beam-button></form>
    <beam-button id="open">Delete…</beam-button>
    <beam-dialog id="confirm" label="Delete this item?">
      <p>The file is removed at the next sync.</p>
      <beam-button slot="footer" id="cancel" autofocus>Cancel</beam-button>
      <beam-button slot="footer" variant="danger" id="delete">Delete item</beam-button>
    </beam-dialog>
    <beam-dialog id="rename" label="Rename view" size="form">
      <beam-input id="rename-name" label="Name" value="Due this week"></beam-input>
      <beam-button slot="footer">Cancel</beam-button>
      <beam-button slot="footer" variant="primary">Save</beam-button>
    </beam-dialog>
  </main>`,
  document.body,
);

const submitted: Record<string, string>[] = [];
for (const form of document.querySelectorAll('form')) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitted.push(Object.fromEntries(new FormData(form)) as Record<string, string>);
  });
}
const open = document.querySelector('#open')!;
open.addEventListener('click', () => (document.querySelector('#confirm') as HTMLElement & { show(): void }).show());
document.querySelector('#cancel')!.addEventListener('click', () =>
  (document.querySelector('#confirm') as HTMLElement & { requestClose(v?: string): void }).requestClose('cancel'),
);

Object.assign(window, { submitted });
await customElements.whenDefined('beam-combobox');
await new Promise((resolve) => requestAnimationFrame(resolve));
(window as unknown as { ready: boolean }).ready = true;
