import { test, expect, type Page } from '@playwright/test';

/**
 * The default theme writes each colour once, as light-dark(), and color-scheme
 * picks the side; the shadows, which grow in the dark, sit under the dark
 * selectors. These check what that comes to on screen: the computed
 * colours of components, three shadow roots deep, under the system preference
 * either way, under each class that pins a mode, and as the system or the class
 * changes on an open page.
 */

type Mode = 'light' | 'dark' | 'system';
type ColorModeApi = { applyMode(mode: Mode): void; initColorMode(o: { storageKey: string }): Mode; writeMode(key: string, mode: Mode): void };

const PROBES = {
  shell: { read: 'beam-app-shell', property: 'background-color' },
  sidebar: { read: 'beam-nav-sidebar', property: 'background-color' },
  sidebarShadow: { read: 'beam-nav-sidebar', property: 'box-shadow' },
  activeItem: { read: 'beam-nav-sidebar >> .item.active', property: 'background-image' },
  searchBox: { read: 'beam-app-shell >> beam-search-pill >> button', property: 'background-color' },
  statusText: { read: 'beam-app-shell >> beam-status-line', property: 'color' },
} as const;

const LIGHT = {
  shell: 'rgb(245, 245, 245)',
  sidebar: 'rgb(250, 250, 250)',
  sidebarShadow: 'rgba(0, 0, 0, 0.08) 0px 1px 3px 0px',
  activeItem: 'linear-gradient(rgb(230, 237, 252), rgb(230, 237, 252)), linear-gradient(rgb(37, 99, 235), rgb(37, 99, 235))',
  searchBox: 'rgb(255, 255, 255)',
  statusText: 'rgb(92, 92, 92)',
};
const DARK = {
  shell: 'rgb(22, 22, 22)',
  sidebar: 'rgb(29, 29, 29)',
  sidebarShadow: 'rgba(0, 0, 0, 0.4) 0px 4px 16px 0px',
  activeItem: 'linear-gradient(rgb(31, 42, 64), rgb(31, 42, 64)), linear-gradient(rgb(122, 167, 255), rgb(122, 167, 255))',
  searchBox: 'rgb(34, 34, 34)',
  statusText: 'rgb(163, 163, 163)',
};

async function open(page: Page, scheme: 'light' | 'dark') {
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => (window as unknown as { ready?: boolean }).ready === true);
}

function read(page: Page): Promise<Record<string, string>> {
  return page.evaluate((probes) => {
    const out: Record<string, string> = {};
    for (const [name, probe] of Object.entries(probes)) {
      let node: Element | null = null;
      let scope: Document | ShadowRoot = document;
      for (const selector of probe.read.split(' >> ')) {
        node = scope.querySelector(selector);
        if (!node) break;
        if (node.shadowRoot) scope = node.shadowRoot;
      }
      out[name] = node ? getComputedStyle(node).getPropertyValue(probe.property) : 'missing';
    }
    return out;
  }, PROBES);
}

const mode = (page: Page, m: Mode) => page.evaluate((m) => (window as unknown as { colorMode: ColorModeApi }).colorMode.applyMode(m), m);

test('with no class, the page follows the system preference', async ({ page }) => {
  await open(page, 'light');
  expect(await read(page)).toEqual(LIGHT);
  await open(page, 'dark');
  expect(await read(page)).toEqual(DARK);
});

test('light-mode keeps a dark system light, and dark-mode keeps a light system dark', async ({ page }) => {
  await open(page, 'dark');
  await mode(page, 'light');
  expect(await read(page)).toEqual(LIGHT);
  await open(page, 'light');
  await mode(page, 'dark');
  expect(await read(page)).toEqual(DARK);
});

test('an open page follows a system change, and a class change, at once', async ({ page }) => {
  await open(page, 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await read(page)).toEqual(DARK);
  await mode(page, 'light');
  expect(await read(page)).toEqual(LIGHT);
  await page.emulateMedia({ colorScheme: 'light' });
  await mode(page, 'dark');
  expect(await read(page)).toEqual(DARK);
  await mode(page, 'system');
  expect(await read(page)).toEqual(LIGHT);
});

test('a stored choice is applied by initColorMode', async ({ page }) => {
  await open(page, 'light');
  await page.evaluate(() => {
    const api = (window as unknown as { colorMode: ColorModeApi }).colorMode;
    api.writeMode('beam-e2e', 'dark');
    api.initColorMode({ storageKey: 'beam-e2e' });
  });
  expect(await read(page)).toEqual(DARK);
});

test('an override written once with light-dark() holds in both modes', async ({ page }) => {
  await open(page, 'light');
  await page.addStyleTag({ content: ':root { --beam-color-panel: light-dark(#ffecb3, #3e2723); }' });
  expect((await read(page)).sidebar).toBe('rgb(255, 236, 179)');
  await mode(page, 'dark');
  expect((await read(page)).sidebar).toBe('rgb(62, 39, 35)');
  await page.emulateMedia({ colorScheme: 'dark' });
  await mode(page, 'system');
  expect((await read(page)).sidebar).toBe('rgb(62, 39, 35)');
});

test('a token read by script is the light-dark() text, as the README says', async ({ page }) => {
  await open(page, 'dark');
  const token = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--beam-color-bg').trim());
  expect(token).toBe('light-dark(#f5f5f5, #161616)');
});
