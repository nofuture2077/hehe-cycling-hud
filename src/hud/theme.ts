import './themes/index.css';

// theme names this HUD layout ships CSS for (see the *.module.css `[data-theme='...']` blocks) -
// this is HUD-layer policy, not core policy: core only passes through whatever string the user
// configured. A third-party layout can support a completely different set of names.
export const VALID_THEMES = ['classic', 'mono', 'matrix', 'japan', 'cyberpunk2077', 'vivid'] as const;
export const DEFAULT_THEME = 'classic';

export function resolveTheme(theme: string | undefined): string {
  return theme && (VALID_THEMES as readonly string[]).includes(theme) ? theme : DEFAULT_THEME;
}

// fonts only some themes need - loaded on demand so themes that don't use them never pay for them
const THEME_FONTS: Partial<Record<string, { href: string; family: string; weights: number[] }>> = {
  japan: {
    href: 'https://fonts.googleapis.com/css2?family=Michroma&display=swap',
    family: 'Michroma',
    weights: [400],
  },
  cyberpunk2077: {
    href: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&display=swap',
    family: 'Chakra Petch',
    weights: [500, 600, 700],
  },
  vivid: {
    href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
    family: 'Outfit',
    weights: [300, 400, 500, 600, 700],
  },
};

// every theme falls back to Rajdhani, whose stylesheet index.html already links
const BASE_FONT = { family: 'Rajdhani', weights: [500, 600, 700] };

// a blocked/slow font CDN must never keep the overlay hidden for good - show with fallback fonts instead
const FONT_LOAD_TIMEOUT_MS = 3000;

const themeFontPromises = new Map<string, Promise<void>>();
const readyThemes = new Set<string>();

function loadFamily(family: string, weights: number[]): Promise<unknown> {
  return Promise.all(weights.map((w) => document.fonts.load(`${w} 16px "${family}"`)));
}

function loadStylesheet(href: string): Promise<void> {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

// the font of an overlay theme (HudLook.font), any Google font by its family; 'default' keeps the theme's
const lookFont = (family: string | undefined) => (family && family !== 'default' ? family : undefined);
const fontKey = (theme: string, look?: string) => `${theme}|${lookFont(look) ?? ''}`;

// true once loadThemeFont(theme, look) has settled - lets the HUD skip hiding on fonts it already loaded
export function isThemeFontReady(theme: string, look?: string): boolean {
  return readyThemes.has(fontKey(theme, look));
}

// resolves once the theme's font files (not just their stylesheet) and the overlay theme's font are loaded, or after
// the timeout
export function loadThemeFont(theme: string, look?: string): Promise<void> {
  const key = fontKey(theme, look);
  let promise = themeFontPromises.get(key);
  if (promise) return promise;
  const font = THEME_FONTS[theme];
  const family = lookFont(look);
  const loading = Promise.all([
    loadFamily(BASE_FONT.family, BASE_FONT.weights),
    font ? loadStylesheet(font.href).then(() => loadFamily(font.family, font.weights)) : undefined,
    family
      ? loadStylesheet(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}&display=swap`).then(() => loadFamily(family, [400]))
      : undefined,
  ]).catch(() => undefined);
  const timeout = new Promise((resolve) => setTimeout(resolve, FONT_LOAD_TIMEOUT_MS));
  promise = Promise.race([loading, timeout]).then(() => {
    readyThemes.add(key);
  });
  themeFontPromises.set(key, promise);
  return promise;
}
