import type { CSSResult, LitElement } from 'lit';

type StyledCtor = typeof LitElement;

/**
 * The flattened text of everything a component adopts into its shadow root.
 *
 * `static styles` is a `CSSResult`, an array, or an array of arrays, so it is
 * walked recursively. `Array.prototype.flat(Infinity)` would do it at runtime
 * but its return type is inferred by unrolling the nesting, which on lit's
 * recursive `CSSResultArray` exceeds TypeScript's instantiation depth.
 */
export function styleText(ctor: StyledCtor): string {
  const out: string[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node) {
      out.push(String((node as CSSResult).cssText));
    }
  };
  walk(ctor.styles);
  return out.join('\n');
}
