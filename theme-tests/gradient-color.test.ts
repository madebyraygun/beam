import { describe, it, expect } from 'vitest';
import { NIGEL_PALETTE, gradientColor } from '../src/theme/tokens/gradient.js';

const channels = (hex: string) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

describe('gradientColor', () => {
  /**
   * Within a unit per channel rather than exactly. `2/7 * 7` is 1.9999…, and
   * truncating that lands the interpolation one step short of the stop — which
   * `as u8` in `effects.rs` does identically, so rounding here to make the
   * assertion pretty would be the browser departing from the terminal.
   */
  it('lands on a stop at that stop position', () => {
    NIGEL_PALETTE.forEach((stop, i) => {
      const got = channels(gradientColor(i / NIGEL_PALETTE.length));
      channels(stop).forEach((want, c) => {
        expect(Math.abs(got[c] - want), `${stop} channel ${c}`).toBeLessThanOrEqual(1);
      });
    });
  });

  it('closes the loop back to the first stop', () => {
    expect(gradientColor(1)).toBe(NIGEL_PALETTE[0]);
    expect(gradientColor(0)).toBe(NIGEL_PALETTE[0]);
  });

  it('wraps rather than clamping, so a phase can keep advancing', () => {
    expect(gradientColor(3.25)).toBe(gradientColor(0.25));
    expect(gradientColor(-0.75)).toBe(gradientColor(0.25));
  });

  it('interpolates between the two stops it sits between', () => {
    // Halfway along the first segment: pink #ffb3ba to peach #ffc8a2.
    expect(gradientColor(0.5 / 7)).toBe('#ffbdae');
  });

  it('always answers a six-digit hex', () => {
    for (let i = 0; i <= 200; i += 1) {
      expect(gradientColor(i / 200)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
