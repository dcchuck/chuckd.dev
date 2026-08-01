# About page design

**Date:** 2026-07-31  
**Status:** Approved design; awaiting spec review

## Goal

Replace the placeholder About page with a concise, polished introduction to Chuck Danielsson. The page should balance his technical work with the person behind it, without reading like a resume or overstating organizational leadership.

## Content

Use an `About` page heading and these four prose paragraphs, in order:

> I’m Chuck Danielsson. I work on software and the systems that support it: how applications are built, delivered, observed, and kept running. Most of my career has been in application development, with a focus on delivery and user experience. To me, user experience goes beyond the screen. It includes speed, reliability, and everything behind the product.
>
> Mathematics came before technology. I was drawn to both by the same thing: questions that matter, and answers that work in practice. That interest has taken me across the stack, following my curiosity and wherever the work is most interesting.
>
> AI has made that work more exciting. It takes more of the repetitive work out of the way and gives me better tools to explore platform, SRE, and operations work.
>
> Outside of work, I follow my curiosity into other technology projects, and let New York do the rest: music, food, theater, long walks, and time with my dog. If there are no interesting problems around, I tend to find them.

Do not mention the `Head of Platform Engineering` title in the narrative. Correct the document title to `About - Chuck Danielsson`.

## Layout and styling

- Preserve the existing shared header, footer, and light/dark theme behavior.
- Use the site display font for the `About` heading and the established monospace body treatment for prose.
- Keep the prose in a comfortable, narrow reading column; do not add a resume grid, timeline, statistics, or portrait hero treatment.
- Add the supplied illustrated portrait, `rotoscoped.png`, as a square image beneath the heading.
  - Desktop: position it beside the opening prose at approximately 200–240px wide.
  - Mobile: stack it between the heading and prose.
  - Preserve its square composition rather than circularly cropping it; use a restrained border that matches the site.
  - Serve it as a local, Astro-optimized image with alt text: `Illustrated portrait of Chuck Danielsson`.
- The page ends after the final personal paragraph; it has no employer badge, logo, or external employer link.

## Implementation boundaries

- The page remains fully static and does not add client-side JavaScript.
- Content remains directly in `src/pages/about.astro`; a new content collection is out of scope for this single page.
- Place image assets with the source code so Astro can fingerprint and optimize them. Do not refer to the Desktop source path at runtime.
- Reuse the current shared layout components rather than changing navigation or footer behavior.

## Verification

- Extend the existing static-page test suite to assert the title, heading, approved prose, and portrait image and alt text.
- Verify the generated page contains no employer line or ai.one link.
- Run the production build and all node tests.
- Inspect the page locally at desktop and mobile widths in both themes before requesting release approval.

## Non-goals

- No photo editing or AI generation; use the supplied rotoscoped portrait as-is.
- No new social links, contact form, resume download, or employer/title narrative.
- No deployment or push without Chuck’s explicit review and authorization.
