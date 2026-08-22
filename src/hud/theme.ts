import './themes/index.css';

// theme names this HUD layout ships CSS for (see the *.module.css `[data-theme='...']` blocks) -
// this is HUD-layer policy, not core policy: core only passes through whatever string the user
// configured. A third-party layout can support a completely different set of names.
export const VALID_THEMES = ['classic', 'mono', 'matrix', 'japan'] as const;
export const DEFAULT_THEME = 'classic';

export function resolveTheme(theme: string | undefined): string {
  return theme && (VALID_THEMES as readonly string[]).includes(theme) ? theme : DEFAULT_THEME;
}
