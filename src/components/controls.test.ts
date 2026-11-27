import { describe, it, expect, afterEach } from 'vitest';
import './beam-button.js';
import './beam-input.js';
import './beam-textarea.js';
import './beam-select.js';
import './beam-switch.js';
import './beam-radio-group.js';
import './beam-dialog.js';
import './beam-combobox.js';
import type { BeamCombobox } from './beam-combobox.js';
import type { BeamDialog } from './beam-dialog.js';
import { describePreviewA11y } from '../../preview/axe-suite.js';
import buttonPreview from './beam-button.preview.js';
import inputPreview from './beam-input.preview.js';
import textareaPreview from './beam-textarea.preview.js';
import selectPreview from './beam-select.preview.js';
import switchPreview from './beam-switch.preview.js';
import radioPreview from './beam-radio-group.preview.js';
import comboPreview from './beam-combobox.preview.js';

let host: HTMLElement | null = null;

async function mount(markup: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = markup;
  document.body.appendChild(host);
  await settle(host);
  return host;
}

async function settle(root: ParentNode): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await Promise.all(
      [...root.querySelectorAll('*')].map((el) => (el as unknown as { updateComplete?: Promise<unknown> }).updateComplete),
    );
  }
}

function inner<T extends Element>(el: Element, selector: string): T {
  const found = el.shadowRoot?.querySelector<T>(selector);
  if (!found) throw new Error(`no ${selector}`);
  return found;
}

function key(target: Element, name: string, init: KeyboardEventInit = {}): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, composed: true, cancelable: true, ...init }));
}

afterEach(() => {
  host?.remove();
  host = null;
});

describe('beam-button', () => {
  it('says it is busy', async () => {
    const root = await mount(`<beam-button loading>Saving</beam-button>`);
    const button = inner<HTMLButtonElement>(root.querySelector('beam-button')!, 'button');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.querySelector('.spinner')).not.toBeNull();
  });

  it('names an icon button from its label', async () => {
    const root = await mount(`<beam-button variant="icon" label="Refresh"><svg slot="icon"></svg></beam-button>`);
    expect(inner(root.querySelector('beam-button')!, 'button').getAttribute('aria-label')).toBe('Refresh');
  });
});

describe('beam-input', () => {
  it('labels its field', async () => {
    const root = await mount(`<beam-input label="Title"></beam-input>`);
    const el = root.querySelector('beam-input')!;
    expect(inner(el, 'label').getAttribute('for')).toBe('input');
    expect(inner(el, 'input').id).toBe('input');
  });
});

describe('beam-textarea', () => {
  it('keeps the text exactly as typed', async () => {
    const root = await mount(`<beam-textarea></beam-textarea>`);
    const el = root.querySelector('beam-textarea')!;
    const area = inner<HTMLTextAreaElement>(el, 'textarea');
    area.value = '# Heading\n\n- item  ';
    area.dispatchEvent(new Event('input'));
    expect(el.value).toBe('# Heading\n\n- item  ');
  });
});

describe('beam-select', () => {
  it('shows a value that is not among its options, so an error can point at it', async () => {
    const root = await mount(`<beam-select value="waiting" error="Not a status."><option value="todo">To do</option></beam-select>`);
    const select = inner<HTMLSelectElement>(root.querySelector('beam-select')!, 'select');
    expect(select.value).toBe('waiting');
  });

  it('sends change when another option is chosen', async () => {
    const root = await mount(`<beam-select><option value="a">A</option><option value="b">B</option></beam-select>`);
    const el = root.querySelector('beam-select')!;
    let changes = 0;
    el.addEventListener('change', () => changes++);
    const select = inner<HTMLSelectElement>(el, 'select');
    select.value = 'b';
    select.dispatchEvent(new Event('change'));
    expect(el.value).toBe('b');
    expect(changes).toBe(1);
  });

  it('reads options added later', async () => {
    const root = await mount(`<beam-select><option value="a">A</option></beam-select>`);
    const el = root.querySelector('beam-select')!;
    el.insertAdjacentHTML('beforeend', '<option value="b">B</option>');
    await new Promise((resolve) => setTimeout(resolve));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('option')).toHaveLength(2);
  });
});

describe('beam-switch', () => {
  it('is a checkbox with the switch role, its label part of the target', async () => {
    const root = await mount(`<beam-switch>Blocked</beam-switch>`);
    const el = root.querySelector('beam-switch')!;
    const input = inner<HTMLInputElement>(el, 'input');
    expect(input.getAttribute('role')).toBe('switch');
    expect(input.closest('label')).not.toBeNull();
    input.click();
    expect(el.checked).toBe(true);
  });

  it('refuses a press while loading', async () => {
    const root = await mount(`<beam-switch loading>Blocked</beam-switch>`);
    expect(inner<HTMLInputElement>(root.querySelector('beam-switch')!, 'input').disabled).toBe(true);
  });
});

describe('beam-radio-group', () => {
  it('is a fieldset with a legend and one radio group', async () => {
    const root = await mount(`<beam-radio-group label="Priority"><option value="a">A</option><option value="b">B</option></beam-radio-group>`);
    const el = root.querySelector('beam-radio-group')!;
    expect(inner(el, 'legend').textContent).toBe('Priority');
    const names = [...el.shadowRoot!.querySelectorAll('input')].map((input) => input.name);
    expect(new Set(names).size).toBe(1);
  });

  it('gives separate groups separate names', async () => {
    const root = await mount(`<beam-radio-group><option value="a">A</option></beam-radio-group><beam-radio-group><option value="a">A</option></beam-radio-group>`);
    const [one, two] = [...root.querySelectorAll('beam-radio-group')];
    expect(inner<HTMLInputElement>(one, 'input').name).not.toBe(inner<HTMLInputElement>(two, 'input').name);
  });

  it('takes the radio that is chosen', async () => {
    const root = await mount(`<beam-radio-group><option value="a">A</option><option value="b">B</option></beam-radio-group>`);
    const el = root.querySelector('beam-radio-group')!;
    el.shadowRoot!.querySelectorAll('input')[1].click();
    expect(el.value).toBe('b');
  });
});

describe('beam-dialog', () => {
  it('opens as a modal with its heading as its name', async () => {
    const root = await mount(`<beam-dialog label="Delete this item?"><p>Gone.</p><beam-button slot="footer" autofocus>Cancel</beam-button></beam-dialog>`);
    const el = root.querySelector('beam-dialog') as BeamDialog;
    el.show();
    await el.updateComplete;
    const dialog = inner<HTMLDialogElement>(el, 'dialog');
    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBe('title');
    expect(inner(el, '#title').textContent).toBe('Delete this item?');
  });

  it('closes on Escape unless cancel is refused', async () => {
    const root = await mount(`<beam-dialog label="Rename"></beam-dialog>`);
    const el = root.querySelector('beam-dialog') as BeamDialog;
    el.show();
    await el.updateComplete;
    let keep = true;
    el.addEventListener('cancel', (event) => keep && event.preventDefault());
    key(inner(el, 'dialog'), 'Escape');
    await el.updateComplete;
    expect(el.open).toBe(true);
    keep = false;
    el.requestClose('cancelled');
    await el.updateComplete;
    expect(inner<HTMLDialogElement>(el, 'dialog').open).toBe(false);
    expect(el.returnValue).toBe('cancelled');
  });
});

describe('beam-combobox', () => {
  const people = [
    { value: 'ana', label: 'Ana', badge: 'AN' },
    { value: 'sam', label: 'Sam', badge: 'SA' },
    { value: 'samira', label: 'Samira', badge: 'SM' },
  ];

  async function combo(attrs = ''): Promise<BeamCombobox> {
    const root = await mount(`<form><beam-combobox name="who" label="Assignee" ${attrs}></beam-combobox></form>`);
    const el = root.querySelector('beam-combobox') as BeamCombobox;
    el.options = people;
    await el.updateComplete;
    return el;
  }

  function type(el: BeamCombobox, text: string): HTMLInputElement {
    const input = inner<HTMLInputElement>(el, 'input');
    input.value = text;
    input.dispatchEvent(new Event('input'));
    return input;
  }

  it('is a combobox controlling a listbox', async () => {
    const el = await combo();
    const input = inner(el, 'input');
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-controls')).toBe('list');
    expect(inner(el, '#list').getAttribute('role')).toBe('listbox');
  });

  it('filters as typed and draws the match heavier', async () => {
    const el = await combo();
    type(el, 'sam');
    await el.updateComplete;
    const options = [...el.shadowRoot!.querySelectorAll('[role="option"]')];
    expect(options.map((o) => o.textContent?.replace(/\s+/g, ''))).toEqual(['SASam', 'SMSamira']);
    expect(options[0].querySelector('mark')?.textContent).toBe('Sam');
  });

  it('moves the highlight with the arrows, picks with Enter, and submits the value', async () => {
    const el = await combo();
    const input = type(el, 'sam');
    await el.updateComplete;
    key(input, 'ArrowDown');
    await el.updateComplete;
    expect(input.getAttribute('aria-activedescendant')).toBe('option-1');
    key(input, 'Enter');
    await el.updateComplete;
    expect(el.value).toBe('samira');
    expect(input.value).toBe('Samira');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape and lets Escape through when already closed', async () => {
    const el = await combo();
    const input = type(el, 'a');
    await el.updateComplete;
    expect(input.getAttribute('aria-expanded')).toBe('true');
    let reached = 0;
    host!.addEventListener('keydown', () => reached++);
    key(input, 'Escape');
    await el.updateComplete;
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(reached).toBe(0);
    key(input, 'Escape');
    expect(reached).toBe(1);
  });

  it('says when nothing matches, and when it is loading', async () => {
    const el = await combo('no-match=\'Nobody called "{query}" in people/.\'');
    type(el, 'zed');
    await el.updateComplete;
    expect(inner(el, '.quiet').textContent).toBe('Nobody called "zed" in people/.');
    el.loading = true;
    el.loadingText = 'Finding records…';
    await el.updateComplete;
    expect(inner(el, '.quiet').textContent).toContain('Finding records…');
  });

  it('commits free text only when allowed', async () => {
    const el = await combo('allow-free');
    const input = type(el, 'zed');
    await el.updateComplete;
    key(input, 'Enter');
    expect(el.value).toBe('zed');
  });
});

for (const preview of [buttonPreview, inputPreview, textareaPreview, selectPreview, switchPreview, radioPreview, comboPreview]) {
  describePreviewA11y(preview);
}
