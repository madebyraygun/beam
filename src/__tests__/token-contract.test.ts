import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOKENS, TOKEN_NAMES } from '../theme/tokens.js';
import { defaultTheme } from '../theme/default-theme.js';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, '..');
const readme = readFileSync(resolve(srcDir, '../README.md'), 'utf8');

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return ['__tests__', '__mocks__'].includes(entry.name) ? [] : walk(full);
    return entry.name.endsWith('.ts') && !/\.(test|preview)\.ts$/.test(entry.name) ? [full] : [];
  });
}

const componentFiles = [...walk(join(srcDir, 'components')), ...walk(join(srcDir, 'icons')), join(srcDir, 'theme/base.ts')];
const sources = componentFiles.map((file) => ({ file: relative(srcDir, file), text: readFileSync(file, 'utf8') }));
const read = new Set(sources.flatMap(({ text }) => [...text.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1])));

/** The declarations in the first `:root { … }` block of the default theme. */
const lightBlock = /:root\s*{([^}]*)}/.exec(defaultTheme.cssText)?.[1] ?? '';
const filled = new Set([...lightBlock.matchAll(/(--beam-[\w-]+)\s*:/g)].map((m) => m[1]));

describe('the token contract', () => {
  it('names every custom property a component reads', () => {
    expect([...read].filter((name) => !TOKEN_NAMES.has(name))).toEqual([]);
  });

  it('lists nothing no component reads', () => {
    expect(TOKENS.map((t) => t.name).filter((name) => !read.has(name))).toEqual([]);
  });

  it('has one prefix', () => {
    const others = sources.flatMap(({ file, text }) =>
      [...text.matchAll(/--(?!beam-)[a-z][\w-]*\s*[:)]/g)].map((m) => `${file}: ${m[0]}`),
    );
    expect(others).toEqual([]);
  });

  it('leaves every theme token to the theme: no var() fallback', () => {
    const hits = sources.flatMap(({ file, text }) =>
      [...text.matchAll(/var\(\s*(--[\w-]+)\s*,/g)]
        .filter((m) => !TOKENS.find((t) => t.name === m[1])?.local)
        .map((m) => `${file}: ${m[0]}`),
    );
    expect(hits).toEqual([]);
  });

  it('is filled by the default theme, all but the components’ own knobs', () => {
    const missing = TOKENS.filter((t) => !t.local && !filled.has(t.name)).map((t) => t.name);
    expect(missing).toEqual([]);
    expect([...filled].filter((name) => !TOKEN_NAMES.has(name))).toEqual([]);
  });

  it('is the README’s token table, row for row', () => {
    const rows = [...readme.matchAll(/^\| `(--beam-[\w-]+)` \| (\w[\w-]*) \|/gm)].map((m) => `${m[1]} ${m[2]}`);
    expect(rows).toEqual(TOKENS.map((t) => `${t.name} ${t.type}`));
  });
});
