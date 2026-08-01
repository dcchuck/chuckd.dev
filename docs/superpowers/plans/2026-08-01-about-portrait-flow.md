# About Portrait Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the About-page biography flow around the portrait on wider screens while keeping the portrait stacked above the copy on phones.

**Architecture:** Replace the current responsive flex container with normal document flow. The portrait will float only at Tailwind's `sm` breakpoint, and a clearing element after the biography will contain the float so later page content starts below it.

**Tech Stack:** Astro, Tailwind CSS utility classes, Node.js built-in test runner.

## Global Constraints

- Keep the approved biography, portrait asset, alt text, page title, and page navigation unchanged.
- Use a responsive CSS float beginning at the `sm` breakpoint; do not use a grid or flex row for the biography.
- Keep the portrait in normal block flow below the `sm` breakpoint.
- Do not push or merge this branch; leave the local preview available for review.

---

### Task 1: Implement responsive portrait wrapping

**Files:**
- Modify: `test/about-page.test.mjs`
- Modify: `src/pages/about.astro`

**Interfaces:**
- Consumes: Astro's emitted `<img>` markup and Tailwind utility-class strings from the About page.
- Produces: A responsive `sm:float-left` portrait followed by flowing biography text and a `clear-both` float boundary.

- [ ] **Step 1: Write the failing test**

Add these assertions immediately after the existing portrait `<img>` assertion in `test/about-page.test.mjs`:

```js
assert.match(html, /class="[^"]*sm:float-left[^"]*"/);
assert.match(html, /class="[^"]*sm:mr-6[^"]*"/);
assert.match(html, /class="[^"]*sm:mb-4[^"]*"/);
assert.match(html, /class="clear-both"/);
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `NPM_CONFIG_USERCONFIG=/dev/null npm run build && node --test --test-name-pattern='portrait' test/about-page.test.mjs`

Expected: FAIL because the rendered page does not yet contain `sm:float-left` or the float boundary.

- [ ] **Step 3: Write the minimal implementation**

In `src/pages/about.astro`:

```astro
<div class="mt-6">
  <Image
    src={portrait}
    alt="Illustrated portrait of Chuck Danielsson"
    width={240}
    class="about-portrait w-full max-w-60 sm:float-left sm:mr-6 sm:mb-4"
  />
  <div class="space-y-5 font-mono leading-relaxed" style="color: var(--color-fg);">
    <!-- existing approved paragraphs, unchanged -->
  </div>
  <div class="clear-both" aria-hidden="true"></div>
</div>
```

Remove the existing `flex`, `flex-col`, `gap-6`, `sm:flex-row`, `sm:items-start`, and `shrink-0` classes. Preserve the paragraph text exactly.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `NPM_CONFIG_USERCONFIG=/dev/null npm run build && node --test --test-name-pattern='portrait' test/about-page.test.mjs`

Expected: PASS for the About-page test, with the non-matching test names skipped.

- [ ] **Step 5: Run the complete verification suite**

Run: `NPM_CONFIG_USERCONFIG=/dev/null npm test`

Expected: Astro builds all static routes successfully and every Node test passes.

- [ ] **Step 6: Inspect the local preview**

At `http://127.0.0.1:4321/about`, verify that desktop text wraps to the portrait's right and continues under it, while a narrow viewport displays the portrait above the biography without horizontal scrolling.

- [ ] **Step 7: Commit the implementation**

```bash
git add src/pages/about.astro test/about-page.test.mjs
git commit -m "Wrap about copy around portrait"
```
