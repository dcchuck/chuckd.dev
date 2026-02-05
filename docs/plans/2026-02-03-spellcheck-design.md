# Spell Check for Blog Posts

## Overview

A spell check feature for blog posts using `aspell`. Runs on demand via a standalone script and automatically as part of the `pub` publish flow. Interactive — reports errors and lets the author cancel or proceed.

## Components

### `spellcheck` — Standalone Script

Python script at project root (matches `new` and `pub` conventions).

**Usage:**
- `./spellcheck` — checks all posts in `src/content/blog/`
- `./spellcheck src/content/blog/be-egon.md` — checks a single post

**How it works:**
1. For each target file, shell out to `aspell list` to get misspelled words.
2. Map misspelled words back to line numbers in the source file.
3. Get suggestions for each word via `aspell pipe`.
4. Filter out words found in `.aspell-words` (custom dictionary at project root, one word per line, optional).
5. Print the report and prompt interactively.

**Report format:**
```
Spell Check Report
==================
File: src/content/blog/be-egon.md

  Line 12: "SPECLL" (suggestions: SPELL, SPECIAL)
  Line 45: "cheks" (suggestions: checks, cheeks)

2 issues found.

[C]ancel and address  |  [P]roceed with known errors
```

If no errors are found, prints a clean message and exits with code 0.

**Exit codes:**
- `0` — no errors found, or user chose Proceed
- `1` — user chose Cancel

### `pub` Integration

Before `pub` flips any drafts, it runs spell check on just the selected posts.

- **Cancel** — `pub` exits without publishing. Author fixes spelling, runs `pub` again.
- **Proceed** — `pub` continues with its normal flow (flip draft flag, update date).
- **No errors** — `pub` continues silently, no prompt.

The spell check logic is shared: `pub` imports from `spellcheck` so there's one implementation.

### `.aspell-words` — Custom Dictionary

Optional file at project root. One word per line. Words listed here are never flagged. Created empty by default; the author adds words over time.

## Design Decisions

- **Python** — matches existing `new` and `pub` scripts.
- **aspell** — standard Unix tool, installed via brew, works offline, fast.
- **Check full file contents** — no skipping of frontmatter, code blocks, or inline code.
- **Shared logic** — one implementation used by both `spellcheck` and `pub`.
