# Footer Social Links Design

## Goal

Separate internal navigation from external destinations in the shared footer, using a text page row followed by a theme-aware, icon-only social row.

## Structure

- The first centered row remains the existing title-font page navigation: blog, projects, and about, separated by asterisks.
- A second centered row below it contains only two external links: GitHub (https://github.com/dcchuck) and X (https://x.com/dcChuck).
- The external links contain no visible text. Each exposes an accurate aria-label and title, opens in a new tab, and uses rel="noopener noreferrer".

## Icons and Theme

- GitHub continues to use the existing local single-color SVG.
- X uses a new local single-color SVG with its path filled by currentColor.
- The icon link color comes from var(--color-fg), making the artwork white in the dark theme and black in the light theme.
- Icon links share the existing project-action treatment: compact hit area, visible keyboard focus ring, a slight hover/focus scale, and reduced-motion support.

## Scope and Verification

Only Footer.astro, the local X icon asset, and footer-oriented build assertions change. Page navigation labels and targets remain unchanged. Rendered-page tests will verify both footer rows, icon-only accessible external links, safe external-link attributes, and theme-aware SVG fills.
