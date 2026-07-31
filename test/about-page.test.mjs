import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const distUrl = new URL('../dist/', import.meta.url);

async function readBuiltAboutPage() {
  return readFile(new URL('about/index.html', distUrl), 'utf8');
}

test('about page renders the approved biography, portrait, and employer link', async () => {
  const html = await readBuiltAboutPage();
  const text = html.replace(/\s+/g, ' ');

  assert.match(html, /<title>About - Chuck Danielsson<\/title>/);
  assert.match(html, />\s*About\s*</);
  assert.match(
    text,
    /I’m Chuck Danielsson\. I work on software and the systems that support it:/,
  );
  assert.match(text, /Mathematics came before technology for me\./);
  assert.match(
    text,
    /questions that matter, and answers that work in practice\./,
  );
  assert.match(text, /AI has made that work more exciting\./);
  assert.match(
    text,
    /music, food, theater, long walks, and time with my dog\./,
  );
  assert.doesNotMatch(text, /Head of Platform Engineering/);

  assert.match(
    html,
    /<img(?=[^>]*alt="Illustrated portrait of Chuck Danielsson")(?=[^>]*src="\/_astro\/[^\"]+")[^>]*>/,
  );

  const employerLink = html.match(
    /<a(?=[^>]*href="https:\/\/ai\.one\/")(?=[^>]*aria-label="Visit ai\.one")(?=[^>]*target="_blank")(?=[^>]*rel="noopener noreferrer")[^>]*>([\s\S]*?)<\/a>/,
  );
  assert.ok(employerLink, 'missing accessible ai.one employer link');
  assert.match(employerLink[1], /<svg\b/);
});
