import { test, expect, type Page } from '@playwright/test';

/**
 * Every component renders under the default theme, then under a second theme
 * (e2e/second-theme.css) that changes the accent, the surfaces and the font,
 * and each one is checked to have picked up the second theme's values from
 * its computed style.
 */

type Probe = { name: string; property: string; read: string };

/** Where to look in each component, as a path of selectors through shadow roots. */
const PROBES: Probe[] = [
  { name: 'beam-app-shell background', property: 'background-color', read: 'beam-app-shell' },
  { name: 'beam-app-shell font', property: 'font-family', read: 'beam-app-shell' },
  { name: 'beam-nav-sidebar panel', property: 'background-color', read: 'beam-nav-sidebar' },
  { name: 'beam-nav-sidebar font', property: 'font-family', read: 'beam-nav-sidebar' },
  { name: 'beam-nav-sidebar active item accent', property: 'background-image', read: 'beam-nav-sidebar >> .item.active' },
  { name: 'beam-nav-sidebar product name accent', property: 'background-image', read: 'beam-nav-sidebar >> .wordmark' },
  { name: 'beam-breadcrumb font', property: 'font-family', read: 'beam-app-shell >> beam-breadcrumb' },
  { name: 'beam-status-line panel', property: 'background-color', read: 'beam-app-shell >> beam-status-line' },
  { name: 'beam-status-line font', property: 'font-family', read: 'beam-app-shell >> beam-status-line' },
  { name: 'beam-search-pill surface', property: 'background-color', read: 'beam-app-shell >> beam-search-pill >> button' },
  { name: 'beam-search-pill font', property: 'font-family', read: 'beam-app-shell >> beam-search-pill >> button' },
  { name: 'beam-monogram font', property: 'font-family', read: 'beam-monogram >> .tile' },
  { name: 'beam-toast surface', property: 'background-color', read: 'beam-app-shell >> beam-toast >> .toast' },
  { name: 'beam-toast font', property: 'font-family', read: 'beam-app-shell >> beam-toast >> .toast' },
  { name: 'icon size', property: 'width', read: '#icon' },
];

const SECOND: Record<string, string> = {
  'beam-app-shell background': 'rgb(255, 248, 225)',
  'beam-nav-sidebar panel': 'rgb(255, 236, 179)',
  'beam-status-line panel': 'rgb(255, 236, 179)',
  'beam-search-pill surface': 'rgb(255, 243, 196)',
  'beam-toast surface': 'rgb(62, 39, 35)',
  'icon size': '28px',
};

async function read(page: Page): Promise<Record<string, string>> {
  return page.evaluate((probes) => {
    const out: Record<string, string> = {};
    for (const probe of probes) {
      let node: Element | null = null;
      let scope: Document | ShadowRoot = document;
      for (const selector of probe.read.split(' >> ')) {
        node = scope.querySelector(selector);
        if (!node) break;
        if (node.shadowRoot) scope = node.shadowRoot;
      }
      out[probe.name] = node ? getComputedStyle(node).getPropertyValue(probe.property) : 'missing';
    }
    return out;
  }, PROBES);
}

test('every component takes its look from the theme it is given', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as unknown as { ready?: boolean }).ready === true);
  await page.locator('beam-app-shell').evaluate((el) => (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete);

  const before = await read(page);
  for (const [name, value] of Object.entries(before)) expect(value, name).not.toBe('missing');

  await page.evaluate(() => document.documentElement.classList.add('second-theme'));
  const after = await read(page);

  for (const probe of PROBES) {
    expect(after[probe.name], `${probe.name} changed`).not.toBe(before[probe.name]);
    if (probe.property === 'font-family') expect(after[probe.name], probe.name).toContain('Georgia');
    if (probe.property === 'background-image') expect(after[probe.name], probe.name).toContain('rgb(194, 24, 91)');
    if (SECOND[probe.name]) expect(after[probe.name], probe.name).toBe(SECOND[probe.name]);
  }
});

test('the search box edge under the pointer is the accent', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as unknown as { ready?: boolean }).ready === true);
  await page.evaluate(() => document.documentElement.classList.add('second-theme'));
  const pill = page.locator('beam-search-pill button');
  await pill.hover();
  await expect.poll(() => pill.evaluate((el) => getComputedStyle(el).borderTopColor)).toBe('rgb(194, 24, 91)');
});
