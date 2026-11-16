import type { CSSProperties } from 'react';
import type { TrackStyle } from '../core/types';

// The panels a track map or elevation profile can sit on: translucent so the stream shows through, a hairline edge
// drawn inside (an outer border or shadow would grow the widget past its design size and be cut off by its frame)
const PANELS: Record<string, CSSProperties> = {
  glass: {
    background: 'rgba(12, 14, 20, 0.55)',
    backdropFilter: 'blur(10px)',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.14)',
  },
  dark: {
    background: 'rgba(8, 9, 12, 0.86)',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
  },
  light: {
    background: 'rgba(255, 255, 255, 0.16)',
    backdropFilter: 'blur(10px)',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.35)',
  },
};

// The panel, the line color and the grid of a track map or elevation profile (set per block of HeheChat's overlay);
// what is left unset stays the theme's (--hud-map-*, base.css and the themes)
export function trackLookStyle({ panel, lineColor, grid }: TrackStyle): CSSProperties {
  return {
    ...(PANELS[panel] ? { ...PANELS[panel], borderRadius: 'var(--hud-radius-chip, 14px)' } : {}),
    ...(lineColor ? { '--hud-map-track-color': lineColor, '--hud-elevation-color': lineColor } : {}),
    // a quiet white grid on any panel, without the theme's dashed ring; the theme's own otherwise
    ...(grid === null
      ? {}
      : { '--hud-map-grid-opacity': grid ? 1 : 0, '--hud-map-grid-color': 'rgba(255, 255, 255, 0.12)', '--hud-map-frame-opacity': 0 }),
  } as CSSProperties;
}
