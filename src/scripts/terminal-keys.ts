/** Readline-style keys, scoped to the command input so other page controls stay native. */
export function terminalKeys(input: HTMLInputElement, actions: {
  clear: () => void;
  interrupt: () => void;
  history: (direction: number) => void;
}) {
  let killed = '';
  return (event: KeyboardEvent) => {
    if (!event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.isComposing) return;
    const key = event.key.toLowerCase();
    if (!['l', 'c', 'a', 'e', 'u', 'k', 'w', 'h', 'd', 'b', 'f', 'p', 'n', 'y'].includes(key)) return;
    // Leave selected text available to the browser's copy shortcut.
    if (key === 'c' && (input.selectionStart !== input.selectionEnd || window.getSelection()?.toString())) return;
    event.preventDefault();
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    const move = (position: number) => input.setSelectionRange(position, position);
    const remove = (from: number, to: number, save = false) => {
      if (save && from !== to) killed = input.value.slice(from, to);
      input.setRangeText('', from, to, 'start');
    };
    switch (key) {
      case 'l': actions.clear(); break;
      case 'c': actions.interrupt(); break;
      case 'a': move(0); break;
      case 'e': move(input.value.length); break;
      case 'b': move(Math.max(0, start - 1)); break;
      case 'f': move(Math.min(input.value.length, end + 1)); break;
      case 'u': remove(0, end, true); break;
      case 'k': remove(start, input.value.length, true); break;
      case 'w': remove(start === end ? input.value.slice(0, start).replace(/\S+\s*$/, '').length : start, end, true); break;
      case 'h': remove(start === end ? Math.max(0, start - 1) : start, end); break;
      case 'd': remove(start, start === end ? Math.min(input.value.length, end + 1) : end); break;
      case 'y': input.setRangeText(killed, start, end, 'end'); break;
      case 'p': actions.history(-1); break;
      case 'n': actions.history(1); break;
    }
  };
}
