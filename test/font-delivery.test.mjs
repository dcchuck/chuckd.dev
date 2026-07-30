import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';

const distUrl = new URL('../dist/', import.meta.url);

async function builtFiles(directory = distUrl) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const url = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      files.push(...(await builtFiles(new URL(`${entry.name}/`, directory))));
    } else {
      files.push(url);
    }
  }

  return files;
}

test('every page preloads the hashed WOFF2 title font', async () => {
  const files = await builtFiles();
  const htmlFiles = files.filter((url) => url.pathname.endsWith('.html'));
  const preloadUrls = new Set();

  assert.ok(htmlFiles.length > 0);

  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    const preload = html.match(
      /<link(?=[^>]*rel="preload")(?=[^>]*as="font")(?=[^>]*type="font\/woff2")(?=[^>]*crossorigin="anonymous")(?=[^>]*href="([^"]+\.woff2)")[^>]*>/,
    );
    assert.ok(preload, `missing Goonies preload in ${file.pathname}`);
    preloadUrls.add(preload[1]);
  }

  assert.equal(preloadUrls.size, 1);
  const [fontUrl] = preloadUrls;
  assert.match(fontUrl, /^\/_astro\/Goonies\.[A-Za-z0-9_-]+\.woff2$/);
  await access(new URL(`.${fontUrl}`, distUrl));
});

test('build references only WOFF2 and ships immutable asset caching', async () => {
  const files = await builtFiles();
  const cssFiles = files.filter((url) => url.pathname.endsWith('.css'));
  const css = (
    await Promise.all(cssFiles.map((url) => readFile(url, 'utf8')))
  ).join('\n');

  assert.match(css, /Goonies\.[A-Za-z0-9_-]+\.woff2/);
  assert.match(css, /format\(["']woff2["']\)/);
  assert.doesNotMatch(css, /Goonies\.ttf/);
  await assert.rejects(access(new URL('fonts/Goonies.ttf', distUrl)));

  const headers = await readFile(new URL('_headers', distUrl), 'utf8');
  assert.match(headers, /^\/_astro\/\*\s*$/m);
  assert.match(
    headers,
    /^\s+Cache-Control: public, max-age=31536000, immutable\s*$/m,
  );
});
