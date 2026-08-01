import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const distUrl = new URL('../dist/', import.meta.url);

async function readBuiltPage(pathname) {
  return readFile(new URL(pathname, distUrl), 'utf8');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertAccessibleIconLink(html, href, label) {
  const anchor = new RegExp(
    `<a(?=[^>]*href="${escapeRegex(href)}")` +
      `(?=[^>]*aria-label="${escapeRegex(label)}")` +
      `(?=[^>]*title="${escapeRegex(label)}")` +
      `(?=[^>]*target="_blank")` +
      `(?=[^>]*rel="noopener noreferrer")[^>]*>` +
      `([\\s\\S]*?)<\\/a>`,
  );
  const match = html.match(anchor);

  assert.ok(match, `missing accessible icon link: ${label}`);
  assert.match(match[1], /<svg\b/);
  assert.equal(match[1].replace(/<[^>]+>/g, '').trim(), '');
}

function assertFooterIconLink(html, href, label) {
  const anchor = new RegExp(
    '<a(?=[^>]*data-footer-link)(?=[^>]*href="' + escapeRegex(href) + '")' +
      '(?=[^>]*aria-label="' + escapeRegex(label) + '")' +
      '(?=[^>]*title="' + escapeRegex(label) + '")' +
      '(?=[^>]*target="_blank")' +
      '(?=[^>]*rel="noopener noreferrer")[^>]*>' +
      '([\\s\\S]*?)<\\/a>',
  );
  const match = html.match(anchor);

  assert.ok(match, 'missing footer icon link: ' + label);
  assert.match(match[1], /<svg\b[^>]*>/);
  assert.match(match[1], /fill="currentColor"/);
  assert.equal(match[1].replace(/<[^>]+>/g, '').trim(), '');
}

function projectIconFragments(html, brand) {
  const pattern = new RegExp(
    `<span[^>]*data-brand-icon="${brand}"[^>]*>([\\s\\S]*?)<\\/span>`,
    'g',
  );

  return [...html.matchAll(pattern)].map((match) => match[1]);
}

function fillColors(fragment) {
  return new Set(
    [...fragment.matchAll(/\bfill="(#[0-9a-f]{3,8})"/gi)].map((match) =>
      match[1].toLowerCase(),
    ),
  );
}

test('projects page renders the initial project catalog and official links', async () => {
  const html = await readBuiltPage('projects/index.html');

  assert.match(html, />\s*Projects\s*</);
  assert.match(html, />\s*car-go-clean\s*</);
  assert.match(
    html,
    /A Rust CLI and daemon that cleans build artifacts from Rust projects and tracks reclaimed disk space\./,
  );
  assert.match(html, />\s*lbranch\s*</);
  assert.match(
    html,
    /A Git utility for listing recently checked-out branches and quickly switching between them\./,
  );
  const projectHeadings = [
    ...html.matchAll(
      /<h2 class="([^"]+)"[^>]*>\s*(car-go-clean|lbranch)\s*<\/h2>/g,
    ),
  ];
  assert.equal(projectHeadings.length, 2);
  for (const [, classes] of projectHeadings) {
    assert.match(classes, /\bfont-mono\b/);
    assert.doesNotMatch(classes, /\bfont-title\b/);
  }

  assertAccessibleIconLink(
    html,
    'https://github.com/dcchuck/car-go-clean',
    'View car-go-clean on GitHub',
  );
  assertAccessibleIconLink(
    html,
    'https://github.com/dcchuck/homebrew-tap/blob/main/Formula/car-go-clean.rb',
    'View car-go-clean Homebrew formula',
  );
  assertAccessibleIconLink(
    html,
    'https://github.com/dcchuck/lbranch',
    'View lbranch on GitHub',
  );
  assertAccessibleIconLink(
    html,
    'https://github.com/dcchuck/homebrew-tap/blob/main/Formula/lbranch.rb',
    'View lbranch Homebrew formula',
  );
  assertAccessibleIconLink(
    html,
    'https://pypi.org/project/lbranch/',
    'View lbranch on PyPI',
  );
  const githubIcons = projectIconFragments(html, 'github');
  const homebrewIcons = projectIconFragments(html, 'homebrew');
  const pypiIcons = projectIconFragments(html, 'pypi');

  assert.equal(githubIcons.length, 2);
  assert.equal(homebrewIcons.length, 2);
  assert.equal(pypiIcons.length, 1);
  assert.ok(githubIcons.every((fragment) => fragment.includes('currentColor')));
  assert.ok(
    homebrewIcons.every((fragment) => fillColors(fragment).size >= 3),
    'Homebrew artwork must retain multiple colors',
  );
  assert.ok(
    pypiIcons.every((fragment) => fillColors(fragment).size >= 3),
    'PyPI artwork must retain multiple colors',
  );
  const carGoCleanRow = html.match(
    /<li[^>]*data-project="car-go-clean"[^>]*>([\s\S]*?)<\/li>/,
  );
  assert.ok(carGoCleanRow, 'missing car-go-clean project row');
  assert.doesNotMatch(carGoCleanRow[1], /data-project-link="pypi"/);
  assert.doesNotMatch(html, /crates\.io/);
});

test('homepage and shared footer link to projects', async () => {
  const homeHtml = await readBuiltPage('index.html');
  const projectsHtml = await readBuiltPage('projects/index.html');
  const projectsLink = /<a[^>]*href="\/projects"[^>]*>projects<\/a>/;

  assert.match(homeHtml, projectsLink);
  assert.match(projectsHtml, projectsLink);
});

test('shared footer separates page navigation from icon-only external links', async () => {
  const html = await readBuiltPage('about/index.html');

  assert.match(
    html,
    /<nav[^>]*aria-label="Pages"[^>]*>[\s\S]*href="\/blog"[\s\S]*href="\/projects"[\s\S]*href="\/about"[\s\S]*<\/nav>/,
  );
  assert.match(html, /<nav[^>]*aria-label="External links"/);
  assertFooterIconLink(html, 'https://github.com/dcchuck', 'GitHub');
  assertFooterIconLink(html, 'https://x.com/dcChuck', 'X');
});
