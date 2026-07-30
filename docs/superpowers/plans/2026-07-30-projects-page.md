# Projects Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static, accessible `/projects` listing for car-go-clean and lbranch, with icon-only links to each official distribution destination.

**Architecture:** Typed project metadata lives in one data module and is rendered by focused Astro components into a static page that follows the blog listing shell. Brand SVG data comes from `simple-icons@16.27.1` and is inlined at build time, while Node's built-in test runner validates the generated HTML.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS 4, simple-icons 16.27.1, Node test runner

## Global Constraints

- Keep the page completely static; do not fetch project metadata at runtime.
- List only car-go-clean and lbranch in the first version.
- Show one-line project descriptions.
- Use icon-only GitHub, Homebrew, and PyPI actions with `aria-label`, `title`, `target="_blank"`, and `rel="noopener noreferrer"`.
- Do not add a crates.io action for car-go-clean because no such package exists.
- Match the blog page's monochrome shell and typography.
- Add `projects` between `blog` and `about` in homepage and footer navigation.
- Add no client-side JavaScript for the projects list or icons.
- Run and review the site locally; do not push any branch or commit without explicit user approval.

---

## File Map

- Create `test/projects-page.test.mjs`: generated-HTML contract for projects content, destinations, accessible icon links, and site navigation.
- Modify `package.json`: add the build-then-test command and the exact `simple-icons` dependency.
- Modify `package-lock.json`: lock `simple-icons@16.27.1`.
- Create `src/data/projects.ts`: typed, build-time project metadata.
- Create `src/components/BrandIcon.astro`: supported brand-to-SVG mapping.
- Create `src/components/ProjectRow.astro`: one accessible, responsive project list item.
- Create `src/pages/projects.astro`: static projects document and list shell.
- Modify `src/pages/index.astro`: homepage `projects` navigation entry.
- Modify `src/components/Footer.astro`: shared footer `projects` navigation entry.

---

### Task 1: Render the Static Projects Listing

**Files:**
- Create: `test/projects-page.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/data/projects.ts`
- Create: `src/components/BrandIcon.astro`
- Create: `src/components/ProjectRow.astro`
- Create: `src/pages/projects.astro`

**Interfaces:**
- Produces: `ProjectLinkBrand = 'github' | 'homebrew' | 'pypi'`
- Produces: `ProjectLink { brand: ProjectLinkBrand; href: string }`
- Produces: `Project { name: string; description: string; links: readonly ProjectLink[] }`
- Produces: `projects: readonly Project[]`
- Produces: `BrandIcon.astro` prop `{ brand: ProjectLinkBrand }`
- Produces: `ProjectRow.astro` prop `{ project: Project }`

- [ ] **Step 1: Install and lock the verified icon dependency**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm install --save-exact simple-icons@16.27.1 \
  --registry=https://registry.npmjs.org \
  --cache=/private/tmp/chuckd-projects-npm-cache
```

Expected: `package.json` and `package-lock.json` record exactly `simple-icons: "16.27.1"`.

- [ ] **Step 2: Add the generated-page test command**

Add this script to `package.json`:

```json
"test": "npm run build && node --test test/*.test.mjs"
```

- [ ] **Step 3: Write the failing projects-page contract**

Create `test/projects-page.test.mjs`:

```javascript
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
  const carGoCleanRow = html.match(
    /<li[^>]*data-project="car-go-clean"[^>]*>([\s\S]*?)<\/li>/,
  );
  assert.ok(carGoCleanRow, 'missing car-go-clean project row');
  assert.doesNotMatch(carGoCleanRow[1], /data-project-link="pypi"/);
  assert.doesNotMatch(html, /crates\.io/);
});
```

- [ ] **Step 4: Run the contract and confirm the red state**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm test
```

Expected: FAIL with `ENOENT` for `dist/projects/index.html`, proving the test detects the missing page.

- [ ] **Step 5: Add typed project metadata**

Create `src/data/projects.ts`:

```typescript
export type ProjectLinkBrand = 'github' | 'homebrew' | 'pypi';

export interface ProjectLink {
  brand: ProjectLinkBrand;
  href: string;
}

export interface Project {
  name: string;
  description: string;
  links: readonly ProjectLink[];
}

export const projects = [
  {
    name: 'car-go-clean',
    description:
      'A Rust CLI and daemon that cleans build artifacts from Rust projects and tracks reclaimed disk space.',
    links: [
      {
        brand: 'github',
        href: 'https://github.com/dcchuck/car-go-clean',
      },
      {
        brand: 'homebrew',
        href: 'https://github.com/dcchuck/homebrew-tap/blob/main/Formula/car-go-clean.rb',
      },
    ],
  },
  {
    name: 'lbranch',
    description:
      'A Git utility for listing recently checked-out branches and quickly switching between them.',
    links: [
      {
        brand: 'github',
        href: 'https://github.com/dcchuck/lbranch',
      },
      {
        brand: 'homebrew',
        href: 'https://github.com/dcchuck/homebrew-tap/blob/main/Formula/lbranch.rb',
      },
      {
        brand: 'pypi',
        href: 'https://pypi.org/project/lbranch/',
      },
    ],
  },
] as const satisfies readonly Project[];
```

- [ ] **Step 6: Add the build-time brand icon component**

Create `src/components/BrandIcon.astro`:

```astro
---
import { siGithub, siHomebrew, siPypi } from 'simple-icons';
import type { ProjectLinkBrand } from '../data/projects';

interface Props {
  brand: ProjectLinkBrand;
}

const { brand } = Astro.props;
const icons = {
  github: siGithub,
  homebrew: siHomebrew,
  pypi: siPypi,
} as const;
const icon = icons[brand];
---

<svg
  class="size-5"
  viewBox="0 0 24 24"
  aria-hidden="true"
  focusable="false"
>
  <path d={icon.path} fill="currentColor" />
</svg>
```

- [ ] **Step 7: Add the reusable project row**

Create `src/components/ProjectRow.astro`:

```astro
---
import type { Project, ProjectLinkBrand } from '../data/projects';
import BrandIcon from './BrandIcon.astro';

interface Props {
  project: Project;
}

const { project } = Astro.props;

const destinationNames: Record<ProjectLinkBrand, string> = {
  github: 'GitHub',
  homebrew: 'Homebrew formula',
  pypi: 'PyPI',
};

function linkLabel(projectName: string, brand: ProjectLinkBrand) {
  if (brand === 'homebrew') {
    return `View ${projectName} ${destinationNames[brand]}`;
  }

  return `View ${projectName} on ${destinationNames[brand]}`;
}
---

<li
  data-project={project.name}
  class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
>
  <div class="min-w-0">
    <h2 class="font-title text-lg" style="color: var(--color-fg);">
      {project.name}
    </h2>
    <p
      class="mt-1 max-w-2xl font-mono text-sm leading-relaxed"
      style="color: var(--color-fg);"
    >
      {project.description}
    </p>
  </div>

  <nav
    aria-label={`${project.name} links`}
    class="flex shrink-0 items-center gap-2"
  >
    {project.links.map((link) => {
      const label = linkLabel(project.name, link.brand);

      return (
        <a
          href={link.href}
          data-project-link={link.brand}
          aria-label={label}
          title={label}
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-sm p-1 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2"
          style="color: var(--color-fg); outline-color: var(--color-fg);"
        >
          <BrandIcon brand={link.brand} />
        </a>
      );
    })}
  </nav>
</li>
```

- [ ] **Step 8: Add the static projects page**

Create `src/pages/projects.astro`:

```astro
---
import '../styles/global.css';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import ProjectRow from '../components/ProjectRow.astro';
import ThemeScript from '../components/ThemeScript.astro';
import { projects } from '../data/projects';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content={Astro.generator} />
    <title>Projects - Chuck Danielson</title>
    <ThemeScript />
  </head>
  <body
    class="min-h-dvh flex flex-col"
    style="background-color: var(--color-bg);"
  >
    <Header breadcrumbs={[{ label: 'projects' }]} />
    <main class="flex-1 px-8 max-w-5xl mx-auto w-full">
      <h1
        class="text-2xl font-title mb-6"
        style="color: var(--color-fg);"
      >
        Projects
      </h1>
      <ul class="space-y-6">
        {projects.map((project) => <ProjectRow project={project} />)}
      </ul>
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 9: Run the contract and confirm the green state**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm test
```

Expected: PASS with one projects-page test and a generated `/projects/index.html`.

- [ ] **Step 10: Commit the independently working projects page locally**

Run:

```bash
git add package.json package-lock.json test/projects-page.test.mjs \
  src/data/projects.ts src/components/BrandIcon.astro \
  src/components/ProjectRow.astro src/pages/projects.astro
git commit -m "Add projects listing"
```

Do not push.

---

### Task 2: Add Projects to Site Navigation

**Files:**
- Modify: `test/projects-page.test.mjs`
- Modify: `src/pages/index.astro`
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Consumes: generated `/projects/index.html` from Task 1.
- Produces: `/projects` navigation from the homepage and every page using `Footer.astro`.

- [ ] **Step 1: Extend the contract with failing navigation assertions**

Append to `test/projects-page.test.mjs`:

```javascript
test('homepage and shared footer link to projects', async () => {
  const homeHtml = await readBuiltPage('index.html');
  const projectsHtml = await readBuiltPage('projects/index.html');
  const projectsLink = /<a[^>]*href="\/projects"[^>]*>projects<\/a>/;

  assert.match(homeHtml, projectsLink);
  assert.match(projectsHtml, projectsLink);
});
```

- [ ] **Step 2: Run the navigation contract and confirm the red state**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm test
```

Expected: FAIL because neither the homepage nor shared footer contains an `/projects` link.

- [ ] **Step 3: Add projects to homepage navigation**

In `src/pages/index.astro`, place this link and separator between the existing `blog` and `about` entries:

```astro
<a href="/projects" class="hover:underline">projects</a>
<span class="mx-2">*</span>
```

- [ ] **Step 4: Add projects to shared footer navigation**

In `src/components/Footer.astro`, place this link and separator between the existing `blog` and `about` entries:

```astro
<a href="/projects" class="hover:underline">projects</a>
<span class="mx-2">*</span>
```

- [ ] **Step 5: Run the complete contract and confirm the green state**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm test
```

Expected: PASS with two tests and six generated pages.

- [ ] **Step 6: Commit the navigation change locally**

Run:

```bash
git add test/projects-page.test.mjs src/pages/index.astro src/components/Footer.astro
git commit -m "Link projects from site navigation"
```

Do not push.

---

### Task 3: Verify and Present the Local Site

**Files:**
- Verify only; do not commit generated `dist/` output.

**Interfaces:**
- Consumes: completed projects page and navigation from Tasks 1 and 2.
- Produces: a local Astro dev URL for user review.

- [ ] **Step 1: Run final automated verification**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm test
git diff --check
git status --short --branch
```

Expected: tests pass, diff check is clean, and the only tracked changes are the local implementation-plan progress updates if those were recorded.

- [ ] **Step 2: Start Astro dev mode without opening a browser automatically**

Run:

```bash
env NPM_CONFIG_USERCONFIG=/dev/null npm run dev -- --host 127.0.0.1
```

Expected: Astro reports a local URL such as `http://127.0.0.1:4321/`.

- [ ] **Step 3: Inspect desktop dark and light themes**

Open `/projects` at 1440×900. Verify:

- the heading and list align with `/blog`
- names, descriptions, and icons remain legible
- all five icons are visible and aligned
- tooltips identify each destination
- focus rings are visible
- toggling the shared theme keeps sufficient contrast

- [ ] **Step 4: Inspect the narrow layout**

Open `/projects` at 390×844. Verify:

- each icon group wraps beneath its project description
- no horizontal overflow occurs
- project rows remain visually distinct
- homepage and footer `projects` links remain usable

- [ ] **Step 5: Hand off for user review**

Report:

- local dev URL
- isolated worktree path `/private/tmp/chuckd-projects-page`
- automated test and build results
- existing Node-engine and npm-audit baseline warnings
- explicit confirmation that nothing was pushed
