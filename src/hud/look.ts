import type { CSSProperties } from 'react';
import type { HudLook } from '../core/types';

// The overlay theme's corners, as low as those of HeheChat's blocks (RADIUS_SCALE in its overlay/style.ts)
const RADII: Record<string, string> = { none: '0px', small: '4px', round: '10px', pill: '999px' };

// How far text keeps from a round box's ends, as a share of the box's height (--look-room, read by the boxes' CSS)
const ROOM: Record<string, number> = { round: 0.08, pill: 0.25 };

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
    // round corners: no cut corners or corner brackets of the theme (they only fit square boxes), room for the text
    ...(ROOM[look.radius]
      ? {
          '--look-room': ROOM[look.radius],
          '--hud-chip-clip-path': 'none',
          '--hud-chip-ring-display': 'none',
          '--hud-corner-display': 'none',
        }
      : {}),
    ...(look.shadow === 'off' ? { '--look-shadow': 'none' } : {}),
    ...fontVar('--look-font', look.font),
    ...fontVar('--look-label-font', look.labelFont),
    ...fontVar('--look-text-font', look.textFont),
  } as CSSProperties;
}
