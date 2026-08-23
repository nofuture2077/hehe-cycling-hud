import './themes/index.css';

// theme names this HUD layout ships CSS for (see the *.module.css `[data-theme='...']` blocks) -
// this is HUD-layer policy, not core policy: core only passes through whatever string the user
// configured. A third-party layout can support a completely different set of names.
export const VALID_THEMES = ['classic', 'mono', 'matrix', 'japan'] as const;
export const DEFAULT_THEME = 'classic';

export function resolveTheme(theme: string | undefined): string {
  return theme && (VALID_THEMES as readonly string[]).includes(theme) ? theme : DEFAULT_THEME;
}

// fonts only some themes need - loaded on demand so themes that don't use them never pay for them
const THEME_FONTS: Partial<Record<string, string>> = {
  japan: 'https://fonts.googleapis.com/css2?family=Michroma&display=swap',
};

const loadedThemeFonts = new Set<string>();

export function loadThemeFont(theme: string): void {
  const href = THEME_FONTS[theme];
  if (!href || loadedThemeFonts.has(theme)) return;
  loadedThemeFonts.add(theme);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}
