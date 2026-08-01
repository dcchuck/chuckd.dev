# About Portrait Flow Design

## Goal

Let the illustrated portrait on the About page sit alongside the biography on wider screens while the paragraphs flow around it and continue at the article's full width below the image.

## Layout

- At the `sm` breakpoint and above, the portrait floats left with a consistent gap on its right and lower edges.
- The biography remains one semantic text container, so each paragraph can wrap around the portrait naturally.
- A clearing element after the biography contains the float and keeps the footer below the complete article.
- Below the `sm` breakpoint, the portrait returns to normal block flow above the biography, preserving a comfortable line length on phones.

## Scope and Verification

Only the About page layout changes; its copy, portrait source, accessibility text, and global navigation remain unchanged. A rendered-page test will require the responsive float styling, while the existing build test continues to verify the portrait and approved biography.
