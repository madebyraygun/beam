import { describe, it, expect, afterEach, vi } from 'vitest';
import './beam-nav-sidebar.js';
import { BeamNavSidebar } from './beam-nav-sidebar.js';
import { describePrintHiding } from '../../preview/print-suite.js';
import { NAV_ITEMS, NAV_ITEMS_WITH_DISABLED } from './__mocks__/nav.js';
import { describePreviewA11y } from '../../preview/axe-suite.js';
import { styleText } from '../../preview/style-text.js';
import preview from './beam-nav-sidebar.preview.js';

async function mount(props: Partial<BeamNavSidebar> = {}): Promise<BeamNavSidebar> {
  const el = document.createElement('beam-nav-sidebar');
  Object.assign(el, { items: NAV_ITEMS, active: 'dashboard' }, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function button(el: BeamNavSidebar, id: string): HTMLButtonElement | null {
  return el.shadowRoot?.querySelector(`[data-nav="${id}"]`) ?? null;
}

describe('beam-nav-sidebar', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders one button per item', async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelectorAll('[data-nav]').length).toBe(NAV_ITEMS.length);
  });

  it('labels the navigation landmark', async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelector('nav')?.getAttribute('aria-label')).toBe('Primary');
  });

  it('marks the active item as the current page', async () => {
    const el = await mount({ active: 'items' });
    expect(button(el, 'items')?.getAttribute('aria-current')).toBe('page');
    expect(button(el, 'dashboard')?.getAttribute('aria-current')).toBe('false');
  });

  it('emits beam-navigate with the item id', async () => {
    const el = await mount();
    const spy = vi.fn();
    el.addEventListener('beam-navigate', spy);

    button(el, 'items')?.click();

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0].detail).toEqual({ id: 'items' });
  });

  it('bubbles and composes the event so the app can listen at the shell', async () => {
    const el = await mount();
    const spy = vi.fn();
    document.body.addEventListener('beam-navigate', spy);
    button(el, 'inbox')?.click();
    expect(spy).toHaveBeenCalledOnce();
    document.body.removeEventListener('beam-navigate', spy);
  });

  it('does not navigate from a disabled item', async () => {
    const el = await mount({ items: NAV_ITEMS_WITH_DISABLED });
    const spy = vi.fn();
    el.addEventListener('beam-navigate', spy);

    button(el, 'items')?.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('exposes disabled state to assistive tech', async () => {
    const el = await mount({ items: NAV_ITEMS_WITH_DISABLED });
    expect(button(el, 'items')?.getAttribute('aria-disabled')).toBe('true');
    expect(button(el, 'dashboard')?.getAttribute('aria-disabled')).toBe('false');
  });

  it('keeps the label reachable when collapsed', async () => {
    const el = await mount({ collapsed: true });
    // The text is hidden by CSS, so the title attribute is what is left.
    expect(button(el, 'items')?.getAttribute('title')).toBe('Items');
  });

  it('reflects collapsed so CSS can key off it', async () => {
    const el = await mount({ collapsed: true });
    expect(el.hasAttribute('collapsed')).toBe(true);
  });

  it('renders the icon element named by an item', async () => {
    const el = await mount();
    expect(button(el, 'items')?.querySelector('demo-icon-items')).toBeTruthy();
  });

  it('renders items without icons', async () => {
    const el = await mount({ items: [{ id: 'x', label: 'X' }] });
    expect(button(el, 'x')?.textContent?.trim()).toBe('X');
  });
});

describePreviewA11y(preview);

describePrintHiding(BeamNavSidebar, ':host');

describe('beam-nav-sidebar groups', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('draws the unlabelled group first, then each named one under its label', async () => {
    const el = await mount();
    const labels = [...(el.shadowRoot?.querySelectorAll('.group-label') ?? [])].map(
      (node) => node.textContent,
    );
    expect(labels).toEqual(['Data', 'Work', 'Setup']);
    const first = el.shadowRoot?.querySelector('.group ul');
    expect([...(first?.querySelectorAll('[data-nav]') ?? [])].map((b) => b.getAttribute('data-nav'))).toEqual(
      ['dashboard', 'items', 'inbox', 'activity'],
    );
  });

  it('names each labelled list by its label', async () => {
    const el = await mount();
    const list = button(el, 'orders')?.closest('ul');
    const id = list?.getAttribute('aria-labelledby');
    expect(id).toBeTruthy();
    expect(el.shadowRoot?.getElementById(id ?? '')?.textContent).toBe('Work');
  });

  it('pins Settings in the footer, below every group', async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelector('.footer [data-nav="settings"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('.groups [data-nav="settings"]')).toBeNull();
  });

  it('keeps the footer inside the Primary landmark', async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelector('nav .footer')).toBeTruthy();
  });

  it('shows the waiting count', async () => {
    const el = await mount();
    expect(button(el, 'inbox')?.querySelector('.count')?.textContent).toBe('84');
  });

  it('shows no count at zero', async () => {
    const el = await mount({
      items: NAV_ITEMS.map((item) => (item.id === 'inbox' ? { ...item, count: 0 } : item)),
    });
    expect(button(el, 'inbox')?.querySelector('.count')).toBeNull();
  });

  it('draws the active item with the rainbow hairline', () => {
    const text = styleText(BeamNavSidebar);
    expect(text).toMatch(
      /\.item\.active\s*{[^}]*padding-box,\s*var\(--beam-accent-image\) border-box/,
    );
  });
});

describe('beam-nav-sidebar header', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('carries the product name it is given', async () => {
    const el = await mount({ productName: 'example' });
    expect(el.shadowRoot?.querySelector('.head .wordmark')?.textContent).toBe('example');
  });

  it('draws no name when it is given none', async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelector('.head .wordmark')).toBeNull();
  });

  it('follows a change of name', async () => {
    const el = await mount({ productName: 'example' });
    el.productName = 'tack';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.head .wordmark')?.textContent).toBe('tack');
  });

  it('has a slot for a mark, before the name', async () => {
    const el = await mount({ productName: 'example' });
    const head = el.shadowRoot!.querySelector('.head')!;
    const slot = head.querySelector('slot[name="mark"]');
    expect(slot).not.toBeNull();
    expect(slot!.compareDocumentPosition(head.querySelector('.wordmark')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('asks to fold to the rail from its hamburger', async () => {
    const el = await mount({ collapsed: false });
    const spy = vi.fn();
    el.addEventListener('beam-sidebar-toggle', spy);
    el.shadowRoot?.querySelector<HTMLButtonElement>('.hamburger')?.click();
    expect(spy.mock.calls[0][0].detail).toEqual({ collapsed: true });
  });

  it('asks to open again from the rail', async () => {
    const el = await mount({ collapsed: true });
    const spy = vi.fn();
    el.addEventListener('beam-sidebar-toggle', spy);
    el.shadowRoot?.querySelector<HTMLButtonElement>('.hamburger')?.click();
    expect(spy.mock.calls[0][0].detail).toEqual({ collapsed: false });
  });

  it('says whether it is open', async () => {
    const el = await mount({ collapsed: true });
    expect(el.shadowRoot?.querySelector('.hamburger')?.getAttribute('aria-expanded')).toBe(
      'false',
    );
  });

  it('does not decide for itself whether it is folded', async () => {
    const el = await mount({ collapsed: false });
    el.shadowRoot?.querySelector<HTMLButtonElement>('.hamburger')?.click();
    await el.updateComplete;
    expect(el.collapsed).toBe(false);
  });

  it('folds over 180ms and stops for anyone who asked motion to stop', () => {
    const text = styleText(BeamNavSidebar);
    expect(text).toMatch(/:host\s*{[^}]*transition:\s*width var\(--beam-transition-sidebar\)/);
    expect(text).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*:host\s*{[^}]*transition:\s*none/,
    );
  });
});

describe('beam-nav-sidebar on a phone', () => {
  // jsdom has no layout engine, so the rules are read from the stylesheet text.
  const text = styleText(BeamNavSidebar);

  it('keeps its labels when it is the drawer rather than the rail', () => {
    // Collapsed means "off-canvas" at this width, not "56px of icons": the
    // shell slides the whole sidebar away, and what slides back in has room
    // for the words.
    expect(text).toMatch(
      /@media \(max-width: 48rem\)[\s\S]*:host\(\[collapsed\]\) \.label[^{]*{[^}]*display:\s*revert/,
    );
  });

  it('keeps its count and group labels when it is the drawer', () => {
    expect(text).toMatch(
      /@media \(max-width: 48rem\)[\s\S]*:host\(\[collapsed\]\) \.group-label[^{]*{[^}]*display:\s*revert/,
    );
  });

  it('keeps its full width when it is the drawer', () => {
    expect(text).toMatch(
      /@media \(max-width: 48rem\)[\s\S]*:host\(\[collapsed\]\)[^{]*{[^}]*width:\s*var\(--beam-sidebar-width/,
    );
  });
});
