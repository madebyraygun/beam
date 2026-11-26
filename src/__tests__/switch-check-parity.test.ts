import { describe, it, expect, afterEach } from 'vitest';
import { SWITCH_CHECK_PATH } from '../theme/index.js';
import '../icons/icons.js';

/**
 * The standard switch draws its "on" check from a path the theme holds,
 * because the theme cannot import this package. This keeps that path the
 * icon set's own check.
 */
describe('the switch check', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('is the icon set’s check', async () => {
    const icon = document.createElement('wc-icon-check');
    document.body.appendChild(icon);
    await icon.updateComplete;
    expect(icon.shadowRoot?.querySelector('path')?.getAttribute('d')).toBe(SWITCH_CHECK_PATH);
  });
});
