import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const distUrl = new URL('../dist/', import.meta.url);

async function readBuiltAboutPage() {
  return readFile(new URL('about/index.html', distUrl), 'utf8');
}

function renderedParagraphs(html) {
  return [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((match) =>
    match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
  );
}

test('about page renders the approved biography, portrait, and employer link', async () => {
  const html = await readBuiltAboutPage();
  const text = html.replace(/\s+/g, ' ');
  const paragraphs = renderedParagraphs(html);

  assert.match(html, /<title>About - Chuck Danielsson<\/title>/);
  assert.match(html, />\s*About\s*</);
  assert.deepEqual(paragraphs.slice(0, 4), [
    'I’m Chuck Danielsson. I work on software and the systems that support it: how applications are built, delivered, observed, and kept running. Most of my career has been in application development, with a focus on delivery and user experience. To me, user experience goes beyond the screen. It includes speed, reliability, and everything behind the product.',
    'Mathematics came before technology. I was drawn to both by the same thing: questions that matter, and answers that work in practice. That interest has taken me across the stack, following my curiosity and wherever the work is most interesting.',
    'AI has made that work more exciting. It takes more of the repetitive work out of the way and gives me better tools to explore platform, SRE, and operations work.',
    'Outside of work, I follow my curiosity into other technology projects, and let New York do the rest: music, food, theater, long walks, and time with my dog. If there are no interesting problems around, I tend to find them.',
  ]);
  assert.doesNotMatch(text, /Head of Platform Engineering/);
  assert.doesNotMatch(html, /Current employer/);
  assert.doesNotMatch(html, /https:\/\/ai\.one\//);

  assert.match(
    html,
    /<img(?=[^>]*alt="Illustrated portrait of Chuck Danielsson")(?=[^>]*src="\/_astro\/[^\"]+")[^>]*>/,
  );
});
