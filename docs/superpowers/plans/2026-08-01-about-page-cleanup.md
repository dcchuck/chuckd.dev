# About Page Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clarify the mathematics paragraph and remove the employer endcap from the static About page.

**Architecture:** Keep the existing single static Astro page and portrait layout. Remove the employer-only SVG asset and page markup, while strengthening the build-output test to protect the approved revised paragraph and absence of ai.one content.

**Tech Stack:** Astro 5, Tailwind CSS 4 utility classes, Node’s built-in test runner, Astro static asset imports.

## Global Constraints

- The revised second paragraph is exactly: `Mathematics came before technology. I was drawn to both by the same thing: questions that matter, and answers that work in practice. That interest has taken me across the stack, following my curiosity and wherever the work is most interesting.`
- Remove the `Current employer` line with no replacement badge, logo, or link.
- Remove the unused local ai.one SVG, its raw import, and its scoped styles.
- Preserve every other approved About-page paragraph, the portrait layout, shared layout components, title-font preload, and theme behavior.
- Keep the route fully static; add no client-side JavaScript.
- Do not push or deploy without Chuck’s explicit review and authorization.

---

## File structure

| File | Responsibility |
| --- | --- |
| `src/pages/about.astro` | Revised prose and static portrait-only page markup. |
| `src/assets/brand-icons/ai-one.svg` | Deleted because no remaining page uses it. |
| `test/about-page.test.mjs` | Generated-page contract for the revised copy and absence of employer content. |
| `docs/superpowers/specs/2026-07-31-about-page-design.md` | Mark the earlier employer/link and second-paragraph choices as superseded by the cleanup design. |

## Task 1: Define the cleanup contract

**Files:**
- Modify: `test/about-page.test.mjs:24-42`

**Interfaces:**
- Consumes: `dist/about/index.html`, produced by `npm run build`.
- Produces: a focused test that rejects the earlier “for me” text and any remaining ai.one employer markup.

- [ ] **Step 1: Update the existing test to the desired failing state**

Replace the second expected paragraph in the existing `assert.deepEqual` array with:

~~~js
'Mathematics came before technology. I was drawn to both by the same thing: questions that matter, and answers that work in practice. That interest has taken me across the stack, following my curiosity and wherever the work is most interesting.',
~~~

Replace the employer-link extraction and SVG assertions with:

~~~js
assert.doesNotMatch(html, /Current employer/);
assert.doesNotMatch(html, /https:\/\/ai\.one\//);
~~~

Retain the existing title, heading, portrait, first-paragraph, remaining-paragraph, and prohibited-title assertions.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `NPM_CONFIG_USERCONFIG=/dev/null npm run build && node --test test/about-page.test.mjs`

Expected: FAIL because the current build still contains the old second paragraph and ai.one employer content.

- [ ] **Step 3: Commit the failing contract**

~~~bash
git add test/about-page.test.mjs
git commit -m "test: define about page cleanup"
~~~

## Task 2: Remove the employer endcap and update the prose

**Files:**
- Delete: `src/assets/brand-icons/ai-one.svg`
- Modify: `src/pages/about.astro:2-9,52-57,69-122`
- Modify: `docs/superpowers/specs/2026-07-31-about-page-design.md:16,34,44`
- Test: `test/about-page.test.mjs`

**Interfaces:**
- Consumes: the failing Task 1 contract.
- Produces: a static About page that ends after the personal paragraph, with no ai.one asset or employer link.

- [ ] **Step 1: Remove the employer-only source asset**

Delete `src/assets/brand-icons/ai-one.svg`.

- [ ] **Step 2: Make the minimal page edit**

In `src/pages/about.astro`, remove this raw asset import:

~~~astro
import aiOneLogo from '../assets/brand-icons/ai-one.svg?raw';
~~~

Replace the second paragraph with:

~~~astro
<p>
  Mathematics came before technology. I was drawn to both by the same
  thing: questions that matter, and answers that work in practice. That
  interest has taken me across the stack, following my curiosity and
  wherever the work is most interesting.
</p>
~~~

Delete the complete `Current employer` paragraph and the `.about-employer-link`, hover/focus, logo, and reduced-motion style rules. Keep only the portrait border style.

- [ ] **Step 3: Update the earlier design record**

In `docs/superpowers/specs/2026-07-31-about-page-design.md`, replace the old second paragraph with the exact revised paragraph. Replace the employer-link layout bullet with:

~~~markdown
- The page ends after the final personal paragraph; it has no employer badge, logo, or external employer link.
~~~

In the Verification section, replace the employer-link check with a check that no employer line or ai.one link is rendered.

- [ ] **Step 4: Run the focused contract test to verify it passes**

Run: `NPM_CONFIG_USERCONFIG=/dev/null npm run build && node --test test/about-page.test.mjs`

Expected: PASS with one test and zero failures.

- [ ] **Step 5: Commit the cleanup**

~~~bash
git add docs/superpowers/specs/2026-07-31-about-page-design.md src/pages/about.astro test/about-page.test.mjs
git rm src/assets/brand-icons/ai-one.svg
git commit -m "Refine about page copy"
~~~

## Task 3: Verify the full site and local presentation

**Files:**
- Verify: `src/pages/about.astro`
- Verify: `test/about-page.test.mjs`

**Interfaces:**
- Consumes: the completed cleanup page.
- Produces: a clean branch with a verified static build and responsive portrait presentation.

- [ ] **Step 1: Run the complete production test suite**

Run: `NPM_CONFIG_USERCONFIG=/dev/null npm test`

Expected: all 5 tests pass with zero failures.

- [ ] **Step 2: Inspect the page locally**

Run: `NPM_CONFIG_USERCONFIG=/dev/null npm run dev -- --host 127.0.0.1`

At `http://127.0.0.1:4321/about`, verify in both light and dark themes that the page ends after the final personal paragraph and retains the desktop side-by-side/mobile-stacked portrait layout.

- [ ] **Step 3: Confirm a clean feature branch**

Run: `git status --short --branch`

Expected: `## codex/about-page` with no file changes. No commit is expected in this verification-only task.

## Plan self-review

- **Spec coverage:** Task 1 protects the revised paragraph and the removal contract. Task 2 removes every employer-only implementation concern and aligns the earlier design record. Task 3 verifies the whole static site and final presentation.
- **Placeholder scan:** The plan names every source, test, documentation, and asset change needed for the cleanup.
- **Type and interface consistency:** The test’s exact paragraph matches the page markup and cleanup design; `src/assets/brand-icons/ai-one.svg` is removed from both code and the build-output contract.

