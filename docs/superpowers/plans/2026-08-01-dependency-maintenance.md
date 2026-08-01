# Dependency Maintenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Consolidate the open Dependabot package updates on master, validate the site, and publish the verified result directly to master.

**Architecture:** Update the direct dependency manifest to Astro 7.1.6 and the current compatible Tailwind 4.3.3 release line. Astro 7 is required because Astro 6.4.8 leaves four high-severity advisories unresolved; this static site has no integrations or removed Astro APIs to migrate. Regenerate package-lock.json using a clean npm configuration so the resolved transitive graph absorbs the lockfile-only Dependabot updates for h3, Vite, defu, picomatch, smol-toml, devalue, SVGO, Rollup, PostCSS, esbuild, and sharp.

**Tech Stack:** npm 11.6.2, Node.js 24.11.1, Astro 7.1.6, Tailwind CSS 4.3.3, GitHub commit-status API.

## Global Constraints

- Work only in the isolated master worktree at /private/tmp/chuckd-master-deps.
- Preserve the dirty carwash worktree and its two untracked drafts.
- Upgrade to Astro 7.1.6 because it is the first release that fixes the outstanding Astro, esbuild, and sharp advisories.
- Use NPM_CONFIG_USERCONFIG=/dev/null for registry operations because the machine-level npm auth token is invalid.
- Run the full npm test suite and a local About-page smoke test before pushing.
- Push directly to master only after local verification; master is confirmed unprotected.
- Monitor the Netlify status reported for the pushed master commit and stop if it fails.

---

### Task 1: Consolidate the open Dependabot updates

**Files:**
- Create: docs/superpowers/plans/2026-08-01-dependency-maintenance.md
- Modify: package.json
- Modify: package-lock.json

**Interfaces:**
- Consumes: the direct dependency ranges in package.json and npm's package registry.
- Produces: a reproducible package-lock.json whose direct dependencies are Astro 7.1.6, @tailwindcss/typography 0.5.20, @tailwindcss/vite 4.3.3, and tailwindcss 4.3.3.

- [ ] **Step 1: Install the requested dependency targets**

Run:

```bash
NPM_CONFIG_USERCONFIG=/dev/null npm install \
  @tailwindcss/typography@^0.5.20 \
  @tailwindcss/vite@^4.3.3 \
  astro@^7.1.6 \
  tailwindcss@^4.3.3
```

- [ ] **Step 2: Verify the resolved dependency graph**

Run:

```bash
node -e "const lock=require('./package-lock.json'); console.log(lock.packages[''].dependencies)"
npm ls astro @tailwindcss/typography @tailwindcss/vite tailwindcss h3 vite defu picomatch smol-toml devalue svgo rollup --all
```

Expected: the direct manifest carries the planned ranges, the lockfile resolves every dependency without missing or invalid packages, and npm audit reports zero vulnerabilities.

### Task 2: Verify and publish the consolidated update

**Files:**
- Modify: package.json
- Modify: package-lock.json

**Interfaces:**
- Consumes: the updated dependency graph and the existing npm test command.
- Produces: a verified master commit with a successful Netlify deployment status.

- [ ] **Step 1: Run the full site verification**

Run:

```bash
NPM_CONFIG_USERCONFIG=/dev/null npm test
```

Expected: Astro builds all static routes and every Node test passes.

- [ ] **Step 2: Smoke-test the local About page**

Run the development server locally and load http://127.0.0.1:4321/about. Confirm the page returns HTTP 200 and contains the About heading, the portrait image, and the two footer navigation rows.

- [ ] **Step 3: Commit the verified dependency update**

```bash
git add package.json package-lock.json docs/superpowers/plans/2026-08-01-dependency-maintenance.md
git commit -m "Update site dependencies"
```

- [ ] **Step 4: Push master and monitor the deployment**

```bash
git push origin master
gh api repos/dcchuck/chuckd.dev/commits/<commit-sha>/check-runs
```

Poll the commit's Netlify status until it reaches SUCCESS. If it reaches FAILURE, report the failed status and do not make unrelated changes.
