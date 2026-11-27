import { test, expect, type Page } from '@playwright/test';
import { createRequire } from 'node:module';

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

test.beforeEach(async ({ page }) => {
  await page.goto('/controls.html');
  await page.waitForFunction(() => (window as unknown as { ready?: boolean }).ready === true);
});

const submitted = (page: Page) => page.evaluate(() => (window as unknown as { submitted: Record<string, string>[] }).submitted);

test('a form submits every control under its name', async ({ page }) => {
  await page.locator('#keep').click();
  expect(await submitted(page)).toEqual([
    { title: 'Add CSV export', estimate: '', body: 'Two', priority: 'low', when: 'soon', size: 'm', who: '', locked: '' },
  ]);
});

test('typing, choosing and toggling reach the form, and reset puts them back', async ({ page }) => {
  await page.getByLabel('Title').fill('Changed');
  await page.getByLabel('Body').fill('Line one\nLine two');
  await page.getByLabel('Priority').selectOption('high');
  await page.getByRole('switch', { name: 'Blocked' }).click();
  await page.getByRole('radio', { name: 'Later' }).check();
  await page.getByRole('radio', { name: 'L', exact: true }).check();
  await page.locator('#keep').click();
  expect((await submitted(page))[0]).toMatchObject({
    title: 'Changed',
    body: 'Line one\nLine two',
    priority: 'high',
    blocked: 'on',
    when: 'later',
    size: 'l',
  });
  await page.locator('#undo').click();
  await expect(page.getByLabel('Title')).toHaveValue('Add CSV export');
  await expect(page.getByRole('switch', { name: 'Blocked' })).not.toBeChecked();
  await expect(page.getByRole('radio', { name: 'Soon' })).toBeChecked();
});

test('Enter in a field submits; a required field that is empty stops it', async ({ page }) => {
  await page.getByLabel('Title').press('Enter');
  expect(await submitted(page)).toHaveLength(1);
  const name = page.getByRole('textbox', { name: 'Name', exact: true }).first();
  await name.press('Enter');
  await page.locator('#needs-save').click();
  expect(await submitted(page)).toHaveLength(1);
  const valid = await page.locator('#needs').evaluate((form: HTMLFormElement) => form.checkValidity());
  expect(valid).toBe(false);
  await name.fill('Ana');
  await page.locator('#needs-save').click();
  expect((await submitted(page))[1]).toEqual({ name: 'Ana' });
});

test('a disabled fieldset disables the control inside it and leaves it out of the form', async ({ page }) => {
  await page.locator('#locked').evaluate((fieldset: HTMLFieldSetElement) => (fieldset.disabled = true));
  await expect(page.getByLabel('Locked field')).toBeDisabled();
  await page.locator('#keep').click();
  expect((await submitted(page))[0]).not.toHaveProperty('locked');
});

test('the textarea grows with its text, then scrolls', async ({ page }) => {
  const area = page.getByLabel('Body');
  const start = await area.evaluate((el) => el.getBoundingClientRect().height);
  await area.fill(Array.from({ length: 6 }, (_, i) => `line ${i}`).join('\n'));
  const six = await area.evaluate((el) => el.getBoundingClientRect().height);
  expect(six).toBeGreaterThan(start);
  await area.fill(Array.from({ length: 30 }, (_, i) => `line ${i}`).join('\n'));
  const capped = await area.evaluate((el) => ({ height: el.getBoundingClientRect().height, scroll: el.scrollHeight }));
  expect(capped.height).toBeLessThan(capped.scroll);
  expect(capped.height).toBeLessThan(13 * 1.5 * 14 + 30);
});

test('arrow keys move the choice in a radio group', async ({ page }) => {
  await page.getByRole('radio', { name: 'Soon' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('radio', { name: 'Later' })).toBeChecked();
  await page.locator('#keep').click();
  expect((await submitted(page))[0].when).toBe('later');
});

test('the combobox filters, moves with the arrows, picks with Enter and submits', async ({ page }) => {
  const box = page.getByRole('combobox', { name: 'Assignee' });
  await box.fill('sam');
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await expect(list.getByRole('option')).toHaveText(['SASam', 'SMSamira']);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(box).toHaveValue('Samira');
  await expect(list).toBeHidden();
  await page.locator('#keep').click();
  expect((await submitted(page))[0].who).toBe('samira');
});

test('the combobox list sits under the field in the top layer and shows eight rows', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  const box = page.getByRole('combobox', { name: 'Assignee' });
  await box.click();
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  const field = await box.boundingBox();
  const drawn = await list.boundingBox();
  expect(Math.abs(drawn!.x - field!.x)).toBeLessThan(1);
  expect(Math.abs(drawn!.width - field!.width)).toBeLessThan(1);
  expect(drawn!.y).toBeGreaterThan(field!.y + field!.height - 1);
  expect(drawn!.height).toBeLessThanOrEqual(8 * 32 + 12);
  expect(await list.evaluate((el) => el.matches(':popover-open'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(list).toBeHidden();
});

test('the combobox list goes above the field when there is no room below', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 760 });
  const box = page.getByRole('combobox', { name: 'Assignee' });
  await box.click();
  const field = await box.boundingBox();
  const drawn = await page.getByRole('listbox').boundingBox();
  expect(drawn!.y + drawn!.height).toBeLessThanOrEqual(field!.y + 1);
});

test('the dialog is modal, starts on Cancel, closes on Escape and gives focus back', async ({ page }) => {
  await page.locator('#open').click();
  const dialog = page.getByRole('dialog', { name: 'Delete this item?' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('#cancel')).toBeFocused();
  expect(await page.locator('#confirm').evaluate((el) => el.shadowRoot!.querySelector('dialog')!.matches(':modal'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('#open')).toBeFocused();
});

test('a dialog that refuses cancel stays open', async ({ page }) => {
  await page.locator('#confirm').evaluate((el) => el.addEventListener('cancel', (event) => event.preventDefault()));
  await page.locator('#open').click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Delete this item?' })).toBeVisible();
});

test('a form dialog starts on its first field', async ({ page }) => {
  await page.locator('#rename').evaluate((el) => (el as HTMLElement & { show(): void }).show());
  await expect(page.locator('#rename-name')).toBeFocused();
});

test('axe finds nothing wrong, with a dialog and the combobox open', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Assignee' }).fill('a');
  await page.addScriptTag({ path: axePath });
  const closed = await page.evaluate(async () => {
    const result = await (window as unknown as { axe: { run: (n: Node) => Promise<{ violations: { id: string }[] }> } }).axe.run(document);
    return result.violations.map((v) => v.id);
  });
  expect(closed).toEqual([]);
  await page.locator('#open').click();
  const open = await page.evaluate(async () => {
    const result = await (window as unknown as { axe: { run: (n: Node) => Promise<{ violations: { id: string }[] }> } }).axe.run(document);
    return result.violations.map((v) => v.id);
  });
  expect(open).toEqual([]);
});
