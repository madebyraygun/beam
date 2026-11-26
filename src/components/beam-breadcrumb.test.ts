import { describe, it, expect, afterEach, vi } from 'vitest';
import './beam-breadcrumb.js';
import { BeamBreadcrumb } from './beam-breadcrumb.js';
import { describePreviewA11y } from '../../preview/axe-suite.js';
import { describePrintHiding } from '../../preview/print-suite.js';
import preview from './beam-breadcrumb.preview.js';

async function mount(props: Partial<BeamBreadcrumb> = {}): Promise<BeamBreadcrumb> {
  const el = document.createElement('beam-breadcrumb');
  Object.assign(el, { workspaceName: 'Acme Consulting LLC', workspaceKey: 'acme' }, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('beam-breadcrumb', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('is a labelled breadcrumb landmark', async () => {
    const el = await mount({ trail: [{ label: 'Dashboard' }] });
    expect(el.shadowRoot?.querySelector('nav')?.getAttribute('aria-label')).toBe('Breadcrumb');
  });

  it('leads with the workspace: its monogram and its name', async () => {
    const el = await mount({ trail: [{ label: 'Dashboard' }] });
    const workspace = el.shadowRoot?.querySelector('.workspace');
    expect(workspace?.querySelector('beam-monogram')?.getAttribute('name')).toBe('Acme Consulting LLC');
    expect(workspace?.querySelector('beam-monogram')?.getAttribute('seed')).toBe('acme');
    expect(workspace?.querySelector('.workspace-name')?.textContent).toBe('Acme Consulting LLC');
  });

  it('asks for the palette at the switch scope when the name is pressed', async () => {
    const el = await mount({ trail: [{ label: 'Dashboard' }] });
    const spy = vi.fn();
    document.body.addEventListener('beam-palette-open', spy);
    el.shadowRoot?.querySelector<HTMLButtonElement>('.workspace')?.click();
    document.body.removeEventListener('beam-palette-open', spy);
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0].detail).toEqual({ scope: 'workspaces' });
  });

  it('marks the last level as the current page and does not make it a button', async () => {
    const el = await mount({ trail: [{ label: 'Dashboard', id: 'dashboard' }] });
    const current = el.shadowRoot?.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('Dashboard');
    expect(current?.tagName).toBe('SPAN');
  });

  it('turns an earlier level into a way back to its screen', async () => {
    const el = await mount({
      trail: [{ label: 'Orders', id: 'orders' }, { label: '#1254' }],
    });
    const spy = vi.fn();
    el.addEventListener('beam-navigate', spy);
    el.shadowRoot?.querySelector<HTMLButtonElement>('[data-level="orders"]')?.click();
    expect(spy.mock.calls[0][0].detail).toEqual({ id: 'orders' });
    expect(spy.mock.calls[0][0].composed).toBe(true);
  });

  it('separates the levels with a slash nobody hears', async () => {
    const el = await mount({
      trail: [{ label: 'Orders', id: 'orders' }, { label: '#1254' }],
    });
    const seps = [...(el.shadowRoot?.querySelectorAll('.sep') ?? [])];
    expect(seps).toHaveLength(2);
    for (const sep of seps) {
      expect(sep.textContent).toBe('/');
      expect(sep.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('sets the last level of a deeper trail in text colour', async () => {
    const el = await mount({
      trail: [{ label: 'Orders', id: 'orders' }, { label: '#1254' }],
    });
    expect(el.shadowRoot?.querySelector('[aria-current="page"]')?.classList).toContain('deep');
  });
});

describePreviewA11y(preview);

describePrintHiding(BeamBreadcrumb, ':host');
