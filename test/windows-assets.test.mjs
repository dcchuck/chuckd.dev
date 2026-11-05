import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';
import { buildFonts } from '../scripts/windows-assets/font.mjs';
import { buildCursors, buildSprites, encodePng, packSheet } from '../scripts/windows-assets/sprite.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root));
const names = JSON.parse(await read('src/components/windows/sprite-names.json'));
const themeCss = String(await read('src/styles/windows.css'));

test('committed Windows artwork matches what the generator produces', async () => {
  const { sheet, placed } = packSheet(buildSprites());
  assert.deepEqual(Object.keys(placed).sort(), names);
  assert.deepEqual(await read('public/windows/icons.png'), encodePng(sheet));
  for (const [name, data] of Object.entries(buildCursors())) assert.equal(String(await read(`public/windows/${name}`)), data);
  for (const [name, data] of Object.entries(buildFonts())) assert.deepEqual(await read(`public/windows/${name}`), data, name);
});

test('generated fonts are WOFF2 files that browsers will accept', async () => {
  for (const [name, data] of Object.entries(buildFonts())) {
    assert.equal(data.subarray(0, 4).toString(), 'wOF2', name);
    assert.equal(data.readUInt32BE(8), data.length, `${name} header length`);
    // Browsers reject the whole font when the file does not end on a 4-byte boundary.
    assert.equal(data.length % 4, 0, `${name} must be padded to 4 bytes`);
  }
});

test('every sprite the theme references exists', async () => {
  for (const [, name] of themeCss.matchAll(/--sp-([\w-]+)/g)) assert.ok(names.includes(name), `windows.css uses unknown sprite ${name}`);
  const html = String(await read('dist/index.html'));
  const used = new Set([...html.matchAll(/\bi-([a-z][\w-]*)/g)].map(match => match[1]));
  assert.ok(used.size > 20);
  for (const name of used) assert.ok(names.includes(name), `markup uses unknown sprite ${name}`);
});

test('scroll bar button rules stay out of nested selector lists', () => {
  // Pseudo-elements cannot live inside the :is() that nesting compiles a list to, so the arrows vanish.
  const nested = themeCss.slice(0, themeCss.indexOf('/* Pseudo-elements'));
  assert.doesNotMatch(nested, /::-webkit-scrollbar-button/);
  assert.match(themeCss, /^html\[data-theme='windows-classic'\] #skin-experience ::-webkit-scrollbar-button:vertical:start:decrement/m);
});

test('the theme uses the Windows Classic system colors', () => {
  assert.match(themeCss, /--desktop:#3a6ea5;/);
  assert.match(themeCss, /--face:#d4d0c8;/);
  assert.match(themeCss, /--select:#0a246a;/);
});

test('artwork ships as generated files, with no removed component left behind', async () => {
  const components = await readdir(new URL('src/components/windows/', root));
  assert.ok(!components.includes('ToolbarIcon.astro'));
  const files = await readdir(new URL('public/windows/', root));
  for (const file of ['icons.png', 'arrow.svg', 'text.svg', 'classic-sans.woff2', 'classic-sans-bold.woff2', 'classic-mono.woff2']) assert.ok(files.includes(file), file);
});
