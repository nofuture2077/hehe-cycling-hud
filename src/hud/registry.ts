import type { ComponentType } from 'react';
import type { CyclingData, CyclingHudConfig, GpxTrack, LogoData, PauseInfo } from '../core/types';
import CyclingHud from './CyclingHud';

export interface CyclingHudProps {
  data: CyclingData;
  config?: CyclingHudConfig;
  pause?: PauseInfo;
  gpxTrack?: GpxTrack | null;
  logo?: LogoData | null;
}

export interface HudLayout {
  id: string;
  Component: ComponentType<CyclingHudProps>;
}

const layouts: HudLayout[] = [{ id: 'default', Component: CyclingHud }];

// lets a third party ship a structurally different HUD (not just a CSS theme) and have it chosen
// instead of the built-in layout - e.g. from a forked main.tsx that imports and registers it
// before rendering. Deliberately minimal: no dynamic-import-by-name, no manifest-driven loading.
export function registerLayout(layout: HudLayout) {
  layouts.push(layout);
}

export function getLayout(id: string): HudLayout {
  return layouts.find((l) => l.id === id) ?? layouts[0];
}
