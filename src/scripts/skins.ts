import { SiteShell } from './shell';
import { terminalKeys } from './terminal-keys';
import { themes, type Theme } from '../themes';
declare global { interface Window { setTheme: (id: string) => boolean; setColorMode: (mode: string) => void; } }
const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const output = $('#terminal-output');
const input = $<HTMLInputElement>('#command-input');
const doc = $('#document-window');
const terminal = $('#terminal-window');
const content = $('#document-content');
const original = document.querySelector('body > main');
const post = location.pathname.startsWith('/blog/') && location.pathname !== '/blog/';
let currentDocument = location.pathname.includes('projects') ? 'projects' : location.pathname.includes('blog') ? 'blog' : 'about';
const files: Record<string, { text: string }> = {};
document.querySelectorAll<HTMLTemplateElement>('[data-shell-file]').forEach(template => {
  files[template.dataset.path!] = { text: template.content.textContent || '' };
});
files['/home/chuck/about.txt'] = { text: [...$<HTMLTemplateElement>('#skin-about').content.querySelectorAll('p')].map(p => p.textContent!.replace(/\s+/g, ' ').trim()).join('\n\n') };
files['/home/chuck/README.txt'] = { text: 'Welcome to chuckd.dev.\n\nExplore with ls, cd, pwd, and cat. Use about, projects, or blog for formatted views.\nThis is a small browser-based shell over site content, not an operating-system shell.\nType help for commands and keyboard shortcuts.' };
const shell = new SiteShell(files);
const history = shell.history;
let historyIndex = 0;
let initialized = false;
function fragment(name: string) { return $<HTMLTemplateElement>(`#skin-${name}`).content.cloneNode(true); }
function line(text: string, className = 'shell-line') { const el = document.createElement('div'); el.className = className; el.textContent = text; output.append(el); }
const viewport = $('.terminal-body');
function revealPrompt() {
  // Scroll only the terminal viewport, never the document or browser chrome.
  const bottom = $('#command-form').getBoundingClientRect().bottom;
  const edge = viewport.getBoundingClientRect().bottom - 16;
  if (bottom > edge) viewport.scrollTop += bottom - edge;
}
function clearScreen() { output.replaceChildren(); viewport.scrollTop = 0; }
function updatePrompt() {
  $('#command-prompt').textContent = document.documentElement.dataset.theme === 'windows-classic'
    ? `C:\\Users\\Chuck${shell.cwd.slice(shell.home.length).replaceAll('/', '\\')}>`
    : `chuck@chuckd ${shell.shortPath} %`;
}

function showDocument(name: string) {
  currentDocument = name;
  content.replaceChildren(fragment(name));
  const title = `${name === 'about' ? 'About Me.doc' : name === 'blog' ? 'Blog' : 'Projects'} - WordPad`;
  $('#document-title').textContent = title;
  $('#document-task').textContent = title;
  doc.hidden = false;
}
function showHelp() {
  const commands = ['man chuckd', 'pwd', 'ls -la', 'cd projects', 'cd ~', 'cat about.txt', 'about', 'projects', 'blog', 'history', 'echo $PWD', 'github --contributions', 'theme', 'whoami', 'clear'];
  for (const command of commands) { const row = document.createElement('div'); const button = document.createElement('button'); button.dataset.command = command; button.textContent = command; row.append(button); output.append(row); }
  line('↑/↓ or Ctrl+P/N: history. Tab: completion. Ctrl+L: clear screen. Ctrl+C: cancel input.');
  line('Ctrl+A/E: start/end. Ctrl+B/F: move cursor. Ctrl+U/K: delete to start/end. Ctrl+W: delete word. Ctrl+Y: restore deleted text. Ctrl+H/D: delete backward/forward.');
}
function run(raw: string) {
  const command = raw.trim();
  line(`${$('#command-prompt').textContent}${command ? ' ' + command : ''}`, 'shell-command');
  const result = shell.execute(command);
  historyIndex = history.length;
  if (result.clear) clearScreen();
  if (result.view === 'help') showHelp();
  else if (result.view) { const block = document.createElement('div'); block.className = 'shell-rich'; block.append(fragment(result.view)); output.append(block); }
  if (result.text !== undefined) line(result.text, result.error ? 'shell-line shell-error' : 'shell-line');
  if (result.link) { const link = document.createElement('a'); link.href = result.link; link.textContent = 'View dcchuck on GitHub →'; output.append(link); }
  if (result.theme !== undefined) {
    if (result.theme) { if (!window.setTheme(result.theme)) line(`Unknown theme. Choose ${themes.map(theme => theme.id).join(', ')}.`, 'shell-error'); }
    else for (const theme of themes) { const row=document.createElement('div'); const button=document.createElement('button'); button.dataset.command=`theme ${theme.id}`; button.textContent=`${theme.id} — ${theme.label}`; row.append(button); output.append(row); }
  }
  updatePrompt();
  input.value = '';
  if (!terminal.hidden) { input.focus({ preventScroll: true }); revealPrompt(); }
}
function syncTheme() {
  const theme = document.documentElement.dataset.theme as Theme;
  document.querySelectorAll<HTMLSelectElement>('[data-theme-picker]').forEach(picker => picker.value=theme);
  document.querySelectorAll<HTMLButtonElement>('[data-set-theme]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.setTheme === theme)));
  updatePrompt();
  if (!initialized && (theme === 'terminal' || theme === 'windows-classic')) {
    line('Type help to see commands, or man chuckd to read the manual.');
    if (post && original) output.append(original.cloneNode(true));
    else output.append(fragment(location.pathname === '/' ? 'manual' : currentDocument));
    initialized = true;
  }
  terminal.hidden = theme !== 'terminal';
  if (theme === 'terminal') input.focus({ preventScroll: true });
}
showDocument(currentDocument);
if (post && original) { content.replaceChildren(original.cloneNode(true)); $('#document-title').textContent = document.title + ' - WordPad'; $('#document-task').textContent = document.title; }
syncTheme();
if (document.documentElement.dataset.theme === 'terminal') input.focus({ preventScroll: true });
viewport.addEventListener('click', event => {
  if ((event.target === viewport || event.target === output) && !window.getSelection()?.toString()) input.focus({ preventScroll: true });
});
window.addEventListener('themechange', syncTheme);
document.addEventListener('change', event => { const target=event.target as HTMLSelectElement; if (target.matches('[data-theme-picker]')) window.setTheme(target.value); });
$('#command-form').addEventListener('submit', event => { event.preventDefault(); run(input.value); });
let historyDraft = '';
function recallHistory(direction: number) {
  if (historyIndex === history.length) historyDraft = input.value;
  historyIndex = Math.max(0, Math.min(history.length, historyIndex + direction));
  input.value = historyIndex === history.length ? historyDraft : history[historyIndex];
  input.setSelectionRange(input.value.length, input.value.length);
}
input.addEventListener('keydown', terminalKeys(input, {
  clear: clearScreen,
  interrupt: () => {
    line(`${$('#command-prompt').textContent} ${input.value}^C`);
    input.value = '';
    historyIndex = history.length;
    historyDraft = '';
    revealPrompt();
  },
  history: recallHistory,
}));
input.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.isComposing) return;
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); recallHistory(event.key === 'ArrowUp' ? -1 : 1); }
  if (event.key === 'Tab' && !event.shiftKey && input.value) {
    event.preventDefault();
    const caret = input.selectionStart ?? input.value.length;
    const prefix = input.value.slice(0, caret);
    const matches = shell.complete(prefix);
    if (matches.length === 1) input.setRangeText(matches[0], 0, caret, 'end');
    else if (matches.length > 1) {
      let common = matches[0];
      for (const match of matches) while (!match.startsWith(common)) common = common.slice(0, -1);
      if (common.length > prefix.length) input.setRangeText(common, 0, caret, 'end');
      else { line(matches.map(match => match.trim()).join('  '), 'shell-completions'); revealPrompt(); }
    }
  }
});
const displayProperties=$<HTMLDialogElement>('#display-properties');
const startMenu=$('.start-menu');
function closeStart() { startMenu.hidden=true; $('#start-button').setAttribute('aria-expanded','false'); }
document.addEventListener('click', event => {
  const target=(event.target as HTMLElement).closest<HTMLElement>('button');
  if(!target) return;
  if(target.dataset.setTheme) { window.setTheme(target.dataset.setTheme); target.closest('details')?.removeAttribute('open'); }
  if(target.hasAttribute('data-toggle-mode')) window.setColorMode(document.documentElement.dataset.mode === 'light' ? 'dark' : 'light');
  if(target.hasAttribute('data-display-properties')) {
    closeStart();
    displayProperties.querySelectorAll<HTMLInputElement>('input[name="desktop-theme"]').forEach(radio => radio.checked = radio.value === document.documentElement.dataset.theme);
    displayProperties.showModal();
  }
  if(target.hasAttribute('data-apply-theme')) {
    const selected=displayProperties.querySelector<HTMLInputElement>('input:checked');
    displayProperties.close();
    if(selected) window.setTheme(selected.value);
  }
  if(target.dataset.command) run(target.dataset.command);
  if(target.dataset.open) {
    closeStart();
    if(target.dataset.open==='cmd') { terminal.hidden=false; input.focus(); } else showDocument(target.dataset.open);
  }
  if(target.hasAttribute('data-close-cmd')) terminal.hidden=true;
  if(target.dataset.window==='close' || target.dataset.window==='minimize') doc.hidden=true;
  if(target.dataset.window==='maximize') doc.classList.toggle('maximized');
  if(target.id==='document-task') { doc.hidden=!doc.hidden; }
  if(target.id==='start-button') { startMenu.hidden=!startMenu.hidden; target.setAttribute('aria-expanded', String(!startMenu.hidden)); }
  if(target.hasAttribute('data-print')) window.print();
  if(target.hasAttribute('data-help')) { terminal.hidden=false; showHelp(); input.focus(); }
});
document.addEventListener('keydown', event => { if(event.key==='Escape') { closeStart(); document.querySelectorAll('details.site-menu[open]').forEach(menu => menu.removeAttribute('open')); } });
document.addEventListener('click', event => { if(!(event.target as HTMLElement).closest('.start-menu, #start-button')) closeStart(); if(!(event.target as HTMLElement).closest('.site-menu')) document.querySelectorAll('details.site-menu[open]').forEach(menu => menu.removeAttribute('open'));  });
function clock() { $('#desktop-clock').textContent=new Date().toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}); }
clock(); setInterval(clock,60000);
