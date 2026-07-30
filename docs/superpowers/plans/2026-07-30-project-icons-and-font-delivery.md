# Project Icons and Font Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the projects page's monochrome destination icons with richer self-contained artwork and eliminate the deployed Goonies font-loading delay.

**Architecture:** `BrandIcon.astro` will render three locally stored inline SVG assets so the links remain static, accessible, and free of client-side requests. Goonies will move into Astro's hashed asset pipeline as WOFF2, while a shared preload component and Netlify immutable cache headers make the font discoverable from the initial HTML and reusable across visits.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS 4, Node's built-in test runner, SVG, FontTools, Netlify static headers

## Global Constraints

- Add no client-side JavaScript or runtime data fetches.
- Keep all project-link URLs, accessible labels, tooltips, new-tab behavior, and focus outlines unchanged.
- Render GitHub in the theme foreground color, Homebrew in its full-color beer-mug artwork, and PyPI in its multicolor blue-and-yellow artwork.
- Keep every icon inside a 24-by-24-pixel visual box and render it inline without CDN requests.
- Use a 108% hover/focus scale and slight brightness lift; remove the transition and scale under `prefers-reduced-motion`.
- Convert Goonies from TTF to WOFF2, keep `font-display: swap`, preload the same hashed asset on every page, and cache `/_astro/*` for one year with `immutable`.
- Preserve the user's local-review workflow: keep the development server local and do not push until the user explicitly approves.

---

## File Structure

- Create `src/assets/brand-icons/github.svg`: locally stored, `currentColor` GitHub mark.
- Create `src/assets/brand-icons/homebrew.svg`: locally stored, full-color Homebrew mark.
- Create `src/assets/brand-icons/pypi.svg`: locally stored, multicolor PyPI mark.
- Modify `src/components/BrandIcon.astro`: select and inline the three SVG assets.
- Modify `src/components/ProjectRow.astro`: add the agreed hover, focus, and reduced-motion interaction.
- Modify `test/projects-page.test.mjs`: verify rich inline artwork while retaining all existing link assertions.
- Modify `package.json` and `package-lock.json`: remove the now-unused `simple-icons` dependency.
- Create `src/assets/fonts/Goonies.woff2`: compressed, build-processed title font.
- Delete `public/fonts/Goonies.ttf`: remove the unprocessed TTF source from production output.
- Modify `src/styles/global.css`: reference WOFF2 through Astro's asset pipeline.
- Create `src/components/FontPreload.astro`: emit the shared font preload link.
- Modify all files under `src/pages/`: include `FontPreload` in every document head.
- Create `public/_headers`: apply immutable caching to content-hashed Astro assets.
- Create `test/font-delivery.test.mjs`: verify WOFF2 output, preloads, and cache headers.

---

### Task 1: Render Rich Project-Link Icons

**Files:**

- Create: `src/assets/brand-icons/github.svg`
- Create: `src/assets/brand-icons/homebrew.svg`
- Create: `src/assets/brand-icons/pypi.svg`
- Modify: `src/components/BrandIcon.astro`
- Modify: `src/components/ProjectRow.astro`
- Modify: `test/projects-page.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**

- Consumes: `ProjectLinkBrand = 'github' | 'homebrew' | 'pypi'` from `src/data/projects.ts`.
- Produces: `<BrandIcon brand={brand} />`, rendered as a `data-brand-icon`
  wrapper containing that brand's inline SVG.
- Produces: `.project-link` interaction styling on each accessible anchor.

- [ ] **Step 1: Extend the generated-output test with rich-icon assertions**

Add this helper below `assertAccessibleIconLink` in `test/projects-page.test.mjs`:

```js
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
```

Then add these assertions inside the existing projects-page test after the five
`assertAccessibleIconLink` calls:

```js
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
```

- [ ] **Step 2: Run the projects-page test and verify RED**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm test
```

Expected: FAIL because the existing component emits a bare `<svg>` with no
`data-brand-icon` wrappers and every path uses `currentColor`.

- [ ] **Step 3: Add the three local SVG assets**

Create `src/assets/brand-icons/` and add these exact source variants:

- `github.svg`: the existing Simple Icons GitHub path already present in
  `node_modules/simple-icons/icons/github.svg`; change its path fill to
  `currentColor` and retain `viewBox="0 0 24 24"`.
- `homebrew.svg`: the compact full-color `logos:homebrew` SVG from
  `https://api.iconify.design/logos:homebrew.svg`, retaining its
  `viewBox="0 0 164 256"` and all original fills.
- `pypi.svg`: the compact multicolor `logos:pypi` SVG from
  `https://api.iconify.design/logos:pypi.svg`, retaining its
  `viewBox="0 0 256 226"` and all original fills.

Preserve the downloaded SVG content verbatim except for removing fixed `width` and
`height` attributes from the root element. Retain each original `viewBox` and all
inner paths. Add the corresponding source URL in an XML comment immediately above
each root SVG.

- [ ] **Step 4: Replace `BrandIcon.astro` with the inline asset renderer**

Replace `src/components/BrandIcon.astro` with:

```astro
---
import githubSvg from '../assets/brand-icons/github.svg?raw';
import homebrewSvg from '../assets/brand-icons/homebrew.svg?raw';
import pypiSvg from '../assets/brand-icons/pypi.svg?raw';
import type { ProjectLinkBrand } from '../data/projects';

interface Props {
  brand: ProjectLinkBrand;
}

const { brand } = Astro.props;
const icons: Record<ProjectLinkBrand, string> = {
  github: githubSvg,
  homebrew: homebrewSvg,
  pypi: pypiSvg,
};
---

<span
  data-brand-icon={brand}
  class:list={['brand-icon', `brand-icon--${brand}`]}
  aria-hidden="true"
  set:html={icons[brand]}
/>

<style>
  .brand-icon {
    display: block;
    width: 1.5rem;
    height: 1.5rem;
  }

  .brand-icon :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .brand-icon--github {
    color: var(--color-fg);
  }
</style>
```

- [ ] **Step 5: Add interaction styling without changing link semantics**

In `src/components/ProjectRow.astro`, change the icon anchor's class to:

```astro
class="project-link rounded-sm p-1 focus-visible:outline-2 focus-visible:outline-offset-2"
```

Append:

```astro
<style>
  .project-link {
    transition:
      filter 150ms ease,
      transform 150ms ease;
  }

  .project-link:hover,
  .project-link:focus-visible {
    filter: brightness(1.1);
    transform: scale(1.08);
  }

  @media (prefers-reduced-motion: reduce) {
    .project-link {
      transition: none;
    }

    .project-link:hover,
    .project-link:focus-visible {
      transform: none;
    }
  }
</style>
```

Keep `style="color: var(--color-fg); outline-color: var(--color-fg);"` unchanged.

- [ ] **Step 6: Remove the obsolete icon package**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm uninstall simple-icons
```

Expected: `simple-icons` disappears from `package.json` and `package-lock.json`;
no other direct dependency changes.

- [ ] **Step 7: Run tests and verify GREEN**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm test
```

Expected: both existing test cases pass, including the new wrapper and fill-color
assertions.

- [ ] **Step 8: Commit the rich-icon task**

```bash
git add src/assets/brand-icons/github.svg \
  src/assets/brand-icons/homebrew.svg \
  src/assets/brand-icons/pypi.svg \
  src/components/BrandIcon.astro \
  src/components/ProjectRow.astro \
  test/projects-page.test.mjs \
  package.json \
  package-lock.json
git commit -m "Add rich project link icons"
```

---

### Task 2: Deliver Goonies as a Preloaded, Cached WOFF2 Asset

**Files:**

- Create: `src/assets/fonts/Goonies.woff2`
- Delete: `public/fonts/Goonies.ttf`
- Create: `src/components/FontPreload.astro`
- Modify: `src/styles/global.css`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/blog/[slug].astro`
- Modify: `src/pages/projects.astro`
- Create: `public/_headers`
- Create: `test/font-delivery.test.mjs`

**Interfaces:**

- Produces: `FontPreload.astro`, a no-props component that emits one anonymous
  WOFF2 preload for the same imported asset used by `global.css`.
- Produces: a hashed `/_astro/Goonies.<hash>.woff2` build asset.
- Produces: Netlify `_headers` configuration for long-lived hashed assets.

- [ ] **Step 1: Add the font-delivery generated-output test**

Create `test/font-delivery.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the font test and verify RED**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm test
```

Expected: FAIL because no generated page includes a WOFF2 preload and the build still
ships `dist/fonts/Goonies.ttf`.

- [ ] **Step 3: Convert the title font into Astro's asset directory**

Run:

```bash
mkdir -p src/assets/fonts
fonttools ttLib.woff2 compress \
  public/fonts/Goonies.ttf \
  -o src/assets/fonts/Goonies.woff2
```

Expected: `src/assets/fonts/Goonies.woff2` is a valid compressed font smaller than
the 34 KB TTF source. Delete only `public/fonts/Goonies.ttf` after confirming the
WOFF2 file exists and has nonzero size.

- [ ] **Step 4: Point the font face at WOFF2**

Change the `@font-face` source in `src/styles/global.css` to:

```css
src: url('../assets/fonts/Goonies.woff2') format('woff2');
```

Keep the family, weight, style, and `font-display: swap` declarations unchanged.

- [ ] **Step 5: Create the shared preload component**

Create `src/components/FontPreload.astro`:

```astro
---
import gooniesFontUrl from '../assets/fonts/Goonies.woff2?url';
---

<link
  rel="preload"
  href={gooniesFontUrl}
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
/>
```

- [ ] **Step 6: Include the preload on every page**

In each of these files:

- `src/pages/index.astro`
- `src/pages/about.astro`
- `src/pages/blog/index.astro`
- `src/pages/blog/[slug].astro`
- `src/pages/projects.astro`

add the correctly relative import:

```astro
import FontPreload from '../components/FontPreload.astro';
```

Use `../../components/FontPreload.astro` in both blog page files. Then place:

```astro
<FontPreload />
```

inside `<head>`, immediately before `<ThemeScript />`.

- [ ] **Step 7: Add immutable Netlify headers for hashed assets**

Create `public/_headers`:

```text
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

- [ ] **Step 8: Run tests and verify GREEN**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm test
```

Expected: all project-page and font-delivery tests pass. The build emits exactly one
hashed Goonies WOFF2 URL used by CSS and preloaded from every generated page.

- [ ] **Step 9: Commit the font-delivery task**

```bash
git add src/assets/fonts/Goonies.woff2 \
  public/fonts/Goonies.ttf \
  src/components/FontPreload.astro \
  src/styles/global.css \
  src/pages/index.astro \
  src/pages/about.astro \
  src/pages/blog/index.astro \
  'src/pages/blog/[slug].astro' \
  src/pages/projects.astro \
  public/_headers \
  test/font-delivery.test.mjs
git commit -m "Optimize Goonies font delivery"
```

---

### Task 3: Verify the Combined Local Experience

**Files:**

- Verify only; modify no files unless verification exposes a defect.

**Interfaces:**

- Consumes: the generated `/projects` page, its inline SVG links, and the shared
  hashed WOFF2 preload.
- Produces: evidence that the approved design works without regressions.

- [ ] **Step 1: Run the full automated verification**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm test
git diff --check
git status --short
```

Expected: all tests pass, `git diff --check` prints nothing, and the worktree has no
uncommitted implementation changes.

- [ ] **Step 2: Verify production asset output**

Run:

```bash
find dist -type f \( -name '*.woff2' -o -name '*.ttf' -o -name '_headers' \) -print
rg -n 'rel="preload"|font/woff2|Goonies|Cache-Control' dist
```

Expected: one hashed Goonies WOFF2 file, no TTF file, a Goonies preload in every HTML
page, and the immutable `/_astro/*` header policy.

- [ ] **Step 3: Inspect the local page in the browser**

Use the running Astro development server at
`http://127.0.0.1:4321/projects` and verify:

- dark and light themes
- full-color Homebrew and PyPI artwork
- foreground-aware GitHub artwork
- aligned 24-pixel visual boxes
- hover and keyboard-focus feedback
- reduced-motion behavior
- 390-pixel mobile layout and desktop layout
- no console errors or failed asset requests

- [ ] **Step 4: Leave the local preview running for user review**

Do not push. Report the local URL, the automated verification result, the commits
created, and any remaining baseline warnings so the user can review before deciding
whether to publish.
