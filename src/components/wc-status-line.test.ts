import { describe, it, expect, afterEach, vi } from 'vitest';
import './wc-status-line.js';
import { WcStatusLine } from './wc-status-line.js';
import { describePreviewA11y } from '../../preview/axe-suite.js';
import { describePrintHiding } from '../../preview/print-suite.js';
import { styleText } from '../../preview/style-text.js';
import preview from './wc-status-line.preview.js';
import { demoSegments, type DemoStatus } from './__mocks__/status.js';

/** Mount the line with an example app's segments, built from these values. */
async function mount(props: DemoStatus & { workspaceName?: string; workspaceKey?: string } = {}): Promise<WcStatusLine> {
  const el = document.createElement('wc-status-line');
  const { workspaceName = 'Acme Consulting LLC', workspaceKey = 'acme', ...status } = props;
  el.workspaceName = workspaceName;
  el.workspaceKey = workspaceKey;
  el.segments = demoSegments({
    path: '~/work/acme-consulting',
    version: '1.0',
    reviewCount: 84,
    ...status,
  });
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const text = (el: WcStatusLine): string => el.shadowRoot?.textContent?.replace(/\s+/g, ' ') ?? '';

describe('wc-status-line', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('starts with the workspace segment, with no brand block before it', async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelector('.brand')).toBeNull();
    const first = el.shadowRoot?.querySelector('.segment, .brand');
    expect(first?.classList.contains('workspace')).toBe(true);
  });

  it('names the workspace with its monogram and the folder it lives in', async () => {
    const el = await mount();
    const workspace = el.shadowRoot?.querySelector('.workspace');
    expect(workspace?.querySelector('wc-monogram')?.getAttribute('seed')).toBe('acme');
    expect(workspace?.textContent).toContain('Acme Consulting LLC');
    expect(el.shadowRoot?.querySelector('.path')?.textContent).toBe(
      '~/work/acme-consulting',
    );
  });

  it('leaves the path as selectable text rather than a control', async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelector('.path')?.tagName).toBe('SPAN');
    expect(styleText(WcStatusLine)).toMatch(/\.text\s*{[^}]*user-select:\s*text/);
  });

  it('says encrypted with a closed lock', async () => {
    const el = await mount({ encrypted: true });
    expect(text(el)).toContain('encrypted');
    expect(text(el)).not.toContain('not encrypted');
    expect(el.shadowRoot?.querySelector('wc-icon-lock')).not.toBeNull();
  });

  it('says not encrypted with an open lock', async () => {
    const el = await mount({ encrypted: false });
    expect(text(el)).toContain('not encrypted');
    expect(el.shadowRoot?.querySelector('wc-icon-lock-open')).not.toBeNull();
  });

  it('asks for the palette at the switch scope from the name', async () => {
    const el = await mount();
    const spy = vi.fn();
    document.body.addEventListener('beam-palette-open', spy);
    el.shadowRoot?.querySelector<HTMLButtonElement>('.workspace')?.click();
    document.body.removeEventListener('beam-palette-open', spy);
    expect(spy.mock.calls[0][0].detail).toEqual({ scope: 'workspaces' });
  });

  it('asks for the whole palette from the hint, spelling the chord it is given', async () => {
    const el = await mount({ shortcut: 'Ctrl K', keyShortcuts: 'Control+K' });
    const hint = [...(el.shadowRoot?.querySelectorAll('button') ?? [])].find((b) =>
      b.textContent?.includes('palette'),
    );
    expect(hint?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Ctrl K palette');
    expect(hint?.getAttribute('aria-keyshortcuts')).toBe('Control+K');
    const spy = vi.fn();
    document.body.addEventListener('beam-palette-open', spy);
    hint?.click();
    document.body.removeEventListener('beam-palette-open', spy);
    expect(spy.mock.calls[0][0].detail).toEqual({ scope: 'all' });
  });

  it('shows the review count and goes to Review when pressed', async () => {
    const el = await mount({ reviewCount: 84 });
    const button = el.shadowRoot?.querySelector<HTMLButtonElement>('.review');
    expect(button?.textContent?.replace(/\s+/g, ' ').trim()).toBe('84 to review');
    const spy = vi.fn();
    el.addEventListener('beam-navigate', spy);
    button?.click();
    expect(spy.mock.calls[0][0].detail).toEqual({ id: 'review' });
    expect(spy.mock.calls[0][0].composed).toBe(true);
  });

  it.each([0, undefined])('draws no review segment for %s', async (count) => {
    const el = await mount({ reviewCount: count });
    expect(el.shadowRoot?.querySelector('.spacer')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('.review')).toBeNull();
  });

  it('shows the version', async () => {
    const el = await mount({ version: '1.0' });
    expect(text(el)).toContain('v1.0');
  });

  it('does not double a leading v', async () => {
    const el = await mount({ version: 'v2.3.1' });
    expect(text(el)).toContain('v2.3.1');
    expect(text(el)).not.toContain('vv');
  });

  it('omits the version in a store build', async () => {
    const el = await mount({ version: '1.0', distribution: 'store' });
    expect(text(el)).not.toContain('v1.0');
  });

  it('keeps the version in any other distribution', async () => {
    const el = await mount({ version: '1.0', distribution: 'direct' });
    expect(text(el)).toContain('v1.0');
  });

  it('keeps the full folder in the path tooltip while showing the abbreviated one', async () => {
    const el = await mount({
      path: '~/work/acme-consulting',
      fullPath: '/home/you/work/acme-consulting',
    });
    const path = el.shadowRoot?.querySelector('.path');
    expect(path?.textContent).toBe('~/work/acme-consulting');
    expect(path?.getAttribute('title')).toBe('/home/you/work/acme-consulting');
  });

  it('draws no workspace segment before there is a name', async () => {
    const el = await mount({ workspaceName: '' });
    expect(el.shadowRoot?.querySelector('.workspace')).toBeNull();
    expect(el.shadowRoot?.querySelector('.path')).not.toBeNull();
  });

  it('insets the focus ring so the panel does not clip it', () => {
    expect(styleText(WcStatusLine)).toMatch(
      /button\.segment:focus-visible\s*{[^}]*outline-offset:\s*-2px/,
    );
  });

  it('drops the version, then the palette hint, as the line narrows', () => {
    const css = styleText(WcStatusLine);
    const version = css.indexOf('@container (max-width: 760px)');
    const hint = css.indexOf('@container (max-width: 620px)');
    expect(css).toMatch(/@container \(max-width: 760px\)\s*{\s*\.drops-first\s*{\s*display:\s*none/);
    expect(css).toMatch(/@container \(max-width: 620px\)\s*{\s*\.drops-second\s*{\s*display:\s*none/);
    expect(version).toBeGreaterThan(-1);
    expect(hint).toBeGreaterThan(version);
  });

  it('lets the lock label and the workspace name shrink with an ellipsis', async () => {
    const css = styleText(WcStatusLine);
    expect(css).toMatch(/\.status \.label\s*{[^}]*text-overflow:\s*ellipsis/);
    expect(css).toMatch(/\.workspace-name\s*{[^}]*text-overflow:\s*ellipsis/);
  });

  it('shows only the lock icon when narrow, keeping the label for assistive tech and the tooltip', async () => {
    const el = await mount({ encrypted: true });
    expect(styleText(WcStatusLine)).toMatch(
      /@container \(max-width: 560px\)\s*{\s*\.status \.label\s*{[^}]*clip-path:\s*inset\(50%\)/,
    );
    expect(el.shadowRoot?.querySelector('.lock .label')?.textContent).toBe('encrypted');
    expect(el.shadowRoot?.querySelector('.lock')?.getAttribute('title')).toBe('Encrypted');
  });

  it('fires beam-palette-open from the pressed button so focus can return to it', async () => {
    const el = await mount();
    const origins: EventTarget[] = [];
    document.body.addEventListener('beam-palette-open', (event) => {
      origins.push(event.composedPath()[0]);
    });
    const workspace = el.shadowRoot?.querySelector<HTMLButtonElement>('.workspace');
    const hint = el.shadowRoot?.querySelector<HTMLButtonElement>('.hint');
    workspace?.click();
    hint?.click();
    expect(origins).toEqual([workspace, hint]);
  });

  it('stands down below the mobile breakpoint', () => {
    expect(styleText(WcStatusLine)).toMatch(
      /@media \(max-width: 48rem\)\s*{\s*:host\s*{\s*display:\s*none/,
    );
  });
});

describe('wc-status-line, as any app uses it', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  async function line(segments: WcStatusLine['segments']): Promise<WcStatusLine> {
    const el = document.createElement('wc-status-line');
    el.workspaceName = 'Example board';
    el.segments = segments;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it('draws only the name when the app passes no segments', async () => {
    const el = await line([]);
    expect([...el.shadowRoot!.querySelectorAll('.segment')].map((s) => s.className)).toEqual(['segment workspace']);
    expect(text(el)).not.toContain('encrypted');
    expect(text(el)).not.toContain('palette');
  });

  it('puts start segments before the spacer and end segments after it, in the order given', async () => {
    const el = await line([
      { id: 'sync', side: 'end', tone: 'ok', label: 'Synced' },
      { id: 'count', label: '9 records' },
      { id: 'who', side: 'end', label: 'writing as ana' },
    ]);
    const order = [...el.shadowRoot!.querySelectorAll('.segment, .spacer')].map((s) => s.className);
    expect(order).toEqual(['segment workspace', 'segment count', 'spacer', 'segment sync ok', 'segment who']);
  });

  it('sends beam-status-action with the segment id from an action segment', async () => {
    const el = await line([{ id: 'sync-now', side: 'end', label: 'Sync now', action: true }]);
    const spy = vi.fn();
    document.body.addEventListener('beam-status-action', spy);
    el.shadowRoot?.querySelector<HTMLButtonElement>('.sync-now')?.click();
    document.body.removeEventListener('beam-status-action', spy);
    expect(spy.mock.calls[0][0].detail).toEqual({ id: 'sync-now' });
    expect(spy.mock.calls[0][0].composed).toBe(true);
  });

  it('draws a segment that does nothing as text, not as a button', async () => {
    const el = await line([{ id: 'count', label: '9 records', title: 'In this board' }]);
    const segment = el.shadowRoot?.querySelector('.count');
    expect(segment?.tagName).toBe('SPAN');
    expect(segment?.getAttribute('title')).toBe('In this board');
  });

  it('sizes an icon when asked and leaves it alone otherwise', async () => {
    const el = await line([
      { id: 'a', kind: 'status', icon: 'wc-icon-lock', iconSize: 12, label: 'locked' },
      { id: 'b', kind: 'status', icon: 'wc-icon-lock', label: 'locked' },
    ]);
    const icons = el.shadowRoot!.querySelectorAll<HTMLElement>('wc-icon-lock');
    expect(icons[0].style.getPropertyValue('--beam-icon-size')).toBe('12px');
    expect(icons[1].style.getPropertyValue('--beam-icon-size')).toBe('');
  });

  it('takes anything else in its start and end slots', async () => {
    const el = await line([]);
    expect([...el.shadowRoot!.querySelectorAll('slot')].map((s) => s.name)).toEqual(['start', 'end']);
  });
});

describePreviewA11y(preview);

describePrintHiding(WcStatusLine, ':host');
