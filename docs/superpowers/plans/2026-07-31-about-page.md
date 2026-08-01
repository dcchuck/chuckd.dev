# About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder About page with Chuck Danielsson’s approved personal and technical introduction, illustrated portrait, and an accessible linked ai.one employer mark.

**Architecture:** Keep the page as a static Astro route. The page imports a local portrait through Astro’s image pipeline and a locally bundled official ai.one SVG wordmark as raw markup; all prose stays directly in `src/pages/about.astro`. Build-output tests validate the content contract and asset/link accessibility without adding client-side JavaScript.

**Tech Stack:** Astro 5, Tailwind CSS 4 utility classes, Node’s built-in test runner, Astro static asset imports.

## Global Constraints

- Preserve the shared header, footer, title-font preload, and light/dark theme behavior.
- Use the exact approved four-paragraph copy below; do not mention the `Head of Platform Engineering` title in the prose.
- Set the document title to `About - Chuck Danielsson`.
- Use the supplied portrait without editing it, circular cropping it, or referring to its Desktop source path at runtime.
- Serve the portrait and the ai.one wordmark as local fingerprinted assets; add no client-side JavaScript.
- Link the employer mark to `https://ai.one/` in a new tab with `rel="noopener noreferrer"` and the accessible label `Visit ai.one`.
- Do not push or deploy before Chuck has reviewed the result and explicitly authorized it.

---

## File structure

| File | Responsibility |
| --- | --- |
| `src/assets/about/rotoscoped.png` | Source portrait copied from the user-supplied Desktop image and optimized by Astro at build time. |
| `src/assets/brand-icons/ai-one.svg` | Locally bundled official ai.one wordmark used only by the current-employer link. |
| `src/pages/about.astro` | Static About-page markup, prose, image layout, employer link, and scoped styling. |
| `test/about-page.test.mjs` | Assertions against the generated static About page. |

## Task 1: Define the generated-page contract

**Files:**
- Create: `test/about-page.test.mjs`

**Interfaces:**
- Consumes: `dist/about/index.html`, produced by `npm run build`.
- Produces: a Node test named `about page renders the approved biography, portrait, and employer link` that Task 2 must make pass.

- [ ] **Step 1: Write the failing test**

```js
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
  assert.match(text, /I’m Chuck Danielsson\. I work on software and the systems that support it:/);
  assert.match(text, /Mathematics came before technology for me\./);
  assert.match(text, /questions that matter, and answers that work in practice\./);
  assert.match(text, /AI has made that work more exciting\./);
  assert.match(text, /music, food, theater, long walks, and time with my dog\./);
  assert.doesNotMatch(text, /Head of Platform Engineering/);

  assert.match(
    html,
    /<img(?=[^>]*alt="Illustrated portrait of Chuck Danielsson")(?=[^>]*src="\/_astro\/[^"]+")[^>]*>/,
  );

  const employerLink = html.match(
    /<a(?=[^>]*href="https:\/\/ai\.one\/")(?=[^>]*aria-label="Visit ai\.one")(?=[^>]*target="_blank")(?=[^>]*rel="noopener noreferrer")[^>]*>([\s\S]*?)<\/a>/,
  );
  assert.ok(employerLink, 'missing accessible ai.one employer link');
  assert.match(employerLink[1], /<svg\b/);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `NPM_CONFIG_USERCONFIG=/dev/null npm run build && node --test test/about-page.test.mjs`

Expected: FAIL because the current page still has `About - Chuck Danielson`, `Coming soon.`, no portrait, and no employer link.

- [ ] **Step 3: Commit the failing contract**

```bash
git add test/about-page.test.mjs
git commit -m "test: define about page contract"
```

## Task 2: Build the static About page and package its assets

**Files:**
- Create: `src/assets/about/rotoscoped.png`
- Create: `src/assets/brand-icons/ai-one.svg`
- Modify: `src/pages/about.astro`
- Test: `test/about-page.test.mjs`

**Interfaces:**
- Consumes: the Task 1 build-output contract; `/Users/charlesdanielsson/Desktop/rotoscoped.png`; the official ai.one wordmark used on `https://ai.one/`.
- Produces: a fully static `/about/` page with a fingerprinted portrait `<img>` and a raw inline SVG inside the ai.one employer link.

- [ ] **Step 1: Copy and package the approved assets**

```bash
mkdir -p src/assets/about
cp /Users/charlesdanielsson/Desktop/rotoscoped.png src/assets/about/rotoscoped.png
```

Save the official ai.one wordmark from the company’s public `AI-One-Logo` SVG as `src/assets/brand-icons/ai-one.svg`. Change its black vector fills to `currentColor` so the official monochrome mark remains visible in both site themes; do not reference `ai.one` for the image source at runtime.

- [ ] **Step 2: Replace the placeholder page with the approved markup**

Use Astro’s `Image` component for the portrait and import the locally bundled SVG as raw markup:

```astro
---
import { Image } from 'astro:assets';
import '../styles/global.css';
import portrait from '../assets/about/rotoscoped.png';
import aiOneLogo from '../assets/brand-icons/ai-one.svg?raw';
import FontPreload from '../components/FontPreload.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import ThemeScript from '../components/ThemeScript.astro';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content={Astro.generator} />
    <title>About - Chuck Danielsson</title>
    <FontPreload />
    <ThemeScript />
  </head>
  <body class="min-h-dvh flex flex-col" style="background-color: var(--color-bg);">
    <Header breadcrumbs={[{ label: 'about' }]} />
    <main class="flex-1 px-8 max-w-5xl mx-auto w-full">
      <article class="max-w-3xl">
        <h1 class="text-2xl font-title" style="color: var(--color-fg);">About</h1>
        <div class="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <Image
            src={portrait}
            alt="Illustrated portrait of Chuck Danielsson"
            width={240}
            class="about-portrait w-full max-w-60 shrink-0"
          />
          <div class="space-y-5 font-mono leading-relaxed" style="color: var(--color-fg);">
            <p>I’m Chuck Danielsson. I work on software and the systems that support it: how applications are built, delivered, observed, and kept running. Most of my career has been in application development, with a focus on delivery and user experience. To me, user experience goes beyond the screen. It includes speed, reliability, and everything behind the product.</p>
            <p>Mathematics came before technology for me. I was drawn to both by the same thing: questions that matter, and answers that work in practice. I’ve worked across the stack ever since, following my curiosity and wherever the work is most interesting.</p>
            <p>AI has made that work more exciting. It takes more of the repetitive work out of the way and gives me better tools to explore platform, SRE, and operations work.</p>
            <p>Outside of work, I follow my curiosity into other technology projects, and let New York do the rest: music, food, theater, long walks, and time with my dog. If there are no interesting problems around, I tend to find them.</p>
          </div>
        </div>
        <p class="mt-8 flex items-center gap-3 font-mono text-sm" style="color: var(--color-fg);">
          <span>Current employer</span>
          <a
            href="https://ai.one/"
            aria-label="Visit ai.one"
            title="Visit ai.one"
            target="_blank"
            rel="noopener noreferrer"
            class="about-employer-link rounded-sm p-1 focus-visible:outline-2 focus-visible:outline-offset-2"
            style="outline-color: var(--color-fg);"
          >
            <span class="about-employer-logo" aria-hidden="true" set:html={aiOneLogo} />
          </a>
        </p>
      </article>
    </main>
    <Footer />
  </body>
</html>

<style>
  .about-portrait { border: 1px solid var(--color-fg); }
  .about-employer-link { transition: opacity 150ms ease; }
  .about-employer-link:hover, .about-employer-link:focus-visible { opacity: 0.75; }
  .about-employer-logo :global(svg) { display: block; width: auto; height: 1.5rem; }
  @media (prefers-reduced-motion: reduce) { .about-employer-link { transition: none; } }
</style>
```

- [ ] **Step 3: Run the focused contract test to verify it passes**

Run: `NPM_CONFIG_USERCONFIG=/dev/null npm run build && node --test test/about-page.test.mjs`

Expected: PASS with one test and zero failures.

- [ ] **Step 4: Commit the page feature**

```bash
git add src/assets/about/rotoscoped.png src/assets/brand-icons/ai-one.svg src/pages/about.astro test/about-page.test.mjs
git commit -m "Add about page biography"
```

## Task 3: Verify responsive presentation and the complete static suite

**Files:**
- Verify: `src/pages/about.astro`
- Verify: `test/about-page.test.mjs`

**Interfaces:**
- Consumes: the static page produced in Task 2.
- Produces: verified desktop/mobile and dark/light presentation with no uncommitted changes.

- [ ] **Step 1: Run the complete production test suite**

Run: `NPM_CONFIG_USERCONFIG=/dev/null npm test`

Expected: all existing font/projects tests and the new About-page test pass.

- [ ] **Step 2: Inspect the page locally**

Run: `NPM_CONFIG_USERCONFIG=/dev/null npm run dev -- --host 127.0.0.1`

At `http://127.0.0.1:4321/about`, verify at a desktop viewport and at a 390px-wide mobile viewport that the portrait is beside the prose on desktop, above it on mobile, the image is square and not circularly cropped, the employer logo is visible, and no horizontal scrolling occurs. Repeat in both light and dark themes; verify keyboard focus is visible on the employer link.

- [ ] **Step 3: Confirm a clean feature branch**

Run: `git status --short --branch`

Expected: `## codex/about-page` with no file changes. No commit is expected in this verification-only task.

## Plan self-review

- **Spec coverage:** Task 2 implements every approved content, title, image, employer-link, asset-locality, static-rendering, and shared-layout requirement. Task 1 tests the generated content and accessibility contract; Task 3 covers the requested theme and responsive inspection plus the complete suite.
- **Placeholder scan:** The plan contains no unresolved design choices, incomplete markers, or unspecified implementation steps. The company asset is identified as the public official `AI-One-Logo` SVG and has an exact destination path.
- **Type and interface consistency:** The portrait import, raw SVG import, test labels, title, target URL, and alt text use the same exact values across all tasks.
