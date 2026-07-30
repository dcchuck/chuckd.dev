# Project Icons and Font Delivery Design

## Goal

Improve the new projects page in two focused ways:

1. Make its icon-only destination links easier to recognize by using richer brand artwork.
2. Remove the visible delay before the Goonies title font appears in the deployed site.

The changes remain entirely static. They add no client-side JavaScript, runtime data
fetches, or third-party asset requests.

## Brand Icon Design

The project link actions retain the same accessible labels, tooltips, URLs, new-tab
behavior, spacing, and keyboard focus treatment from the projects-page design.
Only the icon artwork and interaction styling change.

- **GitHub** uses the familiar single-color GitHub mark. It inherits the site's
  foreground color so it remains white in dark mode and black in light mode.
- **Homebrew** uses a locally stored full-color beer-mug mark.
- **PyPI** uses a locally stored multicolor blue-and-yellow mark.

The Homebrew and PyPI artwork remains multicolor rather than being flattened into
one brand color. All three icons render inline in a consistent 24-by-24-pixel visual
box, without fetching images from a CDN. The SVGs remain decorative because the
surrounding links provide the accessible names.

Hover and keyboard-focus interactions preserve the artwork's colors. They scale
the icon to 108% and increase its brightness slightly, using the site's existing
150-millisecond transition timing. This supplies feedback without adding labels,
badges, or colored backgrounds. The existing visible focus outline remains.
Motion-reduction preferences remove the transition and scale while retaining the
focus outline.

The richer inline SVG markup is implemented in `BrandIcon.astro`, with source
comments for the artwork. The `simple-icons` dependency is removed after the three
icons are self-contained.

## Font Delivery Design

The existing `Goonies.ttf` source is converted to WOFF2. The WOFF2 file moves from
the unprocessed `public` directory into Astro's source asset pipeline so the
production build emits a content-hashed font URL.

`global.css` references the WOFF2 asset with `format("woff2")` and keeps
`font-display: swap`. The old TTF asset and its production reference are removed.

A small reusable head component imports the same WOFF2 asset URL and emits:

```html
<link
  rel="preload"
  href={gooniesFontUrl}
  as="font"
  type="font/woff2"
  crossorigin
/>
```

Every existing page includes this preload in its document head:

- home
- about
- blog index
- individual blog posts
- projects

The project remains hosted on Netlify. A static `_headers` file assigns a one-year,
immutable browser cache policy to content-hashed `/_astro/*` assets. Because those
filenames change when their content changes, long-lived caching does not leave
visitors with stale font or stylesheet assets.

The combined result removes the current HTML-to-CSS-to-font discovery chain:
the browser learns about the small WOFF2 font from the initial document and can
download it alongside the stylesheet.

## Architecture and Failure Behavior

Both changes are build-time concerns:

- Missing or malformed icon markup fails during the Astro build or generated-output
  tests.
- A missing font asset fails the Vite/Astro build.
- The preload URL and CSS font URL are generated from the same source asset, avoiding
  independently maintained production paths.
- No runtime fallback code is added. `font-display: swap` remains the final fallback
  if the font request is slow or unavailable.

## Verification

Generated-output tests will verify:

- all five project destination links retain their accessible names and URLs
- the Homebrew and PyPI icons contain multicolor SVG artwork
- the GitHub icon remains theme-aware
- generated CSS references WOFF2 and no longer references the TTF
- every generated page preloads the emitted WOFF2 font
- the Netlify cache policy is present in the build output

The full test and build suite must pass. Final browser verification covers:

- projects page in dark and light themes
- icon alignment and recognizability
- mouse hover and keyboard focus
- reduced-motion behavior
- desktop and narrow mobile layouts
- absence of console errors and failed asset requests

The development server remains local for user review. Nothing is pushed until the
user has reviewed the finished page and explicitly approves publishing it.
