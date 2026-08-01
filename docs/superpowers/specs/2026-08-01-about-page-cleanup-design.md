# About page cleanup design

**Date:** 2026-08-01  
**Status:** Approved design; awaiting spec review

## Goal

Refine the About-page voice and remove the employer endcap so the page ends with Chuck’s personal paragraph.

## Content change

Replace the second paragraph with this exact text:

> Mathematics came before technology. I was drawn to both by the same thing: questions that matter, and answers that work in practice. That interest has taken me across the stack, following my curiosity and wherever the work is most interesting.

This replaces the phrase “Mathematics came before technology for me” and removes the ambiguous “ever since.”

## Layout and asset change

- Remove the `Current employer` line entirely; do not replace it with another badge, logo, link, or endcap.
- Remove the unused locally bundled ai.one SVG, its raw import, and its scoped link/logo styles.
- The prose remains beside the portrait on desktop and below it on mobile. The page now ends after the final personal paragraph.

## Verification

- Update the generated-page test to expect the revised second paragraph.
- Remove the employer-link/SVG assertions and assert that the rendered About page contains neither `Current employer` nor `https://ai.one/`.
- Run the full production test suite and inspect the local page in light and dark themes.

## Scope

This supersedes the employer-link and earlier second-paragraph requirements in `2026-07-31-about-page-design.md`. No other About-page copy, layout, navigation, or theme behavior changes.
