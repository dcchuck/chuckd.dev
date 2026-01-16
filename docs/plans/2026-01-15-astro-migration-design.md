# Website Overhaul: Migration to Astro

## Overview

Migrate chuckd.dev from a React/Vite single-page app to Astro, enabling markdown blog posts while preserving the ability to create fully custom pages with funky CSS and images.

## Goals

- Support markdown blog posts with minimal friction
- Keep ability to build custom, highly-styled pages
- Maintain GitHub + Netlify deployment workflow (no changes)
- Fast, lightweight static output

## Technology Stack

| Current | New |
|---------|-----|
| Vite | Astro (uses Vite under the hood) |
| React 19 | Astro components (React available if needed) |
| Tailwind v4 | Tailwind v4 (via `@astrojs/tailwind`) |
| TypeScript | TypeScript (Astro has built-in support) |

## Migration Steps

### 1. Clean up existing source

Remove Vite/React-specific files while preserving git history and GitHub config:

```bash
rm -rf src/ vite.config.ts tsconfig.json tsconfig.node.json
```

Keep:
- `.git/`
- `.github/`
- `public/favicon.ico`
- `README.md`

### 2. Scaffold Astro project

```bash
npm create astro@latest .
```

CLI prompts (recommended answers):
- **Template**: Empty
- **TypeScript**: Yes, strict
- **Install dependencies**: Yes

### 3. Add Tailwind

```bash
npx astro add tailwind
```

This installs `@astrojs/tailwind` and creates the necessary config.

### 4. Recreate home page

Convert the existing `Home.tsx` to `src/pages/index.astro`:

```astro
---
// imports and logic go here
import githubIcon from '../assets/github.svg';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Chuck Danielson</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  </head>
  <body>
    <div class="bg-seafoamgreen h-dvh p-8 overflow-x-hidden">
      <h1
        class="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-title text-white break-words hyphens-manual"
        lang="en"
      >
        Chuck Dan&shy;iels&shy;on
      </h1>
      <div class="flex justify-end">
        <a href="https://github.com/dcchuck" target="_blank">
          <img src={githubIcon.src} alt="GitHub" />
        </a>
      </div>
    </div>
  </body>
</html>
```

Note: Custom Tailwind values like `bg-seafoamgreen` and `font-title` will need to be defined in CSS or Tailwind config.

### 5. Set up blog content collection

Create `src/content.config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
```

### 6. Create blog listing page

Create `src/pages/blog/index.astro`:

```astro
---
import { getCollection } from 'astro:content';

const posts = await getCollection('blog', ({ data }) => !data.draft);
const sortedPosts = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Blog - Chuck Danielson</title>
  </head>
  <body>
    <h1>Blog</h1>
    <ul>
      {sortedPosts.map((post) => (
        <li>
          <a href={`/blog/${post.id}`}>{post.data.title}</a>
          <time>{post.data.date.toLocaleDateString()}</time>
        </li>
      ))}
    </ul>
  </body>
</html>
```

### 7. Create blog post page

Create `src/pages/blog/[slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{post.data.title} - Chuck Danielson</title>
  </head>
  <body>
    <article>
      <h1>{post.data.title}</h1>
      <time>{post.data.date.toLocaleDateString()}</time>
      <Content />
    </article>
  </body>
</html>
```

### 8. Add a sample blog post

Create `src/content/blog/hello-world.md`:

```markdown
---
title: Hello World
date: 2026-01-15
description: My first blog post
---

This is my first blog post using Astro.
```

## Project Structure (Final)

```
chuckd.dev/
├── src/
│   ├── pages/
│   │   ├── index.astro           # Home page
│   │   └── blog/
│   │       ├── index.astro       # Blog listing
│   │       └── [slug].astro      # Individual posts
│   ├── content/
│   │   └── blog/
│   │       └── hello-world.md    # Blog posts go here
│   ├── content.config.ts         # Content collection schema
│   └── assets/
│       └── github.svg
├── public/
│   └── favicon.ico
├── astro.config.mjs
├── tailwind.config.js            # If customizations needed
├── package.json
└── tsconfig.json
```

## Deployment

No changes needed. Netlify auto-detects Astro projects and runs the correct build command (`astro build`). Output goes to `dist/` by default.

## Adding New Content

**New blog post**: Create a `.md` file in `src/content/blog/` with frontmatter.

**New custom page**: Create an `.astro` file in `src/pages/`. Full control over HTML/CSS.

## Future Considerations

- **Layouts**: Extract common HTML (head, nav, footer) into `src/layouts/` as the site grows
- **Components**: Reusable pieces go in `src/components/`
- **React**: If needed, run `npx astro add react` and use `.tsx` components
- **MDX**: If you want components inside markdown, run `npx astro add mdx`
- **RSS**: Astro has a built-in RSS package for blog feeds
