# chuckd.dev

An Astro site with four skins: Default (plain Menlo typography), Goonies (the original site), Terminal, and Windows Classic. New visitors start in Default.

```sh
npm install
npm run dev
npm test
```

Default and Goonies use the menu on every page, including home, for black/white mode and theme selection. Windows Classic uses Start → Control Panel; its Command Prompt also supports `theme`. Terminal uses `theme` to list choices and `theme <id>` to switch. There is no floating theme picker. Selection persists across visits; `?theme=default`, `?theme=goonies`, `?theme=terminal`, or `?theme=windows-classic` overrides it. Black/white mode is saved independently. Old light/dark preferences migrate to Goonies with that mode intact.

Terminal and Windows Command Prompt support `help`, `man chuckd`, `ls`, `cat about.txt`, `ls projects`, `ls blog`, `whoami`, `clear` / `cls`, and `theme <id>`. Arrow keys recall commands; Tab completes an unambiguous command. `github --contributions` links to the GitHub overview.

Windows Classic provides desktop shortcuts, WordPad, a searchable Start menu, and independent draggable/resizable windows with active/inactive titles, taskbar switching, minimize/restore, maximize, close, and printing. Desktop shortcuts select on a single mouse click and open on double-click (Enter or a tap also opens them). WordPad has File/Edit/View/Help dropdowns, separate standard and formatting toolbars, editable local documents, selection formatting, undo/redo, and text downloads. Editing changes the current browser copy only; opening another document replaces it. Menus support arrow-key navigation and Alt mnemonics. Click the application icon, right-click a title bar/taskbar button, or press Alt+Space for the window system menu. Double-click a title bar to maximize; focus it and use Alt+arrow keys to move it. Show desktop temporarily hides visible windows.

Two desktop/Start menu apps are included: Paint (pencil, brush, eraser, line, rectangle, ellipse, flood fill, color picker, airbrush, magnifier, color palette, undo/redo, and PNG download) and Minesweeper (9×9 board, 10 mines, safe first click, flags, timer, and win/loss states). Paint supports Ctrl/Cmd+Z, Shift+Z, Y, and S. Minesweeper supports right-click or F to flag, F2 to restart while focused, arrow-key navigation, and a touch-friendly Flag Mode in the Game menu. App state lasts for the current page session. Blog links use real site URLs. The biography, project catalog, and blog collection are shared across skins.

Theme IDs and labels live in `src/themes.ts`. The inline head script applies the theme before paint and exposes `window.setTheme(id)` with a `themechange` event. `Skins.astro`, `scripts/skins.ts`, and `styles/skins.css` provide the alternate experiences.

While the command prompt is focused, Ctrl+L clears output while preserving the draft; Ctrl+C cancels the draft (selected text remains copyable). Ctrl+A/E moves to the start/end, Ctrl+B/F moves one character, Ctrl+U/K deletes to the start/end, Ctrl+W deletes the previous word, Ctrl+Y restores the last deletion, Ctrl+H/D deletes backward/forward, and Ctrl+P/N browses history. `help` lists these shortcuts.

The site shell keeps a working directory under `/home/chuck`. `pwd`, `cd`, `cd ..`, `cd ~`, `cd -`, `ls -la`, and `cat` operate on read-only site files: `about.txt`, `README.txt`, `projects/*.txt`, and `blog/*.md`. `about`, `projects`, and `blog` retain formatted views. Tab completes command names, theme names, and paths relative to the current directory. `echo`, `history`, `date`, `uname`, `printenv`, `which`, and basic exit-status inspection with `echo $?` are supported. This is a browser simulation; it does not execute system programs, pipelines, or file writes.

The terminal owns its scroll viewport. Ctrl+L clears its output and resets that viewport, preserving the input, command history, and working directory. Submitted and live prompts use identical line spacing to avoid jumping after clear.

Windows fidelity rules and references are in [docs/windows-classic-reference.md](docs/windows-classic-reference.md). The theme's icons, cursors and bitmap fonts are generated: edit `scripts/windows-assets/` and run `npm run windows:assets`. Start → Shut down leaves the theme. Projects and Blog open in Explorer, with folder history, search, details/icon views, and keyboard file selection. Document selection uses Classic colors; the desktop supports drag-selection.
