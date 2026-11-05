# Windows 7 Classic reference

Visual baseline: 1024 × 768 CSS pixels, 96-DPI system metrics. The viewport remains responsive; this is not a resolution limit.

## References actually inspected

- [ToastyTech Windows 7 Classic screenshot](https://toastytech.com/guis/win7classic.png), 1024 × 768. Full desktop, Classic Start menu, Explorer, and older Paint/WordPad running on Windows 7. Use for the requested old application layout, not as evidence that Windows 7 originally shipped those application versions.
- [Microsoft Community Classic-mode screenshot](https://learn.microsoft.com/en-us/answers/questions/2750123/windows-7-basic-theme-is-disabled-i-cannot-apply-t): flat two-column Start menu, program/search row, small taskbar buttons.
- [Classic AE screenshot](https://superuser.com/questions/578765/use-windows-7-classic-theme-but-keep-features-like-peek): inspected, but excluded as a stock-color reference because it is a third-party theme.

## What makes it read as Windows

The earlier pass matched the layout but still looked like an imitation, because everything that was rendered came from the browser and from smooth vector drawing. Comparing it with the screenshot above side by side led to these rules.

| Element | Rule |
| --- | --- |
| Colors | Exact Classic scheme: desktop `#3A6EA5`, face `#D4D0C8`, selection `#0A246A`, active caption `#0A246A` → `#A6CAF0`, inactive caption `#808080` → `#C0C0C0` |
| Text | Original bitmap font (`Classic Sans`) at 11 CSS pixels with smoothing off, so a Retina Mac doesn't turn it into Mac text. Document bodies stay Arial 10 pt |
| Icons | Pixel artwork on a 16/32-pixel grid, separately drawn per size and scaled only by whole multiples (`image-rendering:pixelated`). Never vector, never resized |
| Bevels | Two-layer edges in the real order (window: face/white over dark/gray; button: white over black/gray). Sunken client edges on documents and Explorer |
| Metrics | 18-pixel caption, 16×14 caption buttons, 19-pixel menu bar, 23×22 toolbar buttons, 28-pixel taskbar, 17-pixel menu items, 16-pixel scroll bars |
| Scroll bars | Always visible in documents, with arrow buttons, a raised thumb and a 1-pixel dithered track |
| Taskbar | Labelled buttons up to 160 pixels wide; the active one is pressed, bold and dithered |
| Desktop | Solid color, white labels with no shadow or hover effect, a dotted focus box, and icons tinted with the selection color when selected. Computer, Recycle Bin and shortcut-arrow overlays are present |
| Apps | Toolbars, ruler, Paint's tool grid, line-width box and 28-color palette, and Minesweeper's 16-pixel cells, LED counters and face follow the originals. Minesweeper is a fixed-size window with no status bar, and has a disabled Maximize button |
| Command Prompt | Monochrome `#C0C0C0` on black in a raster-style 8×12 cell (`Classic Mono`) with no colored prompt |

## Assets

All artwork comes from `npm run windows:assets`, which needs no dependencies. `scripts/windows-assets/sprite.mjs` draws the icons and cursors, and `scripts/windows-assets/font.mjs` holds the glyphs and writes WOFF2 directly. Edit those files and regenerate rather than editing the output; `test/windows-assets.test.mjs` fails if they drift apart.

## Scope and remaining fidelity boundaries

This is a site desktop, with real site content as its documents. Icons and fonts are original work, not extracted Microsoft assets, so they are close rather than identical. Drop-down lists, the color picker and printing still open the host's native UI, and Firefox doesn't support the scroll bar styling, so it shows its own scroll bars. Do not describe this as a pixel-perfect recreation.

## Validation

`npm test` covers the build, generated assets, and the shell, theme and game logic. Visual fidelity is reviewed separately by comparing screenshots with the reference at 1024 × 768, because passing logic tests say nothing about appearance.
