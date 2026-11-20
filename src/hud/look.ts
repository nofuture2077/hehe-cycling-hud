import type { CSSProperties } from 'react';
import type { HudLook } from '../core/types';

const RADII: Record<string, string> = { none: '0px', small: '8px', round: '16px', pill: '999px' };

// A font of the overlay theme, unless it is the plain one ('default'), which keeps the HUD theme's
const fontVar = (name: string, font: string | undefined) =>
  font && font !== 'default' ? { [name]: `'${font}'` } : {};

// The overlay theme as CSS variables on the HUD's root, which themes/look.css maps onto the theme's tokens
export function lookStyle(look: HudLook | null): CSSProperties {
  if (!look) return {};
  const { text, muted, background, card, accent, accent2, accent3, onAccent } = look.colors;
  return {
    '--look-text': text,
    '--look-muted': muted,
    '--look-background': background,
    '--look-card': card,
    '--look-accent': accent,
    '--look-accent2': accent2,
    '--look-accent3': accent3,
    '--look-on-accent': onAccent,
    '--look-radius': RADII[look.radius] ?? RADII.small,
    ...(look.shadow === 'off' ? { '--look-shadow': 'none' } : {}),
    ...fontVar('--look-font', look.font),
    ...fontVar('--look-label-font', look.labelFont),
    ...fontVar('--look-text-font', look.textFont),
  } as CSSProperties;
}
