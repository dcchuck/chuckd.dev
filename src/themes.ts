export const themes = [
  { id: 'default', label: 'Default' },
  { id: 'goonies', label: 'Goonies' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'windows-classic', label: 'Windows Classic' },
] as const;
export type Theme = typeof themes[number]['id'];
