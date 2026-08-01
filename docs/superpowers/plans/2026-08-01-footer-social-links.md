# Footer Social Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Split the shared footer into text page navigation and icon-only, theme-aware GitHub and X links.

**Architecture:** Footer.astro will own a small static external-link list and render its icons from local raw SVG assets. The existing GitHub asset and a new X asset use currentColor, while the link container provides the site foreground color so the icons follow the light/dark theme automatically.

**Tech Stack:** Astro, Tailwind CSS utility classes, local SVG assets, Node.js built-in test runner.

## Global Constraints

- Keep the first centered title-font page row as blog, projects, and about, separated by asterisks.
- Render a second centered icon-only row for GitHub (https://github.com/dcchuck) and X (https://x.com/dcChuck).
- External links must include aria-label, title, target="_blank", and rel="noopener noreferrer".
- Icons must be local SVGs using currentColor and inherit var(--color-fg).
- Preserve existing page navigation targets, do not add client-side JavaScript, and do not push or merge the branch.

---

### Task 1: Render the accessible, theme-aware external link row

**Files:**
- Create: src/assets/brand-icons/x.svg
- Modify: src/components/Footer.astro
- Modify: test/projects-page.test.mjs

**Interfaces:**
- Consumes: the existing local GitHub SVG asset and the site color custom property var(--color-fg).
- Produces: a footer with pages and external-links navigation landmarks plus two icon-only external anchors.

- [ ] **Step 1: Write the failing test**

Add a helper and test to test/projects-page.test.mjs:

```js
function assertFooterIconLink(html, href, label) {
  const anchor = new RegExp(
    '<a(?=[^>]*data-footer-link)(?=[^>]*href="' + escapeRegex(href) + '")' +
      '(?=[^>]*aria-label="' + escapeRegex(label) + '")' +
      '(?=[^>]*title="' + escapeRegex(label) + '")' +
      '(?=[^>]*target="_blank")(?=[^>]*rel="noopener noreferrer")[^>]*>' +
      '([\\s\\S]*?)<\\/a>',
  );
  const match = html.match(anchor);
  assert.ok(match, 'missing footer icon link: ' + label);
  assert.match(match[1], /<svg\b[^>]*>/);
  assert.match(match[1], /fill="currentColor"/);
  assert.equal(match[1].replace(/<[^>]+>/g, '').trim(), '');
}

test('shared footer separates page navigation from icon-only external links', async () => {
  const html = await readBuiltPage('about/index.html');
  assert.match(html, /<nav[^>]*aria-label="Pages"[^>]*>[\s\S]*href="\/blog"[\s\S]*href="\/projects"[\s\S]*href="\/about"[\s\S]*<\/nav>/);
  assert.match(html, /<nav[^>]*aria-label="External links"/);
  assertFooterIconLink(html, 'https://github.com/dcchuck', 'GitHub');
  assertFooterIconLink(html, 'https://x.com/dcChuck', 'X');
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: NPM_CONFIG_USERCONFIG=/dev/null npm run build && node --test --test-name-pattern='footer separates' test/projects-page.test.mjs

Expected: FAIL because the current footer has one navigation row, text GitHub content, and no X link.

- [ ] **Step 3: Create the X icon asset**

Create src/assets/brand-icons/x.svg containing:

```svg
<!-- Source: https://simpleicons.org/?q=x -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
```

- [ ] **Step 4: Render the two footer rows**

In src/components/Footer.astro, import github.svg?raw and x.svg?raw. Define the GitHub and X href, label, and SVG as a local array. Render:

```astro
<nav aria-label="Pages" class="font-title text-center">
  <!-- existing blog, projects, and about links with separators -->
</nav>
<nav aria-label="External links" class="mt-3 flex justify-center gap-3">
  {externalLinks.map((link) => (
    <a data-footer-link href={link.href} aria-label={link.label} title={link.label}
      target="_blank" rel="noopener noreferrer"
      class="footer-social-link rounded-sm p-1 focus-visible:outline-2 focus-visible:outline-offset-2"
      style="color: var(--color-fg); outline-color: var(--color-fg);">
      <span data-footer-icon={link.label.toLowerCase()} aria-hidden="true" set:html={link.icon} />
    </a>
  ))}
</nav>
```

Set the inline SVG span to 1.5rem square and add the same 150ms brightness/scale hover and focus treatment used by ProjectRow.astro; disable its transition and transform in prefers-reduced-motion.

- [ ] **Step 5: Run the focused test to verify it passes**

Run: NPM_CONFIG_USERCONFIG=/dev/null npm run build && node --test --test-name-pattern='footer separates' test/projects-page.test.mjs

Expected: PASS for the external-footer test, with unmatched test names skipped.

- [ ] **Step 6: Run the complete verification suite**

Run: NPM_CONFIG_USERCONFIG=/dev/null npm test

Expected: Astro builds all static routes successfully and every Node test passes.

- [ ] **Step 7: Inspect the local preview**

At http://127.0.0.1:4321/about, verify the two-row footer in both themes: text page links on top, white icons in dark mode or black icons in light mode below, and no horizontal overflow on a narrow viewport.

- [ ] **Step 8: Commit the implementation**

```bash
git add src/assets/brand-icons/x.svg src/components/Footer.astro test/projects-page.test.mjs
git commit -m "Add footer social icon links"
```
